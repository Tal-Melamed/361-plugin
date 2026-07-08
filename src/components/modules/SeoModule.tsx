import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, Copy, Download, Play } from "lucide-react";
import { toast } from "sonner";
import { runSeoAudit } from "@/lib/seoAudit";
import {
  generateRobotsTxt,
  generateSitemapXml,
  generateLlmsTxt,
  type SeoAudit,
  type CheckStatus,
} from "@/lib/seo";
import type { Site } from "@/lib/sites";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_ICON: Record<CheckStatus, typeof CheckCircle2> = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
};
const STATUS_COLOR: Record<CheckStatus, string> = {
  pass: "text-emerald-600",
  warn: "text-amber-500",
  fail: "text-red-600",
};

export function SeoModule({ site }: { site: Site }) {
  const audit = useServerFn(runSeoAudit);
  const [result, setResult] = useState<SeoAudit | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      const r = await audit({ data: { domain: site.domain } });
      setResult(r);
      if (!r.ok) toast.error("לא ניתן לגשת לאתר — בדקו את הדומיין");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה בהרצת האודיט");
    } finally {
      setRunning(false);
    }
  };

  const counts = result
    ? result.checks.reduce(
        (a, c) => ((a[c.status] = (a[c.status] ?? 0) + 1), a),
        {} as Record<CheckStatus, number>,
      )
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>אודיט SEO</CardTitle>
            <CardDescription>
              סורק את <span dir="ltr">{site.domain}</span> ובודק sitemap, robots, meta, schema ועוד.
            </CardDescription>
          </div>
          <Button onClick={run} disabled={running}>
            {running ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Play className="ml-1 h-4 w-4" />}
            {running ? "סורק…" : "הרצת אודיט"}
          </Button>
        </CardHeader>
        {result && (
          <CardContent className="space-y-3">
            {counts && (
              <div className="flex gap-4 text-sm">
                <span className="text-emerald-600">{counts.pass ?? 0} תקין</span>
                <span className="text-amber-500">{counts.warn ?? 0} לשיפור</span>
                <span className="text-red-600">{counts.fail ?? 0} בעיות</span>
              </div>
            )}
            <div className="divide-y rounded-lg border">
              {result.checks.map((c) => {
                const Icon = STATUS_ICON[c.status];
                return (
                  <div key={c.id} className="flex items-start gap-3 px-3 py-2.5">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${STATUS_COLOR[c.status]}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{c.label}</p>
                      <p dir="auto" className="text-xs text-muted-foreground">{c.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <GeneratorCard
          title="robots.txt"
          filename="robots.txt"
          description="כולל גישה לבוטים של AI + הפניה ל-sitemap."
          content={generateRobotsTxt(site.domain)}
        />
        <GeneratorCard
          title="sitemap.xml"
          filename="sitemap.xml"
          description={result ? `מבוסס על ${result.internalLinks.length} קישורים שנמצאו.` : "הריצו אודיט לגילוי עמודים."}
          content={generateSitemapXml(site.domain, result?.internalLinks ?? [])}
        />
        <GeneratorCard
          title="llms.txt"
          filename="llms.txt"
          description="נראוּת ל-ChatGPT/Claude. השלימו את הפרטים."
          content={generateLlmsTxt({ name: site.name, domain: site.domain })}
        />
      </div>
    </div>
  );
}

function GeneratorCard({
  title,
  filename,
  description,
  content,
}: {
  title: string;
  filename: string;
  description: string;
  content: string;
}) {
  const copy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success(`${title} הועתק`);
  };
  const download = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base" dir="ltr">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <pre dir="ltr" className="max-h-40 flex-1 overflow-auto rounded-lg bg-muted p-2 text-left text-[11px] leading-relaxed">
          <code>{content}</code>
        </pre>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            <Copy className="ml-1 h-3.5 w-3.5" />
            העתקה
          </Button>
          <Button variant="outline" size="sm" onClick={download}>
            <Download className="ml-1 h-3.5 w-3.5" />
            הורדה
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
