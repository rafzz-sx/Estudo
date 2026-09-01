// ═══════════════════════════════════════════════════════════════
// Validadores Oficiais do Sistema BatCaverna
// ═══════════════════════════════════════════════════════════════

// ─── Domínios temporários / descartáveis bloqueados ───────────
export const DISPOSABLE_DOMAINS = new Set([
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

const FORBIDDEN_WORDS = new Set([
  'teste', 'test', 'tester', 'nome', 'sobrenome', 'completo',
  'asdf', 'qwerty', 'fake', 'anonimo', 'usuario', 'admin', 'administrator',
  'null', 'undefined', 'batman', 'batcaverna'
]);

/**
 * Normaliza uma string removendo acentos e convertendo para minúsculas
 */
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Validação Blindada de Nome Completo
 * Exige nome + sobrenome real, bloqueia repetições e lixo de teclado
 */
export function validateNomeCompleto(nome: string): { valid: boolean; error?: string } {
  if (!nome || typeof nome !== 'string') {
    return { valid: false, error: 'Nome completo é obrigatório' };
  }

  const trimmed = nome.trim();

  // Comprimento total
  if (trimmed.length < 5) {
    return { valid: false, error: 'Digite seu nome e sobrenome completo (mínimo 5 letras)' };
  }

  if (trimmed.length > 70) {
    return { valid: false, error: 'Nome muito longo (máximo 70 caracteres)' };
  }

  // Apenas letras em português (com acentos), apóstrofos, hífens e espaços
  const nameRegex = /^[a-zA-ZÀ-ÿ]+([ '-][a-zA-ZÀ-ÿ]+)+$/;
  if (!nameRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Digite apenas letras no nome (sem números, símbolos ou pontuação)',
    };
  }

  const parts = trimmed.split(/\s+/);

  // Deve ter pelo menos 2 partes (Nome + Sobrenome)
  if (parts.length < 2) {
    return { valid: false, error: 'Insira seu nome e sobrenome completo' };
  }

  // Primeiro nome deve ter no mínimo 2 letras
  if (parts[0].length < 2) {
    return { valid: false, error: 'O primeiro nome deve ter pelo menos 2 letras' };
  }

  // Último sobrenome deve ter no mínimo 2 letras
  if (parts[parts.length - 1].length < 2) {
    return { valid: false, error: 'O sobrenome deve ter pelo menos 2 letras' };
  }

  // Verificar partes intermediárias (exceto preposições válidas como 'e', 'de', 'da', 'do', 'dos', 'das', 'd'')
  const validPrepositions = new Set(['e', 'de', 'da', 'do', 'dos', 'das', 'd']);
  for (const part of parts) {
    const normPart = normalizeText(part.replace(/['\-]/g, ''));
    if (part.length < 2 && !validPrepositions.has(normPart)) {
      return { valid: false, error: `A parte "${part}" do nome é inválida` };
    }
  }

  // Anti-repetição de letras na mesma palavra (ex: "Daaanilo", "Siiilva", "aaaa")
  for (const part of parts) {
    if (/(.)\1{2,}/i.test(part)) {
      return { valid: false, error: 'Nome contém caracteres repetidos em sequência' };
    }
  }

  // Normalização das partes para testes anti-fraude
  const normParts = parts.map(p => normalizeText(p));

  // Anti-duplicação: O sobrenome não pode ser idêntico ao primeiro nome (ex: "Danilo Danilo", "Silva Silva")
  if (normParts[0] === normParts[1]) {
    return { valid: false, error: 'O sobrenome não pode ser idêntico ao primeiro nome' };
  }

  // Se todas as partes principais forem iguais
  const uniqueParts = new Set(normParts.filter(p => !validPrepositions.has(p)));
  if (uniqueParts.size <= 1) {
    return { valid: false, error: 'Nome inválido. Insira seu nome e sobrenome reais' };
  }

  // Bloqueio de palavras proibidas / mocks / testes
  for (const part of normParts) {
    if (FORBIDDEN_WORDS.has(part)) {
      return { valid: false, error: 'Por favor, insira um nome completo real e válido' };
    }
  }

  return { valid: true };
}

/**
 * Validação de E-mail
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const clean = email.toLowerCase().trim();
  const formatOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
  if (!formatOk) return false;

  const domain = clean.split('@')[1];
  if (!domain || DISPOSABLE_DOMAINS.has(domain)) return false;

  return true;
}

/**
 * Validação de Força da Senha
 */
export function isStrongPassword(senha: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!senha || senha.length < 8) errors.push('Mínimo de 8 caracteres');
  if (!/[A-Z]/.test(senha)) errors.push('Pelo menos uma letra maiúscula');
  if (!/[0-9]/.test(senha)) errors.push('Pelo menos um número');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
    errors.push('Pelo menos um caractere especial');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validação de Apelido (Nome de Guerra)
 */
export function isValidApelido(apelido: string): { valid: boolean; error?: string } {
  if (!apelido) return { valid: false, error: 'Apelido é obrigatório' };
  const clean = apelido.trim();
  if (clean.length < 3) return { valid: false, error: 'Apelido deve ter no mínimo 3 caracteres' };
  if (clean.length > 20) return { valid: false, error: 'Apelido deve ter no máximo 20 caracteres' };
  if (!/^[a-zA-Z0-9_.-]+$/.test(clean)) {
    return { valid: false, error: 'Apenas letras, números, hífen (-) e underline (_)' };
  }
  return { valid: true };
}
