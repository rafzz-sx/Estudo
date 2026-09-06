#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Paridade do hash entre o pipeline Python e o importador web
========================================================================

O importador do painel admin (`apps/web/src/lib/importador-questoes.ts`)
precisa gerar EXATAMENTE o mesmo SHA-256 que `scripts/parse_questoes.py`.
Se os dois divergirem, uma prova já importada pelo terminal entra de novo
pela tela — a deduplicação deixa de existir.

Como não há Node.js nesta máquina para rodar o TypeScript, este script
reimplementa em Python a normalização escrita no TS e compara os dois
resultados sobre o banco real. Se o TS mudar, ajuste a função
`normalizar_como_o_ts` abaixo junto e rode de novo.

Uso:
    python scripts/checar_paridade_hash.py
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from parse_questoes import hash_conteudo, normalizar_para_hash  # noqa: E402


def normalizar_como_o_ts(texto: str) -> str:
    """Espelho fiel do `normalizarParaHash` do importador-questoes.ts.

    TS:
        texto.normalize('NFD')
             .replace(/[\\u0300-\\u036f]/g, '')   <- tira o acento
             .replace(/[^\\x00-\\x7F]/g, '')      <- descarta nao-ASCII
             .replace(/\\s+/g, ' ')
             .trim()
    """
    t = texto.lower()
    t = unicodedata.normalize("NFD", t)
    # Remove as marcas combinantes (o acento em si).
    t = "".join(c for c in t if not unicodedata.combining(c))
    # Descarta o que sobrou fora do ASCII.
    t = "".join(c for c in t if ord(c) < 128)
    return re.sub(r"\s+", " ", t).strip()


def hash_como_o_ts(concurso: str, ano, enunciado: str) -> str:
    base = f"{concurso}|{ano}|{normalizar_como_o_ts(enunciado)}"
    return hashlib.sha256(base.encode("utf-8")).hexdigest()


def main() -> int:
    entrada = Path("scripts/out/questoes.json")
    if not entrada.exists():
        print(f"Rode antes: python scripts/parse_questoes.py")
        return 1

    questoes = json.loads(entrada.read_text(encoding="utf-8"))

    divergentes = []
    for q in questoes:
        py = hash_conteudo(q["concurso_sigla"], q["ano"], q["enunciado"])
        ts = hash_como_o_ts(q["concurso_sigla"], q["ano"], q["enunciado"])
        if py != ts:
            divergentes.append(q)

    total = len(questoes)
    iguais = total - len(divergentes)
    print(f"Questoes comparadas : {total}")
    print(f"Hash identico       : {iguais}")
    print(f"Hash divergente     : {len(divergentes)}")

    if divergentes:
        print("\nPrimeiros casos divergentes:")
        for q in divergentes[:5]:
            print(f"  {q['arquivo_origem']} #{q['numero_original']}")
            print(f"    py: {normalizar_para_hash(q['enunciado'])[:90]!r}")
            print(f"    ts: {normalizar_como_o_ts(q['enunciado'])[:90]!r}")
        print(
            "\n[FALHA] O importador do painel vai duplicar questao ja"
            " importada pelo terminal."
        )
        return 1

    print("\n[OK] O importador do painel deduplica contra o banco existente.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
