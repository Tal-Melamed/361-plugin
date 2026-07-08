import { createServerFn } from "@tanstack/react-start";

// API mode (scaffold): runs a prompt through Claude on the server. Inert until
// an ANTHROPIC_API_KEY server secret is set — until then the UI uses prompt mode
// ("AI through you"). Uses Haiku 4.5 (cheapest, chosen for short SEO text).
// Raw fetch (no SDK dep) keeps the bundle lean while the API path is optional.
export interface AiGenResult {
  ok: boolean;
  text?: string;
  notConfigured?: boolean;
  error?: string;
}

export const generateWithClaude = createServerFn({ method: "POST" })
  .inputValidator((data: { prompt: string }) => data)
  .handler(async ({ data }): Promise<AiGenResult> => {
    const key = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
      ?.env?.ANTHROPIC_API_KEY;
    if (!key) return { ok: false, notConfigured: true };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 1024,
          messages: [{ role: "user", content: data.prompt }],
        }),
      });
      if (!res.ok) return { ok: false, error: `Anthropic ${res.status}` };
      const json = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = (json.content ?? [])
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("")
        .trim();
      return { ok: true, text };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "request failed" };
    }
  });
