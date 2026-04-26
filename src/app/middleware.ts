import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 🚀 Yahan hum define kar rahe hain ki kaunse routes lock karne hain
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/documents(.*)', 
  '/chat(.*)',
  '/workspace(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Agar route protected hai, toh user ko login karne bol do
  if (isProtectedRoute(req)) {
    await auth.protect(); // 🚀 FIXED: Removed the brackets from auth() and added await
  }
});

// Ye config ensure karta hai ki API aur static files block na hon
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};