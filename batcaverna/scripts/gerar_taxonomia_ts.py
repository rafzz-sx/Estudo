#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera `apps/web/src/lib/taxonomia.ts` a partir de `scripts/taxonomia.py`.

─── Por que isto existe ──────────────────────────────────────────────────

O importador do painel admin canonizava a MATÉRIA e a DIFICULDADE, mas
gravava o ASSUNTO exatamente como veio no .txt:

    assunto: (campo(CAMPOS.assunto) || 'Geral').slice(0, 150),

Ou seja: o caminho que o INSTRUCOES-DEPLOY.txt chama de "recomendado, não
precisa de Python" era justamente o que voltava a fragmentar a taxonomia.
Cada prova importada pela tela criava assuntos novos com o rótulo livre da
banca — "Geometria Plana (Triângulo Equilátero e Radiciação)" virava uma
linha própria em `assuntos` —, desfazendo em silêncio a unificação de 2.452
rótulos em 529 que a migration 011 gasta 224 KB para fazer.

A taxonomia tinha que existir dos dois lados. Duas cópias escritas à mão
divergem na primeira vez que alguém corrigir só uma, então o TS é GERADO a
partir do Python, que continua sendo a fonte única.

O algoritmo vai junto porque separá-lo dos dados não ajudaria: é a dupla
(regra de casamento + ordem das listas) que decide o resultado.

Uso:
    python scripts/gerar_taxonomia_ts.py
    python scripts/checar_paridade_taxonomia.py   # confere os dois lados
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from taxonomia import HERANCA, TAXONOMIA  # noqa: E402

SAIDA = RAIZ / "apps" / "web" / "src" / "lib" / "taxonomia.ts"

CABECALHO = '''/**
 * Taxonomia canônica de assuntos — ARQUIVO GERADO.
 *
 * GERADO POR scripts/gerar_taxonomia_ts.py A PARTIR DE scripts/taxonomia.py.
 * NÃO EDITE À MÃO: a fonte é o Python, e a paridade entre os dois é conferida
 * por scripts/checar_paridade_taxonomia.py sobre as %(total)d questões do banco.
 *
 * ─── O que este arquivo resolve ─────────────────────────────────────────
 *
 * Os .txt das provas usam rótulo livre para o assunto. Sem canonizar, 3.247
 * questões geravam 2.452 assuntos distintos — 88%% deles com UMA questão só.
 * "Geometria Plana" aparecia com 23 questões quando tinha 104, e isso
 * quebrava em silêncio o card "Assuntos que caem", a ordenação da trilha, a
 * revisão espaçada, o caderno de erros e o plano de estudo. Nada dava erro.
 * Tudo mentia.
 *
 * O pipeline Python já canonizava. O importador do painel admin NÃO — ele
 * gravava o rótulo cru, então importar pela tela refragmentava a taxonomia
 * que a migration 011 tinha acabado de unificar.
 *
 * ─── Como funciona ──────────────────────────────────────────────────────
 *
 * Para cada matéria há uma lista ORDENADA de [canônico, termos]. O primeiro
 * que casar vence — por isso a ordem vai do específico para o geral.
 *
 * Os termos são PREFIXOS de propósito: "interpretac" cobre
 * "interpretação/interpretativo", "text" cobre "texto/textual". Por isso o
 * casamento não exige palavra inteira. Mas exige INÍCIO DE PALAVRA: sem
 * isso, "organica" casa dentro de "inorganica" e "etica" dentro de
 * "estetica" — foi esse o defeito que arquivou 14 questões de química
 * inorgânica como Química Orgânica e deixou "Funções Inorgânicas" com zero.
 */

'''


def ts_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def main() -> int:
    total_canonicos = sum(len(v) for v in TAXONOMIA.values())

    linhas: list[str] = [CABECALHO % {"total": total_canonicos}]

    # ─── Dados ───────────────────────────────────────────────
    linhas.append("type Entrada = readonly [string, readonly string[]];\n")
    linhas.append("export const TAXONOMIA: Record<string, readonly Entrada[]> = {")
    for materia, entradas in TAXONOMIA.items():
        linhas.append(f"  {ts_str(materia)}: [")
        for canonico, termos in entradas:
            termos_ts = ", ".join(ts_str(t) for t in termos)
            linhas.append(f"    [{ts_str(canonico)}, [{termos_ts}]],")
        linhas.append("  ],")
    linhas.append("};\n")

    linhas.append(
        "/** Matérias guarda-chuva do ENEM: herdam as listas das matérias-base. */"
    )
    linhas.append("export const HERANCA: Record<string, readonly string[]> = {")
    for guarda, origens in HERANCA.items():
        origens_ts = ", ".join(ts_str(o) for o in origens)
        linhas.append(f"  {ts_str(guarda)}: [{origens_ts}],")
    linhas.append("};\n")

    # ─── Algoritmo ───────────────────────────────────────────
    linhas.append(ALGORITMO)

    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text("\n".join(linhas), encoding="utf-8", newline="\n")

    print(f"Matérias          : {len(TAXONOMIA)}")
    print(f"Assuntos canônicos: {total_canonicos}")
    print(f"Termos            : {sum(len(t) for v in TAXONOMIA.values() for _, t in v)}")
    print(f"\n[OK] {SAIDA.relative_to(RAIZ)} "
          f"({SAIDA.stat().st_size // 1024} KB)")
    return 0


