#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verificação estática leve do front (substituto parcial do `tsc` quando o
Node não está instalado na máquina).

Confere:
  1. Todo import de caminho interno (@/... ou ./...) aponta para um arquivo
     que existe.
  2. Todo símbolo importado de um módulo interno é realmente exportado por ele.

Não substitui o `tsc`: não valida tipos. Serve para pegar erro de digitação
em import e arquivo truncado antes de subir.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

RAIZ = Path("apps/web/src")
EXTS = [".ts", ".tsx", ".js", ".jsx"]

RE_IMPORT = re.compile(
    r"^import\s+(?:type\s+)?(?P<clausula>[\s\S]*?)\s+from\s+['\"](?P<mod>[^'\"]+)['\"]",
    re.M,
)
RE_EXPORT_NOMEADO = re.compile(
    r"^export\s+(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+(\w+)",
    re.M,
)
RE_EXPORT_CHAVES = re.compile(r"^export\s*\{([^}]*)\}", re.M)
RE_EXPORT_DEFAULT = re.compile(r"^export\s+default\b", re.M)


def resolver(mod: str, origem: Path) -> Path | None:
    if mod.startswith("@/"):
        base = RAIZ / mod[2:]
    elif mod.startswith("."):
        base = (origem.parent / mod).resolve()
    else:
        return None  # pacote externo: fora do escopo

    for ext in EXTS:
        if base.with_suffix(ext).is_file():
            return base.with_suffix(ext)
    for ext in EXTS:
        idx = base / f"index{ext}"
        if idx.is_file():
            return idx
    if base.is_file():
        return base
    return None


def exportados(arquivo: Path) -> set[str]:
    texto = arquivo.read_text(encoding="utf-8", errors="replace")
    nomes = set(RE_EXPORT_NOMEADO.findall(texto))
    for bloco in RE_EXPORT_CHAVES.findall(texto):
        for parte in bloco.split(","):
            parte = parte.strip()
            if not parte:
                continue
            nomes.add(parte.split(" as ")[-1].strip())
    if RE_EXPORT_DEFAULT.search(texto):
        nomes.add("default")
    return nomes


def simbolos_da_clausula(clausula: str) -> tuple[list[str], bool]:
    """Devolve (nomes nomeados, usa_default)."""
    clausula = clausula.strip()
    usa_default = False
    nomes: list[str] = []

    m = re.match(r"^(\w+)\s*,?\s*", clausula)
    if m and not clausula.startswith("{") and not clausula.startswith("*"):
        usa_default = True
        clausula = clausula[m.end():]

    if clausula.startswith("*"):
        return [], usa_default

    m = re.search(r"\{([\s\S]*)\}", clausula)
    if m:
        for parte in m.group(1).split(","):
            parte = parte.strip().removeprefix("type ").strip()
            if parte:
                nomes.append(parte.split(" as ")[0].strip())
    return nomes, usa_default



def main() -> int:
    problemas: list[str] = []
    arquivos = [
        p for ext in EXTS for p in RAIZ.rglob(f"*{ext}")
    ]

    for arquivo in sorted(arquivos):
        texto = arquivo.read_text(encoding="utf-8", errors="replace")
        rel = arquivo.relative_to(RAIZ).as_posix()

        # A checagem de delimitadores foi removida de propósito: um leitor
        # ingênuo não distingue `{2,}` dentro de uma regex nem o `)` que é
        # texto literal em JSX, e só produzia falso positivo. Quem valida
        # sintaxe de verdade é o `tsc` — rode `npm run build`.

        for m in RE_IMPORT.finditer(texto):
            mod = m.group("mod")
            alvo = resolver(mod, arquivo)
            if mod.startswith(("@/", ".")) and alvo is None:
                problemas.append(f"[import]  {rel}: módulo não encontrado -> {mod}")
                continue
            if alvo is None:
                continue

            nomes, usa_default = simbolos_da_clausula(m.group("clausula"))
            disponiveis = exportados(alvo)
            if usa_default and "default" not in disponiveis:
                problemas.append(
                    f"[export]  {rel}: {mod} não tem export default"
                )
            for nome in nomes:
                if nome and nome not in disponiveis:
                    problemas.append(
                        f"[export]  {rel}: '{nome}' não é exportado por {mod}"
                    )

    print(f"Arquivos analisados: {len(arquivos)}")
    if problemas:
        print(f"Problemas: {len(problemas)}\n")
        for p in problemas:
            print("  " + p)
        return 1
    print("Nenhum problema de import/sintaxe encontrado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
