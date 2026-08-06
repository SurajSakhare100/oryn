import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require a logged-in user
const PROTECTED_ROUTES = ["/chat", "/settings"];
// Routes only for guests (redirect away if already logged in)
const GUEST_ONLY_ROUTES = ["/login", "/signup"];

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("oryn_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isGuestOnly = GUEST_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Unauthenticated user trying to access protected route → send to /login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated user trying to access login/signup → send to /chat
  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware only to these paths
  matcher: ["/chat/:path*", "/settings/:path*", "/login", "/signup"],
};
