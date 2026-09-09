#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Importador de Questões Comentadas & Atualização de Concursos
=======================================================================
1. Atualiza `imagem_fundo_url` na tabela `concursos` para todos os 9 concursos.
2. Filtra as questões que possuem gabarito comentado oficial de `scripts/out/questoes.json`.
3. Valida cada questão com `publicavel()`.
4. Mapeia para os UUIDs de concursos, matérias e assuntos no Supabase.
5. Insere em lotes de 100 via REST API com `resolution=ignore-duplicates`.
6. Sincroniza vínculos em `concurso_materias`.
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

# Adiciona scripts ao path para importar helpers
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from gerar_seed_sql import derivar_passos, precisa_de_resolucao, publicavel

SUPABASE_URL = "https://bzrrbbaqzlfmertirbak.supabase.co/rest/v1"
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
if not SERVICE_ROLE_KEY:
    env_file = ROOT.parent / "apps" / "web" / ".env.local"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("SUPABASE_SERVICE_ROLE_KEY="):
                SERVICE_ROLE_KEY = line.split("=", 1)[1].strip()

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=ignore-duplicates,return=minimal",
}


def request_api(endpoint: str, method="GET", data=None):
    url = f"{SUPABASE_URL}/{endpoint}"
    payload = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=payload, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            body = res.read()
            return json.loads(body.decode("utf-8")) if body else None
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="replace")
        print(f"[-] Erro HTTP {e.code} em {endpoint}: {err_msg}")
        raise


def atualizar_fotos_concursos():
    print("[*] Atualizando imagens de fundo dos 9 concursos...")
    concursos = request_api("concursos?select=id,sigla")
    for c in concursos:
        sigla = c["sigla"].lower()
        img_url = f"/images/concursos/{sigla}.jpg"
        request_api(
            f"concursos?id=eq.{c['id']}",
            method="PATCH",
            data={"imagem_fundo_url": img_url},
        )
        print(f"  -> Concurso {c['sigla']}: imagem_fundo_url = {img_url}")
    print("[+] Imagens de fundo atualizadas com sucesso!")


def carregar_tabelas_apoio():
    print("[*] Carregando concursos, matérias e assuntos do Supabase...")
    concursos_raw = request_api("concursos?select=id,sigla")
    concursos = {c["sigla"].upper(): c["id"] for c in concursos_raw}

    materias_raw = request_api("materias?select=id,nome")
    materias = {m["nome"]: m["id"] for m in materias_raw}

    # Assuntos (pode haver mais de 500, buscar com limit alto)
    assuntos_raw = request_api("assuntos?select=id,materia_id,nome&limit=2000")
    assuntos = {(a["materia_id"], a["nome"]): a["id"] for a in assuntos_raw}

    print(
        f"[+] Carregados: {len(concursos)} concursos, {len(materias)} matérias, {len(assuntos)} assuntos."
    )
    return concursos, materias, assuntos


def extrair_numero(val):
    if not val:
        return None
    m = re.search(r"\d+", str(val))
    return int(m.group()) if m else None


def normalizar_dia_prova(val):
    if not val:
        return None
    s = str(val).lower()
    if "1" in s:
        return 1
    if "2" in s:
        return 2
    if "unica" in s or "única" in s:
        return 1
    return None


