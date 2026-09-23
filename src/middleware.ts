/**
 * Rascunho futuro de middleware para uma versão com autenticação e rotas protegidas.
 * Protects /dashboard and /estimates routes ensuring valid tenant session
 * Path: src/middleware.ts
 */

export interface NextRequestLike {
  nextUrl: {
    pathname: string;
  };
  headers: {
    get: (key: string) => string | null;
  };
  cookies: {
    get: (name: string) => { value: string } | undefined;
  };
}

export function middleware(req: any) {
  const pathname = req.nextUrl?.pathname || '';

  // Protected route checking
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/estimates');

  if (isProtected) {
    // Check for NextAuth session token
    const token =
      req.cookies?.get?.('next-auth.session-token')?.value ||
      req.cookies?.get?.('__Secure-next-auth.session-token')?.value ||
      req.headers?.get?.('authorization');

    // If no active session, redirect to login
    if (!token && process.env.NODE_ENV === 'production') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return Response.redirect(loginUrl);
    }
  }

  return undefined;
}

export const config = {
  matcher: ['/dashboard/:path*', '/estimates/:path*'],
};

export default middleware;
