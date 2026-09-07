#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Regras que não podem ter duas cópias
==================================================

A regra de senha estava escrita em QUATRO lugares:

  packages/utils/src/index.ts        validarSenha()      — sem ninguém usar
  apps/web/src/lib/validators.ts     isStrongPassword()  — a que valia
  api/auth/recuperar/route.ts        quatro `if` à mão
  app/auth/recuperar/page.tsx        duas vezes: validar e desenhar os ✓

As quatro concordavam. Isso não é sorte que dure: é exatamente o estado em
que a próxima mudança diverge, porque quem mexer numa não tem como saber das
outras três. E a divergência aqui tem um sintoma cruel — a tela marca ✓ numa
senha que o servidor recusa, e a pessoa fica clicando sem entender.

Este script falha se alguma dessas regras voltar a aparecer fora da fonte
única (`REGRAS_SENHA`, em `@batcaverna/utils`).

Uso:
    python scripts/checar_regra_unica.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
RAIZ = Path(__file__).resolve().parent.parent

# Onde a regra PODE morar. Qualquer outro arquivo que a escreva é cópia.
FONTE = RAIZ / "packages" / "utils" / "src" / "index.ts"

# Assinaturas da regra de senha. São específicas o bastante para não casar
# com validação de outra coisa: a classe de caracteres especiais é a mesma
# string em todos os lugares onde a regra foi copiada.
ASSINATURAS = [
    (
        "classe de caracteres especiais da senha",
        re.compile(r"\[!@#\$%\^&\*\(\)_\+"),
    ),
]

# Varre o código de aplicação, não os testes nem o gerado.
ALVOS = [
    RAIZ / "apps" / "web" / "src",
    RAIZ / "apps" / "mobile",
    RAIZ / "packages",
]

problemas: list[str] = []
arquivos = 0

for base in ALVOS:
    if not base.exists():
        continue
    for arq in sorted(base.rglob("*.ts*")):
        if "node_modules" in arq.parts or arq.name.endswith(".d.ts"):
            continue
        if arq.resolve() == FONTE.resolve():
            continue

        arquivos += 1
        try:
            texto = arq.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        for nome, rx in ASSINATURAS:
            for m in rx.finditer(texto):
                linha = texto[: m.start()].count("\n") + 1
                problemas.append(
                    f"{arq.relative_to(RAIZ)}:{linha}\n"
                    f"      {nome} escrita fora da fonte única.\n"
                    f"      Use REGRAS_SENHA de @batcaverna/utils — a mesma lista\n"
                    f"      alimenta a validação e a listinha de ✓ da tela."
                )

# A fonte tem que existir e exportar o que promete.
if not FONTE.exists():
    problemas.append(f"{FONTE.relative_to(RAIZ)} não existe")
else:
    fonte_txt = FONTE.read_text(encoding="utf-8")
    if "export const REGRAS_SENHA" not in fonte_txt:
        problemas.append(
            "packages/utils não exporta REGRAS_SENHA — a fonte única sumiu"
        )
    else:
        regras = len(re.findall(r"^\s{4}rotulo:", fonte_txt, re.M))
        if regras < 4:
            problemas.append(
                f"REGRAS_SENHA tem {regras} regra(s); esperava ao menos 4 "
                "(tamanho, maiúscula, número, especial)"
            )


# ══════════════════════════════════════════════════════════════════
print(f"Arquivos varridos : {arquivos}")
print(f"Fonte única       : {FONTE.relative_to(RAIZ)}")
print()

if problemas:
    print(f"!! {len(problemas)} PROBLEMA(S):\n")
    for p in problemas:
        print(f"  - {p}")
    sys.exit(1)

print("A regra de senha existe num lugar só.")
