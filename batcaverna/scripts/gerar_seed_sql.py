#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BatCaverna — Gerador de seeds SQL do banco de questões
=======================================================

Lê o JSON produzido por `parse_questoes.py` e emite arquivos .sql prontos
para colar no SQL Editor do Supabase (um arquivo por concurso, quebrado em
lotes para não estourar o editor).

Cada arquivo é autossuficiente e idempotente:
  1. cria uma tabela temporária de staging
  2. carrega as questões nela
  3. cria as matérias/assuntos que ainda não existirem
  4. faz o INSERT em `questoes` com ON CONFLICT (hash_conteudo) DO NOTHING

Rodar de novo com o mesmo arquivo não duplica nada.

Uso:
    python scripts/gerar_seed_sql.py
    python scripts/gerar_seed_sql.py --entrada scripts/out/questoes.json \
                                     --saida supabase/seeds
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

# ══════════════════════════════════════════════════════════════════
# Classificação: quais questões exigem resolução passo a passo
# ══════════════════════════════════════════════════════════════════

MATERIAS_DE_CALCULO = {"Matemática", "Física", "Química"}

# Sinais de que a questão é resolvida por dedução/cálculo e não por
# interpretação — nesses casos só o gabarito não ensina nada.
MARCADORES_CALCULO = re.compile(
    r"(?:\bcalcule\b|\bdetermine\b|\bo\s+valor\s+de\b|\bquantos?\b|\bquantas?\b"
    r"|\bresto\s+da\s+divis[ãa]o\b|\b[áa]rea\b|\bper[íi]metro\b|\bvolume\b"
    r"|\bvelocidade\b|\bacelera[çc][ãa]o\b|\bprobabilidade\b|\bpercentual\b"
    r"|\bporcentagem\b|\bequa[çc][ãa]o\b|\bfun[çc][ãa]o\b|\bmassa\s+molar\b"
    r"|\bmol\b|\bconcentra[çc][ãa]o\b|=|\^|√|\bcm\b|\bkm/h\b|\bm/s\b)",
    re.I,
)

# Conectivos que marcam a passagem de uma etapa para a próxima dentro da
# explicação oficial. Usados para quebrar o texto corrido em passos.
CONECTIVOS_PASSO = re.compile(
    r"(?<=[.;])\s+(?="
    r"(?:Portanto|Logo|Assim|Ent[ãa]o|Da[íi]|Substituindo|Aplicando|Somando"
    r"|Subtraindo|Multiplicando|Dividindo|Isolando|Simplificando|Como|Sendo"
    r"|Temos|Tem-se|Sabendo|Considerando|Calculando|Resolvendo|Note|Observe"
    r"|Pela|Pelo|Por fim|Em seguida|Finalmente|Da equa|Da rela)\b)",
    re.I,
)


def publicavel(q: dict) -> bool:
    """Barra o que não tem como o aluno responder na tela.

    Sete questões do ENEM 2022 (2º dia) chegam com TODAS as alternativas
    em branco — no PDF original elas são imagens, e o extrator só trouxe
    as letras. Publicar isso é pior que não ter a questão: o aluno vê
    cinco botões vazios e não tem como escolher.
    """
    if not q.get("resposta_correta"):
        return False

    alternativas = q.get("alternativas") or []
    com_texto = [a for a in alternativas if (a.get("texto") or "").strip()]
    if len(com_texto) < 2:
        return False

    # O gabarito precisa apontar para uma alternativa que exista de fato.
    letras = {a.get("letra") for a in com_texto}
    return q["resposta_correta"] in letras


def precisa_de_resolucao(q: dict) -> bool:
    if q["materia"] in MATERIAS_DE_CALCULO:
        return True
    texto = f"{q.get('enunciado', '')} {q.get('explicacao_oficial') or ''}"
    return bool(MARCADORES_CALCULO.search(texto))