def importar_questoes():
    json_path = ROOT / "out" / "questoes.json"
    if not json_path.exists():
        print("[-] Arquivo out/questoes.json não encontrado! Execute parse_questoes.py primeiro.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        questoes_todas = json.load(f)

    print(f"[*] Total de questões no JSON: {len(questoes_todas)}")

    # Filtro: questões que têm gabarito comentado oficial e passam na checagem de qualidade
    candidatas = [
        q for q in questoes_todas
        if (q.get("explicacao_oficial") or "").strip()
        and q.get("resposta_correta")
    ]
    print(f"[*] Questões com explicação oficial preenchida: {len(candidatas)}")

    comentadas = []
    for q in candidatas:
        ok, motivo = publicavel(q)
        if ok:
            comentadas.append(q)

    print(f"[+] Questões válidas para importação: {len(comentadas)}")

    concursos, materias, assuntos = carregar_tabelas_apoio()

    # Prepara registros para inserção
    registros = []
    vinculos_concurso_materia = set()

    for q in comentadas:
        c_id = concursos.get(q["concurso_sigla"].upper())
        m_id = materias.get(q["materia"])
        if not c_id or not m_id:
            continue

        a_nome = q["assunto"] or "Geral"
        a_id = assuntos.get((m_id, a_nome))
        if not a_id:
            a_id = assuntos.get((m_id, "Geral"))

        passos = derivar_passos(q.get("explicacao_oficial"))
        precisa = precisa_de_resolucao(q)
        status = "automatica" if passos else "resumida"

        vinculos_concurso_materia.add((c_id, m_id))

        reg = {
            "concurso_id": c_id,
            "materia_id": m_id,
            "assunto_id": a_id,
            "enunciado": q["enunciado"],
            "texto_base": q.get("texto_base"),
            "alternativas": q["alternativas"],
            "resposta_correta": q["resposta_correta"],
            "explicacao": q.get("explicacao_oficial"),
            "ano": q.get("ano"),
            "banca": (q.get("banca") or "")[:80] or None,
            "dificuldade": q.get("dificuldade") or "medio",
            "dia_prova": normalizar_dia_prova(q.get("dia_prova")),
            "numero_ordem": q.get("numero_ordem"),
            "numero_original": extrair_numero(q.get("numero_original")),
            "area_conhecimento": q.get("area_enem"),
            "figura_descricao": q.get("figura_descricao"),
            "resolucao_passos": passos,
            "resolucao_status": status,
            "precisa_resolucao": precisa,
            "anulada": bool(q.get("anulada")),
            "tem_comentario": True,
            "hash_conteudo": q["hash_conteudo"],
            "arquivo_origem": (q.get("arquivo_origem") or "")[:120],
            "ativa": True,
        }
        registros.append(reg)

    print(f"[*] Registros preparados: {len(registros)}")

    # Inserção em lotes de 100
    tamanho_lote = 100
    total_lotes = (len(registros) + tamanho_lote - 1) // tamanho_lote
    inseridos = 0

    print(f"[*] Iniciando envio para Supabase em {total_lotes} lotes de {tamanho_lote}...")
    for i in range(0, len(registros), tamanho_lote):
        lote = registros[i : i + tamanho_lote]
        num_lote = (i // tamanho_lote) + 1
        try:
            request_api("questoes?on_conflict=hash_conteudo", method="POST", data=lote)
            inseridos += len(lote)
            if num_lote % 5 == 0 or num_lote == total_lotes:
                print(f"  -> Lote {num_lote}/{total_lotes} processado ({inseridos}/{len(registros)} questões)")
        except Exception as e:
            print(f"[-] Erro ao enviar lote {num_lote}: {e}")

    print(f"[+] Concluído envio de questões! Total enviadas: {inseridos}")

    # Sincroniza concurso_materias
    print("[*] Sincronizando vínculos em concurso_materias...")
    vinculos_existentes_raw = request_api("concurso_materias?select=concurso_id,materia_id&limit=1000")
    existentes = {(v["concurso_id"], v["materia_id"]) for v in vinculos_existentes_raw}

    novos_vinculos = [
        {"concurso_id": cid, "materia_id": mid}
        for (cid, mid) in vinculos_concurso_materia
        if (cid, mid) not in existentes
    ]

    if novos_vinculos:
        print(f"[*] Inserindo {len(novos_vinculos)} novos vínculos de concurso_materias...")
        request_api("concurso_materias", method="POST", data=novos_vinculos)
        print("[+] Vínculos de concurso_materias atualizados!")
    else:
        print("[+] Todos os vínculos de concurso_materias já estavam presentes.")


if __name__ == "__main__":
    atualizar_fotos_concursos()
    importar_questoes()
