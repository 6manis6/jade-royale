import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_auth";

function isAuthorized(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const envToken = process.env.ADMIN_PANEL_TOKEN;

  if (!envToken) {
    return false;
  }

  return token === envToken;
}

export function middleware(request: NextRequest) {
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

  const authorized = isAuthorized(request);

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

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
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
