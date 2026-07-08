import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Boxes } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { SetupRequired } from "./SetupRequired";

// Auth guard + chrome for all dashboard pages. Renders a setup screen when
// Supabase is missing, a loader while the session resolves, and redirects to
// /login when signed out.
export function DashboardShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSupabaseConfigured && session === null) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);

  if (!isSupabaseConfigured) return <SetupRequired />;
  if (session === undefined || session === null) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center text-muted-foreground">
        טוען…
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <Boxes className="h-5 w-5" />
            <span>Maestro</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase?.auth.signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="ml-1 h-4 w-4" />
              יציאה
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <Toaster position="top-center" />
    </div>
  );
}
