import { NextResponse } from "next/server";

export function proxy(request) {
  const token = request.cookies.get("auth_token")?.value;

  const { pathname } = request.nextUrl;

  const protectedRoutes = [
    "/account",
    "/checkout",
    "/orders"
  ];

  const requiresAuth = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (requiresAuth && !token) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/orders/:path*"
  ]
};