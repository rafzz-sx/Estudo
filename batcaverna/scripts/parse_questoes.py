#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Parser do Banco de Questões Oficiais
==================================================

Converte os arquivos .txt de provas oficiais (BANCO DE QUESTOES/) em JSON
estruturado, pronto para virar seed SQL do Supabase.

Os .txt foram gerados em épocas diferentes e possuem 6 variantes de layout
de questão e 6 variantes de gabarito. Este parser detecta a variante
automaticamente por arquivo.

Uso:
    python scripts/parse_questoes.py --entrada "C:/.../BANCO DE QUESTOES" \
                                     --saida scripts/out/questoes.json
    python scripts/parse_questoes.py --stats      # só relatório, não grava

Para adicionar provas novas no futuro: basta soltar o .txt na pasta de
entrada seguindo qualquer um dos layouts suportados e rodar de novo.
O SHA-256 do enunciado normalizado evita duplicatas.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from dataclasses import dataclass, field, asdict
from pathlib import Path

# ══════════════════════════════════════════════════════════════════
# Mapeamento arquivo → concurso da plataforma
# ══════════════════════════════════════════════════════════════════

# CPACN é o concurso de admissão ao Colégio Naval: cai no card "CN".
PREFIXO_CONCURSO = [
    ("cpacn", "CN"),
    ("cn-", "CN"),
    ("efomm", "EFOMM"),
    ("eear", "EEAR"),
    ("epcar", "EPCAR"),
    ("espcex", "EsPCEx"),
    ("esa-", "ESA"),
    ("eam", "EAM"),
    ("ime", "IME"),
    ("enem", "ENEM"),
]

# Normalização de matérias: os .txt usam nomes livres, a plataforma usa
# um conjunto fechado (tabela `materias`).
MATERIAS_CANONICAS = {
    "matematica": "Matemática",
    "portugues": "Português",
    "lingua portuguesa": "Português",
    "lingua portuguesa e literatura": "Português",
    "literatura": "Literatura",
    "ingles": "Inglês",
    "lingua inglesa": "Inglês",
    "lingua estrangeira": "Inglês",
    "lingua estrangeira (ingles)": "Inglês",
    "fisica": "Física",
    "quimica": "Química",
    "biologia": "Biologia",
    "historia": "História",
    "historia do brasil": "História",
    "historia geral": "História",
    "geografia": "Geografia",
    "filosofia": "Filosofia",
    "sociologia": "Sociologia",
    "artes": "Artes",
    "educacao fisica": "Educação Física",
    "redacao": "Redação",
    "atualidades": "Atualidades",
    "informatica": "Informática",
    "ciencias da natureza": "Ciências da Natureza",
    "ciencias humanas": "Ciências Humanas",
    "linguagens": "Linguagens",
}

# Fallback por palavra-chave contida no nome bruto (aplicado só quando o
# nome não bate exatamente nem por prefixo). A ordem importa: o primeiro
# termo encontrado vence, então os mais específicos vêm antes.
MATERIA_POR_TERMO = [
    ("geomorfologia", "Geografia"),
    ("geografia", "Geografia"),
    ("antropologia", "Sociologia"),
    ("sociologia", "Sociologia"),
    ("filosofia", "Filosofia"),
    ("historia", "História"),
    ("literatura", "Literatura"),
    ("ingles", "Inglês"),
    ("espanhol", "Espanhol"),
    ("portugues", "Português"),
    ("gramatica", "Português"),
    ("redacao", "Redação"),
    ("matematica", "Matemática"),
    ("fisica", "Física"),
    ("quimica", "Química"),
    ("biologia", "Biologia"),
    ("artes", "Artes"),
    ("estudos sociais", "Ciências Humanas"),
    ("tecnologia", "Atualidades"),
    ("atualidades", "Atualidades"),
    ("ciencias", "Ciências da Natureza"),
]

# Área do conhecimento (usado pelos cards do ENEM)
AREA_POR_MATERIA = {
    "Matemática": "matematica",
    "Física": "natureza",
    "Química": "natureza",
    "Biologia": "natureza",
    "História": "humanas",
    "Geografia": "humanas",
    "Filosofia": "humanas",
    "Sociologia": "humanas",
    "Português": "linguagens",
    "Literatura": "linguagens",
    "Inglês": "linguagens",
    "Artes": "linguagens",
    "Educação Física": "linguagens",
    "Redação": "linguagens",
}

DIFICULDADES = {
    "facil": "facil",
    "media": "medio",
    "medio": "medio",
    "dificil": "dificil",
    "muito dificil": "dificil",
}


# ══════════════════════════════════════════════════════════════════
# Utilidades
# ══════════════════════════════════════════════════════════════════

def sem_acento(texto: str) -> str:
    return (
        unicodedata.normalize("NFD", texto)
        .encode("ascii", "ignore")
        .decode("ascii")
    )


