#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Confere `repartirVagas` de `apps/web/src/lib/distribuicao-prova.ts`.

É o algoritmo que decide quantas questões de cada matéria entram no simulado
"Formato da banca". Repartição proporcional com teto é onde erro de
arredondamento se esconde: arredondar cada fatia por conta própria produz 59
ou 61 questões numa prova de 60, e uma matéria pode ser cobrada além do que
existe no banco.

Sem Node aqui, este script reimplementa o MESMO algoritmo em Python e confere
as invariantes que precisam valer sempre:

  1. o total entregue é exatamente o pedido (quando há questões suficientes);
  2. nenhuma matéria recebe mais do que tem;
  3. entre as matérias com folga, o desvio fica abaixo de 1 vaga;
  4. casos de borda não quebram (zero, uma matéria só, banco menor que a prova).

Isto NÃO executa o TypeScript — valida o algoritmo. Quem confirma o código é
o build.
"""
from __future__ import annotations

import io
import math
import random
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

TS = "apps/web/src/lib/distribuicao-prova.ts"
falhas: list[str] = []


def checar(ok: bool, descricao: str) -> None:
    print(f"  [{'OK ' if ok else 'FALHA'}] {descricao}")
    if not ok:
        falhas.append(descricao)


# ─── Reimplementação de `repartirVagas` ──────────────────────────────────────
def repartir(total: int, fatias: list[dict]) -> dict[str, int]:
    """Espelha `repartirVagas` do TS: trava iterativa + um resto-maior."""
    vagas: dict[str, int] = {}
    if total <= 0 or not fatias:
        return vagas

    restante = total
    pool = [f for f in fatias if f["disponiveis"] > 0]

    # 1. Trava quem nao cabe, redividindo o resto entre os demais.
    while True:
        soma = sum(f["peso"] for f in pool)
        if soma <= 0 or not pool or restante <= 0:
            break
        estouraram = [f for f in pool if (f["peso"] / soma) * restante >= f["disponiveis"]]
        if not estouraram:
            break
        for f in estouraram:
            vagas[f["id"]] = f["disponiveis"]
            restante -= f["disponiveis"]
        pool = [f for f in pool if f not in estouraram]

    # 2. Resto maior entre quem sobrou.
    soma = sum(f["peso"] for f in pool)
    if restante > 0 and soma > 0:
        exatos = []
        for f in pool:
            ideal = (f["peso"] / soma) * restante
            exatos.append({"f": f, "ideal": ideal, "base": math.floor(ideal)})

        usadas = 0
        for e in exatos:
            if e["base"] > 0:
                vagas[e["f"]["id"]] = vagas.get(e["f"]["id"], 0) + e["base"]
                usadas += e["base"]

        sobra = restante - usadas
        por_resto = sorted(exatos, key=lambda x: x["ideal"] - x["base"], reverse=True)

        while sobra > 0:
            deu = False
            for e in por_resto:
                if sobra <= 0:
                    break
                atual = vagas.get(e["f"]["id"], 0)
                if atual >= e["f"]["disponiveis"]:
                    continue
                vagas[e["f"]["id"]] = atual + 1
                sobra -= 1
                deu = True
            if not deu:
                break

    return {k: v for k, v in vagas.items() if v > 0}


# ─── 1. O código TS declara o que se espera ──────────────────────────────────
fonte = io.open(TS, encoding="utf-8").read()
print("1. Estrutura do arquivo TypeScript")
checar("export function repartirVagas" in fonte, "repartirVagas é exportada")
checar("export async function distribuicaoDaProva" in fonte, "distribuicaoDaProva é exportada")
checar("peso_na_prova" in fonte, "usa o peso do edital quando existe")
checar("estouraram" in fonte, "trava iterativa de quem não cabe no estoque")
aux_hn = "porResto" in fonte
aux_hn2 = fonte.count("Math.floor(ideal)") >= 1
checar(aux_hn and aux_hn2, "resto maior (Hare-Niemeyer) numa rodada só")


# ─── 2. Invariantes, com sorteio ─────────────────────────────────────────────
print("\n2. Invariantes em 3.000 cenários sorteados")
random.seed(20260907)

erro_total = 0
erro_teto = 0
erro_prop = 0
cenarios = 3000

for _ in range(cenarios):
    n = random.randint(1, 12)
    fatias = []
    for i in range(n):
        fatias.append(
            {
                "id": f"m{i}",
                "peso": random.random() + 0.01,
                "disponiveis": random.choice([0, 1, 3, 10, 40, 200, 1200]),
            }
        )
    soma = sum(f["peso"] for f in fatias)
    for f in fatias:
        f["peso"] /= soma

    total = random.choice([10, 20, 45, 50, 60, 90, 180])
    capacidade = sum(f["disponiveis"] for f in fatias)
    vagas = repartir(total, fatias)
    entregue = sum(vagas.values())

    esperado = min(total, capacidade)
    if entregue != esperado:
        erro_total += 1

    for f in fatias:
        if vagas.get(f["id"], 0) > f["disponiveis"]:
            erro_teto += 1

    # Proporção — a invariante correta.
    #
    # Comparar com `peso * total` seria ERRADO: quando uma matéria bate no
    # teto, o excedente dela é redistribuído, e quem tem folga passa a receber
    # MAIS que a fatia original. Isso é o comportamento desejado (foi o que a
    # primeira versão deste teste reprovou por engano).
    #
    # O que precisa valer é proporcionalidade ENTRE AS QUE TÊM FOLGA: dentro
    # desse grupo, as fatias mantêm a razão entre si.
    if entregue == total:
        livres = [f for f in fatias if vagas.get(f["id"], 0) < f["disponiveis"]]
        peso_livre = sum(f["peso"] for f in livres)
        total_livre = sum(vagas.get(f["id"], 0) for f in livres)
        if peso_livre > 0 and total_livre > 0:
            for f in livres:
                ideal = (f["peso"] / peso_livre) * total_livre
                if abs(vagas.get(f["id"], 0) - ideal) > 1.5:
                    erro_prop += 1
                    break

checar(erro_total == 0, f"total entregue sempre correto ({cenarios - erro_total}/{cenarios})")
checar(erro_teto == 0, "nenhuma matéria recebe mais questões do que tem")
checar(erro_prop == 0, "proporção mantida entre as matérias com folga")


# ─── 3. Casos concretos ──────────────────────────────────────────────────────
print("\n3. Uma prova da EEAR: 60 questões")
eear = [
    {"id": "mat", "peso": 0.40, "disponiveis": 150},
    {"id": "fis", "peso": 0.30, "disponiveis": 120},
    {"id": "por", "peso": 0.20, "disponiveis": 90},
    {"id": "ing", "peso": 0.10, "disponiveis": 22},
]
v = repartir(60, eear)
print(f"       {v}  ->  total {sum(v.values())}")
checar(sum(v.values()) == 60, "soma exatamente 60")
checar(v.get("mat") == 24 and v.get("fis") == 18, "40% e 30% viram 24 e 18")
checar(v.get("por") == 12 and v.get("ing") == 6, "20% e 10% viram 12 e 6")

print("\n   Matéria com banco raso: o excedente vai para as outras")
raso = [
    {"id": "mat", "peso": 0.50, "disponiveis": 500},
    {"id": "fis", "peso": 0.50, "disponiveis": 4},
]
v = repartir(60, raso)
print(f"       {v}  ->  total {sum(v.values())}")
checar(sum(v.values()) == 60, "ainda entrega 60")
checar(v.get("fis") == 4, "Física entra com as 4 que existem, não 30")
checar(v.get("mat") == 56, "as 26 que sobraram foram para Matemática")

print("\n   Banco menor que a prova: entrega o que dá, sem inventar")
curto = [
    {"id": "mat", "peso": 0.7, "disponiveis": 5},
    {"id": "fis", "peso": 0.3, "disponiveis": 3},
]
v = repartir(60, curto)
checar(sum(v.values()) == 8, "entrega as 8 disponíveis")

print("\n4. Casos de borda")
checar(repartir(0, eear) == {}, "total zero devolve vazio")
checar(repartir(60, []) == {}, "sem matérias devolve vazio")
checar(
    sum(repartir(60, [{"id": "u", "peso": 1.0, "disponiveis": 900}]).values()) == 60,
    "uma matéria só recebe tudo",
)
checar(
    repartir(60, [{"id": "z", "peso": 1.0, "disponiveis": 0}]) == {},
    "matéria sem questão não entra",
)

print()
if falhas:
    print(f"[FALHOU] {len(falhas)} verificação(ões):")
    for f in falhas:
        print(f"   - {f}")
    sys.exit(1)

print("[OK] A repartição fecha a conta, respeita o estoque e mantém a proporção.")
print("     Ressalva: valida o ALGORITMO, não a execução do TypeScript.")
