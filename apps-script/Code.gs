/**
 * Lead webhook for the Pune Regional Office landing page.
 *
 * SETUP (5 minutes):
 * 1. Create a Google Sheet (e.g. "Pune Leads"). Extensions → Apps Script.
 * 2. Paste this whole file into Code.gs and set OFFICE_EMAIL below.
 * 3. Deploy → New deployment → type "Web app"
 *      Execute as: Me    |    Who has access: Anyone
 * 4. Authorise, copy the Web App URL, and paste it into
 *      js/config.js → leads.webhookUrl
 * 5. Submit a test enquiry on the site and check the sheet + inbox.
 *
 * After editing this script, use Deploy → Manage deployments → Edit → New version
 * (the URL stays the same).
 */

var OFFICE_EMAIL = "jai.chauhan116@gmail.com";      // where new-lead alerts go (comma-separate for several)
var SHEET_NAME   = "Leads";

var COLUMNS = [
  "timestamp", "form", "name", "mobile", "email", "loan_type", "loan_amount",
  "employment_type", "monthly_income", "area", "call_time", "message", "consent",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "fbclid", "page_url", "referrer"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents || "{}");

    // Basic server-side checks (the browser already validates)
    var mobile = String(data.mobile || "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(mobile) || !data.name) {
      return json({ ok: false, error: "invalid" });
    }

    var sheet = getSheet();
    sheet.appendRow(COLUMNS.map(function (k) {
      var v = data[k] == null ? "" : String(data[k]);
      // Prevent formula injection in Sheets
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    }));

    sendEmail(data);
    // sendSms(data);  // optional – see bottom of file

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
  }
  return sh;
}

function sendEmail(d) {
  if (!OFFICE_EMAIL || /^\[/.test(OFFICE_EMAIL)) return;
  var subject = "New lead: " + (d.loan_type || "Loan") + " – " + d.name + " (" + d.mobile + ")";
  var rows = COLUMNS.filter(function (k) { return d[k]; }).map(function (k) {
    return "<tr><td style='padding:4px 12px 4px 0;color:#666'>" + k + "</td><td style='padding:4px 0'><b>" +
      String(d[k]).replace(/</g, "&lt;") + "</b></td></tr>";
  }).join("");
  var waLink = "https://wa.me/" + String(d.mobile).replace(/\D/g, "");
  MailApp.sendEmail({
    to: OFFICE_EMAIL,
    subject: subject,
    htmlBody: "<h2 style='font-family:sans-serif'>New website enquiry</h2>" +
      "<p><a href='tel:" + d.mobile + "'>Call " + d.mobile + "</a> · <a href='" + waLink + "'>WhatsApp</a></p>" +
      "<table style='font-family:sans-serif;font-size:14px'>" + rows + "</table>"
  });
}

/**
 * OPTIONAL SMS / WhatsApp alert to the office phone.
 * Use your provider's API (e.g. MSG91, Gupshup, Interakt, Twilio). Example shape:
 *
 * function sendSms(d) {
 *   UrlFetchApp.fetch("https://api.your-provider.com/send", {
 *     method: "post",
 *     contentType: "application/json",
 *     headers: { Authorization: "Bearer YOUR_API_KEY" },
 *     payload: JSON.stringify({ to: "918793596779", text: "New lead: " + d.name + " " + d.mobile + " – " + d.loan_type })
 *   });
 * }
 */

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor to test without the website. */
function testLead() {
  doPost({ postData: { contents: JSON.stringify({
    timestamp: new Date().toISOString(), form: "test", name: "Test User", mobile: "+919876543210",
    loan_type: "Home Loan", loan_amount: "₹25 – 50 Lakh", page_url: "test"
  }) } });
}
