#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Resolução e Atualização de Textos-Base de Questões
=============================================================
Este script resolve textos-base de questões incompletas:
1. Textos-base definidos em preâmbulos/seções (ex: EEAR 2023).
2. Textos-base referenciados ("Utilizar o Texto Base da Questão X", "Utilizar o TEXTO I", etc.).
3. Atualiza o banco de dados Supabase diretamente via REST/Service Role.
"""

from __future__ import annotations

import re
import sys
import json
import time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# Importar taxonomia e parsear_arquivo
sys.path.insert(0, str(Path(__file__).resolve().parent))
from parse_questoes import parsear_arquivo, normalizar_para_hash, hash_conteudo

ROMAN_MAP = {
    '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
    'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5'
}

def resolver_textos_base(questoes, texto_arquivo):
    # 1. Textos preâmbulo antes ou entre blocos (ex: EEAR 2023)
    re_multi = re.compile(
        r'^TEXTO\s+BASE\s+PARA\s+(?:AS\s+)?QUEST[ÕO]ES\s+(\d+)\s*(?:[EAaÀà-]|AT[ÉE])\s*(\d+)\s*:\s*\n(.*?)(?=\n-+\n|\n\[QUEST[ÃA]O|\Z)',
        re.M | re.S | re.I
    )
    re_single = re.compile(
        r'^TEXTO\s+BASE\s+PARA\s+(?:A\s+)?QUEST[ÃA]O\s+(\d+)\s*:\s*\n(.*?)(?=\n-+\n|\n\[QUEST[ÃA]O|\Z)',
        re.M | re.S | re.I
    )
    range_map = {}
    for m in re_multi.finditer(texto_arquivo):
        ini, fim = int(m.group(1)), int(m.group(2))
        conteudo = m.group(3).strip()
        for n in range(ini, fim + 1):
            range_map[n] = conteudo

    for m in re_single.finditer(texto_arquivo):
        n = int(m.group(1))
        range_map[n] = m.group(2).strip()

    for q in questoes:
        if not getattr(q, 'texto_base', None) and q.numero_ordem in range_map:
            q.texto_base = range_map[q.numero_ordem]

    # 2. Mapeamento de textos disponíveis no arquivo
    by_num = {(q.materia, q.numero_ordem): q for q in questoes}
    textos_por_tag = {}
    primeiro_por_materia = {}
    for q in questoes:
        tb = getattr(q, 'texto_base', None)
        if tb and not re.search(r'\(Utilizar o (?:Texto Base|TEXTO)', tb, re.I):
            if q.materia not in primeiro_por_materia:
                primeiro_por_materia[q.materia] = tb
            for m in re.finditer(r'TEXTO\s+([IVXLCDM]+|\d+)', tb, re.I):
                tag = m.group(1).upper()
                textos_por_tag[f'TEXTO {tag}'] = tb
                alt = ROMAN_MAP.get(tag)
                if alt:
                    textos_por_tag[f'TEXTO {alt}'] = tb

    # 3. Resolução de referências cruzadas
    for q in questoes:
        tb = getattr(q, 'texto_base', None)
        if not tb or not re.search(r'\(Utilizar o (?:Texto Base|TEXTO)', tb, re.I):
            continue

        resolved_parts = []
        # Estratégia A: por número de questão
        m_q = re.findall(r'Quest[ãa]o\s+(\d+)', tb, re.I)
        if m_q:
            for n in m_q:
                target = by_num.get((q.materia, int(n)))
                if target and target.texto_base and not re.search(r'\(Utilizar o (?:Texto Base|TEXTO)', target.texto_base, re.I):
                    resolved_parts.append(target.texto_base)

        # Estratégia B: por numeral romano ou arábico (TEXTO I, TEXTO 1)
        if not resolved_parts:
            m_tag = re.findall(r'TEXTO\s+([IVXLCDM]+|\d+)', tb, re.I)
            if m_tag:
                for t in m_tag:
                    key = f'TEXTO {t.upper()}'
                    if key in textos_por_tag:
                        resolved_parts.append(textos_por_tag[key])

        # Estratégia C: por título entre aspas
        if not resolved_parts:
            m_title = re.search(r'["“\']([^"”\']+)["”\']', tb)
            if m_title:
                t_str = m_title.group(1).lower().strip()
                for (mat, _), tq in by_num.items():
                    if mat == q.materia and tq.texto_base and t_str in tq.texto_base.lower() and not re.search(r'\(Utilizar o (?:Texto Base|TEXTO)', tq.texto_base, re.I):
                        resolved_parts.append(tq.texto_base)
                        break

        # Estratégia D: fallback por matéria (ex: TEXTO DE INGLÊS)
        if not resolved_parts and re.search(r'TEXTO\s+(?:DE\s+)?(?:INGL[EÊ]S|L[IÍ]NGUA\s+INGLESA)', tb, re.I):
            if 'Inglês' in primeiro_por_materia:
                resolved_parts.append(primeiro_por_materia['Inglês'])

        if resolved_parts:
            q.texto_base = '\n\n---\n\n'.join(resolved_parts)


def carregar_env():
    caminho = Path(__file__).resolve().parent.parent / "apps" / "web" / ".env.local"
    env = {}
    if caminho.exists():
        for linha in caminho.read_text(encoding="utf-8").splitlines():
            linha = linha.strip()
            if linha and not linha.startswith("#") and "=" in linha:
                k, v = linha.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def supabase_patch(url: str, key: str, table: str, query_filter: str, payload: dict):
    endpoint = f"{url}/rest/v1/{table}?{query_filter}"
    dados = json.dumps(payload).encode("utf-8")
    req = Request(
        endpoint,
        data=dados,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        },
        method="PATCH"
    )
    with urlopen(req) as resp:
        return resp.status


def main():
    env = carregar_env()
    sb_url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    sb_key = env.get("SUPABASE_SERVICE_ROLE_KEY")

    if not sb_url or not sb_key:
        print("ERRO: Variáveis do Supabase não encontradas em .env.local")
        return 1

    banco_dir = Path(__file__).resolve().parent.parent.parent / "BANCO DE QUESTOES"
    if not banco_dir.exists():
        banco_dir = Path(__file__).resolve().parent.parent / "BANCO DE QUESTOES"
    print(f"Processando arquivos em {banco_dir}...")

    questoes_com_texto_resolvido = []

    for caminho in sorted(banco_dir.glob("*.txt")):
        try:
            texto_arquivo = caminho.read_text(encoding="utf-8", errors="replace")
            questoes, _ = parsear_arquivo(caminho)
            resolver_textos_base(questoes, texto_arquivo)

            for q in questoes:
                if q.texto_base and not re.search(r'\(Utilizar o (?:Texto Base|TEXTO)', q.texto_base, re.I):
                    questoes_com_texto_resolvido.append(q)
        except Exception as e:
            print(f"Aviso ao processar {caminho.name}: {e}")

    print(f"Total de questões com texto base válido e resolvido: {len(questoes_com_texto_resolvido)}")

    # Buscar do Supabase as questões que estão sem texto_base ou com texto_base contendo "Utilizar o Texto"
    endpoint_get = f"{sb_url}/rest/v1/questoes?select=id,hash_conteudo,enunciado,texto_base&or=(texto_base.is.null,texto_base.ilike.*Utilizar%20o%20Texto*)"
    req = Request(
        endpoint_get,
        headers={
            "apikey": sb_key,
            "Authorization": f"Bearer {sb_key}",
            "Content-Type": "application/json",
        },
        method="GET"
    )
    with urlopen(req) as resp:
        questoes_db = json.loads(resp.read().decode("utf-8"))

    print(f"Questões no banco com texto_base nulo ou placeholder: {len(questoes_db)}")

    # Indexar questões resolvidas por hash_conteudo e por normalização do enunciado
    resolvidas_por_hash = {}
    resolvidas_por_enun = {}
    for q in questoes_com_texto_resolvido:
        resolvidas_por_hash[q.hash_conteudo] = q.texto_base
        norm_enun = normalizar_para_hash(q.enunciado)
        resolvidas_por_enun[norm_enun] = q.texto_base

    atualizadas = 0
    erros = 0

    for q_db in questoes_db:
        qid = q_db["id"]
        h = q_db.get("hash_conteudo")
        texto_resolvido = resolvidas_por_hash.get(h)

        if not texto_resolvido:
            norm_db = normalizar_para_hash(q_db.get("enunciado") or "")
            texto_resolvido = resolvidas_por_enun.get(norm_db)

        if texto_resolvido:
            # Só atualiza se o texto for de fato novo/completo
            if q_db.get("texto_base") != texto_resolvido:
                try:
                    supabase_patch(sb_url, sb_key, "questoes", f"id=eq.{qid}", {"texto_base": texto_resolvido})
                    atualizadas += 1
                    if atualizadas % 25 == 0:
                        print(f"Atualizadas {atualizadas} questões...")
                        time.sleep(0.2)
                except Exception as ex:
                    erros += 1
                    print(f"Erro ao atualizar {qid}: {ex}")

    print(f"\nConcluído com sucesso!")
    print(f"Total de questões atualizadas no Supabase: {atualizadas}")
    print(f"Erros encontrados: {erros}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
