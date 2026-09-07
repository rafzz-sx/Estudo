#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Confere se as colunas usadas no código existem mesmo no schema.

Esta é a classe de erro mais cara da plataforma, porque o TypeScript não vê:
`supabase.from('x').select('coluna_que_nao_existe')` compila sem reclamar e
só falha em produção, devolvendo lista vazia ou 500 — quase sempre em
silêncio, porque quase toda rota tem um `catch` que engole.

Já pegamos três deste tipo à mão:
  • ranking filtrava `respondida_em`; a coluna é `respondido_em`
  • a migration 008 criava CHECK em `conteudo`; a coluna é `conteudo_texto`
  • o log de auditoria recebia `alvo_id`; a coluna é `entidade_id`

Como funciona: lê CREATE TABLE / ALTER TABLE ADD COLUMN / CREATE VIEW das
migrations e monta o dicionário de colunas por tabela. Depois varre o código
procurando `.from('tabela')` e as colunas citadas em `.select()`, `.eq()`,
`.order()`, `.insert()` e `.update()` daquele trecho.

Heurística: relacionamentos embutidos do PostgREST (`autor:users!autor_id`)
e alias são ignorados. Confira cada apontamento antes de mexer.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MIGRACOES = RAIZ / "supabase" / "migrations"
CODIGO = RAIZ / "apps" / "web" / "src"

# Funções e palavras que aparecem dentro de um select mas não são coluna.
NAO_COLUNA = {"count", "sum", "avg", "min", "max", "null", "true", "false"}


def colunas_do_schema() -> dict[str, set[str]]:
    tabelas: dict[str, set[str]] = {}

    for arq in sorted(MIGRACOES.glob("*.sql")):
        sql = arq.read_text(encoding="utf-8", errors="replace")

        # CREATE TABLE ... ( ... );
        for m in re.finditer(
            r"CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(\w+)\s*\((.*?)\n\);",
            sql, re.S | re.I,
        ):
            nome, corpo = m.group(1).lower(), m.group(2)
            cols = tabelas.setdefault(nome, set())
            for linha in corpo.split("\n"):
                linha = linha.strip()
                if not linha or linha.startswith("--"):
                    continue
                if re.match(r"(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)\b", linha, re.I):
                    continue
                c = re.match(r"(\w+)\s+", linha)
                if c:
                    cols.add(c.group(1).lower())

        # ALTER TABLE x ADD COLUMN [IF NOT EXISTS] y
        for m in re.finditer(
            r"ALTER TABLE(?:\s+IF EXISTS)?\s+(\w+)(.*?);", sql, re.S | re.I
        ):
            nome, corpo = m.group(1).lower(), m.group(2)
            cols = tabelas.setdefault(nome, set())
            for c in re.finditer(
                r"ADD COLUMN(?:\s+IF NOT EXISTS)?\s+(\w+)", corpo, re.I
            ):
                cols.add(c.group(1).lower())

        # CREATE VIEW: pega os apelidos da lista de seleção
        for m in re.finditer(
            r"CREATE(?:\s+OR REPLACE)?\s+VIEW\s+(\w+)\s+AS\s+SELECT(.*?)(?:\nFROM|\n\s*FROM)",
            sql, re.S | re.I,
        ):
            nome, corpo = m.group(1).lower(), m.group(2)
            cols = tabelas.setdefault(nome, set())
            for parte in corpo.split(","):
                parte = re.sub(r"--.*", "", parte).strip()
                if not parte:
                    continue
                apelido = re.search(r"\bAS\s+(\w+)\s*$", parte, re.I)
                if apelido:
                    cols.add(apelido.group(1).lower())
                else:
                    ult = re.search(r"(\w+)\s*$", parte)
                    if ult:
                        cols.add(ult.group(1).lower())

    return tabelas


