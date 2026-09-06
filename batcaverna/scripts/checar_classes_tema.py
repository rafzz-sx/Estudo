#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Classes de cor que não existem no tema
====================================================

No Tailwind v4 as cores vêm do bloco `@theme` do globals.css. Uma classe
que aponta para um token inexistente — `bg-bat-purple-950` quando a escala
para em 900 — **não gera CSS nenhum e falha em silêncio**: o elemento
simplesmente aparece sem fundo, sem erro no console e sem quebrar o build.

É o tipo de defeito que só se descobre olhando a tela no lugar certo. Este
script encontra todos de uma vez.

Uso:
    python scripts/checar_classes_tema.py
"""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

CSS = Path("apps/web/src/app/globals.css")
FONTES = Path("apps/web/src")

# bg-bat-gold-400  text-bat-text-muted  border-bat-border/30  from-bat-bg
RE_USO = re.compile(
    r"\b(?:bg|text|border|from|via|to|ring|fill|stroke|shadow|outline|decoration|accent|caret|divide|placeholder)-"
    r"(bat-[a-z0-9-]+?)(?:/\d{1,3})?(?=[\s\"'`}\]]|$)"
)


def tokens_do_tema() -> set[str]:
    if not CSS.exists():
        print(f"Nao encontrei {CSS}")
        sys.exit(1)
    texto = CSS.read_text(encoding="utf-8")
    return set(re.findall(r"--color-(bat-[a-z0-9-]+)\s*:", texto))


def main() -> int:
    definidos = tokens_do_tema()
    usos: dict[str, list[str]] = defaultdict(list)

    arquivos = [
        p
        for p in FONTES.rglob("*")
        if p.suffix in {".tsx", ".ts"} and p.is_file()
    ]

    for caminho in arquivos:
        texto = caminho.read_text(encoding="utf-8", errors="ignore")
        for linha_num, linha in enumerate(texto.splitlines(), start=1):
            for token in RE_USO.findall(linha):
                if token not in definidos:
                    usos[token].append(
                        f"{caminho.as_posix()}:{linha_num}"
                    )

    print(f"Tokens definidos no tema : {len(definidos)}")
    print(f"Arquivos varridos        : {len(arquivos)}")

    if not usos:
        print("\n[OK] Nenhuma classe aponta para token inexistente.")
        return 0

    print(f"\n[FALHA] {len(usos)} token(s) usados e nao definidos:\n")
    for token, locais in sorted(usos.items(), key=lambda x: -len(x[1])):
        print(f"  {token}  ({len(locais)} uso(s))")
        for local in locais[:6]:
            print(f"      {local}")
        if len(locais) > 6:
            print(f"      ... e mais {len(locais) - 6}")
        # Sugere o vizinho mais proximo na mesma familia.
        familia = token.rsplit("-", 1)[0]
        vizinhos = sorted(t for t in definidos if t.startswith(familia))
        if vizinhos:
            print(f"      existe: {', '.join(vizinhos[:8])}")
        print()

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
