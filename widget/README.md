# Accessibility Widget (תוסף נגישות)

Platform-agnostic, self-contained accessibility widget for the Israeli market.
One async `<script>` adds a floating Hebrew/RTL control panel to any site.

**This is a faithful vanilla-TS port of the bugbox `AccessibilityWidget`** — same
dark design, same ISA wheelchair icon, same features and CSS effects — repackaged
as a single CDN bundle so it works on WordPress, Shopify, Wix, Webflow, Next.js,
plain HTML, etc. (not only inside a React app).

- **Zero runtime dependencies.** Vanilla TS → single IIFE bundle.
- **No FOUC.** A tiny critical shim applies saved prefs before first paint.
- **Reversible.** Driven by `a11y-*` classes on `<html>`; reset removes them.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design.

## Develop

```bash
cd widget
npm install
npm run dev      # local playground
npm run build    # → dist/a11y.js (IIFE)
```

## Install on a host site

Paste [`snippet.html`](./snippet.html) before `</body>`, replacing `CDN_URL`
with your CDN.

## Features (identical to bugbox)

| Feature | Effect |
|---|---|
| Font size (A / A+ / A++) | 100% / 120% / 145% root scale |
| ניגודיות גבוהה (High contrast) | true black/white, yellow links |
| גווני אפור (Grayscale) | full-page desaturation |
| הדגשת קישורים (Highlight links) | blue outline + background on links |
| סמן גדול (Big cursor) | enlarged SVG pointer |
| איפוס הגדרות (Reset) | restore native state, clear storage |

Plus keyboard a11y the React original lacked: focus trap, Esc-to-close,
`aria-haspopup`/`aria-expanded`, and an `aria-live` announcer.
