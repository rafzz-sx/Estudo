#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Confere, sem Node instalado, três coisas que o TypeScript pegaria no build:

  1. Todo componente <MaiusculoAssim /> usado num .tsx está importado ou
     declarado no próprio arquivo.
  2. Todo hook/utilitário do React usado (useState, useMemo, ...) está no
     import de 'react'.
  3. Chaves, parênteses e colchetes fecham — a checagem ignora o que está
     dentro de string, template literal e comentário.

Não substitui `npm run build`. Pega justamente a classe de erro que aparece
depois de uma edição em massa: usar algo que ninguém importou.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ALVOS = [RAIZ / "apps" / "web" / "src", RAIZ / "packages"]

HOOKS_REACT = {
    "useState", "useEffect", "useRef", "useCallback", "useMemo",
    "useReducer", "useContext", "useLayoutEffect", "useId",
    "useTransition", "useDeferredValue", "useSyncExternalStore",
    "Suspense", "Fragment", "memo", "forwardRef", "createContext",
}

# Componentes que o próprio JSX/Next entrega sem import.
GLOBAIS_JSX = {"Fragment"}


def sem_texto(codigo: str) -> str:
    """Zera strings, templates e comentários para as contagens não mentirem."""
    saida = []
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
                # `${...}` dentro de template ainda é código de verdade
                if aspa == "`" and codigo[i] == "$" and codigo[i + 1 : i + 2] == "{":
                    # O miolo de `${...}` é código de verdade — mas pode ter
                    # STRING dentro ("${n === 1 ? 'revisão' : 'revisões'}").
                    # Sem tratar isso, cada palavra em português dessas
                    # strings virava um "identificador não declarado".
                    prof = 1
                    i += 2
                    inicio = i
                    while i < n and prof:
                        if codigo[i] == "{":
                            prof += 1
                        elif codigo[i] == "}":
                            prof -= 1
                            if prof == 0:
                                break
                        i += 1
                    saida.append(" " + sem_texto(codigo[inicio:i]) + " ")
                    i += 1
                    continue
                i += 1
            saida.append('""')
            continue
        if c == "/" and codigo[i + 1 : i + 2] == "/":
            while i < n and codigo[i] != "\n":
                i += 1
            continue
        if c == "/" and codigo[i + 1 : i + 2] == "*":
            fim = codigo.find("*/", i + 2)
            i = n if fim == -1 else fim + 2
            continue
        # Literal de expressão regular. Sem tratar isto, um /[^a-z]/ conta
        # como colchete aberto e o balanceamento acusa erro em arquivo são.
        # A pista de que é regex e não divisão: o token anterior não pode
        # terminar um valor.
        if c == "/":
            anteriores = [ch for ch in reversed(saida) if not ch.isspace()]
            anterior = anteriores[0] if anteriores else ""
            penultimo = anteriores[1] if len(anteriores) > 1 else ""

            # `<` e `>` antes da barra são fecha-tag do JSX (`</div>`), nunca
            # início de regex. Sem esta exclusão o varredor engolia o resto do
            # componente e acusava parêntese solto em arquivo perfeito.
            #
            # Com UMA exceção: `=>` é seta de arrow function, e uma regex pode
            # ser o corpo dela — `testa: (s) => /[A-Z]/.test(s)`. Sem tratar
            # este caso, o `[` da classe de caracteres entrava no balanço e o
            # verificador acusava colchete solto em arquivo são. Foi o que
            # aconteceu quando as regras de senha viraram uma lista de
            # `{ testa: (s) => /.../ }`.
            fecha_jsx = anterior in "<>" and not (anterior == ">" and penultimo == "=")

            if (
                not fecha_jsx
                and anterior not in ")]}"
                and not (anterior.isalnum() or anterior in "_$\"")
            ):
                j = i + 1
                classe = False
                fechou = False
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
                    saida.append("R")
                    i = j
                    continue
        saida.append(c)
        i += 1
    return "".join(saida)


