"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BatLogo } from "@/components/BatLogo";
import { useAuthStore } from "@/stores/auth-store";
import { useStudySessionStore, formatarTempoLegivel } from "@/stores/study-session-store";
import { StudySessionBadge } from "@/components/StudySessionWidget";

// ─── Título de nível ─────────────────────────────────────────
function getTituloNivel(nivel: number): string {
  if (nivel >= 15) return "Rei da Batcaverna";
  if (nivel >= 10) return "General Estrategista";
  if (nivel >= 7) return "Capitão Tático";
  if (nivel >= 5) return "Cabo de Operações";
  if (nivel >= 3) return "Soldado da Caverna";
  return "Recruta da Caverna";
}

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
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [visible, setVisible] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Sessão de estudo automática (limite 8h)
  const tempoEstudoTotal = useStudySessionStore((state) => state.tempoEstudoTotal);
  const tempoEstudoHoje = useStudySessionStore((state) => state.tempoEstudoHoje);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  // Dados REAIS do usuário autenticado
  const apelido = user?.apelido || user?.nome || "Soldado";
  const role = user?.role || "user";
  const nivel = user?.nivel_atual || 1;
  const xp = user?.xp_total ?? 0;
  const xpProximo = nivel * 1000 + 500;
  const titulo = getTituloNivel(nivel);
  const streak = user?.streak_dias ?? 0;
  const maiorCombo = user?.maior_combo_pessoal ?? 0;

  return (
    <div className={`space-y-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ CABEÇALHO COM BADGE DE SESSÃO AUTOMÁTICA (8H) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BatLogo size={36} glow />
            <h1 className="heading text-2xl sm:text-3xl text-bat-text font-bold">
              Bem-vindo à <span className="text-white">Bat</span><span className="text-bat-gold-400 drop-shadow-[0_0_12px_rgba(245,197,24,0.4)]">Caverna</span>, {apelido}
            </h1>
            {role === "admin" && (
              <Link href="/admin" className="badge-admin no-underline">
                ADMIN
              </Link>
            )}
          </div>
          <p className="text-bat-text-secondary text-sm ml-10">
            Vamos dominar mais um dia de estudos? 💪
          </p>
        </div>

        {/* Widget de Sessão Automática de 8h */}
        <div className="self-start sm:self-center">
          <StudySessionBadge variant="full" />
        </div>
      </div>

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
          value="0"
          sub="Resolva sua primeira questão"
          glowColor="blue"
        />
        <StatCard
          icon="⚡"
          label="Maior Combo"
          value={maiorCombo > 0 ? `x${maiorCombo}` : "x0"}
          sub={maiorCombo > 0 ? "Acertos seguidos" : "Acerte questões em sequência"}
          glowColor="green"
        />
      </div>

      {/* ═══ PROGRESSO POR CONCURSO + QUESTÃO DO DIA ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concursos favoritos */}
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
          <h2 className="heading text-lg text-bat-text mb-4">Seus Concursos</h2>
          <div className="py-6 text-center">
            <p className="text-bat-text-muted text-sm mb-3">
              Você ainda não iniciou nenhuma trilha de estudos.
            </p>
            <Link
              href="/concursos"
              className="btn-primary inline-block py-2.5 px-5 text-sm no-underline"
            >
              Explorar concursos →
            </Link>
          </div>
        </div>

        {/* Questão do dia */}
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading text-lg text-bat-text">🎲 Questão do Dia</h2>
            <span className="text-xs font-bold text-bat-gold-400 bg-bat-gold-400/10 border border-bat-gold-400/20 px-2.5 py-1 rounded-lg">
              Em breve
            </span>
          </div>
          <p className="text-bat-text-secondary text-sm mb-4">
            As questões do dia serão habilitadas quando houver questões oficiais importadas na plataforma.
          </p>
          <Link
            href="/questoes"
            className="btn-primary inline-block py-2.5 px-5 text-sm no-underline"
          >
            Ver banco de questões
          </Link>
        </div>
      </div>

      {/* ═══ AÇÕES RÁPIDAS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/questoes", label: "Banco de Questões", icon: "📝", cor: "border-bat-gold-400/20 hover:border-bat-gold-400/50" },
          { href: "/simulado", label: "Simulado Rápido", icon: "⏱️", cor: "border-bat-gold-400/20 hover:border-bat-gold-400/50" },
          { href: "/bizus", label: "Bizus", icon: "💡", cor: "border-bat-success/20 hover:border-bat-success/40" },
          { href: "/ranking", label: "Ranking", icon: "🏆", cor: "border-bat-info/20 hover:border-bat-info/40" },
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
