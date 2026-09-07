#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Coerência da contestação de gabarito
==================================================

As regras da contestação estão escritas DUAS vezes: no CHECK da migration
017 e na validação da rota. Duas cópias de uma regra divergem na primeira
vez que alguém corrigir só uma — e aqui a divergência é especialmente
chata, porque cada lado falha de um jeito diferente:

  • se a API for mais frouxa que o CHECK, o aluno escreve, clica em enviar e
    leva um 500 sem entender por quê;
  • se a API for mais estrita, existe um estado que o banco aceita e a
    plataforma nunca cria — que é como um `status` fica órfão.

Este script confere:

  1. os tipos aceitos na rota são exatamente os do CHECK;
  2. os status aceitos na rota são exatamente os do CHECK;
  3. o mínimo de caracteres do motivo é o mesmo nos dois lados, e o
     componente do aluno usa o mesmo número;
  4. o índice único (questao_id, user_id) existe — é ele que impede que a
     fila meça teimosia em vez de erro;
  5. a rota do aluno NÃO escreve em `questoes`. Contestar abre um caso; quem
     muda gabarito é o admin, de forma explícita.

Uso:
    python scripts/checar_contestacao.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
RAIZ = Path(__file__).resolve().parent.parent

MIGRATION = RAIZ / "supabase" / "migrations" / "017_contestar_gabarito.sql"
ROTA_ALUNO = RAIZ / "apps/web/src/app/api/questoes/[id]/contestar/route.ts"
ROTA_ADMIN = RAIZ / "apps/web/src/app/api/admin/contestacoes/route.ts"
COMPONENTE = RAIZ / "apps/web/src/components/questoes/ContestarGabarito.tsx"

problemas: list[str] = []

for caminho in (MIGRATION, ROTA_ALUNO, ROTA_ADMIN, COMPONENTE):
    if not caminho.exists():
        print(f"!! não encontrei {caminho.relative_to(RAIZ)}")
        sys.exit(1)

sql = MIGRATION.read_text(encoding="utf-8")
aluno = ROTA_ALUNO.read_text(encoding="utf-8")
admin = ROTA_ADMIN.read_text(encoding="utf-8")
comp = COMPONENTE.read_text(encoding="utf-8")


def do_check(sql_texto: str, nome: str) -> set[str]:
    """Extrai o conjunto de valores de um CHECK (... IN ('a','b'))."""
    m = re.search(
        rf"CONSTRAINT\s+{nome}\s+CHECK\s*\([^)]*IN\s*\(([^)]*)\)",
        sql_texto,
        re.I | re.S,
    )
    return set(re.findall(r"'([^']+)'", m.group(1))) if m else set()


def do_set_ts(ts: str, nome: str) -> set[str]:
    """Extrai `const NOME = new Set([...])` ou a lista de objetos {chave: '...'}."""
    m = re.search(rf"const {nome}\s*=\s*new Set\(\[(.*?)\]\)", ts, re.S)
    if m:
        return set(re.findall(r"'([^']+)'", m.group(1)))
    m = re.search(rf"const {nome}\s*=\s*\[(.*?)\]\s*as const", ts, re.S)
    if m:
        return set(re.findall(r"chave:\s*\"([^\"]+)\"", m.group(1)))
    return set()


# ─── 1. Tipos ────────────────────────────────────────────────
tipos_sql = do_check(sql, "chk_contestacao_tipo")
tipos_api = do_set_ts(aluno, "TIPOS")
tipos_ui = do_set_ts(comp, "TIPOS")

if not tipos_sql:
    problemas.append("não achei o CHECK chk_contestacao_tipo na migration 017")
elif tipos_sql != tipos_api:
    problemas.append(
        f"tipos divergem entre SQL e rota:\n"
        f"      só no SQL : {sorted(tipos_sql - tipos_api)}\n"
        f"      só na rota: {sorted(tipos_api - tipos_sql)}"
    )
if tipos_ui and tipos_sql and tipos_ui != tipos_sql:
    problemas.append(
        f"os tipos oferecidos ao aluno não são os aceitos:\n"
        f"      só na tela: {sorted(tipos_ui - tipos_sql)}\n"
        f"      só no SQL : {sorted(tipos_sql - tipos_ui)}"
    )

