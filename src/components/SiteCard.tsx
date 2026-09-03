import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MoreVertical, Trash2, RotateCcw, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { deleteSite, updateSite, DEFAULT_FEATURES, DEFAULT_PROTECTION, type Site } from "@/lib/sites";
import { checkSiteInstall, type InstallStatus } from "@/lib/siteStatus";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUS: Record<InstallStatus, { label: string; dot: string; text: string }> = {
  ok: { label: "תקין", dot: "bg-emerald-500", text: "text-emerald-600" },
  "not-installed": { label: "לא מותקן", dot: "bg-amber-500", text: "text-amber-600" },
  unreachable: { label: "לא זמין", dot: "bg-red-500", text: "text-red-600" },
};

export function SiteCard({ site }: { site: Site }) {
  const qc = useQueryClient();
  const check = useServerFn(checkSiteInstall);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Primary signal: the widget's heartbeat (last_seen, stamped by the config RPC).
  // Seen in the last 7 days → definitely live, no network check needed.
  const seenRecently = !!site.last_seen && Date.now() - Date.parse(site.last_seen) < 7 * 86_400_000;

  // Fallback for sites not seen recently (e.g. no traffic yet): static HTML check.
  const { data: status, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["install", site.id],
    queryFn: () => check({ data: { domain: site.domain, siteKey: site.site_key } }).then((r) => r.status),
    staleTime: 60_000,
    enabled: !seenRecently,
  });

  const recheck = () => {
    toast.info("בודק חיבור…");
    qc.invalidateQueries({ queryKey: ["sites"] }); // refresh last_seen
    void refetch();
  };

  const reset = useMutation({
    mutationFn: () =>
      updateSite(site.id, {
        accent: "#000000",
        position: "bottom-left",
        features: DEFAULT_FEATURES,
        protection: DEFAULT_PROTECTION,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site", site.id] });
      qc.invalidateQueries({ queryKey: ["sites"] });
      toast.success("ההגדרות אופסו לברירת מחדל");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "שגיאה באיפוס"),
  });

  const remove = useMutation({
    mutationFn: () => deleteSite(site.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      toast.success("האתר נמחק");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "שגיאה במחיקה"),
  });

  const s = seenRecently ? STATUS.ok : status ? STATUS[status] : null;
  const checking = !seenRecently && (isLoading || isFetching);

  return (
    <Card className="transition-colors hover:border-foreground/30">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="min-w-0">
          <Link to="/dashboard/sites/$siteId" params={{ siteId: site.id }} className="hover:underline">
            <CardTitle className="text-lg">{site.name}</CardTitle>
          </Link>
          <p dir="ltr" className="mt-1 truncate text-right text-sm text-muted-foreground">{site.domain}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {checking || !s ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">בודק…</span>
              </>
            ) : (
              <>
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                <span className={s.text}>{s.label}</span>
              </>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="פעולות">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/dashboard/sites/$siteId" params={{ siteId: site.id }}>
                <ExternalLink className="ml-2 h-4 w-4" />
                פתיחה
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={recheck}>
              <RefreshCw className="ml-2 h-4 w-4" />
              חיבור מחדש
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => reset.mutate()}>
              <RotateCcw className="ml-2 h-4 w-4" />
              איפוס הגדרות לברירת מחדל
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="ml-2 h-4 w-4" />
              מחיקת האתר
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
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
    </Card>
  );
}
