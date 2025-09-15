import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of protected routes that require authentication
const protectedRoutes = ["/app", "/app/profile", "/app/settings"];

// List of public routes that don't require authentication
const publicRoutes = ["/", "/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Check for authentication token
  const token = request.cookies.get("oh_session");
  
  if (!token) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Basic token validation (check if it exists and has proper structure)
  try {
    const tokenValue = token.value;
    const parts = tokenValue.split(".");
    
    if (parts.length !== 3) {
      throw new Error("Invalid token structure");
    }
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    
    if (Date.now() > exp) {
      throw new Error("Token expired");
    }
    
    // Token appears valid, continue to the protected route
    return NextResponse.next();
  } catch (error) {
    // Invalid or expired token, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    
    // Clear the invalid cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("oh_session");
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};