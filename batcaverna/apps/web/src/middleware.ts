import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';

// Rotas que requerem autenticação
const PROTECTED_ROUTES = [
  '/dashboard',
  '/concurso',
  '/questoes',
  '/simulado',
  '/ranking',
  '/perfil',
  '/tickets',
  '/admin',
  '/amigos',
  '/chat',
];

// Rotas que NÃO devem ser acessadas se já logado
const AUTH_ROUTES = ['/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Ignorar API routes, assets estáticos, etc. ─────────────
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ─── Extrair access token do cookie ou header ───────────────
  const accessToken =
    request.cookies.get('bat_access_token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // ─── Rota protegida sem token → redirecionar para login ─────
  if (isProtectedRoute) {
    if (!accessToken) {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('expired', '1');
      return NextResponse.redirect(loginUrl);
    }

    // ─── Rota admin: verificar role ───────────────────────────
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Adicionar user info nos headers para as páginas
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub);
    response.headers.set('x-user-role', payload.role);
    return response;
  }

  // ─── Rota de auth com token válido → redirecionar para dashboard
  if (isAuthRoute && accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