# ── Corte de frases que respeita a notação matemática ────────────────
#
# A versão anterior cortava em qualquer ".!?", o que destruía a resolução
# de toda questão com fatorial: "C_{n,4} = n! / [4! (n-4)!]" virava três
# passos truncados. Aqui o "!" nunca corta, e o "." só corta quando é
# realmente fim de frase (seguido de espaço + maiúscula), nunca dentro de
# "3.14", "Fig." ou de uma lista numerada.
ABREVIACOES = (
    "aprox", "ex", "fig", "obs", "sr", "sra", "dr", "prof", "pág", "pag",
    "cap", "art", "no", "nº", "seg", "min", "máx", "max", "mín", "min",
)
_ABREV_RX = "|".join(ABREVIACOES)

# A próxima frase precisa começar como frase de verdade. Abreviação é
# tratada depois, na remontagem — lookbehind de largura variável não
# existe em `re`.
RE_FIM_DE_FRASE = re.compile(r"(?<=[.;:])\s+(?=[A-ZÀ-Ý(\\])")
RE_TERMINA_EM_ABREV = re.compile(rf"\b(?:{_ABREV_RX})\.$", re.I)

# Ponto/vírgula entre dígitos ("3.14", "10.000", "3,14") nunca é fim de
# frase. Cada um ganha a sua própria sentinela para voltar exatamente como
# estava — trocar "10.000" por "10,000" mudaria o número.
RE_PONTO_NUM = re.compile(r"(?<=\d)\.(?=\d)")

# Rótulo semântico do passo, decidido pela palavra com que ele começa.
# É muito melhor ler "Aplicando a fórmula" do que "Passo 3".
ROTULOS_PASSO = [
    (
        re.compile(
            r"^(?:Dados?|Seja|Sejam|Sabendo|Considerando|Temos|Tem-se|Como|"
            r"Do enunciado|Pelo enunciado|Chamando|Denotando|Suponha)\b",
            re.I,
        ),
        "O que o enunciado dá",
    ),
    (
        re.compile(
            r"^(?:Aplicando|Usando|Utilizando|Pela\s+(?:f[óo]rmula|lei|rela[çc])|"
            r"Pelo\s+(?:teorema|princ[íi]pio)|Da\s+(?:f[óo]rmula|equa|rela)|"
            r"Substituindo|Pela defini)\b",
            re.I,
        ),
        "Aplicando a fórmula",
    ),
    (
        re.compile(
            r"^(?:Calculando|Resolvendo|Somando|Subtraindo|Multiplicando|"
            r"Dividindo|Isolando|Simplificando|Desenvolvendo|Elevando|"
            r"Fatorando|Igualando|Reduzindo|Racionalizando)\b",
            re.I,
        ),
        "Fazendo a conta",
    ),
    (
        re.compile(
            r"^(?:Note|Observe|Repare|Perceba|Ateng|Cuidado|Atenção)\b", re.I
        ),
        "Atenção aqui",
    ),
    (
        re.compile(
            r"^(?:Portanto|Logo|Assim|Ent[ãa]o|Da[íi]|Por fim|Finalmente|"
            r"Conclui|Conclus|Resposta|A alternativa|Segue que)\b",
            re.I,
        ),
        "Conclusão",
    ),
]

# Um passo "é fórmula" quando quase não tem palavra: só número, letra de
# variável e operador. Serve para a tela renderizar em destaque.
RE_SO_MATEMATICA = re.compile(
    r"^[^a-zA-ZÀ-ÿ]{0,6}"
    r"[\d\s\+\-\*/=<>^()\[\]{}.,²³√πΔµ%°|xyzabcnkmrhtvsfg_\\!]+$"
)


def rotular(parte: str, indice: int, ultimo: bool) -> str:
    for rx, rotulo in ROTULOS_PASSO:
        if rx.match(parte):
            return rotulo
    return "Conclusão" if ultimo and indice > 1 else f"Passo {indice}"


