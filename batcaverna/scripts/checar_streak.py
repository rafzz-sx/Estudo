#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Testa a lógica do escudo de sequência sem precisar de Node.

Espelha `avaliarStreak` de apps/web/src/lib/gamificacao.ts. É um espelho, e
espelho pode divergir — por isso o teste confere primeiro se as duas
constantes do TS continuam iguais às daqui, e falha se alguém mudar uma sem
mudar a outra.

Por que testar isto e não outra coisa: o escudo mexe no número que segura o
aluno na plataforma. Errar para mais (escudo que nunca gasta) esvazia o
sentido da corrente; errar para menos (escudo que não salva) devolve o
problema que ele veio resolver.
"""
from __future__ import annotations

import re
import sys
from datetime import date, timedelta
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FONTE = RAIZ / "apps" / "web" / "src" / "lib" / "gamificacao.ts"

DIAS_PARA_RECARGA = 7


def conferir_constantes() -> list[str]:
    """Falha cedo se o TS e este espelho discordarem."""
    txt = FONTE.read_text(encoding="utf-8")
    erros = []

    m = re.search(r"const DIAS_PARA_RECARGA = (\d+);", txt)
    if not m:
        erros.append("não achei DIAS_PARA_RECARGA no TS")
    elif int(m.group(1)) != DIAS_PARA_RECARGA:
        erros.append(
            f"DIAS_PARA_RECARGA divergente: TS={m.group(1)} aqui={DIAS_PARA_RECARGA}"
        )

    if "diff === 2 && escudos >= 1 && streakAtual >= 2" not in txt:
        erros.append("a condição do escudo mudou no TS — reveja este espelho")

    return erros


def avaliar(
    ultimo: str | None,
    hoje: str,
    streak_atual: int,
    escudos: int = 1,
    recarregado_em: str | None = None,
) -> dict:
    def dias(de: str, ate: str) -> int:
        return (date.fromisoformat(ate) - date.fromisoformat(de)).days

    recarregado = recarregado_em or hoje
    recarregou = False

    if dias(recarregado, hoje) >= DIAS_PARA_RECARGA:
        if escudos < 1:
            escudos = 1
            recarregou = True
        recarregado = hoje

    def sem(streak: int) -> dict:
        return {
            "streak": streak,
            "escudos": escudos,
            "recarregado_em": recarregado,
            "usou_escudo": False,
            "recarregou": recarregou,
        }

    if not ultimo:
        return sem(1)

    diff = dias(ultimo, hoje)
    if diff <= 0:
        return sem(max(streak_atual, 1))
    if diff == 1:
        return sem(streak_atual + 1)
    if diff == 2 and escudos >= 1 and streak_atual >= 2:
        return {
            "streak": streak_atual + 1,
            "escudos": escudos - 1,
            "recarregado_em": recarregado,
            "usou_escudo": True,
            "recarregou": recarregou,
        }
    return sem(1)


HOJE = "2026-09-07"


def d(delta: int) -> str:
    return (date.fromisoformat(HOJE) + timedelta(days=delta)).isoformat()


# (descrição, kwargs, streak esperado, usou_escudo esperado)
CASOS = [
    ("primeiro dia de todos", dict(ultimo=None, hoje=HOJE, streak_atual=0), 1, False),
    ("já estudou hoje", dict(ultimo=HOJE, hoje=HOJE, streak_atual=12), 12, False),
    ("dia seguinte, corrente segue", dict(ultimo=d(-1), hoje=HOJE, streak_atual=12), 13, False),
    (
        "furou UM domingo, tem escudo: salva",
        dict(ultimo=d(-2), hoje=HOJE, streak_atual=40),
        41,
        True,
    ),
    (
        "furou UM dia, SEM escudo: zera",
        dict(ultimo=d(-2), hoje=HOJE, streak_atual=40, escudos=0, recarregado_em=d(-1)),
        1,
        False,
    ),
    (
        "furou DOIS dias, mesmo com escudo: zera",
        dict(ultimo=d(-3), hoje=HOJE, streak_atual=40),
        1,
        False,
    ),
    (
        "corrente de 1 dia não merece escudo",
        dict(ultimo=d(-2), hoje=HOJE, streak_atual=1),
        1,
        False,
    ),
    (
        "escudo gasto recarrega depois de 7 dias",
        dict(ultimo=d(-2), hoje=HOJE, streak_atual=40, escudos=0, recarregado_em=d(-8)),
        41,
        True,
    ),
    (
        "escudo gasto NÃO recarrega em 6 dias",
        dict(ultimo=d(-2), hoje=HOJE, streak_atual=40, escudos=0, recarregado_em=d(-6)),
        1,
        False,
    ),
    (
        "voltou depois de um mês",
        dict(ultimo=d(-30), hoje=HOJE, streak_atual=40),
        1,
        False,
    ),
]


def main() -> int:
    problemas = conferir_constantes()
    if problemas:
        print("[ERRO] espelho fora de sincronia com o TypeScript:\n")
        for p in problemas:
            print("  -", p)
        return 1

    falhas = []
    for descricao, kwargs, streak_esp, escudo_esp in CASOS:
        r = avaliar(**kwargs)
        if r["streak"] != streak_esp or r["usou_escudo"] != escudo_esp:
            falhas.append(
                f"{descricao}: streak={r['streak']} (esperado {streak_esp}), "
                f"usou_escudo={r['usou_escudo']} (esperado {escudo_esp})"
            )

    # O escudo não pode acumular: gastar e recarregar tem de voltar a 1, nunca 2.
    r = avaliar(ultimo=d(-2), hoje=HOJE, streak_atual=10, escudos=1, recarregado_em=d(-9))
    if r["escudos"] != 0:
        falhas.append(f"escudo acumulou: sobrou {r['escudos']}, esperado 0")

    print(f"Casos: {len(CASOS) + 1}")
    if falhas:
        print(f"\n{len(falhas)} falha(s):\n")
        for f in falhas:
            print("  -", f)
        return 1

    print("[OK] O escudo salva um domingo, não salva dois, e não acumula.")
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
