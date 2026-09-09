import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { aplicarLimite } from '@/lib/seguranca';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  hashSenha,
  verificarSenha,
  getRefreshTokenExpiry,
} from '@/lib/auth';

function getSupabase() {
  return createServerSupabaseClient();
}

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/login
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    // 8 tentativas a cada 5 min por IP. Sem isso, dava para varrer
    // senha por forca bruta na velocidade da rede.
    const bloqueio = aplicarLimite(req, 'login', 8, 300);
    if (bloqueio) return bloqueio;

    const body = await req.json();
    const { email, senha } = body;

    if (!email?.trim() || !senha) {
      return NextResponse.json(
        { success: false, error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // ─── Buscar usuário ───────────────────────────────────────
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      // Log detalhado para diagnóstico (nunca exposto ao cliente)
      if (error) {
        console.error('LOGIN DB ERROR for', email.toLowerCase().trim(), ':', error.code, error.message);
      }
      return NextResponse.json(
        { success: false, error: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    // ─── Verificar senha ──────────────────────────────────────
    // Aceita o formato antigo (SHA-256 de uma volta, sem sal) e o novo
    // (PBKDF2 com sal). Comparação em tempo constante nos dois casos.
    const { ok, precisaRehash } = await verificarSenha(senha, user.senha_hash);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    // Migração transparente: quem entra com a senha certa sai daqui já no
    // formato novo. Ninguém precisa redefinir nada, e a base migra sozinha
    // conforme as pessoas usam a plataforma.
    //
    // Falhar aqui não pode derrubar o login — a senha já foi conferida.
    if (precisaRehash) {
      try {
        await supabase
          .from('users')
          .update({ senha_hash: await hashSenha(senha) })
          .eq('id', user.id);
      } catch (e) {
        console.warn('Aviso: não consegui atualizar o hash da senha:', e);
      }
    }

    // ─── Conta bloqueada pela moderação ───────────────────────
    // Esta checagem vem DEPOIS da senha de propósito: antes dela, um
    // estranho descobriria quais e-mails existem só pela mensagem de erro.
    //
    // A suspensão temporária expira sozinha na leitura — não depende de
    // nenhum job rodando na hora certa.
    if (user.ativo === false) {
      return NextResponse.json(
        {
          success: false,
          error:
            user.motivo_suspensao ||
            'Esta conta está desativada. Fale com o suporte pelo canal de contato.',
        },
        { status: 403 }
      );
    }

    if (user.suspenso_ate && new Date(user.suspenso_ate) > new Date()) {
      const volta = new Date(user.suspenso_ate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return NextResponse.json(
        {
          success: false,
          error:
            `Conta suspensa até ${volta}.` +
            (user.motivo_suspensao ? ` Motivo: ${user.motivo_suspensao}` : ''),
        },
        { status: 403 }
      );
    }

    // ─── Gerar tokens ─────────────────────────────────────────
    const accessToken = await generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken();
    const hashedRefresh = await hashToken(refreshToken);

    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token_hash: hashedRefresh,
      dispositivo: 'web',
      expira_em: getRefreshTokenExpiry().toISOString(),
    });

    // ─── Registrar o login e quando a sessão automática expira ──
    // O painel admin mostra quanto tempo falta para cada usuário precisar
    // relogar; sem gravar isso, não havia como saber.
    const duracaoAcesso = parseInt(process.env.JWT_ACCESS_EXPIRATION || '36000');
    const expiraEm = new Date(Date.now() + duracaoAcesso * 1000);

    await supabase
      .from('users')
      .update({
        ultimo_login_em: new Date().toISOString(),
        sessao_expira_em: expiraEm.toISOString(),
      })
      .eq('id', user.id);

    // ─── Retornar dados do usuário (sem senha) e SETAR COOKIES
    const { senha_hash: _, ...userData } = user;

    const response = NextResponse.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: userData,
      },
    });

    // O cookie precisa durar o mesmo que o JWT. Antes eram 8h de cookie
    // para um token de 10h: a sessão "morria" duas horas antes da hora.
    // httpOnly porque nenhum código do navegador lê este cookie — o token
    // que o front usa fica no store, e deixá-lo acessível a JS só ampliaria
    // o estrago de um eventual XSS.
    response.cookies.set('bat_access_token', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: duracaoAcesso,
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set('bat_refresh_token', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias para persistência de refresh
      secure: process.env.NODE_ENV === 'production',
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      // A mensagem crua do Postgres entrega nome de tabela, de coluna e
      // as vezes o proprio SQL. Vai para o log do servidor, nunca para
      // a tela de quem tentou entrar.
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
