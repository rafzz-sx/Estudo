#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Codemod: troca `fetch("/api/...")` por `fetchWithAuth("/api/...")` no front.

O `fetchWithAuth` (apps/web/src/stores/auth-store.ts) anexa o header
`Authorization: Bearer <token>` e, diante de um 401, renova o access token
pelo refresh token e repete a chamada. Com `fetch` puro, a sessão morria
silenciosamente quando o token de 10h expirava.

Uso:
    python scripts/codemod_fetch.py --dry-run
    python scripts/codemod_fetch.py
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

ALVOS = [
    Path("apps/web/src/app"),
    Path("apps/web/src/components"),
    Path("apps/web/src/stores"),
]

# auth-store.ts é a própria implementação de fetchWithAuth: converter o
# `fetch('/api/auth/refresh')` de dentro dele criaria recursão infinita.
IGNORAR = {"auth-store.ts"}

# `fetch("/api/...` ou `fetch(`/api/...` — só chamadas à própria API.
RE_FETCH = re.compile(r"(?<![\w.])fetch\(\s*([\"'`])/api/")

IMPORT_STORE = 'import { fetchWithAuth } from "@/stores/auth-store";'
RE_IMPORT_STORE = re.compile(
    r"import\s*\{([^}]*)\}\s*from\s*[\"']@/stores/auth-store[\"'];"
)


def garantir_import(texto: str, arquivo: Path) -> str:
    # O próprio auth-store define fetchWithAuth: nada a importar.
    if arquivo.name == "auth-store.ts":
        return texto

    m = RE_IMPORT_STORE.search(texto)
    if m:
        nomes = [n.strip() for n in m.group(1).split(",") if n.strip()]
        if "fetchWithAuth" in nomes:
            return texto
        nomes.append("fetchWithAuth")
        novo = (
            "import { " + ", ".join(sorted(set(nomes))) + ' } from "@/stores/auth-store";'
        )
        return texto[: m.start()] + novo + texto[m.end() :]

    imports = list(re.finditer(r"^import .*?;$", texto, re.M))
    if imports:
        fim = imports[-1].end()
        return texto[:fim] + "\n" + IMPORT_STORE + texto[fim:]
    return IMPORT_STORE + "\n" + texto


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    total_trocas = 0
    tocados = []

    for raiz in ALVOS:
        for arquivo in sorted(list(raiz.rglob("*.tsx")) + list(raiz.rglob("*.ts"))):
            if arquivo.name in IGNORAR:
                continue
            texto = arquivo.read_text(encoding="utf-8")
            n = len(RE_FETCH.findall(texto))
            if not n:
                continue

            novo = RE_FETCH.sub(lambda m: f"fetchWithAuth({m.group(1)}/api/", texto)
            novo = garantir_import(novo, arquivo)

            if not args.dry_run:
                arquivo.write_text(novo, encoding="utf-8")
            tocados.append((arquivo, n))
            total_trocas += n

    for arq, n in tocados:
        print(f"  {n:>2} chamada(s)  {arq.as_posix()}")
    print(f"\nArquivos alterados: {len(tocados)}   |   Chamadas trocadas: {total_trocas}")
    if args.dry_run:
        print("(dry-run — nada foi gravado)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
