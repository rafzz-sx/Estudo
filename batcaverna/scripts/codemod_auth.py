#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Codemod: unifica a autenticação das API routes.

Antes, cada route.ts declarava seu próprio `getUserFromRequest`. Em 23 delas
o helper lia SÓ o header `Authorization`, mas nenhuma página do front enviava
esse header — todas usavam `fetch` puro, que manda apenas cookie. Resultado:
chat, notificações, tickets, mini-perfil, amigos e o painel admin inteiro
respondiam 401 em silêncio.

Este script reescreve o corpo de cada helper local para delegar ao
`getAuthUserFromRequest` de `@/lib/auth`, que já aceita cookie E header.
As assinaturas e os pontos de chamada continuam iguais — só o corpo muda.

Uso:
    python scripts/codemod_auth.py           # aplica
    python scripts/codemod_auth.py --dry-run # só mostra o que mudaria
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

RAIZ = Path("apps/web/src/app/api")

# Assinatura + corpo do helper local, em qualquer uma das variantes
# (getUserFromRequest, getAdminFromRequest, verifyAdmin).
RE_HELPER = re.compile(
    r"async function (?P<nome>getUserFromRequest|getAdminFromRequest|verifyAdmin)\s*\("
    r"\s*req\s*:\s*NextRequest\s*\)"
    r"(?P<retorno>\s*:\s*Promise<[^>]+>)?"
    r"\s*\{[\s\S]*?\n\}",
    re.M,
)

CORPO_ADMIN = """async function getAdminFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}"""

CORPO_VERIFY_ADMIN = """async function verifyAdmin(req: NextRequest): Promise<boolean> {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin';
}"""

CORPO_OBJETO = """async function getUserFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  return getAuthUserFromRequest(req);
}"""

CORPO_ID = """async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.id ?? null;
}"""

RE_IMPORT_AUTH = re.compile(
    r"import\s*\{([^}]*)\}\s*from\s*['\"]@/lib/auth['\"];"
)


def garantir_import(texto: str) -> str:
    """Adiciona getAuthUserFromRequest ao import de @/lib/auth."""
    m = RE_IMPORT_AUTH.search(texto)
    if m:
        nomes = [n.strip() for n in m.group(1).split(",") if n.strip()]
        if "getAuthUserFromRequest" in nomes:
            return texto
        nomes.append("getAuthUserFromRequest")
        novo = "import { " + ", ".join(sorted(set(nomes))) + " } from '@/lib/auth';"
        return texto[: m.start()] + novo + texto[m.end() :]

    # Não havia import de @/lib/auth: insere depois do último import.
    imports = list(re.finditer(r"^import .*?;$", texto, re.M))
    linha = "import { getAuthUserFromRequest } from '@/lib/auth';"
    if imports:
        fim = imports[-1].end()
        return texto[:fim] + "\n" + linha + texto[fim:]
    return linha + "\n" + texto


def limpar_import_orfao(texto: str) -> str:
    """Remove verifyAccessToken do import se ninguém mais o usa no arquivo."""
    usos = len(re.findall(r"\bverifyAccessToken\b", texto))
    # 1 uso = só a linha de import
    if usos != 1:
        return texto
    m = RE_IMPORT_AUTH.search(texto)
    if not m:
        return texto
    nomes = [
        n.strip() for n in m.group(1).split(",")
        if n.strip() and n.strip() != "verifyAccessToken"
    ]
    if not nomes:
        return texto[: m.start()] + texto[m.end() :].lstrip("\n")
    novo = "import { " + ", ".join(sorted(set(nomes))) + " } from '@/lib/auth';"
    return texto[: m.start()] + novo + texto[m.end() :]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    alterados, ja_ok = [], []

    for arquivo in sorted(RAIZ.rglob("route.ts")):
        texto = arquivo.read_text(encoding="utf-8")
        m = RE_HELPER.search(texto)
        if not m:
            continue

        antigo = m.group(0)
        if "getAuthUserFromRequest" in antigo:
            ja_ok.append(arquivo)
            continue

        nome = m.group("nome")
        retorno = m.group("retorno") or ""

        if nome == "verifyAdmin":
            novo_corpo, forma = CORPO_VERIFY_ADMIN, "admin?"
        elif nome == "getAdminFromRequest":
            novo_corpo, forma = CORPO_ADMIN, "admin"
        else:
            # `Promise<string | null>` => devolve o id; senão o objeto {id, role}
            devolve_id = "string" in retorno
            if not retorno:
                # Sem anotação: decide pelo corpo original.
                devolve_id = "payload?.sub" in antigo
            novo_corpo = CORPO_ID if devolve_id else CORPO_OBJETO
            forma = "id" if devolve_id else "objeto"
        novo = texto[: m.start()] + novo_corpo + texto[m.end() :]
        novo = garantir_import(novo)
        novo = limpar_import_orfao(novo)

        if not args.dry_run:
            arquivo.write_text(novo, encoding="utf-8")
        alterados.append((arquivo, forma))

    for arq, forma in alterados:
        print(f"  [{forma:>6}] {arq.as_posix()}")
    print(f"\nArquivos reescritos : {len(alterados)}")
    print(f"Já estavam corretos : {len(ja_ok)}")
    if args.dry_run:
        print("(dry-run — nada foi gravado)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
