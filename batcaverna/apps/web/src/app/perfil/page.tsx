"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { calcularNivel, formatarDataHoraVersao } from "@batcaverna/utils";

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

const BANNER_ACCEPT = "image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm";
const AVATAR_ACCEPT = "image/png,image/jpeg,image/gif,image/webp";
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const TODOS_CONCURSOS = [
  { sigla: "EEAR", emoji: "✈️", nome: "Aeronáutica" },
  { sigla: "ESA", emoji: "⭐", nome: "Exército" },
  { sigla: "EAM", emoji: "⚓", nome: "Marinha" },
  { sigla: "CN", emoji: "🚢", nome: "Colégio Naval" },
  { sigla: "EPCAR", emoji: "🛩️", nome: "Cadetes do Ar" },
  { sigla: "ESPCEX", emoji: "🎖️", nome: "EsPCEx" },
  { sigla: "EFOMM", emoji: "🌊", nome: "Marinha Mercante" },
  { sigla: "IME", emoji: "🔬", nome: "Engenharia Militar" },
  { sigla: "ENEM", emoji: "📚", nome: "Exame Nacional" },
];

type TabPerfil = "visao_geral" | "amigos" | "badges" | "config";

export default function PerfilPage() {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<TabPerfil>("visao_geral");
  const [editandoBio, setEditandoBio] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [msgFeedback, setMsgFeedback] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [tempoTotalEstudo, setTempoTotalEstudo] = useState(0);

  // Amigos
  const [amigos, setAmigos] = useState<any[]>([]);
  const [pendentesRecebidas, setPendentesRecebidas] = useState<any[]>([]);
  const [pendentesEnviadas, setPendentesEnviadas] = useState<any[]>([]);

  // Concursos favoritos e categoria escrita
  const [concursosFavoritos, setConcursosFavoritos] = useState<string[]>([]);
  const [categoriaEscrita, setCategoriaEscrita] = useState<string>("");
  const [ocultarRanking, setOcultarRanking] = useState(false);

  // Informações de Versão do App
  const [appInfo, setAppInfo] = useState<{ versao_atual: string; atualizado_em: string }>({
    versao_atual: "1.1.0",
    atualizado_em: new Date().toISOString(),
  });

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

  // 1. Carregar perfil completo
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

  // 2. Carregar amigos, favoritos, categoria e versão
  const carregarDadosAdicionais = async () => {
    try {
      const [resAmigos, resFav, resCat, resPriv, resApp] = await Promise.all([
        fetch("/api/usuarios/me/amigos"),
        fetch("/api/usuarios/me/concursos-favoritos"),
        fetch("/api/usuarios/me/categoria-escrita"),
        fetch("/api/usuarios/me/privacidade/ranking"),
        fetch("/api/app-info"),
      ]);

      if (resAmigos.ok) {
        const json = await resAmigos.json();
        if (json.success) {
          setAmigos(json.data.amigos || []);
          setPendentesRecebidas(json.data.pendentes_recebidas || []);
          setPendentesEnviadas(json.data.pendentes_enviadas || []);
        }
      }
      if (resFav.ok) {
        const json = await resFav.json();
        if (json.success) setConcursosFavoritos(json.data || []);
      }
      if (resCat.ok) {
        const json = await resCat.json();
        if (json.success) setCategoriaEscrita(json.data || "");
      }
      if (resPriv.ok) {
        const json = await resPriv.json();
        if (json.success) setOcultarRanking(json.data.ocultar_do_ranking || false);
      }
      if (resApp.ok) {
        const json = await resApp.json();
        if (json.success) setAppInfo(json.data);
      }
    } catch (e) {
      console.warn("Erro ao carregar dados complementares:", e);
    }
  };

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    carregarPerfil();
    carregarDadosAdicionais();
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

  useEffect(() => {
    if (bannerPreview) {
      setBannerIsVideo(
        bannerPreview.endsWith(".mp4") ||
        bannerPreview.endsWith(".webm") ||
        bannerPreview.startsWith("data:video/")
      );
    }
  }, [bannerPreview]);

  // Upload Foto e Banner
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

  // Salvar Informações de Texto
  const handleSalvarPerfil = async () => {
    setSalvando(true);
    setMsgFeedback(null);
    try {
      const [resUser, resFav, resCat, resPriv] = await Promise.all([
        fetch("/api/usuarios/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome,
            apelido,
            bio,
            avatar_url: avatarPreview,
            banner_url: bannerPreview,
          }),
        }),
        fetch("/api/usuarios/me/concursos-favoritos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ concursos: concursosFavoritos }),
        }),
        fetch("/api/usuarios/me/categoria-escrita", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoria: categoriaEscrita }),
        }),
        fetch("/api/usuarios/me/privacidade/ranking", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ocultar_do_ranking: ocultarRanking }),
        }),
      ]);

      const json = await resUser.json();
      if (resUser.ok && json.success) {
        updateUser(json.data);
        setMsgFeedback("✓ Perfil, concursos e preferências salvas com sucesso!");
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

  // Responder Amizade (Aceitar / Recusar)
  const handleResponderAmizade = async (amizadeId: string, acao: "aceitar" | "recusar") => {
    try {
      const res = await fetch(`/api/amizades/${amizadeId}/responder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });
      if (res.ok) {
        carregarDadosAdicionais();
      }
    } catch {}
  };

  // Alternar Concurso Favorito
  const toggleConcursoFavorito = (sigla: string) => {
    setConcursosFavoritos((prev) =>
      prev.includes(sigla) ? prev.filter((s) => s !== sigla) : [...prev, sigla]
    );
  };

  const nivelInfo = calcularNivel(user?.xp_total ?? 0);
  const nivel = nivelInfo.nivel;
  const streak = user?.streak_dias ?? 0;
  const titulo = nivelInfo.titulo;
  const displayApelido = user?.apelido || apelido || "Soldado";
  const displayNome = user?.nome || nome || "";

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ BANNER + AVATAR ═══ */}
      <div className="relative mb-16">
        {/* Banner */}
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

        {/* Avatar */}
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
      <div className="flex gap-1 bg-bat-bg-card border border-bat-border rounded-xl p-1 mb-6 w-fit flex-wrap">
        {[
          { key: "visao_geral", label: "Visão Geral" },
          { key: "amigos", label: `👥 Amigos (${amigos.length})` },
          { key: "badges", label: "Badges" },
          { key: "config", label: "Configurações" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as TabPerfil)}
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
              <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-3">Concursos Alvo</h3>
              {concursosFavoritos.length === 0 ? (
                <p className="text-bat-text-muted text-sm">Nenhum concurso selecionado. Vá em Configurações para escolher seus alvos.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {concursosFavoritos.map((sigla) => {
                    const c = TODOS_CONCURSOS.find((x) => x.sigla === sigla);
                    return (
                      <span
                        key={sigla}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bat-bg-secondary border border-bat-border text-bat-text text-xs font-bold"
                      >
                        <span>{c?.emoji || "🎯"}</span>
                        <span>{sigla}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-3">Lema / Categoria Escrita</h3>
              <p className="text-bat-text text-sm font-mono text-bat-gold-400">
                {categoriaEscrita || titulo}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ABA: AMIGOS ═══ */}
      {tab === "amigos" && (
        <div className="space-y-6">
          {/* Solicitações Recebidas Pendentes */}
          {pendentesRecebidas.length > 0 && (
            <div className="bg-bat-bg-card border border-bat-gold-400/40 rounded-2xl p-5 space-y-3 shadow-lg">
              <h3 className="heading text-sm font-bold text-bat-gold-400 uppercase tracking-wider flex items-center gap-2">
                <span>📬</span>
                <span>Solicitações de Amizade Recebidas ({pendentesRecebidas.length})</span>
              </h3>
              <div className="divide-y divide-bat-border/50">
                {pendentesRecebidas.map((req) => (
                  <div key={req.amizade_id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-bat-bg-secondary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 overflow-hidden">
                        {req.usuario?.avatar_url ? (
                          <img src={req.usuario.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          req.usuario?.apelido?.[0]?.toUpperCase() || "S"
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-bat-text">{req.usuario?.apelido}</p>
                        <p className="text-xs text-bat-text-muted">Nível {req.usuario?.nivel_atual || 1}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResponderAmizade(req.amizade_id, "aceitar")}
                        className="btn-primary py-1.5 px-4 text-xs font-bold"
                      >
                        ✓ Aceitar
                      </button>
                      <button
                        onClick={() => handleResponderAmizade(req.amizade_id, "recusar")}
                        className="py-1.5 px-3 rounded-xl bg-bat-bg-secondary border border-bat-border text-bat-text-muted hover:text-bat-error text-xs cursor-pointer"
                      >
                        ✕ Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Amigos Confirmados */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="heading text-base text-bat-text font-bold">Seu Esquadrão de Amigos</h3>
                <p className="text-xs text-bat-text-secondary">Soldados com quem você pode trocar mensagens, áudios e bizus.</p>
              </div>
              <Link href="/ranking" className="btn-primary py-2 px-4 text-xs font-bold no-underline">
                + Adicionar no Ranking
              </Link>
            </div>

            {amigos.length === 0 ? (
              <div className="p-10 text-center text-bat-text-muted text-xs">
                <span className="text-4xl block mb-2">🦇</span>
                Você ainda não adicionou nenhum amigo. Visite o Ranking e convide soldados para seu esquadrão!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {amigos.map((a) => (
                  <div
                    key={a.amizade_id}
                    className="p-4 rounded-xl bg-bat-bg-primary border border-bat-border flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-bat-bg-secondary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 overflow-hidden flex-shrink-0">
                        {a.usuario?.avatar_url ? (
                          <img src={a.usuario.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          a.usuario?.apelido?.[0]?.toUpperCase() || "S"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-bat-text truncate">{a.usuario?.apelido}</p>
                        <p className="text-xs text-bat-text-muted">Nível {a.usuario?.nivel_atual || 1}</p>
                      </div>
                    </div>

                    <Link
                      href={a.usuario?.id ? `/chat?amigo=${a.usuario.id}` : "/chat"}
                      className="p-2 rounded-xl bg-bat-gold-400/15 border border-bat-gold-400/30 text-bat-gold-400 hover:bg-bat-gold-400/25 transition-all text-xs font-bold no-underline flex-shrink-0"
                    >
                      💬 Chat
                    </Link>
                  </div>
                ))}
              </div>
            )}
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
        <div className="space-y-6 max-w-2xl">
          {/* Concursos Favoritos */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 space-y-3">
            <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider">
              Concursos Favoritos (Alvos de Estudo)
            </h3>
            <p className="text-xs text-bat-text-muted">
              Selecione os concursos que serão destacados no seu perfil e no Mini Perfil do ranking.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {TODOS_CONCURSOS.map((c) => {
                const ativo = concursosFavoritos.includes(c.sigla);
                return (
                  <button
                    key={c.sigla}
                    type="button"
                    onClick={() => toggleConcursoFavorito(c.sigla)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      ativo
                        ? "bg-bat-gold-400/20 border-bat-gold-400 text-bat-gold-400 shadow-[0_0_10px_rgba(245,197,24,0.2)]"
                        : "bg-bat-bg-secondary border-bat-border text-bat-text-muted hover:text-bat-text"
                    }`}
                  >
                    <span className="text-lg">{c.emoji}</span>
                    <span>{c.sigla}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categoria / Lema Escrito */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 space-y-3">
            <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider">
              Categoria / Lema Personalizado ("Escrito")
            </h3>
            <input
              type="text"
              value={categoriaEscrita}
              onChange={(e) => setCategoriaEscrita(e.target.value.slice(0, 100))}
              placeholder="Ex: Focado na AFA 2026, Caveira da Infantaria..."
              className="input-field text-sm font-mono text-bat-gold-400"
            />
          </div>

          {/* Privacidade no Ranking */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="heading text-sm text-bat-text font-bold">Ocultar do Ranking Público</h3>
              <p className="text-xs text-bat-text-muted mt-0.5">
                Se ativado, seu perfil não aparecerá na classificação geral pública da BatCaverna.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOcultarRanking(!ocultarRanking)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                ocultarRanking ? "bg-bat-gold-400" : "bg-bat-border"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                  ocultarRanking ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Dados da Conta */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 space-y-4">
            <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider">Dados Pessoais</h3>
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

          {/* Rodapé Dinâmico de Versão */}
          <p className="text-center text-bat-text-muted text-xs mt-6">
            BatCaverna v{appInfo.versao_atual} · Atualizado em {formatarDataHoraVersao(appInfo.atualizado_em)}
          </p>
        </div>
      )}
    </div>
  );
}
