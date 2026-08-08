import { NextRequest, NextResponse } from "next/server";

// Server-side gate for authenticated areas. The token lives in a JS-set cookie
// (see lib/auth.ts). Middleware checks for cookie presence AND performs a basic
// structural JWT check (3-part base64 format). Full signature verification is
// not available at the edge (the secret isn't accessible here) — the API remains
// the source of truth and returns 401 for invalid/expired tokens.
const TOKEN_COOKIE = "ecosmart_token";

// Basic JWT structure check: header.payload.signature (3 base64url parts)
function looksLikeJWT(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  // Each part must be non-empty base64url
  const base64url = /^[A-Za-z0-9_-]+$/;
  return parts.every((part) => part.length > 0 && base64url.test(part));
}

export function proxy(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  if (!token || !looksLikeJWT(token)) {
    const signInUrl = new URL("/auth/individual/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
