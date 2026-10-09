// ============================================================
// @batcaverna/utils — Utilitários de Semver & Changelog
// ============================================================

import type { ReleaseItem } from '@batcaverna/types';

export interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
  valid: boolean;
}

/**
 * Faz o parse de uma string de versão no padrão semver (ex: "3.2.4", "v3.3.0").
 */
export function parseSemver(version: string | null | undefined): ParsedSemver {
  if (!version || typeof version !== 'string') {
    return { major: 0, minor: 0, patch: 0, valid: false };
  }

  const clean = version.trim().replace(/^v/i, '');
  const parts = clean.split('.');

  const major = parseInt(parts[0] || '0', 10);
  const minor = parseInt(parts[1] || '0', 10);
  const patch = parseInt(parts[2] || '0', 10);

  const valid = !isNaN(major) && !isNaN(minor) && !isNaN(patch) && parts.length >= 1;

  return {
    major: isNaN(major) ? 0 : major,
    minor: isNaN(minor) ? 0 : minor,
    patch: isNaN(patch) ? 0 : patch,
    valid,
  };
}

/**
 * Compara duas versões semver.
 * Retorna:
 *  > 0 se v1 for maior que v2 (ex: 3.3.0 vs 3.2.4)
 *  0 se forem iguais
 *  < 0 se v1 for menor que v2 (ex: 3.1.5 vs 3.2.0)
 */
export function compareSemver(v1: string | null | undefined, v2: string | null | undefined): number {
  const p1 = parseSemver(v1);
  const p2 = parseSemver(v2);

  if (p1.major !== p2.major) return p1.major - p2.major;
  if (p1.minor !== p2.minor) return p1.minor - p2.minor;
  return p1.patch - p2.patch;
}

/**
 * Retorna verdadeiro se targetVersion for estritamente mais recente que compareWithVersion.
 */
export function isVersionGreater(targetVersion: string, compareWithVersion: string | null | undefined): boolean {
  if (!compareWithVersion) return true;
  return compareSemver(targetVersion, compareWithVersion) > 0;
}

/**
 * Filtra quais releases o usuário perdeu desde a última versão que ele visualizou.
 * Se lastSeenVersion for nulo (novo usuário), retorna lista vazia para evitar sobrecarga.
 */
export function getMissedReleases(
  releases: ReleaseItem[],
  lastSeenVersion?: string | null
): ReleaseItem[] {
  if (!lastSeenVersion || typeof lastSeenVersion !== 'string') {
    return [];
  }

  return releases
    .filter((rel) => isVersionGreater(rel.versao, lastSeenVersion))
    .sort((a, b) => compareSemver(b.versao, a.versao));
}

/**
 * Formata um timestamp ISO em tempo relativo amigável em português (pt-BR).
 * Ex: "Hoje às 15:40", "Ontem às 20:10", "Há 4 dias", "25 de set. de 2026"
 */
export function formatRelativeTime(isoDate: string): string {
  try {
    const data = new Date(isoDate);
    if (isNaN(data.getTime())) return 'Recentemente';

    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    const horaStr = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (diffMin < 2) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} min`;

    // Verifica se foi no mesmo dia civil
    const mesmoDia =
      data.getDate() === agora.getDate() &&
      data.getMonth() === agora.getMonth() &&
      data.getFullYear() === agora.getFullYear();

    if (mesmoDia) {
      return `Hoje às ${horaStr}`;
    }

    const ontem = new Date(agora);
    ontem.setDate(agora.getDate() - 1);
    const foiOntem =
      data.getDate() === ontem.getDate() &&
      data.getMonth() === ontem.getMonth() &&
      data.getFullYear() === ontem.getFullYear();

    if (foiOntem) {
      return `Ontem às ${horaStr}`;
    }

    if (diffDias < 7) {
      return `Há ${diffDias} ${diffDias === 1 ? 'dia' : 'dias'}`;
    }

    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Recentemente';
  }
}

/**
 * Retorna formatos completos de data, hora e relativo para exibição nos cards.
 */
export function formatReleaseDateTime(isoDate: string): {
  dataFormatada: string;
  horaFormatada: string;
  tempoRelativo: string;
} {
  try {
    const data = new Date(isoDate);
    if (isNaN(data.getTime())) {
      return {
        dataFormatada: 'Data recente',
        horaFormatada: '--:--',
        tempoRelativo: 'Recentemente',
      };
    }

    const dataFormatada = data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const horaFormatada = data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const tempoRelativo = formatRelativeTime(isoDate);

    return {
      dataFormatada,
      horaFormatada,
      tempoRelativo,
    };
  } catch {
    return {
      dataFormatada: 'Data recente',
      horaFormatada: '--:--',
      tempoRelativo: 'Recentemente',
    };
  }
}
