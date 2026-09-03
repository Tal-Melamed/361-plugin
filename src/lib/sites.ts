import { supabase } from "./supabase";

export interface SiteFeatures {
  fontSize: boolean;
  highContrast: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
  bigCursor: boolean;
}

// Maestro modules enabled per site (see lib/modules.ts).
export interface SiteModules {
  accessibility: boolean;
  seo: boolean;
}

export const DEFAULT_MODULES: SiteModules = { accessibility: true, seo: false };

// Site-owner widget behaviors enforced on the visitor's page (via snippet data-*).
export interface SiteProtection {
  protectMedia: boolean; // block image/media drag + right-click
  disableTextSelection: boolean; // prevent selecting page text
  removeTapHighlight: boolean; // strip the mobile tap-highlight color
  disableLinkLongPress: boolean; // no long-press preview menu on links
  preventCopy: boolean; // block copying page text
  preventPrint: boolean; // blank the page when printed
}

export const DEFAULT_PROTECTION: SiteProtection = {
  protectMedia: true,
  disableTextSelection: false,
  removeTapHighlight: true,
  disableLinkLongPress: true,
  preventCopy: false,
  preventPrint: false,
};

export interface Site {
  id: string;
  owner_id: string;
  name: string;
  domain: string;
  site_key: string;
  accent: string;
  position: "bottom-left" | "bottom-right";
  features: SiteFeatures;
  modules: SiteModules;
  protection: SiteProtection;
  statement_url: string | null;
  coordinator_name: string | null;
  coordinator_email: string | null;
  coordinator_phone: string | null;
  created_at: string;
}

export const DEFAULT_FEATURES: SiteFeatures = {
  fontSize: true,
  highContrast: true,
  grayscale: true,
  highlightLinks: true,
  bigCursor: true,
};

// Where the widget bundle is served from. Update once your CDN/tag is live.
export const CDN_URL =
  "https://cdn.jsdelivr.net/gh/Tal-Melamed/accessibility-plugin@main/widget/dist/a11y.js";

export function buildSnippet(site: Site): string {
  const p = { ...DEFAULT_PROTECTION, ...site.protection };
  const b = (v: boolean) => (v ? "1" : "0");
  const attrs = [
    `data-protect-media="${b(p.protectMedia)}"`,
    `data-no-text-select="${b(p.disableTextSelection)}"`,
    `data-tap-highlight="${b(p.removeTapHighlight)}"`,
    `data-no-link-preview="${b(p.disableLinkLongPress)}"`,
    `data-no-copy="${b(p.preventCopy)}"`,
    `data-no-print="${b(p.preventPrint)}"`,
  ].join(" ");
  const appearance = `data-position="${site.position}" data-accent="${site.accent}"`;
  return `<script src="${CDN_URL}" data-a11y data-site-key="${site.site_key}" ${appearance} ${attrs} async defer></script>`;
}

function db() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export async function listSites(): Promise<Site[]> {
  const { data, error } = await db()
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Site[];
}

export async function getSite(id: string): Promise<Site> {
  const { data, error } = await db().from("sites").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Site;
}

export async function createSite(input: { name: string; domain: string; owner_id: string }): Promise<Site> {
  const { data, error } = await db()
    .from("sites")
    .insert({ name: input.name, domain: input.domain, owner_id: input.owner_id })
    .select("*")
    .single();
  if (error) throw error;
  return data as Site;
}

export async function updateSite(id: string, patch: Partial<Site>): Promise<Site> {
  const { data, error } = await db().from("sites").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as Site;
}

export async function deleteSite(id: string): Promise<void> {
  const { error } = await db().from("sites").delete().eq("id", id);
  if (error) throw error;
}
