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

// ─── Lista abrangente de domínios descartáveis e falsos ──────
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'temp-mail.org',
  'throwaway.email', 'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com',
  'grr.la', 'dispostable.com', 'trashmail.com', '10minutemail.com',
  '10minutemail.net', 'crazymailing.com', 'fakemailgenerator.com',
  'getairmail.com', 'inboxkitten.com', 'maildrop.cc', 'mohmal.com',
  'nada.ltd', 'tempail.com', 'tempr.email', 'generator.email',
  'burnermail.io', 'dropmail.me', 'emailondeck.com', 'mytemp.email',
  'temp-mail.io', 'tmpmail.net', 'tmpmail.org', 'binkmail.com',
  'safetymail.info', 'fakemail.net', 'fakeinbox.com', 'mailcatch.com',
  'trashmail.net', 'trashmail.org', 'tempinbox.com', 'getnada.com',
  'abcvg.com', 'disposablemail.com', 'dropmail.me', 'armyspy.com',
  'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu', 'gustr.com',
  'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
  'test.com', 'exemplo.com', 'fake.com', 'asdf.com', 'teste.com',
  'mail.com.test', 'temp.com', '123.com', 'abc.com', 'aaa.com',
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(senha: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (senha.length < 8) errors.push('Mínimo de 8 caracteres');
  if (!/[A-Z]/.test(senha)) errors.push('Pelo menos uma letra maiúscula');
  if (!/[0-9]/.test(senha)) errors.push('Pelo menos um número');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) errors.push('Pelo menos um caractere especial');
  return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/register
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, apelido, email, senha, data_nascimento, concursos_interesse, aceite_termos } = body;

    // ─── Validações ───────────────────────────────────────────
    if (!nome?.trim() || !apelido?.trim() || !email?.trim() || !senha) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: nome, apelido, email, senha' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de e-mail inválido' },
        { status: 400 }
      );
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'E-mails descartáveis não são permitidos' },
        { status: 400 }
      );
    }

    const passwordCheck = isStrongPassword(senha);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { success: false, error: `Senha fraca: ${passwordCheck.errors.join(', ')}` },
        { status: 400 }
      );
    }

    if (apelido.trim().length < 3 || apelido.trim().length > 20) {
      return NextResponse.json(
        { success: false, error: 'Apelido deve ter entre 3 e 20 caracteres' },
        { status: 400 }
      );
    }

    if (!aceite_termos) {
      return NextResponse.json(
        { success: false, error: 'É necessário aceitar os termos de uso' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // ─── Verificar e-mail já cadastrado ───────────────────────
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Este e-mail já está cadastrado' },
        { status: 409 }
      );
    }

    // ─── Verificar apelido já em uso ──────────────────────────
    const { data: existingApelido } = await supabase
      .from('users')
      .select('id')
      .eq('apelido', apelido.trim())
      .single();

    if (existingApelido) {
      return NextResponse.json(
        { success: false, error: 'Este apelido já está em uso' },
        { status: 409 }
      );
    }

    // ─── Hash da senha ───────────────────────────────────────
    const senhaHash = await hashToken(senha);

    const isAdminEmail = email.toLowerCase().trim() === 'raf4biel.venafro@gmail.com';

    // ─── Inserir usuário ──────────────────────────────────────
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
        { success: false, error: 'Erro ao criar conta. Tente novamente.' },
        { status: 500 }
      );
    }

    // ─── Salvar concursos de interesse ────────────────────────
    if (concursos_interesse?.length > 0) {
      const favoritosData = concursos_interesse.map((concursoId: string, idx: number) => ({
        user_id: newUser.id,
        concurso_id: concursoId,
        ordem: idx,
      }));

      await supabase.from('user_concurso_favoritos').insert(favoritosData);
    }

    // ─── Gerar token de verificação de e-mail ─────────────────
    const emailToken = generateEmailToken();
    await supabase.from('email_verification_tokens').insert({
      user_id: newUser.id,
      token: emailToken,
      expira_em: getEmailTokenExpiry().toISOString(),
      usado: false,
    });

    console.log(`[DEV] Email verification token for ${email}: ${emailToken}`);

    // ─── Gerar tokens de autenticação ─────────────────────────
    const accessToken = await generateAccessToken(newUser.id, newUser.role);
    const refreshToken = generateRefreshToken();
    const hashedRefresh = await hashToken(refreshToken);

    await supabase.from('refresh_tokens').insert({
      user_id: newUser.id,
      token_hash: hashedRefresh,
      dispositivo: 'web',
      expira_em: getRefreshTokenExpiry().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: newUser,
        email_verification_required: true,
      },
      message: 'Conta criada! Verifique seu e-mail para ativar.',
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
