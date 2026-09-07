#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera a migration que unifica os assuntos JÁ GRAVADOS no banco.

Rodar os seeds de novo não resolve: eles usam `ON CONFLICT DO NOTHING`, então
as questões que já estão lá continuam apontando para o assunto antigo. Quem
precisa reescrever o vínculo é uma migration.

O mapa (matéria, rótulo antigo) -> canônico sai de `taxonomia.py` aplicada aos
rótulos originais do JSON. Vai explícito no SQL porque:

  • a lógica da taxonomia é Python e não dá para reproduzir em SQL sem
    reescrever tudo;
  • um mapa explícito é auditável — dá para ler linha a linha e discordar;
  • roda uma vez e fica no histórico do repositório.

Uso:
    python scripts/gerar_migration_taxonomia.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from taxonomia import canonizar  # noqa: E402

ENTRADA = RAIZ / "scripts" / "out" / "questoes.json"
SAIDA = RAIZ / "supabase" / "migrations" / "011_taxonomia_assuntos.sql"

# Tabelas que apontam para `assuntos` e precisam ser remapeadas ANTES de
# qualquer DELETE. Quase todas usam ON DELETE CASCADE: apagar um assunto
# órfão sem remapear levaria junto o bizu e a vídeo-aula presos nele.
TABELAS_COM_ASSUNTO = [
    ("questoes", "assunto_id"),
    ("bizus", "assunto_id"),
    ("concurso_assuntos", "assunto_id"),
    ("user_progresso", "assunto_id"),
    ("videoaulas", "assunto_id"),
    ("teoria_conteudo", "assunto_id"),
    ("plano_itens", "assunto_id"),
]


def esc(texto: str) -> str:
    return texto.replace("'", "''")


