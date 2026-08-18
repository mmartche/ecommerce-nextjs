import { NextResponse } from "next/server";

export function proxy(request) {
  const token = request.cookies.get("auth_token");

  if (!token) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "redirect",
      request.nextUrl.pathname
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