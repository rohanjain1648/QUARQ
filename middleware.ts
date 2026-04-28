import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/chat(.*)',
  '/setup(.*)',
  '/deploying(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  const url = req.nextUrl.clone()

  if (isProtectedRoute(req) && !userId) {
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  if ((req.nextUrl.pathname === '/auth' || req.nextUrl.pathname === '/') && userId) {
    url.pathname = '/chat'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
  ],
}
