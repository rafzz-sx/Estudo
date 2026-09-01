"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BatLogo } from "@/components/BatLogo";
import { useAuthStore } from "@/stores/auth-store";

// ─── Dados mock (Admin) ──────────────────────────────────────
const mockUser = {
  apelido: "AdminCaverna",
  email: "raf4biel.venafro@gmail.com",
  role: "admin" as const,
  nivel_atual: 15,
  titulo_nivel: "Rei da Batcaverna",
  xp_total: 25000,
  xp_proximo_nivel: 30000,
  streak_dias: 30,
  maior_combo: 50,
  tempo_estudo_hoje: 14400, // 4h em segundos
  tempo_estudo_total: 450000,
  questoes_respondidas_total: 1250,
  percentual_acerto: 91.5,
  sessao_ativa: true,
};

const mockConcursosFavoritos = [
  { sigla: "EEAR", progresso: 35, emoji: "✈️" },
  { sigla: "ESA", progresso: 22, emoji: "⭐" },
  { sigla: "ENEM", progresso: 18, emoji: "📚" },
];

const mockQuestaoDoDia = {
  materia: "Português",
  assunto: "Crase",
  enunciado: "Assinale a alternativa em que o uso da crase está CORRETO:",
};

// ─── Morcego SVG ─────────────────────────────────────────────
function BatIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M32 8C32 8 28 16 20 20C12 24 4 22 4 22C4 22 8 30 14 34C14 34 10 42 8 48C8 48 16 44 22 42C24 46 28 52 32 56C36 52 40 46 42 42C48 44 56 48 56 48C54 42 50 34 50 34C56 30 60 22 60 22C60 22 52 24 44 20C36 16 32 8 32 8Z" fill="currentColor" fillOpacity="0.9"/>
    </svg>
  );
}

// ─── Formatar tempo ──────────────────────────────────────────
function formatarTempo(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m}min`;
}

// ─── Barra de progresso XP ───────────────────────────────────
function XpBar({ atual, proximo, nivel, titulo }: { atual: number; proximo: number; nivel: number; titulo: string }) {
  const progresso = Math.min(100, (atual / proximo) * 100);

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
  glowColor?: "purple" | "gold" | "green" | "blue";
}) {
  const glowMap = {
    purple: "hover:border-bat-gold-400/40 hover:shadow-[0_0_20px_rgba(245,197,24,0.2)]",
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
  const storeUser = useAuthStore((state) => state.user);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const apelidoExibicao = storeUser?.apelido || storeUser?.nome || mockUser.apelido;
  const roleExibicao = storeUser?.role || mockUser.role;
  const nivelExibicao = storeUser?.nivel_atual || (storeUser ? 1 : mockUser.nivel_atual);
  const xpExibicao = storeUser?.xp_total ?? mockUser.xp_total;
  const xpProximo = nivelExibicao * 1000 + 500;
  const tituloNivel = nivelExibicao >= 15 ? "Rei da Batcaverna" : nivelExibicao >= 10 ? "General Estrategista" : nivelExibicao >= 5 ? "Cabo Tático" : "Recruta da Caverna";

  return (
    <div className={`space-y-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ CABEÇALHO ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BatLogo size={36} glow />
            <h1 className="heading text-2xl sm:text-3xl text-bat-text font-bold">
              Bem-vindo à <span className="text-bat-gold-400 drop-shadow-[0_0_12px_rgba(245,197,24,0.4)]">Caverna</span>, {apelidoExibicao}
            </h1>
            {roleExibicao === "admin" && (
              <Link href="/admin" className="badge-admin no-underline">
                ADMIN
              </Link>
            )}
          </div>
          <p className="text-bat-text-secondary text-sm ml-10">
            Vamos dominar mais um dia de estudos? 💪
          </p>
        </div>

        {/* Sessão ativa */}
        <div className="flex items-center gap-2 bg-bat-success/10 border border-bat-success/30 rounded-xl px-4 py-2">
          <div className="live-indicator" />
          <span className="text-bat-success text-sm font-medium">
            Estudando agora · {formatarTempo(mockUser.tempo_estudo_hoje)}
          </span>
        </div>
      </div>

      {/* ═══ BARRA DE XP ═══ */}
      <XpBar
        atual={xpExibicao}
        proximo={xpProximo}
        nivel={nivelExibicao}
        titulo={tituloNivel}
      />

      {/* ═══ CARDS ESTATÍSTICOS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🔥"
          label="Streak"
          value={`${mockUser.streak_dias} dias`}
          sub="Não perca a sequência!"
          glowColor="gold"
        />
        <StatCard
          icon="⏱️"
          label="Tempo Total"
          value={formatarTempo(mockUser.tempo_estudo_total)}
          sub="Desde o início"
          glowColor="gold"
        />
        <StatCard
          icon="❓"
          label="Questões"
          value={mockUser.questoes_respondidas_total.toString()}
          sub={`${mockUser.percentual_acerto}% de acerto`}
          glowColor="blue"
        />
        <StatCard
          icon="⚡"
          label="Maior Combo"
          value={`x${mockUser.maior_combo}`}
          sub="Acertos seguidos"
          glowColor="green"
        />
      </div>

      {/* ═══ PROGRESSO POR CONCURSO ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concursos favoritos */}
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
          <h2 className="heading text-lg text-bat-text mb-4">Seus Concursos</h2>
          <div className="space-y-4">
            {mockConcursosFavoritos.map((c) => (
              <Link
                key={c.sigla}
                href={`/concursos/${c.sigla.toLowerCase()}`}
                className="flex items-center gap-3 no-underline group"
              >
                <span className="text-xl">{c.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-bat-text text-sm font-medium group-hover:text-bat-gold-400 transition-colors">
                      {c.sigla}
                    </span>
                    <span className="text-bat-text-muted text-xs">{c.progresso}%</span>
                  </div>
                  <div className="w-full h-2 bg-bat-bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-bat-gold-400 transition-all duration-500"
                      style={{ width: `${c.progresso}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/concursos"
            className="block mt-4 text-bat-gold-400 text-sm hover:underline no-underline text-center font-medium"
          >
            Ver todos os concursos →
          </Link>
        </div>

        {/* Questão do dia */}
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading text-lg text-bat-text">🎲 Questão do Dia</h2>
            <span className="text-xs font-bold text-bat-gold-400 bg-bat-gold-400/10 border border-bat-gold-400/20 px-2.5 py-1 rounded-lg">
              {mockQuestaoDoDia.materia}
            </span>
          </div>
          <p className="text-bat-text-secondary text-sm mb-2">
            <span className="text-bat-text-muted">Assunto:</span> {mockQuestaoDoDia.assunto}
          </p>
          <p className="text-bat-text text-sm leading-relaxed mb-4 line-clamp-3">
            {mockQuestaoDoDia.enunciado}
          </p>
          <Link
            href="/questoes/dia"
            className="btn-primary inline-block py-2.5 px-5 text-sm no-underline"
          >
            Resolver agora
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
