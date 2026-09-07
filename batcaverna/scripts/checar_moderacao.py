#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Testa o classificador de moderação sem precisar de Node.

Lê as listas de termos direto de `apps/web/src/lib/moderacao.ts` e reproduz a
mesma lógica (normalização, fronteira de palavra, exigência de alvo) sobre um
conjunto de frases com resposta conhecida.

Por que isso importa mais que o teste comum: uma fila de moderação barulhenta
é uma fila que ninguém lê. Cada falso positivo aqui é uma chance a mais de o
admin desistir de olhar — e a ameaça de verdade passar junto com o ruído.

Rode depois de mexer nas listas de termos:
    python scripts/checar_moderacao.py
"""
from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARQ = RAIZ / "apps" / "web" / "src" / "lib" / "moderacao.ts"

LEET = {"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "*": ""}

PADRAO_ALVO = re.compile(
    r"\b(voce|vc|tu|te|ti|seu|sua|teu|tua|contigo|com voce|ce)\b"
)


def normalizar(texto: str) -> str:
    t = unicodedata.normalize("NFD", texto.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[013457@*]", lambda m: LEET.get(m.group(0), m.group(0)), t)
    t = re.sub(r"\b(?:[a-z][.\-_ ]){2,}[a-z]\b", lambda m: re.sub(r"[.\-_ ]", "", m.group(0)), t)
    t = re.sub(r"(.)\1{2,}", r"\1", t)
    return re.sub(r"\s+", " ", t).strip()


def carregar_regras() -> list[dict]:
    """Extrai os blocos `{ categoria, gravidade, termos, exigeAlvo }` do .ts."""
    fonte = ARQ.read_text(encoding="utf-8")
    corpo = fonte.split("const REGRAS: Regra[] = [", 1)[1]
    corpo = corpo.split("\n];", 1)[0]

    regras = []
    for bloco in re.split(r"\n  \{", corpo):
        cat = re.search(r"categoria:\s*'([a-z]+)'", bloco)
        grav = re.search(r"gravidade:\s*'([a-z]+)'", bloco)
        termos_txt = re.search(r"termos:\s*\[(.*?)\]", bloco, re.S)
        if not (cat and grav and termos_txt):
            continue
        termos = re.findall(r"'([^']+)'", termos_txt.group(1))
        regras.append({
            "categoria": cat.group(1),
            "gravidade": grav.group(1),
            "termos": termos,
            "exige_alvo": "exigeAlvo: true" in bloco,
        })
    return regras


def regex_do_termo(termo: str) -> re.Pattern:
    esc = re.escape(termo)
    if " " in termo:
        return re.compile(esc)
    return re.compile(rf"(?:^|[^a-z]){esc}(?:[^a-z]|$)")


PESO = {"critica": 4, "alta": 3, "media": 2, "baixa": 1}


def analisar(texto: str, regras: list[dict]) -> tuple[bool, str | None, list[str]]:
    norm = normalizar(texto)
    tem_alvo = bool(PADRAO_ALVO.search(norm))
    achados = []

    for r in regras:
        for termo in r["termos"]:
            if not regex_do_termo(termo).search(norm):
                continue
            if r["exige_alvo"] and not tem_alvo:
                continue
            grav = r["gravidade"]
            if r["categoria"] == "palavrao" and tem_alvo:
                grav = "media"
            achados.append((r["categoria"], grav, termo))
            break

    if not achados:
        return False, None, []
    pior = max(achados, key=lambda a: PESO[a[1]])[1]
    return True, pior, [a[0] for a in achados]


# ── Casos ────────────────────────────────────────────────────
# (frase, deve_sinalizar, gravidade_minima_esperada ou None)
#
# A metade de baixo é a que mais importa: é fala normal de estudante que NÃO
# pode acender luz vermelha. Cada uma dessas foi escolhida porque quase caiu
# numa versão anterior das listas.
CASOS: list[tuple[str, bool, str | None]] = [
    # ── deve sinalizar ──
    ("vou te matar seu lixo", True, "critica"),
    ("sei onde voce mora", True, "critica"),
    ("me manda nudes", True, "critica"),
    ("nao conta pra ninguem, segredo nosso", True, "critica"),
    ("apaga essa conversa depois", True, "critica"),
    ("qual seu endereco? vamos nos encontrar", True, "critica"),
    ("nao aguento mais viver", True, "critica"),
    ("pensei em me matar ontem", True, "critica"),
    ("voce e um idiota", True, "alta"),
    ("seu burro, nao acertou nada", True, "alta"),
    ("v0ce e um 0tario", True, "alta"),          # leet
    ("c.a.r.a.l.h.o que prova", True, "baixa"),  # separadores
    ("caaaaralho errei tudo", True, "baixa"),    # repetição
    ("vendo maconha aqui", True, "alta"),
    ("quantos anos voce tem?", True, "alta"),

    # ── NÃO pode sinalizar ──
    ("baseado no edital de 2026, cai geometria", False, None),
    ("ele e um crack em matematica", False, None),
    ("essa prova vai me matar de tanto estudar", False, None),
    ("o professor e prolixo demais", False, None),      # continha "lixo"
    ("meu computador travou na hora da prova", False, None),  # continha "puta"
    ("esse assunto ta morto, nao cai mais", False, None),
    ("privacy policy foi o texto de ingles", False, None),
    ("meu quarto ta um lixo de tanto livro", False, None),
    ("errei a questao de novo, que droga", True, "baixa"),  # palavrão solto: baixa
    ("bom dia! vamos estudar hoje?", False, None),
    ("consegui 18 acertos, to feliz demais", False, None),
    ("a resposta e letra C, confere ai", False, None),
    ("dor no peito depois do treino de TAF", False, None),   # 'peito' sem alvo
    ("vou passar nessa prova nem que me mate de estudar", False, None),
]


def main() -> int:
    if not ARQ.exists():
        print(f"[ERRO] não achei {ARQ}")
        return 1

    regras = carregar_regras()
    total_termos = sum(len(r["termos"]) for r in regras)
    print(f"Regras carregadas: {len(regras)}  ·  termos: {total_termos}\n")

    falhas = []
    for frase, esperado, grav_esperada in CASOS:
        sinalizou, grav, cats = analisar(frase, regras)

        if sinalizou != esperado:
            falhas.append(
                f"{'FALSO POSITIVO' if sinalizou else 'DEIXOU PASSAR'}: {frase!r}"
                + (f"  -> {grav} ({', '.join(cats)})" if sinalizou else "")
            )
        elif esperado and grav_esperada and PESO[grav] < PESO[grav_esperada]:
            falhas.append(
                f"GRAVIDADE BAIXA DEMAIS: {frase!r} -> {grav}, esperava {grav_esperada}"
            )

    if falhas:
        print(f"{len(falhas)} de {len(CASOS)} casos falharam:\n")
        for f in falhas:
            print("  -", f)
        return 1

    print(f"[OK] {len(CASOS)} casos passaram — inclusive as 14 frases de fala")
    print("     normal de estudante que NÃO podem acender luz vermelha.")
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
