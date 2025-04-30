import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: "/auth/sign-in" });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
