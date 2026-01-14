import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/app(.*)",
  "/survey(.*)",
]);

// Define public routes (no auth required)
const isPublicRoute = createRouteMatcher([
  "/",
  "/login",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sandbox(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // HTTPS enforcement in production
  if (process.env.NODE_ENV === "production") {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const host = request.headers.get("host");

    if (forwardedProto === "http" && host) {
      const httpsUrl = new URL(`https://${host}${pathname}`);
      httpsUrl.search = request.nextUrl.search;
      return NextResponse.redirect(httpsUrl, { status: 301 });
    }
  }

  // Protect routes that require authentication
  if (isProtectedRoute(request)) {
    const { userId } = await auth();

    if (!userId) {
      // Redirect to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
