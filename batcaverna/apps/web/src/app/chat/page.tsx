"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

interface Mensagem {
  id: string;
  conversa_id: string;
  remetente_id: string;
  conteudo: string;
  enviado_em: string;
  remetente?: {
    id: string;
    apelido: string;
    avatar_url: string | null;
  };
}

interface Conversa {
  id: string;
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

const mockConversasIniciais: Conversa[] = [
  {
    id: "conv-1",
    user_1_id: "user-1",
    user_2_id: "user-2",
    atualizado_em: "2026-08-29T08:30:00Z",
    outro_usuario: {
      id: "user-2",
      nome: "Lucas Ferreira",
      apelido: "FalcãoFAB",
      avatar_url: null,
      nivel_atual: 12,
      online: true,
      concurso: "EEAR",
    },
    ultima_mensagem: "Conseguiu resolver aquela questão de crase da EEAR 2023?",
    nao_lidas: 1,
  },
  {
    id: "conv-2",
    user_1_id: "user-1",
    user_2_id: "user-3",
    atualizado_em: "2026-08-28T22:15:00Z",
    outro_usuario: {
      id: "user-3",
      nome: "Mariana Costa",
      apelido: "CadeteMari",
      avatar_url: null,
      nivel_atual: 14,
      online: false,
      concurso: "EsPCEx",
    },
    ultima_mensagem: "Vlw pelo bizu de física térmica! Ajudou demais no simulado.",
    nao_lidas: 0,
  },
  {
    id: "conv-3",
    user_1_id: "user-1",
    user_2_id: "user-4",
    atualizado_em: "2026-08-27T18:40:00Z",
    outro_usuario: {
      id: "user-4",
      nome: "Gabriel Silva",
      apelido: "GuerreiroESA",
      avatar_url: null,
      nivel_atual: 9,
      online: true,
      concurso: "ESA",
    },
    ultima_mensagem: "Bora fechar um simulado junto hoje à noite?",
    nao_lidas: 0,
  },
];

const mockMensagensIniciais: Record<string, Mensagem[]> = {
  "conv-1": [
    {
      id: "m1",
      conversa_id: "conv-1",
      remetente_id: "user-2",
      conteudo: "Fala irmão! Como estão os estudos para a EEAR?",
      enviado_em: "2026-08-29T08:20:00Z",
      remetente: { id: "user-2", apelido: "FalcãoFAB", avatar_url: null },
    },
    {
      id: "m2",
      conversa_id: "conv-1",
      remetente_id: "user-1",
      conteudo: "Fala Falcão! Finalizei a bateria de questões de Português e Matemática agora!",
      enviado_em: "2026-08-29T08:25:00Z",
      remetente: { id: "user-1", apelido: "AdminCaverna", avatar_url: null },
    },
    {
      id: "m3",
      conversa_id: "conv-1",
      remetente_id: "user-2",
      conteudo: "Conseguiu resolver aquela questão de crase da EEAR 2023?",
      enviado_em: "2026-08-29T08:30:00Z",
      remetente: { id: "user-2", apelido: "FalcãoFAB", avatar_url: null },
    },
  ],
  "conv-2": [
    {
      id: "m20",
      conversa_id: "conv-2",
      remetente_id: "user-3",
      conteudo: "Vlw pelo bizu de física térmica! Ajudou demais no simulado.",
      enviado_em: "2026-08-28T22:15:00Z",
      remetente: { id: "user-3", apelido: "CadeteMari", avatar_url: null },
    },
  ],
  "conv-3": [
    {
      id: "m30",
      conversa_id: "conv-3",
      remetente_id: "user-4",
      conteudo: "Bora fechar um simulado junto hoje à noite?",
      enviado_em: "2026-08-27T18:40:00Z",
      remetente: { id: "user-4", apelido: "GuerreiroESA", avatar_url: null },
    },
  ],
};

export default function ChatPage() {
  const { user } = useAuthStore();
  const [conversas, setConversas] = useState<Conversa[]>(mockConversasIniciais);
  const [conversaAtivaId, setConversaAtivaId] = useState<string>("conv-1");
  const [mensagens, setMensagens] = useState<Record<string, Mensagem[]>>(mockMensagensIniciais);
  const [textoMensagem, setTextoMensagem] = useState("");
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [visible, setVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, conversaAtivaId]);

