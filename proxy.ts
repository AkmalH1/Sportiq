import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request Content-Security-Policy with a script nonce (https://nextjs.org/docs/app/guides/content-security-policy).
 * Scripts may only run if they carry this request's random nonce ('strict-dynamic' then lets those trusted scripts load their own chunks),
 * so an injected <script> or inline handler is blocked even if some page ever failed to escape user text.
 * Styles keep 'unsafe-inline' because the UI sets style="" attributes (animations); that cannot execute code.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src https://www.google.com",
    "form-action 'self' https://www.payhere.lk https://sandbox.payhere.lk",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
