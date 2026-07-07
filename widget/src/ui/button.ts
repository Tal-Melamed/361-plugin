// Component A — the floating trigger button (bugbox: black circle, ISA icon).
import { HE } from "../core/i18n";

// Wheelchair accessibility icon (ISA symbol) — ported from bugbox.
export const WHEELCHAIR_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="3.5" r="1.75"/><path d="M10 7.5v5.5l2.5 2.5H17v2h-5.2L9 14.7V7.5H10z"/><path d="M9.5 7.5H13l1.5 4H17v2h-3.5L12 9.5H9.5V7.5z"/><path d="M7 17.5A5 5 0 1 0 17 17.5" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"/></svg>`;

export function createTrigger(onToggle: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "a11y-trigger";
  btn.setAttribute("aria-haspopup", "true");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-label", HE.triggerLabel);
  btn.innerHTML = WHEELCHAIR_ICON;
  btn.addEventListener("click", onToggle);
  return btn;
}
