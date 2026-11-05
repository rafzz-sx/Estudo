"use client";

import { useState } from "react";
import Link from "next/link";
import { MathText } from "@/components/MathText";
import { ResolucaoGabarito, type PassoResolucao } from "./ResolucaoGabarito";

export interface ItemHistoricoSessao {
  id: string;
  enunciado: string;
  materia?: string | null;
  assunto?: string | null;
  concurso?: string | null;
  ano?: number | null;
  dificuldade: string;
  resposta_dada: string;
  resposta_correta: string;
  correta: boolean;
  tempo_gasto: number;
  xp_ganho: number;
  explicacao: string | null;
  explicacao_alternativas: Record<string, { texto: string; armadilha?: string | null } | string> | null;
  resolucao_passos: PassoResolucao[] | null;
  figura_descricao: string | null;
  figura_svg: string | null;
  precisa_resolucao: boolean;
  alternativas: { letra: string; texto: string }[];
}

export interface BoletimSessaoModalProps {
  aberto: boolean;
  onClose: () => void;
  historico: ItemHistoricoSessao[];
  concurso?: string | null;
  materia?: string | null;
  assunto?: string | null;
  isPontoFraco?: boolean;
}

const ROTULO_DIFICULDADE: Record<string, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

function formatarTempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function BoletimSessaoModal({
  aberto,
  onClose,
  historico,
  concurso,
  materia,
  assunto,
  isPontoFraco = false,
}: BoletimSessaoModalProps) {
  const [questaoAbertaId, setQuestaoAbertaId] = useState<string | null>(null);

  if (!aberto) return null;

  const total = historico.length;
  const acertos = historico.filter((h) => h.correta).length;
  const erros = total - acertos;
  const taxa = total > 0 ? Math.round((acertos / total) * 100) : 0;
  const tempoTotal = historico.reduce((acc, h) => acc + h.tempo_gasto, 0);
  const tempoMedio = total > 0 ? Math.round(tempoTotal / total) : 0;
  const xpTotal = historico.reduce((acc, h) => acc + h.xp_ganho, 0);

  // Diagnóstico pedagógico
  let statusBadge = {
    corTexto: "text-bat-success",
    corBorda: "border-bat-success/40",
    corBg: "bg-bat-success/10",
    titulo: "🏆 Ponto Fraco Dominado!",
    subtitulo:
      "Excelente aproveitamento! Você demonstrou domínio sólido nos pontos críticos deste assunto.",
  };

  if (taxa < 50) {
    statusBadge = {
      corTexto: "text-bat-error",
      corBorda: "border-bat-error/40",
      corBg: "bg-bat-error/10",
      titulo: "🎯 Atenção Necessária",
      subtitulo:
        "Este assunto ainda está te derrubando. Revise com calma as explicações passo a passo abaixo para fixar os conceitos.",
    };
  } else if (taxa < 80) {
    statusBadge = {
      corTexto: "text-bat-warning",
      corBorda: "border-bat-warning/40",
      corBg: "bg-bat-warning/10",
      titulo: "⚡ Boa Evolução!",
      subtitulo:
        "Você acertou a maior parte das questões. Estude os gabaritos das que errou para blindar este assunto.",
    };
  }

  const toggleQuestao = (id: string) => {
    setQuestaoAbertaId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-3xl border border-bat-border bg-bat-bg-card shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between border-b border-bat-border/70 p-5 sm:p-6 bg-bat-bg-secondary/40 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h2 className="heading text-lg sm:text-xl font-bold text-bat-text">
                Boletim de Desempenho
              </h2>
              {isPontoFraco && (
                <span className="rounded-full bg-bat-gold-400/20 px-2 py-0.5 text-[10px] font-bold text-bat-gold-400 uppercase tracking-wider">
                  Treino de Ponto Fraco
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-bat-text-secondary">
              {concurso && concurso !== "todos" ? `${concurso} · ` : ""}
              {materia && materia !== "todas" ? `${materia} · ` : ""}
              <strong className="text-bat-text">
                {assunto && assunto !== "todos" ? assunto : "Sessão de Questões"}
              </strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-bat-border bg-bat-bg-card p-2 text-bat-text-muted hover:border-bat-gold-400/40 hover:text-bat-text transition-colors"
            title="Fechar boletim"
          >
            ✕
          </button>
        </header>

        {/* Conteúdo com rolagem */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {total === 0 ? (
            <div className="py-12 text-center text-bat-text-muted">
              <p className="text-3xl mb-2">🧭</p>
              <p className="text-sm">Você ainda não respondeu nenhuma questão nesta sessão.</p>
              <button onClick={onClose} className="btn-primary mt-4 px-5 py-2 text-xs">
                Voltar e responder
              </button>
            </div>
          ) : (
            <>
              {/* Card de Diagnóstico Geral */}
              <div
                className={`rounded-2xl border p-4 sm:p-5 ${statusBadge.corBorda} ${statusBadge.corBg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={`heading text-base sm:text-lg font-bold ${statusBadge.corTexto}`}>
                      {statusBadge.titulo}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-bat-text-secondary leading-relaxed">
                      {statusBadge.subtitulo}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-2xl sm:text-3xl font-extrabold ${statusBadge.corTexto}`}>
                      {taxa}%
                    </span>
                    <span className="block text-[10px] text-bat-text-muted font-semibold uppercase">
                      Aproveitamento
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid de 4 Métricas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 p-3.5 text-center">
                  <span className="text-[10px] font-bold text-bat-text-muted uppercase tracking-wider block mb-1">
                    Acertos
                  </span>
                  <p className="text-xl font-bold text-bat-success">
                    {acertos}{" "}
                    <span className="text-xs font-normal text-bat-text-muted">
                      / {total}
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 p-3.5 text-center">
                  <span className="text-[10px] font-bold text-bat-text-muted uppercase tracking-wider block mb-1">
                    Erros
                  </span>
                  <p className="text-xl font-bold text-bat-error">
                    {erros}{" "}
                    <span className="text-xs font-normal text-bat-text-muted">
                      / {total}
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 p-3.5 text-center">
                  <span className="text-[10px] font-bold text-bat-text-muted uppercase tracking-wider block mb-1">
                    Tempo Total
                  </span>
                  <p className="text-xl font-bold text-bat-text">
                    {formatarTempo(tempoTotal)}
                  </p>
                  <span className="text-[10px] text-bat-text-muted block mt-0.5">
                    méd. {formatarTempo(tempoMedio)}/q
                  </span>
                </div>

                <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 p-3.5 text-center">
                  <span className="text-[10px] font-bold text-bat-text-muted uppercase tracking-wider block mb-1">
                    XP Ganho
                  </span>
                  <p className="text-xl font-bold text-bat-gold-400">
                    +{xpTotal}
                  </p>
                  <span className="text-[10px] text-bat-gold-400/80 block mt-0.5 font-medium">
                    Combate
                  </span>
                </div>
              </div>

              {/* Lista Detalhada das Questões com Gabarito */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="heading text-sm font-bold text-bat-text flex items-center gap-1.5">
                    <span>📝</span> Detalhamento das Questões ({total})
                  </h4>
                  <span className="text-xs text-bat-text-muted">
                    Clique em qualquer questão para abrir o gabarito
                  </span>
                </div>

                <div className="space-y-2.5">
                  {historico.map((item, idx) => {
                    const aberta = questaoAbertaId === item.id;
                    const letraDada = item.resposta_dada;
                    const letraCerta = item.resposta_correta;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all ${
                          item.correta
                            ? "border-bat-success/30 bg-bat-bg-card"
                            : "border-bat-error/30 bg-bat-bg-card"
                        }`}
                      >
                        {/* Linha Resumida da Questão */}
                        <div
                          onClick={() => toggleQuestao(item.id)}
                          className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-bat-bg-secondary/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                item.correta
                                  ? "bg-bat-success/15 text-bat-success"
                                  : "bg-bat-error/15 text-bat-error"
                              }`}
                            >
                              #{idx + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-xs font-bold ${
                                    item.correta ? "text-bat-success" : "text-bat-error"
                                  }`}
                                >
                                  {item.correta ? "✅ Acertou" : "❌ Errou"}
                                </span>
                                <span className="text-[11px] text-bat-text-muted">
                                  {item.correta
                                    ? `(Alternativa ${letraCerta})`
                                    : `(Marcou ${letraDada} · Correta ${letraCerta})`}
                                </span>
                                {item.ano && (
                                  <span className="rounded bg-bat-bg-secondary px-1.5 py-0.5 text-[10px] text-bat-text-muted">
                                    {item.ano}
                                  </span>
                                )}
                                <span className="rounded bg-bat-bg-secondary px-1.5 py-0.5 text-[10px] text-bat-text-muted">
                                  {ROTULO_DIFICULDADE[item.dificuldade] ?? "Médio"}
                                </span>
                                <span className="text-[10px] text-bat-text-muted">
                                  ⏱️ {formatarTempo(item.tempo_gasto)}
                                </span>
                              </div>

                              <p className="mt-1 line-clamp-2 text-xs text-bat-text-secondary leading-relaxed">
                                {item.enunciado.replace(/<[^>]*>?/gm, "").slice(0, 160)}
                                {item.enunciado.length > 160 ? "..." : ""}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="rounded-lg border border-bat-border px-3 py-1.5 text-xs text-bat-gold-400 hover:bg-bat-gold-400/10 transition-colors shrink-0"
                          >
                            {aberta ? "Ocultar gabarito ▲" : "Ver gabarito ▼"}
                          </button>
                        </div>

                        {/* Detalhe Aberto: Gabarito & Resolução Passo a Passo */}
                        {aberta && (
                          <div className="border-t border-bat-border/60 p-4 sm:p-5 bg-bat-bg-secondary/30">
                            <div className="mb-3 text-xs text-bat-text-secondary">
                              <strong>Enunciado completo:</strong>
                              <div className="mt-1 rounded-xl bg-bat-bg-card p-3 border border-bat-border/60">
                                <MathText>{item.enunciado}</MathText>
                              </div>
                            </div>

                            <ResolucaoGabarito
                              respostaCorreta={item.resposta_correta}
                              explicacao={item.explicacao}
                              explicacaoAlternativas={item.explicacao_alternativas}
                              alternativas={item.alternativas}
                              passos={item.resolucao_passos}
                              figuraDescricao={item.figura_descricao}
                              figuraSvg={item.figura_svg}
                              precisaResolucao={item.precisa_resolucao}
                              alternativaEscolhida={item.resposta_dada}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Rodapé com Ações */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-bat-border/70 p-4 sm:p-5 bg-bat-bg-secondary/40 shrink-0">
          <Link
            href="/dashboard"
            className="btn-secondary px-5 py-2.5 text-xs no-underline flex items-center gap-1.5"
          >
            🧭 Voltar ao Radar de Fraquezas
          </Link>

          <button
            onClick={onClose}
            className="btn-primary px-6 py-2.5 text-xs flex items-center gap-1.5"
          >
            🔄 Continuar Praticando
          </button>
        </footer>
      </div>
    </div>
  );
}
