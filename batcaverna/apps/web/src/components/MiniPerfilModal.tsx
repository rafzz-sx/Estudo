"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calcularNivel } from "@batcaverna/utils";

interface MiniPerfilData {
  id: string;
  nome: string;
  apelido: string;
  avatar_url: string | null;
  banner_url: string | null;
  banner_tipo?: string;
  bio: string | null;
  nivel_atual: number;
  xp_total: number;
  streak_dias: number;
  concursos_favoritos?: string[];
  categoria_escrita?: string | null;
  amizade_status?: string | null;
  amizade_id?: string | null;
}

const BRASOES_CONCURSOS: Record<string, string> = {
  EEAR: "✈️",
  ESA: "⭐",
  EAM: "⚓",
  CN: "🚢",
  EPCAR: "🛩️",
  ESPCEX: "🎖️",
  EFOMM: "🌊",
  IME: "🔬",
  ENEM: "📚",
};

export function MiniPerfilModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [dados, setDados] = useState<MiniPerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [solicitando, setSolicitando] = useState(false);
  const [statusAmizade, setStatusAmizade] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/usuarios/${userId}/mini-perfil`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setDados(json.data);
            setStatusAmizade(json.data.amizade_status || null);
          }
        }
      } catch (e) {
        console.warn("Erro ao carregar mini perfil:", e);
      } finally {
        setLoading(false);
      }
    };
    if (userId) carregar();
  }, [userId]);

  const handleSolicitarAmizade = async () => {
    if (!dados) return;
    setSolicitando(true);
    try {
      const res = await fetch("/api/amizades/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id_destinatario: dados.id }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatusAmizade("pendente");
      }
    } catch {}
    finally {
      setSolicitando(false);
    }
  };

  const handleIrParaChat = () => {
    onClose();
    if (dados?.id) {
      router.push(`/chat?amigo=${dados.id}`);
    } else {
      router.push("/chat");
    }
  };

  if (!userId) return null;

  const nivelInfo = calcularNivel(dados?.xp_total || 0);
  const isVideo = dados?.banner_tipo === "video" || dados?.banner_url?.endsWith(".mp4");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-bat-bg-card border-2 border-bat-gold-400/40 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
        >
          ✕
        </button>

        {loading ? (
          <div className="p-16 text-center text-bat-text-muted">
            <span className="text-3xl block mb-2 animate-pulse">🦇</span>
            Carregando perfil do soldado...
          </div>
        ) : dados ? (
          <div>
            {/* ═══ BANNER AUTO-AJUSTÁVEL ═══ */}
            <div className="aspect-[3/1] min-h-[120px] max-h-[180px] bg-bat-bg-secondary relative overflow-hidden flex items-center justify-center">
              {dados.banner_url ? (
                isVideo ? (
                  <>
                    <video
                      src={dados.banner_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none"
                    />
                    <video
                      src={dados.banner_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="relative z-10 w-full h-full object-contain"
                    />
                  </>
                ) : (
                  <>
                    <img
                      src={dados.banner_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none"
                    />
                    <img
                      src={dados.banner_url}
                      alt=""
                      className="relative z-10 w-full h-full object-contain"
                    />
                  </>
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-bat-gold-400/20 via-bat-purple-900/40 to-bat-bg-card" />
              )}
            </div>

            {/* ═══ CONTEÚDO PRINCIPAL ═══ */}
            <div className="p-6 pt-0 relative">
              {/* Avatar sobreposto */}
              <div className="-mt-12 mb-3 flex items-end justify-between">
                <div className="w-20 h-20 rounded-2xl bg-bat-bg-card border-4 border-bat-bg-card shadow-xl overflow-hidden flex items-center justify-center text-bat-gold-400 text-2xl font-bold bg-bat-bg-secondary">
                  {dados.avatar_url ? (
                    <img src={dados.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    dados.apelido[0]?.toUpperCase()
                  )}
                </div>

                {/* Botão de Amizade / Chat */}
                <div>
                  {statusAmizade === "aceita" ? (
                    <button
                      onClick={handleIrParaChat}
                      className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>💬</span>
                      <span>Conversar</span>
                    </button>
                  ) : statusAmizade === "pendente" ? (
                    <span className="px-3 py-1.5 rounded-xl bg-bat-bg-secondary border border-bat-border text-bat-text-muted text-xs font-medium">
                      ⏳ Solicitação Enviada
                    </span>
                  ) : (
                    <button
                      onClick={handleSolicitarAmizade}
                      disabled={solicitando}
                      className="py-2 px-4 rounded-xl bg-bat-gold-400/15 border border-bat-gold-400/40 hover:bg-bat-gold-400/25 text-bat-gold-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>👥</span>
                      <span>{solicitando ? "Enviando..." : "Adicionar Amigo"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Nome e Apelido */}
              <div className="mb-3">
                <h3 className="heading text-xl font-bold text-bat-text flex items-center gap-2">
                  <span>{dados.apelido}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-bat-gold-400/20 text-bat-gold-400 font-mono">
                    Nv. {nivelInfo.nivel}
                  </span>
                </h3>
                <p className="text-xs text-bat-gold-400 font-medium">{nivelInfo.titulo}</p>
                {dados.nome && <p className="text-xs text-bat-text-muted mt-0.5">{dados.nome}</p>}
              </div>

              {/* Bio */}
              {dados.bio && (
                <p className="text-xs text-bat-text-secondary bg-bat-bg-secondary/60 p-3 rounded-xl border border-bat-border mb-4 leading-relaxed">
                  "{dados.bio}"
                </p>
              )}

              {/* Concursos Favoritos */}
              {dados.concursos_favoritos && dados.concursos_favoritos.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-bat-text-muted tracking-wider block mb-1.5">
                    Alvo Militar
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dados.concursos_favoritos.map((item: any, idx: number) => {
                      const siglaStr = typeof item === "string" ? item : item?.sigla || "";
                      if (!siglaStr) return null;
                      return (
                        <span
                          key={siglaStr + idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bat-bg-secondary border border-bat-border text-bat-text text-xs font-bold"
                        >
                          <span>{BRASOES_CONCURSOS[siglaStr.toUpperCase()] || "🎯"}</span>
                          <span>{siglaStr.toUpperCase()}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Categoria Personalizada ("Escrito") */}
              {dados.categoria_escrita && (
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-bat-text-muted tracking-wider block mb-1">
                    Lema / Categoria
                  </span>
                  <p className="text-xs font-mono text-bat-purple-300 bg-bat-purple-950/30 border border-bat-purple-800/40 px-3 py-1.5 rounded-lg inline-block">
                    🏷️ {dados.categoria_escrita}
                  </p>
                </div>
              )}

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-bat-border/50 text-center">
                <div className="p-2.5 rounded-xl bg-bat-bg-secondary/40 border border-bat-border">
                  <p className="heading text-base font-bold text-bat-gold-400">{dados.streak_dias || 0} dias</p>
                  <p className="text-[10px] text-bat-text-muted">Streak Contínuo</p>
                </div>
                <div className="p-2.5 rounded-xl bg-bat-bg-secondary/40 border border-bat-border">
                  <p className="heading text-base font-bold text-bat-text">{dados.xp_total.toLocaleString("pt-BR")} XP</p>
                  <p className="text-[10px] text-bat-text-muted">Experiência Total</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-bat-text-muted text-xs">
            Soldado não encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
