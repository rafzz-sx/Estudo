"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Galeria de insígnias do aluno — as conquistadas e as que faltam.
 *
 * A aba "Badges" do perfil mostrava DADOS FALSOS: um card fixo escrito
 * "Primeiro Login / Entrou na Caverna" e oito cadeados "???" gerados por
 * `Array.from({ length: 8 })`. Nada disso vinha do banco.
 *
 * E não era por falta de dados: `/api/usuarios/me/badges` devolve o catálogo
 * inteiro com `conquistada` marcado por insígnia, `conferirBadges` concede as
 * insígnias em todos os caminhos de XP, e o próprio arquivo do perfil já usava
 * essa rota logo acima, no `SeletorBadges` da aba de configurações. Só esta
 * aba nunca foi ligada — um aluno com dez insígnias via uma inventada e oito
 * interrogações.
 */

interface Badge {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  criterio: string | null;
  cor_hex: string | null;
  raridade: string | null;
  conquistada: boolean;
  conquistado_em: string | null;
}

const ROTULO_RARIDADE: Record<string, { texto: string; cor: string }> = {
  comum: { texto: "Comum", cor: "#94A3B8" },
  rara: { texto: "Rara", cor: "#3B82F6" },
  epica: { texto: "Épica", cor: "#A855F7" },
  lendaria: { texto: "Lendária", cor: "#F5C518" },
};

export function GaleriaBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    fetchWithAuth("/api/usuarios/me/badges")
      .then((r) => r.json())
      .then((json) => {
        if (cancelado) return;
        if (json.success) setBadges(json.data.badges ?? []);
        else setErro(json.error ?? "Não consegui carregar as insígnias.");
      })
      .catch(() => {
        if (!cancelado) setErro("Falha de conexão ao carregar as insígnias.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (carregando) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (erro) {
    return (
      <p className="rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-3 text-sm text-bat-error">
        {erro}
      </p>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
        <span className="mb-3 block text-4xl">🏅</span>
        <p className="text-sm text-bat-text-secondary">
          Nenhuma insígnia cadastrada ainda. Rode os seeds no Supabase.
        </p>
      </div>
    );
  }

  const conquistadas = badges.filter((b) => b.conquistada);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="heading text-base font-bold text-bat-text">
          Suas insígnias
        </h3>
        <p className="text-xs text-bat-text-muted">
          <span className="font-bold text-bat-gold-400">
            {conquistadas.length}
          </span>{" "}
          de {badges.length} conquistadas
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b) => {
          const raridade = ROTULO_RARIDADE[b.raridade ?? "comum"];
          const cor = b.cor_hex ?? raridade?.cor ?? "#94A3B8";

          return (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 text-center transition-all ${
                b.conquistada
                  ? "border-bat-border bg-bat-bg-card"
                  : "border-bat-border/50 bg-bat-bg-card/40"
              }`}
              style={
                b.conquistada
                  ? { borderColor: `${cor}55`, background: `${cor}0F` }
                  : undefined
              }
            >
              <span
                className={`mb-2 block text-4xl ${
                  b.conquistada ? "" : "opacity-25 grayscale"
                }`}
              >
                {b.conquistada ? b.icone ?? "🏅" : "🔒"}
              </span>

              <p
                className={`text-sm font-bold ${
                  b.conquistada ? "text-bat-text" : "text-bat-text-muted"
                }`}
                style={b.conquistada ? { color: cor } : undefined}
              >
                {b.nome}
              </p>

              {/* O critério aparece MESMO na insígnia bloqueada: saber o que
                  falta fazer é o que transforma o cadeado em objetivo. Antes
                  eram oito "???" idênticos. */}
              <p className="mt-1 text-xs leading-snug text-bat-text-muted">
                {b.conquistada ? b.descricao ?? "" : b.criterio ?? b.descricao ?? ""}
              </p>

              {raridade && (
                <span
                  className="mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold"
                  style={{ color: cor, background: `${cor}1A` }}
                >
                  {raridade.texto}
                </span>
              )}

              {b.conquistada && b.conquistado_em && (
                <p className="mt-1.5 text-[10px] text-bat-text-muted">
                  {new Date(b.conquistado_em).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
