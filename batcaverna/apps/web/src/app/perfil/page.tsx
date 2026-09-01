"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";

function formatarTempo(seg: number): string {
  if (seg <= 0) return "0min";
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const hr = h % 24;
    return hr > 0 ? `${d}d ${hr}h` : `${d}d`;
  }
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m}min`;
}

function getTituloNivel(nivel: number): string {
  if (nivel >= 15) return "Rei da Batcaverna";
  if (nivel >= 10) return "General Estrategista";
  if (nivel >= 7) return "Capitão Tático";
  if (nivel >= 5) return "Cabo de Operações";
  if (nivel >= 3) return "Soldado da Caverna";
  return "Recruta da Caverna";
}

const BANNER_ACCEPT = "image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm";
const AVATAR_ACCEPT = "image/png,image/jpeg,image/gif,image/webp";
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

type TabPerfil = "visao_geral" | "badges" | "config";

export default function PerfilPage() {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<TabPerfil>("visao_geral");
  const [editandoBio, setEditandoBio] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [msgFeedback, setMsgFeedback] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [tempoTotalEstudo, setTempoTotalEstudo] = useState(0);

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [bio, setBio] = useState(user?.bio || "");
  const [nome, setNome] = useState(user?.nome || "");
  const [apelido, setApelido] = useState(user?.apelido || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(user?.banner_url || null);
  const [bannerIsVideo, setBannerIsVideo] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // 1. Carregar perfil atualizado diretamente do Supabase
  const carregarPerfil = async () => {
    try {
      const res = await fetch("/api/usuarios/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setNome(d.nome || "");
          setApelido(d.apelido || "");
          setBio(d.bio || "");
          setAvatarPreview(d.avatar_url || null);
          setBannerPreview(d.banner_url || null);
          setTempoTotalEstudo(d.tempo_total_estudo || 0);

          updateUser({
            nome: d.nome,
            apelido: d.apelido,
            bio: d.bio,
            avatar_url: d.avatar_url,
            banner_url: d.banner_url,
            banner_tipo: d.banner_tipo,
            xp_total: d.xp_total,
            nivel_atual: d.nivel_atual,
            streak_dias: d.streak_dias,
            maior_combo_pessoal: d.maior_combo_pessoal,
          });
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar perfil atualizado:", e);
    }
  };

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    carregarPerfil();
  }, []);

  useEffect(() => {
    if (user) {
      if (!nome) setNome(user.nome || "");
      if (!apelido) setApelido(user.apelido || "");
      if (!bio && user.bio) setBio(user.bio);
      if (!avatarPreview && user.avatar_url) setAvatarPreview(user.avatar_url);
      if (!bannerPreview && user.banner_url) setBannerPreview(user.banner_url);
    }
  }, [user]);

  // Detectar se banner é vídeo
  useEffect(() => {
    if (bannerPreview) {
      setBannerIsVideo(
        bannerPreview.endsWith(".mp4") ||
        bannerPreview.endsWith(".webm") ||
        bannerPreview.startsWith("data:video/")
      );
    }
  }, [bannerPreview]);

  // 2. Upload e Salvamento Instantâneo de Foto e Banner no Supabase
  const handleFileSelect = async (file: File, type: "avatar" | "banner") => {
    if (file.size > MAX_FILE_SIZE) {
      setMsgFeedback("⚠️ Arquivo muito grande! Máximo 15MB.");
      setTimeout(() => setMsgFeedback(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      if (type === "avatar") {
        setAvatarPreview(dataUrl);
        setUploadingAvatar(true);
        setMsgFeedback("⏳ Salvando foto de perfil no banco de dados...");

        try {
          const res = await fetch("/api/usuarios/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatar_url: dataUrl }),
          });

          if (res.ok) {
            updateUser({ avatar_url: dataUrl });
            setMsgFeedback("✓ Foto de perfil salva com sucesso!");
          } else {
            setMsgFeedback("⚠️ Erro ao salvar foto no servidor.");
          }
        } catch {
          setMsgFeedback("⚠️ Falha ao salvar foto.");
        } finally {
          setUploadingAvatar(false);
          setTimeout(() => setMsgFeedback(null), 3500);
        }
      } else {
        const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".webm");
        const isGif = file.type === "image/gif" || file.name.endsWith(".gif");
        const tipo = isVideo ? "video" : isGif ? "gif" : "imagem";

        setBannerPreview(dataUrl);
        setBannerIsVideo(isVideo);
        setUploadingBanner(true);
        setMsgFeedback("⏳ Salvando banner no banco de dados...");

        try {
          const res = await fetch("/api/usuarios/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ banner_url: dataUrl, banner_tipo: tipo }),
          });

          if (res.ok) {
            updateUser({ banner_url: dataUrl, banner_tipo: tipo });
            setMsgFeedback("✓ Banner salvo com sucesso!");
          } else {
            setMsgFeedback("⚠️ Erro ao salvar banner no servidor.");
          }
        } catch {
          setMsgFeedback("⚠️ Falha ao salvar banner.");
        } finally {
          setUploadingBanner(false);
          setTimeout(() => setMsgFeedback(null), 3500);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // 3. Salvar Informações de Texto (Nome, Apelido, Bio)
  const handleSalvarPerfil = async () => {
    setSalvando(true);
    setMsgFeedback(null);
    try {
      const res = await fetch("/api/usuarios/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          apelido,
          bio,
          avatar_url: avatarPreview,
          banner_url: bannerPreview,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        updateUser(json.data);
        setMsgFeedback("✓ Perfil e alterações salvas com sucesso!");
        setEditandoBio(false);
      } else {
        setMsgFeedback(`⚠️ ${json.error || "Erro ao salvar perfil"}`);
      }
    } catch {
      setMsgFeedback("⚠️ Erro de conexão ao salvar perfil");
    } finally {
      setSalvando(false);
      setTimeout(() => setMsgFeedback(null), 4000);
    }
  };

  const nivel = user?.nivel_atual || 1;
  const xp = user?.xp_total ?? 0;
  const streak = user?.streak_dias ?? 0;
  const titulo = getTituloNivel(nivel);
  const displayApelido = user?.apelido || apelido || "Soldado";
  const displayNome = user?.nome || nome || "";

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ BANNER + AVATAR ═══ */}
      <div className="relative mb-16">
        {/* Banner (clicável para upload — suporta imagem, GIF, vídeo) */}
        <div
          className="h-44 sm:h-52 rounded-2xl border border-bat-border overflow-hidden relative group cursor-pointer bg-bat-bg-card"
          onClick={() => bannerInputRef.current?.click()}
        >
          {bannerPreview && bannerIsVideo ? (
            <video
              src={bannerPreview}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#F5C518]/25 via-[#EAB308]/15 to-bat-bg-tertiary">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,197,24,0.15),transparent_60%)]" />
            </div>
          )}

          {/* Overlay de upload */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-center">
              <span className="text-white text-2xl block mb-1">📷</span>
              <span className="text-white text-xs font-semibold">
                {uploadingBanner ? "Salvando Banner..." : "Trocar Banner"}
              </span>
              <span className="text-white/70 text-[10px] block mt-0.5">
                Imagem, GIF animado ou Vídeo (MP4/WebM)
              </span>
            </div>
          </div>
        </div>

        <input
          ref={bannerInputRef}
          type="file"
          accept={BANNER_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file, "banner");
          }}
        />

        {/* Avatar (clicável para upload — suporta imagem e GIF) */}
        <div className="absolute -bottom-12 left-6 flex items-end gap-4">
          <div
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-bat-bg-card border-4 border-bat-bg shadow-xl overflow-hidden group cursor-pointer"
            onClick={() => avatarInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-bat-gold-400 text-3xl font-bold bg-bat-bg-card">
                {displayApelido[0]?.toUpperCase() || "?"}
              </div>
            )}

            {/* Overlay de upload */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <span className="text-white text-xs font-bold text-center px-1">
                {uploadingAvatar ? "Salvando..." : "Trocar Foto"}
              </span>
            </div>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept={AVATAR_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file, "avatar");
            }}
          />

          <div className="pb-1">
            <h1 className="heading text-xl sm:text-2xl text-bat-text font-bold">{displayApelido}</h1>
            <p className="text-bat-text-secondary text-sm">{displayNome}</p>
          </div>
        </div>
      </div>

      {/* Feedback de Mensagem */}
      {msgFeedback && (
        <div className={`mb-4 p-3.5 rounded-xl text-xs font-bold ${
          msgFeedback.startsWith("⚠️")
            ? "bg-bat-error/15 border border-bat-error/30 text-bat-error"
            : "bg-bat-success/15 border border-bat-success/30 text-bat-success"
        }`}>
          {msgFeedback}
        </div>
      )}

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
              tab === t.key ? "bg-bat-gold-400 text-black font-bold shadow-[0_0_15px_rgba(245,197,24,0.3)]" : "text-bat-text-muted hover:text-bat-text"
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
                onClick={() => {
                  if (editandoBio) {
                    handleSalvarPerfil();
                  } else {
                    setEditandoBio(true);
                  }
                }}
                className="text-bat-gold-400 text-xs hover:underline cursor-pointer font-medium"
              >
                {editandoBio ? "Salvar Bio ⚡" : "Editar"}
              </button>
            </div>
            {editandoBio ? (
              <textarea
                value={bio || ""}
                onChange={(e) => setBio(e.target.value.slice(0, 150))}
                maxLength={150}
                className="input-field text-sm resize-none h-20"
                placeholder="Escreva sua bio de combate..."
              />
            ) : (
              <p className="text-bat-text text-sm">{bio || "Sem bio ainda. Clique em Editar para adicionar!"}</p>
            )}
            {editandoBio && <p className="text-bat-text-muted text-xs mt-1">{(bio?.length || 0)}/150</p>}
          </div>

          {/* Stats Reais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-bat-bg-card border border-bat-border rounded-xl p-4 text-center">
              <p className="heading text-2xl text-bat-gold-400 font-bold">Nv. {nivel}</p>
              <p className="text-bat-text-muted text-xs">{titulo}</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-xl p-4 text-center">
              <p className="heading text-2xl text-bat-gold-400 font-bold">{streak}</p>
              <p className="text-bat-text-muted text-xs">Streak (dias)</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-xl p-4 text-center">
              <p className="heading text-2xl text-bat-text font-bold">0</p>
              <p className="text-bat-text-muted text-xs">Questões resolvidas</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-xl p-4 text-center">
              <p className="heading text-2xl text-bat-text font-bold">{formatarTempo(tempoTotalEstudo)}</p>
              <p className="text-bat-text-muted text-xs">Tempo Real de Estudo</p>
            </div>
          </div>

          {/* Concursos favoritos e categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-3">Concursos Favoritos</h3>
              <p className="text-bat-text-muted text-sm">Nenhum concurso selecionado ainda.</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-3">Categoria</h3>
              <p className="text-bat-text text-sm">Recruta da Caverna</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BADGES ═══ */}
      {tab === "badges" && (
        <div className="space-y-4">
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 text-center">
            <span className="text-4xl block mb-3">🦇</span>
            <p className="text-bat-text font-medium mb-1">Primeiro Login</p>
            <p className="text-bat-text-muted text-xs">Entrou na Caverna</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`locked-${i}`} className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 text-center opacity-40">
                <span className="text-4xl mb-2 block">🔒</span>
                <p className="text-bat-text-muted text-xs">???</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ CONFIGURAÇÕES ═══ */}
      {tab === "config" && (
        <div className="space-y-4 max-w-lg">
          {/* Upload de Foto e Banner */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
            <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-4">Foto & Banner</h3>
            <div className="space-y-3">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="w-full py-3 rounded-xl bg-bat-bg-secondary border border-bat-border hover:border-[#F5C518]/40 text-bat-text text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                📷 Trocar Foto de Perfil
                <span className="text-bat-text-muted text-[10px]">(PNG, JPG, GIF)</span>
              </button>
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="w-full py-3 rounded-xl bg-bat-bg-secondary border border-bat-border hover:border-[#F5C518]/40 text-bat-text text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                🎬 Trocar Banner
                <span className="text-bat-text-muted text-[10px]">(PNG, JPG, GIF, MP4, WebM)</span>
              </button>
              <p className="text-bat-text-muted text-[11px] text-center">
                💡 Suporta GIFs animados e vídeos no banner. Todas as mídias ficam salvas permanentemente na sua conta.
              </p>
            </div>
          </div>

          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
            <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-4">Dados da Conta</h3>
            <div className="space-y-3">
              <div>
                <label className="text-bat-text-muted text-xs block mb-1">E-mail</label>
                <input type="email" value={user?.email || ""} readOnly className="input-field text-sm opacity-60" />
              </div>
              <div>
                <label className="text-bat-text-muted text-xs block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-bat-text-muted text-xs block mb-1">Apelido (Nome de Guerra Público)</label>
                <input
                  type="text"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  className="input-field text-sm font-mono text-bat-gold-400"
                />
              </div>
            </div>

            <button
              onClick={handleSalvarPerfil}
              disabled={salvando}
              className="btn-primary mt-4 py-2.5 px-6 text-sm font-bold disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar Alterações ⚡"}
            </button>
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

          <p className="text-center text-bat-text-muted text-xs mt-6">
            BatCaverna v1.1.0
          </p>
        </div>
      )}
    </div>
  );
}
