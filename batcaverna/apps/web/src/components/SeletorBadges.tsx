"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";
import { calcularNivel } from "@batcaverna/utils";

interface Badge {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  criterio: string | null;
  cor_hex: string | null;
  raridade: string | null;
  conquistada: boolean;
  exibir_no_perfil: boolean;
  ordem_exibicao: number;
}

const ROTULO_RARIDADE: Record<string, { texto: string; cor: string }> = {
  comum: { texto: "Comum", cor: "#94A3B8" },
  rara: { texto: "Rara", cor: "#3B82F6" },
  epica: { texto: "Épica", cor: "#A855F7" },
  lendaria: { texto: "Lendária", cor: "#F5C518" },
};

/**
 * Escolha das insígnias que aparecem no mini-perfil, com prévia ao vivo.
 *
 * A prévia é o ponto: o usuário vê exatamente como o cartão vai aparecer
 * para os outros antes de salvar, em vez de escolher no escuro e só
 * descobrir o resultado quando alguém abrir o perfil dele no ranking.
 */
export function SeletorBadges() {
  const user = useAuthStore((s) => s.user);

  const [badges, setBadges] = useState<Badge[]>([]);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [maxExibidas, setMaxExibidas] = useState(3);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    fetchWithAuth("/api/usuarios/me/badges")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        setBadges(json.data.badges);
        setMaxExibidas(json.data.max_exibidas);
        setSelecionadas(
          json.data.badges
            .filter((b: Badge) => b.exibir_no_perfil)
            .sort((a: Badge, b: Badge) => a.ordem_exibicao - b.ordem_exibicao)
            .map((b: Badge) => b.id)
        );
      })
      .catch(() => undefined)
      .finally(() => setCarregando(false));
  }, []);

  const alternar = (id: string) => {
    setAviso(null);
    setSelecionadas((atual) => {
      if (atual.includes(id)) return atual.filter((x) => x !== id);
      if (atual.length >= maxExibidas) {
        setAviso(
          `Você pode exibir até ${maxExibidas} insígnias. Desmarque uma para trocar.`
        );
        return atual;
      }
      return [...atual, id];
    });
  };

  const salvar = async () => {
    setSalvando(true);
    setAviso(null);
    try {
      const res = await fetchWithAuth("/api/usuarios/me/badges", {
        method: "PATCH",
        body: JSON.stringify({ exibir: selecionadas }),
      });
      const json = await res.json();
      setAviso(
        json.success
          ? "✅ Insígnias do mini-perfil salvas."
          : json.error ?? "Não consegui salvar."
      );
    } catch {
      setAviso("Falha de conexão ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <div className="skeleton h-64 w-full rounded-2xl" />;

  const conquistadas = badges.filter((b) => b.conquistada);
  const bloqueadas = badges.filter((b) => !b.conquistada);
  const escolhidas = selecionadas
    .map((id) => badges.find((b) => b.id === id))
    .filter(Boolean) as Badge[];

  const nivelInfo = calcularNivel(user?.xp_total ?? 0);

  return (
    <div className="space-y-5">
      {/* ═══ PRÉVIA DO MINI-PERFIL ═══ */}
      <div>
        <h3 className="heading mb-2 text-sm font-bold uppercase tracking-wider text-bat-text-secondary">
          Prévia — como os outros vão te ver
        </h3>

        <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border-2 border-bat-gold-400/40 bg-bat-bg-card">
          {/* Banner: object-cover garante que qualquer proporção preencha
              a faixa sem esticar nem estourar as bordas. */}
          <div className="relative h-20 overflow-hidden bg-bat-bg-secondary">
            {user?.banner_url ? (
              user.banner_tipo === "video" || user.banner_url.endsWith(".mp4") ? (
                <video
                  src={user.banner_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <img
                  src={user.banner_url}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              )
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-bat-gold-400/20 via-bat-purple-900/40 to-bat-bg-card" />
            )}
          </div>

          <div className="relative p-4 pt-0">
            <div className="-mt-8 mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-bat-bg-card bg-bat-bg-secondary text-xl font-bold text-bat-gold-400">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (user?.apelido ?? "S")[0].toUpperCase()
              )}
            </div>

            <p className="flex items-center gap-2 text-base font-bold text-bat-text">
              {user?.apelido ?? "Soldado"}
              <span className="rounded-md bg-bat-gold-400/20 px-2 py-0.5 font-mono text-[10px] text-bat-gold-400">
                Nv. {nivelInfo.nivel}
              </span>
            </p>
            <p className="text-[11px] font-medium text-bat-gold-400">
              {nivelInfo.titulo}
            </p>

            <div className="mt-3 min-h-[30px]">
              {escolhidas.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {escolhidas.map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold"
                      style={{
                        color: b.cor_hex ?? "#F5C518",
                        borderColor: `${b.cor_hex ?? "#F5C518"}55`,
                        background: `${b.cor_hex ?? "#F5C518"}18`,
                      }}
                    >
                      <span>{b.icone ?? "🏅"}</span>
                      <span>{b.nome}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] italic text-bat-text-muted">
                  Nenhuma insígnia selecionada — o mini-perfil ficará sem essa faixa.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONQUISTADAS ═══ */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="heading text-sm font-bold uppercase tracking-wider text-bat-text-secondary">
            Suas insígnias ({conquistadas.length})
          </h3>
          <span className="text-xs text-bat-text-muted">
            {selecionadas.length}/{maxExibidas} exibindo
          </span>
        </div>

        {conquistadas.length === 0 ? (
          <p className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 px-4 py-3 text-sm text-bat-text-muted">
            Você ainda não conquistou nenhuma insígnia. Elas vêm sozinhas
            conforme você responde questões, mantém sequências e acumula horas
            de estudo.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {conquistadas.map((b) => {
              const ativa = selecionadas.includes(b.id);
              const rar = ROTULO_RARIDADE[b.raridade ?? "comum"];
              return (
                <button
                  key={b.id}
                  onClick={() => alternar(b.id)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                    ativa
                      ? "border-bat-gold-400/50 bg-bat-gold-400/10"
                      : "border-bat-border bg-bat-bg-secondary/50 hover:border-bat-gold-400/30"
                  }`}
                >
                  <span className="text-2xl">{b.icone ?? "🏅"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-bat-text">
                      {b.nome}
                    </p>
                    <p className="truncate text-[11px] text-bat-text-muted">
                      {b.descricao}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: rar?.cor }}
                    >
                      {rar?.texto}
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md text-[11px] ${
                        ativa
                          ? "bg-bat-gold-400 text-black"
                          : "border border-bat-border bg-bat-bg-card text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {aviso && (
        <p className="rounded-xl border border-bat-border bg-bat-bg-secondary/60 px-4 py-2.5 text-sm text-bat-text-secondary">
          {aviso}
        </p>
      )}

      <button
        onClick={salvar}
        disabled={salvando || conquistadas.length === 0}
        className="btn-primary px-6 py-2.5 text-sm disabled:opacity-40"
      >
        {salvando ? "Salvando..." : "Salvar seleção"}
      </button>

      {/* ═══ A CONQUISTAR ═══ */}
      {bloqueadas.length > 0 && (
        <details className="rounded-xl border border-bat-border bg-bat-bg-card px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-bat-text-secondary">
            Insígnias a conquistar ({bloqueadas.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {bloqueadas.map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-3 rounded-lg bg-bat-bg-secondary/40 px-3 py-2 opacity-60"
              >
                <span className="text-lg grayscale">{b.icone ?? "🏅"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-bat-text-secondary">
                    {b.nome}
                  </p>
                  <p className="truncate text-[11px] text-bat-text-muted">
                    {b.criterio}
                  </p>
                </div>
                <span className="shrink-0 text-xs">🔒</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
