// Per-site widget config, read from the install snippet's data-* attributes.
// (The dashboard writes these into the snippet.) Site-owner behaviors, applied
// once at boot — distinct from the visitor's own accessibility prefs (state.ts).

export interface WidgetConfig {
  protectMedia: boolean; // block image/media drag + right-click. Default ON.
  disableTextSelection: boolean; // prevent selecting page text. Default OFF.
  removeTapHighlight: boolean; // strip the mobile tap-highlight color. Default ON.
  disableLinkLongPress: boolean; // no long-press preview menu on links. Default ON.
}

export function readConfig(script: HTMLScriptElement | null): WidgetConfig {
  const d = script?.dataset ?? ({} as DOMStringMap);
  return {
    // Absent → default. Explicit "0"/"1" from the snippet wins.
    protectMedia: d.protectMedia !== "0",
    disableTextSelection: d.noTextSelect === "1",
    removeTapHighlight: d.tapHighlight !== "0",
    disableLinkLongPress: d.noLinkPreview !== "0",
  };
}
