#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Sanidade dos seeds SQL antes de colar no Supabase
===============================================================

Rodar um seed quebrado no SQL Editor custa caro: o erro aparece depois de
minutos de execução e o BEGIN/COMMIT pode deixar coisa pela metade. Este
script pega os erros baratos antes disso:

  1. `$md$` desbalanceado (o mais comum ao escrever teoria à mão)
  2. BEGIN sem COMMIT
  3. aspas simples ímpares fora dos blocos dollar-quoted
  4. tema de vídeo-aula sem teoria correspondente (a trilha ficaria com o
     vídeo solto, sem o texto ao lado)

Uso:
    python scripts/checar_seeds.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SEEDS = Path("supabase/seeds")

# ('Tema', -> primeiro literal de uma linha que abre um VALUES de teoria
RE_TEMA_TEORIA = re.compile(r"^\('([^']+)',\s*$", re.M)
# ON m.nome = 'Matemática'  /  ON m.nome = v.materia_nome
RE_MATERIA_TEORIA = re.compile(r"ON m\.nome = '([^']+)'")
# ('Matemática', 'Geometria Plana', ... -> linha do seed de vídeo-aulas
RE_LINHA_VIDEO = re.compile(r"^\s*\('([^']+)', '([^']+)', '", re.M)


def checar_estrutura(caminho: Path) -> list[str]:
    problemas: list[str] = []
    texto = caminho.read_text(encoding="utf-8")

    if texto.count("$md$") % 2 != 0:
        problemas.append(
            f"$md$ desbalanceado ({texto.count('$md$')} ocorrências, "
            "precisa ser par)"
        )

    begins, commits = texto.count("BEGIN;"), texto.count("COMMIT;")
    if begins != commits:
        problemas.append(f"BEGIN({begins}) != COMMIT({commits})")

    # Aspas simples só são confiáveis fora dos blocos $md$ (lá dentro há
    # apóstrofo de texto corrido à vontade).
    fora = re.sub(r"\$md\$.*?\$md\$", "", texto, flags=re.S)
    # '' é um apóstrofo escapado e conta como par.
    if fora.replace("''", "").count("'") % 2 != 0:
        problemas.append("aspas simples ímpares fora dos blocos $md$")

    return problemas


def temas_de_teoria() -> set[tuple[str, str]]:
    """{(materia, tema)} declarados nos seeds de teoria."""
    pares: set[tuple[str, str]] = set()

    for arquivo in sorted(SEEDS.glob("teoria_*.sql")):
        texto = arquivo.read_text(encoding="utf-8")
        # Cada bloco INSERT ... JOIN (VALUES ... ) ON m.nome = 'X'
        for bloco in texto.split("INSERT INTO teoria_conteudo")[1:]:
            materias = RE_MATERIA_TEORIA.findall(bloco)
            if not materias:
                continue
            # Um bloco pode fechar em mais de uma matéria (Português/Inglês).
            for tema in RE_TEMA_TEORIA.findall(bloco):
                for materia in materias:
                    pares.add((materia, tema))

    return pares


def temas_de_video() -> set[tuple[str, str]]:
    arquivo = SEEDS / "videoaulas_01.sql"
    if not arquivo.exists():
        return set()
    texto = arquivo.read_text(encoding="utf-8")
    return set(RE_LINHA_VIDEO.findall(texto))


def main() -> int:
    if not SEEDS.exists():
        print(f"Pasta nao encontrada: {SEEDS}")
        return 1

    falhou = False

    print("=== Estrutura dos arquivos ===")
    for arquivo in sorted(SEEDS.glob("*.sql")):
        problemas = checar_estrutura(arquivo)
        if problemas:
            falhou = True
            print(f"  [ERRO] {arquivo.name}")
            for p in problemas:
                print(f"         - {p}")
        else:
            print(f"  [ok]   {arquivo.name}")

    print("\n=== Casamento teoria <-> video-aula (por tema) ===")
    teoria = temas_de_teoria()
    video = temas_de_video()

    orfaos = sorted(video - teoria)
    if orfaos:
        print(f"  [aviso] {len(orfaos)} tema(s) de video sem teoria:")
        for materia, tema in orfaos:
            print(f"          {materia} / {tema}")
    else:
        print("  [ok]   todo tema de video tem teoria correspondente")

    sem_video = sorted(teoria - video)
    if sem_video:
        print(f"\n  [info] {len(sem_video)} tema(s) de teoria ainda sem video:")
        for materia, tema in sem_video:
            print(f"          {materia} / {tema}")

    print(f"\nTeoria: {len(teoria)} temas  |  Video-aulas: {len(video)} temas")
    return 1 if falhou else 0


if __name__ == "__main__":
    sys.exit(main())
