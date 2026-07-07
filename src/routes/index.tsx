import { createFileRoute, Link } from "@tanstack/react-router";
import { Accessibility, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "פלאגין נגישות — ניהול" },
      { name: "description", content: "כלי נגישות לאתרים ישראליים — WCAG 2.1 AA, תקנות 2013." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground text-background">
        <Accessibility className="h-9 w-9" />
      </div>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        פלאגין נגישות לאתרים ישראליים
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        סקריפט אחד שמוסיף כלי נגישות מלא בעברית (RTL) לכל אתר — תואם WCAG 2.1 AA ותקנות
        שוויון זכויות לאנשים עם מוגבלות, 2013.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/dashboard">
            כניסה לניהול האתרים
            <ArrowLeft className="mr-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/login">התחברות</Link>
        </Button>
      </div>
    </div>
  );
}
