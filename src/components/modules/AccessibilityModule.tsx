import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { updateSite, buildSnippet, DEFAULT_FEATURES, type Site, type SiteFeatures } from "@/lib/sites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FEATURE_LABELS: { key: keyof SiteFeatures; label: string }[] = [
  { key: "fontSize", label: "גודל גופן" },
  { key: "highContrast", label: "ניגודיות גבוהה" },
  { key: "grayscale", label: "גווני אפור" },
  { key: "highlightLinks", label: "הדגשת קישורים" },
  { key: "bigCursor", label: "סמן גדול" },
];

export function AccessibilityModule({ site }: { site: Site }) {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<Site>(site);

  useEffect(() => {
    setForm({ ...site, features: { ...DEFAULT_FEATURES, ...site.features } });
  }, [site]);

  const save = useMutation({
    mutationFn: (patch: Partial<Site>) => updateSite(site.id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site", site.id] });
      qc.invalidateQueries({ queryKey: ["sites"] });
      toast.success("נשמר");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "שגיאה בשמירה"),
  });

  const snippet = buildSnippet(form);
  const set = <K extends keyof Site>(key: K, value: Site[K]) => setForm({ ...form, [key]: value });
  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
          {save.isPending ? "שומר…" : "שמירת שינויים"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>קוד התקנה</CardTitle>
          <CardDescription>הדביקו לפני תג ה-<code>&lt;/body&gt;</code> בכל עמוד באתר.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre dir="ltr" className="overflow-x-auto rounded-lg bg-muted p-3 text-left text-xs">
            <code>{snippet}</code>
          </pre>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="ml-1 h-4 w-4" /> : <Copy className="ml-1 h-4 w-4" />}
            {copied ? "הועתק" : "העתקת הקוד"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>הגדרות הווידג'ט</CardTitle>
          <CardDescription>מיקום, צבע והפיצ'רים שיוצגו למשתמשים.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>מיקום הכפתור</Label>
              <Select value={form.position} onValueChange={(v) => set("position", v as Site["position"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-left">שמאל למטה</SelectItem>
                  <SelectItem value="bottom-right">ימין למטה</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accent">צבע הכפתור</Label>
              <div className="flex items-center gap-2">
                <input
                  id="accent"
                  type="color"
                  value={form.accent}
                  onChange={(e) => set("accent", e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border"
                />
                <Input dir="ltr" value={form.accent} onChange={(e) => set("accent", e.target.value)} className="w-32" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>פיצ'רים פעילים</Label>
            <div className="divide-y rounded-lg border">
              {FEATURE_LABELS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={form.features[key]}
                    onCheckedChange={(v) => set("features", { ...form.features, [key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>הצהרת נגישות ורכז נגישות</CardTitle>
          <CardDescription>נדרש לפי תקנות שוויון זכויות לאנשים עם מוגבלות, 2013.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="statement">קישור להצהרת נגישות</Label>
            <Input
              id="statement"
              dir="ltr"
              value={form.statement_url ?? ""}
              onChange={(e) => set("statement_url", e.target.value)}
              placeholder="https://example.co.il/accessibility"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coord-name">שם רכז הנגישות</Label>
            <Input id="coord-name" value={form.coordinator_name ?? ""} onChange={(e) => set("coordinator_name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coord-email">דוא"ל הרכז</Label>
            <Input id="coord-email" dir="ltr" value={form.coordinator_email ?? ""} onChange={(e) => set("coordinator_email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coord-phone">טלפון הרכז</Label>
            <Input id="coord-phone" dir="ltr" value={form.coordinator_phone ?? ""} onChange={(e) => set("coordinator_phone", e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
