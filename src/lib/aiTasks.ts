// AI content tasks for the SEO agent. Each task turns a scraped page into a
// ready-to-paste prompt for Claude ("AI through you" — prompt mode), and the
// same prompt feeds the API path later. Pure + client-safe.

export interface PageContext {
  url: string;
  domain: string;
  siteName: string;
  title: string | null;
  description: string | null;
  headings: string[];
  text: string; // cleaned excerpt
}

export type AiTaskId = "meta" | "schema" | "faq" | "llms";

export interface AiTask {
  id: AiTaskId;
  label: string;
  description: string;
  buildPrompt: (ctx: PageContext) => string;
}

function contextBlock(ctx: PageContext): string {
  return `אתר: ${ctx.siteName} (${ctx.domain})
כתובת העמוד: ${ctx.url}
כותרת נוכחית: ${ctx.title ?? "(אין)"}
תיאור נוכחי: ${ctx.description ?? "(אין)"}
כותרות בעמוד: ${ctx.headings.slice(0, 12).join(" | ") || "(אין)"}

תוכן העמוד (קטע):
"""
${ctx.text.slice(0, 3500)}
"""`;
}

export const AI_TASKS: AiTask[] = [
  {
    id: "meta",
    label: "Meta Title + Description",
    description: "כותרת SEO ותיאור מותאמים לעמוד",
    buildPrompt: (ctx) =>
      `אתה מומחה SEO. בהתבסס על תוכן העמוד הבא, כתוב:
1. Meta Title מיטבי (עד 60 תווים) — כולל מילת המפתח העיקרית, מושך להקלקה.
2. Meta Description (עד 155 תווים) — מסכם את העמוד ומעודד כניסה.
בשפת העמוד. החזר אך ורק את שני התגים בפורמט HTML, בלי הסבר:

${contextBlock(ctx)}

פורמט הפלט:
<title>...</title>
<meta name="description" content="...">`,
  },
  {
    id: "schema",
    label: "Schema (JSON-LD)",
    description: "סימון schema.org מובנה לעמוד",
    buildPrompt: (ctx) =>
      `אתה מומחה SEO טכני. צור סימון JSON-LD תקין ומתאים ל-schema.org עבור העמוד הזה
(בחר את הסוג המתאים ביותר: Organization / LocalBusiness / Product / Article וכו').
מלא רק שדות שאתה בטוח בהם מהתוכן; אל תמציא נתונים. החזר אך ורק בלוק אחד:

${contextBlock(ctx)}

פורמט הפלט:
<script type="application/ld+json">
{ ... }
</script>`,
  },
  {
    id: "faq",
    label: "FAQ + FAQ Schema",
    description: "שאלות ותשובות נפוצות עם סימון FAQPage",
    buildPrompt: (ctx) =>
      `אתה מומחה תוכן ו-SEO. צור 5 שאלות ותשובות נפוצות (FAQ) רלוונטיות לעסק/עמוד הזה,
בשפת העמוד, מבוססות על התוכן. לאחר מכן צור סימון JSON-LD מסוג FAQPage שמכיל אותן.
החזר: (א) רשימת השאלות והתשובות, ואז (ב) בלוק ה-JSON-LD:

${contextBlock(ctx)}`,
  },
  {
    id: "llms",
    label: "llms.txt מלא",
    description: "קובץ נראוּת ל-AI (ChatGPT/Claude/Perplexity)",
    buildPrompt: (ctx) =>
      `צור קובץ llms.txt מלא ומוכן להעלאה עבור העסק הזה, בהתבסס על תוכן האתר.
כלול: שם העסק, משפט תיאור, מה עושים, שירותים, אזור שירות, יצירת קשר, ומה מייחד.
בשפת האתר. החזר אך ורק את תוכן הקובץ (Markdown פשוט), בלי הסבר:

${contextBlock(ctx)}`,
  },
];
