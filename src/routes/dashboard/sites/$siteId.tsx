import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Trash2, Accessibility, Search } from "lucide-react";
import { toast } from "sonner";
import { getSite, updateSite, deleteSite, DEFAULT_MODULES, type Site, type SiteModules } from "@/lib/sites";
import { MODULES, type ModuleId } from "@/lib/modules";
import { DashboardShell } from "@/components/DashboardShell";
import { AccessibilityModule } from "@/components/modules/AccessibilityModule";
import { SeoModule } from "@/components/modules/SeoModule";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const MODULE_ICON = { accessibility: Accessibility, seo: Search };

function SiteDetail() {
  const { siteId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: site, isLoading } = useQuery({
    queryKey: ["site", siteId],
    queryFn: () => getSite(siteId),
  });

  const setModules = useMutation({
    mutationFn: (modules: SiteModules) => updateSite(siteId, { modules }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site", siteId] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "שגיאה — ודאו שהרצתם את מיגרציה 0002"),
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

  if (isLoading || !site) return <p className="text-muted-foreground">טוען…</p>;

  const modules = site.modules ?? DEFAULT_MODULES;
  const toggle = (id: ModuleId, on: boolean) => setModules.mutate({ ...modules, [id]: on });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link to="/dashboard">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <p dir="ltr" className="text-right text-sm text-muted-foreground">{site.domain}</p>
        </div>
      </div>

      <Tabs defaultValue="accessibility">
        <TabsList>
          {MODULES.map((m) => {
            const Icon = MODULE_ICON[m.id];
            return (
              <TabsTrigger key={m.id} value={m.id} className="gap-1.5">
                <Icon className="h-4 w-4" />
                {m.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {MODULES.map((m) => {
          const enabled = Boolean(modules[m.id]);
          const Body = m.id === "accessibility" ? AccessibilityModule : SeoModule;
          return (
            <TabsContent key={m.id} value={m.id} className="space-y-6 pt-4">
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                <div>
                  <p className="font-medium">מודול {m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.tagline}</p>
                </div>
                <Switch checked={enabled} onCheckedChange={(v) => toggle(m.id, v)} />
              </div>
              {enabled ? (
                <Body site={site} />
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-10 text-center text-muted-foreground">
                    המודול כבוי. הפעילו אותו כדי להגדיר אותו לאתר הזה.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

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
                <AlertDialogTitle>למחוק את "{site.name}"?</AlertDialogTitle>
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
