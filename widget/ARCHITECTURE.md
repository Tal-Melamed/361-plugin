# Accessibility Widget — Architecture

A self-contained, platform-agnostic accessibility widget (תוסף נגישות) for the
Israeli market. Ships as a single async `<script>` that injects a floating
Hebrew/RTL control panel. This is a **faithful vanilla-TS port of the bugbox
`AccessibilityWidget`** — same design, same features, same CSS effects — repackaged
so it can be dropped onto *any* site via one CDN snippet (not just a React app).

> Pure client-side. Zero runtime dependencies. No backend required.

---

## 1. High-level workflow

```
   Host page <head>      ┌──────────────────────────────────────────┐
   (snippet)             │  CRITICAL SHIM (inline, ~0.4kb, blocking) │
                         │  reads localStorage["bugbox_a11y"] →      │
                         │  adds a11y-* classes + font var on <html> │
                         │  → paint happens with prefs applied, NO FOUC
                         └────────────────────┬─────────────────────┘
   Host page, async ────►┌────────────────────▼─────────────────────┐
                         │  MAIN BUNDLE (a11y.js, IIFE)               │
                         └───────┬───────────────────────┬──────────┘
                                 │                        │
                     ┌───────────▼─────────┐   ┌──────────▼───────────┐
                     │ STATE (Store)        │   │ UI (button + panel)  │
                     │ load/get/update/     │◄──┤ toggles call         │
                     │ reset/subscribe      │   │ store.update(...)     │
                     │ ↳ localStorage       │   └──────────────────────┘
                     └───────────┬─────────┘
                                 │ notify
                     ┌───────────▼─────────┐
                     │ FEATURES (applyToDOM)│
                     │ toggles a11y-* CLASSES on <html> + --a11y-font-scale
                     │ CSS does the visual work (fully reversible)
                     └─────────────────────┘
```

**Single source of truth.** `Store` holds the prefs; every control writes through
`store.update()`, which persists to `localStorage` and notifies subscribers.
`applyToDOM` (features) and the panel's `sync()` (UI) both subscribe. Reset clears
storage + strips the classes → the host site returns to its native CSS instantly.

Why classes on `<html>` + CSS (not inline-styling nodes)?
- **Reversible:** reset = remove classes / clear the font var.
- **Cheap & SPA-safe:** one class re-themes the whole page via the cascade;
  new DOM nodes inherit the active theme automatically.

This mirrors bugbox exactly: `a11y-high-contrast`, `a11y-grayscale`,
`a11y-highlight-links`, `a11y-big-cursor`, and `--a11y-font-scale`.

---

## 2. Module map

| Module | Responsibility |
|---|---|
| `src/index.ts` | Bootstrap: guard double-init, inject styles, mount state + UI. |
| `src/core/state.ts` | Store: load/get/update/reset/subscribe → `localStorage["bugbox_a11y"]`. |
| `src/core/i18n.ts` | Hebrew strings (matching bugbox labels). |
| `src/features/visual.ts` | Maps state → `a11y-*` classes + font var on `<html>`. |
| `src/ui/styles.ts` | The single injected stylesheet: dark panel chrome + the exact bugbox feature CSS. |
| `src/ui/button.ts` | Floating trigger (black circle, ISA wheelchair icon). |
| `src/ui/panel.ts` | RTL panel: font-size buttons + toggle rows + reset; focus trap, Esc, ARIA. |

---

## Features (identical to bugbox)

- **Font size** — 3 levels: 100% / 120% / 145% (root `--a11y-font-scale`).
- **High contrast** — true black/white, yellow links & buttons.
- **Grayscale** — full-page desaturation.
- **Highlight links** — blue outline + background on `<a>`.
- **Big cursor** — enlarged SVG pointer.
- **Reset** — restores native state, clears storage.

### Enhancements over the React original
The port keeps the design 1:1 but adds accessibility the widget itself needs to
be usable by keyboard/SR users: **focus trap**, **Esc-to-close**,
`aria-haspopup`/`aria-expanded`, and an `aria-live` region announcing changes.

## Build & delivery

- **Bundle:** Vite lib build → single **IIFE** `dist/a11y.js`, no deps, no globals
  leaked beyond `window.A11yWidget`.
- **CDN:** serve `a11y.js` from a real CDN (jsDelivr-on-GitHub-tag to start).
- **Snippet:** see `snippet.html` — the blocking critical shim (FOUC guard) plus
  the async main bundle.
