#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Paridade da taxonomia entre o Python e o importador web
=====================================================================

O importador do painel admin (`apps/web/src/lib/importador-questoes.ts`)
precisa canonizar o assunto EXATAMENTE como `scripts/taxonomia.py`. Se os
dois divergirem, importar uma prova pela tela cria assuntos que o pipeline
do terminal não criaria — e a taxonomia volta a fragmentar, que é o problema
que a migration 011 existe para resolver.

`apps/web/src/lib/taxonomia.ts` é GERADO por `scripts/gerar_taxonomia_ts.py`,
então os DADOS não podem divergir por construção. O que ainda pode divergir
é o ALGORITMO, que foi escrito em TypeScript à mão dentro do gerador.

Como não há Node.js nesta máquina para rodar o TypeScript, este script:

  1. lê o .ts gerado e reconstrói as tabelas a partir dele — se o arquivo
     estiver velho em relação ao Python, aparece aqui;
  2. reimplementa em Python o algoritmo escrito no TS (`singular`, `norm`,
     `casa`, `reduzir`, `canonizarAssunto`) e compara os dois lados sobre
     TODOS os rótulos reais do banco de questões.

É o mesmo arranjo de `checar_paridade_hash.py`. Se o TS mudar, ajuste os
espelhos aqui junto e rode de novo.

Uso:
    python scripts/checar_paridade_taxonomia.py
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from taxonomia import HERANCA, TAXONOMIA, canonizar  # noqa: E402

TS = RAIZ / "apps" / "web" / "src" / "lib" / "taxonomia.ts"
JSON_QUESTOES = RAIZ / "scripts" / "out" / "questoes.json"

problemas: list[str] = []


# ══════════════════════════════════════════════════════════════════
# 1. As tabelas do .ts batem com as do .py?
# ══════════════════════════════════════════════════════════════════

if not TS.exists():
    print(f"!! {TS.relative_to(RAIZ)} não existe.")
    print("   Rode: python scripts/gerar_taxonomia_ts.py")
    sys.exit(1)

fonte_ts = TS.read_text(encoding="utf-8")


def bloco(nome: str) -> str:
    ini = fonte_ts.index(f"export const {nome}")
    ini = fonte_ts.index("{", ini)
    profundidade = 0
    for i in range(ini, len(fonte_ts)):
        if fonte_ts[i] == "{":
            profundidade += 1
        elif fonte_ts[i] == "}":
            profundidade -= 1
            if profundidade == 0:
                return fonte_ts[ini: i + 1]
    raise ValueError(f"bloco {nome} não fecha")


# Reconstrói TAXONOMIA a partir do texto do .ts.
tax_ts: dict[str, list[tuple[str, list[str]]]] = {}
materia_atual: str | None = None
for linha in bloco("TAXONOMIA").splitlines():
    crua = linha.strip()
    m = re.match(r'^"((?:[^"\\]|\\.)*)":\s*\[$', crua)
    if m:
        materia_atual = json.loads(f'"{m.group(1)}"')
        tax_ts[materia_atual] = []
        continue
    m = re.match(r'^\[("(?:[^"\\]|\\.)*"),\s*\[(.*)\]\],$', crua)
    if m and materia_atual:
        canonico = json.loads(m.group(1))
        termos = json.loads(f"[{m.group(2)}]") if m.group(2).strip() else []
        tax_ts[materia_atual].append((canonico, termos))

her_ts: dict[str, list[str]] = {}
for linha in bloco("HERANCA").splitlines():
    m = re.match(r'^("(?:[^"\\]|\\.)*"):\s*\[(.*)\],$', linha.strip())
    if m:
        her_ts[json.loads(m.group(1))] = json.loads(f"[{m.group(2)}]")

tax_py = {m: [(c, list(t)) for c, t in v] for m, v in TAXONOMIA.items()}
her_py = {k: list(v) for k, v in HERANCA.items()}

if tax_ts != tax_py:
    faltando = set(tax_py) - set(tax_ts)
    sobrando = set(tax_ts) - set(tax_py)
    if faltando:
        problemas.append(f"matérias só no Python: {sorted(faltando)}")
    if sobrando:
        problemas.append(f"matérias só no TS: {sorted(sobrando)}")
    for materia in sorted(set(tax_py) & set(tax_ts)):
        if tax_py[materia] != tax_ts[materia]:
            problemas.append(
                f"a lista de {materia!r} difere entre .py e .ts — "
                "rode: python scripts/gerar_taxonomia_ts.py"
            )

if her_ts != her_py:
    problemas.append("HERANCA difere entre .py e .ts — regere o .ts")


# ══════════════════════════════════════════════════════════════════
# 2. Espelho em Python do algoritmo escrito no TypeScript
# ══════════════════════════════════════════════════════════════════

TROCAS = [
    ("oes", "ao"), ("aes", "ao"), ("ais", "al"), ("eis", "el"),
    ("ois", "ol"), ("zes", "z"), ("res", "r"), ("ses", "s"),
    ("ns", "m"), ("is", "il"),
]


def singular_ts(palavra: str) -> str:
    """TS: if (palavra.length <= 4) return palavra; ..."""
    if len(palavra) <= 4:
        return palavra
    for fim, troca in TROCAS:
        if palavra.endswith(fim):
            return palavra[: -len(fim)] + troca
    return palavra[:-1] if palavra.endswith("s") else palavra


