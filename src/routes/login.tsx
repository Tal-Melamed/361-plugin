import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Accessibility } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SetupRequired } from "@/components/SetupRequired";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "התחברות — ניהול נגישות" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard" });
  }, [session, navigate]);

  if (!isSupabaseConfigured) return <SetupRequired />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase!.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) setNotice("נרשמת! בדקו את תיבת הדוא\"ל לאישור, ואז התחברו.");
      } else {
        const { error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background">
            <Accessibility className="h-6 w-6" />
          </div>
          <CardTitle>{mode === "signin" ? "התחברות" : "הרשמה"}</CardTitle>
          <CardDescription>ניהול האתרים והווידג'טים שלך</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">דוא"ל</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-emerald-600">{notice}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "רגע…" : mode === "signin" ? "התחברות" : "הרשמה"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setError(null);
              setNotice(null);
              setMode((m) => (m === "signin" ? "signup" : "signin"));
            }}
          >
            {mode === "signin" ? "אין לך חשבון? הרשמה" : "יש לך חשבון? התחברות"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
