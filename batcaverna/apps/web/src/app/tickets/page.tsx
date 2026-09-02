"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface TicketMensagem {
  id: string;
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

type MotivoCor = { bg: string; text: string; label: string };
const motivoStyles: Record<string, MotivoCor> = {
  bugs: { bg: "bg-bat-error/15", text: "text-bat-error", label: "🐛 Bug" },
  ideia: { bg: "bg-bat-info/15", text: "text-bat-info", label: "💡 Ideia" },
  outros: { bg: "bg-bat-text-muted/15", text: "text-bat-text-muted", label: "📋 Outros" },
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  aberto: { bg: "bg-bat-gold-400/15", text: "text-bat-gold-400", label: "Aberto" },
  respondido: { bg: "bg-bat-info/15", text: "text-bat-info", label: "Respondido" },
  finalizado: { bg: "bg-bat-success/15", text: "text-bat-success", label: "Finalizado" },
};

export default function TicketsPage() {
  const { user } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
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

  // 1. Carregar lista de tickets do usuário
  const carregarTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/tickets");
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
      setLoadingTickets(false);
    }
  };

  // 2. Carregar detalhes e mensagens do ticket selecionado
  const carregarDetalhesTicket = async (id: string) => {
    setLoadingDetalhe(true);
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setTicketDetalhe(json.data);
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
      carregarDetalhesTicket(ticketAbertoId);
    }
  }, [ticketAbertoId]);

  // Criar novo ticket
  const handleCriarTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novaDesc.trim()) return;

    setEnviandoTicket(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivo: novoMotivo,
          titulo: novoTitulo.trim(),
          mensagem_inicial: novaDesc.trim(),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNovoTitulo("");
          setNovaDesc("");
          setCriandoTicket(false);
          await carregarTickets();
          setTicketAbertoId(json.data.id);
        }
      }
    } catch (e) {
      alert("Erro ao enviar ticket.");
    } finally {
      setEnviandoTicket(false);
    }
  };

  // Enviar mensagem no ticket aberto
  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !ticketAbertoId) return;

    setEnviandoMensagem(true);
    try {
      const res = await fetch(`/api/tickets/${ticketAbertoId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conteudo: novaMensagem.trim(),
        }),
      });

      if (res.ok) {
        setNovaMensagem("");
        carregarDetalhesTicket(ticketAbertoId);
        carregarTickets();
      }
    } catch (e) {
      alert("Erro ao enviar mensagem.");
    } finally {
      setEnviandoMensagem(false);
    }
  };

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ CABEÇALHO ═══ */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading text-3xl text-bat-text mb-2">🎫 Central de Suporte</h1>
          <p className="text-bat-text-secondary">
            Reporte bugs, sugira melhorias ou tire dúvidas diretamente com o comando da BatCaverna.
          </p>
        </div>
        <button
          onClick={() => { setCriandoTicket(true); setTicketAbertoId(null); setTicketDetalhe(null); }}
          className="btn-primary py-2.5 px-5 text-sm font-bold"
        >
          + Novo Chamado
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ═══ LISTA DE TICKETS DO USUÁRIO ═══ */}
        <div className="lg:w-80 space-y-3">
          <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider">Meus Chamados</h3>
          
          {loadingTickets ? (
            <div className="bg-bat-bg-card border border-bat-border rounded-xl p-8 text-center text-xs text-bat-text-muted">
              Carregando chamados...
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-bat-bg-card border border-bat-border rounded-xl p-6 text-center text-bat-text-muted text-xs">
              <span className="text-3xl block mb-2">🎫</span>
              Nenhum chamado aberto ainda.
            </div>
          ) : (
            tickets.map((t) => {
              const motivo = motivoStyles[t.motivo] || motivoStyles.outros;
              const status = statusStyles[t.status] || statusStyles.aberto;
              const ativo = ticketAbertoId === t.id && !criandoTicket;

              return (
                <button
                  key={t.id}
                  onClick={() => { setTicketAbertoId(t.id); setCriandoTicket(false); }}
                  className={`w-full text-left bg-bat-bg-card border rounded-2xl p-4 transition-all cursor-pointer ${
                    ativo
                      ? "border-bat-gold-400/60 shadow-[0_0_15px_rgba(245,197,24,0.15)] bg-bat-gold-400/5"
                      : "border-bat-border hover:border-bat-border-strong"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${motivo.bg} ${motivo.text}`}>
                      {motivo.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-bat-text text-sm font-bold truncate">{t.titulo}</p>
                  <p className="text-bat-text-muted text-xs mt-1">
                    {new Date(t.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* ═══ CONTEÚDO DO TICKET / CRIAR TICKET ═══ */}
        <div className="flex-1">
          {criandoTicket ? (
            /* Formulário de novo ticket */
            <form onSubmit={handleCriarTicket} className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="heading text-lg text-bat-text font-bold">Abrir Novo Chamado</h3>
              
              <div>
                <label className="text-bat-text-secondary text-xs mb-1.5 block font-bold">Motivo do Chamado</label>
                <div className="flex gap-2">
                  {(["bugs", "ideia", "outros"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNovoMotivo(m)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        novoMotivo === m
                          ? `${motivoStyles[m].bg} ${motivoStyles[m].text} border-current`
                          : "bg-bat-bg-secondary border-bat-border text-bat-text-muted"
                      }`}
                    >
                      {motivoStyles[m].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-bat-text-secondary text-xs mb-1.5 block font-bold">Título Resumido</label>
                <input
                  type="text"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Questão de Física com gabarito trocado na ESA"
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-bat-text-secondary text-xs mb-1.5 block font-bold">Descrição Detalhada</label>
                <textarea
                  value={novaDesc}
                  onChange={(e) => setNovaDesc(e.target.value)}
                  placeholder="Descreva o que ocorreu com clareza..."
                  rows={5}
                  className="input-field text-sm resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={enviandoTicket}
                  className="btn-primary py-2.5 px-6 text-xs font-bold disabled:opacity-50"
                >
                  {enviandoTicket ? "Enviando..." : "Enviar Chamado 🚀"}
                </button>
                <button
                  type="button"
                  onClick={() => setCriandoTicket(false)}
                  className="py-2.5 px-6 rounded-xl bg-bat-bg-secondary border border-bat-border text-bat-text-muted text-xs hover:text-bat-text cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : ticketDetalhe ? (
            /* Chat / Thread do Ticket */
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl overflow-hidden flex flex-col min-h-[480px] shadow-xl">
              {/* Header do ticket */}
              <div className="px-6 py-4 border-b border-bat-border bg-bat-bg-secondary/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${motivoStyles[ticketDetalhe.motivo]?.bg} ${motivoStyles[ticketDetalhe.motivo]?.text}`}>
                      {motivoStyles[ticketDetalhe.motivo]?.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[ticketDetalhe.status]?.bg} ${statusStyles[ticketDetalhe.status]?.text}`}>
                      {statusStyles[ticketDetalhe.status]?.label}
                    </span>
                  </div>
                  <h3 className="heading text-base text-bat-text font-bold">{ticketDetalhe.titulo}</h3>
                </div>
              </div>

              {/* Mensagens da thread */}
              <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto max-h-[400px]">
                {loadingDetalhe ? (
                  <div className="p-8 text-center text-bat-text-muted text-xs">
                    Carregando mensagens...
                  </div>
                ) : (ticketDetalhe.mensagens || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.autor_role === "usuario" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.autor_role === "usuario"
                          ? "bg-bat-gold-400 text-black font-medium"
                          : "bg-bat-bg-elevated border border-bat-purple-500/40 text-bat-text"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={`font-bold text-[11px] ${msg.autor_role === "admin" ? "text-bat-gold-400" : "text-black"}`}>
                          {msg.autor_role === "admin" ? "🛡️ Suporte BatCaverna" : (user?.apelido || "Você")}
                        </span>
                        <span className="opacity-70 text-[10px]">
                          {new Date(msg.enviado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p>{msg.conteudo}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de resposta */}
              {ticketDetalhe.status !== "finalizado" ? (
                <form onSubmit={handleEnviarMensagem} className="px-6 py-4 border-t border-bat-border bg-bat-bg-secondary/30 flex gap-3">
                  <input
                    type="text"
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    placeholder="Escreva uma mensagem para o suporte..."
                    className="input-field text-xs flex-1"
                    disabled={enviandoMensagem}
                  />
                  <button
                    type="submit"
                    disabled={enviandoMensagem || !novaMensagem.trim()}
                    className="btn-primary py-2.5 px-5 text-xs font-bold whitespace-nowrap disabled:opacity-50"
                  >
                    {enviandoMensagem ? "..." : "Enviar ⚡"}
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-bat-border text-center text-xs text-bat-text-muted bg-bat-bg-secondary/20">
                  🔒 Este chamado foi finalizado pela administração.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-16 text-center text-bat-text-muted text-xs">
              <span className="text-4xl mb-3 block">🎫</span>
              Selecione um chamado ao lado para visualizar o atendimento ou abra um novo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
