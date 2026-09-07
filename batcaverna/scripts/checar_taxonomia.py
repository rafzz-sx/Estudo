#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verificador da taxonomia de assuntos.

─── Por que este arquivo existe ──────────────────────────────────────────

O casamento de termos era `_norm(termo) in alvo` — substring cru. Substring
cru casa no MEIO de uma palavra, e palavras se contêm umas às outras:

    "organica" está dentro de "inorganica"
    "etica"    está dentro de "estetica" e de "dialetica"
    "grafia"   está dentro de "infografia" e de "ortografia"
    "danca"    está dentro de "mudanca"

O estrago era invisível porque `canonizar` devolvia `casou_no_dicionario =
True` nesses casos. O erro passava por acerto e não aparecia na métrica de
cobertura. No banco real isso produziu:

    14 questões de química inorgânica arquivadas como "Química Orgânica",
       com o assunto "Funções Inorgânicas" em ZERO questões — inalcançável
     1 questão de estética arquivada como "Ética e Moral"
     7 questões de morfossintaxe arquivadas como "Sintaxe"
       ("sintaxe" é sufixo de "morfossintaxe")
     2 assuntos absurdos: "Escola Nova" e "Perfil Carcerário" viraram
       Hidrografia, porque "grafia" é sufixo de "-grafia"

Este verificador trava as três formas do defeito:

  1. os casos conhecidos continuam resolvendo certo;
  2. a REGRA de casamento recusa o meio da palavra e aceita o prefixo;
  3. nenhum assunto canônico fica INALCANÇÁVEL — sombreado por um termo de
     um canônico anterior na lista. É esta a checagem que teria pegado
     "Funções Inorgânicas" no dia em que o termo foi escrito.

Uso:
    python scripts/checar_taxonomia.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, str(Path(__file__).resolve().parent))

from taxonomia import TAXONOMIA, _casa, _listas_da_materia, _norm, canonizar  # noqa: E402

problemas: list[str] = []


# ══════════════════════════════════════════════════════════════════
# 1. Casos conhecidos — os que já quebraram uma vez
# ══════════════════════════════════════════════════════════════════
# (matéria, rótulo bruto, canônico esperado)
CASOS = [
    # o defeito original: sufixo de palavra
    ("Química", "Funções Inorgânicas", "Funções Inorgânicas"),
    ("Química", "Química Inorgânica", "Funções Inorgânicas"),
    ("Química", "Reações químicas inorgânicas", "Funções Inorgânicas"),
    ("Química", "Funções Inorgânicas e Neutralização", "Ácidos, Bases e pH"),
    ("Filosofia", "Estética", "Estética"),
    ("Filosofia", "Estética / Percepção e vivência estética", "Estética"),
    ("Português", "Morfossintaxe e Conjunções", "Morfologia"),
    # jurisdição marítima não é bioma — tema recorrente de CN, EFOMM e EAM
    ("Geografia", "Amazônia Azul", "Geopolítica"),
    ("Geografia", "Amazônia Azul e Recursos Marinhos", "Geopolítica"),
    ("Geografia", "Mar Territorial e ZEE", "Geopolítica"),
    ("Geografia", "Plataforma Continental Brasileira", "Geopolítica"),
    # ...sem quebrar o que a Amazônia bioma deve continuar fazendo
    ("Geografia", "Bioma Amazônico", "Biomas e Vegetação"),
    ("Geografia", "Amazônia e Desmatamento", "Questões Ambientais"),
    # prefixo deve continuar valendo: os termos são prefixos de propósito
    ("Inglês", "Interpretação de Texto", "Reading Comprehension"),
    ("Matemática", "Inequações do 2º grau", "Equações e Inequações"),
    ("Matemática", "Geometria Analítica (Circunferência)", "Geometria Analítica"),
]

for materia, bruto, esperado in CASOS:
    obtido, _ = canonizar(materia, bruto)
    if obtido != esperado:
        problemas.append(
            f"caso conhecido: {materia} / {bruto!r}\n"
            f"      esperado {esperado!r}, obtido {obtido!r}"
        )


# ══════════════════════════════════════════════════════════════════
# 2. A regra de casamento recusa o meio da palavra
# ══════════════════════════════════════════════════════════════════
# Os termos se contêm uns aos outros — isso é inevitável e não é problema
# por si. O que não pode voltar é a REGRA aceitar esse encaixe quando ele
# cai no meio de uma palavra.
#
# A massa de teste sai do próprio dicionário: todo par (termo curto, termo
# longo) em que o curto aparece dentro do longo sem começar em palavra é
# exatamente um caso que a substring cru errava. `_casa` tem que dizer não
# a todos eles — e continuar dizendo sim quando o encaixe é um prefixo.

pares_meio: list[tuple[str, str, str, str]] = []
pares_prefixo: list[tuple[str, str]] = []

for materia in TAXONOMIA:
    listas = _listas_da_materia(materia)
    for i, (can_a, termos_a) in enumerate(listas):
        for termo in termos_a:
            tn = _norm(termo)
            if len(tn) < 4:
                continue
            for j, (can_b, termos_b) in enumerate(listas):
                if i == j:
                    continue
                for outro in termos_b:
                    on = _norm(outro)
                    if tn == on or tn not in on:
                        continue
                    if re.search(rf"(?<![0-9a-z]){re.escape(tn)}", on):
                        pares_prefixo.append((tn, on))      # encaixe legítimo
                    else:
                        pares_meio.append((tn, on, can_a, can_b))

for tn, on, can_a, can_b in pares_meio:
    if _casa(tn, on):
        problemas.append(
            f"a regra aceitou casamento no MEIO da palavra:\n"
            f"      {tn!r} ({can_a}) casou dentro de {on!r} ({can_b})"
        )

for tn, on in pares_prefixo:
    if not _casa(tn, on):
        problemas.append(
            f"a regra recusou um PREFIXO legítimo:\n"
            f"      {tn!r} deveria casar em {on!r} — os termos são prefixos de propósito"
        )


# ══════════════════════════════════════════════════════════════════
# 3. Nenhum canônico pode ser INALCANÇÁVEL
# ══════════════════════════════════════════════════════════════════
# Um canônico só existe de verdade se ao menos UM dos seus termos sobreviver
# a todos os canônicos testados antes dele. Era exatamente isto que faltava:
# todo termo de "Funções Inorgânicas" continha "organica", então "Química
# Orgânica" — anterior na lista — levava tudo, e o assunto nunca aparecia.

for materia in TAXONOMIA:
    listas = _listas_da_materia(materia)
    for i, (canonico, termos) in enumerate(listas):
        alcancavel = False
        capturador = None
        for termo in termos:
            destino, _ = canonizar(materia, termo)
            if destino == canonico:
                alcancavel = True
                break
            capturador = (termo, destino)
        if not alcancavel and termos:
            termo, destino = capturador
            problemas.append(
                f"assunto INALCANÇÁVEL em {materia}: {canonico!r}\n"
                f"      nenhum termo seu escapa; ex.: {termo!r} vai para {destino!r}"
            )


# ══════════════════════════════════════════════════════════════════

print(f"Matérias na taxonomia : {len(TAXONOMIA)}")
print(f"Assuntos canônicos    : {sum(len(v) for v in TAXONOMIA.values())}")
print(f"Casos conhecidos      : {len(CASOS)}")
print()

if problemas:
    print(f"!! {len(problemas)} PROBLEMA(S):\n")
    for p in problemas:
        print(f"  - {p}")
    sys.exit(1)

print("Taxonomia consistente: nenhum casamento no meio de palavra, "
      "nenhum assunto inalcançável.")