ALGORITMO = r'''/**
 * Reduz o plural português ao singular, de forma grosseira e SIMÉTRICA.
 *
 * O ponto não é acertar gramática: é que o mesmo texto vire a mesma coisa
 * dos dois lados da comparação. Sem isto, o termo "inequação" não casa com
 * o rótulo "Inequações" e dezenas de assuntos escapam por causa de um "s".
 *
 * Espelho de `_singular` em scripts/taxonomia.py.
 */
function singular(palavra: string): string {
  if (palavra.length <= 4) return palavra;
  const trocas: readonly (readonly [string, string])[] = [
    ['oes', 'ao'], ['aes', 'ao'], ['ais', 'al'], ['eis', 'el'],
    ['ois', 'ol'], ['zes', 'z'], ['res', 'r'], ['ses', 's'],
    ['ns', 'm'], ['is', 'il'],
  ];
  for (const [fim, troca] of trocas) {
    if (palavra.endsWith(fim)) return palavra.slice(0, -fim.length) + troca;
  }
  return palavra.endsWith('s') ? palavra.slice(0, -1) : palavra;
}

/** Espelho de `_norm`: minúscula, sem acento, espaço único, singular. */
function norm(texto: string): string {
  const t = (texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return '';
  return t.split(' ').map(singular).join(' ');
}

/**
 * O termo precisa começar no INÍCIO DE UMA PALAVRA do rótulo.
 *
 * Não pode exigir palavra inteira — os termos são prefixos de propósito.
 * Não pode aceitar substring crua — substring crua casa no meio da palavra,
 * e palavras se contêm: "organica" dentro de "inorganica", "etica" dentro
 * de "estetica", "sintaxe" dentro de "morfossintaxe".
 *
 * Espelho de `_casa` em scripts/taxonomia.py.
 */
function casa(termo: string, alvo: string): boolean {
  if (!termo) return false;
  let de = alvo.indexOf(termo);
  while (de !== -1) {
    const anterior = de > 0 ? alvo[de - 1] : '';
    if (!/[0-9a-z]/.test(anterior)) return true;
    de = alvo.indexOf(termo, de + 1);
  }
  return false;
}

/** " e " entra como separador: "Equações Lineares e Área" tem dois assuntos. */
const SEPARADORES = /\s*(?:[/;·—–|]|\s-\s|\(|,|\se\s)\s*/;

/**
 * Corta o rótulo no primeiro separador e limpa. É o que transforma
 * "Geometria Plana (Triângulo Equilátero e Radiciação)" em "Geometria Plana"
 * mesmo quando nenhum termo do dicionário casou.
 *
 * Espelho de `reduzir` em scripts/taxonomia.py.
 */
export function reduzir(assunto: string): string {
  let base = (assunto ?? '').split(SEPARADORES)[0] ?? '';
  base = base.replace(/\)/g, '').replace(/^[ .\-—]+|[ .\-—]+$/g, '');
  base = base.replace(/\s+/g, ' ');
  if (!base) return 'Geral';

  const miudas = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'a', 'o', 'no', 'na']);
  return base
    .split(' ')
    .map((p, i) => {
      if (i && miudas.has(p.toLowerCase())) return p;
      // Espelha `str.isupper()` do Python: precisa ter letra, e toda letra
      // tem que ser maiúscula. `p === p.toUpperCase()` sozinho diria "sim"
      // para "123" e para "-", que não têm letra nenhuma.
      if (p !== p.toLowerCase() && p === p.toUpperCase()) return p;
      // Espelha `str.capitalize()`: primeira em maiúscula, RESTO EM MINÚSCULA.
      // Sem o toLowerCase, "Pré-Socrática" ficava "Pré-Socrática" no TS e
      // "Pré-socrática" no Python — dois assuntos diferentes para o mesmo
      // rótulo, dependendo de por onde a prova entrasse.
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    })
    .join(' ');
}

function listasDaMateria(materia: string): readonly Entrada[] {
  const propria = TAXONOMIA[materia];
  if (propria) return propria;

  const combinada: Entrada[] = [];
  for (const origem of HERANCA[materia] ?? []) {
    combinada.push(...(TAXONOMIA[origem] ?? []));
  }
  return combinada;
}

/**
 * Devolve o assunto canônico e se ele casou no dicionário.
 *
 * `casouNoDicionario = false` significa que caiu na redução por regra — o
 * número desses é a métrica de cobertura da taxonomia. Preferimos um assunto
 * solto e honesto a forçá-lo num balde errado.
 *
 * Espelho de `canonizar` em scripts/taxonomia.py, conferido sobre o banco
 * real por scripts/checar_paridade_taxonomia.py.
 */
export function canonizarAssunto(
  materia: string | null,
  assunto: string | null
): { assunto: string; casouNoDicionario: boolean } {
  const bruto = (assunto ?? '').trim();
  if (!bruto) return { assunto: 'Geral', casouNoDicionario: false };

  const alvo = norm(bruto);

  for (const [canonico, termos] of listasDaMateria(materia ?? '')) {
    for (const termo of termos) {
      if (casa(norm(termo), alvo)) {
        return { assunto: canonico, casouNoDicionario: true };
      }
    }
  }

  return { assunto: reduzir(bruto), casouNoDicionario: false };
}
'''


if __name__ == "__main__":
    raise SystemExit(main())
