"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";
import { RadarFraqueza } from "@/components/estudo/RadarFraqueza";
import { GraficoEvolucao } from "@/components/estudo/GraficoEvolucao";
import {
  ProjecaoNota,
  type ProjecaoDados,
} from "@/components/estudo/ProjecaoNota";
import { BatLogo } from "@/components/BatLogo";
import { calcularNivel } from "@batcaverna/utils";
import {
  useStudySessionStore,
  formatarTempoLegivel,
} from "@/stores/study-session-store";
import { RadarSoldadosAoVivo } from "@/components/RadarSoldadosAoVivo";

// ═══════════════════════════════════════════════════════════════
// PLANO DO DIA — Central de Operações da BatCaverna
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
  projecao?: ProjecaoDados | null;
  reta_final?: boolean;
}

const PRINCIPAIS_CONCURSOS = [
  { sigla: "EEAR", emoji: "✈️", nome: "Aeronáutica", cor: "#0284c7", img: "/images/concursos/eear.jpg" },
  { sigla: "ESA", emoji: "⭐", nome: "Exército", cor: "#16a34a", img: "/images/concursos/esa.jpg" },
  { sigla: "EPCAR", emoji: "🛩️", nome: "Cadetes do Ar", cor: "#3b82f6", img: "/images/concursos/epcar.jpg" },
  { sigla: "ESPCEX", emoji: "🎖️", nome: "EsPCEx", cor: "#b45309", img: "/images/concursos/espcex.jpg" },
  { sigla: "EAM", emoji: "⚓", nome: "Marinha", cor: "#2563eb", img: "/images/concursos/eam.jpg" },
  { sigla: "CN", emoji: "🚢", nome: "Colégio Naval", cor: "#0d9488", img: "/images/concursos/cn.jpg" },
  { sigla: "EFOMM", emoji: "🌊", nome: "Marinha Mercante", cor: "#0891b2", img: "/images/concursos/efomm.jpg" },
  { sigla: "IME", emoji: "🔬", nome: "Engenharia Militar", cor: "#15803d", img: "/images/concursos/ime.jpg" },
  { sigla: "ENEM", emoji: "📚", nome: "Exame Nacional", cor: "#eab308", img: "/images/concursos/enem.jpg" },
];

