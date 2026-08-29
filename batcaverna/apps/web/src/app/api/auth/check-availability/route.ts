import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// ─── Lista abrangente de domínios de e-mails descartáveis e falsos ───
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

function isValidEmailFormat(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

function isValidApelido(apelido: string): { valid: boolean; error?: string } {
  const clean = apelido.trim();
  if (clean.length < 3) return { valid: false, error: 'Apelido deve ter no mínimo 3 caracteres' };
  if (clean.length > 20) return { valid: false, error: 'Apelido deve ter no máximo 20 caracteres' };
  if (!/^[a-zA-Z0-9_.-]+$/.test(clean)) {
    return { valid: false, error: 'Apenas letras, números, hífen (-) e underline (_)' };
  }
  return { valid: true };
}

// GET /api/auth/check-availability?field=email|apelido&value=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const field = searchParams.get('field');
    const value = searchParams.get('value');

    if (!field || !value || !value.trim()) {
      return NextResponse.json(
        { available: false, error: 'Campo e valor são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const cleanValue = value.trim();

    // ─── 1. VERIFICAÇÃO DE E-MAIL ─────────────────────────────
    if (field === 'email') {
      const emailLower = cleanValue.toLowerCase();

      // Validação de formato
      if (!isValidEmailFormat(emailLower)) {
        return NextResponse.json({
          available: false,
          error: 'Formato de e-mail inválido (ex: nome@dominio.com)',
        });
      }

      // Detecção de e-mail falso / temporário / descartável
      if (isDisposableEmail(emailLower)) {
        return NextResponse.json({
          available: false,
          error: 'E-mail temporário ou descartável detectado. Por favor, insira um e-mail real existente.',
        });
      }

      // Verificar se o domínio tem estrutura mínima de provedor real
      const domainParts = emailLower.split('@')[1]?.split('.');
      if (!domainParts || domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
        return NextResponse.json({
          available: false,
          error: 'Domínio de e-mail inválido ou incompleto.',
        });
      }

      // Verificar duplicidade no banco
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', emailLower)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json({
          available: false,
          error: 'Este e-mail já está cadastrado na plataforma.',
        });
      }

      return NextResponse.json({
        available: true,
        message: '✓ E-mail válido e disponível para cadastro!',
      });
    }

    // ─── 2. VERIFICAÇÃO DE APELIDO ────────────────────────────
    if (field === 'apelido') {
      const check = isValidApelido(cleanValue);
      if (!check.valid) {
        return NextResponse.json({
          available: false,
          error: check.error,
        });
      }

      // Verificar duplicidade no banco (case insensitive)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .ilike('apelido', cleanValue)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json({
          available: false,
          error: '⚠️ Este apelido já está em uso por outro soldado.',
        });
      }

      return NextResponse.json({
        available: true,
        message: '✓ Este apelido está disponível!',
      });
    }

    return NextResponse.json(
      { available: false, error: 'Campo inválido. Use "email" ou "apelido".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in check-availability:', error);
    return NextResponse.json(
      { available: false, error: 'Erro ao verificar disponibilidade' },
      { status: 500 }
    );
  }
}
