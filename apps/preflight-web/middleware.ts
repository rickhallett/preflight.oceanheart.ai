import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isStubToken, verifyToken } from "@/lib/auth/passport";

// List of protected routes that require authentication
const protectedRoutes = ["/app", "/app/profile", "/app/settings"];

// List of public routes that don't require authentication
const publicRoutes = ["/", "/login"];

// Helper to check if token is a stub token
function validateStubToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    
    return Date.now() <= exp;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
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
  
  try {
    const tokenValue = token.value;
    
    // Basic structure validation
    const parts = tokenValue.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token structure");
    }
    
    // Check if it's a stub token (for testing)
    if (isStubToken(tokenValue)) {
      // Validate stub token locally
      if (validateStubToken(tokenValue)) {
        return NextResponse.next();
      } else {
        throw new Error("Stub token expired");
      }
    }
    
    // For real JWT tokens, we'll validate them on the client side
    // to avoid making API calls in middleware (which can be slow)
    // Just check basic structure and expiration here
    try {
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      
      if (Date.now() > exp) {
        throw new Error("Token expired");
      }
      
      // Token appears structurally valid, actual verification 
      // will happen client-side with API calls
      return NextResponse.next();
    } catch {
      // If we can't decode the payload, it's likely invalid
      throw new Error("Invalid token payload");
    }
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