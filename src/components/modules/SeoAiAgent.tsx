import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Copy, Download, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { scrapePage } from "@/lib/aiScrape";
import { generateWithClaude } from "@/lib/aiGenerate";
import { AI_TASKS, type AiTaskId } from "@/lib/aiTasks";
import type { Site } from "@/lib/sites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SeoAiAgent({ site }: { site: Site }) {
  const scrape = useServerFn(scrapePage);
  const generate = useServerFn(generateWithClaude);
  const [taskId, setTaskId] = useState<AiTaskId>("meta");
  const [url, setUrl] = useState(`https://${site.domain}/`);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState<"" | "prompt" | "auto">("");

  const task = AI_TASKS.find((t) => t.id === taskId)!;

  const buildPrompt = async () => {
    setBusy("prompt");
    setPrompt("");
    setResult("");
    try {
      const ctx = await scrape({ data: { url, siteName: site.name } });
      setPrompt(task.buildPrompt(ctx));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה בסריקת העמוד");
    } finally {
      setBusy("");
    }
  };

  const autoGenerate = async () => {
    if (!prompt) {
      toast.error("קודם הכינו את הפרומפט");
      return;
    }
    setBusy("auto");
    try {
      const r = await generate({ data: { prompt } });
      if (r.notConfigured) {
        toast.info("מצב אוטומטי דורש מפתח Anthropic. בינתיים — העתיקו את הפרומפט ל-Claude.");
      } else if (r.ok && r.text) {
        setResult(r.text);
        toast.success("נוצר אוטומטית");
      } else {
        toast.error(r.error ?? "שגיאה ביצירה");
      }
    } finally {
      setBusy("");
    }
  };

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} הועתק`);
  };
  const download = (text: string, name: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          סוכן תוכן AI
        </CardTitle>
        <CardDescription>
          Claude מייצר עבורכם Meta Tags, Schema, FAQ ו-llms.txt. כרגע דרך Claude שלכם (בלי מפתח/עלות) —
          מעתיקים את הפרומפט, מריצים, ומדביקים את התוצאה. שום שינוי לא מתבצע באתר אוטומטית.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {AI_TASKS.map((t) => (
            <Button
              key={t.id}
              variant={t.id === taskId ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setTaskId(t.id);
                setPrompt("");
                setResult("");
              }}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{task.description}</p>

        <div className="space-y-1.5">
          <Label htmlFor="ai-url">כתובת העמוד לניתוח</Label>
          <div className="flex gap-2">
            <Input id="ai-url" dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Button onClick={buildPrompt} disabled={busy !== ""} className="shrink-0">
              {busy === "prompt" ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Wand2 className="ml-1 h-4 w-4" />}
              הכנת משימה
            </Button>
          </div>
        </div>

        {prompt && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>1. הפרומפט ל-Claude</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copy(prompt, "הפרומפט")}>
                  <Copy className="ml-1 h-3.5 w-3.5" />
                  העתקה
                </Button>
                <Button variant="outline" size="sm" onClick={autoGenerate} disabled={busy !== ""}>
                  {busy === "auto" ? <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="ml-1 h-3.5 w-3.5" />}
                  צור אוטומטית
                </Button>
              </div>
            </div>
            <Textarea dir="ltr" value={prompt} readOnly className="h-40 text-left text-xs" />
            <p className="text-xs text-muted-foreground">
              העתיקו והדביקו ל-Claude, ואז הדביקו את התשובה למטה.
            </p>
          </div>
        )}

        {prompt && (
          <div className="space-y-2">
            <Label htmlFor="ai-result">2. תשובת Claude</Label>
            <Textarea
              id="ai-result"
              dir="ltr"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="הדביקו כאן את מה ש-Claude החזיר…"
              className="h-32 text-left text-xs"
            />
            {result && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copy(result, "התוצאה")}>
                  <Copy className="ml-1 h-3.5 w-3.5" />
                  העתקה
                </Button>
                <Button variant="outline" size="sm" onClick={() => download(result, `${task.id}.txt`)}>
                  <Download className="ml-1 h-3.5 w-3.5" />
                  הורדה
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
