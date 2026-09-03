// Hebrew UI strings — matching the bugbox widget's labels. RTL enforced at the
// panel container (dir="rtl").

export const HE = {
  triggerLabel: "פתח תפריט נגישות",
  panelTitle: "נגישות",
  close: "סגירה",
  reset: "איפוס הגדרות",

  fontSizeGroup: "גודל גופן",
  highContrast: "ניגודיות גבוהה",
  grayscale: "גווני אפור",
  highlightLinks: "הדגשת קישורים",
  bigCursor: "סמן גדול",

  // Accessibility statement (legally required)
  statementTitle: "הצהרת נגישות",
  statementLink: "צפייה בהצהרת הנגישות",
  coordinator: "רכז/ת נגישות",

  // SR announcements (aria-live)
  on: "מופעל",
  off: "כבוי",
  resetDone: "כל ההגדרות אופסו",
} as const;
