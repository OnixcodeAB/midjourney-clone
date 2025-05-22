import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

// Middleware to check if the user is authenticated before accessing protected routes
const isProtectedRoute = createRouteMatcher([
  "/create",
  "/jobs",
  "/account",
  "/settings",
  "/images/:id",
]);

export default clerkMiddleware(async (auth, req) => {
  console.log("Middleware triggered for request:", req.nextUrl.pathname);
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    if (isProtectedRoute(req)) {
      return redirectToSignIn({ returnBackUrl: req.nextUrl.pathname });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|api|trpc|auth|[^?]*\\.(?:html?|css|js|png|jpg|svg|woff2?|ico)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