def cortar_frases(texto: str) -> list[str]:
    """Corta em frases sem estragar fatorial, decimal nem abreviação."""
    # Protege os pontos que NÃO são fim de frase trocando por sentinelas.
    # Só o ponto precisa de proteção: a vírgula nunca corta frase.
    protegido = RE_PONTO_NUM.sub("\x00", texto)
    brutas = [p.strip() for p in RE_FIM_DE_FRASE.split(protegido) if p.strip()]

    # Remonta o que foi cortado logo depois de uma abreviação ("Fig. 2 ...").
    frases: list[str] = []
    for parte in brutas:
        if frases and RE_TERMINA_EM_ABREV.search(frases[-1]):
            frases[-1] = f"{frases[-1]} {parte}"
        else:
            frases.append(parte)

    return [f.replace("\x00", ".") for f in frases]


def derivar_passos(explicacao: str | None) -> list[dict] | None:
    """Quebra a explicação oficial em passos legíveis.

    Não inventa conteúdo: apenas segmenta o texto oficial nos pontos de
    virada do raciocínio e dá a cada trecho um rótulo que diz o que ele
    faz. Quando não dá para segmentar com confiança, devolve None e a
    questão fica marcada como 'pendente' para receber uma resolução
    escrita depois (pelo admin ou por geração assistida).
    """
    if not explicacao:
        return None

    texto = explicacao.strip()
    if len(texto) < 120:
        return None

    # 1ª tentativa: quebrar nos conectivos de raciocínio.
    partes = [p.strip() for p in CONECTIVOS_PASSO.split(texto) if p.strip()]

    # 2ª tentativa: quebra por frase, agrupando de 2 em 2 para os passos
    # não virarem uma lista de fragmentos soltos.
    if len(partes) < 2:
        frases = cortar_frases(texto)
        if len(frases) < 3:
            return None
        partes = [" ".join(frases[i : i + 2]) for i in range(0, len(frases), 2)]

    # Um "passo" com menos de 25 caracteres é resto de corte, não etapa.
    # Ele é colado no passo anterior em vez de virar uma linha órfã.
    fundidas: list[str] = []
    for parte in partes:
        if fundidas and len(parte) < 25:
            fundidas[-1] = f"{fundidas[-1]} {parte}"
        else:
            fundidas.append(parte)
    partes = fundidas

    if len(partes) < 2 or len(partes) > 8:
        return None

    passos = []
    total = len(partes)
    for i, parte in enumerate(partes, start=1):
        eh_formula = bool(RE_SO_MATEMATICA.fullmatch(parte))
        passos.append(
            {
                "titulo": rotular(parte, i, ultimo=(i == total)),
                "conteudo": parte,
                "formula": parte if eh_formula else None,
            }
        )
    return passos


# ══════════════════════════════════════════════════════════════════
# Emissão de SQL
# ══════════════════════════════════════════════════════════════════

def lit(valor) -> str:
    """Literal SQL seguro."""
    if valor is None or valor == "":
        return "NULL"
    if isinstance(valor, bool):
        return "TRUE" if valor else "FALSE"
    if isinstance(valor, (int, float)):
        return str(valor)
    if isinstance(valor, (list, dict)):
        texto = json.dumps(valor, ensure_ascii=False)
    else:
        texto = str(valor)
    # PostgreSQL: aspas simples são escapadas duplicando.
    return "'" + texto.replace("'", "''") + "'"


CABECALHO = """\
-- ============================================================================
-- BatCaverna — Seed do Banco de Questões: {concurso}
-- Gerado automaticamente por scripts/gerar_seed_sql.py — NÃO EDITE À MÃO.
-- Questões neste arquivo: {total}   |   Lote {lote} de {lotes}
--
-- Pré-requisitos: migrations 000 e 004 já aplicadas.
-- Idempotente: rodar de novo não duplica (ON CONFLICT em hash_conteudo).
-- ============================================================================

BEGIN;

CREATE TEMP TABLE stg_questoes (
  concurso_sigla    TEXT,
  materia_nome      TEXT,
  assunto_nome      TEXT,
  ano               INTEGER,
  dia_prova         TEXT,
  banca             TEXT,
  numero_ordem      INTEGER,
  numero_original   TEXT,
  area_conhecimento TEXT,
  dificuldade       TEXT,
  texto_base        TEXT,
  enunciado         TEXT,
  alternativas      JSONB,
  resposta_correta  TEXT,
  explicacao        TEXT,
  figura_descricao  TEXT,
  resolucao_passos  JSONB,
  resolucao_status  TEXT,
  precisa_resolucao BOOLEAN,
  anulada           BOOLEAN,
  hash_conteudo     TEXT,
  arquivo_origem    TEXT
) ON COMMIT DROP;

INSERT INTO stg_questoes VALUES
"""

