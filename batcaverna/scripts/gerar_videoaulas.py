#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Gerador do seed de vídeo-aulas
============================================

Cada candidato é conferido no oEmbed do YouTube ANTES de virar SQL: se o
vídeo foi removido ou ficou privado, ele não entra no seed. O título e o
canal vêm da resposta do próprio YouTube, então nada aqui é chutado.

A coluna `videoaulas.tema` casa com `teoria_conteudo.tema` — é assim que a
trilha de estudo junta o texto teórico e o vídeo do mesmo assunto na mesma
tela, sem jogar o aluno para fora da plataforma.

Uso:
    python scripts/gerar_videoaulas.py
"""

from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path

# (video_id, matéria, tema, ordem)
CANDIDATOS = [
    # ── Matemática ────────────────────────────────────────────
    ("0MN8kItqCAo", "Matemática", "Geometria Plana", 1),
    ("UHdqX2LDVpQ", "Matemática", "Geometria Plana", 2),
    ("AfH7GLDxXaM", "Matemática", "Geometria Espacial", 1),
    ("OYVDBSzW_Dw", "Matemática", "Geometria Espacial", 2),
    ("ufA5Vkc2aDM", "Matemática", "Geometria Espacial", 3),
    ("UWt_mc84t38", "Matemática", "Trigonometria", 1),
    ("qZtwJEhjg_4", "Matemática", "Trigonometria", 2),
    ("n4g7t_znphc", "Matemática", "Trigonometria", 3),
    ("CYCB-YtduHU", "Matemática", "Análise Combinatória", 1),
    ("s18ewjNfvZE", "Matemática", "Análise Combinatória", 2),
    ("8JNrS7KApGs", "Matemática", "Análise Combinatória", 3),
    ("g1nDzBRiF34", "Matemática", "Probabilidade", 1),
    ("2NdVRpF3jB0", "Matemática", "Probabilidade", 2),
    ("_3T0xg8IN9I", "Matemática", "Probabilidade", 3),
    ("X5BUC6Lc8gw", "Matemática", "Estatística", 1),
    ("WHcjT4d6aPc", "Matemática", "Estatística", 2),
    ("-OS5zcbcW2w", "Matemática", "Estatística", 3),
    ("Eo9QT4_TjUo", "Matemática", "Funções", 1),
    ("ekzNBFOrfrc", "Matemática", "Razão e Proporção", 1),

    # ── Português ─────────────────────────────────────────────
    ("uGDJj-dKnSw", "Português", "Gramática", 1),
    ("bOwq8PFHuKU", "Português", "Gramática", 2),
    ("vUI3Vxbk3fI", "Português", "Gramática", 3),
    ("ZVfeDI6gPb0", "Português", "Sintaxe", 1),
    ("pp-QLuf0w3Y", "Português", "Sintaxe", 2),
    ("WZwRBcuf4hQ", "Português", "Sintaxe", 3),
    ("XsN0e_xPyNI", "Português", "Interpretação de Texto", 1),
    ("rf1lg2foSG4", "Português", "Interpretação de Texto", 2),
    ("X6g5caxEAvE", "Português", "Interpretação de Texto", 3),
    ("wp0yyCn4WHI", "Português", "Figuras de Linguagem", 1),
    ("BjnvRDzqCgg", "Português", "Figuras de Linguagem", 2),
    ("dyhSYWyQ0Vg", "Português", "Figuras de Linguagem", 3),

    # ── Inglês ────────────────────────────────────────────────
    ("WOR5hbFIoSI", "Inglês", "Compreensão e Interpretação de Texto", 1),
    ("TG9DjhSwT2k", "Inglês", "Compreensão e Interpretação de Texto", 2),
    ("0oNeqpLPJjU", "Inglês", "Compreensão e Interpretação de Texto", 3),
    ("jBkRAG8L12o", "Inglês", "Compreensão e Interpretação de Texto", 4),

    # ── Física ────────────────────────────────────────────────
    ("nguH7yHaZHU", "Física", "Cinemática", 1),
    ("-dFigm9iM3w", "Física", "Cinemática", 2),
    ("65hJ7p9ggQw", "Física", "Cinemática", 3),
    ("uQwUTLgSWhM", "Física", "Cinemática", 4),
    ("Rmgqv8ETn6o", "Física", "Ondulatória", 1),
    ("C5Th5FIYMoU", "Física", "Ondulatória", 2),
    ("OIdPQDsetDk", "Física", "Ondulatória", 3),
    ("aDVhkTD1rPY", "Física", "Ondulatória", 4),

    # ── Química ───────────────────────────────────────────────
    ("XbPuaJjhSm0", "Química", "Química Orgânica", 1),
    ("WQBpu-IbFKw", "Química", "Química Orgânica", 2),
    ("I_Wm0nhOGNc", "Química", "Química Orgânica", 3),
    ("Q_5rB0iF6oI", "Química", "Química Orgânica", 4),

    # ── Biologia ──────────────────────────────────────────────
    ("Rr-zQYqRCzo", "Biologia", "Ecologia", 1),
    ("XvdePktAui8", "Biologia", "Ecologia", 2),
    ("OCeQiOxqabo", "Biologia", "Ecologia", 3),

    # ── História ──────────────────────────────────────────────
    ("Bhl0k8aQYQU", "História", "Era Vargas", 1),
    ("jQU6Ojetq8M", "História", "Era Vargas", 2),
    ("Biv7yyLtKwg", "História", "Era Vargas", 3),
    ("8PAMZzDvN1A", "História", "República Velha", 1),
    ("AJRPQCzAv_4", "História", "República Velha", 2),
    ("hOJC0uC7K_Y", "História", "República Velha", 3),

    # ── Geografia ─────────────────────────────────────────────
    ("MqNjYKEJjGc", "Geografia", "Climatologia", 1),
    ("7mkEkg3QozA", "Geografia", "Climatologia", 2),
    ("2uXUSLF10R0", "Geografia", "Geopolítica", 1),
    ("cl7zXfiNB8g", "Geografia", "Geopolítica", 2),
    ("Tf6A7TiSr9Y", "Geografia", "Geopolítica", 3),

    # ── Literatura ────────────────────────────────────────────
    ("SAYjnqQkcVE", "Literatura", "Modernismo", 1),
    ("W3avnAUJcRY", "Literatura", "Modernismo", 2),
    ("EidWKUcxEi4", "Literatura", "Modernismo", 3),

    # ── Filosofia / Sociologia ────────────────────────────────
    ("j1FP-cqSti8", "Filosofia", "Panorama para a prova", 1),
    ("vP7KgUbDDRg", "Filosofia", "Panorama para a prova", 2),
    ("y0q9z6OS9CU", "Sociologia", "Panorama para a prova", 1),
    ("Z-t23NMfelM", "Sociologia", "Panorama para a prova", 2),

    # ── Redação ───────────────────────────────────────────────
    ("IiwOLOVk4Jk", "Redação", "Estrutura da Redação", 1),
    ("MeKHJVPNV30", "Redação", "Estrutura da Redação", 2),
    ("4HOUuVdxx3s", "Redação", "Estrutura da Redação", 3),
    ("F7lbKl7_o2w", "Redação", "As 5 Competências", 1),
    ("TCdiXzPI8UI", "Redação", "As 5 Competências", 2),
    ("HjVoc_Q7v70", "Redação", "As 5 Competências", 3),
]

CABECALHO = """-- ============================================================================
-- BatCaverna - Video-aulas da trilha de estudo
-- ============================================================================
-- Gerado por scripts/gerar_videoaulas.py - NAO EDITE A MAO.
--
-- Todo ID aqui foi conferido no oEmbed do YouTube no momento da geracao:
-- titulo e canal sao os que o proprio YouTube devolveu. Video removido ou
-- privado nao entra no seed.
--
-- O aluno assiste DENTRO da plataforma (VideoAulaPlayer usa o dominio
-- youtube-nocookie), sem ser deslocado para a fonte do video.
--
-- Para revalidar depois que algum video sair do ar:
--     python scripts/gerar_videoaulas.py
--
-- Videos conferidos: {ok}   |   Descartados: {fora}
-- Idempotente: a chave e (video_id, tema).
-- ============================================================================

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS idx_videoaulas_unica
  ON videoaulas(video_id, tema);

