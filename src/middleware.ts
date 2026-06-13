import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/documents(.*)',
  '/chat(.*)',
  '/workspace(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // 🚀 FIX: Bypass the buggy protect() method. Manually check user ID!
    const { userId, redirectToSignIn } = await auth();
    
    if (!userId) {
      return redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", 
    "/", 
    "/(api|trpc)(.*)"
  ],
};