def main() -> int:
    if not ENTRADA.exists():
        print(f"[ERRO] rode scripts/parse_questoes.py antes: {ENTRADA} não existe")
        return 1

    questoes = json.loads(ENTRADA.read_text(encoding="utf-8"))

    # (materia, rotulo_antigo) -> canonico
    mapa: dict[tuple[str, str], str] = {}
    for q in questoes:
        materia = q.get("materia") or ""
        antigo = (q.get("assunto_original") or q.get("assunto") or "Geral").strip()
        if not materia or not antigo:
            continue
        canonico, _ = canonizar(materia, antigo)
        mapa[(materia, antigo)] = canonico

    # Só interessa o que MUDA de nome; o resto é ruído no SQL.
    mudancas = sorted(
        (m, a, c) for (m, a), c in mapa.items() if a != c
    )
    iguais = len(mapa) - len(mudancas)

    canonicos = sorted({(m, c) for (m, _), c in mapa.items()})

    linhas: list[str] = []
    add = linhas.append

    add("-- ============================================================================")
    add("-- BatCaverna — Unificação da taxonomia de assuntos (versão 2.4.0)")
    add("-- ============================================================================")
    add("-- GERADO POR scripts/gerar_migration_taxonomia.py — não edite à mão.")
    add("--")
    add("-- O problema: os .txt das provas usam rótulo livre para o assunto, e o")
    add("-- parser gravava cada um como veio. Resultado: 2.452 assuntos distintos")
    add("-- para 3.247 questões, 88% deles com UMA questão só.")
    add("--")
    add('--   "Geometria Plana"                                      23 questões')
    add('--   "Geometria Plana (Posições Relativas entre Círculos)"    1')
    add('--   "Geometria Plana (Triângulo Equilátero e Radiciação)"     1')
    add('--   "Geometria plana"                                        3')
    add('--   "Geometria Plana e Áreas"                                5')
    add("--")
    add("-- Geometria Plana é o assunto nº 1 de Matemática, com 134 questões — e a")
    add("-- plataforma exibia 23. Isso quebrava, em silêncio, cinco coisas: o card")
    add('-- "Assuntos que caem", a ordenação da trilha, a revisão espaçada, o')
    add("-- caderno de erros e o plano de estudo. Nenhuma dava erro. Todas mentiam.")
    add("--")
    add(f"-- Depois desta migration: {len(canonicos)} assuntos, 90% das questões num")
    add("-- assunto canônico. O resto é cauda legítima e fica como está.")
    add("--")
    add("-- ORDEM IMPORTA: as sete tabelas que apontam para `assuntos` são")
    add("-- remapeadas ANTES do DELETE. Quase todas usam ON DELETE CASCADE —")
    add("-- apagar um assunto órfão sem remapear levaria junto o bizu e a")
    add("-- vídeo-aula presos nele.")
    add("--")
    add("-- Idempotente: rodar de novo não muda nada (o mapa já foi aplicado).")
    add("-- ============================================================================")
    add("")
    add("BEGIN;")
    add("")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("-- 1. Impedir que o problema volte")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("-- Sem esta UNIQUE, duas linhas com o mesmo nome na mesma matéria eram")
    add("-- possíveis, e o ON CONFLICT dos seeds não tinha em que se apoiar.")
    add("")
    add("-- Funde duplicatas exatas que já existam, antes de criar a restrição.")
    add("-- As SETE tabelas são remapeadas: o DELETE logo abaixo é CASCADE na")
    add("-- maioria delas, então apontar só `questoes` para o sobrevivente")
    add("-- apagaria em silêncio o bizu e a vídeo-aula presos na duplicata.")
    add("CREATE TEMP TABLE fusao_duplicata AS")
    add("SELECT id AS id_velho,")
    add("       FIRST_VALUE(id) OVER (PARTITION BY materia_id, nome ORDER BY id) AS id_novo")
    add("FROM assuntos;")
    add("")
    add("DELETE FROM fusao_duplicata WHERE id_velho = id_novo;")
    add("CREATE INDEX ON fusao_duplicata(id_velho);")
    add("")
    for tabela, coluna in TABELAS_COM_ASSUNTO:
        add(f"UPDATE {tabela} t SET {coluna} = f.id_novo")
        add(f"FROM fusao_duplicata f WHERE t.{coluna} = f.id_velho;")
    add("")
    add("DELETE FROM assuntos a")
    add("USING fusao_duplicata f WHERE f.id_velho = a.id;")
    add("")
    add("DROP TABLE fusao_duplicata;")
    add("")
    add("CREATE UNIQUE INDEX IF NOT EXISTS uniq_assunto_materia_nome")
    add("  ON assuntos(materia_id, nome);")
    add("")
    add("")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("-- 2. O mapa: rótulo bruto do .txt -> assunto canônico")
    add("-- ════════════════════════════════════════════════════════════════════")
    add(f"-- {len(mudancas)} rótulos mudam de nome. Outros {iguais} já estavam certos")
    add("-- e ficaram de fora para não poluir.")
    add("")
    add("CREATE TEMP TABLE mapa_assunto (")
    add("  materia   TEXT NOT NULL,")
    add("  antigo    TEXT NOT NULL,")
    add("  canonico  TEXT NOT NULL")
    add(") ON COMMIT DROP;")
    add("")
    add("INSERT INTO mapa_assunto (materia, antigo, canonico) VALUES")

    valores = [
        f"  ('{esc(m)}', '{esc(a)}', '{esc(c)}')" for m, a, c in mudancas
    ]
    add(",\n".join(valores) + ";")

    add("")
    add("")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("-- 3. Garantir que todo assunto canônico existe")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("")
    add("INSERT INTO assuntos (materia_id, nome)")
    add("SELECT DISTINCT m.id, v.canonico")
    add("FROM (VALUES")
    add(",\n".join(f"  ('{esc(mat)}', '{esc(can)}')" for mat, can in canonicos))
    add(") AS v(materia, canonico)")
    add("JOIN materias m ON m.nome = v.materia")
    add("ON CONFLICT (materia_id, nome) DO NOTHING;")
    add("")
    add("")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("-- 4. Remapear as SETE tabelas que apontam para assuntos")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("-- A resolução do par (antigo -> novo) é a mesma para todas; fica numa")
    add("-- tabela temporária para não repetir o JOIN sete vezes.")
    add("")
    add("CREATE TEMP TABLE troca_assunto AS")
    add("SELECT a_velho.id AS id_velho, a_novo.id AS id_novo")
    add("FROM mapa_assunto mp")
    add("JOIN materias m       ON m.nome = mp.materia")
    add("JOIN assuntos a_velho ON a_velho.materia_id = m.id AND a_velho.nome = mp.antigo")
    add("JOIN assuntos a_novo  ON a_novo.materia_id  = m.id AND a_novo.nome  = mp.canonico")
    add("WHERE a_velho.id <> a_novo.id;")
    add("")
    add("CREATE INDEX ON troca_assunto(id_velho);")
    add("")

    for tabela, coluna in TABELAS_COM_ASSUNTO:
        add(f"-- {tabela}")
        add(f"UPDATE {tabela} t SET {coluna} = tr.id_novo")
        add(f"FROM troca_assunto tr WHERE t.{coluna} = tr.id_velho;")
        add("")

    add("")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("-- 5. Apagar os assuntos que ficaram sem nada apontando para eles")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("-- A condição é conservadora de propósito: só sai quem está órfão em")
    add("-- TODAS as sete tabelas. Um assunto criado à mão pelo admin e ainda sem")
    add("-- questão sobrevive, porque não está no mapa.")
    add("")
    add("DELETE FROM assuntos a")
    add("WHERE EXISTS (SELECT 1 FROM troca_assunto tr WHERE tr.id_velho = a.id)")

    for tabela, coluna in TABELAS_COM_ASSUNTO:
        add(f"  AND NOT EXISTS (SELECT 1 FROM {tabela} t WHERE t.{coluna} = a.id)")

    add(";")
    add("")
    add("DROP TABLE troca_assunto;")
    add("")
    add("COMMIT;")
    add("")
    add("")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("-- 6. Conferência")
    add("-- ════════════════════════════════════════════════════════════════════")
    add("")
    # O número sai da contagem real, não de um literal. Estava fixo em "~515"
    # e o cabeçalho deste mesmo arquivo, esse sim calculado, passou a dizer
    # 529 quando a taxonomia mudou — a migration se contradizia.
    add(f"-- Antes: {len(mapa):,}. Depois: ~{len(canonicos)}.".replace(",", "."))
    add("SELECT COUNT(*) AS total_de_assuntos FROM assuntos;")
    add("")
    add("-- Antes 88% tinham 1 questão só. Depois deve ficar perto de 60 linhas.")
    add("SELECT COUNT(*) AS assuntos_com_uma_questao_so FROM (")
    add("  SELECT assunto_id FROM questoes WHERE ativa GROUP BY assunto_id HAVING COUNT(*) = 1")
    add(") x;")
    add("")
    add("-- Geometria Plana tem que aparecer com ~134, não com 23.")
    add("SELECT m.nome AS materia, a.nome AS assunto, COUNT(*) AS questoes")
    add("FROM questoes q")
    add("JOIN assuntos a ON a.id = q.assunto_id")
    add("JOIN materias m ON m.id = a.materia_id")
    add("WHERE q.ativa")
    add("GROUP BY m.nome, a.nome")
    add("ORDER BY COUNT(*) DESC")
    add("LIMIT 15;")
    add("")

    SAIDA.write_text("\n".join(linhas), encoding="utf-8")

    print(f"Rótulos no mapa      : {len(mapa)}")
    print(f"  que mudam de nome  : {len(mudancas)}")
    print(f"  que já estavam ok  : {iguais}")
    print(f"Assuntos canônicos   : {len(canonicos)}")
    print(f"\n[OK] {SAIDA.relative_to(RAIZ)} ({SAIDA.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
