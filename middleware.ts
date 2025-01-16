import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',  // Landing page
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/chat/completions(.*)'  // Allow Hume to access completions endpoint
])

export default clerkMiddleware(async (auth, request) => {
  // Bypass Clerk completely for SSE endpoints
  if (request.url.includes('/api/sse') || request.url.includes('/api/chat/completions')) {
    return;
  }
  
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Exclude SSE endpoints and chat completions from Clerk middleware
    '/((?!_next|api/sse|api/chat/completions|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api(?!/sse|/chat/completions))(.*)',  // Match api routes except /api/sse and /api/chat/completions
    // Always run for API routes except chat completions
    '/(api(?!/chat/completions)|trpc)(.*)',
  ],
}