def normalizar_para_hash(texto: str) -> str:
    """Mesma normalização usada em @batcaverna/utils.normalizarTextoParaHash."""
    return re.sub(r"\s+", " ", sem_acento(texto.lower())).strip()


def hash_conteudo(concurso: str, ano, enunciado: str) -> str:
    base = f"{concurso}|{ano}|{normalizar_para_hash(enunciado)}"
    return hashlib.sha256(base.encode("utf-8")).hexdigest()


# Régua de separação deixada pelo PDF: "--------", "________", "========",
# "........". Aparece como linha própria e também grudada no fim da última
# alternativa quando o extrator junta as linhas.
RE_REGUA = re.compile(r"[-=_·—–]{6,}|\.{8,}")


def eh_regua(linha: str) -> bool:
    """True quando a linha inteira é só uma régua de separação do PDF."""
    return bool(re.fullmatch(r"\s*(?:[-=_·—–]{4,}|\.{6,})[\s\-=_·—–.]*", linha))


def limpar(texto: str | None) -> str:
    """Remove ruído de extração de PDF e normaliza espaços em branco."""
    if not texto:
        return ""
    # Marcadores de citação deixados pelo extrator: "[cite: 12]", "[cite_start]"
    texto = re.sub(r"\[cite[^\]]*\]", "", texto)
    # Réguas de separação — como LINHA inteira e também no meio do texto,
    # que é como elas aparecem depois que o extrator junta as linhas.
    texto = re.sub(r"^[-=_·—–]{4,}\s*$", "", texto, flags=re.M)
    texto = RE_REGUA.sub(" ", texto)
    # Espaços à direita e linhas em branco triplicadas
    texto = "\n".join(linha.rstrip() for linha in texto.splitlines())
    # Colapsa espaços duplicados no MEIO da linha. A indentação do início
    # fica, senão poesia e texto tabulado do ENEM perdem a forma.
    texto = re.sub(r"(?<=\S)[ \t]{2,}(?=\S)", " ", texto)
    texto = re.sub(r"\n{3,}", "\n\n", texto)
    # Sobras de pontuação isolada que a régua deixou para trás.
    texto = re.sub(r"\s+([,;.])", r"\1", texto)
    # Traços/underscores soltos nas pontas. O ponto final legítimo é
    # preservado de propósito — só some se vier acompanhado de traço.
    # No início exigimos 2+ traços (ou traço + espaço) para não comer o
    # sinal de menos de uma alternativa como "-5".
    texto = re.sub(r"^\s*(?:[-=_·—–]{2,}|[-=_·—–]\s)\s*", "", texto)
    texto = re.sub(r"[\s\-=_·—–]+$", "", texto)
    return texto.strip()


def vazio_ou_na(texto: str) -> bool:
    t = limpar(texto).strip().lower().rstrip(".")
    return t in ("", "n/a", "na", "nao ha", "não há", "nenhum", "-", "—")


def canonizar_materia(bruta: str) -> str:
    if not bruta:
        return "Geral"
    chave = sem_acento(bruta.strip().lower())
    chave = re.sub(r"\s+", " ", chave)
    if chave in MATERIAS_CANONICAS:
        return MATERIAS_CANONICAS[chave]
    # tenta pelo prefixo mais longo (ex.: "matematica - geometria plana")
    melhor = None
    for k, v in MATERIAS_CANONICAS.items():
        if chave.startswith(k) and (melhor is None or len(k) > len(melhor[0])):
            melhor = (k, v)
    if melhor:
        return melhor[1]
    for termo, canonica in MATERIA_POR_TERMO:
        if termo in chave:
            return canonica
    return bruta.strip().title()


def canonizar_dificuldade(bruta: str) -> str:
    chave = sem_acento((bruta or "").strip().lower())
    return DIFICULDADES.get(chave, "medio")


def concurso_do_arquivo(nome: str) -> str:
    base = sem_acento(nome.lower())
    for prefixo, sigla in PREFIXO_CONCURSO:
        if base.startswith(prefixo) or f"_{prefixo}" in base or f"-{prefixo}" in base:
            return sigla
    # fallback: primeiro token alfabético
    return re.split(r"[-_. ]", base)[0].upper()


def dia_do_arquivo(nome: str) -> str | None:
    base = sem_acento(nome.lower())
    if "cfs1" in base:
        return "CFS 1"
    if "cfs2" in base:
        return "CFS 2"
    if re.search(r"dia\s*-?1|1\s*dia|_dia1|-dia1", base):
        return "1º dia"
    if re.search(r"dia\s*-?2|2\s*dia|_dia2|-dia2", base):
        return "2º dia"
    if "geral" in base:
        return "Prova única"
    return None


def ano_do_arquivo(nome: str) -> int | None:
    m = re.search(r"(19|20)\d{2}", nome)
    return int(m.group(0)) if m else None


# ══════════════════════════════════════════════════════════════════
# Modelo
# ══════════════════════════════════════════════════════════════════