def nomes_importados(codigo: str) -> set[str]:
    nomes: set[str] = set()
    for bloco in re.findall(r"import\s+([^;]+?)\s+from\s+[\"'][^\"']+[\"']", codigo, re.S):
        bloco = bloco.strip()
        for chaves in re.findall(r"\{([^}]*)\}", bloco, re.S):
            for parte in chaves.split(","):
                parte = parte.strip()
                if not parte:
                    continue
                parte = re.sub(r"^type\s+", "", parte)
                if " as " in parte:
                    parte = parte.split(" as ")[-1]
                nomes.add(parte.strip())
        fora = re.sub(r"\{[^}]*\}", "", bloco)
        for parte in fora.split(","):
            parte = parte.strip().lstrip("* ").replace("as ", "").strip()
            if parte and re.fullmatch(r"[A-Za-z_$][\w$]*", parte):
                nomes.add(parte)
    return nomes


def nomes_declarados(codigo: str) -> set[str]:
    nomes: set[str] = set()
    padroes = [
        r"\bfunction\s+([A-Za-z_$][\w$]*)",
        r"\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*[=:]",
        r"\bclass\s+([A-Za-z_$][\w$]*)",
        r"\b(?:interface|type|enum)\s+([A-Za-z_$][\w$]*)",
    ]
    for p in padroes:
        nomes.update(re.findall(p, codigo))
    return nomes


def desbalanceados(codigo: str) -> list[str]:
    pares = {")": "(", "]": "[", "}": "{"}
    pilha: list[str] = []
    for c in codigo:
        if c in "([{":
            pilha.append(c)
        elif c in ")]}":
            if not pilha or pilha[-1] != pares[c]:
                return [f"fechamento '{c}' sem abertura correspondente"]
            pilha.pop()
    if pilha:
        return [f"{len(pilha)} '{pilha[-1]}' aberto(s) e não fechado(s)"]
    return []


def main() -> int:
    problemas: list[str] = []
    total = 0

    arquivos: list[Path] = []
    for base in ALVOS:
        if base.exists():
            arquivos += [
                p for p in base.rglob("*.ts*")
                if "node_modules" not in p.parts and p.suffix in (".ts", ".tsx")
            ]

    for caminho in sorted(arquivos):
        bruto = caminho.read_text(encoding="utf-8", errors="replace")
        total += 1
        rel = caminho.relative_to(RAIZ).as_posix()
        codigo = sem_texto(bruto)

        # O balanceamento só vale para .ts. Em .tsx o texto que aparece na
        # tela mora no meio do código — `<span>{alt.letra})</span>` tem um
        # parêntese que é conteúdo, não sintaxe. Separar os dois exigiria um
        # analisador de JSX de verdade; para .tsx sobram as duas checagens
        # abaixo, que são as que pegam erro de edição em massa.
        if caminho.suffix == ".ts":
            for erro in desbalanceados(codigo):
                problemas.append(f"{rel}: {erro}")

        disponiveis = nomes_importados(bruto) | nomes_declarados(bruto) | GLOBAIS_JSX

        if caminho.suffix == ".tsx":
            # `Record<string, x>` e `useRef<HTMLDivElement>()` também casam com
            # `<Maiuscula`. A diferença é o que vem ANTES do `<`: em JSX o
            # sinal abre uma tag, então nunca é precedido por identificador,
            # `>` ou fechamento de parêntese/colchete.
            usados = {
                m.group(1)
                for m in re.finditer(r"(?<![\w$>\)\]])<([A-Z][\w$.]*)", codigo)
            }
            for u in sorted(usados):
                raiz = u.split(".")[0]
                if raiz not in disponiveis:
                    problemas.append(f"{rel}: <{u}> usado sem import nem declaração")

        for hook in sorted(HOOKS_REACT):
            if re.search(rf"\b{hook}\s*[(<]", codigo) and hook not in disponiveis:
                problemas.append(f"{rel}: {hook}() usado sem import de 'react'")

    print(f"Arquivos analisados: {total}")
    if problemas:
        print(f"\n{len(problemas)} problema(s):\n")
        for p in problemas:
            print("  -", p)
        return 1
    print("Nenhuma referência solta encontrada.")
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
