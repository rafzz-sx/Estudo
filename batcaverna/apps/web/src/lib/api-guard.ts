import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';

export interface UsuarioAutenticado {
  id: string;
  role: string;
}

export interface OpcoesGuarda {
  /** Se true, rejeita com 403 qualquer usuário que não tenha role === 'admin' */
  requerAdmin?: boolean;
}

/**
 * Wrapper de alta ordem para rotas de API do Next.js.
 * Garante autenticação centralizada, validação de permissão e padronização de erros.
 *
 * Exemplo de uso:
 *   export const GET = withAuth(async (req, user) => {
 *     return NextResponse.json({ success: true, data: { userId: user.id } });
 *   });
 */
export function withAuth<T = any>(
  handler: (req: NextRequest, user: UsuarioAutenticado, context?: T) => Promise<NextResponse | Response>,
  opcoes: OpcoesGuarda = {}
) {
  return async (req: NextRequest, context?: T): Promise<NextResponse | Response> => {
    try {
      const user = await getAuthUserFromRequest(req);

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Acesso não autorizado. Faça login para continuar.' },
          { status: 401 }
        );
      }

      if (opcoes.requerAdmin && user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Acesso negado. Privilégio de administrador obrigatório.' },
          { status: 403 }
        );
      }

      return await handler(req, user, context);
    } catch (err: any) {
      console.error('Erro não tratado na rota protegida:', err);
      return NextResponse.json(
        { success: false, error: 'Erro interno no servidor.' },
        { status: 500 }
      );
    }
  };
}
