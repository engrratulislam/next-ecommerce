import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "admin";
    const isCustomer = token?.role === "customer";

    // Admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Customer account routes
    if (req.nextUrl.pathname.startsWith("/account")) {
      if (!isCustomer && !isAdmin) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Checkout route
    if (req.nextUrl.pathname.startsWith("/checkout")) {
      if (!isCustomer && !isAdmin) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes
        if (
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/products") ||
          req.nextUrl.pathname.startsWith("/categories") ||
          req.nextUrl.pathname.startsWith("/search") ||
          req.nextUrl.pathname.startsWith("/cart") ||
          req.nextUrl.pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
  ],
};
