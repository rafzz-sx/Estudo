"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { AdicionarAmigoModal } from "@/components/AdicionarAmigoModal";

interface Mensagem {
  id: string;
  conversa_id: string;
  remetente_id: string;
  conteudo: string | null;
  tipo: "texto" | "audio" | "imagem";
  midia_url?: string | null;
  duracao_segundos?: number | null;
  enviado_em: string;
  sinalizada_para_revisao?: boolean;
  remetente?: {
    id: string;
    apelido: string;
    avatar_url: string | null;
  };
}

interface Conversa {
  id: string;
  amizade_id: string;
  user_1_id: string;
  user_2_id: string;
  atualizado_em: string;
  outro_usuario: {
    id: string;
    nome: string;
    apelido: string;
    avatar_url: string | null;
    nivel_atual: number;
    online: boolean;
    concurso: string;
  };
  ultima_mensagem?: string;
  nao_lidas: number;
}

export default function ChatPage() {
  const { user } = useAuthStore();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtivaId, setConversaAtivaId] = useState<string>("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [textoMensagem, setTextoMensagem] = useState("");
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [visible, setVisible] = useState(false);
  const [loadingConversas, setLoadingConversas] = useState(true);
  const [loadingMensagens, setLoadingMensagens] = useState(false);
  const [modalAmigoAberto, setModalAmigoAberto] = useState(false);

  // Áudio: gravação
  const [gravandoAudio, setGravandoAudio] = useState(false);
  const [tempoGravacao, setTempoGravacao] = useState(0);
  const [audioUrlPreview, setAudioUrlPreview] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const gravacaoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Imagem: upload e Lightbox
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Carregar conversas do backend real e verificar parâmetro ?amigo=
  const carregarConversas = async () => {
    try {
      const res = await fetch("/api/chat/conversas");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const lista = json.data;
          setConversas(lista);

          // Verificar parâmetro ?amigo= na URL
          const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
          const amigoTarget = urlParams?.get("amigo");

          if (amigoTarget) {
            const existente = lista.find((c: any) => c.outro_usuario?.id === amigoTarget);
            if (existente) {
              setConversaAtivaId(existente.id);
            } else {
              // Criar conversa com o amigo se ainda não existir
              try {
                const cRes = await fetch("/api/chat/conversas", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ target_user_id: amigoTarget }),
                });
                if (cRes.ok) {
                  const cJson = await cRes.json();
                  if (cJson.success && cJson.data) {
                    setConversaAtivaId(cJson.data.id);
                    // Recarregar lista para incluir dados do outro usuário
                    const recarregarRes = await fetch("/api/chat/conversas");
                    if (recarregarRes.ok) {
                      const recJson = await recarregarRes.json();
                      if (recJson.success) setConversas(recJson.data || []);
                    }
                  }
                }
              } catch {}
            }
          } else if (lista.length > 0 && !conversaAtivaId) {
            setConversaAtivaId(lista[0].id);
          }
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar conversas:", e);
    } finally {
      setLoadingConversas(false);
    }
  };

  // 2. Carregar mensagens da conversa ativa
  const carregarMensagens = async (convId: string) => {
    if (!convId) return;
    setLoadingMensagens(true);
    try {
      const res = await fetch(`/api/chat/mensagens?conversa_id=${convId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMensagens(json.data);
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar mensagens:", e);
    } finally {
      setLoadingMensagens(false);
    }
  };

  useEffect(() => {
    setVisible(true);
    carregarConversas();
  }, []);

  useEffect(() => {
    if (conversaAtivaId) {
      carregarMensagens(conversaAtivaId);
    }
  }, [conversaAtivaId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const conversaAtiva = conversas.find((c) => c.id === conversaAtivaId);

  // ─── Gravação de Áudio via MediaRecorder ───────────────────────
  const iniciarGravacaoAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrlPreview(reader.result as string);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setGravandoAudio(true);
      setTempoGravacao(0);

      gravacaoTimerRef.current = setInterval(() => {
        setTempoGravacao((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Permissão para microfone não concedida ou dispositivo indisponível.");
    }
  };

  const pararGravacaoAudio = () => {
    if (mediaRecorderRef.current && gravandoAudio) {
      mediaRecorderRef.current.stop();
      setGravandoAudio(false);
      if (gravacaoTimerRef.current) clearInterval(gravacaoTimerRef.current);
    }
  };

  const cancelarAudio = () => {
    setAudioUrlPreview(null);
    setTempoGravacao(0);
  };

  // ─── Seleção de Foto ──────────────────────────────────────────
  const handleSelecionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagemPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Enviar Mensagem (Texto, Áudio ou Foto) ────────────────────
  const handleEnviar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!conversaAtiva) return;

    let payload: any = {
      conversa_id: conversaAtiva.id,
    };

    if (audioUrlPreview) {
      payload.tipo = "audio";
      payload.midia_url = audioUrlPreview;
      payload.duracao_segundos = tempoGravacao || 1;
      payload.conteudo = "Mensagem de áudio";
    } else if (imagemPreview) {
      payload.tipo = "imagem";
      payload.midia_url = imagemPreview;
      payload.conteudo = textoMensagem.trim() || "Foto enviada";
    } else if (textoMensagem.trim()) {
      payload.tipo = "texto";
      payload.conteudo = textoMensagem.trim();
    } else {
      return;
    }

    try {
      const res = await fetch("/api/chat/mensagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setMensagens((prev) => [...prev, json.data]);
          setTextoMensagem("");
          setAudioUrlPreview(null);
          setImagemPreview(null);
          setTempoGravacao(0);

          // Atualizar lista de conversas
          setConversas((prev) =>
            prev.map((c) =>
              c.id === conversaAtiva.id
                ? {
                    ...c,
                    ultima_mensagem:
                      payload.tipo === "audio"
                        ? "🎤 Áudio"
                        : payload.tipo === "imagem"
                        ? "📷 Foto"
                        : payload.conteudo,
                  }
                : c
            )
          );
        }
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const conversasFiltradas = conversas.filter(
    (c) =>
      c.outro_usuario.apelido.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
      c.outro_usuario.nome?.toLowerCase().includes(buscaUsuario.toLowerCase())
  );

  return (
    <div className={`space-y-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ MODAL DE ADICIONAR AMIGO POR APELIDO ═══ */}
      <AdicionarAmigoModal
        isOpen={modalAmigoAberto}
        onClose={() => setModalAmigoAberto(false)}
        onSuccess={() => carregarConversas()}
      />

      {/* ═══ LIGHTBOX FULLSCREEN PARA FOTOS ═══ */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Foto expandida"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* ═══ CABEÇALHO DO CHAT ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-bat-bg-secondary border border-bat-border hover:border-[#F5C518]/40 hover:text-[#F5C518] text-bat-text-muted transition-all no-underline text-lg"
              title="Voltar para a Dashboard"
            >
              ←
            </Link>
            <h1 className="heading text-3xl text-bat-text">💬 Comunicação Tática</h1>
            <span className="text-[10px] font-bold text-bat-gold-400 bg-bat-gold-400/10 border border-bat-gold-400/20 px-2 py-0.5 rounded-lg tracking-wider">
              CHAT MULTIMÍDIA
            </span>
          </div>
          <p className="text-bat-text-secondary text-sm ml-12">
            Mensagens criptografadas, áudios de voz e fotos exclusivas entre soldados amigos.
          </p>
        </div>

        <button
          onClick={() => setModalAmigoAberto(true)}
          className="btn-primary py-2.5 px-5 text-xs font-bold self-start sm:self-auto flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <span>👥</span>
          <span>+ Adicionar Amigo por Apelido</span>
        </button>
      </div>

      {/* ═══ PAINEL DO CHAT (SIDEBAR + MENSAGENS) ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] shadow-2xl">
        
        {/* ── Coluna Esquerda: Lista de Conversas (4 colunas) ── */}
        <div className="lg:col-span-4 border-r border-bat-border flex flex-col bg-bat-bg-card/70">
          
          {/* Busca */}
          <div className="p-4 border-b border-bat-border/50">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar amigo por apelido..."
                value={buscaUsuario}
                onChange={(e) => setBuscaUsuario(e.target.value)}
                className="w-full bg-bat-bg-primary border border-bat-border rounded-xl px-4 py-2.5 text-xs text-bat-text placeholder:text-bat-text-muted focus:border-bat-gold-400/60 focus:outline-none transition-all"
              />
              <span className="absolute right-3 top-2.5 text-xs text-bat-text-muted">🔍</span>
            </div>
          </div>

          {/* Lista de Contatos */}
          <div className="flex-1 overflow-y-auto divide-y divide-bat-border/30">
            {loadingConversas ? (
              <div className="p-8 text-center text-bat-text-muted text-xs">
                <span className="text-2xl block mb-2 animate-pulse">🦇</span>
                Carregando seus amigos...
              </div>
            ) : conversasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-bat-text-muted text-xs">
                <span className="text-3xl block mb-3">👥</span>
                <p className="font-bold text-bat-text mb-1">Nenhuma conversa ainda</p>
                <p className="mb-4">O chat é desbloqueado exclusivamente entre amigos confirmados.</p>
                <button
                  onClick={() => setModalAmigoAberto(true)}
                  className="btn-primary inline-block py-2.5 px-5 text-xs font-bold cursor-pointer"
                >
                  + Conectar Soldado por Apelido ⚡
                </button>
              </div>
            ) : (
              conversasFiltradas.map((conv) => {
                const ativa = conv.id === conversaAtivaId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setConversaAtivaId(conv.id);
                      setConversas((prev) =>
                        prev.map((c) => (c.id === conv.id ? { ...c, nao_lidas: 0 } : c))
                      );
                    }}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-all cursor-pointer ${
                      ativa
                        ? "bg-bat-gold-400/10 border-l-4 border-bat-gold-400"
                        : "hover:bg-bat-bg-tertiary/40"
                    }`}
                  >
                    {/* Avatar com status online */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-bat-bg-tertiary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 text-base overflow-hidden">
                        {conv.outro_usuario.avatar_url ? (
                          <img
                            src={conv.outro_usuario.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          conv.outro_usuario.apelido[0]?.toUpperCase()
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-bat-bg-card" />
                    </div>

                    {/* Dados do usuário */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-sm font-semibold text-bat-text truncate">
                          {conv.outro_usuario.apelido}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bat-bg-primary text-bat-gold-400 border border-bat-gold-400/20 font-mono">
                          Nv. {conv.outro_usuario.nivel_atual}
                        </span>
                      </div>
                      <p className="text-xs text-bat-text-muted truncate">
                        {conv.ultima_mensagem || "Inicie a conversa..."}
                      </p>
                    </div>

                    {/* Contador de não lidas */}
                    {conv.nao_lidas > 0 && (
                      <span className="w-5 h-5 rounded-full bg-bat-gold-400 text-[10px] font-bold text-black flex items-center justify-center flex-shrink-0">
                        {conv.nao_lidas}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Coluna Direita: Thread da Conversa (8 colunas) ── */}
        <div className="lg:col-span-8 flex flex-col bg-bat-bg-primary/40">
          {conversaAtiva ? (
            <>
              {/* Header do Chat Ativo */}
              <div className="p-4 border-b border-bat-border flex items-center justify-between bg-bat-bg-card/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bat-bg-tertiary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 overflow-hidden">
                    {conversaAtiva.outro_usuario.avatar_url ? (
                      <img
                        src={conversaAtiva.outro_usuario.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      conversaAtiva.outro_usuario.apelido[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-bat-text">
                        {conversaAtiva.outro_usuario.apelido}
                      </h3>
                      {conversaAtiva.outro_usuario.nome && (
                        <span className="text-[10px] text-bat-text-muted">
                          ({conversaAtiva.outro_usuario.nome})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-bat-text-secondary flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Online · Nível {conversaAtiva.outro_usuario.nivel_atual} · Amigo Oficial
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-bat-text-muted bg-bat-bg-primary px-3 py-1 rounded-lg border border-bat-border">
                    🔒 Criptografado Ponta a Ponta
                  </span>
                </div>
              </div>

              {/* Mensagens Roláveis */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 min-h-[400px]">
                {loadingMensagens ? (
                  <div className="p-8 text-center text-bat-text-muted text-xs">
                    Carregando mensagens...
                  </div>
                ) : mensagens.length === 0 ? (
                  <div className="p-12 text-center text-bat-text-muted text-xs">
                    <span className="text-3xl block mb-2">💬</span>
                    Envie a primeira mensagem, foto ou áudio para {conversaAtiva.outro_usuario.apelido}!
                  </div>
                ) : (
                  mensagens.map((msg) => {
                    const souEu = msg.remetente_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${souEu ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-end gap-2 max-w-[85%]">
                          {!souEu && (
                            <div className="w-7 h-7 rounded-lg bg-bat-bg-tertiary border border-bat-border flex items-center justify-center text-xs font-bold text-bat-gold-400 flex-shrink-0 overflow-hidden">
                              {msg.remetente?.avatar_url ? (
                                <img
                                  src={msg.remetente.avatar_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                msg.remetente?.apelido[0]?.toUpperCase() || "S"
                              )}
                            </div>
                          )}

                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              souEu
                                ? "bg-bat-gold-400 text-black font-medium rounded-br-none shadow-lg shadow-bat-gold-400/10"
                                : "bg-bat-bg-card border border-bat-border text-bat-text rounded-bl-none"
                            }`}
                          >
                            {!souEu && (
                              <p className="text-[10px] font-bold text-bat-gold-400 mb-1">
                                {msg.remetente?.apelido}
                              </p>
                            )}

                            {/* Conteúdo de Texto */}
                            {msg.tipo === "texto" && <p>{msg.conteudo}</p>}

                            {/* Conteúdo de Áudio */}
                            {msg.tipo === "audio" && msg.midia_url && (
                              <div className="flex items-center gap-2.5 py-1">
                                <span className="text-xl">🎤</span>
                                <audio
                                  controls
                                  src={msg.midia_url}
                                  className="h-8 max-w-[220px]"
                                />
                                {msg.duracao_segundos && (
                                  <span className="text-[10px] font-mono opacity-80">
                                    {msg.duracao_segundos}s
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Conteúdo de Imagem */}
                            {msg.tipo === "imagem" && msg.midia_url && (
                              <div className="space-y-1.5">
                                <img
                                  src={msg.midia_url}
                                  alt="Foto anexada"
                                  onClick={() => setLightboxUrl(msg.midia_url || null)}
                                  className="max-h-56 rounded-xl object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                                />
                                {msg.conteudo && msg.conteudo !== "Foto enviada" && (
                                  <p className="mt-1">{msg.conteudo}</p>
                                )}
                              </div>
                            )}

                            {msg.sinalizada_para_revisao && (
                              <span className="text-[9px] block text-red-500 font-bold mt-1">
                                ⚠️ Conteúdo em moderação
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] text-bat-text-muted mt-1 px-1">
                          {new Date(msg.enviado_em).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ═══ PREVIEWS DE MÍDIA ANTES DO ENVIO ═══ */}
              {audioUrlPreview && (
                <div className="p-3 bg-bat-bg-secondary border-t border-bat-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎤</span>
                    <audio controls src={audioUrlPreview} className="h-8" />
                    <span className="text-xs text-bat-text-muted font-mono">{tempoGravacao}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cancelarAudio}
                      className="text-xs text-bat-error hover:underline cursor-pointer"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={() => handleEnviar()}
                      className="btn-primary py-1.5 px-4 text-xs font-bold"
                    >
                      Enviar Áudio ⚡
                    </button>
                  </div>
                </div>
              )}

              {imagemPreview && (
                <div className="p-3 bg-bat-bg-secondary border-t border-bat-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={imagemPreview}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-bat-border"
                    />
                    <span className="text-xs text-bat-text">Foto selecionada para envio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setImagemPreview(null)}
                      className="text-xs text-bat-error hover:underline cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}

              {/* ═══ INPUT DE ENVIO COM BOTÕES DE ÁUDIO E FOTO ═══ */}
              <form onSubmit={handleEnviar} className="p-4 border-t border-bat-border bg-bat-bg-card/90 flex items-center gap-2">
                {/* Input oculto de foto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleSelecionarFoto}
                />

                {/* Botão de anexar foto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-bat-bg-primary border border-bat-border text-bat-text-muted hover:text-bat-gold-400 hover:border-bat-gold-400/40 transition-all cursor-pointer"
                  title="Enviar Foto"
                >
                  📷
                </button>

                {/* Botão de gravação de áudio */}
                {gravandoAudio ? (
                  <button
                    type="button"
                    onClick={pararGravacaoAudio}
                    className="py-2.5 px-4 rounded-xl bg-bat-error text-white text-xs font-bold animate-pulse flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⏹️</span>
                    <span>Parar ({tempoGravacao}s)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={iniciarGravacaoAudio}
                    className="p-2.5 rounded-xl bg-bat-bg-primary border border-bat-border text-bat-text-muted hover:text-bat-gold-400 hover:border-bat-gold-400/40 transition-all cursor-pointer"
                    title="Gravar Áudio de Voz"
                  >
                    🎤
                  </button>
                )}

                {/* Campo de texto */}
                <input
                  type="text"
                  placeholder={`Mensagem para ${conversaAtiva.outro_usuario.apelido}...`}
                  value={textoMensagem}
                  onChange={(e) => setTextoMensagem(e.target.value)}
                  className="flex-1 bg-bat-bg-primary border border-bat-border rounded-xl px-4 py-3 text-xs text-bat-text placeholder:text-bat-text-muted focus:border-bat-gold-400/60 focus:outline-none transition-all"
                />

                <button
                  type="submit"
                  disabled={!textoMensagem.trim() && !imagemPreview && !audioUrlPreview}
                  className="btn-primary px-6 py-3 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <span>Enviar</span>
                  <span>⚡</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-bat-text-muted">
              Selecione uma conversa ao lado para iniciar o chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
