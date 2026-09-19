"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BatLogo } from "@/components/BatLogo";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";
import { useStudySessionStore, formatarTempoLegivel } from "@/stores/study-session-store";
import { StudySessionBadge } from "@/components/StudySessionWidget";
import { ComboBanner, patamarDe } from "@/components/questoes/ComboBadge";
import { calcularNivel } from "@batcaverna/utils";
import { HistoricoSimulados } from "@/components/estudo/HistoricoSimulados";
import { GraficoEvolucao } from "@/components/estudo/GraficoEvolucao";
import { ComparacaoTurma } from "@/components/estudo/ComparacaoTurma";
import { MathText } from "@/components/MathText";

// ─── Barra de progresso XP ───────────────────────────────────
function XpBar({ atual, proximo, nivel, titulo }: { atual: number; proximo: number; nivel: number; titulo: string }) {
  const progresso = proximo > 0 ? Math.min(100, (atual / proximo) * 100) : 0;

  return (
    <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="heading text-bat-gold-400 text-lg font-bold">Nv. {nivel}</span>
          <span className="text-bat-text-secondary text-sm">{titulo}</span>
        </div>
        <span className="text-bat-text-muted text-xs">{atual} / {proximo} XP</span>
      </div>
      <div className="w-full h-3 bg-bat-bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${progresso}%`,
            background: "linear-gradient(90deg, #F5C518, #FFD700, #EAB308)",
            boxShadow: "0 0 12px rgba(245, 197, 24, 0.5)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Card estatístico ────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  glowColor = "gold",
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  glowColor?: "gold" | "green" | "blue";
}) {
  const glowMap = {
    gold: "hover:border-bat-gold-400/40 hover:shadow-[0_0_20px_rgba(245,197,24,0.2)]",
    green: "hover:border-bat-success/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]",
    blue: "hover:border-bat-info/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
  };

  return (
    <div className={`bg-bat-bg-card border border-bat-border rounded-2xl p-5 transition-all duration-300 ${glowMap[glowColor]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-bat-text-muted text-xs mb-1">{label}</p>
          <p className="heading text-2xl text-bat-text font-bold">{value}</p>
          {sub && <p className="text-bat-text-secondary text-xs mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEU PROGRESSO
// ═══════════════════════════════════════════════════════════════
// Esta tela era a inicial da plataforma. Ela conta bem o que o aluno JÁ FEZ
// — streak, tempo, questões, maior combo — e é isso que ela deve fazer.
//
// O que ela não fazia era dizer o que fazer EM SEGUIDA, e essa é a pergunta
// de quem abre a plataforma às 20h de uma terça. Por isso a inicial virou
// /dashboard (o plano do dia) e o histórico ficou aqui, onde o aluno vem
// quando quer se ver evoluir — que é um momento diferente, e igualmente
// importante numa preparação de um ano.
// ═══════════════════════════════════════════════════════════════
interface ConcursoFavorito {
  sigla: string;
  nome: string;
  emoji: string | null;
}

interface QuestaoDoDia {
  id: string;
  enunciado: string;
  ano: number | null;
  concursos: { sigla: string } | null;
  materias: { nome: string } | null;
  assuntos: { nome: string } | null;
}

export default function ProgressoPage() {
  const [visible, setVisible] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [favoritos, setFavoritos] = useState<ConcursoFavorito[]>([]);
  const [questaoDoDia, setQuestaoDoDia] = useState<QuestaoDoDia | null>(null);
  const [evolucao, setEvolucao] = useState<
    { semana: string; respondidas: number; acertos: number; taxa: number }[]
  >([]);

  // Sessão de estudo automática (limite 8h)
  const tempoEstudoTotal = useStudySessionStore((state) => state.tempoEstudoTotal);
  const tempoEstudoHoje = useStudySessionStore((state) => state.tempoEstudoHoje);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);

    // Buscar tempo total e status de estudo atualizados do Supabase
    const fetchStudyStats = async () => {
      try {
        const res = await fetchWithAuth('/api/study-sessions/status');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            useStudySessionStore.setState({
              tempoEstudoTotal: json.data.tempo_estudo_total_segundos || 0,
              tempoEstudoHoje: json.data.tempo_estudo_hoje_segundos || 0,
            });
          }
        }
      } catch (e) {
        console.warn('Erro ao atualizar estatísticas de estudo:', e);
      }
    };

    fetchStudyStats();

    // A curva de acerto por semana vem do mesmo painel que alimenta a tela
    // inicial — uma fonte só, para as duas nunca discordarem.
    fetchWithAuth("/api/estudo/painel")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data?.evolucao)) {
          setEvolucao(json.data.evolucao);
        }
      })
      .catch((err) => console.warn("Erro ao carregar evolução:", err));

    // Concursos alvo do aluno: mapeia siglas com o catálogo de concursos
    Promise.all([
      fetchWithAuth("/api/usuarios/me/concursos-favoritos").then((r) => (r.ok ? r.json() : null)),
      fetchWithAuth("/api/concursos").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([favJson, concJson]) => {
        const rawFavs = favJson?.success && Array.isArray(favJson.data) ? favJson.data : [];
        const catalog = concJson?.success && Array.isArray(concJson.data) ? concJson.data : [];
        const catalogMap = new Map<string, any>(catalog.map((c: any) => [String(c.sigla).toUpperCase(), c]));

        const listaMapeada: ConcursoFavorito[] = rawFavs
          .map((item: any) => {
            const siglaStr = typeof item === "string" ? item : item?.sigla || item?.concursos?.sigla;
            if (!siglaStr) return null;
            const conc = catalogMap.get(siglaStr.toUpperCase());
            return {
              sigla: siglaStr,
              nome: conc?.nome || siglaStr,
              emoji: conc?.emoji || "🎯",
            };
          })
          .filter(Boolean) as ConcursoFavorito[];

        setFavoritos(listaMapeada);
      })
      .catch((err) => console.warn("Erro ao carregar concursos favoritos:", err));

    // Questão do dia
    fetchWithAuth("/api/questoes/do-dia")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.success && json.data) setQuestaoDoDia(json.data);
      })
      .catch((err) => console.warn("Erro ao carregar questão do dia:", err));
  }, []);

  // Dados REAIS do usuário autenticado com 15 níveis oficiais
  const apelido = user?.apelido || user?.nome || "Soldado";
  const role = user?.role || "user";
  const xp = user?.xp_total ?? 0;
  const nivelInfo = calcularNivel(xp);
  const nivel = nivelInfo.nivel;
  const xpProximo = nivelInfo.xp_necessario_proximo;
  const titulo = nivelInfo.titulo;
  const streak = user?.streak_dias ?? 0;
  const maiorCombo = user?.maior_combo_pessoal ?? 0;
  const comboAtual = user?.combo_atual ?? 0;
  const questoesRespondidas = user?.questoes_respondidas ?? 0;
  const taxaAcerto = user?.taxa_acerto ?? 0;
  const patamarMaior = patamarDe(maiorCombo);

  return (
    <div className={`space-y-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ CABEÇALHO DO MEU PROGRESSO ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">📊</span>
            <h1 className="heading text-2xl sm:text-3xl text-bat-text font-bold">
              Meu <span className="text-bat-gold-400">Progresso</span>
            </h1>
            {role === "admin" && (
              <Link href="/admin" className="badge-admin no-underline ml-1">
                ADMIN
              </Link>
            )}
          </div>
          <p className="text-bat-text-secondary text-sm">
            Estatísticas de combate, histórico de ofensivas, patentes e conquistas do soldado {apelido}.
          </p>
        </div>

        {/* Widget de Sessão de Estudo */}
        <div className="self-start sm:self-center">
          <StudySessionBadge variant="full" />
        </div>
      </div>

      {/* ═══ SEQUÊNCIA ATIVA (persistida no banco) ═══ */}
      {comboAtual >= 3 && <ComboBanner combo={comboAtual} />}

      {/* ═══ BARRA DE XP ═══ */}
      <XpBar
        atual={xp}
        proximo={xpProximo}
        nivel={nivel}
        titulo={titulo}
      />

      {/* ═══ CARDS ESTATÍSTICOS (DADOS REAIS COM TEMPO AUTOMÁTICO) ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🔥"
          label="Streak"
          value={streak > 0 ? `${streak} dias` : "0 dias"}
          sub={streak > 0 ? "Não perca a sequência!" : "Estude hoje para pontuar!"}
          glowColor="gold"
        />
        <StatCard
          icon="⏱️"
          label="Tempo Total"
          value={formatarTempoLegivel(tempoEstudoTotal)}
          sub={tempoEstudoHoje > 0 ? `Hoje: ${formatarTempoLegivel(tempoEstudoHoje)}` : "Acumule tempo estudando"}
          glowColor="gold"
        />
        <StatCard
          icon="❓"
          label="Questões"
          value={questoesRespondidas.toLocaleString("pt-BR")}
          sub={
            questoesRespondidas > 0
              ? `${taxaAcerto}% de acerto`
              : "Resolva sua primeira questão"
          }
          glowColor="blue"
        />
        <StatCard
          icon="⚡"
          label="Maior Combo"
          value={maiorCombo > 0 ? `x${maiorCombo}` : "x0"}
          sub={
            patamarMaior
              ? `${patamarMaior.emoji} ${patamarMaior.rotulo}`
              : maiorCombo > 0
              ? "Acertos seguidos"
              : "Acerte questões em sequência"
          }
          glowColor="green"
        />
      </div>

      {/* ═══ EVOLUÇÃO ═══ */}
      {/* A curva vem ANTES do histórico de concursos porque é a pergunta que
          traz o aluno a esta tela: "eu estou melhorando?". O resto é
          contexto. */}
      {evolucao.length >= 2 && <GraficoEvolucao pontos={evolucao} />}

      {/* ═══ ONDE VOCÊ ESTÁ EM RELAÇÃO A QUEM RESOLVE MUITO ═══
          Depois da curva de evolução: primeiro "eu estou melhorando?",
          depois "melhorando em direção a quê?". O componente se esconde
          sozinho quando ainda não há grupo suficiente para comparar. */}
      <ComparacaoTurma sigla={favoritos[0]?.sigla} />

      {/* ═══ SIMULADOS ═══ */}
      <HistoricoSimulados />

      {/* ═══ PROGRESSO POR CONCURSO + QUESTÃO DO DIA ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concursos favoritos */}
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
          <h2 className="heading text-lg text-bat-text mb-4">Seus Concursos</h2>

          {favoritos.length > 0 ? (
            <div className="space-y-2.5">
              {favoritos.map((c) => (
                <Link
                  key={c.sigla}
                  href={`/concursos/${c.sigla.toLowerCase()}`}
                  className="flex items-center gap-3 rounded-xl border border-bat-border bg-bat-bg-secondary/50 px-4 py-3 no-underline transition-all hover:border-bat-gold-400/40"
                >
                  <span className="text-2xl">{c.emoji ?? "🎯"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-bat-text">{c.sigla}</p>
                    <p className="truncate text-xs text-bat-text-muted">{c.nome}</p>
                  </div>
                  <span className="text-bat-gold-400">→</span>
                </Link>
              ))}
              <Link
                href="/perfil"
                className="mt-2 block text-center text-xs text-bat-text-muted no-underline hover:text-bat-gold-400"
              >
                Gerenciar concursos alvo
              </Link>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-bat-text-muted text-sm mb-3">
                Você ainda não escolheu um concurso alvo.
              </p>
              <Link
                href="/concursos"
                className="btn-primary inline-block py-2.5 px-5 text-sm no-underline"
              >
                Explorar concursos →
              </Link>
            </div>
          )}
        </div>

        {/* Questão do dia */}
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading text-lg text-bat-text">🎲 Questão do Dia</h2>
            {questaoDoDia?.concursos?.sigla && (
              <span className="text-xs font-bold text-bat-gold-400 bg-bat-gold-400/10 border border-bat-gold-400/20 px-2.5 py-1 rounded-lg">
                {questaoDoDia.concursos.sigla}
                {questaoDoDia.ano ? ` · ${questaoDoDia.ano}` : ""}
              </span>
            )}
          </div>

          {questaoDoDia ? (
            <>
              <p className="mb-2 text-xs text-bat-text-muted">
                {questaoDoDia.materias?.nome}
                {questaoDoDia.assuntos?.nome ? ` · ${questaoDoDia.assuntos.nome}` : ""}
              </p>
              <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-bat-text-secondary">
                <MathText>{questaoDoDia.enunciado}</MathText>
              </p>
              <Link
                href={`/questoes?concurso=${questaoDoDia.concursos?.sigla ?? "todos"}`}
                className="btn-primary inline-block py-2.5 px-5 text-sm no-underline"
              >
                Resolver agora →
              </Link>
            </>
          ) : (
            <>
              <p className="text-bat-text-secondary text-sm mb-4">
                Carregando uma questão oficial para você começar o dia...
              </p>
              <Link
                href="/questoes"
                className="btn-primary inline-block py-2.5 px-5 text-sm no-underline"
              >
                Ver banco de questões
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ═══ AÇÕES RÁPIDAS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/questoes", label: "Banco de Questões", icon: "📝", cor: "border-bat-gold-400/20 hover:border-bat-gold-400/50" },
          { href: "/revisoes", label: "Revisar Erros", icon: "🔁", cor: "border-bat-purple-500/20 hover:border-bat-purple-500/50" },
          { href: "/caderno", label: "Caderno de Erros", icon: "📓", cor: "border-bat-error/20 hover:border-bat-error/40" },
          { href: "/cronograma", label: "Cronograma", icon: "🗓️", cor: "border-bat-info/20 hover:border-bat-info/40" },
          { href: "/simulado", label: "Simulado", icon: "⏱️", cor: "border-bat-gold-400/20 hover:border-bat-gold-400/50" },
          { href: "/bizus", label: "Bizus", icon: "💡", cor: "border-bat-success/20 hover:border-bat-success/40" },
          { href: "/ranking", label: "Ranking", icon: "🏆", cor: "border-bat-info/20 hover:border-bat-info/40" },
          { href: "/musica", label: "Música", icon: "🎧", cor: "border-bat-purple-500/20 hover:border-bat-purple-500/50" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`bg-bat-bg-card border ${a.cor} rounded-2xl p-4 flex flex-col items-center gap-2 text-center no-underline transition-all duration-300 hover:transform hover:scale-[1.02]`}
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-bat-text text-sm font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