const CORES_URGENCIA: Record<Acao["urgencia"], string> = {
  alta: "#EF4444",
  media: "#F5C518",
  baixa: "#22C55E",
};

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function dataHojeFormatada(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const tempoEstudoHoje = useStudySessionStore((s) => s.tempoEstudoHoje);
  const tempoEstudoTotal = useStudySessionStore((s) => s.tempoEstudoTotal);

  const [painel, setPainel] = useState<Painel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAlvoAberto, setModalAlvoAberto] = useState(false);
  const [trocandoAlvo, setTrocandoAlvo] = useState(false);

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

  const selecionarConcursoAlvo = async (sigla: string) => {
    setTrocandoAlvo(true);
    try {
      const res = await fetchWithAuth("/api/usuarios/me/concursos-favoritos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concursos: [sigla] }),
      });
      if (res.ok) {
        setModalAlvoAberto(false);
        carregar();
      }
    } catch {
      // Ignora erro
    } finally {
      setTrocandoAlvo(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Dados do usuário
  const apelido = user?.apelido || user?.nome || "Soldado";
  const role = user?.role || "user";
  const xp = user?.xp_total ?? 0;
  const nivelInfo = calcularNivel(xp);
  const streak = user?.streak_dias ?? 0;
  const questoesRespondidas = user?.questoes_respondidas ?? 0;
  const taxaAcerto = user?.taxa_acerto ?? 0;

  // ─── Carregando ────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
        <div className="skeleton h-64 w-full rounded-2xl" />
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
  const projecao = painel.projecao ?? null;
  const cor = concurso?.cor_tema ?? "#F5C518";

  return (
    <div className="space-y-7 pb-12">
      {/* 📡 Radar de Soldados ao Vivo (Sincronia de Esquadrão) */}
      <RadarSoldadosAoVivo />

      {/* ═══════════ CABEÇALHO OFICIAL BATCAVERNA ═══════════ */}
      <header className="relative overflow-hidden rounded-3xl border border-bat-border bg-bat-bg-card p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-15 blur-3xl"
          style={{ background: cor }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {/* Pill de Saudação com Morcego e Data */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-bat-gold-400 bg-bat-gold-400/10 border border-bat-gold-400/20 px-3 py-1 rounded-full w-fit mb-3">
              <span>🦇</span>
              <span>{saudacao()}, soldado!</span>
              <span className="text-bat-border">·</span>
              <span className="text-bat-text-muted capitalize">{dataHojeFormatada()}</span>
            </div>

            {/* Saudação Oficial com Logo */}
            <div className="flex items-center gap-3">
              <BatLogo size={40} glow />
              <h1 className="heading text-2xl sm:text-3xl lg:text-4xl text-bat-text font-bold tracking-tight">
                Bem-vindo à{" "}
                <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
                  Bat
                </span>
                <span className="text-[#F5C518] drop-shadow-[0_0_20px_rgba(245,197,24,0.45)]">
                  Caverna
                </span>
                , {apelido}
              </h1>
              {role === "admin" && (
                <Link href="/admin" className="badge-admin no-underline ml-1">
                  ADMIN
                </Link>
              )}
            </div>

            <p className="text-sm text-bat-text-secondary mt-2 max-w-2xl leading-relaxed">
              Sua central de operações e plano estratégico. Vamos dominar mais um dia de estudos? 💪
            </p>
          </div>

          {/* Contagem regressiva (se concurso selecionado com data) */}
          {dias !== null && dias >= 0 && (
            <Link
              href="/cronograma"
              className="shrink-0 rounded-2xl border px-6 py-4 text-center no-underline transition-transform hover:scale-105"
              style={{ borderColor: `${cor}55`, background: `${cor}12` }}
            >
              <p className="heading text-3xl font-extrabold tabular-nums" style={{ color: cor }}>
                {dias}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-bat-text-muted mt-0.5">
                {dias === 1 ? "dia para a prova" : "dias para a prova"}
              </p>
            </Link>
          )}
        </div>
      </header>

      {/* ═══════════ CARDS DE COMBATE (MÉTRICAS DO SOLDADO) ═══════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Streak */}
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-4 flex flex-col justify-between hover:border-bat-gold-400/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-bat-text-muted uppercase font-bold tracking-wider">Sequência</span>
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <p className="heading text-2xl font-extrabold text-bat-text">
              {streak} {streak === 1 ? "dia" : "dias"}
            </p>
            <p className="text-[11px] text-bat-text-muted mt-0.5">
              {streak > 0 ? "Chama de estudos acesa!" : "Comece hoje sua ofensiva"}
            </p>
          </div>
        </div>

        {/* Nível & Patente */}
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-4 flex flex-col justify-between hover:border-bat-gold-400/30 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-bat-text-muted uppercase font-bold tracking-wider">Patente</span>
            <span className="text-xs font-bold text-bat-gold-400">Nível {nivelInfo.nivel}</span>
          </div>
          <div>
            <p className="heading text-lg font-extrabold text-bat-text truncate">
              {nivelInfo.titulo}
            </p>
            {/* Barra de XP */}
            <div className="w-full h-1.5 bg-bat-bg-secondary rounded-full overflow-hidden mt-1.5 mb-1">
              <div
                className="h-full bg-gradient-to-r from-bat-gold-500 to-amber-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, nivelInfo.progresso_percentual))}%` }}
              />
            </div>
            <p className="text-[10px] text-bat-text-muted flex justify-between">
              <span>{xp} XP</span>
              <span>{nivelInfo.xp_necessario_proximo} XP</span>
            </p>
          </div>
        </div>

        {/* Tempo de Estudo */}
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-4 flex flex-col justify-between hover:border-bat-gold-400/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-bat-text-muted uppercase font-bold tracking-wider">Tempo Real</span>
            <span className="text-xl">⏱️</span>
          </div>
          <div>
            <p className="heading text-2xl font-extrabold text-bat-text">
              {formatarTempoLegivel(tempoEstudoHoje)}
            </p>
            <p className="text-[11px] text-bat-text-muted mt-0.5">
              {formatarTempoLegivel(tempoEstudoTotal)} acumulados
            </p>
          </div>
        </div>

        {/* Questões & Taxa */}
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-4 flex flex-col justify-between hover:border-bat-gold-400/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-bat-text-muted uppercase font-bold tracking-wider">Aproveitamento</span>
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <p className="heading text-2xl font-extrabold text-bat-text">
              {taxaAcerto}%
            </p>
            <p className="text-[11px] text-bat-text-muted mt-0.5">
              {questoesRespondidas} questões resolvidas
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ ALVO / CONCURSO EM FOCO ═══════════ */}
      {concurso ? (
        <div
          className="rounded-2xl border p-6 relative overflow-hidden transition-all"
          style={{
            borderColor: `${cor}40`,
            background: `linear-gradient(135deg, ${cor}10 0%, rgba(18, 20, 26, 0.95) 100%)`,
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-bat-text-muted flex items-center gap-1.5">
                <span>🎯</span>
                <span>Seu Concurso Alvo em Foco</span>
              </span>
              <h2 className="heading text-xl sm:text-2xl font-extrabold text-bat-text flex items-center gap-2">
                <span>{concurso.emoji}</span>
                <span>{concurso.sigla}</span>
                <span className="text-sm font-normal text-bat-text-secondary">· {concurso.nome}</span>
              </h2>
              {radar && radar.respondidas > 0 ? (
                <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1 text-xs text-bat-text-secondary">
                  <span>
                    <strong className="text-bat-text">{radar.respondidas}</strong> questões resolvidas
                  </span>
                  <span>
                    <strong className="text-bat-gold-400">{radar.taxa}%</strong> de acerto
                  </span>
                  <span>
                    <strong className="text-bat-success">{radar.dominados}</strong> de {radar.total_assuntos} assuntos dominados
                  </span>
                </div>
              ) : (
                <p className="text-xs text-bat-text-muted pt-1">
                  Trilha pronta para você conquistar sua farda ou vaga universitária.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setModalAlvoAberto(true)}
                className="cursor-pointer rounded-xl border border-white/20 bg-black/40 hover:bg-black/60 px-4 py-2.5 text-xs font-bold text-bat-text-secondary hover:text-bat-gold-400 hover:border-bat-gold-400/40 transition-all flex items-center gap-1.5"
                title="Mudar o concurso foco para remodelar seu plano de estudos"
              >
                <span>🎯</span>
                <span>Trocar Alvo</span>
              </button>
              <Link
                href={`/concursos/${concurso.sigla.toLowerCase()}/trilha`}
                className="btn-primary px-5 py-2.5 text-xs font-bold no-underline whitespace-nowrap flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,197,24,0.2)]"
              >
                <span>Acessar Trilha Oficial</span>
                <span>🚀</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Caso ainda não tenha concurso selecionado (Grid tático de escolha imediata) */
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="heading text-lg font-bold text-bat-text flex items-center gap-2">
                <span>🎯</span>
                <span>Defina seu Alvo de Preparação</span>
              </h2>
              <p className="text-xs text-bat-text-secondary mt-0.5">
                A BatCaverna organiza seu plano em torno do seu concurso. Escolha seu alvo abaixo para moldar a plataforma:
              </p>
            </div>
            <Link
              href="/concursos"
              className="text-xs font-bold text-bat-gold-400 hover:text-bat-gold-300 no-underline whitespace-nowrap"
            >
              Ver todos os concursos →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
            {PRINCIPAIS_CONCURSOS.map((c) => (
              <button
                key={c.sigla}
                type="button"
                onClick={() => selecionarConcursoAlvo(c.sigla)}
                disabled={trocandoAlvo}
                className="p-3.5 rounded-xl bg-bat-bg-secondary/70 border border-bat-border hover:border-bat-gold-400/50 hover:bg-bat-gold-400/10 transition-all flex flex-col items-center text-center gap-1 group cursor-pointer"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{c.emoji}</span>
                <span className="heading text-sm font-extrabold text-bat-text group-hover:text-bat-gold-400 transition-colors">
                  {c.sigla}
                </span>
                <span className="text-[10px] text-bat-text-muted">{c.nome}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ RETA FINAL (se aplicável) ═══════════ */}
      {painel.reta_final && dias !== null && (
        <div className="rounded-2xl border border-bat-gold-400/40 bg-bat-gold-400/10 px-5 py-4">
          <p className="heading text-base font-bold text-bat-gold-400">
            🔥 Reta final — {dias === 0 ? "a prova é hoje" : `faltam ${dias} ${dias === 1 ? "dia" : "dias"}`}
          </p>
          <p className="mt-1 text-sm text-bat-text-secondary">
            A partir daqui o plano muda: em vez de abrir assunto novo, o que rende é{" "}
            <strong className="text-bat-text">consolidar o que você já viu</strong> e treinar no formato e no ritmo da banca.
          </p>
        </div>
      )}

      {/* ═══════════ PLANO DE AÇÃO & MISSÕES DO DIA ═══════════ */}
      <section className="space-y-3">
        <h2 className="heading text-lg font-bold text-bat-text flex items-center gap-2">
          <span>⚡</span>
          <span>{painel.reta_final ? "Missões Prioritárias da Reta Final" : "Missões do Plano de Hoje"}</span>
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {painel.acoes && painel.acoes.length > 0 ? (
            painel.acoes.map((a) => (
              <Link
                key={a.chave}
                href={a.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card p-5 no-underline transition-all hover:border-bat-gold-400/40 hover:bg-bat-bg-elevated cursor-pointer"
              >
                <div
                  className="absolute inset-y-0 left-0 w-1 transition-all group-hover:w-1.5"
                  style={{ background: CORES_URGENCIA[a.urgencia] ?? "#F5C518" }}
                />

                <div className="flex items-start gap-3 pl-2">
                  <span className="text-2xl shrink-0">{a.emoji}</span>
                  <div>
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: `${CORES_URGENCIA[a.urgencia]}20`,
                        color: CORES_URGENCIA[a.urgencia],
                      }}
                    >
                      {a.urgencia === "alta" ? "Prioridade Máxima" : a.urgencia === "media" ? "Recomendado" : "Opcional"}
                    </span>
                    <h3 className="heading mt-2 text-base font-bold text-bat-text group-hover:text-bat-gold-400 transition-colors">
                      {a.titulo}
                    </h3>
                    <p className="mt-1 text-xs text-bat-text-secondary leading-relaxed">
                      {a.descricao}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end text-xs font-bold text-bat-gold-400 group-hover:translate-x-1 transition-transform">
                  Executar Missão →
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 p-6 rounded-2xl bg-bat-bg-card border border-bat-border text-center text-xs text-bat-text-muted">
              Nenhuma missão pendente no momento. Você está em dia com seu cronograma!
            </div>
          )}

          {/* Card permanente de Questão do Dia */}
          <Link
            href="/questoes"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card p-5 no-underline transition-all hover:border-bat-gold-400/40 hover:bg-bat-bg-elevated cursor-pointer"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-bat-gold-400 group-hover:w-1.5 transition-all" />
            <div className="flex items-start gap-3 pl-2">
              <span className="text-2xl shrink-0">❓</span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-bat-gold-400/20 text-bat-gold-400">
                  Desafio Diário
                </span>
                <h3 className="heading mt-2 text-base font-bold text-bat-text group-hover:text-bat-gold-400 transition-colors">
                  Treino de Questões
                </h3>
                <p className="mt-1 text-xs text-bat-text-secondary leading-relaxed">
                  Pratique questões oficiais de bancas militares com gabarito passo a passo e acumule XP.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end text-xs font-bold text-bat-gold-400 group-hover:translate-x-1 transition-transform">
              Praticar Questões →
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════ ARMAS DA BATCAVERNA (ACESSO RÁPIDO) ═══════════ */}
      <section className="space-y-3">
        <h2 className="heading text-lg font-bold text-bat-text flex items-center gap-2">
          <span>🛡️</span>
          <span>Armas da Caverna (Central de Acesso)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              href: "/concursos",
              icone: "🎯",
              titulo: "Trilhas Militares",
              desc: "Aulas e temas do edital",
            },
            {
              href: "/questoes",
              icone: "❓",
              titulo: "Banco de Questões",
              desc: "Milhares de questões",
            },
            {
              href: "/simulado",
              icone: "⏱️",
              titulo: "Simulados",
              desc: "Treino cronometrado",
            },
            {
              href: "/caderno",
              icone: "📓",
              titulo: "Caderno de Erros",
              desc: "Destrua suas falhas",
            },
            {
              href: "/revisoes",
              icone: "🔁",
              titulo: "Revisões",
              desc: "Repetição espaçada",
            },
            {
              href: "/bizus",
              icone: "💡",
              titulo: "Bizus Táticos",
              desc: "Macetes de aprovação",
            },
            {
              href: "/ranking",
              icone: "🏆",
              titulo: "Ranking",
              desc: "Disputa com a tropa",
            },
            {
              href: "/chat",
              icone: "💬",
              titulo: "Chat & Squad",
              desc: "Comunidade e soldados",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="p-4 rounded-2xl bg-bat-bg-card border border-bat-border hover:border-bat-gold-400/40 hover:bg-bat-bg-elevated transition-all no-underline flex flex-col justify-between gap-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">{item.icone}</span>
                <span className="text-bat-text-muted text-xs group-hover:text-bat-gold-400 transition-colors">→</span>
              </div>
              <div>
                <p className="heading text-sm font-bold text-bat-text group-hover:text-bat-gold-400 transition-colors">
                  {item.titulo}
                </p>
                <p className="text-[11px] text-bat-text-muted mt-0.5">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ RADAR DE FRAQUEZAS (SE DISPONÍVEL) ═══════════ */}
      {radar && radar.fracos.length > 0 && (
        <section className="space-y-3">
          <RadarFraqueza
            fracos={radar.fracos as any}
            pontosCegos={radar.pontos_cegos as any}
            sigla={concurso?.sigla ?? "Seu concurso"}
            totalAssuntos={radar.total_assuntos ?? 0}
            dominados={radar.dominados ?? 0}
          />
        </section>
      )}

      {/* ═══════════ GRÁFICO DE EVOLUÇÃO (SE DISPONÍVEL) ═══════════ */}
      {evolucao && evolucao.length > 1 && (
        <section className="space-y-3">
          <GraficoEvolucao pontos={evolucao} />
        </section>
      )}

      {/* ═══════════ PROJEÇÃO DE NOTA (SE DISPONÍVEL) ═══════════ */}
      {projecao && (
        <section className="space-y-3">
          <ProjecaoNota dados={projecao} sigla={concurso?.sigla ?? "SEU CONCURSO"} />
        </section>
      )}

      {/* ═══════════ MODAL PARA O ALUNO ESCOLHER SEU CONCURSO ALVO ═══════════ */}
      {modalAlvoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl border border-bat-border bg-bat-bg-card p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-bat-gold-400 uppercase tracking-wider mb-1">
                  <span>🎯</span>
                  <span>Personalização da BatCaverna</span>
                </div>
                <h3 className="heading text-xl sm:text-2xl font-extrabold text-bat-text">
                  Qual é o seu Concurso Alvo?
                </h3>
                <p className="text-xs sm:text-sm text-bat-text-secondary mt-1">
                  A caverna se molda inteira (radar de fraquezas, contagem regressiva, simulados e trilha) para focar na sua aprovação.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAlvoAberto(false)}
                className="cursor-pointer rounded-full p-2 text-bat-text-muted hover:text-white hover:bg-white/10 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {PRINCIPAIS_CONCURSOS.map((c) => {
                const ativo = concurso?.sigla.toUpperCase() === c.sigla.toUpperCase();
                return (
                  <button
                    key={c.sigla}
                    type="button"
                    onClick={() => selecionarConcursoAlvo(c.sigla)}
                    disabled={trocandoAlvo}
                    className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[120px] ${
                      ativo
                        ? "border-bat-gold-400 bg-bat-gold-400/15 shadow-[0_0_20px_rgba(245,197,24,0.3)]"
                        : "border-bat-border bg-bat-bg-secondary/80 hover:border-bat-gold-400/50 hover:bg-bat-gold-400/10"
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-40 transition-opacity"
                      style={{ backgroundImage: `url(${c.img})` }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(11,11,15,0.7) 0%, rgba(18,18,24,0.85) 100%)",
                      }}
                    />

                    <div className="relative z-10 flex items-start justify-between w-full">
                      <span className="text-2xl drop-shadow-md">{c.emoji}</span>
                      {ativo ? (
                        <span className="rounded-full bg-bat-gold-400 text-black text-[9px] font-extrabold px-2 py-0.5 uppercase tracking-wider shadow-sm">
                          ✓ Alvo Atual
                        </span>
                      ) : (
                        <span className="text-[10px] text-bat-text-muted group-hover:text-bat-gold-400 font-bold">
                          Selecionar →
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 mt-3">
                      <h4 className="heading text-base font-extrabold text-bat-text group-hover:text-bat-gold-400 transition-colors">
                        {c.sigla}
                      </h4>
                      <p className="text-[11px] text-bat-text-secondary">{c.nome}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {trocandoAlvo && (
              <p className="text-xs text-center text-bat-gold-400 font-semibold animate-pulse">
                🦇 Moldando a BatCaverna para o seu novo alvo...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
