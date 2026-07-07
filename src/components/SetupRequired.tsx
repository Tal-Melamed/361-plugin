import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Shown when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing, so the
// dashboard renders a helpful setup guide instead of a blank page.
export function SetupRequired() {
  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">חיבור Supabase נדרש</CardTitle>
          <CardDescription>
            ניהול האתרים דורש מסד נתונים. חברו את Supabase כדי להפעיל את הדשבורד.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
            <li>ב-Lovable: פתחו את אינטגרציית Supabase וחברו/צרו פרויקט.</li>
            <li>
              הריצו את המיגרציה <code className="rounded bg-muted px-1">supabase/migrations/0001_init.sql</code>{" "}
              (SQL Editor או <code className="rounded bg-muted px-1">supabase db push</code>).
            </li>
            <li>
              ודאו שהמשתנים <code className="rounded bg-muted px-1">VITE_SUPABASE_URL</code> ו-
              <code className="rounded bg-muted px-1">VITE_SUPABASE_ANON_KEY</code> מוגדרים (Lovable מזריק אותם אוטומטית).
            </li>
            <li>רעננו את הדף — הדשבורד יעלה.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
