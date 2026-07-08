import { createServerFn } from "@tanstack/react-start";
import type { SeoAudit, SeoCheck } from "./seo";

// Runs on the server (nitro/Cloudflare) so it can fetch arbitrary origins.
export const runSeoAudit = createServerFn({ method: "POST" })
  .inputValidator((data: { domain: string }) => data)
  .handler(async ({ data }): Promise<SeoAudit> => {
    const host = normalizeHost(data.domain);
    const base = `https://${host}`;
    const checks: SeoCheck[] = [];
    const internalLinks: string[] = [];

    let html = "";
    let reachable = false;
    try {
      const res = await fetchWithTimeout(base + "/", 8000);
      reachable = res.ok;
      if (res.ok) html = await res.text();
      checks.push({
        id: "reachable",
        label: "דף הבית נטען",
        status: res.ok ? "pass" : "fail",
        detail: res.ok ? `סטטוס ${res.status}` : `סטטוס ${res.status}`,
      });
    } catch (e) {
      return {
        domain: host,
        url: base,
        ok: false,
        checks: [
          { id: "reachable", label: "דף הבית נטען", status: "fail", detail: "לא ניתן לגשת לאתר" },
        ],
        internalLinks: [],
        error: e instanceof Error ? e.message : "fetch failed",
      };
    }

    // --- On-page checks (regex over the homepage HTML) ---
    const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    checks.push(
      title
        ? {
            id: "title",
            label: "תג כותרת (title)",
            status: title.length >= 10 && title.length <= 65 ? "pass" : "warn",
            detail: `${title.length} תווים: "${truncate(title, 60)}"`,
          }
        : { id: "title", label: "תג כותרת (title)", status: "fail", detail: "חסר" },
    );

    const desc = matchMeta(html, "description");
    checks.push(
      desc
        ? {
            id: "description",
            label: "מטא תיאור (description)",
            status: desc.length >= 50 && desc.length <= 160 ? "pass" : "warn",
            detail: `${desc.length} תווים`,
          }
        : { id: "description", label: "מטא תיאור (description)", status: "fail", detail: "חסר" },
    );

    pushBool(checks, "viewport", "תג viewport (מובייל)", /<meta[^>]+name=["']viewport["']/i.test(html));
    pushBool(checks, "canonical", "קישור canonical", /<link[^>]+rel=["']canonical["']/i.test(html));
    pushBool(checks, "og", "תגי Open Graph (שיתוף)", /<meta[^>]+property=["']og:(title|image)["']/i.test(html));

    const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
    checks.push({
      id: "h1",
      label: "כותרת H1",
      status: h1Count === 1 ? "pass" : h1Count === 0 ? "fail" : "warn",
      detail: h1Count === 1 ? "כותרת אחת (מומלץ)" : `${h1Count} כותרות H1`,
    });

    const hasSchema = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
    pushBool(checks, "schema", "Schema (JSON-LD)", hasSchema, "נמצא schema מובנה", "אין schema מובנה — מומלץ להוסיף");

    // --- Discover same-origin links (for sitemap generation) ---
    for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
      const u = toAbsolute(m[1], base);
      if (u && u.startsWith(base) && !internalLinks.includes(u)) internalLinks.push(u);
      if (internalLinks.length >= 200) break;
    }

    // --- Sibling files ---
    const robots = await fetchText(base + "/robots.txt");
    if (robots.ok) {
      const hasSitemap = /sitemap:/i.test(robots.body);
      checks.push({
        id: "robots",
        label: "robots.txt",
        status: hasSitemap ? "pass" : "warn",
        detail: hasSitemap ? "קיים ומצביע ל-sitemap" : "קיים אך לא מפנה ל-sitemap",
      });
    } else {
      checks.push({ id: "robots", label: "robots.txt", status: "fail", detail: "לא קיים" });
    }

    const sitemap = await fetchText(base + "/sitemap.xml");
    pushBool(
      checks,
      "sitemap",
      "sitemap.xml",
      sitemap.ok && /<(urlset|sitemapindex)/i.test(sitemap.body),
      "קיים ותקין",
      "לא קיים — אפשר ליצור למטה",
    );

    const llms = await fetchText(base + "/llms.txt");
    pushBool(
      checks,
      "llms",
      "llms.txt (נראוּת ל-AI)",
      llms.ok,
      "קיים",
      "לא קיים — מומלץ ליצור (נראוּת ב-ChatGPT/Claude)",
    );

    return { domain: host, url: base, ok: reachable, checks, internalLinks };
  });

function normalizeHost(input: string): string {
  let s = input.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  s = s.replace(/^www\./i, "");
  return s;
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": "MaestroSEO/1.0 (+https://maestro.app)" },
    });
  } finally {
    clearTimeout(t);
  }
}

async function fetchText(url: string): Promise<{ ok: boolean; body: string }> {
  try {
    const res = await fetchWithTimeout(url, 6000);
    if (!res.ok) return { ok: false, body: "" };
    return { ok: true, body: await res.text() };
  } catch {
    return { ok: false, body: "" };
  }
}

function match(s: string, re: RegExp): string | null {
  const m = s.match(re);
  return m ? m[1].trim() : null;
}

// Finds <meta name="X" content="Y"> regardless of attribute order.
function matchMeta(html: string, name: string): string | null {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    if (new RegExp(`name=["']${name}["']`, "i").test(tag)) {
      const c = tag.match(/content=["']([\s\S]*?)["']/i);
      if (c) return c[1].trim();
    }
  }
  return null;
}

function toAbsolute(href: string, base: string): string | null {
  try {
    if (href.startsWith("http")) return href.split("?")[0];
    if (href.startsWith("/")) return base + href.split("?")[0];
    return null;
  } catch {
    return null;
  }
}

function pushBool(
  checks: SeoCheck[],
  id: string,
  label: string,
  ok: boolean,
  passDetail = "קיים",
  failDetail = "חסר",
): void {
  checks.push({ id, label, status: ok ? "pass" : "fail", detail: ok ? passDetail : failDetail });
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
