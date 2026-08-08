import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const OWNER_PATHS = ["/dashboard", "/products", "/customers", "/orders"];

function isOwnedPath(p: string): boolean {
  return OWNER_PATHS.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const currentPath = pathname.replace(/^\/[^/]+/, "") || "/";

  if (!session?.user) {
    const isPublic = currentPath === "/" || currentPath === "/login";
    if (!isPublic) {
      return NextResponse.redirect(
        new URL(`/ar/login?next=${encodeURIComponent(currentPath)}`, req.url),
      );
    }
    return NextResponse.next();
  }

  if (currentPath === "/login") {
    return NextResponse.redirect(new URL(`/ar`, req.url));
  }

  if (isOwnedPath(currentPath) && session.user.role !== "owner") {
    return NextResponse.redirect(new URL("/ar", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};