"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";

interface TicketMensagem {
  id: string;
  ticket_id?: string;
  autor_id?: string;
  autor_role: "usuario" | "admin";
  conteudo: string;
  enviado_em: string;
  autor?: {
    apelido: string;
    avatar_url: string | null;
  };
}

interface Ticket {
  id: string;
  titulo: string;
  motivo: "bugs" | "ideia" | "outros";
  status: "aberto" | "respondido" | "finalizado";
  criado_em: string;
  atualizado_em: string;
  mensagens?: TicketMensagem[];
}

type MotivoCor = { bg: string; text: string; label: string; icon: string };
const motivoStyles: Record<string, MotivoCor> = {
  bugs: { bg: "bg-red-500/15 border-red-500/30", text: "text-red-400", label: "Bug", icon: "🐛" },
  ideia: { bg: "bg-cyan-500/15 border-cyan-500/30", text: "text-cyan-400", label: "Sugestão", icon: "💡" },
  outros: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400", label: "Dúvida", icon: "📋" },
};

const statusStyles: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  aberto: { bg: "bg-bat-gold-400/15 border-bat-gold-400/30", text: "text-bat-gold-400", label: "Em Análise", icon: "⏳" },
  respondido: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", label: "Respondido", icon: "💬" },
  finalizado: { bg: "bg-slate-500/15 border-slate-500/30", text: "text-slate-400", label: "Concluído", icon: "✅" },
};

