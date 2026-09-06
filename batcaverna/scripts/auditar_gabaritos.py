#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Auditoria de integridade do banco de questões
===========================================================

Este script NÃO valida se o gabarito está oficialmente certo — para isso
seria preciso comparar com o documento oficial da banca. O que ele faz é
apontar tudo que *cheira a erro* de extração, para revisão humana:

  1. Gabarito ausente
  2. Gabarito apontando para uma letra que não existe nas alternativas
  3. Menos de 4 alternativas
  4. Alternativas repetidas ou vazias
  5. Enunciado suspeito (curto demais, ou ainda com marcação de PDF)
  6. Explicação ausente ou curta demais para ensinar algo
  7. Mesmo enunciado com gabaritos diferentes (contradição interna)
  8. Distribuição de respostas muito longe do uniforme por arquivo
     (sinal clássico de gabarito desalinhado na extração)

Uso:
    python scripts/auditar_gabaritos.py
    python scripts/auditar_gabaritos.py --detalhes    # lista cada caso
    python scripts/auditar_gabaritos.py --csv revisao.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

# Um enunciado com menos que isso foi cortado na extração — MAS só é
# problema quando não há texto base junto. "Infere-se do texto que" é um
# comando completo e legítimo quando o texto está logo acima.
MIN_ENUNCIADO = 25
# Abaixo disso a explicação não ensina nada além de repetir a letra.
MIN_EXPLICACAO = 60
# Desvio máximo tolerado na distribuição A/B/C/D/E dentro de um arquivo.
DESVIO_SUSPEITO = 0.45

RUIDO_PDF = re.compile(r"\[cite|\bcite_start\b|�|\.{10,}", re.I)


def auditar(questoes: list[dict]) -> dict[str, list[dict]]:
    problemas: dict[str, list[dict]] = defaultdict(list)

    # Índice para detectar contradição: mesma questão, gabaritos diferentes.
    # A chave inclui o TEXTO BASE porque enunciados genéricos de inglês
    # ("Choose the correct option according to the text.") se repetem entre
    # provas com textos completamente distintos — sem o texto base, todos
    # eles apareceriam como contradição, o que é ruído puro.
    def chave_questao(q: dict) -> str:
        base = (q.get("texto_base") or "")[:300]
        enun = q.get("enunciado") or ""
        return re.sub(r"\s+", " ", f"{base}|{enun}").strip().lower()[:400]

    por_enunciado: dict[str, set[str]] = defaultdict(set)
    for q in questoes:
        if q.get("resposta_correta"):
            por_enunciado[chave_questao(q)].add(q["resposta_correta"])

    for q in questoes:
        ref = {
            "arquivo": q.get("arquivo_origem"),
            "numero": q.get("numero_ordem"),
            "concurso": q.get("concurso_sigla"),
            "ano": q.get("ano"),
            "materia": q.get("materia"),
            "enunciado": (q.get("enunciado") or "")[:120],
            "gabarito": q.get("resposta_correta"),
        }

        alternativas = q.get("alternativas") or []
        letras = [a.get("letra") for a in alternativas]
        textos = [(a.get("texto") or "").strip() for a in alternativas]

        # 1. Sem gabarito
        if not q.get("resposta_correta"):
            problemas["sem_gabarito"].append(ref)

        # 2. Gabarito fora das alternativas
        elif q["resposta_correta"] not in letras:
            problemas["gabarito_fora_das_alternativas"].append(
                {**ref, "letras": ",".join(letras)}
            )

        # 3. Poucas alternativas
        if len(alternativas) < 4:
            problemas["poucas_alternativas"].append(
                {**ref, "qtd": len(alternativas)}
            )

        # 4. Alternativa vazia ou repetida
        if any(not t for t in textos):
            problemas["alternativa_vazia"].append(ref)
        elif len(set(textos)) != len(textos):
            problemas["alternativa_repetida"].append(ref)

        if len(set(letras)) != len(letras):
            problemas["letra_repetida"].append(ref)

        # 5. Enunciado suspeito
        enunciado = q.get("enunciado") or ""
        tem_texto_base = bool((q.get("texto_base") or "").strip())
        if len(enunciado) < MIN_ENUNCIADO and not tem_texto_base:
            problemas["enunciado_sem_texto_base"].append(ref)
        if RUIDO_PDF.search(enunciado):
            problemas["ruido_de_extracao"].append(ref)

        # 6. Explicação insuficiente
        explicacao = q.get("explicacao_oficial") or ""
        if not explicacao:
            problemas["sem_explicacao"].append(ref)
        elif len(explicacao) < MIN_EXPLICACAO:
            problemas["explicacao_curta"].append(ref)

        # 7. Contradição
        chave = chave_questao(q)
        if len(por_enunciado.get(chave, set())) > 1:
            problemas["gabarito_contraditorio"].append(
                {**ref, "gabaritos": ",".join(sorted(por_enunciado[chave]))}
            )

        # 9. Aviso herdado do parser
        for aviso in q.get("avisos") or []:
            if aviso != "alternativas_insuficientes":
                problemas[f"aviso_{aviso}"].append(ref)

    return problemas


