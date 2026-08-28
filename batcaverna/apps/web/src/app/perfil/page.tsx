"use client";

import { useState, useEffect } from "react";

// ─── Mock do usuário ─────────────────────────────────────────
const mockPerfil = {
  nome: "Comandante da BatCaverna",
  apelido: "AdminCaverna",
  email: "raf4biel.venafro@gmail.com",
  bio: "Comandante Chefe da BatCaverna. Central de Operações de Concursos Militares.",
  avatar_url: null,
  banner_url: null,
  data_nascimento: "1998-05-15",
  nivel_atual: 15,
  titulo_nivel: "Rei da Batcaverna",
  xp_total: 25000,
  streak_dias: 30,
  maior_combo: 50,
  questoes_total: 1250,
  percentual_acerto: 91.5,
  tempo_total: 450000,
  concursos_favoritos: [
    { sigla: "EEAR", emoji: "✈️" },
    { sigla: "ESA", emoji: "⭐" },
    { sigla: "ENEM", emoji: "📚" },
  ],
  categoria_escrita: "Futuro Sargento da FAB",
  badges: [
    { nome: "Primeiro Login", icone: "🦇", desc: "Entrou na Caverna" },
    { nome: "Streak 7 dias", icone: "📅", desc: "Estudou 7 dias seguidos" },
    { nome: "Combo x10", icone: "🔥", desc: "10 acertos seguidos" },
  ],
  versao_app: "1.0.0",
  criado_em: "2026-01-15T10:00:00Z",
};

function formatarTempo(seg: number): string {
  const h = Math.floor(seg / 3600);
  if (h >= 24) { const d = Math.floor(h / 24); return `${d} dias`; }
  return `${h}h`;
}

type TabPerfil = "visao_geral" | "badges" | "config";

