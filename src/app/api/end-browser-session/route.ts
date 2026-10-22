import { STAFF_SESSION_COOKIE, staffSessionCookieOptions } from "@/lib/auth/staff-session";
import { NextResponse, type NextRequest } from "next/server";

/** Clears the saved login and sends the browser to the sign-in page. */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(STAFF_SESSION_COOKIE, "", {
    ...staffSessionCookieOptions(),
    maxAge: 0,
  });
  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.startsWith("sb-")) continue;
    response.cookies.set(cookie.name, "", { path: "/", maxAge: 0 });
  }
  return response;
}
