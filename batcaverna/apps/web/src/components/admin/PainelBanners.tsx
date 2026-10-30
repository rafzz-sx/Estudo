"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

interface ConcursoBanner {
  id: string;
  sigla: string;
  nome: string;
  forca: string;
  imagem_fundo_url: string | null;
  frase_curta_card: string | null;
  cor_tema?: string | null;
  emoji?: string | null;
}

const PRESETS_LOCAIS: Record<string, string> = {
  ESA: "/images/concursos/esa.jpg",
  EEAR: "/images/concursos/eear.jpg",
  EsPCEx: "/images/concursos/espcex.jpg",
  EAM: "/images/concursos/eam.jpg",
  CN: "/images/concursos/cn.jpg",
  EPCAR: "/images/concursos/epcar.jpg",
  ENEM: "/images/concursos/enem.jpg",
  AFA: "/images/concursos/afa.jpg",
  EFOMM: "/images/concursos/efomm.jpg",
};

export function PainelBanners() {
  const [banners, setBanners] = useState<ConcursoBanner[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<ConcursoBanner | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [fraseInput, setFraseInput] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);

  const carregarBanners = async () => {
    setCarregando(true);
    try {
      const res = await fetchWithAuth("/api/admin/banners");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBanners(json.data);
      }
    } catch {
      setAviso({ tipo: "erro", msg: "Falha de conexão ao carregar banners." });
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarBanners();
  }, []);

  const abrirEdicao = (b: ConcursoBanner) => {
    setEditando(b);
    setUrlInput(b.imagem_fundo_url || "");
    setFraseInput(b.frase_curta_card || "");
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;

    setSalvando(true);
    try {
      const res = await fetchWithAuth("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editando.id,
          imagem_fundo_url: urlInput.trim(),
          frase_curta_card: fraseInput.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAviso({ tipo: "ok", msg: json.mensagem || "Banner atualizado com sucesso!" });
        setBanners((prev) =>
          prev.map((item) => (item.id === editando.id ? { ...item, ...json.data } : item))
        );
        setEditando(null);
      } else {
        setAviso({ tipo: "erro", msg: json.error || "Erro ao salvar banner." });
      }
    } catch {
      setAviso({ tipo: "erro", msg: "Falha de comunicação com o servidor." });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ═══ CABEÇALHO ═══ */}
      <div className="bg-bat-bg-primary/80 border border-bat-border p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🖼️</span>
            <h2 className="heading text-xl text-bat-text">Gestão Tática de Banners & Capas</h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30">
              {banners.length} Concursos
            </span>
          </div>
          <p className="text-bat-text-secondary text-xs mt-1">
            Configure as artes de fundo, capas dos cards e frases de impacto dos concursos oficiais.
          </p>
        </div>

        <button
          onClick={carregarBanners}
          disabled={carregando}
          className="btn-secondary py-2 px-4 text-xs font-bold self-start sm:self-auto cursor-pointer"
        >
          {carregando ? "Carregando..." : "🔄 Atualizar"}
        </button>
      </div>

      {/* Alerta de Feedback */}
      {aviso && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border ${
            aviso.tipo === "ok"
              ? "bg-bat-success/10 border-bat-success/30 text-bat-success font-bold"
              : "bg-bat-error/10 border-bat-error/30 text-bat-error font-bold"
          }`}
        >
          <span>{aviso.msg}</span>
          <button
            onClick={() => setAviso(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Informativo de Formatos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 bg-bat-bg-card rounded-xl border border-bat-border flex items-center gap-3">
          <span className="text-2xl">🖼️</span>
          <div>
            <span className="text-xs font-bold text-bat-gold-400 block">Imagens Estáticas</span>
            <span className="text-[11px] text-bat-text-muted">PNG, JPG e WebP até 15MB.</span>
          </div>
        </div>
        <div className="p-3.5 bg-bat-bg-card rounded-xl border border-bat-border flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <span className="text-xs font-bold text-bat-purple-400 block">GIFs Animados</span>
            <span className="text-[11px] text-bat-text-muted">Loop contínuo nos cards e perfil.</span>
          </div>
        </div>
        <div className="p-3.5 bg-bat-bg-card rounded-xl border border-bat-border flex items-center gap-3">
          <span className="text-2xl">🎥</span>
          <div>
            <span className="text-xs font-bold text-emerald-400 block">Vídeos MP4 / WebM</span>
            <span className="text-[11px] text-bat-text-muted">Autoplay silencioso e responsivo.</span>
          </div>
        </div>
      </div>

      {/* ═══ GRID DE BANNERS ═══ */}
      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => {
            const isVideo = b.imagem_fundo_url?.endsWith(".mp4") || b.imagem_fundo_url?.endsWith(".webm");

            return (
              <div
                key={b.id}
                className="group relative rounded-2xl border border-bat-border overflow-hidden bg-bat-bg-card flex flex-col transition-all duration-300 hover:border-bat-gold-400/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
              >
                {/* Banner Preview Area */}
                <div className="relative h-36 w-full bg-bat-bg-primary overflow-hidden">
                  {b.imagem_fundo_url ? (
                    isVideo ? (
                      <video
                        src={b.imagem_fundo_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={b.imagem_fundo_url}
                        alt={b.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-bat-text-muted text-xs gap-1 bg-bat-bg-secondary/40">
                      <span className="text-2xl">📷</span>
                      <span>Sem imagem configurada</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bat-bg-card via-black/30 to-transparent" />

                  {/* Badge da Força / Sigla */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-bat-gold-400 border border-bat-gold-400/30 shadow">
                      {b.emoji ?? "⭐"} {b.sigla}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-bat-text-secondary backdrop-blur-md">
                      {b.forca}
                    </span>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-bat-text truncate">{b.nome}</h3>
                    <p className="text-xs text-bat-text-muted line-clamp-2 mt-0.5 italic">
                      "{b.frase_curta_card || "Nenhuma frase de impacto definida"}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-bat-border/50 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-bat-text-muted truncate max-w-[160px]">
                      {b.imagem_fundo_url ? b.imagem_fundo_url : "Padrão da plataforma"}
                    </span>
                    <button
                      type="button"
                      onClick={() => abrirEdicao(b)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-bat-gold-400/10 border border-bat-gold-400/40 text-bat-gold-400 hover:bg-bat-gold-400 hover:text-black transition-all cursor-pointer"
                    >
                      ✏️ Alterar Arte
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ MODAL DE EDIÇÃO DO BANNER ═══ */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-bat-bg-card border border-bat-gold-400/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-bat-border flex items-center justify-between bg-bat-bg-primary">
              <div>
                <h3 className="text-base font-bold text-bat-text flex items-center gap-2">
                  <span>🖼️</span> Configurar Banner: {editando.sigla}
                </h3>
                <p className="text-[11px] text-bat-text-muted">{editando.nome}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="w-8 h-8 rounded-full bg-bat-bg-secondary flex items-center justify-center text-xs text-bat-text-muted hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={salvarEdicao} className="p-6 space-y-4">
              {/* Live Preview no Modal */}
              <div className="h-32 rounded-xl border border-bat-border overflow-hidden relative bg-bat-bg-primary">
                {urlInput ? (
                  urlInput.endsWith(".mp4") || urlInput.endsWith(".webm") ? (
                    <video
                      src={urlInput}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={urlInput}
                      alt="Prévia"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-bat-text-muted text-xs">
                    Prévia do banner aparecerá aqui
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-xs font-bold text-white drop-shadow">
                    {editando.emoji ?? "⭐"} {editando.sigla} · {fraseInput || editando.nome}
                  </span>
                </div>
              </div>

              {/* Input URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-bat-text-secondary">
                    URL da Imagem, GIF ou Vídeo MP4
                  </label>
                  {PRESETS_LOCAIS[editando.sigla] && (
                    <button
                      type="button"
                      onClick={() => setUrlInput(PRESETS_LOCAIS[editando.sigla])}
                      className="text-[10px] text-bat-gold-400 hover:underline cursor-pointer"
                    >
                      Usar foto oficial padrão
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="https://exemplo.com/imagem.jpg ou /images/concursos/esa.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full input-field text-xs font-mono"
                />
              </div>

              {/* Input Frase Curta */}
              <div>
                <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                  Frase de Impacto do Concurso
                </label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Ex: Praças do Exército Brasileiro"
                  value={fraseInput}
                  onChange={(e) => setFraseInput(e.target.value)}
                  className="w-full input-field text-xs"
                />
              </div>

              <div className="pt-3 border-t border-bat-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  disabled={salvando}
                  className="btn-secondary py-2 px-4 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="btn-primary py-2 px-6 text-xs font-bold cursor-pointer shadow-[0_0_15px_rgba(245,197,24,0.3)]"
                >
                  {salvando ? "Salvando..." : "Salvar Banner 💾"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

