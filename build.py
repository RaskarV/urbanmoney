#!/usr/bin/env python3
"""
Urban Money Pune: asset build (no dependencies, Python 3 only).

Edit the readable sources, then run:  python3 build.py

  css/styles.css  ->  critical CSS (between @critical-start/@critical-end markers)
                      is minified and inlined into index.html
                  ->  everything else becomes css/styles.min.css (loaded without blocking render)
  js/config.js + js/main.js -> js/app.min.js (one deferred file)

The script re-checks its own output: the minified CSS and JS must contain exactly
the same rules / tokens as the sources, otherwise the build stops.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSS_SRC = ROOT / "css" / "styles.css"
CSS_OUT = ROOT / "css" / "styles.min.css"
JS_SRC = [ROOT / "js" / "config.js", ROOT / "js" / "main.js"]
JS_OUT = ROOT / "js" / "app.min.js"
HTML = ROOT / "index.html"

CRIT_RE = re.compile(r"/\* @critical-start[^*]*\*/(.*?)/\* @critical-end \*/", re.S)


# ---------------------------------------------------------------- CSS
def css_strip_comments(s):
    out, i, n = [], 0, len(s)
    while i < n:
        c = s[i]
        if c in "\"'":
            j = i + 1
            while j < n and s[j] != c:
                j += 2 if s[j] == "\\" else 1
            out.append(s[i:j + 1])
            i = j + 1
        elif s.startswith("/*", i):
            j = s.find("*/", i + 2)
            i = n if j < 0 else j + 2
        else:
            out.append(c)
            i += 1
    return "".join(out)


def css_minify(s):
    s = css_strip_comments(s)
    # protect strings
    strings = []

    def keep(m):
        strings.append(m.group(0))
        return "\x00%d\x00" % (len(strings) - 1)

    s = re.sub(r"\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^'\\])*'", keep, s)
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r" ?([{};,]) ?", r"\1", s)          # around { } ; ,
    s = re.sub(r"([{;]) ?([\w-]+) ?: ", r"\1\2:", s)  # "prop: value" -> "prop:value"
    s = re.sub(r"([{;])([\w-]+) :", r"\1\2:", s)
    s = re.sub(r";}", "}", s)
    s = re.sub(r"\( ", "(", s)
    s = re.sub(r" \)", ")", s)
    s = s.strip()
    return re.sub(r"\x00(\d+)\x00", lambda m: strings[int(m.group(1))], s)


def css_rules(s):
    """Normalised (prelude, declarations) list, used to prove minify() changed nothing."""
    s = css_strip_comments(s)
    s = re.sub(r"\s+", "", s)
    return s.replace(";}", "}")


# ---------------------------------------------------------------- JS
KEYWORDS_BEFORE_REGEX = {"return", "typeof", "instanceof", "in", "of", "new", "delete",
                         "void", "throw", "case", "do", "else"}


def js_tokens(src):
    """Yield (kind, text). kinds: ws, nl, comment, str, tpl, re, word, punct."""
    i, n = 0, len(src)
    last_sig = None  # last significant token (kind, text)
    while i < n:
        c = src[i]
        if c == "\n":
            yield "nl", c
            i += 1
        elif c in " \t\r\f\v":
            j = i
            while j < n and src[j] in " \t\r\f\v":
                j += 1
            yield "ws", src[i:j]
            i = j
        elif src.startswith("//", i):
            j = src.find("\n", i)
            j = n if j < 0 else j
            yield "comment", src[i:j]
            i = j
        elif src.startswith("/*", i):
            j = src.find("*/", i + 2)
            j = n if j < 0 else j + 2
            yield "comment", src[i:j]
            i = j
        elif c in "\"'":
            j = i + 1
            while j < n and src[j] != c:
                j += 2 if src[j] == "\\" else 1
            tok = ("str", src[i:j + 1])
            yield tok
            last_sig = tok
            i = j + 1
        elif c == "`":
            # template literal incl. nested ${ } with balanced braces
            j, depth = i + 1, 0
            while j < n:
                if src[j] == "\\":
                    j += 2
                    continue
                if depth == 0 and src[j] == "`":
                    break
                if src.startswith("${", j):
                    depth += 1
                    j += 2
                    continue
                if depth and src[j] == "}":
                    depth -= 1
                elif depth and src[j] == "`":
                    # nested template inside ${ }: skip it
                    k = j + 1
                    while k < n and src[k] != "`":
                        k += 2 if src[k] == "\\" else 1
                    j = k
                j += 1
            tok = ("tpl", src[i:j + 1])
            yield tok
            last_sig = tok
            i = j + 1
        elif c == "/":
            prev_kind, prev_text = last_sig or ("punct", "(")
            is_re = (
                (prev_kind == "punct" and prev_text not in (")", "]", "}"))
                or (prev_kind == "word" and prev_text in KEYWORDS_BEFORE_REGEX)
            )
            if is_re:
                j, in_class = i + 1, False
                while j < n:
                    if src[j] == "\\":
                        j += 2
                        continue
                    if src[j] == "[":
                        in_class = True
                    elif src[j] == "]":
                        in_class = False
                    elif src[j] == "/" and not in_class:
                        break
                    j += 1
                j += 1
                while j < n and (src[j].isalnum() or src[j] == "_"):
                    j += 1
                tok = ("re", src[i:j])
                yield tok
                last_sig = tok
                i = j
            else:
                tok = ("punct", "/")
                yield tok
                last_sig = tok
                i += 1
        elif c.isalnum() or c in "_$":
            j = i
            while j < n and (src[j].isalnum() or src[j] in "_$"):
                j += 1
            # numbers like 1.5e3 / .5 handled loosely: keep '.' attached to digits
            if src[i].isdigit():
                while j < n and (src[j].isalnum() or src[j] in "._"):
                    j += 1
            tok = ("word", src[i:j])
            yield tok
            last_sig = tok
            i = j
        else:
            tok = ("punct", c)
            yield tok
            last_sig = tok
            i += 1


def js_minify(src):
    out = []
    pending_space = False
    pending_nl = False
    prev = None  # last emitted significant token
    for kind, text in js_tokens(src):
        if kind == "comment":
            continue
        if kind == "ws":
            pending_space = True
            continue
        if kind == "nl":
            pending_nl = True
            continue
        # need a separator?
        if prev is not None and (pending_space or pending_nl):
            word_like = lambda t: (t[0] in ("word", "str", "tpl", "re")) and (t[1][-1].isalnum() or t[1][-1] in "_$")
            starts_word = kind == "word" or text[0] in "_$"
            ends_word = prev[0] == "word"
            if pending_nl:
                out.append("\n")          # keep line breaks: preserves ASI behaviour exactly
            elif (ends_word and starts_word) or (
                prev[0] == "punct" and text in ("+", "-") and prev[1] == text
            ) or (prev[1] in "+-" and text[0] == prev[1] and kind == "punct") or (
                prev[0] == "punct" and prev[1] == "/" and kind == "re"
            ):
                out.append(" ")
        out.append(text)
        prev = (kind, text)
        pending_space = pending_nl = False
    res = "".join(out)
    res = re.sub(r"\n+", "\n", res).strip("\n")
    return res


def js_signature(src):
    return [(k, t) for k, t in js_tokens(src) if k not in ("ws", "nl", "comment")]



# ---------------------------------------------------------------- SEO blocks (GA4 + FAQ schema)
def js_str(raw):
    """Decode a JS double-quoted string body (same escapes as JSON for what we use)."""
    return json.loads('"' + raw + '"')


def read_ga4_id(config_src):
    m = re.search(r"ga4Id:\s*\"([^\"]*)\"", config_src)
    return m.group(1).strip() if m else ""


def ga4_block(ga_id):
    if not ga_id:
        return "<!-- ga4:start (generated by build.py from tracking.ga4Id in js/config.js) -->\n  <!-- ga4:end -->"
    return (
        "<!-- ga4:start (generated by build.py from tracking.ga4Id in js/config.js) -->\n"
        "  <script async src=\"https://www.googletagmanager.com/gtag/js?id=" + ga_id + "\"></script>\n"
        "  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}"
        "gtag('js',new Date());gtag('config','" + ga_id + "');</script>\n"
        "  <!-- ga4:end -->"
    )


def faq_block(config_src):
    m = re.search(r"faqs:\s*\[(.*?)\n\s*\]\s*\n\};", config_src, re.S)
    items = []
    if m:
        for q, a in re.findall(r"q:\s*\"((?:\\.|[^\"\\])*)\"\s*,\s*a:\s*\"((?:\\.|[^\"\\])*)\"", m.group(1), re.S):
            items.append({"@type": "Question", "name": js_str(q),
                          "acceptedAnswer": {"@type": "Answer", "text": js_str(a)}})
    head = "<!-- faq-schema:start (generated by build.py from faqs in js/config.js) -->"
    if not items:
        return head + "\n  <!-- faq-schema:end -->"
    data = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": items}
    return (head + "\n  <script type=\"application/ld+json\">" +
            json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") +
            "</script>\n  <!-- faq-schema:end -->")


def sub_block(html, name, block):
    pat = re.compile(r"<!-- %s:start.*?<!-- %s:end -->" % (name, name), re.S)
    html, n = pat.subn(lambda m: block, html)
    return html, n


# ---------------------------------------------------------------- build
def short_hash(*chunks):
    h = hashlib.md5()
    for c in chunks:
        h.update(c.encode("utf-8"))
    return h.hexdigest()[:8]


def main():
    # ---- CSS
    css = CSS_SRC.read_text(encoding="utf-8")
    crit_parts = CRIT_RE.findall(css)
    if not crit_parts:
        sys.exit("No @critical-start/@critical-end markers found in css/styles.css")
    critical = "".join(crit_parts)
    rest = CRIT_RE.sub("", css)
    crit_min, rest_min = css_minify(critical), css_minify(rest)
    assert css_rules(crit_min) == css_rules(critical), "critical CSS minify mismatch"
    assert css_rules(rest_min) == css_rules(rest), "rest CSS minify mismatch"
    # nothing lost in the split
    assert len(css_rules(critical)) + len(css_rules(rest)) == len(css_rules(CRIT_RE.sub(lambda m: m.group(1), css)))
    CSS_OUT.write_text(rest_min + "\n", encoding="utf-8")

    # ---- JS (config first, then main; ';' guards against a missing semicolon at the join)
    parts = [p.read_text(encoding="utf-8") for p in JS_SRC]
    bundle_src = "\n;\n".join(parts)
    bundle_min = js_minify(bundle_src)
    assert js_signature(bundle_min) == js_signature(bundle_src), "JS minify changed the token stream"
    JS_OUT.write_text(bundle_min + "\n", encoding="utf-8")

    # ---- index.html
    html = HTML.read_text(encoding="utf-8")
    v_css, v_js = short_hash(rest_min), short_hash(bundle_min)
    block = (
        "<!-- critical-css:start (generated by build.py: edit css/styles.css, then run python3 build.py) -->\n"
        "  <style>" + crit_min + "</style>\n"
        "  <link rel=\"preload\" href=\"css/styles.min.css?v=" + v_css + "\" as=\"style\" onload=\"this.onload=null;this.rel='stylesheet'\">\n"
        "  <noscript><link rel=\"stylesheet\" href=\"css/styles.min.css?v=" + v_css + "\"></noscript>\n"
        "  <!-- critical-css:end -->"
    )
    html, n = re.subn(r"<!-- critical-css:start.*?<!-- critical-css:end -->", lambda m: block, html, flags=re.S)
    if n != 1:
        sys.exit("index.html is missing the critical-css:start/end markers")
    html, n = re.subn(r"<script src=\"js/app\.min\.js[^\"]*\" defer></script>",
                      "<script src=\"js/app.min.js?v=" + v_js + "\" defer></script>", html)
    if n != 1:
        sys.exit("index.html does not load js/app.min.js")
    config_src = parts[0]
    ga_id = read_ga4_id(config_src)
    html, n = sub_block(html, "ga4", ga4_block(ga_id))
    if n != 1:
        sys.exit("index.html is missing the ga4:start/end markers")
    html, n = sub_block(html, "faq-schema", faq_block(config_src))
    if n != 1:
        sys.exit("index.html is missing the faq-schema:start/end markers")
    HTML.write_text(html, encoding="utf-8")
    for extra in ("privacy.html", "terms.html"):
        p = ROOT / extra
        t, n = sub_block(p.read_text(encoding="utf-8"), "ga4", ga4_block(ga_id))
        if n == 1:
            p.write_text(t, encoding="utf-8")
    if not ga_id or "XXXX" in ga_id:
        print("WARNING: tracking.ga4Id in js/config.js is empty/placeholder: GA4 will not record real data until you set it.")

    kb = lambda p: "%.1f KB" % (p.stat().st_size / 1024)
    print("critical CSS inlined: %.1f KB | styles.min.css: %s (source %.1f KB)" % (len(crit_min) / 1024, kb(CSS_OUT), len(css) / 1024))
    print("app.min.js: %s (config+main source %.1f KB)" % (kb(JS_OUT), len(bundle_src) / 1024))


if __name__ == "__main__":
    main()
