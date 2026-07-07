import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Copy, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getSite,
  updateSite,
  deleteSite,
  buildSnippet,
  DEFAULT_FEATURES,
  type Site,
  type SiteFeatures,
} from "@/lib/sites";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/dashboard/sites/$siteId")({
  component: () => (
    <DashboardShell>
      <SiteDetail />
    </DashboardShell>
  ),
});

const FEATURE_LABELS: { key: keyof SiteFeatures; label: string }[] = [
  { key: "fontSize", label: "גודל גופן" },
  { key: "highContrast", label: "ניגודיות גבוהה" },
  { key: "grayscale", label: "גווני אפור" },
  { key: "highlightLinks", label: "הדגשת קישורים" },
  { key: "bigCursor", label: "סמן גדול" },
];

function SiteDetail() {
  const { siteId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<Site | null>(null);

  const { data: site, isLoading } = useQuery({
    queryKey: ["site", siteId],
    queryFn: () => getSite(siteId),
  });

  useEffect(() => {
    if (site) setForm({ ...site, features: { ...DEFAULT_FEATURES, ...site.features } });
  }, [site]);

  const save = useMutation({
    mutationFn: (patch: Partial<Site>) => updateSite(siteId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site", siteId] });
      qc.invalidateQueries({ queryKey: ["sites"] });
      toast.success("נשמר");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "שגיאה בשמירה"),
  });

  const remove = useMutation({
    mutationFn: () => deleteSite(siteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      toast.success("האתר נמחק");
      navigate({ to: "/dashboard" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "שגיאה במחיקה"),
  });

  if (isLoading || !form) return <p className="text-muted-foreground">טוען…</p>;

  const snippet = buildSnippet(form);

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const set = <K extends keyof Site>(key: K, value: Site[K]) => setForm({ ...form, [key]: value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link to="/dashboard">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{form.name}</h1>
            <p dir="ltr" className="text-right text-sm text-muted-foreground">{form.domain}</p>
          </div>
        </div>
        <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
          {save.isPending ? "שומר…" : "שמירת שינויים"}
        </Button>
      </div>

      {/* Install snippet */}
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

      {/* Widget config */}
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

      {/* Accessibility statement (legally required in Israel) */}
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

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">מחיקת אתר</CardTitle>
          <CardDescription>הפעולה בלתי הפיכה ותסיר את כל ההגדרות.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="ml-1 h-4 w-4" />
                מחיקת האתר
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>למחוק את "{form.name}"?</AlertDialogTitle>
                <AlertDialogDescription>לא ניתן לשחזר. קוד ההתקנה יפסיק לעבוד.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction onClick={() => remove.mutate()}>מחיקה</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
