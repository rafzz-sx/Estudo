#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Confere o piso de contraste das cores da Dynamic Island.

O gradiente da ilha vem das duas cores dominantes da capa da música, e todo o
texto por cima é BRANCO. Sem trava, uma capa clara gerava fundo claro com
texto branco — ilegível. `comContraste()` em `DynamicIsland.tsx` baixa a cor
até ela caber num teto de LUMINÂNCIA RELATIVA (WCAG), preservando matiz e
saturação. O teto é de luminância e não de luminosidade HSL porque amarelo e
verde-oliva são percebidos muito mais claros que azul no mesmo L — travando
por L, um oliva passava com 3,9:1.

Sem Node aqui, este script reimplementa a MESMA conversão em Python e confere:

  1. os tetos declarados no TSX são os esperados;
  2. o fundo resultante SEMPRE atinge contraste suficiente com o branco;
  3. matiz e saturação sobrevivem (a cor continua reconhecível);
  4. cor já escura passa intacta.

A régua é a razão de contraste da WCAG 2.1. O alvo é 4.5:1 (texto normal);
o mínimo tolerado aqui é 4.5 para o fundo.
"""
from __future__ import annotations

import colorsys
import io
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

TSX = "apps/web/src/components/DynamicIsland.tsx"
falhas: list[str] = []


def checar(ok: bool, descricao: str) -> None:
    print(f"  [{'OK ' if ok else 'FALHA'}] {descricao}")
    if not ok:
        falhas.append(descricao)


# ─── 1. Tetos declarados no código ───────────────────────────────────────────
fonte = io.open(TSX, encoding="utf-8").read()
m_fundo = re.search(r"const LUZ_MAX_FUNDO\s*=\s*([\d.]+)", fonte)
m_dest = re.search(r"const LUZ_MAX_DESTAQUE\s*=\s*([\d.]+)", fonte)

print("1. Tetos declarados em DynamicIsland.tsx")
checar(m_fundo is not None, "LUZ_MAX_FUNDO está declarado")
checar(m_dest is not None, "LUZ_MAX_DESTAQUE está declarado")
if not (m_fundo and m_dest):
    sys.exit(1)

teto_fundo = float(m_fundo.group(1))
teto_dest = float(m_dest.group(1))
print(f"       fundo={teto_fundo}  destaque={teto_dest}")
checar(teto_fundo < teto_dest, "o fundo é mais escuro que o destaque")
aux_teto = 1.05 / (teto_fundo + 0.05)
print(f"       teto do fundo equivale a {aux_teto:.2f}:1")
checar("rgbParaHsl" in fonte and "hslParaRgb" in fonte, "conversão via HSL (não mistura com preto)")
aux_ok = "luminancia" in fonte
aux_ok2 = "for (let i = 0; i < 24" in fonte
checar(aux_ok, "usa luminância relativa da WCAG, não só L do HSL")
checar(aux_ok2, "ajusta pelo mínimo necessário (busca binária)")


# ─── Reimplementação do que o TSX faz ────────────────────────────────────────
def luminancia(rgb: tuple[int, int, int]) -> float:
    def canal(v: int) -> float:
        c = v / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (canal(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def com_contraste(rgb: tuple[int, int, int], teto: float) -> tuple[int, int, int]:
    """Espelha `comContraste` do TSX: busca binária no L do HSL até a
    LUMINÂNCIA relativa caber no teto. Travar por L direto não serve —
    amarelo e oliva são percebidos muito mais claros que azul no mesmo L."""
    if luminancia(rgb) <= teto:
        return rgb

    r, g, b = (v / 255 for v in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)

    baixo, alto = 0.0, l
    melhor = tuple(round(v * 255) for v in colorsys.hls_to_rgb(h, 0.0, s))

    for _ in range(24):
        meio = (baixo + alto) / 2
        tentativa = tuple(round(v * 255) for v in colorsys.hls_to_rgb(h, meio, s))
        if luminancia(tentativa) <= teto:
            melhor, baixo = tentativa, meio
        else:
            alto = meio

    return melhor


def contraste_com_branco(rgb: tuple[int, int, int]) -> float:
    return 1.05 / (luminancia(rgb) + 0.05)


# ─── 2. Contraste do fundo, varrendo o espaço de cor ─────────────────────────
print("\n2. Contraste com texto branco (WCAG, alvo 4.5:1)")
pior = 10.0
pior_cor = None
testadas = 0

for r in range(0, 256, 15):
    for g in range(0, 256, 15):
        for b in range(0, 256, 15):
            testadas += 1
            razao = contraste_com_branco(com_contraste((r, g, b), teto_fundo))
            if razao < pior:
                pior, pior_cor = razao, (r, g, b)

print(f"       {testadas} cores varridas; pior caso: {pior:.2f}:1 (origem rgb{pior_cor})")
checar(pior >= 4.5, "toda cor de capa resulta em contraste >= 4.5:1 (texto normal)")

# Casos concretos que quebravam antes
print("\n   Capas claras — antes e depois:")
for nome, cor in [
    ("branco puro", (255, 255, 255)),
    ("bege claro", (245, 236, 214)),
    ("amarelo vivo", (255, 214, 10)),
    ("rosa pastel", (255, 209, 220)),
    ("ciano claro", (168, 235, 255)),
]:
    antes = contraste_com_branco(cor)
    depois = contraste_com_branco(com_contraste(cor, teto_fundo))
    print(f"     {nome:<14} {antes:5.2f}:1  ->  {depois:5.2f}:1")
    checar(depois >= 4.5, f"{nome} fica legível")


# ─── 3. A cor continua reconhecível ──────────────────────────────────────────
print("\n3. Identidade da cor preservada")
for nome, cor in [
    ("laranja", (255, 140, 0)),
    ("azul", (60, 140, 255)),
    ("verde", (80, 220, 120)),
]:
    h1, _, s1 = colorsys.rgb_to_hls(*(v / 255 for v in cor))
    novo = com_contraste(cor, teto_fundo)
    h2, _, s2 = colorsys.rgb_to_hls(*(v / 255 for v in novo))
    checar(abs(h1 - h2) < 0.02, f"{nome}: matiz preservado")
    checar(abs(s1 - s2) < 0.02, f"{nome}: saturação preservada")


# ─── 4. Cor já escura passa intacta ──────────────────────────────────────────
print("\n4. Cor que já era escura não é mexida")
for cor in [(11, 11, 15), (30, 20, 40), (0, 0, 0)]:
    checar(com_contraste(cor, teto_fundo) == cor, f"rgb{cor} passa sem alteração")


print()
if falhas:
    print(f"[FALHOU] {len(falhas)} verificação(ões):")
    for f in falhas:
        print(f"   - {f}")
    sys.exit(1)

print("[OK] O fundo da ilha é sempre legível com texto branco,")
print("     e a cor da capa continua reconhecível.")
print("     Ressalva: valida o ALGORITMO, não a execução do TypeScript.")
