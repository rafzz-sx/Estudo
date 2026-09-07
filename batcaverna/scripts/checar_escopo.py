#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Caça identificadores usados e nunca declarados nos arquivos .ts do servidor.

É a classe de erro que derruba `npm run build` e que nenhuma das outras
checagens pegava: o `total_questoes: questoes?.length` da rota de trilha —
`questoes` não existia em lugar nenhum daquele arquivo, e o erro só
apareceria no deploy.

Heurística, não compilador: coleta tudo que o arquivo declara (const, let,
function, parâmetro, desestruturação, import, catch) e compara com tudo que
ele usa. O que sobra é candidato. A lista GLOBAIS evita o falso positivo do
que o Node/DOM/TypeScript oferecem sem declaração.

Só roda em .ts — .tsx tem JSX e o custo de separar texto de código não
compensa aqui.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ALVOS = [RAIZ / "apps" / "web" / "src", RAIZ / "packages"]

GLOBAIS = {
    # JS/TS
    "console", "JSON", "Math", "Date", "Object", "Array", "String", "Number",
    "Boolean", "Promise", "Map", "Set", "WeakMap", "WeakSet", "Symbol",
    "Error", "TypeError", "RangeError", "RegExp", "Infinity", "NaN",
    "undefined", "null", "true", "false", "this", "arguments", "globalThis",
    "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURIComponent",
    "decodeURIComponent", "encodeURI", "decodeURI", "structuredClone",
    "BigInt", "Intl", "Proxy", "Reflect", "AggregateError",
    # Ambiente
    "process", "Buffer", "URL", "URLSearchParams", "TextEncoder",
    "TextDecoder", "crypto", "fetch", "Request", "Response", "Headers",
    "FormData", "Blob", "File", "AbortController", "AbortSignal",
    "setTimeout", "clearTimeout", "setInterval", "clearInterval",
    "queueMicrotask", "atob", "btoa", "window", "document", "navigator",
    "localStorage", "sessionStorage", "Image", "Audio", "CustomEvent",
    "ReadableStream", "TransformStream", "performance",
    # Palavras que a varredura pode capturar como identificador
    "await", "typeof", "instanceof", "in", "of", "new", "return", "as",
    "keyof", "readonly", "satisfies", "void", "any", "never", "unknown",
    "string", "number", "boolean", "object", "symbol", "bigint",
    "Record", "Partial", "Required", "Pick", "Omit", "Exclude", "Extract",
    "ReturnType", "Parameters", "Awaited", "NonNullable", "Readonly",
}

# Palavras-chave que nunca são identificador de valor.
RESERVADAS = {
    "if", "else", "for", "while", "do", "switch", "case", "default", "break",
    "continue", "function", "const", "let", "var", "class", "extends",
    "implements", "interface", "type", "enum", "import", "export", "from",
    "try", "catch", "finally", "throw", "async", "yield", "delete",
    "public", "private", "protected", "static", "abstract", "declare",
    "namespace", "module", "is", "asserts", "infer", "true", "false", "null",
}


def sem_texto(codigo: str) -> str:
    """Zera strings, templates, comentários e regex, preservando `${...}`."""
    saida: list[str] = []
    i, n = 0, len(codigo)
    while i < n:
        c = codigo[i]
        if c in "\"'`":
            aspa = c
            i += 1
            while i < n:
                if codigo[i] == "\\":
                    i += 2
                    continue
                if codigo[i] == aspa:
                    i += 1
                    break
                if aspa == "`" and codigo[i] == "$" and codigo[i + 1 : i + 2] == "{":
                    prof = 1
                    saida.append(" ")
                    i += 2
                    while i < n and prof:
                        if codigo[i] == "{":
                            prof += 1
                        elif codigo[i] == "}":
                            prof -= 1
                            if prof == 0:
                                i += 1
                                break
                        saida.append(codigo[i])
                        i += 1
                    saida.append(" ")
                    continue
                i += 1
            saida.append(" ")
            continue
        if c == "/" and codigo[i + 1 : i + 2] == "/":
            while i < n and codigo[i] != "\n":
                i += 1
            continue
        if c == "/" and codigo[i + 1 : i + 2] == "*":
            fim = codigo.find("*/", i + 2)
            i = n if fim == -1 else fim + 2
            continue
        if c == "/":
            anterior = next((ch for ch in reversed(saida) if not ch.isspace()), "")
            if anterior not in ")]}<>" and not (anterior.isalnum() or anterior in "_$"):
                j, classe, fechou = i + 1, False, False
                while j < n:
                    if codigo[j] == "\\":
                        j += 2
                        continue
                    if codigo[j] == "\n":
                        break
                    if codigo[j] == "[":
                        classe = True
                    elif codigo[j] == "]":
                        classe = False
                    elif codigo[j] == "/" and not classe:
                        fechou = True
                        j += 1
                        break
                    j += 1
                if fechou:
                    while j < n and codigo[j] in "gimsuyd":
                        j += 1
                    saida.append(" ")
                    i = j
                    continue
        saida.append(c)
        i += 1
    return "".join(saida)


