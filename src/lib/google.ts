// Google OAuth config for the SEO module (Search Console + Analytics).
// The client ID is public (goes in the authorize URL) — read from a VITE_ env.
// The client SECRET is server-only (token exchange) and never reaches the browser.

const env = import.meta.env as Record<string, string | undefined>;

export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID ?? "";
export const isGoogleConfigured = Boolean(GOOGLE_CLIENT_ID);

// webmasters (read + sitemap submit) + analytics.readonly. offline + consent so
// Google returns a refresh token.
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/webmasters",
  "https://www.googleapis.com/auth/analytics.readonly",
  "openid",
  "email",
].join(" ");

export const GOOGLE_REDIRECT_PATH = "/auth/google/callback";

export function googleRedirectUri(): string {
  return `${window.location.origin}${GOOGLE_REDIRECT_PATH}`;
}

// Builds the consent-screen URL. `state` carries the site id (+ CSRF nonce) so
// the callback knows which site to attach the connection to.
export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