def norm_ts(texto: str) -> str:
    """TS: toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')..."""
    t = (texto or "").lower()
    t = unicodedata.normalize("NFD", t)
    t = "".join(c for c in t if not ("̀" <= c <= "ͯ"))
    t = re.sub(r"\s+", " ", t).strip()
    if not t:
        return ""
    return " ".join(singular_ts(p) for p in t.split())


def casa_ts(termo: str, alvo: str) -> bool:
    """TS: varre indexOf e exige que o caractere anterior não seja [0-9a-z]."""
    if not termo:
        return False
    de = alvo.find(termo)
    while de != -1:
        anterior = alvo[de - 1] if de > 0 else ""
        if not re.match(r"[0-9a-z]", anterior or ""):
            return True
        de = alvo.find(termo, de + 1)
    return False


SEPARADORES_TS = re.compile(r"\s*(?:[/;·—–|]|\s-\s|\(|,|\se\s)\s*")
MIUDAS = {"de", "da", "do", "das", "dos", "e", "em", "a", "o", "no", "na"}


def reduzir_ts(assunto: str) -> str:
    base = SEPARADORES_TS.split(assunto or "", maxsplit=1)[0] or ""
    base = base.replace(")", "")
    base = re.sub(r"^[ .\-—]+|[ .\-—]+$", "", base)
    base = re.sub(r"\s+", " ", base)
    if not base:
        return "Geral"
    saida = []
    for i, p in enumerate(base.split(" ")):
        if i and p.lower() in MIUDAS:
            saida.append(p)
        elif p != p.lower() and p == p.upper():
            # espelho do `p !== p.toLowerCase() && p === p.toUpperCase()`
            saida.append(p)
        else:
            # espelho do `charAt(0).toUpperCase() + slice(1).toLowerCase()`
            saida.append(p[:1].upper() + p[1:].lower())
    return " ".join(saida)


def listas_ts(materia: str) -> list[tuple[str, list[str]]]:
    propria = tax_ts.get(materia)
    if propria is not None:
        return propria
    combinada: list[tuple[str, list[str]]] = []
    for origem in her_ts.get(materia, []):
        combinada.extend(tax_ts.get(origem, []))
    return combinada


def canonizar_ts(materia: str | None, assunto: str | None) -> tuple[str, bool]:
    bruto = (assunto or "").strip()
    if not bruto:
        return "Geral", False
    alvo = norm_ts(bruto)
    for canonico, termos in listas_ts(materia or ""):
        for termo in termos:
            if casa_ts(norm_ts(termo), alvo):
                return canonico, True
    return reduzir_ts(bruto), False


# ══════════════════════════════════════════════════════════════════
# 3. Compara os dois sobre TODOS os rótulos reais
# ══════════════════════════════════════════════════════════════════

if not JSON_QUESTOES.exists():
    print(f"!! {JSON_QUESTOES.relative_to(RAIZ)} não existe.")
    print("   Rode: python scripts/parse_questoes.py")
    sys.exit(1)

dados = json.loads(JSON_QUESTOES.read_text(encoding="utf-8"))
questoes = dados["questoes"] if isinstance(dados, dict) and "questoes" in dados else dados

pares = {(q.get("materia") or "", q.get("assunto_original") or "") for q in questoes}
divergencias = 0

for materia, bruto in sorted(pares):
    a_py, c_py = canonizar(materia, bruto)
    a_ts, c_ts = canonizar_ts(materia, bruto)
    if (a_py, c_py) != (a_ts, c_ts):
        divergencias += 1
        if divergencias <= 15:
            problemas.append(
                f"divergência: {materia} / {bruto!r}\n"
                f"      python -> {a_py!r} ({c_py})\n"
                f"      typescript -> {a_ts!r} ({c_ts})"
            )

# Casos-limite que não aparecem no banco mas o importador pode receber.
LIMITE = [
    ("Matemática", ""), ("Matemática", "   "), ("", "Geometria Plana"),
    ("Inexistente", "Assunto Qualquer"), ("Ciências da Natureza", "Funções Inorgânicas"),
    ("Linguagens", "Interpretação de Texto"), ("Matemática", "ÁLGEBRA"),
    ("Geografia", "Amazônia Azul"), ("Química", "Química Inorgânica"),
    ("Filosofia", "Estética"), ("Matemática", "Geometria Plana (Triângulo)"),
    ("Português", "Morfossintaxe e Conjunções"), ("Redação", "Coesão e Coerência"),
]
for materia, bruto in LIMITE:
    if canonizar(materia, bruto) != canonizar_ts(materia, bruto):
        divergencias += 1
        problemas.append(
            f"divergência (caso-limite): {materia!r} / {bruto!r}\n"
            f"      python -> {canonizar(materia, bruto)}\n"
            f"      typescript -> {canonizar_ts(materia, bruto)}"
        )


# ══════════════════════════════════════════════════════════════════

print(f"Rótulos distintos no banco : {len(pares)}")
print(f"Casos-limite               : {len(LIMITE)}")
print(f"Assuntos canônicos (py/ts) : "
      f"{sum(len(v) for v in tax_py.values())}/{sum(len(v) for v in tax_ts.values())}")
print()

if problemas:
    print(f"!! {len(problemas)} PROBLEMA(S):\n")
    for p in problemas[:20]:
        print(f"  - {p}")
    if divergencias > 15:
        print(f"\n  (+{divergencias - 15} divergências não listadas)")
    sys.exit(1)

print("Paridade OK: o importador do painel canoniza o assunto igual ao Python.")
