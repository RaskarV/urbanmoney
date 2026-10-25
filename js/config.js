/* =====================================================================
   SITE CONFIG — edit everything here. No other file needs changing for
   names, numbers, rates, team, reviews or tracking IDs.
   Items in [square brackets] are placeholders you must replace.
   ===================================================================== */
window.SITE_CONFIG = {
  /* ---------- Business ---------- */
  business: {
    displayName: "Urban Money – Pune Regional Office (Deccan Gymkhana)",
    shortName: "Urban Money Pune",
    manager: "Vijay Chauhan",
    addressLines: [
      "2nd Floor, Sai Chaya Apartment,",
      "Apte Road (above IDBI Bank), Deccan Gymkhana,",
      "Pune, Maharashtra 411004"
    ],
    landmark: "Above IDBI Bank",
    mapQuery: "Sai Chaya Apartment, Apte Road, Deccan Gymkhana, Pune 411004",
    phoneDisplay: "+91 93255 26761",
    phoneE164: "+919325526761",
    whatsapp: "919325526761",
    whatsappText: "Hi, I want to enquire about a loan",
    email: "[office email]",
    hours: "Mon–Sat, 10:00 AM – 7:00 PM",
    googleReviewsUrl: "[Google Business Profile link]",
    social: {
      facebook: "#",   // [Facebook URL]
      instagram: "#",  // [Instagram URL]
      linkedin: "#"    // [LinkedIn URL]
    },
    // Path to the OFFICIAL logo supplied by Urban Money, e.g. "assets/logo.svg".
    // Leave empty to show a text wordmark until the file arrives.
    logo: "assets/logo.webp"
  },

  /* ---------- Lead handling ---------- */
  leads: {
    // Paste the Web App URL from apps-script/Code.gs deployment here.
    // While empty, the form runs in DEMO mode (shows thank-you, sends nothing).
    webhookUrl: "",
    thankYouText: "Thank you! Our loan expert will call you within 30 minutes during working hours."
  },

  /* ---------- Tracking (leave "" to disable each) ---------- */
  tracking: {
    gtmId: "",          // e.g. "GTM-XXXXXXX"
    ga4Id: "G-XXXXXXXXXX", // TODO: replace with your real GA4 Measurement ID (GA4 > Admin > Data streams). Then run: python3 build.py
    metaPixelId: "",    // e.g. "123456789012345"
    googleAdsId: "",    // e.g. "AW-123456789"
    googleAdsLeadLabel: "" // conversion label for form submit, e.g. "AbCdEfGh"
  },

  /* ---------- Hero ---------- */
  hero: {
    // Words that rotate inside the headline
    rotatingWords: ["Home Loan", "Mortgage Loan", "Personal Loan", "Business Loan"],
    // Promo slider on the right of the hero. "loan" = which product the button pre-selects.
    slides: [
      { loan: "home-loan", art: "home", pre: "Own your", hl: "Dream Home", post: "in Pune",
        text: "Compare home loan offers from top banks, from 8.50% p.a.*", cta: "Check Now" },
      { loan: "loan-against-property", art: "building", pre: "Unlock the", hl: "Value", post: "of Your Property",
        text: "Mortgage loans against residential or commercial property.", cta: "Check Eligibility" },
      { loan: "personal-loan", art: "wallet", pre: "Funds When", hl: "You Need", post: "Them Most",
        text: "Personal loans up to ₹40 Lakh with quick disbursal.", cta: "Check Now" },
      { loan: "business-loan", art: "chart", pre: "Fuel Your", hl: "Business", post: "Growth",
        text: "Working capital & term loans for MSMEs and traders.", cta: "Check Now" }
    ]
  },

  /* ---------- Hero stats (national figures – verify before going live) ---------- */
  stats: [
    { icon: "users", value: 5.8, decimals: 1, prefix: "", suffix: " Lakh", plus: true, label: "Customers Annually" },
    { icon: "pin", value: 150, decimals: 0, prefix: "", suffix: "", plus: true, label: "Cities Covered" },
    { icon: "branch", value: 587, decimals: 0, prefix: "", suffix: "", plus: true, label: "Branches" },
    { icon: "rupee", value: 61000, decimals: 0, prefix: "₹", suffix: " Cr", plus: true, label: "Disbursed Annually" }
  ],

  /* ---------- Loan products offered by the Pune office (id is used in ?loan=<id> URLs) ---------- */
  loans: [
    { id: "home-loan", name: "Home Loan", icon: "home", badge: "Quick Sanction",
      short: "Lowest rates from top banks with doorstep service",
      text: "Up to ₹5 Cr, rates starting from 8.50% p.a.*",
      features: ["New, resale & under-construction homes", "Plot + construction loans", "Long tenure for lower EMIs"] },
    { id: "loan-against-property", name: "Mortgage Loan (LAP)", icon: "building", badge: "High Value",
      short: "Unlock your property's value at low rates",
      text: "Loan against residential or commercial property",
      features: ["Residential, commercial & industrial property", "Use for business, education or personal needs", "Lower rates than unsecured loans"] },
    { id: "personal-loan", name: "Personal Loan", icon: "wallet", badge: "Quick Disbursal",
      short: "Paperless process at attractive rates",
      text: "Up to ₹40 Lakh, rates starting from 10.99% p.a.*",
      features: ["No collateral required", "Minimal documentation", "Flexible repayment tenure"] },
    { id: "business-loan", name: "Business Loan", icon: "briefcase", badge: "MSME Friendly",
      short: "Growth & working capital for your business",
      text: "Funds for MSMEs, traders & self-employed professionals",
      features: ["Working capital & term loans", "Secured and unsecured options", "For traders, manufacturers & professionals"] }
  ],
  /* ---------- Loan showcase rows (alternating text + tilted poster) ----------
     Use **double asterisks** to bold key figures. "more" = shown on "Explore More". */
  showcase: {
    "home-loan": {
      points: ["Borrow up to **₹5 Crore** to buy, build or extend your home",
               "Interest rates starting from **8.50% p.a.***",
               "Tenure up to **30 years** for comfortable EMIs"],
      more: ["New, resale & under-construction homes, plot + construction",
             "Salaried & self-employed applicants welcome",
             "Doorstep document pickup anywhere in Pune"],
      poster: { theme: "cream", art: "home-loan", kicker: "Step closer to your own home", title: "Home Loan",
                sub: "Rates from 8.50% p.a.*", strip: ["100+ Banks", "Doorstep Service", "Low Rates"] }
    },
    "loan-against-property": {
      points: ["Raise funds against **residential, commercial or industrial** property",
               "**Lower interest rates** than most unsecured loans",
               "Use it for **business, education, medical or family** needs"],
      more: ["Self-occupied or rented property accepted",
             "Term-loan and overdraft variants available",
             "Legal & technical property checks handled by our team"],
      poster: { theme: "deep", art: "loan-against-property", kicker: "Your property, your power", title: "Loan Against Property",
                sub: "Unlock high-value funds", strip: ["High Value", "Long Tenure", "Low EMI"] }
    },
    "personal-loan": {
      points: ["Borrow up to **₹40 Lakh** and repay on a tenure that suits you",
               "Interest rates starting from **10.99% p.a.***",
               "**No collateral**, minimal paperwork and **quick disbursal**"],
      more: ["For salaried professionals with a steady income",
             "Use it for travel, a wedding, medical bills or home upgrades",
             "A CIBIL score of 750+ usually gets the best offers"],
      poster: { theme: "green", art: "personal-loan", kicker: "Plans can't wait", title: "Personal Loan",
                sub: "Up to ₹40 Lakh, quick disbursal", strip: ["Paperless", "No Collateral", "Quick Disbursal"] }
    },
    "business-loan": {
      points: ["Funding for **MSMEs, traders & self-employed** professionals",
               "**Working capital** and **term loans** from 100+ lenders",
               "**Secured and unsecured** options to match your profile"],
      more: ["Typically 2–3 years of business vintage required",
             "Keep GST returns, ITRs and bank statements ready",
             "We shortlist lenders and help with the paperwork"],
      poster: { theme: "sun", art: "business-loan", kicker: "Grow without limits", title: "Business Loan",
                sub: "Capital for your next big move", strip: ["MSME Friendly", "Quick Sanction", "100+ Lenders"] }
    }
  },
  ratesFootnote: "*Rates are indicative, starting from, and subject to lender approval and eligibility.",

  amountRanges: ["Below ₹5 Lakh", "₹5 – 25 Lakh", "₹25 – 50 Lakh", "₹50 Lakh – 1 Cr", "₹1 – 5 Cr", "Above ₹5 Cr"],
  incomeRanges: ["Below ₹25,000", "₹25,000 – 50,000", "₹50,000 – 1 Lakh", "₹1 – 2 Lakh", "Above ₹2 Lakh"],
  callTimes: ["Anytime", "10 AM – 1 PM", "1 PM – 4 PM", "4 PM – 7 PM"],

  /* ---------- Banking partners (shown as names; add logos only with permission) ---------- */
  /* ---------- Lending partners ----------
     Names are shown as text tiles. To show an official logo, put the file in
     assets/banks/ and set logo: "assets/banks/hdfc.svg" — ONLY with permission
     from that bank / head office. type: "bank" or "nbfc" (used by the filter).
     Confirm this list with head office before going live.                     */
  banksIntro: "Explore our network of leading banks and NBFCs – we compare their offers so you get the right loan at the right rate.",
  banksVisible: 20,   // tiles shown before "View All Banks"
  banks: [
    { name: "HDFC Bank", type: "bank" }, { name: "ICICI Bank", type: "bank" },
    { name: "State Bank of India", short: "SBI", type: "bank" }, { name: "Axis Bank", type: "bank" },
    { name: "Kotak Mahindra Bank", type: "bank" }, { name: "Bank of Baroda", type: "bank" },
    { name: "Punjab National Bank", short: "PNB", type: "bank" }, { name: "Canara Bank", type: "bank" },
    { name: "Union Bank of India", type: "bank" }, { name: "Bank of Maharashtra", type: "bank" },
    { name: "Bank of India", type: "bank" }, { name: "Indian Bank", type: "bank" },
    { name: "IDFC First Bank", type: "bank" }, { name: "IndusInd Bank", type: "bank" },
    { name: "Yes Bank", type: "bank" }, { name: "IDBI Bank", type: "bank" },
    { name: "Federal Bank", type: "bank" }, { name: "RBL Bank", type: "bank" },
    { name: "DCB Bank", type: "bank" }, { name: "Punjab & Sind Bank", type: "bank" },
    { name: "Karnataka Bank", type: "bank" }, { name: "Karur Vysya Bank", type: "bank" },
    { name: "Saraswat Bank", type: "bank" }, { name: "HSBC", type: "bank" },
    { name: "Unity Small Finance Bank", type: "bank" },
    { name: "LIC Housing Finance", type: "nbfc" }, { name: "Bajaj Finserv", type: "nbfc" },
    { name: "Tata Capital", type: "nbfc" }, { name: "L&T Finance", type: "nbfc" },
    { name: "Aditya Birla Finance", type: "nbfc" }, { name: "Piramal Finance", type: "nbfc" },
    { name: "Hero FinCorp", type: "nbfc" }, { name: "InCred Finance", type: "nbfc" },
    { name: "SMFG India Credit", type: "nbfc" }, { name: "UGRO Capital", type: "nbfc" },
    { name: "Muthoot Finance", type: "nbfc" }, { name: "Prefr", type: "nbfc" },
    { name: "Zype", type: "nbfc" }, { name: "Privo", type: "nbfc" }, { name: "FatakPay", type: "nbfc" }
  ],

  /* ---------- Why choose us ---------- */
  why: [
    { icon: "scale", title: "100+ lenders, one place", text: "Unbiased advice – we compare offers so you don't have to." },
    { icon: "user", title: "Dedicated local expert", text: "One loan expert with you from application to disbursal." },
    { icon: "pin", title: "Doorstep pickup", text: "Document pickup anywhere across Pune." },
    { icon: "file", title: "Paperwork handled", text: "Help with documentation, legal & technical checks." },
    { icon: "chat", title: "English, Hindi & Marathi", text: "Talk to us in the language you're comfortable with." },
    { icon: "shield", title: "Transparent process", text: "Clear terms, honest timelines, no false promises." }
  ],

  steps: [
    { icon: "step-share", title: "Share your requirement", text: "Fill the form or call us – takes 2 minutes." },
    { icon: "step-compare", title: "We compare banks for you", text: "We shortlist the best-fit offers for your profile." },
    { icon: "step-docs", title: "We apply & handle documents", text: "Doorstep pickup and end-to-end paperwork support." },
    { icon: "step-bank", title: "Get sanction & disbursal", text: "We follow up with the lender until money reaches you." }
  ],

  /* ---------- Team (photo: path like "assets/team/vijay.jpg", or "" for initials) ---------- */
  team: {
    featured: {
      name: "Vijay Chauhan", role: "Regional Manager", photo: "assets/team/vijay-chauhan.webp",
      experience: "[X years] experience",
      message: "[Two-line personal message from Vijay – e.g. why customers in Pune can trust this office and what you promise every borrower.]"
    },
    members: [
      { name: "[Name]", role: "Home Loan Specialist", photo: "" },
      { name: "[Name]", role: "Business Loan Expert", photo: "" },
      { name: "[Name]", role: "Relationship Manager", photo: "" },
      { name: "[Name]", role: "Relationship Manager", photo: "" }
    ]
  },

  /* ---------- Documents ---------- */
  documents: {
    common: ["PAN card", "Aadhaar card", "Address proof", "Passport-size photographs"],
    salaried: ["Last 3 months' salary slips", "6 months' bank statement (salary account)", "Form 16 / latest ITR"],
    selfEmployed: ["2–3 years' ITR with computation of income", "Business proof (GST / Udyam / Shop Act licence)", "12 months' bank statement", "GST returns (last 12 months)"],
    property: "For Home Loan / LAP: property papers – sale agreement / title deed, approved plan, index II, tax receipts."
  },

  /* ---------- Testimonials ----------
     IMPORTANT: publish only GENUINE reviews from real customers, with their
     permission. Entries marked placeholder:true show a "Sample" tag; replace
     them with real reviews (or delete them) before going live.            */
  testimonials: [
    { placeholder: true, name: "[Customer name]", area: "[Area, e.g. Kothrud]", loan: "Home Loan", stars: 5,
      text: "[Paste a real customer review here.]" },
    { placeholder: true, name: "[Customer name]", area: "[Area, e.g. Baner]", loan: "Loan Against Property", stars: 5,
      text: "[Paste a real customer review here.]" },
    { placeholder: true, name: "[Customer name]", area: "[Area, e.g. Hadapsar]", loan: "Business Loan", stars: 5,
      text: "[Paste a real customer review here.]" }
  ],

  /* ---------- FAQs ---------- */
  faqs: [
    { q: "Is your service free for customers?",
      a: "Our advisory and comparison service is free for customers. Lenders may charge their own processing fees, which we explain clearly before you apply." },
    { q: "How fast can my loan be sanctioned?",
      a: "It depends on the loan type and lender. Personal loans can be sanctioned within a few working days once documents are complete; home loans and LAP usually take longer because of legal and technical property checks." },
    { q: "What CIBIL score do I need?",
      a: "Most lenders prefer a score of 700 or above, and 750+ usually gets better rates. If your score is lower, we can still suggest lenders and steps to improve your eligibility." },
    { q: "What can I use a Loan Against Property for?",
      a: "Almost any genuine need – business expansion, working capital, children's education, medical expenses, a family wedding or consolidating costlier debt. Because your property is the security, LAP usually comes at a lower rate than an unsecured loan." },
    { q: "Do I need to visit the office?",
      a: "No. We offer doorstep document pickup across Pune and can handle most of the process over phone and WhatsApp. You're welcome to visit us at Deccan Gymkhana anytime during working hours." },
    { q: "Is my personal data safe?",
      a: "Your details are used only to process your enquiry and are shared only with partner lenders you choose to apply with. See our Privacy Policy for details." }
  ]
};
