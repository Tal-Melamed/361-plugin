// Component A — the control panel. Faithful vanilla port of the bugbox panel
// (font-size buttons + toggle rows + reset), wired with event delegation and
// synced to the Store. Adds keyboard a11y the React original lacked: focus
// trap, Esc-to-close, aria-live announcements.
import { HE } from "../core/i18n";
import { Store, type A11yState } from "../core/state";
import { A11Y_ICON } from "./button";

const CLOSE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
const RESET_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>`;

const FONT_BTNS = [
  { lvl: 0, label: "A", size: "13px" },
  { lvl: 1, label: "A+", size: "16px" },
  { lvl: 2, label: "A++", size: "20px" },
];

const TOGGLES: { key: keyof A11yState; label: string; icon: string }[] = [
  { key: "highContrast", label: HE.highContrast, icon: "◑" },
  { key: "grayscale", label: HE.grayscale, icon: "◐" },
  { key: "highlightLinks", label: HE.highlightLinks, icon: "🔗" },
  { key: "bigCursor", label: HE.bigCursor, icon: "↖" },
];

export class Panel {
  readonly el: HTMLDivElement;
  private live: HTMLElement;
  private open = false;
  private lastFocus: HTMLElement | null = null;

  constructor(
    private store: Store,
    private trigger: HTMLElement,
  ) {
    this.el = document.createElement("div");
    this.el.className = "a11y-panel";
    this.el.setAttribute("role", "dialog");
    this.el.setAttribute("aria-modal", "true");
    this.el.setAttribute("aria-label", HE.panelTitle);
    this.el.setAttribute("data-open", "false");
    this.el.innerHTML = this.render();
    this.live = this.el.querySelector(".a11y-live")!;

    this.el.addEventListener("click", this.onClick);
    this.el.addEventListener("keydown", this.onKeydown);

    this.store.subscribe((s) => this.sync(s));
    this.sync(this.store.get());
  }

  private render(): string {
    const fontBtns = FONT_BTNS.map(
      (b) =>
        `<button type="button" class="a11y-font-btn" data-act="font" data-lvl="${b.lvl}" style="font-size:${b.size}" aria-pressed="false">${b.label}</button>`,
    ).join("");

    const toggles = TOGGLES.map(
      (t) => `
      <button type="button" class="a11y-toggle" data-act="toggle" data-key="${String(t.key)}" aria-pressed="false">
        <span class="a11y-toggle-label"><span aria-hidden="true">${t.icon}</span><span>${t.label}</span></span>
        <span class="a11y-switch" aria-hidden="true"></span>
      </button>`,
    ).join("");

    return `
      <div class="a11y-header">
        <span class="a11y-header-title">${A11Y_ICON}<span>${HE.panelTitle}</span></span>
        <button type="button" class="a11y-close" data-act="close" aria-label="${HE.close}">${CLOSE_ICON}</button>
      </div>
      <div class="a11y-body">
        <div>
          <p class="a11y-section-label">${HE.fontSizeGroup}</p>
          <div class="a11y-font-row">${fontBtns}</div>
        </div>
        ${toggles}
        <button type="button" class="a11y-reset" data-act="reset">${RESET_ICON}<span>${HE.reset}</span></button>
        <div class="a11y-sr-only a11y-live" role="status" aria-live="polite"></div>
      </div>
    `;
  }

  private onClick = (e: MouseEvent): void => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
    if (!t) return;
    const s = this.store.get();
    switch (t.dataset.act) {
      case "close":
        this.close();
        break;
      case "font":
        this.store.update({ fontSize: Number(t.dataset.lvl) });
        break;
      case "toggle": {
        const key = t.dataset.key as keyof A11yState;
        const next = !s[key];
        this.store.update({ [key]: next });
        this.announce(next ? HE.on : HE.off);
        break;
      }
      case "reset":
        this.store.reset();
        this.announce(HE.resetDone);
        break;
    }
  };

  private onKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      this.close();
      return;
    }
    if (e.key !== "Tab") return;
    const f = this.focusable();
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  private focusable(): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>("button")).filter(
      (el) => el.offsetParent !== null,
    );
  }

  private sync(s: Readonly<A11yState>): void {
    this.el.querySelectorAll<HTMLElement>("[data-act='font']").forEach((b) => {
      b.setAttribute("aria-pressed", String(Number(b.dataset.lvl) === s.fontSize));
    });
    this.el.querySelectorAll<HTMLElement>("[data-act='toggle']").forEach((b) => {
      b.setAttribute("aria-pressed", String(Boolean(s[b.dataset.key as keyof A11yState])));
    });
  }

  private announce(msg: string): void {
    this.live.textContent = "";
    window.requestAnimationFrame(() => (this.live.textContent = msg));
  }

  toggle(): void {
    this.open ? this.close() : this.show();
  }

  show(): void {
    this.open = true;
    this.lastFocus = document.activeElement as HTMLElement;
    this.el.setAttribute("data-open", "true");
    this.trigger.setAttribute("aria-expanded", "true");
    this.focusable()[0]?.focus();
  }

  close(): void {
    this.open = false;
    this.el.setAttribute("data-open", "false");
    this.trigger.setAttribute("aria-expanded", "false");
    this.lastFocus?.focus?.();
  }
}