@dataclass
class Questao:
    concurso_sigla: str
    ano: int | None
    dia_prova: str | None
    banca: str | None
    numero_ordem: int
    numero_original: str | None
    materia: str
    assunto: str
    area_enem: str | None
    dificuldade: str
    texto_base: str | None
    enunciado: str
    alternativas: list[dict]
    resposta_correta: str | None
    explicacao_oficial: str | None
    figura_descricao: str | None
    arquivo_origem: str
    hash_conteudo: str = ""
    # Questão que a banca anulou. Vira uma tarja na tela em vez de um
    # aviso enfiado no meio do enunciado.
    anulada: bool = False
    avisos: list[str] = field(default_factory=list)


# ══════════════════════════════════════════════════════════════════
# Extração de campos dentro de um bloco de questão
# ══════════════════════════════════════════════════════════════════

RE_CAMPO = {
    "concurso": re.compile(r"^\s*Concurso\s*:\s*(.+)$", re.M | re.I),
    # Aceita "2025" e também o intervalo "2018/2019" usado por EPCAR/CPCAR,
    # em que o segundo número é o ano de ingresso (o que a plataforma exibe).
    "ano": re.compile(r"^\s*Ano\s*:\s*(\d{4}(?:\s*/\s*\d{4})?)", re.M | re.I),
    "banca": re.compile(r"^\s*Banca(?:\s+organizadora)?\s*:\s*(.+)$", re.M | re.I),
    "cargo": re.compile(r"^\s*Cargo/[ÁA]rea\s*:\s*(.+)$", re.M | re.I),
    "original": re.compile(r"^\s*N[ºo°]?\s*original[^:]*:\s*(.+)$", re.M | re.I),
    "materia": re.compile(r"^\s*Mat[ée]ria\s*:\s*(.+)$", re.M | re.I),
    "assunto": re.compile(r"^\s*Assunto\s*:\s*(.+)$", re.M | re.I),
    "dificuldade": re.compile(r"^\s*Dificuldade\s*:\s*(.+)$", re.M | re.I),
}

# Cabeçalhos das seções internas do bloco
RE_TEXTO_BASE = re.compile(
    r"^\s*TEXTO\s+BASE[^\n:]*:\s*$", re.M | re.I
)
RE_ENUNCIADO = re.compile(r"^\s*ENUNCIADO\s*:\s*$", re.M | re.I)
RE_ALTERNATIVAS = re.compile(r"^\s*ALTERNATIVAS\s*:\s*$", re.M | re.I)
RE_GABARITO_INLINE = re.compile(
    r"^\s*GABARITO\s+E\s+EXPLICA[ÇC][ÃA]O\s*:\s*$", re.M | re.I
)
RE_RESPOSTA_INLINE = re.compile(
    r"^\s*Resposta\s+Correta\s*:\s*\(?([A-E])\)?", re.M | re.I
)
RE_EXPLICACAO_INLINE = re.compile(
    r"^\s*Explica[çc][ãa]o\s*:\s*(.+?)(?=\n\s*\n|\Z)", re.M | re.I | re.S
)

# Alternativa: "A) texto", "(A) texto", "A. texto", "A - texto", "a) texto".
# O separador é obrigatório para não confundir com uma linha de prosa que
# comece com "A " (ex.: "A figura mostra...").
RE_ALT = re.compile(
    r"^\s*(?:\(\s*([A-Ea-e])\s*\)|([A-Ea-e])\s*[\)\.\:\-–—])\s*(.*)$", re.M
)

# "QUESTÃO: 01 (Inglês)" — rótulo do layout ENEM-2024, não faz parte do texto.
RE_ROTULO_QUESTAO = re.compile(r"^\s*QUEST[ÃA]O\s*:\s*\d+[^\n]*$", re.M | re.I)

RE_IMAGEM = re.compile(r"\[?\s*IMAGEM\s*:\s*([^\]\n]+)\]?", re.I)

# "[QUESTÃO ANULADA NO GABARITO OFICIAL]" — informação da banca que o
# extrator colou no começo do enunciado. Vira campo, não texto.
RE_ANULADA = re.compile(
    r"^\s*\[?\s*QUEST[ÃA]O\s+ANULADA[^\]\n]*\]?\s*$", re.M | re.I
)


def extrair_alternativas(trecho: str) -> tuple[list[dict], list[str]]:
    """Lê um bloco de alternativas A..E, suportando texto em múltiplas linhas."""
    alternativas: list[dict] = []
    avisos: list[str] = []
    atual: dict | None = None

    for linha in trecho.splitlines():
        # A régua de separação do PDF fecha o bloco de alternativas. Sem
        # este corte ela era concatenada na última alternativa — o que
        # sujava 94% do banco com "n/4 ---------- ----------".
        if eh_regua(linha):
            atual = None
            continue

        m = RE_ALT.match(linha)
        if m:
            letra = (m.group(1) or m.group(2)).upper()
            texto = (m.group(3) or "").strip()
            # Só aceita se for a próxima letra esperada (evita capturar
            # "A) " que apareça dentro do corpo de outra alternativa).
            esperada = chr(ord("A") + len(alternativas))
            if letra == esperada:
                atual = {"letra": letra, "texto": texto}
                alternativas.append(atual)
                continue
        if atual is not None and linha.strip():
            atual["texto"] = (atual["texto"] + " " + linha.strip()).strip()

    for a in alternativas:
        a["texto"] = limpar(a["texto"])

    if len(alternativas) < 2:
        avisos.append("alternativas_insuficientes")
    return alternativas, avisos