RODAPE = """\

-- ─── 1. Garante que as matérias existem ─────────────────────────────
INSERT INTO materias (nome, descricao, icone_emoji)
SELECT DISTINCT s.materia_nome, 'Importada do banco de questões oficial', '📚'
FROM stg_questoes s
WHERE s.materia_nome IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM materias m WHERE m.nome = s.materia_nome);

-- ─── 2. Garante que os assuntos existem ─────────────────────────────
INSERT INTO assuntos (materia_id, nome, ordem)
SELECT DISTINCT m.id, s.assunto_nome, 0
FROM stg_questoes s
JOIN materias m ON m.nome = s.materia_nome
WHERE s.assunto_nome IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM assuntos a
    WHERE a.materia_id = m.id AND a.nome = s.assunto_nome
  );

-- ─── 3. Vincula matéria ao concurso (alimenta os filtros da UI) ─────
INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT DISTINCT c.id, m.id
FROM stg_questoes s
JOIN concursos c ON c.sigla = s.concurso_sigla
JOIN materias  m ON m.nome  = s.materia_nome
WHERE NOT EXISTS (
  SELECT 1 FROM concurso_materias cm
  WHERE cm.concurso_id = c.id AND cm.materia_id = m.id
);

-- ─── 4. Insere as questões ──────────────────────────────────────────
INSERT INTO questoes (
  concurso_id, materia_id, assunto_id,
  enunciado, texto_base, alternativas, resposta_correta, explicacao,
  ano, banca, dificuldade, dia_prova, numero_ordem, numero_original,
  area_conhecimento, figura_descricao, resolucao_passos, resolucao_status,
  precisa_resolucao, anulada, hash_conteudo, arquivo_origem, ativa
)
SELECT
  c.id, m.id, a.id,
  s.enunciado, s.texto_base, s.alternativas, s.resposta_correta, s.explicacao,
  s.ano, s.banca, s.dificuldade::dificuldade_tipo, s.dia_prova,
  s.numero_ordem, s.numero_original, s.area_conhecimento, s.figura_descricao,
  s.resolucao_passos, s.resolucao_status, s.precisa_resolucao, s.anulada,
  s.hash_conteudo, s.arquivo_origem, TRUE
FROM stg_questoes s
JOIN concursos c ON c.sigla = s.concurso_sigla
JOIN materias  m ON m.nome  = s.materia_nome
JOIN assuntos  a ON a.materia_id = m.id AND a.nome = s.assunto_nome
WHERE s.resposta_correta IS NOT NULL
ON CONFLICT (hash_conteudo) DO NOTHING;

-- ─── 5. Registra a importação no armazém ────────────────────────────
INSERT INTO questao_importadas (hash_conteudo, questao_id, arquivo_origem, status)
SELECT s.hash_conteudo, q.id, s.arquivo_origem, 'aceita'::questao_importada_status
FROM stg_questoes s
JOIN questoes q ON q.hash_conteudo = s.hash_conteudo
WHERE NOT EXISTS (
  SELECT 1 FROM questao_importadas qi WHERE qi.hash_conteudo = s.hash_conteudo
);

COMMIT;

SELECT
  '{concurso} — lote {lote}/{lotes}' AS seed,
  (SELECT COUNT(*) FROM questoes) AS total_questoes_no_banco;
"""


