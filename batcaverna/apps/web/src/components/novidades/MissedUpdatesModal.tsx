"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CHANGELOG_HISTORY, CURRENT_APP_VERSION } from "@/data/changelog";
import { getMissedReleases, compareSemver } from "@batcaverna/utils";
import type { ReleaseItem } from "@batcaverna/types";

const STORAGE_LAST_SEEN_KEY = "batcaverna_last_seen_version";

export function MissedUpdatesModal() {
  const router = useRouter();
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const [versaoAnterior, setVersaoAnterior] = useState<string | null>(null);
  const [releasesPerdidas, setReleasesPerdidas] = useState<ReleaseItem[]>([]);

  useEffect(() => {
    // Não exibir o modal se o usuário já estiver na página /novidades
    if (pathname === "/novidades") return;

    try {
      const lastSeen = localStorage.getItem(STORAGE_LAST_SEEN_KEY);

      // CASO 1: Primeiro acesso do usuário neste dispositivo
      // Não bombardeia com popups de histórico antigo; marca como visto silenciosamente
      if (!lastSeen) {
        localStorage.setItem(STORAGE_LAST_SEEN_KEY, CURRENT_APP_VERSION);
        return;
      }

      // CASO 2: O usuário possui uma versão gravada anterior à atual
      if (compareSemver(CURRENT_APP_VERSION, lastSeen) > 0) {
        const missed = getMissedReleases(CHANGELOG_HISTORY, lastSeen);
        if (missed.length > 0) {
          setVersaoAnterior(lastSeen);
          setReleasesPerdidas(missed);
          // Pequeno timeout de 600ms para uma entrada suave após o carregamento da página
          const timer = setTimeout(() => {
            setAberto(true);
          }, 600);
          return () => clearTimeout(timer);
        }
      }
    } catch (e) {
      console.warn("Erro ao verificar versão no storage:", e);
    }
  }, [pathname]);

  const fecharEMarcarVisto = () => {
    try {
      localStorage.setItem(STORAGE_LAST_SEEN_KEY, CURRENT_APP_VERSION);
      window.dispatchEvent(new Event("batcaverna_version_updated"));
    } catch {}
    setAberto(false);
  };

  const irParaNovidades = () => {
    fecharEMarcarVisto();
    router.push("/novidades");
  };

  if (!aberto || releasesPerdidas.length === 0) return null;

  const totalVersoesPerdidas = releasesPerdidas.length;
  const maisRecente = releasesPerdidas[0];

  // Coleta as top 4 principais alterações para destacar no modal compacto
  const destaques = releasesPerdidas
    .flatMap((r) => r.alteracoes.map((alt) => ({ ...alt, versao: r.versao })))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-gradient-to-b from-bat-bg-card via-bat-bg-card to-[#0F0F16] border border-bat-gold-400/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(245,197,24,0.15)] flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-novidades"
      >
        {/* Efeito Glow Dourado de Fundo */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-72 h-32 bg-bat-gold-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Botão de Fechar Rápido */}
        <button
          onClick={fecharEMarcarVisto}
          className="absolute top-5 right-5 p-2 rounded-xl text-bat-text-muted hover:text-white hover:bg-bat-bg-elevated transition-colors cursor-pointer"
          aria-label="Fechar modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Cabeçalho do Modal */}
        <div className="relative z-10 flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-bat-gold-400/20 border border-bat-gold-400/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(245,197,24,0.3)]">
            🦇
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-bat-gold-400/15 border border-bat-gold-400/30 text-[11px] font-mono font-bold text-bat-gold-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-bat-gold-400 animate-ping" />
              Atualização BatCaverna v{CURRENT_APP_VERSION}
            </div>
            <h2 id="titulo-novidades" className="heading text-xl sm:text-2xl font-bold text-white mt-1">
              {totalVersoesPerdidas > 1
                ? "Novidades enquanto você esteve fora!"
                : "Nova versão no ar!"}
            </h2>
          </div>
        </div>

        {/* Subtítulo informativo com intervalo de versões */}
        <p className="text-xs sm:text-sm text-bat-text-secondary leading-relaxed mb-4">
          {totalVersoesPerdidas > 1 ? (
            <>
              Você esteve fora por{" "}
              <span className="text-bat-gold-400 font-bold font-mono">
                {totalVersoesPerdidas} atualizações
              </span>{" "}
              (de v{versaoAnterior} até v{CURRENT_APP_VERSION}). Veja os principais aprimoramentos da plataforma:
            </>
          ) : (
            <>
              Preparamos novas melhorias táticas na plataforma. Confira o que há de novo:
            </>
          )}
        </p>

        {/* Lista Rolável de Destaques */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1 -mr-1">
          {destaques.map((item) => (
            <div
              key={item.id}
              className="bg-bat-bg-elevated/60 border border-bat-border/60 hover:border-bat-gold-400/30 rounded-xl p-3 sm:p-3.5 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    item.tipo === "novo"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : item.tipo === "melhoria"
                      ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {item.tipo === "novo" ? "✨ NOVO" : item.tipo === "melhoria" ? "⚡ MELHORIA" : "🛠️ FIX"}
                </span>
                <span className="text-xs font-bold text-white flex-1 truncate">
                  {item.titulo}
                </span>
              </div>
              <p className="text-xs text-bat-text-secondary leading-relaxed line-clamp-2">
                {item.descricao}
              </p>
            </div>
          ))}

          {maisRecente && totalVersoesPerdidas > 1 && (
            <div className="p-2.5 rounded-xl bg-bat-gold-400/5 border border-bat-gold-400/15 text-center">
              <span className="text-xs text-bat-text-muted">
                + dezenas de outros ajustes e otimizações registradas no diário de bordo.
              </span>
            </div>
          )}
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="pt-5 mt-3 border-t border-bat-border/60 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={fecharEMarcarVisto}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-bat-text-muted hover:text-white hover:bg-bat-bg-elevated border border-transparent transition-colors cursor-pointer text-center"
          >
            Entendido, continuar estudo
          </button>
          <button
            onClick={irParaNovidades}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-bat-gold-400 via-[#FFD700] to-bat-gold-500 hover:shadow-[0_0_20px_rgba(245,197,24,0.4)] transition-all cursor-pointer text-center active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Ver diário completo</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