def fatiar_bloco(bloco: str) -> dict:
    """Divide o bloco nas seções TEXTO BASE / ENUNCIADO / ALTERNATIVAS."""
    marcas = []
    for nome, rx in (
        ("texto_base", RE_TEXTO_BASE),
        ("enunciado", RE_ENUNCIADO),
        ("alternativas", RE_ALTERNATIVAS),
        ("gabarito", RE_GABARITO_INLINE),
    ):
        for m in rx.finditer(bloco):
            marcas.append((m.start(), m.end(), nome))
    marcas.sort()

    secoes: dict[str, str] = {}
    for i, (ini, fim, nome) in enumerate(marcas):
        prox = marcas[i + 1][0] if i + 1 < len(marcas) else len(bloco)
        secoes[nome] = bloco[fim:prox]

    # Cabeçalho = tudo antes da primeira marca (onde ficam Concurso:, Matéria:, ...)
    secoes["_cabecalho"] = bloco[: marcas[0][0]] if marcas else bloco
    return secoes


def montar_questao(
    bloco: str,
    ordem: int,
    ctx: dict,
) -> Questao | None:
    """Transforma um bloco textual em uma Questao."""
    secoes = fatiar_bloco(bloco)
    cab = secoes.get("_cabecalho", "")

    def campo(nome: str, padrao: str = "") -> str:
        m = RE_CAMPO[nome].search(cab) or RE_CAMPO[nome].search(bloco)
        return limpar(m.group(1)) if m else padrao

    materia = canonizar_materia(campo("materia") or ctx.get("materia_secao", ""))
    assunto = campo("assunto") or "Geral"
    ano = campo("ano")
    anos = re.findall(r"\d{4}", ano)
    # Em "2018/2019" vale o ano de ingresso (o último), que é também o que
    # dá nome ao arquivo.
    ano_int = int(anos[-1]) if anos else ctx.get("ano")

    texto_base_raw = secoes.get("texto_base", "")
    enunciado_raw = secoes.get("enunciado", "")
    alts_raw = secoes.get("alternativas", "")

    # Layouts sem cabeçalho "ENUNCIADO:" — o corpo inteiro é enunciado e as
    # alternativas vêm logo em seguida, sem rótulo.
    if not enunciado_raw and not alts_raw:
        corpo = bloco
        for rx in RE_CAMPO.values():
            corpo = rx.sub("", corpo)
        corpo = RE_TEXTO_BASE.sub("", corpo)
        corpo = RE_ROTULO_QUESTAO.sub("", corpo)
        pos_alt = None
        for m in RE_ALT.finditer(corpo):
            if (m.group(1) or m.group(2)).upper() == "A":
                pos_alt = m.start()
                break
        if pos_alt is not None:
            enunciado_raw = corpo[:pos_alt]
            alts_raw = corpo[pos_alt:]
        else:
            enunciado_raw = corpo
    elif not alts_raw and enunciado_raw:
        pos_alt = None
        for m in RE_ALT.finditer(enunciado_raw):
            if (m.group(1) or m.group(2)).upper() == "A":
                pos_alt = m.start()
                break
        if pos_alt is not None:
            alts_raw = enunciado_raw[pos_alt:]
            enunciado_raw = enunciado_raw[:pos_alt]

    alternativas, avisos = extrair_alternativas(alts_raw)

    texto_base = None if vazio_ou_na(texto_base_raw) else limpar(texto_base_raw)
    enunciado = limpar(enunciado_raw)

    # A tarja de anulação sai do enunciado e vira campo próprio.
    anulada = bool(RE_ANULADA.search(enunciado))
    if anulada:
        enunciado = limpar(RE_ANULADA.sub("", enunciado))

    # Alguns layouts juntam texto base e enunciado no mesmo campo.
    if not enunciado and texto_base:
        enunciado, texto_base = texto_base, None

    if not enunciado or len(enunciado) < 12:
        return None

    # Figura descrita em texto: vira o "quadro branco" na plataforma.
    figura = None
    fonte_figura = f"{texto_base or ''}\n{enunciado}"
    m_img = RE_IMAGEM.search(fonte_figura)
    if m_img:
        figura = limpar(m_img.group(1))

    # Gabarito embutido no próprio bloco (layout ENEM-2022)
    resposta = None
    explicacao = None
    if "gabarito" in secoes:
        m_r = RE_RESPOSTA_INLINE.search(secoes["gabarito"])
        if m_r:
            resposta = m_r.group(1).upper()
        m_e = RE_EXPLICACAO_INLINE.search(secoes["gabarito"])
        if m_e:
            explicacao = limpar(m_e.group(1))

    q = Questao(
        concurso_sigla=ctx["concurso"],
        ano=ano_int,
        dia_prova=ctx.get("dia"),
        banca=campo("banca") or ctx.get("banca"),
        numero_ordem=ordem,
        numero_original=campo("original") or None,
        materia=materia,
        assunto=assunto,
        area_enem=AREA_POR_MATERIA.get(materia) if ctx["concurso"] == "ENEM" else None,
        dificuldade=canonizar_dificuldade(campo("dificuldade")),
        texto_base=texto_base,
        enunciado=enunciado,
        alternativas=alternativas,
        resposta_correta=resposta,
        explicacao_oficial=explicacao,
        figura_descricao=figura,
        arquivo_origem=ctx["arquivo"],
        anulada=anulada,
        avisos=avisos,
    )
    q.hash_conteudo = hash_conteudo(q.concurso_sigla, q.ano, q.enunciado)
    return q


