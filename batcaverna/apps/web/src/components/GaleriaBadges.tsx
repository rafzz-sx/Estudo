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

export const ROTULO_RARIDADE: Record<
  string,
  { texto: string; cor: string; ordem: number; badgeIcon?: string }
> = {
  comum: { texto: "Comum", cor: "#94A3B8", ordem: 1 },
  rara: { texto: "Rara", cor: "#22C55E", ordem: 2 },
  epica: { texto: "Épica", cor: "#A855F7", ordem: 3 },
  lendaria: { texto: "Lendária", cor: "#F5C518", ordem: 4, badgeIcon: "👑" },
  mitica: { texto: "Mítica", cor: "#EF4444", ordem: 5, badgeIcon: "🔥" },
  fundador: { texto: "Fundador", cor: "#06B6D4", ordem: 6, badgeIcon: "⭐" },
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

  const badgesOrdenadas = [...badges].sort((a, b) => {
    if (a.conquistada !== b.conquistada) {
      return a.conquistada ? -1 : 1;
    }
    const rarA = a.nome === "Fundador" ? ROTULO_RARIDADE.fundador : (ROTULO_RARIDADE[a.raridade ?? "comum"] ?? ROTULO_RARIDADE.comum);
    const rarB = b.nome === "Fundador" ? ROTULO_RARIDADE.fundador : (ROTULO_RARIDADE[b.raridade ?? "comum"] ?? ROTULO_RARIDADE.comum);
    return rarB.ordem - rarA.ordem;
  });

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
        {badgesOrdenadas.map((b) => {
          const ehFundador = b.nome === "Fundador" || b.raridade === "fundador";
          const raridade = ehFundador ? ROTULO_RARIDADE.fundador : (ROTULO_RARIDADE[b.raridade ?? "comum"] ?? ROTULO_RARIDADE.comum);
          const cor = ehFundador ? "#06B6D4" : (raridade.cor ?? "#94A3B8");

          return (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 text-center transition-all relative overflow-hidden ${
                ehFundador && b.conquistada
                  ? "border-[#06B6D4]/60 bg-gradient-to-b from-[#06B6D4]/15 via-bat-bg-card to-bat-bg-card shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                  : b.raridade === "lendaria" && b.conquistada
                  ? "border-bat-gold-400/50 bg-gradient-to-b from-bat-gold-400/10 via-bat-bg-card to-bat-bg-card shadow-[0_0_15px_rgba(245,197,24,0.15)]"
                  : b.conquistada
                  ? "border-bat-border bg-bat-bg-card"
                  : "border-bat-border/50 bg-bat-bg-card/40"
              }`}
              style={
                b.conquistada && !ehFundador && b.raridade !== "lendaria"
                  ? { borderColor: `${cor}55`, background: `${cor}0F` }
                  : undefined
              }
            >
              {ehFundador && (
                <div className="absolute top-2 right-2 text-[9px] font-extrabold text-[#06B6D4] bg-[#06B6D4]/20 border border-[#06B6D4]/50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Pioneiro
                </div>
              )}

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

              <p className="mt-1 text-xs leading-snug text-bat-text-muted">
                {b.conquistada ? b.descricao ?? "" : b.criterio ?? b.descricao ?? ""}
              </p>

              {raridade && (
                <span
                  className="mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: cor, background: `${cor}1A`, border: `1px solid ${cor}33` }}
                >
                  {raridade.badgeIcon ? `${raridade.badgeIcon} ` : ""}{raridade.texto}
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
