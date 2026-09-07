"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";
import { RadarFraqueza } from "@/components/estudo/RadarFraqueza";
import { GraficoEvolucao } from "@/components/estudo/GraficoEvolucao";

// ═══════════════════════════════════════════════════════════════
// PLANO DO DIA — a primeira tela de quem entra
// ═══════════════════════════════════════════════════════════════
// A tela inicial anterior (que virou /progresso) mostrava Streak, Tempo
// Total, Questões e Maior Combo. É uma vitrine de troféus: conta o que o
// aluno já fez e nunca o que fazer em seguida.
//
// Quem abre a plataforma às 20h de uma terça não está perguntando "quanto eu
// já estudei". Está perguntando "por onde eu começo hoje" — e essa pergunta
// a plataforma tinha todos os dados para responder e não respondia.
//
// A ordem daqui até o fim da tela É a recomendação:
//   1. o que está vencido (revisão, erro em aberto)
//   2. onde a próxima hora rende mais ponto (radar de fraqueza)
//   3. o que você nunca abriu (ponto cego)
//   4. como você está evoluindo
// ═══════════════════════════════════════════════════════════════

interface Acao {
  chave: string;
  titulo: string;
  descricao: string;
  href: string;
  emoji: string;
  urgencia: "alta" | "media" | "baixa";
}

interface AssuntoRadar {
  assunto_id: string;
  assunto: string;
  materia: string;
  materia_emoji: string | null;
  questoes_no_concurso: number;
  respondidas: number;
  acertos: number;
  taxa: number;
  prioridade: number;
  situacao: "critico" | "atencao" | "dominado" | "nao_testado";
  confiavel: boolean;
}

interface PontoEvolucao {
  semana: string;
  respondidas: number;
  acertos: number;
  taxa: number;
}

interface Painel {
  concurso: {
    id: string;
    sigla: string;
    nome: string;
    emoji: string | null;
    cor_tema: string | null;
  } | null;
  plano: { id: string; nome: string; data_prova: string } | null;
  dias_para_prova: number | null;
  revisoes_hoje: number;
  erros_abertos: number;
  acoes: Acao[];
  radar?: {
    fracos: AssuntoRadar[];
    pontos_cegos: AssuntoRadar[];
    total_assuntos: number;
    dominados: number;
    respondidas: number;
    acertos: number;
    taxa: number;
  };
  evolucao?: PontoEvolucao[];
}

