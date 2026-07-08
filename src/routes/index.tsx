import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maestro — פלטפורמת מודולים לאתר שלך" },
      { name: "description", content: "פלאגין אחד, מודולים עצמאיים: נגישות, SEO ועוד. התקנה אחת, לוח בקרה אחד." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground text-background">
        <Boxes className="h-9 w-9" />
      </div>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Maestro — פלטפורמה אחת, מודולים עצמאיים
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        התקנה אחת ולוח בקרה אחד. הפעילו רק את המודולים שאתם צריכים — נגישות (WCAG 2.1 AA
        ותקנות 2013), SEO, ועוד בהמשך.
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
