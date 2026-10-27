/* =====================================================================
   Pune Regional Office landing page — behaviour
   Reads everything from window.SITE_CONFIG (js/config.js).
   ===================================================================== */
(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  var B = C.business;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var icon = function (id) { return '<svg class="i" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
  /* colour product illustration in a light circle (symbols "ic-<loan id>" in index.html) */
  var illo = function (id, extra) { return '<span class="picon ' + (extra || "") + '" aria-hidden="true"><svg><use href="#ic-' + id + '"/></svg></span>'; };
  var initials = function (n) { var w = n.replace(/[\[\]]/g, "").trim().split(/\s+/); return ((w[0] || "")[0] || "") + ((w[1] || "")[0] || ""); };
  var isPlaceholder = function (v) { return !v || /^\[.*\]$/.test(String(v).trim()) || v === "#"; };

  /* ---------------- Tracking ---------------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function loadScript(src) { var s = document.createElement("script"); s.async = true; s.src = src; document.head.appendChild(s); }
  function initTracking() {
    var T = C.tracking;
    if (T.gtmId) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      loadScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(T.gtmId));
    }
    /* GA4's gtag.js + config call live in the <head> (written by build.py). Only load it here if that's missing. */
    var gaInHead = !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (!gaInHead && (T.ga4Id || T.googleAdsId)) {
      loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(T.ga4Id || T.googleAdsId));
      window.gtag("js", new Date());
      if (T.ga4Id) window.gtag("config", T.ga4Id);
    }
    if (T.googleAdsId) {
      window.gtag("config", T.googleAdsId);
    }
    if (T.metaPixelId) {
      /* Standard Meta Pixel bootstrap */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", T.metaPixelId);
      window.fbq("track", "PageView");
    }
  }
  /** Fire a conversion event to every configured platform. type: "lead" | "call" | "whatsapp" */
  function track(type, extra) {
    var T = C.tracking, data = extra || {};
    var gaName = { lead: "generate_lead", call: "click_call", whatsapp: "click_whatsapp" }[type];
    window.dataLayer.push(Object.assign({ event: gaName }, data));
    if (T.ga4Id) window.gtag("event", gaName, data);
    if (window.fbq) window.fbq("track", type === "lead" ? "Lead" : "Contact", data);
    if (type === "lead" && T.googleAdsId && T.googleAdsLeadLabel) {
      window.gtag("event", "conversion", { send_to: T.googleAdsId + "/" + T.googleAdsLeadLabel });
    }
  }

  /* ---------------- UTM / click-id capture ---------------- */
  var ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
  var params = new URLSearchParams(location.search);
  var attribution = (function () {
    var saved = {};
    try { saved = JSON.parse(sessionStorage.getItem("attr") || "{}"); } catch (e) {}
    ATTR_KEYS.forEach(function (k) { if (params.get(k)) saved[k] = params.get(k); });
    try { sessionStorage.setItem("attr", JSON.stringify(saved)); } catch (e) {}
    return saved;
  })();

  /* ---------------- Contact links ---------------- */
  var waUrl = "https://wa.me/" + B.whatsapp + "?text=" + encodeURIComponent(B.whatsappText);
  $$("[data-tel]").forEach(function (a) { a.href = "tel:" + B.phoneE164; if (a.hasAttribute("data-tel-text")) a.textContent = B.phoneDisplay; });
  $$("[data-wa]").forEach(function (a) { a.href = waUrl; });
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    if (a.matches(".js-call")) track("call", { location: a.closest("header,.mbar,.office,footer") ? a.closest("header,.mbar,.office,footer").className.split(" ")[0] : "page" });
    if (a.matches(".js-wa")) track("whatsapp");
  });

  /* ---------------- Brand ---------------- */
  $$("[data-brand]").forEach(function (el) {
    el.innerHTML = B.logo
      ? '<img class="brand__logo" src="' + esc(B.logo) + '" alt="Urban Money" width="125" height="49" fetchpriority="high" decoding="async"><span class="brand__tag">Pune Regional Office</span>'
      : '<span class="brand__mark" aria-hidden="true">UM</span><span>Urban Money<span class="brand__sub">Pune Regional Office</span></span>';
  });

  /* ---------------- Dropdowns ---------------- */
  $$("select[data-options]").forEach(function (sel) {
    var key = sel.getAttribute("data-options");
    var list = C[key] || [];
    list.forEach(function (item) {
      var o = document.createElement("option");
      if (typeof item === "string") { o.value = item; o.textContent = item; }
      else { o.value = item.id; o.textContent = item.name; }
      sel.appendChild(o);
    });
  });

  function setLoan(id) { $$('select[name="loan_type"]').forEach(function (s) { if ($('option[value="' + id + '"]', s)) s.value = id; }); }
  function goToForm(loanId) {
    if (loanId) setLoan(loanId);
    var f = $("#quick-form");
    f.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(function () { $("#q-name").focus({ preventScroll: true }); }, 500);
  }
  if (params.get("loan")) setLoan(params.get("loan"));

  /* ---------------- Hero: rotating word in headline ---------------- */
  var rot = $("#rotator"), words = C.hero.rotatingWords;
  rot.innerHTML = words.map(function (w, i) { return '<span' + (i === 0 ? ' class="is-on"' : "") + ">" + esc(w) + "</span>"; }).join("");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && words.length > 1) {
    var wi = 0, spans = $$("span", rot);
    setInterval(function () {
      var cur = spans[wi]; wi = (wi + 1) % spans.length; var nxt = spans[wi];
      cur.classList.remove("is-on"); cur.classList.add("is-out");
      nxt.classList.remove("is-out"); nxt.classList.add("is-on");
      setTimeout(function () { cur.classList.remove("is-out"); }, 500);
    }, 2400);
  }

  /* ---------------- Hero stats (animated counters) ---------------- */
  var fmt = new Intl.NumberFormat("en-IN");
  $("#hero-stats").innerHTML = C.stats.map(function (s, i) {
    return '<li class="hstat"><span class="hex">' + icon(s.icon) + '</span><div><div class="hstat__num"><span data-stat="' + i + '">' + esc(s.prefix) + "0" + esc(s.suffix) + "</span>" +
      (s.plus ? " <b>+</b>" : "") + '</div><div class="hstat__label">' + esc(s.label) + "</div></div></li>";
  }).join("");
  function renderStat(el, s, v) {
    var n = s.decimals ? v.toFixed(s.decimals) : fmt.format(Math.round(v));
    el.textContent = s.prefix + n + s.suffix;
  }
  function runCounters() {
    $$("[data-stat]").forEach(function (el) {
      var s = C.stats[+el.getAttribute("data-stat")], t0 = performance.now(), dur = reduceMotion ? 1 : 1600;
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        renderStat(el, s, s.value * e);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }
  var statsIO = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { statsIO.disconnect(); runCounters(); } }, { threshold: .3 });
  statsIO.observe($("#hero-stats"));

  /* ---------------- Hero promo slider ---------------- */
  var promoTrack = $("#promo-track"), dotsEl = $("#promo-dots"), slides = C.hero.slides;
  promoTrack.innerHTML = slides.map(function (sl, i) {
    return '<article class="slide" aria-roledescription="slide" aria-label="' + (i + 1) + " of " + slides.length + '">' +
      "<h2>" + esc(sl.pre) + " <em>" + esc(sl.hl) + "</em> " + esc(sl.post) + "</h2><p>" + esc(sl.text) + "</p>" +
      '<button class="btn" type="button" data-enquire="' + esc(sl.loan) + '">' + esc(sl.cta) + " " + icon("right") + "</button>" +
      '<div class="slide__art" aria-hidden="true"><span class="ring"></span><span class="ring ring--2"></span><span class="coin coin--1"></span><span class="coin coin--2"></span><span class="coin coin--3"></span><span class="disc">' + icon(sl.art) + "</span></div></article>";
  }).join("");
  dotsEl.innerHTML = slides.map(function (_, i) {
    return '<button type="button" role="tab" aria-label="Show offer ' + (i + 1) + '" aria-selected="' + (i === 0) + '"></button>';
  }).join("");
  var dots = $$("button", dotsEl), cur = 0;
  function goSlide(i) { promoTrack.scrollTo({ left: i * promoTrack.clientWidth, behavior: "smooth" }); }
  dots.forEach(function (d, i) { d.addEventListener("click", function () { goSlide(i); restart(); }); });
  promoTrack.addEventListener("scroll", function () {
    var i = Math.round(promoTrack.scrollLeft / promoTrack.clientWidth);
    if (i !== cur) { cur = i; dots.forEach(function (d, j) { d.setAttribute("aria-selected", j === i); }); }
  }, { passive: true });
  var timer;
  function restart() { clearInterval(timer); if (!reduceMotion) timer = setInterval(function () { goSlide((cur + 1) % slides.length); }, 5000); }
  promoTrack.addEventListener("mouseenter", function () { clearInterval(timer); });
  promoTrack.addEventListener("mouseleave", restart);
  promoTrack.addEventListener("touchstart", function () { clearInterval(timer); }, { passive: true });
  restart();

  /* ---------------- Hero product cards ---------------- */
  $("#hero-cards").innerHTML = C.loans.map(function (l) {
    return '<article class="pcard">' + (l.badge ? '<span class="pcard__badge">' + esc(l.badge) + "</span>" : "") +
      '<div class="pcard__head">' + illo(l.id) + "<h3>" + esc(l.name) + "</h3></div><p>" + esc(l.short) + "</p>" +
      '<button class="btn btn--sm" type="button" data-enquire="' + esc(l.id) + '">Apply Now ' + icon("right") + "</button></article>";
  }).join("");
  $("#hero-footnote").textContent = C.ratesFootnote;

  /* ---------------- Loans section: alternating rows with tilted posters ---------------- */
  var bold = function (t) { return esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); };
  var tick = '<svg class="i" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m8 12.2 2.7 2.7L16.2 9.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  $("#showcase").innerHTML = C.loans.map(function (l, i) {
    var d = C.showcase[l.id]; if (!d) return "";
    var P = d.poster;
    var poster =
      '<div class="poster-wrap"><span class="dots dots--a" aria-hidden="true"></span><span class="dots dots--b" aria-hidden="true"></span>' +
      '<div class="poster poster--' + esc(P.theme) + '" role="img" aria-label="' + esc(P.title + " – " + P.sub) + '">' +
        '<div class="poster__brand"><span class="poster__mark">UM</span>Urban Money · Pune</div>' +
        '<p class="poster__kicker">' + esc(P.kicker) + "</p>" +
        '<p class="poster__title">' + esc(P.title) + "</p>" +
        '<p class="poster__sub">' + esc(P.sub) + "</p>" +
        '<button class="poster__btn" type="button" data-enquire="' + esc(l.id) + '" tabindex="-1">Apply Now</button>' +
        '<div class="poster__art" aria-hidden="true"><span class="ring"></span><span class="coin coin--1"></span><span class="coin coin--2"></span><span class="coin coin--3"></span>' +
          '<span class="spark spark--1"></span><span class="spark spark--2"></span><span class="poster__disc"><svg><use href="#ic-' + esc(P.art) + '"/></svg></span></div>' +
        '<div class="poster__strip">' + P.strip.map(esc).join("<i>|</i>") + "</div>" +
      "</div></div>";
    var text =
      '<div class="show__text">' + illo(l.id) +
        "<h3>" + esc(l.name) + '</h3><ul class="show__list">' +
        d.points.map(function (pt) { return "<li>" + tick + "<span>" + bold(pt) + "</span></li>"; }).join("") + "</ul>" +
        '<div class="show__more" id="more-' + esc(l.id) + '" hidden><p class="show__more-h">Good to know</p><ul class="show__list show__list--sm">' +
        d.more.map(function (pt) { return "<li>" + tick + "<span>" + bold(pt) + "</span></li>"; }).join("") + "</ul></div>" +
        '<div class="show__cta"><button class="btn btn--primary" type="button" data-enquire="' + esc(l.id) + '">Apply Now ' + icon("right") + "</button>" +
        '<button class="btn btn--outline" type="button" data-more="' + esc(l.id) + '" aria-expanded="false" aria-controls="more-' + esc(l.id) + '"><span>Explore More</span> ' + icon("right") + "</button></div>" +
      "</div>";
    return '<article class="show' + (i % 2 ? " show--flip" : "") + ' reveal">' + text + poster + "</article>";
  }).join("");
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-more]"); if (!b) return;
    var box = $("#more-" + b.getAttribute("data-more")), open = box.hidden;
    box.hidden = !open; b.setAttribute("aria-expanded", open);
    $("span", b).textContent = open ? "Show Less" : "Explore More";
  });
  $("#rates-footnote").textContent = C.ratesFootnote;
  $("#footer-loans").innerHTML = C.loans.map(function (l) { return '<li><a href="?loan=' + esc(l.id) + '#home" data-enquire="' + esc(l.id) + '">' + esc(l.name) + "</a></li>"; }).join("");
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-enquire]");
    if (b) { e.preventDefault(); goToForm(b.getAttribute("data-enquire")); return; }
    var s = e.target.closest(".js-scroll-form");
    if (s) { e.preventDefault(); goToForm(); }
  });

  /* ---------------- Banking partners grid ---------------- */
  (function () {
    // decorative flowing lines (generated so the file stays small)
    var lines = "";
    for (var k = 0; k < 26; k++) {
      var o = k * 9;
      lines += '<path d="M' + (-40 + o) + ' 800 C ' + (160 + o) + ' 600, ' + (20 + o) + ' 360, ' + (300 + o) + ' 220 S ' + (520 + o) + ' 40, ' + (640 + o) + ' -20" />';
    }
    $("#bank-lines").innerHTML = lines;
    $("#banks-intro").textContent = C.banksIntro;

    var palette = ["#0a8a5c", "#1f6feb", "#c2410c", "#7c3aed", "#b91c1c", "#0e7490", "#a16207", "#be185d", "#15803d", "#334155"];
    var hash = function (t) { var h = 0; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; };
    var mono = function (b) {
      var src = b.short || b.name.replace(/&/g, " ");
      var w = src.split(/\s+/).filter(function (x) { return x && !/^(of|the|and)$/i.test(x); });
      return (b.short ? b.short : w.slice(0, 2).map(function (x) { return x[0]; }).join("")).toUpperCase().slice(0, 3);
    };
    var tiles = $("#bank-tiles");
    tiles.innerHTML = C.banks.map(function (b) {
      var col = palette[hash(b.name) % palette.length];
      var inner = b.logo
        ? '<img src="' + esc(b.logo) + '" alt="' + esc(b.name) + '" loading="lazy" width="120" height="40">'
        : '<span class="btile__mono" style="--c:' + col + '">' + esc(mono(b)) + '</span><span class="btile__name">' + esc(b.name) + "</span>";
      return '<li class="btile" data-type="' + esc(b.type) + '" title="' + esc(b.name) + '">' + inner + "</li>";
    }).join("");

    var filter = "all", expanded = false, items = $$(".btile", tiles), toggle = $("#banks-toggle");
    function apply() {
      var shown = 0;
      items.forEach(function (li) {
        var match = filter === "all" || li.getAttribute("data-type") === filter;
        var visible = match && (expanded || shown < C.banksVisible);
        if (visible) shown++;
        li.hidden = !visible;
      });
      var total = items.filter(function (li) { return filter === "all" || li.getAttribute("data-type") === filter; }).length;
      toggle.hidden = total <= C.banksVisible;
      $("span", toggle).textContent = expanded ? "Show Fewer" : "View All " + (filter === "nbfc" ? "NBFCs" : filter === "bank" ? "Banks" : "Banks") + " (" + total + ")";
      toggle.setAttribute("aria-expanded", expanded);
    }
    $$("[data-bf]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filter = btn.getAttribute("data-bf");
        $$("[data-bf]").forEach(function (x) { x.setAttribute("aria-pressed", x === btn); });
        apply();
      });
    });
    toggle.addEventListener("click", function () {
      expanded = !expanded; apply();
      if (!expanded) $("#banks").scrollIntoView({ behavior: "smooth" });
    });
    apply();
  })();

  /* ---------------- Why & Steps ---------------- */
  $("#why-grid").innerHTML = C.why.map(function (w) {
    return '<div class="card why reveal"><div class="why__icon">' + icon(w.icon) + "</div><h3>" + esc(w.title) + "</h3><p>" + esc(w.text) + "</p></div>";
  }).join("");
  /* ---------------- How it works: winding journey line ---------------- */
  $("#steps").innerHTML = C.steps.map(function (s, i) {
    var n = (i < 9 ? "0" : "") + (i + 1);
    return '<li class="jstep jstep--' + (i + 1) + '"><span class="jstep__node">' + icon(s.icon) + '</span>' +
      '<div class="jstep__body"><span class="jstep__ghost" aria-hidden="true">' + n + '</span><span class="jstep__num">' + n + "</span>" +
      "<h3>" + esc(s.title) + "</h3><p>" + esc(s.text) + "</p></div></li>";
  }).join("");
  (function () {
    var wrap = $("#journey"), svg = $("#journey-svg"), drawn = false;
    var NS = "http://www.w3.org/2000/svg";
    function layout() {
      var W = wrap.clientWidth, steps = $$(".jstep", wrap);
      if (W < 860) { svg.innerHTML = ""; steps.forEach(function (li) { li.style.left = li.style.top = ""; }); wrap.style.height = ""; return; }
      var r = 125, A = 60, xL = Math.round(W * 0.34), xR = Math.round(W * 0.64);
      var pts = [[xL, A], [xR + r, A + r], [xL - r, A + 3 * r], [xR + r, A + 4 * r]];
      wrap.style.height = (A + 4 * r + 150) + "px";
      var d = "M" + xL + " " + A + " H" + xR + " A" + r + " " + r + " 0 0 1 " + xR + " " + (A + 2 * r) +
              " H" + xL + " A" + r + " " + r + " 0 0 0 " + xL + " " + (A + 4 * r) + " H" + (xR + r);
      svg.setAttribute("viewBox", "0 0 " + W + " " + (A + 4 * r + 20));
      svg.style.height = (A + 4 * r + 20) + "px";
      svg.innerHTML = '<defs><linearGradient id="jg" gradientUnits="userSpaceOnUse" x1="' + (xL - r) + '" y1="0" x2="' + (xR + r) + '" y2="0">' +
        '<stop offset="0" stop-color="#2fe39b"/><stop offset=".55" stop-color="#b6ef4a"/><stop offset="1" stop-color="#1f2321"/></linearGradient></defs>' +
        '<path class="journey__track" d="' + d + '"/><path class="journey__line" id="jline" d="' + d + '" stroke="url(#jg)"/><g id="jarrows"></g>';
      var line = $("#jline", svg), len = line.getTotalLength(), g = $("#jarrows", svg);
      line.style.strokeDasharray = len; line.style.strokeDashoffset = drawn ? 0 : len;
      // direction arrows along the path (skip spots near the step circles)
      var out = "";
      [0.1, 0.235, 0.43, 0.56, 0.78, 0.93].forEach(function (f) {
        var p1 = line.getPointAtLength(len * f), p2 = line.getPointAtLength(len * f + 1);
        var a = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        out += '<path class="journey__arrow" d="M-6 -7 L7 0 L-6 7 L-2.5 0 Z" transform="translate(' + p1.x.toFixed(1) + " " + p1.y.toFixed(1) + ") rotate(" + a.toFixed(1) + ')"/>';
      });
      g.innerHTML = out;
      steps.forEach(function (li, i) { li.style.left = pts[i][0] + "px"; li.style.top = pts[i][1] + "px"; });
    }
    function draw() { drawn = true; var l = $("#jline", svg); if (l) l.style.strokeDashoffset = 0; wrap.classList.add("is-drawn"); }
    layout();
    var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(layout, 120); });
    new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { setTimeout(draw, 150); o.disconnect(); } }, { threshold: .25 }).observe(wrap);
  })();

  /* ---------------- EMI calculator ---------------- */
  var inr = function (v) { return "₹" + fmt.format(Math.round(v)); };
  var shortInr = function (v) { return v >= 1e7 ? "₹" + (v / 1e7).toFixed(v % 1e7 ? 2 : 0) + " Cr" : "₹" + (v / 1e5).toFixed(v % 1e5 ? 1 : 0) + " L"; };
  var amt = $("#emi-amt"), rate = $("#emi-rate"), ten = $("#emi-ten");
  var CIRC = 2 * Math.PI * 48;
  function fill(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%"); }
  function calcEmi() {
    var P = +amt.value, r = +rate.value / 12 / 100, n = +ten.value * 12;
    var emi = r ? P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : P / n;
    var total = emi * n, interest = total - P;
    $("#emi-amt-out").textContent = shortInr(P);
    $("#emi-rate-out").textContent = (+rate.value).toFixed(2) + "%";
    $("#emi-ten-out").textContent = ten.value + (ten.value == 1 ? " yr" : " yrs");
    $("#emi-donut-val").textContent = inr(emi);
    $("#emi-principal").textContent = inr(P);
    $("#emi-interest").textContent = inr(interest);
    $("#emi-total").textContent = inr(total);
    var frac = interest / total;
    $("#donut-int").setAttribute("stroke-dasharray", (CIRC * frac) + " " + CIRC);
    [amt, rate, ten].forEach(fill);
  }
  [amt, rate, ten].forEach(function (r) { r.addEventListener("input", calcEmi); });
  calcEmi();

  /* ---------------- Team ---------------- */
  function avatar(p) {
    return '<div class="avatar">' + (p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name + ", " + p.role) + '" loading="lazy" decoding="async" width="440" height="585">' : '<span aria-hidden="true">' + esc(initials(p.name) || "?") + "</span>") + "</div>";
  }
  var F = C.team.featured;
  $("#team-featured").innerHTML = '<article class="card featured reveal">' + avatar(F) + '<div><h3>' + esc(F.name) + '</h3><p class="featured__role">' + esc(F.role) +
    '</p><span class="featured__exp">' + esc(F.experience) + "</span><blockquote>" + esc(F.message) + "</blockquote></div></article>";
  $("#team-grid").innerHTML = C.team.members.map(function (m) {
    return '<article class="card member reveal">' + avatar(m) + "<h3>" + esc(m.name) + "</h3><p>" + esc(m.role) + "</p></article>";
  }).join("");

  /* ---------------- Documents (tabs) ---------------- */
  var D = C.documents;
  var list = function (title, items) { return "<div><h3>" + esc(title) + '</h3><ul class="checklist">' + items.map(function (i) { return "<li>" + icon("check") + "<span>" + esc(i) + "</span></li>"; }).join("") + "</ul></div>"; };
  $("#doc-salaried").innerHTML = list("KYC", D.common) + list("Income proof", D.salaried);
  $("#doc-self").innerHTML = list("KYC", D.common) + list("Income & business proof", D.selfEmployed);
  $("#doc-property").textContent = D.property;
  var tabs = $$('[role="tab"]');
  function selectTab(t) {
    tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; selectTab(n); n.focus(); }
    });
  });

  /* ---------------- FAQ ---------------- */
  $("#faq-list").innerHTML = C.faqs.map(function (f, i) {
    return "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>";
  }).join("");

  /* ---------------- Office / footer details ---------------- */
  var addrHtml = B.addressLines.map(esc).join("<br>");
  $("#office-address").innerHTML = "<strong>" + esc(B.displayName) + "</strong><br>" + addrHtml;
  $("#footer-address").innerHTML = addrHtml;
  $("#office-landmark").textContent = B.landmark;
  $("#office-hours").textContent = B.hours;
  ["#office-email", "#footer-email"].forEach(function (s) {
    var a = $(s); a.textContent = B.email;
    if (!isPlaceholder(B.email)) a.href = "mailto:" + B.email;
  });
  [["#s-fb", "facebook"], ["#s-ig", "instagram"], ["#s-li", "linkedin"]].forEach(function (p) {
    var a = $(p[0]), u = B.social[p[1]];
    if (isPlaceholder(u)) a.hidden = true; else a.href = u;
  });

  /* Map: loads on click, or automatically when scrolled near (keeps initial load fast) */
  var map = $("#map");
  function loadMap() {
    if (map.dataset.loaded) return; map.dataset.loaded = 1;
    map.innerHTML = '<iframe title="Office location map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' + encodeURIComponent(B.mapQuery) + '&output=embed"></iframe>';
  }
  $(".map__load", map).addEventListener("click", loadMap);
  new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { loadMap(); o.disconnect(); } }, { rootMargin: "300px" }).observe(map);

  /* ---------------- Reveal on scroll ---------------- */
  var revIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); revIO.unobserve(en.target); } });
  }, { threshold: .12 });
  $$(".reveal").forEach(function (el) { revIO.observe(el); });

  /* ---------------- Forms ---------------- */
  var MOBILE_RE = /^[6-9]\d{9}$/;
  var dlg = $("#thanks");
  $("#thanks-text").textContent = C.leads.thankYouText;
  $("#thanks-close").addEventListener("click", function () { dlg.close(); });

  $$('input[name="mobile"]').forEach(function (i) {
    i.addEventListener("input", function () { i.value = i.value.replace(/\D/g, "").replace(/^(91|0)(?=\d{10})/, "").slice(0, 10); });
  });

  function validate(form) {
    var errors = [];
    $$(".invalid", form).forEach(function (el) { el.classList.remove("invalid"); });
    var name = form.elements.name, mobile = form.elements.mobile, loan = form.elements.loan_type, consent = form.elements.consent, email = form.elements.email;
    if (name.value.trim().length < 2) { errors.push("Please enter your full name."); name.classList.add("invalid"); }
    if (!MOBILE_RE.test(mobile.value)) { errors.push("Please enter a valid 10-digit Indian mobile number."); mobile.classList.add("invalid"); }
    if (!loan.value) { errors.push("Please select a loan type."); loan.classList.add("invalid"); }
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { errors.push("Please enter a valid email."); email.classList.add("invalid"); }
    if (consent && !consent.checked) { errors.push("Please tick the consent box to continue."); consent.closest(".consent").classList.add("invalid"); }
    return errors;
  }

  $$(".js-lead").forEach(function (form) {
    var startedAt = Date.now();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $(".form__msg", form), btn = $('button[type="submit"]', form);
      msg.textContent = "";
      var errs = validate(form);
      if (errs.length) { msg.textContent = errs[0]; var bad = $(".invalid", form); if (bad) (bad.matches("input,select") ? bad : $("input", bad)).focus(); return; }

      /* Spam protection: honeypot filled or submitted too fast => silently pretend success */
      if (form.elements.website.value || Date.now() - startedAt < 2500) { dlg.showModal(); form.reset(); return; }

      var fd = new FormData(form);
      var loanName = (C.loans.filter(function (l) { return l.id === fd.get("loan_type"); })[0] || {}).name || fd.get("loan_type");
      var payload = {
        timestamp: new Date().toISOString(),
        form: form.getAttribute("data-form-name"),
        name: fd.get("name"), mobile: "+91" + fd.get("mobile"), email: fd.get("email") || "",
        loan_type: loanName, loan_amount: fd.get("loan_amount") || "",
        employment_type: fd.get("employment_type") || "", monthly_income: fd.get("monthly_income") || "",
        area: fd.get("area") || "", call_time: fd.get("call_time") || "", message: fd.get("message") || "",
        consent: fd.get("consent") ? "yes" : "implied (quick form)",
        page_url: location.href, referrer: document.referrer
      };
      ATTR_KEYS.forEach(function (k) { payload[k] = attribution[k] || ""; });

      btn.disabled = true; var label = btn.textContent; btn.textContent = "Sending…";
      var done = function () {
        btn.disabled = false; btn.textContent = label;
        track("lead", { form_name: payload.form, loan_type: payload.loan_type });
        form.reset(); startedAt = Date.now();
        dlg.showModal();
      };

      if (!C.leads.webhookUrl) {
        console.warn("[Lead] DEMO MODE – no webhookUrl set in js/config.js. Payload:", payload);
        setTimeout(done, 400);
        return;
      }
      /* Apps Script web apps don't send CORS headers; text/plain + no-cors avoids a preflight. */
      fetch(C.leads.webhookUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
        .then(done)
        .catch(function () {
          btn.disabled = false; btn.textContent = label;
          msg.innerHTML = 'Network issue – please <a href="tel:' + B.phoneE164 + '">call us</a> or <a href="' + waUrl + '" target="_blank" rel="noopener">WhatsApp us</a>.';
        });
    });
  });

  initTracking();
})();