const CORES_URGENCIA: Record<Acao["urgencia"], string> = {
  alta: "#EF4444",
  media: "#F5C518",
  baixa: "#22C55E",
};

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 5) return "Ainda de pé";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [painel, setPainel] = useState<Painel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetchWithAuth("/api/estudo/painel");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPainel(json.data);
    } catch {
      setErro("Não consegui montar seu plano agora. Recarregue a página.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const primeiroNome = (user?.nome ?? user?.apelido ?? "soldado").split(" ")[0];

  // ─── Carregando ────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-28 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="skeleton h-36 rounded-2xl" />
          <div className="skeleton h-36 rounded-2xl" />
        </div>
        <div className="skeleton h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (erro || !painel) {
    return (
      <div className="rounded-2xl border border-bat-error/30 bg-bat-error/10 px-5 py-6 text-center">
        <p className="text-sm text-bat-error">{erro ?? "Painel indisponível."}</p>
        <button onClick={carregar} className="btn-secondary mt-4 px-5 py-2 text-xs">
          Tentar de novo
        </button>
      </div>
    );
  }

  const { concurso, radar, evolucao = [], dias_para_prova: dias } = painel;
  const cor = concurso?.cor_tema ?? "#F5C518";

  return (
    <div className="space-y-7">
      {/* ═══════════ CABEÇALHO ═══════════ */}
      <header className="relative overflow-hidden rounded-3xl border border-bat-border bg-bat-bg-card p-6 sm:p-7">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-20 blur-3xl"
          style={{ background: cor }}
        />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-bat-text-muted">
              {saudacao()}, <strong className="text-bat-text">{primeiroNome}</strong>
            </p>
            <h1 className="heading mt-1 text-2xl font-bold text-bat-text sm:text-3xl">
              {concurso ? (
                <>
                  Seu plano de hoje{" "}
                  <span style={{ color: cor }}>
                    {concurso.emoji} {concurso.sigla}
                  </span>
                </>
              ) : (
                "Vamos começar"
              )}
            </h1>
          </div>

          {/* Contagem regressiva — o número mais motivador que existe para
              quem presta concurso, e que estava gravado no banco sem
              aparecer em lugar nenhum. */}
          {dias !== null && dias >= 0 && (
            <Link
              href="/cronograma"
              className="shrink-0 rounded-2xl border px-5 py-3 text-center no-underline transition-transform hover:scale-105"
              style={{ borderColor: `${cor}55`, background: `${cor}12` }}
            >
              <p className="heading text-3xl font-extrabold tabular-nums" style={{ color: cor }}>
                {dias}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-bat-text-muted">
                {dias === 1 ? "dia para a prova" : "dias para a prova"}
              </p>
            </Link>
          )}
        </div>

        {/* Resumo do concurso em foco */}
        {radar && radar.respondidas > 0 && (
          <div className="relative mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-bat-text-secondary">
            <span>
              <strong className="text-bat-text">{radar.respondidas}</strong> questões
              respondidas no {concurso?.sigla}
            </span>
            <span>
              <strong className="text-bat-gold-400">{radar.taxa}%</strong> de acerto
            </span>
            <span>
              <strong className="text-bat-success">{radar.dominados}</strong> de{" "}
              {radar.total_assuntos} assuntos dominados
            </span>
          </div>
        )}
      </header>

      {/* ═══════════ O QUE FAZER AGORA ═══════════ */}
      <section>
        <h2 className="heading mb-3 text-lg text-bat-text">
          Por onde começar
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {painel.acoes.map((a) => (
            <Link
              key={a.chave}
              href={a.href}
              className="group relative overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card p-5 no-underline transition-all duration-300 hover:scale-[1.01] hover:border-bat-gold-400/40"
            >
              <div
                className="absolute bottom-0 left-0 top-0 w-1"
                style={{ background: CORES_URGENCIA[a.urgencia] }}
              />
              <div className="pl-2">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl">{a.emoji}</span>
                  {a.urgencia === "alta" && (
                    <span className="rounded-md bg-bat-error/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bat-error">
                      agora
                    </span>
                  )}
                </div>
                <h3 className="heading text-base font-bold text-bat-text transition-colors group-hover:text-bat-gold-400">
                  {a.titulo}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-bat-text-secondary">
                  {a.descricao}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ RADAR DE FRAQUEZA ═══════════ */}
      {concurso && radar && (
        <RadarFraqueza
          fracos={radar.fracos}
          pontosCegos={radar.pontos_cegos}
          sigla={concurso.sigla}
          totalAssuntos={radar.total_assuntos}
          dominados={radar.dominados}
        />
      )}

      {/* ═══════════ EVOLUÇÃO ═══════════ */}
      {evolucao.length >= 2 && (
        <GraficoEvolucao pontos={evolucao} compacto />
      )}

      {/* ═══════════ ATALHO PARA O HISTÓRICO ═══════════ */}
      <Link
        href="/progresso"
        className="flex items-center justify-between rounded-2xl border border-bat-border bg-bat-bg-card px-5 py-4 no-underline transition-all hover:border-bat-gold-400/40"
      >
        <div>
          <p className="text-sm font-bold text-bat-text">📊 Meu progresso</p>
          <p className="mt-0.5 text-xs text-bat-text-secondary">
            Streak, tempo de estudo, XP, insígnias e a evolução completa.
          </p>
        </div>
        <span className="text-bat-gold-400">→</span>
      </Link>
    </div>
  );
}