# ─── 2. Status ───────────────────────────────────────────────
status_sql = do_check(sql, "chk_contestacao_status")
status_api = do_set_ts(admin, "STATUS_VALIDOS")

if not status_sql:
    problemas.append("não achei o CHECK chk_contestacao_status na migration 017")
elif status_sql != status_api:
    problemas.append(
        f"status divergem entre SQL e rota do admin:\n"
        f"      só no SQL : {sorted(status_sql - status_api)}\n"
        f"      só na rota: {sorted(status_api - status_sql)}"
    )

# ─── 3. Mínimo do motivo ─────────────────────────────────────
m = re.search(r"length\(btrim\(motivo\)\)\s*>=\s*(\d+)", sql)
minimo_sql = int(m.group(1)) if m else None

m = re.search(r"const MOTIVO_MINIMO\s*=\s*(\d+)", aluno)
minimo_api = int(m.group(1)) if m else None

m = re.search(r"const MOTIVO_MINIMO\s*=\s*(\d+)", comp)
minimo_ui = int(m.group(1)) if m else None

if minimo_sql is None:
    problemas.append("não achei o CHECK do tamanho do motivo na migration 017")
elif minimo_api is None:
    problemas.append("não achei MOTIVO_MINIMO na rota do aluno")
elif minimo_sql != minimo_api:
    problemas.append(
        f"o mínimo do motivo diverge: SQL exige {minimo_sql}, "
        f"a rota exige {minimo_api}. "
        f"{'A rota é mais frouxa: o aluno leva 500.' if minimo_api < minimo_sql else 'A rota é mais estrita: sobra estado que o banco aceita e ninguém cria.'}"
    )
if minimo_ui is not None and minimo_sql is not None and minimo_ui != minimo_sql:
    problemas.append(
        f"o contador da tela usa {minimo_ui} e o banco exige {minimo_sql} — "
        "o botão libera antes da hora"
    )

# ─── 4. O índice único ───────────────────────────────────────
if not re.search(
    r"CREATE UNIQUE INDEX[^;]*questao_contestacoes\s*\(\s*questao_id\s*,\s*user_id\s*\)",
    sql,
    re.I | re.S,
):
    problemas.append(
        "falta o índice único (questao_id, user_id) na 017 — sem ele, quem "
        "insiste pesa mais que quem tem razão e a fila mede teimosia"
    )

# ─── 5. A rota do aluno não mexe na questão ──────────────────
# `.from('questoes')` seguido de `.update(` na MESMA rota do aluno seria o
# caminho para uma contestação virar correção automática de gabarito.
for m in re.finditer(r"\.from\('questoes'\)(.{0,400})", aluno, re.S):
    if ".update(" in m.group(1):
        problemas.append(
            "a rota do ALUNO escreve em `questoes`. Contestar tem que abrir um "
            "caso, não corrigir o gabarito: aluno errar e achar que a prova "
            "está errada é o caso comum, não a exceção"
        )
        break

# ─── 6. O admin não corrige sem pedir ────────────────────────
# `novo_gabarito` e `anular_questao` têm que ser lidos do body, nunca
# derivados do status.
if "novo_gabarito" not in admin or "anular_questao" not in admin:
    problemas.append(
        "a rota do admin não expõe `novo_gabarito`/`anular_questao` explícitos"
    )
if re.search(r"status\s*===\s*'procede'[^\n]*\n[^\n]*update\(", admin):
    problemas.append(
        "a rota do admin altera a questão como efeito colateral de 'procede' — "
        "corrigir gabarito tem que ser um pedido explícito"
    )


# ══════════════════════════════════════════════════════════════════
print(f"Tipos aceitos    : {len(tipos_sql)}  {sorted(tipos_sql)}")
print(f"Status aceitos   : {len(status_sql)}  {sorted(status_sql)}")
print(f"Mínimo do motivo : {minimo_sql} caracteres")
print()

if problemas:
    print(f"!! {len(problemas)} PROBLEMA(S):\n")
    for p in problemas:
        print(f"  - {p}")
    sys.exit(1)

print("Contestação coerente: SQL, rota e tela concordam nas mesmas regras.")
