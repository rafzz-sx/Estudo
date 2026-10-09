"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { CHANGELOG_HISTORY, CURRENT_APP_VERSION } from "@/data/changelog";
import type { ChangeType, ReleaseItem } from "@batcaverna/types";
import { formatReleaseDateTime } from "@batcaverna/utils";

const STORAGE_LAST_SEEN_KEY = "batcaverna_last_seen_version";

export function NovidadesView() {
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<ChangeType | "todos">("todos");
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  // Ao visitar a página de novidades, marca a versão atual como vista
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LAST_SEEN_KEY, CURRENT_APP_VERSION);
      window.dispatchEvent(new Event("batcaverna_version_updated"));
    } catch {}
  }, []);

  const totalMelhorias = useMemo(() => {
    return CHANGELOG_HISTORY.reduce((acc, rel) => acc + rel.alteracoes.length, 0);
  }, []);

  const totalNovos = useMemo(() => {
    return CHANGELOG_HISTORY.reduce(
      (acc, rel) => acc + rel.alteracoes.filter((a) => a.tipo === "novo").length,
      0
    );
  }, []);

  const releasesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return CHANGELOG_HISTORY.map((rel) => {
      const correspondeVersaoOuTitulo =
        rel.versao.toLowerCase().includes(termo) ||
        rel.titulo.toLowerCase().includes(termo) ||
        rel.resumo.toLowerCase().includes(termo);

      const alteracoesFiltradas = rel.alteracoes.filter((alt) => {
        const matchesTipo = filtroTipo === "todos" || alt.tipo === filtroTipo;
        const matchesBusca =
          !termo ||
          correspondeVersaoOuTitulo ||
          alt.titulo.toLowerCase().includes(termo) ||
          alt.descricao.toLowerCase().includes(termo) ||
          (alt.tag && alt.tag.toLowerCase().includes(termo));

        return matchesTipo && matchesBusca;
      });

      return {
        ...rel,
        alteracoes: alteracoesFiltradas,
        visivel: alteracoesFiltradas.length > 0 || (filtroTipo === "todos" && correspondeVersaoOuTitulo),
      };
    }).filter((rel) => rel.visivel);
  }, [busca, filtroTipo]);

  const copiarLinkVersao = (versao: string) => {
    const url = `${window.location.origin}/novidades#v${versao.replace(/\./g, "-")}`;
    navigator.clipboard?.writeText(url);
    setCopiadoId(versao);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const getBadgeStyle = (tipo: ChangeType) => {
    switch (tipo) {
      case "novo":
        return {
          label: "NOVO RECURSO",
          badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          dotClass: "bg-emerald-400",
          icon: "✨",
        };
      case "melhoria":
        return {
          label: "MELHORIA",
          badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
          dotClass: "bg-blue-400",
          icon: "⚡",
        };
      case "correcao":
        return {
          label: "CORREÇÃO",
          badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          dotClass: "bg-amber-400",
          icon: "🛠️",
        };
      case "removido":
        return {
          label: "MODIFICADO",
          badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
          dotClass: "bg-red-400",
          icon: "⚠️",
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ═══ CABEÇALHO TÁTICO ═══ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bat-bg-card via-bat-bg-card to-bat-bg-secondary border border-bat-border p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-bat-gold-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bat-gold-400/10 border border-bat-gold-400/25 text-bat-gold-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-bat-gold-400 animate-pulse" />
              Diário de Bordo & Lançamentos
            </div>
            <h1 className="heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Novidades da BatCaverna
            </h1>
            <p className="text-bat-text-secondary text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Acompanhe o registro cronológico de todas as atualizações, novos arsenais táticos,
              otimizações de desempenho e blindagens da plataforma.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 border-bat-border/60 pt-4 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-[11px] font-bold text-bat-text-muted uppercase tracking-wider block">
                Versão em Operação
              </span>
              <span className="text-xl sm:text-2xl font-mono font-black text-bat-gold-400">
                v{CURRENT_APP_VERSION}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              100% Sincronizado
            </div>
          </div>
        </div>

        {/* ═══ ESTATÍSTICAS RÁPIDAS ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-bat-border/60">
          <div className="bg-bat-bg-elevated/40 border border-bat-border/50 rounded-xl p-3 text-center">
            <span className="text-xs text-bat-text-muted block">Versões Registradas</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5 block">
              {CHANGELOG_HISTORY.length}
            </span>
          </div>
          <div className="bg-bat-bg-elevated/40 border border-bat-border/50 rounded-xl p-3 text-center">
            <span className="text-xs text-bat-text-muted block">Melhorias Totais</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-bat-gold-400 mt-0.5 block">
              {totalMelhorias}
            </span>
          </div>
          <div className="bg-bat-bg-elevated/40 border border-bat-border/50 rounded-xl p-3 text-center">
            <span className="text-xs text-bat-text-muted block">Novos Recursos</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
              {totalNovos}
            </span>
          </div>
          <div className="bg-bat-bg-elevated/40 border border-bat-border/50 rounded-xl p-3 text-center">
            <span className="text-xs text-bat-text-muted block">Status do Sistema</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5 block">
              Estável ⚡
            </span>
          </div>
        </div>
      </div>

      {/* ═══ FILTROS & BUSCA ═══ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-bat-bg-card/70 border border-bat-border rounded-2xl p-4 backdrop-blur-sm sticky top-16 lg:top-4 z-20 shadow-lg">
        {/* Input de Busca */}
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-bat-text-muted pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por recurso, correção ou palavra-chave..."
            className="w-full bg-bat-bg-elevated border border-bat-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-bat-text-muted focus:outline-none focus:border-bat-gold-400/70 transition-colors"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-bat-text-muted hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filtros por Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFiltroTipo("todos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filtroTipo === "todos"
                ? "bg-bat-gold-400 text-black font-extrabold shadow-[0_0_15px_rgba(245,197,24,0.3)]"
                : "bg-bat-bg-elevated text-bat-text-secondary hover:text-white border border-bat-border"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroTipo("novo")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filtroTipo === "novo"
                ? "bg-emerald-500 text-black font-extrabold shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                : "bg-bat-bg-elevated text-emerald-400 hover:text-emerald-300 border border-bat-border"
            }`}
          >
            ✨ Novos
          </button>
          <button
            onClick={() => setFiltroTipo("melhoria")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filtroTipo === "melhoria"
                ? "bg-blue-500 text-white font-extrabold shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "bg-bat-bg-elevated text-blue-400 hover:text-blue-300 border border-bat-border"
            }`}
          >
            ⚡ Melhorias
          </button>
          <button
            onClick={() => setFiltroTipo("correcao")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filtroTipo === "correcao"
                ? "bg-amber-500 text-black font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                : "bg-bat-bg-elevated text-amber-400 hover:text-amber-300 border border-bat-border"
            }`}
          >
            🛠️ Correções
          </button>
        </div>
      </div>

      {/* ═══ LISTAGEM DA LINHA DO TEMPO ═══ */}
      {releasesFiltradas.length === 0 ? (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-white">Nenhuma atualização encontrada</h3>
          <p className="text-bat-text-muted text-sm mt-1 max-w-md mx-auto">
            Não encontramos nenhum registro correspondente ao termo "{busca}" com o filtro selecionado.
          </p>
          <button
            onClick={() => {
              setBusca("");
              setFiltroTipo("todos");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-bat-bg-elevated text-bat-gold-400 text-xs font-bold border border-bat-gold-400/30 hover:border-bat-gold-400 transition-colors cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="relative pl-4 sm:pl-6 space-y-8 before:content-[''] before:absolute before:left-[11px] sm:before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-bat-gold-400/40 before:via-bat-border before:to-transparent">
          {releasesFiltradas.map((rel, index) => {
            const { dataFormatada, horaFormatada, tempoRelativo } = formatReleaseDateTime(rel.dataLancamento);
            const isLatest = rel.versao === CURRENT_APP_VERSION;
            const anchorId = `v${rel.versao.replace(/\./g, "-")}`;

            return (
              <div
                key={rel.versao}
                id={anchorId}
                className="relative pl-6 sm:pl-8 group scroll-mt-28"
              >
                {/* Marcador do Ponto na Linha do Tempo */}
                <div
                  className={`absolute -left-[14px] sm:-left-[18px] top-6 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    isLatest
                      ? "bg-bat-gold-400 border-black shadow-[0_0_15px_rgba(245,197,24,0.6)]"
                      : "bg-bat-bg-card border-bat-border group-hover:border-bat-gold-400/60"
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isLatest ? "bg-black" : "bg-bat-gold-400"
                    }`}
                  />
                </div>

                {/* Card da Versão */}
                <div
                  className={`bg-bat-bg-card border rounded-2xl p-5 sm:p-7 transition-all duration-300 ${
                    isLatest
                      ? "border-bat-gold-400/50 shadow-[0_0_25px_rgba(245,197,24,0.08)] bg-gradient-to-b from-bat-bg-card to-bat-bg-card/90"
                      : "border-bat-border hover:border-bat-border-glow"
                  }`}
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-bat-border/60">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-bold text-base sm:text-lg text-bat-gold-400 bg-bat-gold-400/10 px-3 py-1 rounded-xl border border-bat-gold-400/25">
                        v{rel.versao}
                      </span>

                      {isLatest && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Versão Atual
                        </span>
                      )}

                      {rel.destaque && !isLatest && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-bat-gold-400/15 text-bat-gold-400 border border-bat-gold-400/30 uppercase tracking-wide">
                          ⭐ Lançamento Maior
                        </span>
                      )}
                    </div>

                    {/* Data, Hora e Copiar Link */}
                    <div className="flex items-center gap-2 text-xs text-bat-text-muted">
                      <span title={`${dataFormatada} às ${horaFormatada}`}>
                        🕒 {tempoRelativo} · {dataFormatada}
                      </span>
                      <button
                        onClick={() => copiarLinkVersao(rel.versao)}
                        className="p-1 rounded-md hover:bg-bat-bg-elevated text-bat-text-muted hover:text-bat-gold-400 transition-colors ml-1"
                        title="Copiar link desta versão"
                      >
                        {copiadoId === rel.versao ? (
                          <span className="text-[11px] text-emerald-400 font-bold">Copiado!</span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Título & Resumo da Release */}
                  <div className="mt-4">
                    <h2 className="heading text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {rel.titulo}
                    </h2>
                    <p className="text-bat-text-secondary text-sm mt-1.5 leading-relaxed">
                      {rel.resumo}
                    </p>
                  </div>

                  {/* Alterações Específicas */}
                  <div className="mt-6 space-y-3">
                    {rel.alteracoes.map((item) => {
                      const badge = getBadgeStyle(item.tipo);

                      return (
                        <div
                          key={item.id}
                          className="bg-bat-bg-elevated/50 hover:bg-bat-bg-elevated border border-bat-border/50 hover:border-bat-border rounded-xl p-3.5 sm:p-4 transition-colors"
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${badge.badgeClass}`}
                            >
                              <span>{badge.icon}</span>
                              {badge.label}
                            </span>

                            {item.tag && (
                              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-bat-bg/80 text-bat-text-muted border border-bat-border">
                                #{item.tag}
                              </span>
                            )}

                            <h4 className="text-sm font-bold text-white flex-1 min-w-[200px]">
                              {item.titulo}
                            </h4>
                          </div>

                          <p className="text-xs sm:text-sm text-bat-text-secondary leading-relaxed pl-1 sm:pl-2 border-l border-bat-border/60 ml-1 mt-1">
                            {item.descricao}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ FOOTER INFORMATIVO ═══ */}
      <div className="bg-bat-bg-card/40 border border-bat-border rounded-2xl p-6 text-center space-y-3">
        <p className="text-xs text-bat-text-muted max-w-xl mx-auto">
          Tem alguma sugestão de melhoria ou encontrou alguma inconsistência?
          Envie diretamente pelo nosso canal de feedback ou abra um chamado tático.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/feedback"
            className="px-4 py-2 rounded-xl bg-bat-bg-elevated hover:bg-bat-bg-card border border-bat-border text-bat-gold-400 text-xs font-bold transition-colors no-underline"
          >
            ⭐ Enviar Sugestão
          </Link>
          <Link
            href="/tickets"
            className="px-4 py-2 rounded-xl bg-bat-bg-elevated hover:bg-bat-bg-card border border-bat-border text-bat-text-secondary hover:text-white text-xs font-bold transition-colors no-underline"
          >
            🎫 Abrir Ticket de Suporte
          </Link>
        </div>
      </div>
    </div>
  );
}