def distribuicao_suspeita(questoes: list[dict]) -> list[dict]:
    """Arquivos cuja distribuição de respostas foge demais do uniforme."""
    por_arquivo: dict[str, Counter] = defaultdict(Counter)
    for q in questoes:
        if q.get("resposta_correta"):
            por_arquivo[q["arquivo_origem"]][q["resposta_correta"]] += 1

    suspeitos = []
    for arquivo, dist in por_arquivo.items():
        total = sum(dist.values())
        if total < 20:
            continue
        esperado = total / len(dist)
        desvio = max(abs(v - esperado) / esperado for v in dist.values())
        if desvio > DESVIO_SUSPEITO:
            suspeitos.append(
                {
                    "arquivo": arquivo,
                    "total": total,
                    "distribuicao": dict(sorted(dist.items())),
                    "desvio": round(desvio * 100, 1),
                }
            )
    return sorted(suspeitos, key=lambda s: -s["desvio"])


GRAVIDADE = {
    "gabarito_fora_das_alternativas": "CRÍTICO",
    "gabarito_contraditorio": "CRÍTICO",
    "letra_repetida": "CRÍTICO",
    "aviso_gabarito_incerto_numeracao_reiniciada": "CRÍTICO",
    "sem_gabarito": "ALTO",
    "alternativa_vazia": "ALTO",
    "poucas_alternativas": "ALTO",
    "enunciado_sem_texto_base": "ALTO",
    "alternativa_repetida": "MÉDIO",
    "ruido_de_extracao": "MÉDIO",
    "sem_explicacao": "BAIXO",
    "explicacao_curta": "BAIXO",
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--entrada", default="scripts/out/questoes.json")
    ap.add_argument("--detalhes", action="store_true")
    ap.add_argument("--csv", help="grava os casos a revisar num CSV")
    args = ap.parse_args()

    questoes = json.loads(Path(args.entrada).read_text(encoding="utf-8"))
    problemas = auditar(questoes)
    suspeitos = distribuicao_suspeita(questoes)

    print(f"Questoes analisadas: {len(questoes)}\n")
    print(f"{'GRAVIDADE':<10} {'PROBLEMA':<44} {'QTD':>6}")
    print("-" * 62)

    ordem = sorted(
        problemas.items(),
        key=lambda kv: (
            ["CRÍTICO", "ALTO", "MÉDIO", "BAIXO", "?"].index(
                GRAVIDADE.get(kv[0], "?")
            ),
            -len(kv[1]),
        ),
    )

    criticos = 0
    for nome, casos in ordem:
        g = GRAVIDADE.get(nome, "?")
        if g == "CRÍTICO":
            criticos += len(casos)
        print(f"{g:<10} {nome:<44} {len(casos):>6}")

    if not problemas:
        print("Nenhum problema encontrado.")

    print("-" * 62)
    print(f"{'':<10} {'CRÍTICOS (bloqueiam publicação)':<44} {criticos:>6}")

    if suspeitos:
        print(f"\nDISTRIBUICAO DE RESPOSTAS SUSPEITA ({len(suspeitos)} arquivo(s)):")
        for s in suspeitos[:10]:
            print(f"  {s['desvio']:>5}%  {s['arquivo']:<26} {s['distribuicao']}")
        print("  (desvio alto pode indicar gabarito desalinhado na extracao)")
    else:
        print("\nDistribuicao de respostas: dentro do esperado em todos os arquivos.")

    if args.detalhes:
        for nome, casos in ordem:
            if GRAVIDADE.get(nome) in ("CRÍTICO", "ALTO"):
                print(f"\n### {nome} ({len(casos)})")
                for c in casos[:20]:
                    print(f"  {c['arquivo']} #{c['numero']} [{c['materia']}] "
                          f"gab={c['gabarito']}")
                    print(f"    {c['enunciado'][:100]}")

    if args.csv:
        linhas = []
        for nome, casos in problemas.items():
            for c in casos:
                linhas.append(
                    {
                        "problema": nome,
                        "gravidade": GRAVIDADE.get(nome, "?"),
                        **{k: v for k, v in c.items()},
                    }
                )
        if linhas:
            campos = sorted({k for l in linhas for k in l})
            with open(args.csv, "w", newline="", encoding="utf-8-sig") as f:
                w = csv.DictWriter(f, fieldnames=campos)
                w.writeheader()
                w.writerows(linhas)
            print(f"\n[OK] {len(linhas)} caso(s) gravados em {args.csv}")

    return 1 if criticos else 0


if __name__ == "__main__":
    raise SystemExit(main())