# ══════════════════════════════════════════════════════════════════
# Detecção de blocos de questão (6 variantes)
# ══════════════════════════════════════════════════════════════════

# 1) [QUESTÃO 3]  |  [QUESTÃO Nº 3]  |  [QUESTÃO 3 — LÍNGUA INGLESA]
RE_INICIO_COLCHETE = re.compile(r"^\[QUEST[ÃA]O\s+(?:N[ºo°]\s*)?(\d+)[^\]]*\]", re.M | re.I)
# 2) QUESTÃO 01 | ANO: 2025
RE_INICIO_PIPE = re.compile(r"^QUEST[ÃA]O\s+(\d+)\s*\|\s*ANO\s*:", re.M | re.I)
# 3) QUESTÃO 91  (linha isolada)
RE_INICIO_NU = re.compile(r"^QUEST[ÃA]O\s+(\d+)\s*$", re.M | re.I)
# 4) CONCURSO: ENEM  (bloco começa aqui; nº vem em "QUESTÃO: 01")
RE_INICIO_CONCURSO = re.compile(r"^CONCURSO\s*:\s*.+$", re.M | re.I)

# Cabeçalho de seção por matéria (usado como contexto quando o bloco não diz)
RE_SECAO_MATERIA = re.compile(r"^MAT[ÉE]RIA\s*:\s*([A-ZÁÂÃÉÊÍÓÔÕÚÇ \-/()]+)\s*$", re.M)


def detectar_inicios(texto: str) -> tuple[str, list[re.Match]]:
    for nome, rx in (
        ("colchete", RE_INICIO_COLCHETE),
        ("pipe", RE_INICIO_PIPE),
        ("nu", RE_INICIO_NU),
        ("concurso", RE_INICIO_CONCURSO),
    ):
        achados = list(rx.finditer(texto))
        if len(achados) >= 3:
            return nome, achados
    return "nenhum", []


# ══════════════════════════════════════════════════════════════════
# Gabaritos (6 variantes)
# ══════════════════════════════════════════════════════════════════

# "Questão 12 — Gabarito: C" / "Questão 12 (Nº original 7ª) — Gabarito: C"
RE_GAB_TRACO = re.compile(
    r"^Quest[ãa]o\s+(\d+)\s*(?:\([^)]*\))?\s*[—–-]\s*Gabarito\s*:\s*\(?([A-E])\)?",
    re.M | re.I,
)
# "Questão 51: D  (Sociologia - ...)" | "QUESTÃO 167: D"
RE_GAB_DOISPONTOS = re.compile(
    r"^Quest[ãa]o\s+(\d+)\s*:\s*\(?([A-E])\)?", re.M | re.I
)
# "166: E"  (enem-2024)
RE_GAB_NUM = re.compile(r"^\s*(\d{1,3})\s*:\s*\(?([A-E])\)?", re.M)
# "Explicação resumida:" | "Explicação detalhada:" | "Explicação:" |
# "Justificativa:" | "Comentário:" | "Resolução:"
#
# O qualificador era fixo em "resumida", então "Explicação DETALHADA:" não
# casava e a explicação era descartada em silêncio — 98 questões de ESA
# 2024 e EPCAR 2022 entraram sem gabarito comentado por causa disso.
RE_GAB_EXPLICACAO = re.compile(
    r"^(?:Explica[çc][ãa]o(?:\s+\w+)?|Justificativa|Coment[áa]rio|Resolu[çc][ãa]o)"
    r"\s*:\s*(.+?)(?=\n\s*\n|\n\s*Quest[ãa]o\s+\d|\Z)",
    re.M | re.I | re.S,
)

