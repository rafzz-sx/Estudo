#!/usr/bin/env python3
"""
Confere o formato do hash de senha de `apps/web/src/lib/auth.ts`.

O TypeScript não roda aqui (não há Node nesta máquina), então este script
reimplementa a MESMA derivação com a biblioteca padrão do Python e confere as
propriedades que precisam valer para a migração transparente funcionar:

  1. os parâmetros lidos do código TS são os esperados;
  2. o formato gravado cabe na coluna `senha_hash VARCHAR(255)`;
  3. hash antigo (SHA-256 de uma volta) e novo nunca se confundem;
  4. a derivação é determinística e sensível ao sal;
  5. a comparação em tempo constante aceita o par certo e recusa o errado.

Isto NÃO executa o código TypeScript — valida o algoritmo, os parâmetros e o
formato. Quem confirma o código em si é o build e o teste de login.
"""
from __future__ import annotations

import hashlib
import io
import os
import re
import secrets
import sys

sys.stdout.reconfigure(encoding="utf-8")

AUTH_TS = os.path.join("apps", "web", "src", "lib", "auth.ts")

falhas: list[str] = []


def checar(condicao: bool, descricao: str) -> None:
    print(f"  [{'OK ' if condicao else 'FALHA'}] {descricao}")
    if not condicao:
        falhas.append(descricao)


# ─── 1. Parâmetros declarados no TypeScript ──────────────────────────────────
fonte = io.open(AUTH_TS, encoding="utf-8").read()

m_iter = re.search(r"const PBKDF2_ITERACOES\s*=\s*([\d_]+)", fonte)
m_bytes = re.search(r"const PBKDF2_BYTES\s*=\s*(\d+)", fonte)

print("1. Parâmetros lidos de lib/auth.ts")
checar(m_iter is not None, "PBKDF2_ITERACOES está declarado")
checar(m_bytes is not None, "PBKDF2_BYTES está declarado")
if not (m_iter and m_bytes):
    sys.exit(1)

iteracoes = int(m_iter.group(1).replace("_", ""))
tamanho = int(m_bytes.group(1))
print(f"       iterações={iteracoes:,}  bytes derivados={tamanho}")

checar(iteracoes >= 100_000, "iterações >= 100.000 (recomendação mínima)")
checar(tamanho >= 32, "derivado com pelo menos 32 bytes")
checar("SHA-256" in fonte and "PBKDF2" in fonte, "usa PBKDF2-HMAC-SHA256")
checar(
    "iguaisEmTempoConstante" in fonte,
    "comparação em tempo constante existe e é usada",
)
checar(
    "crypto.subtle.deriveBits" in fonte,
    "deriva pela Web Crypto (sem dependência nova)",
)

# ─── 2. Formato cabe na coluna ───────────────────────────────────────────────
print("\n2. Formato gravado")


def montar(senha: str, sal: bytes, its: int) -> str:
    derivado = hashlib.pbkdf2_hmac("sha256", senha.encode(), sal, its, tamanho)
    return f"pbkdf2${its}${sal.hex()}${derivado.hex()}"


exemplo = montar("uma-senha-qualquer", secrets.token_bytes(16), iteracoes)
print(f"       {exemplo[:58]}…  ({len(exemplo)} caracteres)")
checar(len(exemplo) <= 255, "cabe em VARCHAR(255) — nenhuma migration necessária")
checar(exemplo.count("$") == 3, "quatro campos separados por '$'")

# ─── 3. Antigo e novo não se confundem ───────────────────────────────────────
print("\n3. Distinção entre o formato antigo e o novo")
antigo = hashlib.sha256(b"uma-senha-qualquer").hexdigest()
checar(len(antigo) == 64, "hash antigo tem 64 caracteres")
checar("$" not in antigo, "hash antigo nunca contém '$'")
checar(not antigo.startswith("pbkdf2$"), "hash antigo nunca começa com 'pbkdf2$'")
checar(exemplo.startswith("pbkdf2$"), "hash novo sempre começa com 'pbkdf2$'")

# O prefixo é hexadecimal-impossível: 'p' não é dígito hexadecimal.
checar(
    not re.fullmatch(r"[0-9a-f]{64}", exemplo),
    "hash novo nunca passa pelo padrão do antigo",
)

# ─── 4. Derivação determinística e sensível ao sal ───────────────────────────
print("\n4. Comportamento da derivação")
sal_a = bytes.fromhex("000102030405060708090a0b0c0d0e0f")
sal_b = bytes.fromhex("0f0e0d0c0b0a09080706050403020100")

h1 = montar("senha-do-aluno", sal_a, iteracoes)
h2 = montar("senha-do-aluno", sal_a, iteracoes)
h3 = montar("senha-do-aluno", sal_b, iteracoes)
h4 = montar("senha-do-alunO", sal_a, iteracoes)

checar(h1 == h2, "mesma senha + mesmo sal => mesmo hash")
checar(h1 != h3, "mesma senha + sal diferente => hash diferente (sem arco-íris)")
checar(h1 != h4, "senha diferente => hash diferente")

# ─── 5. Verificação, como `verificarSenha` faz ───────────────────────────────
print("\n5. Verificação de uma senha contra o guardado")


def conferir(senha: str, guardado: str) -> tuple[bool, bool]:
    """Espelha `verificarSenha`: devolve (confere, precisa_rehash)."""
    if guardado.startswith("pbkdf2$"):
        _, its_txt, sal_hex, esperado = guardado.split("$")
        its = int(its_txt)
        obtido = hashlib.pbkdf2_hmac(
            "sha256", senha.encode(), bytes.fromhex(sal_hex), its, tamanho
        ).hex()
        ok = secrets.compare_digest(obtido, esperado)
        return ok, ok and its < iteracoes
    ok = secrets.compare_digest(hashlib.sha256(senha.encode()).hexdigest(), guardado)
    return ok, ok


ok, rehash = conferir("senha-do-aluno", h1)
checar(ok and not rehash, "senha certa no formato novo: aceita, sem re-hash")

ok, _ = conferir("senha-errada", h1)
checar(not ok, "senha errada no formato novo: recusada")

legado = hashlib.sha256("senha-antiga".encode()).hexdigest()
ok, rehash = conferir("senha-antiga", legado)
checar(ok and rehash, "senha certa no formato antigo: aceita E marcada para re-hash")

ok, _ = conferir("senha-errada", legado)
checar(not ok, "senha errada no formato antigo: recusada")

# Custo menor que o atual também precisa ser re-hasheado.
mais_barato = montar("senha-do-aluno", sal_a, 1_000)
ok, rehash = conferir("senha-do-aluno", mais_barato)
checar(ok and rehash, "hash com menos iterações: aceito E marcado para re-hash")

# ─── Fecho ───────────────────────────────────────────────────────────────────
print()
if falhas:
    print(f"[FALHOU] {len(falhas)} verificação(ões):")
    for f in falhas:
        print(f"   - {f}")
    sys.exit(1)

print("[OK] Formato, parâmetros e migração transparente conferem.")
print("     Ressalva: isto valida o ALGORITMO e o FORMATO, não a execução do")
print("     TypeScript — não há Node nesta máquina.")