  const conversaAtiva = conversas.find((c) => c.id === conversaAtivaId) || conversas[0];
  const listaMensagens = conversaAtiva ? mensagens[conversaAtiva.id] || [] : [];

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoMensagem.trim() || !conversaAtiva) return;

    const novaMsg: Mensagem = {
      id: `msg-${Date.now()}`,
      conversa_id: conversaAtiva.id,
      remetente_id: user?.id || "user-1",
      conteudo: textoMensagem.trim(),
      enviado_em: new Date().toISOString(),
      remetente: {
        id: user?.id || "user-1",
        apelido: user?.apelido || "Você",
        avatar_url: user?.avatar_url || null,
      },
    };

    setMensagens((prev) => ({
      ...prev,
      [conversaAtiva.id]: [...(prev[conversaAtiva.id] || []), novaMsg],
    }));

    // Atualizar última mensagem na lista de conversas
    setConversas((prev) =>
      prev.map((c) =>
        c.id === conversaAtiva.id
          ? {
              ...c,
              ultima_mensagem: textoMensagem.trim(),
              atualizado_em: new Date().toISOString(),
            }
          : c
      )
    );

    setTextoMensagem("");
  };

  const conversasFiltradas = conversas.filter(
    (c) =>
      c.outro_usuario.apelido.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
      c.outro_usuario.nome.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
      c.outro_usuario.concurso.toLowerCase().includes(buscaUsuario.toLowerCase())
  );

  return (
    <div className={`space-y-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
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
              ESQUADRÃO BATCAVERNA
            </span>
          </div>
          <p className="text-bat-text-secondary text-sm ml-12">
            Tire dúvidas, compartilhe bizus e monte grupos de estudo com outros soldados em tempo real.
          </p>
        </div>
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
                placeholder="Buscar soldado por apelido ou concurso..."
                value={buscaUsuario}
                onChange={(e) => setBuscaUsuario(e.target.value)}
                className="w-full bg-bat-bg-primary border border-bat-border rounded-xl px-4 py-2.5 text-xs text-bat-text placeholder:text-bat-text-muted focus:border-bat-gold-400/60 focus:outline-none transition-all"
              />
              <span className="absolute right-3 top-2.5 text-xs text-bat-text-muted">🔍</span>
            </div>
          </div>

          {/* Lista de Contatos */}
          <div className="flex-1 overflow-y-auto divide-y divide-bat-border/30">
            {conversasFiltradas.length === 0 ? (
              <div className="p-6 text-center text-bat-text-muted text-xs">
                Nenhum soldado encontrado com esse apelido.
              </div>
            ) : (
              conversasFiltradas.map((conv) => {
                const ativa = conv.id === conversaAtivaId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setConversaAtivaId(conv.id);
                      // Limpar não lidas
                      setConversas((prev) =>
                        prev.map((c) => (c.id === conv.id ? { ...c, nao_lidas: 0 } : c))
                      );
                    }}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-all cursor-pointer ${
                      ativa
                        ? "bg-bat-purple-950/40 border-l-4 border-bat-gold-400"
                        : "hover:bg-bat-bg-tertiary/40"
                    }`}
                  >
                    {/* Avatar com status online */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-bat-bg-tertiary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 text-base">
                        {conv.outro_usuario.apelido[0]?.toUpperCase()}
                      </div>
                      {conv.outro_usuario.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-bat-bg-card" />
                      )}
                    </div>

                    {/* Dados do usuário */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-sm font-semibold text-bat-text truncate">
                          {conv.outro_usuario.apelido}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bat-bg-primary text-bat-gold-400 border border-bat-gold-400/20 font-mono">
                          {conv.outro_usuario.concurso}
                        </span>
                      </div>
                      <p className="text-xs text-bat-text-muted truncate">
                        {conv.ultima_mensagem || "Inicie a conversa..."}
                      </p>
                    </div>

                    {/* Contador de não lidas */}
                    {conv.nao_lidas > 0 && (
                      <span className="w-5 h-5 rounded-full bg-bat-purple-500 text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
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
                  <div className="w-10 h-10 rounded-xl bg-bat-bg-tertiary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400">
                    {conversaAtiva.outro_usuario.apelido[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-bat-text">
                        {conversaAtiva.outro_usuario.apelido}
                      </h3>
                      <span className="text-[10px] text-bat-text-muted">
                        ({conversaAtiva.outro_usuario.nome})
                      </span>
                    </div>
                    <p className="text-[11px] text-bat-text-secondary flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${conversaAtiva.outro_usuario.online ? "bg-emerald-400" : "bg-zinc-500"}`} />
                      {conversaAtiva.outro_usuario.online ? "Online agora" : "Offline"} · Nível {conversaAtiva.outro_usuario.nivel_atual} · Alvo: {conversaAtiva.outro_usuario.concurso}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-bat-text-muted bg-bat-bg-primary px-3 py-1 rounded-lg border border-bat-border">
                    🔒 Chat Privado Criptografado
                  </span>
                </div>
              </div>

              {/* Mensagens Roláveis */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 min-h-[400px]">
                <div className="text-center my-2">
                  <span className="text-[11px] text-bat-text-muted bg-bat-bg-card/60 px-3 py-1 rounded-full border border-bat-border/40">
                    Início da conversa com {conversaAtiva.outro_usuario.apelido}
                  </span>
                </div>

                {listaMensagens.map((msg) => {
                  const souEu = msg.remetente_id === (user?.id || "user-1");
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${souEu ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {!souEu && (
                          <div className="w-7 h-7 rounded-lg bg-bat-bg-tertiary border border-bat-border flex items-center justify-center text-xs font-bold text-bat-gold-400 flex-shrink-0">
                            {msg.remetente?.apelido[0]?.toUpperCase() || "S"}
                          </div>
                        )}
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            souEu
                              ? "bg-bat-purple-600 text-white rounded-br-none shadow-lg shadow-bat-purple-600/10"
                              : "bg-bat-bg-card border border-bat-border text-bat-text rounded-bl-none"
                          }`}
                        >
                          {!souEu && (
                            <p className="text-[10px] font-bold text-bat-gold-400 mb-1">
                              {msg.remetente?.apelido}
                            </p>
                          )}
                          <p>{msg.conteudo}</p>
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
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Envio */}
              <form onSubmit={handleEnviar} className="p-4 border-t border-bat-border bg-bat-bg-card/90 flex gap-2">
                <input
                  type="text"
                  placeholder={`Mensagem tática para ${conversaAtiva.outro_usuario.apelido}...`}
                  value={textoMensagem}
                  onChange={(e) => setTextoMensagem(e.target.value)}
                  className="flex-1 bg-bat-bg-primary border border-bat-border rounded-xl px-4 py-3 text-xs text-bat-text placeholder:text-bat-text-muted focus:border-bat-gold-400/60 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!textoMensagem.trim()}
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