# Explicação SEM rótulo nenhum: o comentário vem no parágrafo logo abaixo
# da linha de gabarito (layout do enem-2018-dia1). Só vale quando o trecho
# não começa por outro rótulo conhecido, senão engoliria a própria linha
# "Gabarito:" da questão seguinte.
RE_GAB_EXPLICACAO_SOLTA = re.compile(
    r"\A\s*\n(?!\s*(?:Explica|Justificativa|Coment|Resolu|Quest[ãa]o\s+\d|=====))"
    r"(.+?)(?=\n\s*\n|\n\s*Quest[ãa]o\s+\d|\Z)",
    re.I | re.S,
)

# Cabeçalho da SEÇÃO de gabarito (fica no fim do arquivo). Precisa excluir o
# rótulo "GABARITO E EXPLICAÇÃO:", que aparece dentro de cada questão no
# layout ENEM-2022 — confundi-lo com a seção truncava o arquivo inteiro.
RE_SECAO_GABARITO = re.compile(
    r"^\s*=*\s*GABARITO(?!\s+E\s+EXPLICA[ÇC][ÃA]O)[^\n]*$", re.M | re.I
)


def extrair_gabaritos(texto: str) -> tuple[dict[int, dict], list[dict]]:
    """Extrai os gabaritos.

    Retorna (por_numero, em_ordem). A lista em ordem de documento é usada
    para os arquivos em que a numeração reinicia a cada matéria (ex.:
    Matemática 1..20 e depois Inglês 1..20) — nesses casos casar por número
    atribuiria o gabarito errado.
    """
    marcas = list(RE_SECAO_GABARITO.finditer(texto))
    escopo = texto[marcas[0].start():] if marcas else texto

    achados: list[tuple[int, str, int]] = []  # (numero, letra, pos_fim)
    for rx in (RE_GAB_TRACO, RE_GAB_DOISPONTOS):
        achados = [
            (int(m.group(1)), m.group(2).upper(), m.end()) for m in rx.finditer(escopo)
        ]
        if achados:
            break
    if not achados:
        achados = [
            (int(m.group(1)), m.group(2).upper(), m.end())
            for m in RE_GAB_NUM.finditer(escopo)
        ]

    em_ordem = [
        {"numero": n, "resposta": letra, "explicacao": None, "_pos": pos}
        for n, letra, pos in achados
    ]

    # Cada explicação pertence ao gabarito imediatamente anterior a ela.
    for m in RE_GAB_EXPLICACAO.finditer(escopo):
        anterior = None
        for item in em_ordem:
            if item["_pos"] <= m.start():
                anterior = item
            else:
                break
        if anterior is not None and anterior["explicacao"] is None:
            anterior["explicacao"] = limpar(m.group(1))

    # 2ª passada: layouts em que o comentário vem logo abaixo da linha de
    # gabarito, sem rótulo nenhum (enem-2018-dia1). Só para os que ficaram
    # sem explicação na passada com rótulo.
    for i, item in enumerate(em_ordem):
        if item["explicacao"] is not None:
            continue
        fim = em_ordem[i + 1]["_pos"] if i + 1 < len(em_ordem) else len(escopo)
        # Recua até o começo da linha seguinte ao gabarito do próximo item,
        # senão o trecho terminaria no meio do rótulo "Questão N".
        trecho = escopo[item["_pos"]: fim]
        m = RE_GAB_EXPLICACAO_SOLTA.match(trecho)
        if not m:
            continue
        texto_expl = limpar(m.group(1))
        # Um comentário de verdade tem corpo; um resto de linha, não.
        if len(texto_expl) >= 40:
            item["explicacao"] = texto_expl

    por_numero: dict[int, dict] = {}
    for item in em_ordem:
        item.pop("_pos", None)
        por_numero.setdefault(item["numero"], item)

    return por_numero, em_ordem


# ══════════════════════════════════════════════════════════════════
# Parser de arquivo
# ══════════════════════════════════════════════════════════════════

def blocos_por_reinicio(numeros: list[int]) -> list[list[int]]:
    """Quebra uma sequência nos pontos em que a numeração reinicia.

    [1,2,3,1,2,1,2,3] -> [[0,1,2], [3,4], [5,6,7]]   (índices, não valores)

    Provas que agrupam por matéria reiniciam a contagem em cada seção; é
    esse reinício que delimita os blocos.
    """
    blocos: list[list[int]] = []
    atual: list[int] = []
    anterior: int | None = None

    for i, n in enumerate(numeros):
        if anterior is not None and n <= anterior:
            blocos.append(atual)
            atual = []
        atual.append(i)
        anterior = n

    if atual:
        blocos.append(atual)
    return blocos


