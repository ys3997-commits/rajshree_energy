import { asSessionCookie } from "@/lib/auth/browserSession";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_USER_HEADER,
  STAFF_SESSION_COOKIE,
  readStaffIdFromToken,
} from "@/lib/auth/staff-session";

function nextWithPath(request: NextRequest, authUser?: "0" | "1") {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  if (authUser) requestHeaders.set(AUTH_USER_HEADER, authUser);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export async function updateSession(request: NextRequest) {
  const isLogin = request.nextUrl.pathname.startsWith("/login");
  const staffId = await readStaffIdFromToken(
    request.cookies.get(STAFF_SESSION_COOKIE)?.value,
  );

  // Staff login is a local signed cookie. Skip the Supabase round trip.
  // Do not rewrite cookies here — that was turning them into session cookies.
  if (staffId && !isLogin) {
    return nextWithPath(request, "0");
  }

  let supabaseResponse = nextWithPath(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = nextWithPath(request);
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, asSessionCookie(options)),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signedIn = Boolean(user || staffId);

  if (!signedIn && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Only the owner session skips the login page. A staff cookie may be stale
  // after permissions were removed, so allow /login so they can sign in again.
  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Return this same response. Rebuilding it drops the cookie expiry Supabase set.
  return supabaseResponse;
}
