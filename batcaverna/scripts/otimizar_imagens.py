#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Otimização das fotos de fundo dos concursos
=========================================================

As nove fotos de `public/images/concursos/` somavam **19 MB** e TODAS eram
baixadas de uma vez na landing page: os cards usam `background-image`, que
o navegador busca assim que o elemento entra no DOM, sem lazy-load.

Cada foto tinha ~2,5 MB e larguras de câmera, para renderizar num card de
cerca de 400 px de largura. Num 4G isso é a diferença entre a home abrir em
1 segundo e em 20 — e ainda queima o pacote de dados do aluno.

O que este script faz:
  • redimensiona para no máximo 1280 px de largura (2x o card em telas retina)
  • salva como JPEG progressivo, qualidade 78, otimizado
  • remove os metadados EXIF da câmera
  • preserva o arquivo original em `_originais/` na primeira execução

Uso:
    python scripts/otimizar_imagens.py            # otimiza
    python scripts/otimizar_imagens.py --checar   # só relata, não escreve
"""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path

from PIL import Image

PASTA = Path("apps/web/public/images/concursos")
BACKUP = PASTA / "_originais"

LARGURA_MAX = 1280
QUALIDADE = 78


def humano(n: int) -> str:
    return f"{n / 1024 / 1024:.2f} MB" if n >= 1024 * 1024 else f"{n / 1024:.0f} KB"


def otimizar(caminho: Path, apenas_checar: bool) -> tuple[int, int]:
    antes = caminho.stat().st_size

    with Image.open(caminho) as img:
        largura, altura = img.size
        precisa_encolher = largura > LARGURA_MAX

        if apenas_checar:
            marca = "encolher" if precisa_encolher else "ok"
            print(f"  {caminho.name:<14} {largura}x{altura:<6} {humano(antes):>9}  [{marca}]")
            return antes, antes

        # Guarda o original uma única vez, para dar para refazer.
        BACKUP.mkdir(exist_ok=True)
        destino_backup = BACKUP / caminho.name
        if not destino_backup.exists():
            shutil.copy2(caminho, destino_backup)

        img = img.convert("RGB")
        if precisa_encolher:
            nova_altura = round(altura * LARGURA_MAX / largura)
            img = img.resize((LARGURA_MAX, nova_altura), Image.Resampling.LANCZOS)

        # Sem exif=... os metadados da câmera não são copiados.
        img.save(
            caminho,
            "JPEG",
            quality=QUALIDADE,
            optimize=True,
            progressive=True,
        )

    depois = caminho.stat().st_size
    reducao = 100 * (1 - depois / antes) if antes else 0
    print(
        f"  {caminho.name:<14} {humano(antes):>9} -> {humano(depois):>9}"
        f"   -{reducao:.0f}%"
    )
    return antes, depois


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--checar", action="store_true", help="só relata, não escreve")
    args = ap.parse_args()

    if not PASTA.exists():
        print(f"Pasta nao encontrada: {PASTA}")
        return 1

    imagens = sorted(p for p in PASTA.glob("*.jpg") if p.parent == PASTA)
    if not imagens:
        print("Nenhuma imagem encontrada.")
        return 1

    total_antes = total_depois = 0
    for caminho in imagens:
        antes, depois = otimizar(caminho, args.checar)
        total_antes += antes
        total_depois += depois

    print("-" * 52)
    if args.checar:
        print(f"  TOTAL atual: {humano(total_antes)}")
    else:
        reducao = 100 * (1 - total_depois / total_antes) if total_antes else 0
        print(
            f"  TOTAL {humano(total_antes)} -> {humano(total_depois)}"
            f"   -{reducao:.0f}%"
        )
        print(f"  Originais preservados em {BACKUP}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
