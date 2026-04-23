import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isAdminLoginPage = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin");

  const isProtectedAdminApi =
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/settings") ||
    (pathname.startsWith("/api/products") && request.method !== "GET") ||
    (pathname.startsWith("/api/orders") && request.method !== "POST");

  if (!isAdminPage && !isProtectedAdminApi) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const authorized = Boolean(token);

  if (isAdminLoginPage && authorized) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if ((isAdminPage && !isAdminLoginPage) || isProtectedAdminApi) {
    if (!authorized) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/upload",
    "/api/settings",
    "/api/products/:path*",
    "/api/orders/:path*",
  ],
};
