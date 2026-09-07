#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Rolagem horizontal no celular
===========================================

A plataforma é usada no celular entre uma aula e outra, e o defeito mais
comum de layout responsivo é o mesmo em todo lugar: alguma coisa mais larga
que a tela empurra o CORPO da página para o lado. O sintoma é péssimo e
difícil de associar à causa — o texto passa a "escorregar" na horizontal em
telas que não têm nada de errado, e o dedo do aluno rola para o lado sem
querer no meio de uma questão.

Conteúdo largo pode existir: tabela, gráfico, bloco de código. O que ele não
pode é rolar a PÁGINA. Tem que rolar dentro do próprio container, atrás de
um `overflow-x-auto`.

Este script confere:

  1. toda `<table>` tem um ancestral com `overflow-x` por perto;
  2. toda largura fixa maior que a tela (`w-[NNNpx]`, `min-w-[NNNpx]`)
     também está atrás de um `overflow-x`;
  3. ninguém usa `100vw`, que no desktop inclui a barra de rolagem e gera
     estouro de alguns pixels.

Não substitui abrir no celular. Pega a classe de erro que dá para pegar
lendo o código, que é justamente a que passa despercebida no navegador
grande.

Uso:
    python scripts/checar_mobile.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "apps" / "web" / "src"

# Menor tela que a gente se compromete a atender. iPhone SE tem 375 CSS px;
# 360 cobre os Android pequenos que ainda aparecem.
LARGURA_MINIMA = 360

# Quantas linhas acima procurar pelo container de rolagem. O JSX costuma
# abrir a div do container logo antes; 6 linhas dão folga para atributos
# quebrados em várias linhas sem começar a aceitar qualquer coisa.
JANELA = 6

problemas: list[str] = []
tabelas = 0
largas = 0

arquivos = sorted(BASE.rglob("*.tsx"))


def tem_scroll_perto(linhas: list[str], i: int) -> bool:
    """Procura `overflow-x-auto`/`overflow-x-scroll` nas linhas anteriores."""
    inicio = max(0, i - JANELA)
    trecho = "".join(linhas[inicio: i + 1])
    return bool(re.search(r"overflow-x-(auto|scroll)", trecho))


for arq in arquivos:
    try:
        linhas = arq.read_text(encoding="utf-8").splitlines(keepends=True)
    except UnicodeDecodeError:
        continue

    rel = arq.relative_to(RAIZ)

    for i, linha in enumerate(linhas):
        # ─── 1. Tabelas ──────────────────────────────────────
        if "<table" in linha:
            tabelas += 1
            if not tem_scroll_perto(linhas, i):
                problemas.append(
                    f"{rel}:{i + 1}\n"
                    f"      <table> sem `overflow-x-auto` num ancestral próximo.\n"
                    f"      Tabela é o caso número um de rolagem lateral no celular."
                )

        # ─── 2. Larguras fixas maiores que a tela ────────────
        for m in re.finditer(r"(?:^|[\"'\s])(?:min-)?w-\[(\d+)px\]", linha):
            px = int(m.group(1))
            if px <= LARGURA_MINIMA:
                continue
            largas += 1
            if not tem_scroll_perto(linhas, i):
                problemas.append(
                    f"{rel}:{i + 1}\n"
                    f"      largura fixa de {px}px sem `overflow-x-auto` por perto — "
                    f"maior que a tela de {LARGURA_MINIMA}px.\n"
                    f"      {linha.strip()[:100]}"
                )

        # ─── 3. 100vw ────────────────────────────────────────
        if re.search(r"(?:^|[\"'\s:])(?:w-screen|100vw)", linha):
            problemas.append(
                f"{rel}:{i + 1}\n"
                f"      usa a largura da viewport inteira. No desktop `100vw` inclui a\n"
                f"      barra de rolagem e sobra alguns pixels; use `w-full`.\n"
                f"      {linha.strip()[:100]}"
            )


# ══════════════════════════════════════════════════════════════════
print(f"Arquivos .tsx analisados : {len(arquivos)}")
print(f"Tabelas encontradas      : {tabelas}")
print(f"Larguras fixas > {LARGURA_MINIMA}px  : {largas}")
print()

if problemas:
    print(f"!! {len(problemas)} APONTAMENTO(S):\n")
    for p in problemas:
        print(f"  - {p}")
    print("\n(heurística — confira cada um antes de mexer)")
    sys.exit(1)

print(
    "Nada rola a página para o lado: toda tabela e toda largura fixa maior "
    "que a tela\nestão dentro de um container com rolagem própria."
)
