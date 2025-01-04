import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',  // Landing page
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/webhooks(.*)'
])

export default clerkMiddleware(async (auth, request) => {
  // Bypass Clerk completely for SSE endpoints
  if (request.url.includes('/api/sse')) {
    return;
  }
  
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Exclude SSE endpoints from Clerk middleware
    '/((?!_next|api/sse|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api(?!/sse)|trpc)(.*)',  // Match api routes except /api/sse
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}