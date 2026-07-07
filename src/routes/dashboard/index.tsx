import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Globe, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { listSites, createSite } from "@/lib/sites";
import { useSession } from "@/lib/useSession";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/")({
  component: () => (
    <DashboardShell>
      <SitesList />
    </DashboardShell>
  ),
});

function SitesList() {
  const session = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  const { data: sites, isLoading } = useQuery({ queryKey: ["sites"], queryFn: listSites });

  const create = useMutation({
    mutationFn: () =>
      createSite({ name: name.trim(), domain: domain.trim(), owner_id: session!.user.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      setOpen(false);
      setName("");
      setDomain("");
      toast.success("האתר נוצר");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "שגיאה ביצירת האתר"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">האתרים שלי</h1>
          <p className="text-sm text-muted-foreground">נהלו את הווידג'ט וההגדרות לכל אתר.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-1 h-4 w-4" />
              אתר חדש
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>הוספת אתר</DialogTitle>
            </DialogHeader>
            <form
              id="add-site"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">שם האתר</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="החנות שלי" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="domain">דומיין</Label>
                <Input
                  id="domain"
                  required
                  dir="ltr"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.co.il"
                />
              </div>
            </form>
            <DialogFooter>
              <Button type="submit" form="add-site" disabled={create.isPending}>
                {create.isPending ? "יוצר…" : "יצירה"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">טוען אתרים…</p>
      ) : !sites || sites.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Globe className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">עדיין אין אתרים. הוסיפו את הראשון כדי לקבל קוד התקנה.</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="ml-1 h-4 w-4" />
              אתר חדש
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sites.map((s) => (
            <Link key={s.id} to="/dashboard/sites/$siteId" params={{ siteId: s.id }}>
              <Card className="transition-colors hover:border-foreground/30">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">{s.name}</CardTitle>
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p dir="ltr" className="text-right text-sm text-muted-foreground">{s.domain}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
