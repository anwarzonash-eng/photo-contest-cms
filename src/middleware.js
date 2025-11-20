import { NextResponse } from "next/server";

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login"; // Only "/login" is public
  const isProtectedPath = path === "/" || path === "/weekly-topten"; // Only "/" is protected

  const cookie = request.cookies.get("PhotoContestCMS.");
  const token = cookie ? JSON.parse(cookie.value).token : null;

  // If the user is logged in and tries to access the login page, redirect to the home page
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // If the user is not logged in and tries to access a protected path ("/"), redirect to login page
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Allow access to other paths or when conditions are met
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/weekly-topten", "/login"], // Apply middleware to "/" and "/login" only
};