def fim_da_cadeia(texto: str) -> str:
    """
    Corta no `;` que fecha a consulta.

    Sem isso, o trecho de `.from('concursos')` seguia varrendo o arquivo até
    o próximo `.from(` e engolia os `.eq('materia_id')` de OUTRA consulta,
    montada depois numa variável. Onze falsos positivos vinham só daí.

    O custo: consulta construída em partes (`let q = ...; q = q.eq(...)`) só
    é conferida até o primeiro `;`. Perde-se cobertura, ganha-se confiança —
    e um verificador em que não se confia não é usado.
    """
    profundidade = 0
    i, n = 0, len(texto)
    while i < n:
        c = texto[i]
        if c in "\"'`":
            aspa = c
            i += 1
            while i < n:
                if texto[i] == "\\":
                    i += 2
                    continue
                if texto[i] == aspa:
                    break
                i += 1
        elif c in "([{":
            profundidade += 1
        elif c in ")]}":
            profundidade -= 1
        elif c == ";" and profundidade <= 0:
            return texto[:i]
        i += 1
    return texto


def campos_citados(trecho: str) -> set[str]:
    campos: set[str] = set()

    # .select('a, b, tabela (c, d)') — o conteúdo entre parênteses é
    # relacionamento embutido e tem o schema da OUTRA tabela.
    for m in re.finditer(r"\.select\(\s*[`'\"](.*?)[`'\"]", trecho, re.S):
        bruto = re.sub(r"\w+\s*\([^)]*\)", " ", m.group(1))
        for parte in re.split(r"[,\s]+", bruto):
            parte = parte.strip()
            if ":" in parte or "!" in parte or "*" in parte or not parte:
                continue
            if re.fullmatch(r"\w+", parte) and parte.lower() not in NAO_COLUNA:
                campos.add(parte.lower())

    # .eq('coluna', x) / .order('coluna') / .gte / .is / .not
    for m in re.finditer(
        r"\.(?:eq|neq|gt|gte|lt|lte|like|ilike|is|in|order|contains)\(\s*'(\w+)'",
        trecho,
    ):
        campos.add(m.group(1).lower())

    # .not('coluna', 'is', null)
    for m in re.finditer(r"\.not\(\s*'(\w+)'", trecho):
        campos.add(m.group(1).lower())

    return campos


def main() -> int:
    schema = colunas_do_schema()
    if not schema:
        print("[ERRO] não consegui ler o schema das migrations")
        return 1

    print(f"Tabelas/views lidas do schema: {len(schema)}")

    arquivos = [
        p for p in CODIGO.rglob("*.ts*")
        if "node_modules" not in p.parts
    ]

    problemas: list[str] = []

    for caminho in sorted(arquivos):
        texto = caminho.read_text(encoding="utf-8", errors="replace")
        rel = caminho.relative_to(RAIZ).as_posix()

        # Cada `.from('tabela')` abre um trecho que vai até o próximo
        # `.from(` ou o fim do arquivo.
        ocorrencias = list(re.finditer(r"\.from\(\s*'(\w+)'\s*\)", texto))
        for i, m in enumerate(ocorrencias):
            tabela = m.group(1).lower()
            fim = ocorrencias[i + 1].start() if i + 1 < len(ocorrencias) else len(texto)
            trecho = fim_da_cadeia(texto[m.end():fim])

            if tabela not in schema:
                problemas.append(f"{rel}: tabela '{tabela}' não existe no schema")
                continue

            linha = texto[: m.start()].count("\n") + 1
            for campo in sorted(campos_citados(trecho)):
                if campo not in schema[tabela]:
                    problemas.append(
                        f"{rel}:{linha}: '{tabela}' não tem a coluna '{campo}'"
                    )

    print(f"Arquivos varridos: {len(arquivos)}")
    if problemas:
        vistos = sorted(set(problemas))
        print(f"\n{len(vistos)} apontamento(s):\n")
        for p in vistos:
            print("  -", p)
        print("\n(heurística — confira cada um antes de mexer)")
        return 1

    print("\n[OK] Nenhuma coluna inexistente.")
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
