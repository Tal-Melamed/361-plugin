import type { SiteModules } from "./sites";

// Maestro module registry. Each module is independent and toggled per site.
// Adding a future module (AI Agent, Analytics, Forms…) = one entry here + its UI.
export type ModuleId = keyof SiteModules;

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  tagline: string;
  icon: string; // lucide icon name
  available: boolean; // false = "coming soon"
}

export const MODULES: ModuleMeta[] = [
  {
    id: "accessibility",
    name: "נגישות",
    tagline: "ווידג'ט נגישות תואם WCAG 2.1 AA ותקנות 2013",
    icon: "Accessibility",
    available: true,
  },
  {
    id: "seo",
    name: "SEO",
    tagline: "אודיט אוטומטי, יצירת sitemap/robots/llms.txt וחיבור לגוגל",
    icon: "Search",
    available: true,
  },
];

export function moduleEnabled(modules: SiteModules | undefined, id: ModuleId): boolean {
  return Boolean((modules ?? { accessibility: true, seo: false })[id]);
}
