import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateEmailToken,
  getRefreshTokenExpiry,
  getEmailTokenExpiry,
} from '@/lib/auth';
import {
  validateNomeCompleto,
  isValidEmail,
  isStrongPassword,
  isValidApelido,
} from '@/lib/validators';

function getSupabase() {
  return createServerSupabaseClient();
}

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/register
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, apelido, email, senha, data_nascimento, concursos_interesse, aceite_termos } = body;

    // ─── 1. Validações Blindadas ──────────────────────────────
    if (!nome?.trim() || !apelido?.trim() || !email?.trim() || !senha) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: nome completo, apelido, email e senha' },
        { status: 400 }
      );
    }

    // Validação estrita de Nome Completo (Nome + Sobrenome)
    const nomeCheck = validateNomeCompleto(nome);
    if (!nomeCheck.valid) {
      return NextResponse.json(
        { success: false, error: nomeCheck.error || 'Nome completo inválido' },
        { status: 400 }
      );
    }

    // Validação de Apelido (Nome de Guerra)
    const apelidoCheck = isValidApelido(apelido);
    if (!apelidoCheck.valid) {
      return NextResponse.json(
        { success: false, error: apelidoCheck.error || 'Apelido inválido' },
        { status: 400 }
      );
    }

    // Validação de E-mail
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de e-mail inválido ou domínio não permitido' },
        { status: 400 }
      );
    }

    // Validação de Senha Forte
    const passwordCheck = isStrongPassword(senha);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { success: false, error: `Senha fraca: ${passwordCheck.errors.join(', ')}` },
        { status: 400 }
      );
    }

    // Termos de uso
    if (!aceite_termos) {
      return NextResponse.json(
        { success: false, error: 'É necessário aceitar os termos de uso e política de privacidade' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // ─── 2. Verificar e-mail já cadastrado ────────────────────
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Este e-mail já está cadastrado na plataforma' },
        { status: 409 }
      );
    }

    // ─── 3. Verificar apelido já em uso ───────────────────────
    const { data: existingApelido } = await supabase
      .from('users')
      .select('id')
      .ilike('apelido', apelido.trim())
      .maybeSingle();

    if (existingApelido) {
      return NextResponse.json(
        { success: false, error: 'Este apelido já está em uso por outro soldado' },
        { status: 409 }
      );
    }

    // ─── 4. Hash da senha ─────────────────────────────────────
    const senhaHash = await hashToken(senha);

    const isAdminEmail = email.toLowerCase().trim() === 'raf4biel.venafro@gmail.com';

    // ─── 5. Inserir usuário ───────────────────────────────────
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        nome: nome.trim(),
        apelido: apelido.trim(),
        email: email.toLowerCase().trim(),
        senha_hash: senhaHash,
        data_nascimento: data_nascimento || null,
        email_verified: isAdminEmail ? true : false,
        role: isAdminEmail ? 'admin' : 'user',
        xp_total: isAdminEmail ? 25000 : 0,
        nivel_atual: isAdminEmail ? 15 : 1,
        streak_dias: isAdminEmail ? 30 : 0,
        maior_combo_pessoal: isAdminEmail ? 50 : 0,
      })
      .select('id, nome, apelido, email, role, xp_total, nivel_atual, criado_em')
      .single();

    if (insertError) {
      console.error('Error inserting user:', insertError);
      return NextResponse.json(
        { success: false, error: `Erro no banco de dados: ${insertError.message}` },
        { status: 500 }
      );
    }

    // ─── 6. Salvar concursos de interesse ─────────────────────
    if (concursos_interesse && Array.isArray(concursos_interesse) && concursos_interesse.length > 0) {
      try {
        const { data: dbConcursos } = await supabase
          .from('concursos')
          .select('id, sigla');

        const siglaToIdMap = new Map(
          (dbConcursos || []).map((c: any) => [c.sigla.toLowerCase(), c.id])
        );

        const favoritosData = (concursos_interesse || [])
          .map((item: string, idx: number) => {
            const concursoId =
              siglaToIdMap.get(item.toLowerCase()) ||
              (item.length === 36 ? item : null);

            return concursoId
              ? {
                  user_id: newUser.id,
                  concurso_id: concursoId,
                  ordem: idx,
                }
              : null;
          })
          .filter((item: any): item is { user_id: any; concurso_id: any; ordem: number } => item !== null);

        if (favoritosData.length > 0) {
          await supabase.from('user_concurso_favoritos').insert(favoritosData);
        }
      } catch (concursoErr) {
        console.warn('Warning saving user preferred concursos:', concursoErr);
      }
    }

    // ─── 7. Gerar token de verificação de e-mail ───────────────
    try {
      const emailToken = generateEmailToken();
      await supabase.from('email_verification_tokens').insert({
        user_id: newUser.id,
        token: emailToken,
        expira_em: getEmailTokenExpiry().toISOString(),
        usado: false,
      });
    } catch (emailTokenErr) {
      console.warn('Warning saving email token:', emailTokenErr);
    }

    // ─── 8. Gerar tokens de autenticação ───────────────────────
    const accessToken = await generateAccessToken(newUser.id, newUser.role);
    const refreshToken = generateRefreshToken();
    const hashedRefresh = await hashToken(refreshToken);

    await supabase.from('refresh_tokens').insert({
      user_id: newUser.id,
      token_hash: hashedRefresh,
      dispositivo: 'web',
      expira_em: getRefreshTokenExpiry().toISOString(),
    });

    // ─── 9. Retornar resposta e SETAR COOKIES DE SESSÃO ────────
    const response = NextResponse.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: newUser,
        email_verification_required: true,
      },
      message: 'Conta criada com sucesso! Entrando na Caverna...',
    }, { status: 201 });

    // Set cookies HTTP para a sessão de 8 horas imediata
    response.cookies.set('bat_access_token', accessToken, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas de sessão ativa sem precisar relogar
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set('bat_refresh_token', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias para refresh de sessão
      secure: process.env.NODE_ENV === 'production',
    });

    return response;

  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: `Erro interno: ${error?.message || 'desconhecido'}` },
      { status: 500 }
    );
  }
}
