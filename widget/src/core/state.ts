// Component C — State management & persistence.
// Faithful port of the bugbox AccessibilityWidget model. Single source of
// truth for user prefs, persisted to localStorage per host.

export interface A11yState {
  fontSize: number; // 0 = normal, 1 = medium (120%), 2 = large (145%)
  highContrast: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
  bigCursor: boolean;
}

export const DEFAULT: A11yState = {
  fontSize: 0,
  highContrast: false,
  grayscale: false,
  highlightLinks: false,
  bigCursor: false,
};

// Matches the critical shim in snippet.html.
export const STORAGE_KEY = "bugbox_a11y";
export const FONT_SIZES = ["100%", "120%", "145%"] as const;

type Listener = (s: Readonly<A11yState>) => void;

export class Store {
  private state: A11yState;
  private listeners = new Set<Listener>();

  constructor() {
    this.state = this.load();
  }

  private load(): A11yState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<A11yState>) } : { ...DEFAULT };
    } catch {
      return { ...DEFAULT };
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* storage disabled — still applies for this session */
    }
  }

  get(): Readonly<A11yState> {
    return this.state;
  }

  update(patch: Partial<A11yState>): void {
    this.state = { ...this.state, ...patch };
    this.persist();
    this.emit();
  }

  reset(): void {
    this.state = { ...DEFAULT };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    this.emit();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn(this.state);
  }
}
