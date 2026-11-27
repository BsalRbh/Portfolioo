import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_STYLE, STYLE_COOKIE, STYLE_COOKIE_MAX_AGE, isStyle } from "@/lib/styles";

// "/?style=<edition>" → remember that edition in a cookie, redirect to "/".
// "/?style=terminal"  → go to /terminal. It is NOT remembered for "/", so
//                       "/" (and the browser's Back button) always returns
//                       to the visitor's last normal edition.
// "/?edition=<edition>" → share link: show that edition once, keep the URL
//                       as-is so it can be copied again, and leave the
//                       visitor's saved edition untouched.
// "/" with cookie      → serve that edition (rewrite, so the URL stays "/").
// "/" without cookie   → the default edition (also what search engines see).
const COOKIE_OPTS = { path: "/", maxAge: STYLE_COOKIE_MAX_AGE, sameSite: "lax" } as const;

export function middleware(req: NextRequest) {
  const shared = req.nextUrl.searchParams.get("edition");
  if (shared !== null) {
    if (!isStyle(shared)) {
      const url = req.nextUrl.clone();
      url.searchParams.delete("edition");
      return NextResponse.redirect(url);
    }
    if (shared === "terminal") {
      const url = req.nextUrl.clone();
      url.searchParams.delete("edition");
      url.pathname = "/terminal";
      return NextResponse.redirect(url);
    }
    if (shared === DEFAULT_STYLE) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = `/${shared}`;
    return NextResponse.rewrite(url);
  }

  const requested = req.nextUrl.searchParams.get("style");
  const pref = req.cookies.get(STYLE_COOKIE)?.value;

  if (requested !== null) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("style");
    if (!isStyle(requested)) return NextResponse.redirect(url);

    if (requested === "terminal") {
      url.pathname = "/terminal";
      const res = NextResponse.redirect(url);
      // Mark the chooser as answered without changing the "/" edition.
      if (!isStyle(pref) || pref === "terminal") res.cookies.set(STYLE_COOKIE, DEFAULT_STYLE, COOKIE_OPTS);
      return res;
    }

    url.pathname = "/";
    const res = NextResponse.redirect(url);
    res.cookies.set(STYLE_COOKIE, requested, COOKIE_OPTS);
    return res;
  }

  if (isStyle(pref) && pref !== DEFAULT_STYLE && pref !== "terminal") {
    return NextResponse.rewrite(new URL(`/${pref}`, req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/"] };