def parear_gabaritos(
    questoes: list[Questao],
    gab_em_ordem: list[dict],
    gab_por_numero: dict[int, dict],
) -> str:
    """Associa cada questão ao seu gabarito. Devolve o método usado.

    A ordem de tentativa importa muito, e é contraintuitiva: **casar pelo
    número vem antes de casar pela posição**.

    O motivo é o ENEM-2020-DIA2. Lá o corpo da prova está em ordem
    misturada (1..90) mas a seção de gabarito é agrupada por matéria —
    Física lista "Questão 1, 3, 6, 9, 15...", Química continua com outros
    números. As duas listas têm 90 itens, então parear por posição parecia
    seguro e atribuía o gabarito de Física a uma questão de Química.
    Como cada número é único naquele arquivo, casar por número acerta.

    Estratégias, da mais segura para a menos:

    1. **numero** — os números das questões são únicos e cobrem o gabarito.
       Independe da ordem em que cada lista foi escrita.
    2. **blocos** — a numeração reinicia por matéria; as duas listas se
       quebram no mesmo número de blocos. Casa bloco a bloco e, dentro de
       cada bloco, por número.
    3. **ordem** — último recurso quando os números não ajudam: as listas
       têm o mesmo tamanho, então casa 1 a 1.
    4. **incerto** — nada disso serviu. Marca para revisão manual.
    """

    def aplicar(q: Questao, gab: dict | None) -> None:
        if not gab:
            return
        if not q.resposta_correta:
            q.resposta_correta = gab["resposta"]
        if not q.explicacao_oficial and gab.get("explicacao"):
            q.explicacao_oficial = gab["explicacao"]

    numeros_q = [q.numero_ordem for q in questoes]
    reinicia = len(numeros_q) != len(set(numeros_q))

    if not gab_em_ordem:
        return "sem_gabarito"

    # ─── 1. Por número, quando os números são únicos ─────────
    if not reinicia:
        cobertura = sum(1 for q in questoes if q.numero_ordem in gab_por_numero)
        # Exige que a esmagadora maioria case; senão a numeração das duas
        # listas fala línguas diferentes e o número não serve de chave.
        if questoes and cobertura >= len(questoes) * 0.9:
            for q in questoes:
                aplicar(q, gab_por_numero.get(q.numero_ordem))
            return "numero"

    # ─── 2. Alinhamento por blocos ───────────────────────────
    if reinicia:
        blocos_q = blocos_por_reinicio(numeros_q)
        blocos_g = blocos_por_reinicio([g["numero"] for g in gab_em_ordem])

        if len(blocos_q) == len(blocos_g):
            for bq, bg in zip(blocos_q, blocos_g):
                # Dentro do bloco, o número é único: casar por ele é seguro.
                porNum = {gab_em_ordem[i]["numero"]: gab_em_ordem[i] for i in bg}
                for i in bq:
                    aplicar(questoes[i], porNum.get(questoes[i].numero_ordem))
            return "blocos"

    # ─── 3. Posicional ───────────────────────────────────────
    if len(gab_em_ordem) == len(questoes):
        for q, gab in zip(questoes, gab_em_ordem):
            aplicar(q, gab)
        return "ordem"

    # ─── 4. Sobrou o número ──────────────────────────────────
    for q in questoes:
        aplicar(q, gab_por_numero.get(q.numero_ordem))

    # Se os números das questões são únicos, casar por eles continua sendo
    # uma chave confiável — o que faltou foi cobertura, não confiança. As
    # questões sem par simplesmente ficam sem gabarito (e o gerador de seed
    # as descarta), o que é preferível a atribuir uma resposta errada.
    if not reinicia:
        return "numero_parcial"

    return "incerto"


def parsear_arquivo(caminho: Path) -> tuple[list[Questao], dict]:
    texto = caminho.read_text(encoding="utf-8", errors="replace")
    nome = caminho.name

    ctx_base = {
        "arquivo": nome,
        "concurso": concurso_do_arquivo(nome),
        "ano": ano_do_arquivo(nome),
        "dia": dia_do_arquivo(nome),
        "banca": None,
    }
    m_banca = re.search(r"^Banca organizadora\s*:\s*(.+)$", texto, re.M | re.I)
    if m_banca:
        ctx_base["banca"] = limpar(m_banca.group(1))

    variante, inicios = detectar_inicios(texto)
    if not inicios:
        return [], {"arquivo": nome, "variante": "nenhum", "total": 0,
                    "com_gabarito": 0, "sem_gabarito": 0, "descartadas": 0}

    # Corta fora a seção de gabarito para não virar "questão"
    marcas_gab = list(RE_SECAO_GABARITO.finditer(texto))
    limite = marcas_gab[0].start() if marcas_gab else len(texto)
    inicios = [m for m in inicios if m.start() < limite]

    gab_por_numero, gab_em_ordem = extrair_gabaritos(texto)

    questoes: list[Questao] = []
    descartadas = 0

    for i, m in enumerate(inicios):
        ini = m.start()
        fim = inicios[i + 1].start() if i + 1 < len(inicios) else limite
        bloco = texto[ini:fim]

        # Número declarado da questão (para casar com o gabarito)
        if variante == "concurso":
            m_num = re.search(r"^QUEST[ÃA]O\s*:\s*(\d+)", bloco, re.M | re.I)
            numero = int(m_num.group(1)) if m_num else i + 1
        else:
            numero = int(m.group(1))

        # Contexto de matéria vindo de "MATÉRIA: XXX" como separador de seção
        ctx = dict(ctx_base)
        secoes_antes = list(RE_SECAO_MATERIA.finditer(texto[:ini]))
        if secoes_antes:
            ctx["materia_secao"] = secoes_antes[-1].group(1).strip()

        q = montar_questao(bloco, numero, ctx)
        if q is None:
            descartadas += 1
            continue
        questoes.append(q)

    # ─── Casamento questão ↔ gabarito ──────────────────────────
    numeros = [q.numero_ordem for q in questoes]
    numeracao_reiniciada = len(numeros) != len(set(numeros))

    metodo = parear_gabaritos(questoes, gab_em_ordem, gab_por_numero)
    casou_por_ordem = metodo in ("ordem", "blocos")
    stats_metodo = metodo

    if metodo == "incerto":
        for q in questoes:
            q.avisos.append("gabarito_incerto_numeracao_reiniciada")

    com_gab = sum(1 for q in questoes if q.resposta_correta)
    stats = {
        "arquivo": nome,
        "concurso": ctx_base["concurso"],
        "ano": ctx_base["ano"],
        "dia": ctx_base["dia"],
        "variante": variante,
        "total": len(questoes),
        "com_gabarito": com_gab,
        "sem_gabarito": len(questoes) - com_gab,
        "com_explicacao": sum(1 for q in questoes if q.explicacao_oficial),
        "com_texto_base": sum(1 for q in questoes if q.texto_base),
        "com_figura": sum(1 for q in questoes if q.figura_descricao),
        "descartadas": descartadas,
        "numeracao_reiniciada": numeracao_reiniciada,
        "casou_por_ordem": casou_por_ordem,
        "gabaritos_encontrados": len(gab_em_ordem),
    }
    return questoes, stats


