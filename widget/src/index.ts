// Bootstrap — wires the widget together. Self-invoking IIFE entry (see
// vite.config.ts). Faithful vanilla port of the bugbox AccessibilityWidget,
// delivered as a single CDN script for any site.
import { Store } from "./core/state";
import { readConfig, readSiteKey, readAppearance, fetchRemoteConfig } from "./core/config";
import { applyToDOM } from "./features/visual";
import { applyProtection } from "./features/protection";
import { applyAppearance } from "./features/appearance";
import { buildStyles } from "./ui/styles";
import { createTrigger } from "./ui/button";
import { Panel } from "./ui/panel";

const FLAG = "__a11yWidgetLoaded";

// Capture the snippet's <script> now (currentScript is null once boot runs later).
const SCRIPT = document.currentScript as HTMLScriptElement | null;

function boot(): void {
  const w = window as unknown as Record<string, unknown>;
  if (w[FLAG]) return; // guard double-init
  w[FLAG] = true;

  // Component C: state (rehydrates from localStorage).
  const store = new Store();

  // Inject the single stylesheet.
  const style = document.createElement("style");
  style.id = "a11y-widget-styles";
  style.textContent = buildStyles();
  document.head.appendChild(style);

  // Apply persisted prefs now; the critical shim already prevented FOUC.
  applyToDOM(store.get());
  store.subscribe(applyToDOM);

  // Component A: UI.
  const root = document.createElement("div");
  root.id = "a11y-widget-root";
  const trigger = createTrigger(() => panel.toggle());
  const panel = new Panel(store, trigger);
  root.append(trigger, panel.el);
  document.body.appendChild(root);

  // Apply the snippet's data-* config instantly (protection + appearance), then
  // pull live config from the server and re-apply if it changed (no re-paste).
  const baseCfg = readConfig(SCRIPT);
  applyProtection(baseCfg);
  applyAppearance(root, readAppearance(SCRIPT));
  const siteKey = readSiteKey(SCRIPT);
  void fetchRemoteConfig(siteKey, baseCfg).then((remote) => {
    if (!remote) return;
    applyProtection(remote.protection);
    applyAppearance(root, remote.appearance); // color + position from dashboard
    panel.setStatement(remote.statement); // accessibility statement in the panel
  });

  // Minimal API for the host / dashboard.
  w["A11yWidget"] = {
    open: () => panel.show(),
    close: () => panel.close(),
    reset: () => store.reset(),
    setStatement: (s: Parameters<typeof panel.setStatement>[0]) => panel.setStatement(s),
  };
}

if (document.body) boot();
else document.addEventListener("DOMContentLoaded", boot, { once: true });