IDENT = r"[A-Za-z_$][\w$]*"


def declarados(codigo: str) -> set[str]:
    nomes: set[str] = set()

    # import { a, b as c } from '...'  /  import x from '...'
    for bloco in re.findall(r"import\s+([^;]+?)\s+from\s", codigo, re.S):
        for chaves in re.findall(r"\{([^}]*)\}", bloco, re.S):
            for parte in chaves.split(","):
                parte = re.sub(r"^\s*type\s+", "", parte.strip())
                if " as " in parte:
                    parte = parte.split(" as ")[-1]
                parte = parte.strip()
                if re.fullmatch(IDENT, parte):
                    nomes.add(parte)
        for parte in re.sub(r"\{[^}]*\}", "", bloco).split(","):
            parte = parte.strip().lstrip("* ").split(" as ")[-1].strip()
            if re.fullmatch(IDENT, parte):
                nomes.add(parte)

    padroes = [
        rf"\bfunction\s+({IDENT})",
        rf"\b(?:const|let|var)\s+({IDENT})",
        rf"\bclass\s+({IDENT})",
        rf"\b(?:interface|type|enum|namespace)\s+({IDENT})",
        rf"\bcatch\s*\(\s*({IDENT})",
        # parâmetros nomeados e propriedades desestruturadas, com renome
        rf"[({{,]\s*({IDENT})\s*(?::|=|,|\)|}}|$)",
        rf":\s*({IDENT})\s*[,}}]",  # { data: questoes }
        rf"\.\.\.\s*({IDENT})",
        # desestruturação de array: for (const [termo, canonica] of ...)
        rf"\[\s*({IDENT})\s*(?:,|\])",
        rf",\s*({IDENT})\s*\]",
    ]
    for p in padroes:
        nomes.update(re.findall(p, codigo, re.M))

    # rótulos de objeto literal e assinaturas de tipo entram como declarados:
    # não são referências a valores e só gerariam ruído.
    # `?:` das propriedades opcionais precisa entrar: sem o `\??` toda
    # interface com campo opcional virava falso positivo em massa.
    nomes.update(re.findall(rf"({IDENT})\s*\??\s*:", codigo))

    return nomes


def usados(codigo: str) -> set[str]:
    # Ignora o que vem depois de ponto (acesso a propriedade) e antes de dois
    # pontos (chave de objeto — já contabilizada como declarada).
    sem_props = re.sub(rf"\.\s*{IDENT}", " ", codigo)
    return set(re.findall(IDENT, sem_props))


def main() -> int:
    problemas: list[str] = []
    total = 0

    arquivos: list[Path] = []
    for base in ALVOS:
        if base.exists():
            arquivos += [
                p for p in base.rglob("*.ts")
                if "node_modules" not in p.parts and not p.name.endswith(".d.ts")
            ]

    for caminho in sorted(arquivos):
        total += 1
        bruto = caminho.read_text(encoding="utf-8", errors="replace")
        codigo = sem_texto(bruto)

        disponiveis = declarados(codigo) | GLOBAIS | RESERVADAS
        for nome in sorted(usados(codigo)):
            if nome in disponiveis:
                continue
            if nome[0].isupper():
                continue  # tipos e classes importados de libs
            # `86_400_000` vira o "identificador" `_400_000` na varredura.
            if re.fullmatch(r"_[\d_]*", nome):
                continue
            # Nome de uma ou duas letras é quase sempre parâmetro de arrow
            # function que a heurística não viu declarar. Ruído puro.
            if len(nome) <= 2:
                continue
            problemas.append(
                f"{caminho.relative_to(RAIZ).as_posix()}: `{nome}` usado e nunca declarado"
            )

    print(f"Arquivos .ts analisados: {total}")
    if problemas:
        print(f"\n{len(problemas)} candidato(s) a identificador solto:\n")
        for p in problemas:
            print("  -", p)
        print("\n(heurística — confira cada um antes de mexer)")
        return 1
    print("Nenhum identificador solto.")
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