# ══════════════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════════════

def main() -> int:
    ap = argparse.ArgumentParser(description="Parser do banco de questões BatCaverna")
    ap.add_argument("--entrada", default=r"C:\Users\SARA\documents\BANCO DE QUESTOES")
    ap.add_argument("--saida", default="scripts/out/questoes.json")
    ap.add_argument("--stats", action="store_true", help="Só imprime o relatório")
    args = ap.parse_args()

    pasta = Path(args.entrada)
    if not pasta.is_dir():
        print(f"ERRO: pasta não encontrada: {pasta}", file=sys.stderr)
        return 1

    arquivos = sorted(
        p for p in pasta.iterdir()
        if p.is_file() and (p.suffix.lower() == ".txt" or p.name.endswith("txt"))
    )

    todas: list[Questao] = []
    relatorio: list[dict] = []
    vistos: set[str] = set()
    duplicadas = 0

    for arq in arquivos:
        questoes, stats = parsear_arquivo(arq)
        relatorio.append(stats)
        for q in questoes:
            if q.hash_conteudo in vistos:
                duplicadas += 1
                continue
            vistos.add(q.hash_conteudo)
            todas.append(q)

    # ─── Relatório ────────────────────────────────────────────
    print(f"{'ARQUIVO':<26} {'VAR':<9} {'QTD':>4} {'GAB':>4} {'EXP':>4} {'TB':>4} {'IMG':>4} {'DESC':>5}")
    print("-" * 72)
    for s in relatorio:
        print(
            f"{s['arquivo']:<26} {s['variante']:<9} {s['total']:>4} "
            f"{s['com_gabarito']:>4} {s.get('com_explicacao', 0):>4} "
            f"{s.get('com_texto_base', 0):>4} {s.get('com_figura', 0):>4} "
            f"{s['descartadas']:>5}"
        )
    print("-" * 72)
    print(f"Arquivos: {len(arquivos)}")
    print(f"Questões únicas: {len(todas)}  (duplicadas descartadas: {duplicadas})")
    print(f"Com gabarito: {sum(1 for q in todas if q.resposta_correta)}")
    print(f"Com explicação oficial: {sum(1 for q in todas if q.explicacao_oficial)}")
    print(f"Com texto base: {sum(1 for q in todas if q.texto_base)}")
    print(f"Com figura descrita: {sum(1 for q in todas if q.figura_descricao)}")
    print(f"Sem alternativas suficientes: {sum(1 for q in todas if 'alternativas_insuficientes' in q.avisos)}")

    por_concurso: dict[str, int] = {}
    for q in todas:
        por_concurso[q.concurso_sigla] = por_concurso.get(q.concurso_sigla, 0) + 1
    print("\nPor concurso:", dict(sorted(por_concurso.items(), key=lambda kv: -kv[1])))

    if not args.stats:
        saida = Path(args.saida)
        saida.parent.mkdir(parents=True, exist_ok=True)
        saida.write_text(
            json.dumps([asdict(q) for q in todas], ensure_ascii=False, indent=1),
            encoding="utf-8",
        )
        print(f"\n[OK] JSON gravado em {saida} ({saida.stat().st_size / 1024:.0f} KB)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
