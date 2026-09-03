// Per-site widget config. Two sources, applied in order:
//  1. The install snippet's data-* attributes — instant, offline-safe default.
//  2. Live config from the server (by site-key) — lets the owner change settings
//     in the dashboard and have sites update without re-copying the snippet.

export interface WidgetConfig {
  protectMedia: boolean; // block image/media drag + right-click. Default ON.
  disableTextSelection: boolean; // prevent selecting page text. Default OFF.
  removeTapHighlight: boolean; // strip the mobile tap-highlight color. Default ON.
  disableLinkLongPress: boolean; // no long-press preview menu on links. Default ON.
  preventCopy: boolean; // block copying page text (Ctrl+C). Default OFF.
  preventPrint: boolean; // blank the page when printed. Default OFF.
}

// Public Supabase project (anon key is public by design; RLS + a config-only RPC
// mean anon can read nothing but each site's widget config).
const SUPABASE_URL = "https://nblbeaawytyuxgfoixlj.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibGJlYWF3eXR5dXhnZm9peGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDQ1NTcsImV4cCI6MjA5OTAyMDU1N30.ZHVeYpEBf2tUpS1iz30YXjVierROAgqrHJG5zHSmyJo";

export function readConfig(script: HTMLScriptElement | null): WidgetConfig {
  const d = script?.dataset ?? ({} as DOMStringMap);
  return {
    // Absent → default. Explicit "0"/"1" from the snippet wins.
    protectMedia: d.protectMedia !== "0",
    disableTextSelection: d.noTextSelect === "1",
    removeTapHighlight: d.tapHighlight !== "0",
    disableLinkLongPress: d.noLinkPreview !== "0",
    preventCopy: d.noCopy === "1",
    preventPrint: d.noPrint === "1",
  };
}

export function readSiteKey(script: HTMLScriptElement | null): string {
  return script?.dataset.siteKey ?? "";
}

// Accessibility statement + coordinator contact (legally required in Israel),
// shown inside the panel. All optional.
export interface StatementInfo {
  url: string | null;
  coordinatorName: string | null;
  coordinatorPhone: string | null;
  coordinatorEmail: string | null;
}

export interface RemoteConfig {
  protection: WidgetConfig;
  statement: StatementInfo;
}

// Fetches live config for this site: merges protection over the data-* base and
// pulls the accessibility statement. Never throws; returns null on any failure.
export async function fetchRemoteConfig(
  siteKey: string,
  base: WidgetConfig,
): Promise<RemoteConfig | null> {
  if (!siteKey) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_widget_config`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON,
        authorization: `Bearer ${SUPABASE_ANON}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ p_site_key: siteKey }),
    });
    if (!res.ok) return null;
    const cfg = (await res.json()) as {
      protection?: Partial<WidgetConfig>;
      statement_url?: string | null;
      coordinator_name?: string | null;
      coordinator_phone?: string | null;
      coordinator_email?: string | null;
    } | null;
    if (!cfg) return null;
    return {
      protection: { ...base, ...(cfg.protection ?? {}) },
      statement: {
        url: cfg.statement_url ?? null,
        coordinatorName: cfg.coordinator_name ?? null,
        coordinatorPhone: cfg.coordinator_phone ?? null,
        coordinatorEmail: cfg.coordinator_email ?? null,
      },
    };
  } catch {
    return null;
  }
}