export default function PerfilPage() {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<TabPerfil>("visao_geral");
  const [editandoBio, setEditandoBio] = useState(false);
  const [bio, setBio] = useState(mockPerfil.bio);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ BANNER + AVATAR ═══ */}
      <div className="relative mb-16">
        <div className="h-40 rounded-2xl bg-gradient-to-r from-bat-purple-800/40 via-bat-purple-600/20 to-bat-bg-tertiary border border-bat-border overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.15),transparent_60%)]" />
        </div>
        <div className="absolute -bottom-12 left-6 flex items-end gap-4">
          <div className="w-24 h-24 rounded-2xl bg-bat-bg-card border-4 border-bat-bg flex items-center justify-center text-bat-purple-300 text-3xl font-bold shadow-xl">
            {mockPerfil.apelido[0]?.toUpperCase()}
          </div>
          <div className="pb-1">
            <h1 className="heading text-xl text-bat-text font-bold">{mockPerfil.apelido}</h1>
            <p className="text-bat-text-secondary text-sm">{mockPerfil.nome}</p>
          </div>
        </div>
      </div>

      {/* ═══ ABAS ═══ */}
      <div className="flex gap-1 bg-bat-bg-card border border-bat-border rounded-xl p-1 mb-6 w-fit">
        {([
          { key: "visao_geral", label: "Visão Geral" },
          { key: "badges", label: "Badges" },
          { key: "config", label: "Configurações" },
        ] as { key: TabPerfil; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === t.key ? "bg-bat-purple-500 text-white" : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ VISÃO GERAL ═══ */}
      {tab === "visao_geral" && (
        <div className="space-y-6">
          {/* Bio */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider">Bio</h3>
              <button
                onClick={() => setEditandoBio(!editandoBio)}
                className="text-bat-purple-400 text-xs hover:underline cursor-pointer"
              >
                {editandoBio ? "Salvar" : "Editar"}
              </button>
            </div>
            {editandoBio ? (
              <textarea
                value={bio || ""}
                onChange={(e) => setBio(e.target.value.slice(0, 150))}
                maxLength={150}
                className="input-field text-sm resize-none h-20"
                placeholder="Escreva algo sobre você..."
              />
            ) : (
              <p className="text-bat-text text-sm">{bio || "Sem bio ainda."}</p>
            )}
            {editandoBio && <p className="text-bat-text-muted text-xs mt-1">{(bio?.length || 0)}/150</p>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-bat-bg-card border border-bat-border rounded-xl p-4 text-center">
              <p className="heading text-2xl text-bat-purple-400 font-bold">Nv. {mockPerfil.nivel_atual}</p>
              <p className="text-bat-text-muted text-xs">{mockPerfil.titulo_nivel}</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-xl p-4 text-center">
              <p className="heading text-2xl text-bat-gold-400 font-bold">{mockPerfil.streak_dias}</p>
              <p className="text-bat-text-muted text-xs">Streak (dias)</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-xl p-4 text-center">
              <p className="heading text-2xl text-bat-text font-bold">{mockPerfil.questoes_total}</p>
              <p className="text-bat-text-muted text-xs">Questões ({mockPerfil.percentual_acerto}%)</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-xl p-4 text-center">
              <p className="heading text-2xl text-bat-text font-bold">{formatarTempo(mockPerfil.tempo_total)}</p>
              <p className="text-bat-text-muted text-xs">Tempo de estudo</p>
            </div>
          </div>

          {/* Concursos favoritos e categoria escrita */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-3">Concursos Favoritos</h3>
              <div className="flex flex-wrap gap-2">
                {mockPerfil.concursos_favoritos.map((c) => (
                  <span
                    key={c.sigla}
                    className="flex items-center gap-1.5 bg-bat-bg-secondary border border-bat-border rounded-lg px-3 py-1.5 text-sm"
                  >
                    <span>{c.emoji}</span>
                    <span className="text-bat-text font-medium">{c.sigla}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-3">Categoria</h3>
              <p className="text-bat-text text-sm">{mockPerfil.categoria_escrita || "Nenhuma categoria definida"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BADGES ═══ */}
      {tab === "badges" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockPerfil.badges.map((badge, i) => (
            <div key={i} className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 text-center card-glow hover:border-bat-purple-500/30">
              <span className="text-4xl mb-2 block">{badge.icone}</span>
              <p className="heading text-sm text-bat-text font-bold mb-1">{badge.nome}</p>
              <p className="text-bat-text-muted text-xs">{badge.desc}</p>
            </div>
          ))}
          {/* Badges locked */}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={`locked-${i}`} className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 text-center opacity-40">
              <span className="text-4xl mb-2 block">🔒</span>
              <p className="text-bat-text-muted text-xs">???</p>
            </div>
          ))}
        </div>
      )}

      {/* ═══ CONFIGURAÇÕES ═══ */}
      {tab === "config" && (
        <div className="space-y-4 max-w-lg">
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
            <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-4">Dados da Conta</h3>
            <div className="space-y-3">
              <div>
                <label className="text-bat-text-muted text-xs block mb-1">E-mail</label>
                <input type="email" value={mockPerfil.email} readOnly className="input-field text-sm opacity-60" />
              </div>
              <div>
                <label className="text-bat-text-muted text-xs block mb-1">Nome</label>
                <input type="text" defaultValue={mockPerfil.nome} className="input-field text-sm" />
              </div>
              <div>
                <label className="text-bat-text-muted text-xs block mb-1">Apelido</label>
                <input type="text" defaultValue={mockPerfil.apelido} className="input-field text-sm" />
              </div>
            </div>
            <button className="btn-primary mt-4 py-2 px-6 text-sm">Salvar alterações</button>
          </div>

          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
            <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-4">Alterar Senha</h3>
            <div className="space-y-3">
              <input type="password" placeholder="Senha atual" className="input-field text-sm" />
              <input type="password" placeholder="Nova senha" className="input-field text-sm" />
              <input type="password" placeholder="Confirmar nova senha" className="input-field text-sm" />
            </div>
            <button className="btn-primary mt-4 py-2 px-6 text-sm">Alterar senha</button>
          </div>

          {/* Versão do app */}
          <p className="text-center text-bat-text-muted text-xs mt-6">
            BatCaverna v{mockPerfil.versao_app} · Membro desde{" "}
            {new Date(mockPerfil.criado_em).toLocaleDateString("pt-BR")}
          </p>
        </div>
      )}
    </div>
  );
}