def emitir_lote(questoes: list[dict], concurso: str, lote: int, lotes: int) -> str:
    linhas = []
    for q in questoes:
        passos = derivar_passos(q.get("explicacao_oficial"))
        precisa = precisa_de_resolucao(q)
        if passos:
            status = "automatica"
        elif q.get("explicacao_oficial"):
            status = "resumida"
        else:
            status = "pendente"

        campos = [
            lit(q["concurso_sigla"]),
            lit(q["materia"]),
            lit(q["assunto"][:150] if q["assunto"] else "Geral"),
            lit(q["ano"]),
            lit(q["dia_prova"]),
            lit(q["banca"][:80] if q["banca"] else None),
            lit(q["numero_ordem"]),
            lit(q["numero_original"][:20] if q["numero_original"] else None),
            lit(q["area_enem"]),
            lit(q["dificuldade"]),
            lit(q["texto_base"]),
            lit(q["enunciado"]),
            lit(q["alternativas"]),
            lit(q["resposta_correta"]),
            lit(q["explicacao_oficial"]),
            lit(q["figura_descricao"]),
            lit(passos),
            lit(status),
            lit(precisa),
            lit(bool(q.get("anulada"))),
            lit(q["hash_conteudo"]),
            lit(q["arquivo_origem"][:120]),
        ]
        linhas.append("(" + ", ".join(campos) + ")")

    corpo = ",\n".join(linhas) + ";"
    return (
        CABECALHO.format(concurso=concurso, total=len(questoes), lote=lote, lotes=lotes)
        + corpo
        + RODAPE.format(concurso=concurso, lote=lote, lotes=lotes)
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--entrada", default="scripts/out/questoes.json")
    ap.add_argument("--saida", default="supabase/seeds")
    ap.add_argument("--por-lote", type=int, default=400,
                    help="Questões por arquivo (evita estourar o SQL Editor)")
    args = ap.parse_args()

    dados = json.loads(Path(args.entrada).read_text(encoding="utf-8"))
    pasta = Path(args.saida)
    pasta.mkdir(parents=True, exist_ok=True)

    # Só entram questões utilizáveis: com gabarito e com alternativas.
    validas = [q for q in dados if publicavel(q)]
    descartadas = len(dados) - len(validas)

    por_concurso: dict[str, list[dict]] = {}
    for q in validas:
        por_concurso.setdefault(q["concurso_sigla"], []).append(q)

    total_arquivos = 0
    resumo = []
    com_passos = 0
    precisam = 0

    for concurso, questoes in sorted(por_concurso.items()):
        questoes.sort(key=lambda q: (q["ano"] or 0, q["dia_prova"] or "", q["numero_ordem"]))
        lotes = (len(questoes) + args.por_lote - 1) // args.por_lote
        for i in range(lotes):
            fatia = questoes[i * args.por_lote : (i + 1) * args.por_lote]
            sql = emitir_lote(fatia, concurso, i + 1, lotes)
            nome = f"{concurso.lower()}_{i + 1:02d}.sql"
            (pasta / nome).write_text(sql, encoding="utf-8")
            total_arquivos += 1

        com_passos += sum(
            1 for q in questoes if derivar_passos(q.get("explicacao_oficial"))
        )
        precisam += sum(1 for q in questoes if precisa_de_resolucao(q))
        resumo.append((concurso, len(questoes), lotes))

    print(f"{'CONCURSO':<10} {'QUESTOES':>9} {'ARQUIVOS':>9}")
    print("-" * 32)
    for c, n, l in resumo:
        print(f"{c:<10} {n:>9} {l:>9}")
    print("-" * 32)
    print(f"Total de questoes gravadas : {len(validas)}")
    print(f"Descartadas (impublicaveis): {descartadas}")
    print(f"Com passos derivados       : {com_passos}")
    print(f"Marcadas 'precisa_resolucao': {precisam}")
    print(f"Arquivos .sql gerados      : {total_arquivos} em {pasta}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
