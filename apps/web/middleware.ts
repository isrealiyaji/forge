import { NextResponse, type NextRequest } from "next/server";
import type { Role } from "@/lib/nav-config";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const ROLE_HOME: Record<Role, string> = { admin: "/admin", member: "/member", instructor: "/instructor" };
const AUTH_PAGES = ["/login", "/register"];

type Claims = { role: Role; exp: number };

const decodeAccessToken = (token: string): Claims | null => {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (!json.role || !json.exp) return null;
    return { role: json.role, exp: json.exp };
  } catch {
    return null;
  }
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;
  let session = accessToken ? decodeAccessToken(accessToken) : null;
  if (session && session.exp * 1000 < Date.now()) session = null;

  // Access token missing/expired but a refresh token exists — refresh here so a
  // full-page navigation doesn't bounce an otherwise-valid session to /login.
  let refreshedCookies: string[] = [];
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!session && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { cookie: `refresh_token=${refreshToken}` },
    });
    if (refreshRes.ok) {
      refreshedCookies = refreshRes.headers.getSetCookie?.() ?? [];
      const newAccessToken = refreshedCookies
        .find((c) => c.startsWith("access_token="))
        ?.split(";")[0]
        .split("=")[1];
      if (newAccessToken) session = decodeAccessToken(newAccessToken);
    }
  }

  const protectedRole = (Object.keys(ROLE_HOME) as Role[]).find((role) => pathname.startsWith(ROLE_HOME[role]));

  let response: NextResponse;
  if (protectedRole) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== protectedRole) {
      const url = req.nextUrl.clone();
      url.pathname = ROLE_HOME[session.role];
      url.search = "";
      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
    }
  } else if (AUTH_PAGES.includes(pathname) && session) {
    const url = req.nextUrl.clone();
    url.pathname = ROLE_HOME[session.role];
    url.search = "";
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  refreshedCookies.forEach((cookie) => response.headers.append("Set-Cookie", cookie));
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*", "/instructor/:path*", "/login", "/register"],
};
