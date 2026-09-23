import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/auth';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, api routes, assets, home page, login, unauthorized
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/unauthorized'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? verifySessionToken(token) : null;

  // 1. Super Admin Portal protection
  if (pathname.startsWith('/super-admin')) {
    if (!user) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    return NextResponse.next();
  }

  // 2. Teacher Portal protection
  if (pathname.startsWith('/teacher')) {
    if (!user) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (!['TEACHER', 'ADMIN', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    return NextResponse.next();
  }

  // 3. Parent Portal protection
  if (pathname.startsWith('/parent')) {
    if (!user) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (!['PARENT', 'ADMIN', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    return NextResponse.next();
  }

  // 4. Student Portal protection
  if (pathname.startsWith('/student')) {
    if (!user) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (!['STUDENT', 'ADMIN', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    return NextResponse.next();
  }

  // 5. Reception Portal protection
  if (pathname.startsWith('/reception')) {
    if (!user) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (!['RECEPTIONIST', 'ADMIN', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    return NextResponse.next();
  }

  // 6. Staff Portal protection
  if (pathname.startsWith('/staff')) {
    if (!user) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (!['STAFF', 'ADMIN', 'OWNER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    return NextResponse.next();
  }

  // 7. General Dashboard protection
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      // In development / demo mode, allow access if no session is set so demo features can be viewed
      // But redirect if strict auth is desired
      return NextResponse.next();
    }

    // Redirect role-specific users to their dedicated portals
    if (user.role === 'SUPER_ADMIN' && pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/super-admin', request.url));
    }
    if (user.role === 'TEACHER' && pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
    if (user.role === 'PARENT' && pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/parent', request.url));
    }
    if (user.role === 'STUDENT' && pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
