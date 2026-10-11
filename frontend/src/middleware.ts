import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token    = request.cookies.get('access_token')?.value;
  const userCookie = request.cookies.get('user')?.value;
  const path     = request.nextUrl.pathname;

  // Not logged in → redirect to login for protected routes
  const requiresAuth = ['/cart', '/checkout', '/account', '/seller', '/dashboard'].some(p => path.startsWith(p));
  if (requiresAuth && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && userCookie) {
    try {
      const user = JSON.parse(userCookie);
      const role: string = user.role;

      // SELLER and ADMIN cannot buy → redirect to dashboard
      const buyingRoutes = ['/cart', '/checkout'];
      if (buyingRoutes.some(p => path.startsWith(p)) && (role === 'SELLER' || role === 'ADMIN')) {
        return NextResponse.redirect(new URL('/seller/dashboard', request.url));
      }

      // /account/* is only for CUSTOMER (except /account/orders which admin can also use)
      if (path.startsWith('/account') && !path.startsWith('/account/orders') && role !== 'CUSTOMER') {
        return NextResponse.redirect(new URL('/seller/dashboard', request.url));
      }

      // /seller only for SELLER and ADMIN
      if (path.startsWith('/seller') && role !== 'SELLER' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // /dashboard/admin only for ADMIN
      if (path.startsWith('/dashboard/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {}
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*', '/account/:path*', '/seller/:path*', '/dashboard/:path*'],
};
