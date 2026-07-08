import { createServerFn } from "@tanstack/react-start";
import type { PageContext } from "./aiTasks";

// Fetches a page and extracts the context the AI tasks need (title, description,
// headings, cleaned text). Server-side (fetch across origins).
export const scrapePage = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string; siteName: string }) => data)
  .handler(async ({ data }): Promise<PageContext> => {
    const url = normalizeUrl(data.url);
    const domain = url.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    const ctx: PageContext = {
      url,
      domain,
      siteName: data.siteName,
      title: null,
      description: null,
      headings: [],
      text: "",
    };
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 9000);
      const res = await fetch(url, {
        signal: ctrl.signal,
        redirect: "follow",
        headers: { "user-agent": "MaestroSEO/1.0 (+https://maestro.app)" },
      }).finally(() => clearTimeout(t));
      if (!res.ok) return ctx;
      const html = await res.text();

      ctx.title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
      ctx.description = metaContent(html, "description");
      ctx.headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
        .map((m) => stripTags(m[1]))
        .filter(Boolean)
        .slice(0, 20);
      ctx.text = cleanText(html);
    } catch {
      /* return partial ctx */
    }
    return ctx;
  });

function normalizeUrl(input: string): string {
  const s = input.trim();
  if (/^https?:\/\//i.test(s)) return s;
  return "https://" + s.replace(/^\/+/, "");
}
function firstMatch(s: string, re: RegExp): string | null {
  const m = s.match(re);
  return m ? stripTags(m[1]).trim() || null : null;
}
function metaContent(html: string, name: string): string | null {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (new RegExp(`name=["']${name}["']`, "i").test(m[0])) {
      const c = m[0].match(/content=["']([\s\S]*?)["']/i);
      if (c) return c[1].trim();
    }
  }
  return null;
}
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function cleanText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|[a-z]+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}
