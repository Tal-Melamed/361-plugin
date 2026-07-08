import { Link2, BarChart3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Seam for the Google phase (OAuth). The connections are detected as
// "not connected"; wiring the OAuth flow needs a Google Cloud app (next phase).
const CONNECTIONS = [
  { id: "gsc", name: "Google Search Console", tagline: "אינדוקס, שאילתות, הגשת sitemap", icon: Search },
  { id: "ga", name: "Google Analytics", tagline: "תנועה, מקורות, המרות", icon: BarChart3 },
];

export function SeoGoogle() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          חיבורי Google
        </CardTitle>
        <CardDescription>נתונים חיים מ-Search Console ו-Analytics. דורש אישור OAuth שלכם.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {CONNECTIONS.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">לא מחובר</span>
                <Button variant="outline" size="sm" disabled>
                  חיבור (בקרוב)
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