/** Formatação de divisor de data no chat */
function formatarDataChat(dataIso: string): string {
  if (!dataIso) return "";
  const data = new Date(dataIso);
  const hoje = new Date();

  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  const inicioData = new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
  const diffDias = Math.round((inicioHoje - inicioData) / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return "Hoje";
  if (diffDias === 1) return "Ontem";
  if (diffDias > 1 && diffDias < 7) {
    const dias = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    return dias[data.getDay()];
  }

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function ehMesmoDia(d1Iso: string, d2Iso: string): boolean {
  if (!d1Iso || !d2Iso) return false;
  const d1 = new Date(d1Iso);
  const d2 = new Date(d2Iso);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function TicketsPage() {
  const { user } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [buscaTickets, setBuscaTickets] = useState("");
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketAbertoId, setTicketAbertoId] = useState<string | null>(null);
  const [ticketDetalhe, setTicketDetalhe] = useState<Ticket | null>(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

  // Form Novo Ticket
  const [criandoTicket, setCriandoTicket] = useState(false);
  const [novoMotivo, setNovoMotivo] = useState<"bugs" | "ideia" | "outros">("bugs");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDesc, setNovaDesc] = useState("");
  const [enviandoTicket, setEnviandoTicket] = useState(false);

  // Form Nova Mensagem no Ticket Aberto
  const [novaMensagem, setNovaMensagem] = useState("");
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  const mensagensEndRef = useRef<HTMLDivElement>(null);

  const rolarParaFinal = (suave = true) => {
    mensagensEndRef.current?.scrollIntoView({
      behavior: suave ? "smooth" : "auto",
    });
  };

  // 1. Carregar lista de tickets do usuário
  const carregarTickets = async (silencioso = false) => {
    if (!silencioso) setLoadingTickets(true);
    try {
      const res = await fetchWithAuth("/api/tickets");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTickets(json.data);
          if (json.data.length > 0 && !ticketAbertoId && !criandoTicket) {
            setTicketAbertoId(json.data[0].id);
          }
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar tickets:", e);
    } finally {
      if (!silencioso) setLoadingTickets(false);
    }
  };

  // 2. Carregar detalhes e mensagens do ticket selecionado
  const carregarDetalhesTicket = async (id: string, silencioso = true) => {
    if (!silencioso && (!ticketDetalhe || ticketDetalhe.id !== id)) {
      setLoadingDetalhe(true);
    }
    try {
      const res = await fetchWithAuth(`/api/tickets/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const anteriorQtd = ticketDetalhe?.mensagens?.length || 0;
          setTicketDetalhe(json.data);
          if ((json.data.mensagens?.length || 0) > anteriorQtd) {
            setTimeout(() => rolarParaFinal(true), 100);
          }
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar mensagens do ticket:", e);
    } finally {
      setLoadingDetalhe(false);
    }
  };

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    carregarTickets();
  }, []);

  useEffect(() => {
    if (ticketAbertoId) {
      const precisaCarregar = !ticketDetalhe || ticketDetalhe.id !== ticketAbertoId;
      if (precisaCarregar) {
        const tNaLista = tickets.find((t) => t.id === ticketAbertoId);
        if (tNaLista) {
          setTicketDetalhe({ ...tNaLista, mensagens: [] });
        }
        carregarDetalhesTicket(ticketAbertoId, false);
      } else {
        carregarDetalhesTicket(ticketAbertoId, true);
      }
      setTimeout(() => rolarParaFinal(false), 200);
    }
  }, [ticketAbertoId]);

  // Polling silencioso ao vivo: mensagens do ticket aberto (3.5s)
  useEffect(() => {
    if (!ticketAbertoId) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        carregarDetalhesTicket(ticketAbertoId, true);
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [ticketAbertoId]);

  // Polling silencioso ao vivo: lista de tickets (15s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        carregarTickets(true);
      }
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Criar novo ticket
  const handleCriarTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novaDesc.trim()) return;

    setEnviandoTicket(true);
    try {
      const res = await fetchWithAuth("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivo: novoMotivo,
          titulo: novoTitulo.trim(),
          descricao: novaDesc.trim(),
          mensagem_inicial: novaDesc.trim(),
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success && json.data) {
        setNovoTitulo("");
        setNovaDesc("");
        setCriandoTicket(false);
        await carregarTickets();
        setTicketAbertoId(json.data.id);
      } else {
        alert(json.error || "Não foi possível enviar o chamado. Verifique os campos.");
      }
    } catch (e) {
      alert("Erro de conexão ao enviar ticket.");
    } finally {
      setEnviandoTicket(false);
    }
  };

  // Enviar mensagem no ticket aberto
  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !ticketAbertoId) return;

    const texto = novaMensagem.trim();
    setNovaMensagem("");
    setEnviandoMensagem(true);

    const msgOtimista: TicketMensagem = {
      id: "temp-" + Date.now(),
      ticket_id: ticketAbertoId,
      autor_id: user?.id || "",
      autor_role: user?.role === "admin" ? "admin" : "usuario",
      conteudo: texto,
      enviado_em: new Date().toISOString(),
    };

    if (ticketDetalhe) {
      setTicketDetalhe((prev) =>
        prev
          ? { ...prev, mensagens: [...(prev.mensagens || []), msgOtimista] }
          : prev
      );
      setTimeout(() => rolarParaFinal(true), 50);
    }

    try {
      const res = await fetchWithAuth(`/api/tickets/${ticketAbertoId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: texto }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        carregarDetalhesTicket(ticketAbertoId, true);
        carregarTickets(true);
      } else {
        alert(json.error || "Não foi possível enviar a mensagem.");
        carregarDetalhesTicket(ticketAbertoId, true);
      }
    } catch (e) {
      alert("Erro ao enviar mensagem.");
      carregarDetalhesTicket(ticketAbertoId, true);
    } finally {
      setEnviandoMensagem(false);
    }
  };

  const ticketsFiltrados = tickets.filter((t) => {
    if (!buscaTickets.trim()) return true;
    const termo = buscaTickets.toLowerCase();
    return (
      t.titulo.toLowerCase().includes(termo) ||
      t.motivo.toLowerCase().includes(termo) ||
      t.status.toLowerCase().includes(termo)
    );
  });

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ CABEÇALHO TÁTICO ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bat-gold-400/10 border border-bat-gold-400/20 text-bat-gold-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-bat-gold-400 animate-pulse" />
            Canal Direto de Atendimento
          </div>
          <h1 className="heading text-2xl sm:text-3xl text-bat-text font-black">
            Central de Suporte
          </h1>
          <p className="text-bat-text-secondary text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Reporte bugs, envie sugestões ou converse diretamente com os administradores da BatCaverna.
          </p>
        </div>
        <button
          onClick={() => {
            setCriandoTicket(true);
            setTicketAbertoId(null);
            setTicketDetalhe(null);
          }}
          className="btn-primary py-2.5 px-5 text-xs font-bold shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-bat-gold-400/15"
        >
          <span>＋</span> Novo Chamado
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* ═══ LATERAL ESQUERDA: LISTA DE CHAMADOS ═══ */}
        <div className="lg:col-span-4 flex flex-col bg-bat-bg-card border border-bat-border rounded-3xl p-4 shadow-xl">
          <div className="mb-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-bat-text-muted">
                Meus Chamados ({tickets.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Ao Vivo
              </span>
            </div>

            {/* Busca rápida */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar por assunto ou status..."
                value={buscaTickets}
                onChange={(e) => setBuscaTickets(e.target.value)}
                className="w-full bg-bat-bg-elevated/70 border border-bat-border/80 rounded-xl px-3.5 py-2 text-xs text-bat-text placeholder-bat-text-muted focus:outline-none focus:border-bat-gold-400/60 transition-colors"
              />
              {buscaTickets && (
                <button
                  onClick={() => setBuscaTickets("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-bat-text-muted hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[580px] custom-scrollbar">
            {loadingTickets ? (
              <div className="p-8 text-center text-xs text-bat-text-muted animate-pulse">
                Carregando seus chamados...
              </div>
            ) : ticketsFiltrados.length === 0 ? (
              <div className="p-8 text-center text-bat-text-muted text-xs bg-bat-bg-primary/40 rounded-2xl border border-bat-border/40">
                <span className="text-3xl block mb-2">🎫</span>
                Nenhum chamado encontrado.
              </div>
            ) : (
              ticketsFiltrados.map((t) => {
                const ativo = ticketAbertoId === t.id && !criandoTicket;
                const motivo = motivoStyles[t.motivo] || motivoStyles.outros;
                const status = statusStyles[t.status] || statusStyles.aberto;

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCriandoTicket(false);
                      setTicketAbertoId(t.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer relative ${
                      ativo
                        ? "bg-gradient-to-r from-bat-gold-400/15 to-bat-bg-elevated border-bat-gold-400/50 shadow-md shadow-bat-gold-400/10"
                        : "bg-bat-bg-primary/60 border-bat-border/60 hover:border-bat-gold-400/30 hover:bg-bat-bg-elevated/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${motivo.bg} ${motivo.text}`}
                      >
                        <span>{motivo.icon}</span>
                        <span>{motivo.label}</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${status.bg} ${status.text}`}
                      >
                        <span>{status.icon}</span>
                        <span>{status.label}</span>
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-bold truncate ${
                        ativo ? "text-bat-gold-400" : "text-bat-text"
                      }`}
                    >
                      {t.titulo}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] font-mono text-bat-text-muted mt-2 pt-2 border-t border-bat-border/30">
                      <span>{new Date(t.criado_em).toLocaleDateString("pt-BR")}</span>
                      <span>
                        {new Date(t.atualizado_em).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ═══ ÁREA PRINCIPAL: CONVERSA ESTILO CHAT OU NOVO TICKET ═══ */}
        <div className="lg:col-span-8 flex flex-col bg-bat-bg-card border border-bat-border rounded-3xl overflow-hidden shadow-xl">
          {criandoTicket ? (
            /* FORMULÁRIO DE NOVO TICKET */
            <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
              <div>
                <h3 className="heading text-xl font-bold text-bat-text flex items-center gap-2">
                  <span>🚀</span> Abrir Novo Chamado de Suporte
                </h3>
                <p className="text-xs text-bat-text-secondary mt-1">
                  Descreva sua dúvida, sugestão ou bug encontrado para nossa equipe responder.
                </p>
              </div>

              <form onSubmit={handleCriarTicket} className="space-y-4">
                <div>
                  <label className="text-bat-text-secondary text-xs mb-1.5 block font-bold">
                    Categoria do Chamado
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["bugs", "ideia", "outros"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setNovoMotivo(m)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          novoMotivo === m
                            ? `${motivoStyles[m].bg} ${motivoStyles[m].text} border-current shadow-xs`
                            : "bg-bat-bg-primary border-bat-border text-bat-text-muted hover:text-bat-text"
                        }`}
                      >
                        <span>{motivoStyles[m].icon}</span>
                        <span>{motivoStyles[m].label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-bat-text-secondary text-xs mb-1.5 block font-bold">
                    Título Resumido
                  </label>
                  <input
                    type="text"
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                    placeholder="Ex: Erro ao calcular pontuação do simulado ou sugestão de novo filtro"
                    className="input-field text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-bat-text-secondary text-xs mb-1.5 block font-bold">
                    Mensagem Inicial Detalhada
                  </label>
                  <textarea
                    value={novaDesc}
                    onChange={(e) => setNovaDesc(e.target.value)}
                    placeholder="Descreva com detalhes o que aconteceu, quando ocorreu e como reproduzir..."
                    rows={5}
                    className="input-field text-xs sm:text-sm resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={enviandoTicket}
                    className="btn-primary py-2.5 px-6 text-xs font-bold disabled:opacity-50"
                  >
                    {enviandoTicket ? "Enviando Chamado..." : "Enviar Chamado 🚀"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCriandoTicket(false);
                      if (tickets.length > 0) setTicketAbertoId(tickets[0].id);
                    }}
                    className="py-2.5 px-5 rounded-xl bg-bat-bg-primary border border-bat-border text-bat-text-muted text-xs hover:text-bat-text cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : ticketDetalhe ? (
            /* CONVERSA DO TICKET (EXPERIÊNCIA MODERNA DO CHAT) */
            <div className="flex flex-col h-full min-h-[580px]">
              {/* Header do Chat */}
              <div className="px-6 py-4 border-b border-bat-border bg-bat-bg-primary/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-bat-gold-400/10 border border-bat-gold-400/30 flex items-center justify-center text-lg shrink-0 text-bat-gold-400 shadow-xs">
                    {motivoStyles[ticketDetalhe.motivo]?.icon || "🎫"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="heading text-sm sm:text-base text-bat-text font-bold truncate">
                        {ticketDetalhe.titulo}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          statusStyles[ticketDetalhe.status]?.bg || ""
                        } ${statusStyles[ticketDetalhe.status]?.text || ""}`}
                      >
                        {statusStyles[ticketDetalhe.status]?.icon}{" "}
                        {statusStyles[ticketDetalhe.status]?.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-bat-text-muted flex items-center gap-2 mt-0.5 font-mono">
                      <span>Criado em {new Date(ticketDetalhe.criado_em).toLocaleDateString("pt-BR")}</span>
                      <span>·</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Comando Conectado
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Corpo das Mensagens (Estilo Chat WhatsApp / Telegram) */}
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-bat-bg/30 via-bat-bg-card to-bat-bg-card max-h-[460px] custom-scrollbar">
                {loadingDetalhe && (!ticketDetalhe.mensagens || ticketDetalhe.mensagens.length === 0) ? (
                  <div className="space-y-4 py-8 animate-pulse">
                    <div className="flex justify-end">
                      <div className="h-14 w-2/3 bg-bat-bg-elevated/70 rounded-2xl rounded-tr-xs" />
                    </div>
                    <div className="flex justify-start">
                      <div className="h-16 w-3/4 bg-bat-bg-elevated/70 rounded-2xl rounded-tl-xs" />
                    </div>
                  </div>
                ) : !ticketDetalhe.mensagens || ticketDetalhe.mensagens.length === 0 ? (
                  <div className="p-12 text-center text-bat-text-muted text-xs">
                    Nenhuma mensagem registrada nesta conversa ainda.
                  </div>
                ) : (
                  ticketDetalhe.mensagens.map((msg, index) => {
                    const ehUsuario = msg.autor_role === "usuario";
                    const anterior = ticketDetalhe.mensagens?.[index - 1];
                    const mudouDia = !anterior || !ehMesmoDia(anterior.enviado_em, msg.enviado_em);

                    return (
                      <div key={msg.id} className="space-y-3">
                        {/* Divisor de data estilo WhatsApp */}
                        {mudouDia && (
                          <div className="flex justify-center my-3">
                            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-bat-bg-elevated/80 border border-bat-border/60 text-bat-text-muted shadow-xs">
                              {formatarDataChat(msg.enviado_em)}
                            </span>
                          </div>
                        )}

                        <div className={`flex items-end gap-2.5 ${ehUsuario ? "justify-end" : "justify-start"}`}>
                          {/* Avatar do Suporte (quando não é o aluno) */}
                          {!ehUsuario && (
                            <div
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400/40 flex items-center justify-center text-xs text-white shrink-0 shadow-md mb-1"
                              title="Comando BatCaverna"
                            >
                              🛡️
                            </div>
                          )}

                          {/* Balão da Mensagem */}
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 text-xs leading-relaxed shadow-lg transition-all ${
                              ehUsuario
                                ? "bg-gradient-to-br from-bat-gold-400/25 via-bat-gold-400/15 to-bat-gold-400/10 border border-bat-gold-400/40 text-white rounded-2xl rounded-tr-xs"
                                : "bg-bat-bg-elevated border border-bat-border/80 text-bat-text rounded-2xl rounded-tl-xs"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1 pb-1 border-b border-white/10">
                              <span
                                className={`font-bold text-[11px] flex items-center gap-1 ${
                                  ehUsuario ? "text-bat-gold-400" : "text-indigo-400"
                                }`}
                              >
                                {ehUsuario ? "Você" : "🛡️ Comando BatCaverna"}
                              </span>
                              <span className="text-[10px] font-mono text-bat-text-muted">
                                {new Date(msg.enviado_em).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-bat-text/95">
                              {msg.conteudo}
                            </p>
                          </div>

                          {/* Avatar do Aluno */}
                          {ehUsuario && (
                            <div
                              className="w-8 h-8 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/40 flex items-center justify-center text-xs font-bold text-bat-gold-400 shrink-0 shadow-md mb-1 overflow-hidden"
                              title={user?.apelido || "Você"}
                            >
                              {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                user?.apelido?.[0]?.toUpperCase() || "V"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={mensagensEndRef} />
              </div>

              {/* Barra Inferior de Digitação (Estilo Chat) */}
              <div className="p-4 border-t border-bat-border bg-bat-bg-primary/90 shrink-0">
                {ticketDetalhe.status === "finalizado" ? (
                  <div className="p-3 text-center text-xs text-bat-text-muted bg-bat-bg-card rounded-2xl border border-bat-border">
                    🔒 Este chamado foi finalizado e arquivado pelo suporte.
                  </div>
                ) : (
                  <form onSubmit={handleEnviarMensagem} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      placeholder="Escreva uma resposta para o suporte da BatCaverna..."
                      className="input-field text-xs sm:text-sm flex-1 py-3 px-4 rounded-2xl bg-bat-bg-elevated/90 border border-bat-border/80 focus:border-bat-gold-400/70"
                      disabled={enviandoMensagem}
                    />
                    <button
                      type="submit"
                      disabled={enviandoMensagem || !novaMensagem.trim()}
                      className="btn-primary py-3 px-5 text-xs font-bold shrink-0 rounded-2xl flex items-center gap-1.5 shadow-md shadow-bat-gold-400/20 disabled:opacity-40"
                    >
                      <span>{enviandoMensagem ? "Enviando..." : "Enviar"}</span>
                      <span>⚡</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-bat-text-muted">
              <span className="text-4xl block mb-3">💬</span>
              <p className="text-sm font-bold text-bat-text">Nenhum chamado selecionado</p>
              <p className="text-xs text-bat-text-secondary mt-1">
                Escolha um chamado na lista ao lado ou abra um novo chamado para falar com o suporte.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
