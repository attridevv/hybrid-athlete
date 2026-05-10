import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/checkin(.*)",
  "/runs(.*)",
  "/workouts(.*)",
  "/recovery(.*)",
  "/injuries(.*)",
  "/analytics(.*)",
  "/insights(.*)",
  "/profile(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)).*)",
    "/api/:path*",
  ],
};
