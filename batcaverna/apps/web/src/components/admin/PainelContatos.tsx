"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Mensagens do formulário público /contato.
 *
 * A tabela era escrita e nunca lida: o admin só via os primeiros 139
 * caracteres na notificação, e o resto da mensagem só existia no SQL Editor
 * do Supabase. Esta aba fecha o ciclo — ler inteiro, marcar como lida e
 * registrar que já foi respondida, usando as colunas que a migration 015 já
 * tinha criado sem ninguém para escrevê-las.
 */

interface Contato {
  id: string;
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  user_id: string | null;
  lido_por_admin: boolean | null;
  respondido_em: string | null;
  criado_em: string;
}

interface Resumo {
  total: number;
  nao_lidos: number;
  respondidos: number;
}

const ROTULO_ASSUNTO: Record<string, string> = {
  duvida: "❓ Dúvida",
  bizu: "💡 Bizu",
  bug: "🐛 Problema",
  parceria: "🤝 Parceria",
  outro: "📋 Outro",
};

function quando(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PainelContatos() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [filtro, setFiltro] = useState<"todos" | "nao_lidos">("todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abertoId, setAbertoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetchWithAuth(`/api/admin/contatos?filtro=${filtro}`);
      const json = await res.json();
      if (json.success) {
        setContatos(json.data.contatos);
        setResumo(json.data.resumo);
      } else {
        setErro(json.error ?? "Não consegui carregar as mensagens.");
      }
    } catch {
      setErro("Falha de conexão ao carregar as mensagens.");
    } finally {
      setCarregando(false);
    }
  }, [filtro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const marcar = async (id: string, acao: string) => {
    const res = await fetchWithAuth("/api/admin/contatos", {
      method: "PATCH",
      body: JSON.stringify({ id, acao }),
    }).catch(() => null);

    const json = res ? await res.json().catch(() => null) : null;
    if (!json?.success) {
      setErro(json?.error ?? "Não consegui atualizar a mensagem.");
      return;
    }

    setContatos((atual) =>
      atual.map((c) => (c.id === id ? { ...c, ...json.data } : c))
    );
    setResumo((r) =>
      r
        ? {
            ...r,
            nao_lidos:
              r.nao_lidos +
              (acao === "marcar_nao_lida" ? 1 : acao === "marcar_lida" || acao === "marcar_respondida" ? -1 : 0),
          }
        : r
    );
  };

  const abrir = (c: Contato) => {
    const novo = abertoId === c.id ? null : c.id;
    setAbertoId(novo);
    // Abrir já conta como ler.
    if (novo && !c.lido_por_admin) marcar(c.id, "marcar_lida");
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="heading text-lg font-bold text-bat-text">
            📨 Mensagens de Contato
          </h2>
          <p className="text-xs text-bat-text-muted">
            Enviadas pelo formulário público. Quem escreve pode não ter conta.
          </p>
        </div>

        {resumo && (
          <div className="flex gap-2 text-xs">
            <span className="rounded-lg bg-bat-bg-secondary px-3 py-1.5 text-bat-text-secondary">
              {resumo.total} no total
            </span>
            <span className="rounded-lg bg-bat-gold-400/15 px-3 py-1.5 font-bold text-bat-gold-400">
              {resumo.nao_lidos} não lida{resumo.nao_lidos !== 1 ? "s" : ""}
            </span>
            <span className="rounded-lg bg-bat-success/15 px-3 py-1.5 text-bat-success">
              {resumo.respondidos} respondida{resumo.respondidos !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </header>

      <div className="flex gap-2">
        {(
          [
            ["todos", "Todas"],
            ["nao_lidos", "Só as não lidas"],
          ] as const
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            onClick={() => setFiltro(valor)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              filtro === valor
                ? "bg-bat-gold-400 text-black"
                : "bg-bat-bg-secondary text-bat-text-secondary hover:bg-bat-bg-elevated"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {erro && (
        <p className="rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-2.5 text-sm text-bat-error">
          {erro}
        </p>
      )}

      {carregando ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : contatos.length === 0 ? (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
          <span className="mb-3 block text-4xl">📭</span>
          <p className="text-sm text-bat-text-secondary">
            {filtro === "nao_lidos"
              ? "Nenhuma mensagem por ler."
              : "Nenhuma mensagem recebida ainda."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {contatos.map((c) => {
            const aberto = abertoId === c.id;
            return (
              <li
                key={c.id}
                className={`overflow-hidden rounded-xl border transition-colors ${
                  c.lido_por_admin
                    ? "border-bat-border bg-bat-bg-card"
                    : "border-bat-gold-400/40 bg-bat-gold-400/5"
                }`}
              >
                <button
                  onClick={() => abrir(c)}
                  className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left"
                  aria-expanded={aberto}
                >
                  <span className="shrink-0 text-lg">
                    {c.lido_por_admin ? "📄" : "🔴"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-bat-text">
                        {c.nome}
                      </span>
                      <span className="rounded-md bg-bat-bg-secondary px-2 py-0.5 text-[10px] text-bat-text-muted">
                        {ROTULO_ASSUNTO[c.assunto] ?? c.assunto}
                      </span>
                      {c.respondido_em && (
                        <span className="rounded-md bg-bat-success/15 px-2 py-0.5 text-[10px] font-bold text-bat-success">
                          respondida
                        </span>
                      )}
                      {c.user_id && (
                        <span className="rounded-md bg-bat-info/15 px-2 py-0.5 text-[10px] text-bat-info">
                          tem conta
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-bat-text-muted">
                      {c.email} · {quando(c.criado_em)}
                    </p>
                    {!aberto && (
                      <p className="mt-1 truncate text-xs text-bat-text-secondary">
                        {c.mensagem}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-bat-text-muted">
                    {aberto ? "▲" : "▼"}
                  </span>
                </button>

                {aberto && (
                  <div className="border-t border-bat-border px-4 py-3">
                    {/* A mensagem inteira — o que a notificação cortava em 139
                        caracteres e não existia em lugar nenhum da interface. */}
                    <p className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
                      {c.mensagem}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent(
                          "Re: seu contato com a BatCaverna"
                        )}`}
                        className="btn-primary px-4 py-2 text-xs no-underline"
                      >
                        ✉️ Responder por e-mail
                      </a>

                      <button
                        onClick={() =>
                          marcar(
                            c.id,
                            c.respondido_em
                              ? "desmarcar_respondida"
                              : "marcar_respondida"
                          )
                        }
                        className="btn-secondary cursor-pointer px-4 py-2 text-xs"
                      >
                        {c.respondido_em
                          ? "Desmarcar respondida"
                          : "Marcar como respondida"}
                      </button>

                      <button
                        onClick={() => marcar(c.id, "marcar_nao_lida")}
                        className="cursor-pointer rounded-lg border border-bat-border px-4 py-2 text-xs text-bat-text-muted transition-colors hover:text-bat-text"
                      >
                        Deixar como não lida
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
