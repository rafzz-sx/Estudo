"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";
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
  tipo?: 'direta' | 'grupo';
  amizade_id?: string;
  user_1_id?: string;
  user_2_id?: string;
  nome_grupo?: string;
  atualizado_em: string;
  outro_usuario: {
    id: string;
    nome: string;
    apelido: string;
    avatar_url: string | null;
    nivel_atual: number;
    ultimo_login_em: string | null;
    concurso: string | null;
  } | null;
  ultima_mensagem?: string;
  nao_lidas: number;
}

/** Considera "por perto" quem entrou nos últimos 10 minutos. */
function recemVisto(iso: string | null): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 10 * 60 * 1000;
}

/**
 * Presença honesta a partir do último login. Não é presença em tempo real —
 * e o texto deixa isso claro em vez de inventar um "Online".
 */
function textoPresenca(iso: string | null): string {
  if (!iso) return "Sem registro de acesso";
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 10) return "Por perto agora";
  if (minutos < 60) return `Visto há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Visto há ${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "Visto ontem";
  if (dias < 30) return `Visto há ${dias} dias`;
  return "Sem entrar há mais de um mês";
}

export default function ChatPage() {
  const { user } = useAuthStore();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtivaId, setConversaAtivaId] = useState<string>("");
  const conversaAtivaIdRef = useRef(conversaAtivaId);
  useEffect(() => {
    conversaAtivaIdRef.current = conversaAtivaId;
  }, [conversaAtivaId]);

  // No celular a lista e a conversa não cabem lado a lado. Antes as duas
  // empilhavam: para ler uma mensagem o aluno rolava a lista inteira, e para
  // trocar de conversa rolava tudo de volta. Agora é uma tela de cada vez,
  // como em qualquer mensageiro. No desktop os dois painéis convivem e este
  // estado é ignorado.
  const [verConversaNoCelular, setVerConversaNoCelular] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [textoMensagem, setTextoMensagem] = useState("");
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [visible, setVisible] = useState(false);
  const [loadingConversas, setLoadingConversas] = useState(true);
  const [loadingMensagens, setLoadingMensagens] = useState(false);
  const [modalAmigoAberto, setModalAmigoAberto] = useState(false);
  const [modalGrupoAberto, setModalGrupoAberto] = useState(false);
  const [nomeGrupo, setNomeGrupo] = useState("");
  const [amigosParaGrupo, setAmigosParaGrupo] = useState<{id: string; apelido: string; selecionado: boolean}[]>([]);
  const [criandoGrupo, setCriandoGrupo] = useState(false);

  // Áudio: gravação
  const [gravandoAudio, setGravandoAudio] = useState(false);
  const [tempoGravacao, setTempoGravacao] = useState(0);
  const [audioUrlPreview, setAudioUrlPreview] = useState<string | null>(null);
  const [erroMicrofone, setErroMicrofone] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const gravacaoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Imagem: upload e Lightbox
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Carregar conversas do backend real e verificar parâmetro ?amigo=
  const carregarConversas = async (silencioso = false) => {
    if (!silencioso) setLoadingConversas(true);
    try {
      const res = await fetchWithAuth("/api/chat/conversas");
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
                const cRes = await fetchWithAuth("/api/chat/conversas", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ target_user_id: amigoTarget }),
                });
                if (cRes.ok) {
                  const cJson = await cRes.json();
                  if (cJson.success && cJson.data) {
                    setConversaAtivaId(cJson.data.id);
                    // Recarregar lista para incluir dados do outro usuário
                    const recarregarRes = await fetchWithAuth("/api/chat/conversas");
                    if (recarregarRes.ok) {
                      const recJson = await recarregarRes.json();
                      if (recJson.success) setConversas(recJson.data || []);
                    }
                  }
                }
              } catch {}
            }
          } else if (lista.length > 0 && !conversaAtivaIdRef.current) {
            setConversaAtivaId(lista[0].id);
          }
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar conversas:", e);
    } finally {
      if (!silencioso) setLoadingConversas(false);
    }
  };

  // 2. Carregar mensagens da conversa ativa
  //    `silencioso` é usado pelo polling: recarrega sem piscar o spinner.
  const carregarMensagens = async (convId: string, silencioso = false) => {
    if (!convId) return;
    if (!silencioso) setLoadingMensagens(true);
    try {
      const res = await fetchWithAuth(`/api/chat/mensagens?conversa_id=${convId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMensagens((atuais) => {
            // Evita re-render (e scroll indesejado) quando nada mudou.
            if (
              silencioso &&
              atuais.length === json.data.length &&
              atuais[atuais.length - 1]?.id === json.data[json.data.length - 1]?.id
            ) {
              return atuais;
            }
            return json.data;
          });
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar mensagens:", e);
    } finally {
      if (!silencioso) setLoadingMensagens(false);
    }
  };

  useEffect(() => {
    setVisible(true);
    carregarConversas();
  }, []);

  useEffect(() => {
    if (!conversaAtivaId) return;

    carregarMensagens(conversaAtivaId);

    // Não há WebSocket na plataforma: o chat se mantém atualizado com uma
    // consulta a cada 3 segundos. A aba em segundo plano não consulta, para
    // não gastar requisição de quem deixou a página aberta.
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        carregarMensagens(conversaAtivaId, true);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [conversaAtivaId]);

  // Lista de conversas: atualiza com menos frequência (só muda quando chega
  // mensagem numa conversa que não está aberta).
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") carregarConversas(true);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const conversaAtiva = conversas.find((c) => c.id === conversaAtivaId);

  // ─── Gravação de Áudio via MediaRecorder ───────────────────────
  const iniciarGravacaoAudio = async () => {
    setErroMicrofone(null);

    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      setErroMicrofone("Gravação de áudio não suportada neste navegador ou ambiente inseguro (requer HTTPS).");
      return;
    }

    let stream: MediaStream | null = null;

    try {
      // Tentar obter stream de áudio com fallbacks de constraints
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // Suporte multiplataforma a codecs (iOS, Safari, Android, Chrome)
      const codecs = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/aac",
        "audio/ogg;codecs=opus",
        "",
      ];
      const mimeType = codecs.find((c) => !c || (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c))) || "";

      let mediaRecorder: MediaRecorder;
      try {
        const options: MediaRecorderOptions = {};
        if (mimeType) options.mimeType = mimeType;
        mediaRecorder = new MediaRecorder(stream, options);
      } catch {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const tipoBlob = mediaRecorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: tipoBlob });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrlPreview(reader.result as string);
        };
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setGravandoAudio(true);
      setTempoGravacao(0);

      if (gravacaoTimerRef.current) clearInterval(gravacaoTimerRef.current);
      gravacaoTimerRef.current = setInterval(() => {
        setTempoGravacao((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn("Erro microfone:", err);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      let msg = "Permissão para microfone não concedida ou dispositivo indisponível.";
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        msg = "O navegador bloqueou o acesso ao microfone. Para o navegador voltar a perguntar ou permitir: clique no ícone de cadeado/ajustes 🔒 ao lado de 'estudo-tan.vercel.app' na barra de endereço do navegador, mude 'Microfone' para 'Permitir' (ou 'Perguntar') e recarregue a página.";
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        msg = "Nenhum microfone encontrado ou conectado ao seu dispositivo.";
      } else if (err?.name === "NotReadableError") {
        msg = "O microfone já está em uso por outro aplicativo.";
      }
      setErroMicrofone(msg);
    }
  };

  const pararGravacaoAudio = () => {
    if (gravacaoTimerRef.current) {
      clearInterval(gravacaoTimerRef.current);
      gravacaoTimerRef.current = null;
    }
    if (mediaRecorderRef.current && gravandoAudio) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        console.warn("Erro ao parar gravador:", e);
      }
      setGravandoAudio(false);
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

  // ─── Seleção de Arquivo de Áudio ──────────────────────────────
  const handleSelecionarAudioArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("O arquivo de áudio deve ter no máximo 20MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setAudioUrlPreview(base64);
        setErroMicrofone(null);

        // Tentar obter duração do áudio automaticamente
        try {
          const tempAudio = new Audio(base64);
          tempAudio.onloadedmetadata = () => {
            if (tempAudio.duration && !isNaN(tempAudio.duration)) {
              setTempoGravacao(Math.round(tempAudio.duration));
            } else {
              setTempoGravacao(1);
            }
          };
        } catch {
          setTempoGravacao(1);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
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
      const res = await fetchWithAuth("/api/chat/mensagens", {
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
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson?.error || "Não foi possível enviar a mensagem.");
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      alert("Erro de conexão ao enviar mensagem.");
    }
  };

  const conversasFiltradas = conversas.filter((c) => {
    const termo = buscaUsuario.toLowerCase();
    if (!termo) return true;
    if (c.tipo === 'grupo') {
      return (c.nome_grupo || '').toLowerCase().includes(termo);
    }
    return (
      (c.outro_usuario?.apelido || '').toLowerCase().includes(termo) ||
      (c.outro_usuario?.nome || '').toLowerCase().includes(termo)
    );
  });

  // ─── Abrir modal de criação de grupo ────────────────────────
  const abrirModalGrupo = async () => {
    setNomeGrupo("");
    setCriandoGrupo(false);
    try {
      const res = await fetchWithAuth("/api/usuarios/me/amigos");
      const json = await res.json();
      if (json.success && json.data) {
        const rawList = Array.isArray(json.data) ? json.data : (json.data.amigos || []);
        const amigos = rawList
          .map((a: any) => {
            const u = a.usuario || a.amigo || a;
            const usuarioObj = Array.isArray(u) ? u[0] : u;
            return {
              id: usuarioObj?.id,
              apelido: usuarioObj?.apelido || usuarioObj?.nome || 'Soldado',
              selecionado: false,
            };
          })
          .filter((a: any) => Boolean(a.id));
        setAmigosParaGrupo(amigos);
      }
    } catch {}
    setModalGrupoAberto(true);
  };

  const criarGrupo = async () => {
    if (!nomeGrupo.trim() || criandoGrupo) return;
    const selecionados = amigosParaGrupo.filter((a) => a.selecionado).map((a) => a.id);
    if (selecionados.length === 0) {
      alert('Selecione pelo menos 1 amigo para o grupo!');
      return;
    }
    setCriandoGrupo(true);
    try {
      const res = await fetchWithAuth('/api/chat/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeGrupo.trim(), participante_ids: selecionados }),
      });
      const json = await res.json();
      if (json.success) {
        setModalGrupoAberto(false);
        await carregarConversas();
        if (json.data?.conversa_id) {
          setConversaAtivaId(json.data.conversa_id);
        }
      } else {
        alert(json.error || 'Erro ao criar grupo');
      }
    } catch {
      alert('Erro de conexão ao criar grupo');
    } finally {
      setCriandoGrupo(false);
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ MODAL DE ADICIONAR AMIGO POR APELIDO ═══ */}
      <AdicionarAmigoModal
        isOpen={modalAmigoAberto}
        onClose={() => setModalAmigoAberto(false)}
        onSuccess={() => carregarConversas()}
      />

      {/* ═══ MODAL DE CRIAR GRUPO DE ESTUDO ═══ */}
      {modalGrupoAberto && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalGrupoAberto(false)}
          />
          <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] max-h-[80vh] overflow-y-auto bg-bat-bg-card border border-bat-border rounded-2xl shadow-2xl z-50 p-6 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading text-lg text-bat-text font-bold">⚔️ Criar Grupo de Estudo</h3>
              <button
                onClick={() => setModalGrupoAberto(false)}
                className="w-7 h-7 rounded-lg bg-bat-bg-secondary text-bat-text-muted hover:text-bat-text flex items-center justify-center text-xs cursor-pointer"
              >✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-bat-text-secondary font-semibold mb-1.5">Nome do Grupo</label>
                <input
                  type="text"
                  value={nomeGrupo}
                  onChange={(e) => setNomeGrupo(e.target.value)}
                  placeholder="Ex: Squad EEAR 2026"
                  maxLength={100}
                  className="w-full bg-bat-bg-primary border border-bat-border rounded-xl px-4 py-2.5 text-sm text-bat-text placeholder:text-bat-text-muted focus:border-bat-gold-400/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-bat-text-secondary font-semibold mb-1.5">
                  Selecionar Amigos ({amigosParaGrupo.filter(a => a.selecionado).length} selecionados)
                </label>
                {amigosParaGrupo.length === 0 ? (
                  <p className="text-xs text-bat-text-muted py-4 text-center">
                    Você ainda não tem amigos aceitos. Adicione amigos primeiro!
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {amigosParaGrupo.map((amigo) => (
                      <label
                        key={amigo.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                          amigo.selecionado
                            ? 'bg-bat-gold-400/10 border-bat-gold-400/30'
                            : 'bg-bat-bg-secondary border-transparent hover:border-bat-border'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={amigo.selecionado}
                          onChange={() => {
                            setAmigosParaGrupo(prev =>
                              prev.map(a => a.id === amigo.id ? { ...a, selecionado: !a.selecionado } : a)
                            );
                          }}
                          className="accent-[#F5C518] w-4 h-4"
                        />
                        <span className="text-sm text-bat-text font-medium">{amigo.apelido}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={criarGrupo}
                disabled={criandoGrupo || !nomeGrupo.trim() || amigosParaGrupo.filter(a => a.selecionado).length === 0}
                className="w-full btn-primary py-3 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {criandoGrupo ? 'Criando...' : `⚔️ Criar Grupo (${amigosParaGrupo.filter(a => a.selecionado).length + 1} membros)`}
              </button>
            </div>
          </div>
        </>
      )}
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
            Texto, áudio e foto — só entre soldados que já são amigos confirmados.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={abrirModalGrupo}
            className="py-2.5 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg rounded-xl bg-bat-bg-secondary border border-bat-border hover:border-bat-gold-400/40 text-bat-text transition-all"
          >
            <span>⚔️</span>
            <span>+ Novo Grupo</span>
          </button>
          <button
            onClick={() => setModalAmigoAberto(true)}
            className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>👥</span>
            <span>+ Adicionar Amigo</span>
          </button>
        </div>
      </div>

      {/* ═══ PAINEL DO CHAT (SIDEBAR + MENSAGENS) ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px] shadow-2xl w-full max-w-full">
        
        {/* ── Coluna Esquerda: Lista de Conversas (4 colunas) ── */}
        <div
          className={`lg:col-span-4 border-r border-bat-border flex-col bg-bat-bg-card/70 w-full max-w-full overflow-hidden ${
            verConversaNoCelular ? "hidden lg:flex" : "flex"
          }`}
        >
          
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
                      setVerConversaNoCelular(true);
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
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-bat-bg-tertiary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 text-base overflow-hidden">
                        {conv.tipo === 'grupo' ? (
                          <span className="text-xl">⚔️</span>
                        ) : conv.outro_usuario?.avatar_url ? (
                          <img
                            src={conv.outro_usuario.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (conv.outro_usuario?.apelido || '?')[0]?.toUpperCase()
                        )}
                      </div>
                      {conv.tipo !== 'grupo' && conv.outro_usuario && recemVisto(conv.outro_usuario.ultimo_login_em) && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-bat-bg-card"
                          title="Por perto agora"
                        />
                      )}
                    </div>

                    {/* Dados do usuário / grupo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-sm font-semibold text-bat-text truncate">
                          {conv.tipo === 'grupo' ? conv.nome_grupo : conv.outro_usuario?.apelido || '...'}
                        </span>
                        {conv.tipo === 'grupo' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-bat-bg-primary text-emerald-400 border border-emerald-400/20 font-bold">
                            GRUPO
                          </span>
                        ) : conv.outro_usuario ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-bat-bg-primary text-bat-gold-400 border border-bat-gold-400/20 font-mono">
                            Nv. {conv.outro_usuario.nivel_atual}
                          </span>
                        ) : null}
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
        <div
          className={`lg:col-span-8 flex-col bg-bat-bg-primary/40 w-full max-w-full overflow-hidden ${
            verConversaNoCelular ? "flex" : "hidden lg:flex"
          }`}
        >
          {conversaAtiva ? (
            <>
              {/* Header do Chat Ativo */}
              <div className="p-4 border-b border-bat-border flex items-center justify-between gap-2 bg-bat-bg-card/80">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setVerConversaNoCelular(false)}
                    className="lg:hidden shrink-0 w-9 h-9 rounded-xl bg-bat-bg-secondary border border-bat-border text-bat-text-muted hover:text-bat-gold-400 hover:border-bat-gold-400/40 transition-all cursor-pointer"
                    aria-label="Voltar para a lista de conversas"
                  >
                    ←
                  </button>
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-bat-bg-tertiary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 overflow-hidden">
                    {conversaAtiva.tipo === 'grupo' ? (
                      <span className="text-lg">⚔️</span>
                    ) : conversaAtiva.outro_usuario?.avatar_url ? (
                      <img
                        src={conversaAtiva.outro_usuario.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (conversaAtiva.outro_usuario?.apelido || '?')[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-bat-text">
                        {conversaAtiva.tipo === 'grupo' ? conversaAtiva.nome_grupo : conversaAtiva.outro_usuario?.apelido || '...'}
                      </h3>
                      {conversaAtiva.tipo !== 'grupo' && conversaAtiva.outro_usuario?.nome && (
                        <span className="text-[10px] text-bat-text-muted">
                          ({conversaAtiva.outro_usuario.nome})
                        </span>
                      )}
                    </div>
                    {conversaAtiva.tipo === 'grupo' ? (
                      <p className="text-[11px] text-emerald-400 font-semibold">⚔️ Grupo de Estudo</p>
                    ) : conversaAtiva.outro_usuario ? (
                      <p className="text-[11px] text-bat-text-secondary flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            recemVisto(conversaAtiva.outro_usuario.ultimo_login_em)
                              ? "bg-emerald-400"
                              : "bg-bat-text-muted"
                          }`}
                        />
                        {textoPresenca(conversaAtiva.outro_usuario.ultimo_login_em)} ·
                        Nível {conversaAtiva.outro_usuario.nivel_atual}
                        {conversaAtiva.outro_usuario.concurso
                          ? ` · ${conversaAtiva.outro_usuario.concurso}`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* O selo dizia "Criptografado Ponta a Ponta". Não é verdade:
                    as mensagens ficam em texto no banco e a moderação
                    consegue lê-las pelo painel — inclusive é isso que
                    permite atender denúncia de assédio. Prometer sigilo que
                    não existe é o tipo de coisa que faz um adolescente
                    escrever aqui algo que não escreveria em outro lugar. */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span
                    className="text-xs text-bat-text-muted bg-bat-bg-primary px-3 py-1 rounded-lg border border-bat-border"
                    title="As conversas são privadas entre vocês dois, mas a moderação da BatCaverna pode acessá-las ao apurar uma denúncia."
                  >
                    🔒 Conversa privada · sujeita à moderação
                  </span>
                </div>
              </div>

              {/* Mensagens Roláveis */}
              <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 min-h-[300px] max-w-full">
                {loadingMensagens ? (
                  <div className="p-8 text-center text-bat-text-muted text-xs">
                    Carregando mensagens...
                  </div>
                ) : mensagens.length === 0 ? (
                  <div className="p-12 text-center text-bat-text-muted text-xs">
                    <span className="text-3xl block mb-2">💬</span>
                    Envie a primeira mensagem, foto ou áudio para {conversaAtiva.tipo === 'grupo' ? conversaAtiva.nome_grupo : conversaAtiva.outro_usuario?.apelido || '...'}!
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

              {erroMicrofone && (
                <div className="mx-3 sm:mx-4 mb-3 p-3.5 sm:p-4 bg-bat-bg-secondary border-2 border-bat-gold-400/60 rounded-2xl shadow-2xl animate-fade-in text-xs text-bat-text">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-bat-gold-400/10 text-bat-gold-400 text-xl sm:text-2xl flex-shrink-0">
                        🎙️
                      </div>
                      <div className="space-y-2.5">
                        <div>
                          <h4 className="font-bold text-bat-gold-400 text-sm flex items-center gap-2">
                            Permissão para Microfone
                          </h4>
                          <p className="text-bat-text-secondary text-xs mt-1 leading-relaxed">
                            {typeof window !== "undefined" && ((window as any).IS_BATCAVERNA_MOBILE_APP || /Android|iPhone|iPad/i.test(navigator.userAgent))
                              ? "O app BatCaverna precisa da sua autorização para gravar áudios de voz."
                              : "O navegador bloqueou o acesso ao microfone. Por segurança, navegadores exigem que você libere o acesso manualmente."}
                          </p>
                        </div>

                        {/* Passo a passo rápido */}
                        <div className="bg-bat-bg-primary/90 border border-bat-border rounded-xl p-3 space-y-1.5 text-[11px]">
                          {typeof window !== "undefined" && ((window as any).IS_BATCAVERNA_MOBILE_APP || /Android|iPhone|iPad/i.test(navigator.userAgent)) ? (
                            <>
                              <p className="font-bold text-white">Como permitir no celular:</p>
                              <ol className="list-decimal list-inside space-y-1 text-bat-text-muted">
                                <li>Ao abrir o gravador, selecione <strong className="text-bat-gold-400">Permitir durante o uso do app</strong> no aviso do Android.</li>
                                <li>Se não apareceu, abra as <strong>Configurações do Android</strong> &gt; <strong>Aplicativos</strong> &gt; <strong>BatCaverna</strong> &gt; <strong>Permissões</strong> &gt; <strong>Microfone</strong> e mude para Permitir.</li>
                              </ol>
                            </>
                          ) : (
                            <>
                              <p className="font-bold text-white">Como desbloquear no navegador (Chrome/Edge): </p>
                              <ol className="list-decimal list-inside space-y-1 text-bat-text-muted">
                                <li>Na barra de endereço do topo, clique no ícone de <strong>Cadeado 🔒</strong> ou <strong>Ajustes 🎛️</strong>.</li>
                                <li>Em <strong>Microfone</strong>, selecione <strong>Permitir</strong>.</li>
                                <li>Atualize a página para começar a gravar!</li>
                              </ol>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => audioFileInputRef.current?.click()}
                            className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <span>📁</span>
                            <span>Enviar Arquivo (.mp3, .m4a)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setErroMicrofone(null);
                              iniciarGravacaoAudio();
                            }}
                            className="py-2 px-3 rounded-xl bg-bat-bg-card border border-bat-border hover:border-bat-gold-400/40 text-bat-text text-xs font-medium cursor-pointer transition-colors"
                          >
                            🔄 Tentar Gravar Novamente
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setErroMicrofone(null)}
                      className="text-bat-text-muted hover:text-white text-sm p-1 rounded-lg hover:bg-bat-bg-card cursor-pointer transition-colors"
                      title="Fechar aviso"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* ═══ INPUT DE ENVIO COM BOTÕES DE ÁUDIO E FOTO (100% RESPONSIVO NO MOBILE) ═══ */}
              <form
                onSubmit={handleEnviar}
                className="p-2 sm:p-4 border-t border-bat-border bg-bat-bg-card/95 flex items-center gap-1.5 sm:gap-2 w-full max-w-full overflow-hidden shrink-0"
              >
                {/* Input oculto de foto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleSelecionarFoto}
                />

                {/* Input oculto de áudio */}
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.opus,.aac,.webm"
                  className="hidden"
                  onChange={handleSelecionarAudioArquivo}
                />

                {/* Botão de anexar foto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 p-0 rounded-xl bg-bat-bg-primary border border-bat-border text-bat-text-muted hover:text-bat-gold-400 hover:border-bat-gold-400/40 transition-all flex items-center justify-center text-sm cursor-pointer"
                  title="Enviar Foto"
                >
                  📷
                </button>

                {/* Botão de anexar arquivo de áudio */}
                <button
                  type="button"
                  onClick={() => audioFileInputRef.current?.click()}
                  className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 p-0 rounded-xl bg-bat-bg-primary border border-bat-border text-bat-text-muted hover:text-bat-gold-400 hover:border-bat-gold-400/40 transition-all flex items-center justify-center text-sm cursor-pointer"
                  title="Enviar Arquivo de Áudio (.mp3, .m4a)"
                >
                  🎵
                </button>

                {/* Botão de gravação de áudio */}
                {gravandoAudio ? (
                  <button
                    type="button"
                    onClick={pararGravacaoAudio}
                    className="shrink-0 py-2 px-2.5 sm:px-4 rounded-xl bg-bat-error text-white text-xs font-bold animate-pulse flex items-center gap-1 cursor-pointer"
                  >
                    <span>⏹️</span>
                    <span className="hidden sm:inline">Parar</span>
                    <span>({tempoGravacao}s)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={iniciarGravacaoAudio}
                    className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 p-0 rounded-xl bg-bat-bg-primary border border-bat-border text-bat-text-muted hover:text-bat-gold-400 hover:border-bat-gold-400/40 transition-all flex items-center justify-center text-sm cursor-pointer"
                    title="Gravar Áudio com Microfone"
                  >
                    🎤
                  </button>
                )}

                {/* Campo de texto */}
                <input
                  type="text"
                  placeholder={`Mensagem para ${conversaAtiva.tipo === 'grupo' ? conversaAtiva.nome_grupo : conversaAtiva.outro_usuario?.apelido || 'amigo'}...`}
                  value={textoMensagem}
                  onChange={(e) => setTextoMensagem(e.target.value)}
                  className="min-w-0 flex-1 bg-bat-bg-primary border border-bat-border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-bat-text placeholder:text-bat-text-muted focus:border-bat-gold-400/60 focus:outline-none transition-all"
                />

                <button
                  type="submit"
                  disabled={!textoMensagem.trim() && !imagemPreview && !audioUrlPreview}
                  className="btn-primary shrink-0 px-3.5 sm:px-6 py-2.5 sm:py-3 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow-md"
                  title="Enviar Mensagem"
                >
                  <span className="hidden sm:inline">Enviar</span>
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
