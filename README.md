# Urban Money – Pune Regional Office landing page

A static, single-page lead-generation site: plain HTML/CSS/JS. It deploys anywhere (Netlify, Vercel, cPanel or any regular host). Run `python3 build.py` after editing CSS or JS (see "Build step" below).

```
index.html          page structure + SEO meta + schema markup
css/styles.css      all styling (brand colour = --brand at the top)
js/config.js        ALL editable content: contacts, loans, rates, team, reviews, FAQs, tracking IDs
js/main.js          behaviour: forms, EMI calculator, counters, tracking, UTM capture
apps-script/Code.gs Google Apps Script webhook → Google Sheet + email alert
privacy.html / terms.html   legal templates (get them reviewed)
assets/             logo, favicon, og-image, team photos
```

## Before going live, checklist

1. **Official logo**: put the file Urban Money supplies in `assets/` and set `business.logo` in `js/config.js`.
2. **Brand colour**: set `--brand` / `--brand-dark` / `--neon` / `--dark` in `css/styles.css` to the official colour.
3. **Lead webhook**: follow the steps at the top of `apps-script/Code.gs`, then paste the Web App URL into `leads.webhookUrl`. *Until you do this the forms run in demo mode and leads are NOT saved.*
4. **Placeholders**: search the project for `[` and replace everything: office email, hours, Vijay's experience and message, team names and photos, Google reviews link, social links, domain in `index.html`, grievance officer in `privacy.html`.
5. **Testimonials**: use only genuine reviews from real customers, given with their permission. Remove the sample entries, or set `placeholder: false` once you've replaced them with real reviews.
6. **Figures and rates**: confirm the national stats and "starting from" rates with head office before publishing.
7. **Bank names**: the partner list shows names as text. Add bank logos only if you have permission to use them.
8. **Tracking**: fill in the `tracking` IDs in `config.js`. Events fired: `generate_lead` / Meta `Lead` (form submit, plus a Google Ads conversion if a label is set), `click_call` and `click_whatsapp` / Meta `Contact`.
9. **OG image**: add `assets/og-image.jpg` (1200×630).
10. **Schema**: the JSON-LD in `index.html` holds address, phone and hours. Keep it in sync with `config.js`, and check the geo coordinates against Google Maps.
11. Get `privacy.html` and `terms.html` reviewed by compliance.

## Build step (performance)

Edit the readable sources (`css/styles.css`, `js/config.js`, `js/main.js`), then run:

```
python3 build.py
```

It needs only Python 3 and does three things:

- inlines the above-the-fold CSS (the blocks between `@critical-start` / `@critical-end` in `styles.css`) into `index.html`,
- writes the rest of the CSS to `css/styles.min.css`, loaded without blocking render,
- bundles and minifies `config.js` + `main.js` into `js/app.min.js` (loaded with `defer`).

The page loads the generated files, so changes to the sources only show up after a build. Commit the generated files too. Images are WebP (`assets/logo.webp`, `assets/team/*.webp`); convert any new photo to WebP before adding it.

`sitemap.xml` and `robots.txt` live in the root. If you move to a custom domain, update the domain in both files and in the canonical / og / schema URLs in `index.html`.

## Ad landing URLs

Add `?loan=<id>` to pre-select the product, alongside your UTMs:

```
https://your-domain/?loan=home-loan&utm_source=meta&utm_medium=paid&utm_campaign=hl_pune
```

Loan IDs: `home-loan`, `loan-against-property`, `personal-loan`, `business-loan`.

UTM and click-id values (`gclid`, `fbclid`) are kept for the whole visit and saved with every lead.

## Spam protection

The forms use a hidden honeypot field plus a minimum fill time. If you get bot spam anyway, add reCAPTCHA v3: load the script, get a token in the submit handler in `main.js`, send it in the payload, and verify it in `Code.gs` with `UrlFetchApp` against `https://www.google.com/recaptcha/api/siteverify`.

## Deploy

- **Netlify**: drag the folder onto app.netlify.com/drop.
- **Vercel**: run `vercel` in the folder, or import it from Git.
- **cPanel or other hosting**: upload the folder contents to `public_html`.

## Local preview

```
npx serve .        # or: python -m http.server 8000
```