INSERT INTO videoaulas (materia_id, tema, titulo, video_id, canal, ordem)
SELECT m.id, v.tema, v.titulo, v.video_id, v.canal, v.ordem
FROM materias m
JOIN (VALUES
"""

RODAPE = """
) AS v(materia_nome, tema, titulo, video_id, canal, ordem)
  ON m.nome = v.materia_nome
ON CONFLICT (video_id, tema) DO UPDATE
  SET titulo = EXCLUDED.titulo,
      canal  = EXCLUDED.canal,
      ativa  = TRUE;

COMMIT;

SELECT m.nome AS materia, v.tema, COUNT(*) AS videos
FROM videoaulas v
JOIN materias m ON m.id = v.materia_id
GROUP BY m.nome, v.tema
ORDER BY m.nome, v.tema;
"""


def consultar(video_id: str) -> dict | None:
    """Confirma no YouTube que o vídeo existe e é embutível."""
    url = "https://www.youtube.com/oembed?" + urllib.parse.urlencode(
        {"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"}
    )
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            return json.load(resp)
    except Exception:
        return None


def lit(valor) -> str:
    if valor is None or valor == "":
        return "NULL"
    if isinstance(valor, int):
        return str(valor)
    return "'" + str(valor).replace("'", "''") + "'"


def main() -> int:
    linhas: list[str] = []
    mortos: list[tuple[str, str, str]] = []

    for video_id, materia, tema, ordem in CANDIDATOS:
        dados = consultar(video_id)
        if not dados:
            mortos.append((video_id, materia, tema))
            print(f"  [FORA] {video_id}  {materia} / {tema}")
            continue

        titulo = (dados.get("title") or "")[:200]
        canal = (dados.get("author_name") or "")[:120]
        print(f"  [OK]   {video_id}  {titulo[:58]}")

        linhas.append(
            f"  ({lit(materia)}, {lit(tema)}, {lit(titulo)}, "
            f"{lit(video_id)}, {lit(canal)}, {ordem})"
        )

    if not linhas:
        print("Nenhum video valido - seed nao gerado.")
        return 1

    sql = (
        CABECALHO.format(ok=len(linhas), fora=len(mortos))
        + ",\n".join(linhas)
        + RODAPE
    )

    destino = Path("supabase/seeds/videoaulas_01.sql")
    destino.write_text(sql, encoding="utf-8")

    print(f"\n[OK] {len(linhas)} videos -> {destino}")
    if mortos:
        print(f"[!] {len(mortos)} descartados (fora do ar ou privados)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
