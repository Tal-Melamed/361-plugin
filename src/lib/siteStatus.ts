import { createServerFn } from "@tanstack/react-start";

export type InstallStatus = "ok" | "not-installed" | "unreachable";

// Checks connectivity: is the widget snippet present + the site reachable.
// Tries "/" then "/index.html" (some sites serve different content at each).
export const checkSiteInstall = createServerFn({ method: "POST" })
  .inputValidator((d: { domain: string; siteKey: string }) => d)
  .handler(async ({ data }): Promise<{ status: InstallStatus }> => {
    const host = data.domain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    const first = await probe(`https://${host}/`, data.siteKey);
    if (first === "ok" || first === "unreachable") return { status: first };
    // Reachable but no widget at "/": try /index.html before giving up.
    const second = await probe(`https://${host}/index.html`, data.siteKey);
    return { status: second === "ok" ? "ok" : "not-installed" };
  });

async function probe(url: string, siteKey: string): Promise<InstallStatus> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": "MaestroSEO/1.0 (+https://maestro.app)" },
    }).finally(() => clearTimeout(t));
    if (!res.ok) return "unreachable";
    const html = await res.text();
    const installed =
      html.includes(`data-site-key="${siteKey}"`) ||
      /accessibility-plugin[^"']*\/a11y\.js/.test(html) ||
      html.includes("a11y.js");
    return installed ? "ok" : "not-installed";
  } catch {
    return "unreachable";
  }
}
