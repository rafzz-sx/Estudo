// ============================================================
// @batcaverna/utils — Funções utilitárias compartilhadas
// Formatação, validações, cálculos de XP/nível
// ============================================================

import { NIVEIS_GAMIFICACAO } from '@batcaverna/ui';

// ─── Formatação de Tempo ─────────────────────────────────────

/**
 * Formata segundos em string amigável: "12h 45min", "3 dias 4h"
 */
export function formatarTempoEstudo(segundos: number): string {
  if (segundos < 60) return `${segundos}s`;

  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 0) {
    const horasRestantes = horas % 24;
    return horasRestantes > 0
      ? `${dias} ${dias === 1 ? 'dia' : 'dias'} ${horasRestantes}h`
      : `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  }

  if (horas > 0) {
    const minutosRestantes = minutos % 60;
    return minutosRestantes > 0
      ? `${horas}h ${minutosRestantes}min`
      : `${horas}h`;
  }

  return `${minutos}min`;
}

/**
 * Formata segundos em MM:SS para cronômetro de simulado
 */
export function formatarCronometro(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const sec = segundos % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Formata data/hora para o rodapé de versão (somente hora cheia)
 * Ex: "27/08/2026 às 14h"
 */
export function formatarDataHoraVersao(isoDate: string): string {
  const date = new Date(isoDate);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  const hora = date.getHours();
  return `${dia}/${mes}/${ano} às ${hora}h`;
}

// ─── Validações ──────────────────────────────────────────────

/**
 * Valida formato de e-mail
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida força da senha (mínimo 8 chars, maiúscula, número, especial)
 */
export function validarSenha(senha: string): {
  valida: boolean;
  erros: string[];
} {
  const erros: string[] = [];

  if (senha.length < 8) {
    erros.push('Mínimo de 8 caracteres');
  }
  if (!/[A-Z]/.test(senha)) {
    erros.push('Pelo menos uma letra maiúscula');
  }
  if (!/[0-9]/.test(senha)) {
    erros.push('Pelo menos um número');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
    erros.push('Pelo menos um caractere especial');
  }

  return { valida: erros.length === 0, erros };
}

/**
 * Valida apelido/nickname (3-20 chars, sem espaços no início/fim)
 */
export function validarApelido(apelido: string): boolean {
  const trimmed = apelido.trim();
  return trimmed.length >= 3 && trimmed.length <= 20;
}

// ─── Cálculos de XP / Nível ─────────────────────────────────

/**
 * Calcula o XP necessário para o próximo nível
 * Fórmula: base * (nivel ^ 1.4)
 */
export function calcularXpParaProximoNivel(nivelAtual: number): number {
  const proximoNivel = NIVEIS_GAMIFICACAO.find(n => n.nivel === nivelAtual + 1);
  if (!proximoNivel) {
    // Após nível 15, cada nível extra custa mais 5000 XP
    const nivelMax = NIVEIS_GAMIFICACAO[NIVEIS_GAMIFICACAO.length - 1];
    return nivelMax.xp_min + (nivelAtual - nivelMax.nivel + 1) * 5000;
  }
  return proximoNivel.xp_min;
}

/**
 * Determina o nível atual baseado no XP total
 */
export function calcularNivel(xpTotal: number): {
  nivel: number;
  titulo: string;
  xp_atual_no_nivel: number;
  xp_necessario_proximo: number;
  progresso_percentual: number;
} {
  let nivelAtual: (typeof NIVEIS_GAMIFICACAO)[number] = NIVEIS_GAMIFICACAO[0];

  for (const nivel of NIVEIS_GAMIFICACAO) {
    if (xpTotal >= nivel.xp_min) {
      nivelAtual = nivel;
    } else {
      break;
    }
  }

  // Para níveis acima de 15
  if (xpTotal >= NIVEIS_GAMIFICACAO[NIVEIS_GAMIFICACAO.length - 1].xp_min) {
    const nivelMax = NIVEIS_GAMIFICACAO[NIVEIS_GAMIFICACAO.length - 1];
    const xpAcimaDoMax = xpTotal - nivelMax.xp_min;
    const niveisExtras = Math.floor(xpAcimaDoMax / 5000);
    const nivelFinal = nivelMax.nivel + niveisExtras;
    const xpBaseNivelAtual = nivelMax.xp_min + niveisExtras * 5000;
    const xpProximoNivel = xpBaseNivelAtual + 5000;

    return {
      nivel: nivelFinal,
      titulo: nivelMax.titulo,
      xp_atual_no_nivel: xpTotal - xpBaseNivelAtual,
      xp_necessario_proximo: 5000,
      progresso_percentual: Math.min(100, ((xpTotal - xpBaseNivelAtual) / 5000) * 100),
    };
  }

  const xpProximoNivel = calcularXpParaProximoNivel(nivelAtual.nivel);
  const xpNoNivel = xpTotal - nivelAtual.xp_min;
  const xpNecessario = xpProximoNivel - nivelAtual.xp_min;

  return {
    nivel: nivelAtual.nivel,
    titulo: nivelAtual.titulo,
    xp_atual_no_nivel: xpNoNivel,
    xp_necessario_proximo: xpNecessario,
    progresso_percentual: Math.min(100, (xpNoNivel / xpNecessario) * 100),
  };
}

/**
 * Calcula o multiplicador de continuidade de estudo (seção 8.2)
 * A cada 15 min contínuos: +10%, até +50%
 */
export function calcularMultiplicadorContinuidade(blocosCompletados: number): number {
  const bonus = Math.min(blocosCompletados * 0.1, 0.5);
  return 1 + bonus;
}

/**
 * Calcula o bônus de XP por combo de acertos (seção 8.3)
 * 1-3 acertos = normal; 4+ = bônus crescente até +50%
 */
export function calcularBonusCombo(combo: number): number {
  if (combo <= 3) return 1;
  const bonus = Math.min((combo - 3) * 0.05, 0.5);
  return 1 + bonus;
}

// ─── Hash de conteúdo (Armazém de Questões) ──────────────────

/**
 * Normaliza texto para geração de hash de conteúdo
 * Remove espaços extras, converte para minúsculas, normaliza acentuação
 */
export function normalizarTextoParaHash(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Paginação ───────────────────────────────────────────────

export function calcularPaginacao(total: number, page: number, perPage: number) {
  const totalPages = Math.ceil(total / perPage);
  const offset = (page - 1) * perPage;

  return {
    offset,
    limit: perPage,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
}

// ─── Formatação de números ───────────────────────────────────

/**
 * Formata número com separador de milhar (pt-BR)
 */
export function formatarNumero(n: number): string {
  return n.toLocaleString('pt-BR');
}

/**
 * Formata percentual com uma casa decimal
 */
export function formatarPercentual(valor: number): string {
  return `${valor.toFixed(1)}%`;
}
