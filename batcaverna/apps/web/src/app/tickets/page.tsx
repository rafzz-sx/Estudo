"use client";

import { useState, useEffect } from "react";

// ─── Mock de tickets ─────────────────────────────────────────
const mockTickets = [
  {
    id: "t1", titulo: "Bug na contagem de tempo de estudo", motivo: "bugs" as const,
    status: "respondido" as const, criado_em: "2026-08-25T14:30:00Z",
    mensagens: [
      { id: "m1", role: "usuario" as const, conteudo: "O cronômetro de estudo não está pausando quando troco de aba.", autor: "Soldado", hora: "14:30" },
      { id: "m2", role: "admin" as const, conteudo: "Olá! Obrigado pelo reporte. Já identificamos o problema e vamos corrigir na próxima atualização.", autor: "Admin", hora: "16:45" },
    ],
  },
  {
    id: "t2", titulo: "Sugestão: modo escuro mais escuro", motivo: "ideia" as const,
    status: "aberto" as const, criado_em: "2026-08-27T09:15:00Z",
    mensagens: [
      { id: "m3", role: "usuario" as const, conteudo: "Seria possível ter um modo AMOLED com fundo 100% preto? Ajudaria muito na bateria do celular.", autor: "Soldado", hora: "09:15" },
    ],
  },
];

type MotivoCor = { bg: string; text: string; label: string };
const motivoStyles: Record<string, MotivoCor> = {
  bugs: { bg: "bg-bat-error/10", text: "text-bat-error", label: "🐛 Bug" },
  ideia: { bg: "bg-bat-info/10", text: "text-bat-info", label: "💡 Ideia" },
  outros: { bg: "bg-bat-text-muted/10", text: "text-bat-text-muted", label: "📋 Outros" },
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  aberto: { bg: "bg-bat-gold-400/10", text: "text-bat-gold-400", label: "Aberto" },
  respondido: { bg: "bg-bat-info/10", text: "text-bat-info", label: "Respondido" },
  finalizado: { bg: "bg-bat-success/10", text: "text-bat-success", label: "Finalizado" },
};

export default function TicketsPage() {
  const [visible, setVisible] = useState(false);
  const [criandoTicket, setCriandoTicket] = useState(false);
  const [ticketAberto, setTicketAberto] = useState<string | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");

  // Form novo ticket
  const [novoMotivo, setNovoMotivo] = useState<"bugs" | "ideia" | "outros">("bugs");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDesc, setNovaDesc] = useState("");

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const ticketSelecionado = mockTickets.find((t) => t.id === ticketAberto);

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading text-3xl text-bat-text mb-2">🎫 Suporte</h1>
          <p className="text-bat-text-secondary">Reporte bugs, sugira ideias ou tire dúvidas.</p>
        </div>
        <button
          onClick={() => { setCriandoTicket(true); setTicketAberto(null); }}
          className="btn-primary py-2.5 px-5 text-sm"
        >
          + Novo Ticket
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ═══ LISTA DE TICKETS ═══ */}
        <div className="lg:w-80 space-y-3">
          <h3 className="heading text-sm text-bat-text-secondary uppercase tracking-wider">Meus Tickets</h3>
          {mockTickets.length === 0 ? (
            <p className="text-bat-text-muted text-sm bg-bat-bg-card border border-bat-border rounded-xl p-4">Nenhum ticket ainda.</p>
          ) : (
            mockTickets.map((t) => {
              const motivo = motivoStyles[t.motivo];
              const status = statusStyles[t.status];
              return (
                <button
                  key={t.id}
                  onClick={() => { setTicketAberto(t.id); setCriandoTicket(false); }}
                  className={`w-full text-left bg-bat-bg-card border rounded-xl p-4 transition-all cursor-pointer ${
                    ticketAberto === t.id ? "border-bat-purple-500/40 glow-purple" : "border-bat-border hover:border-bat-border-strong"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${motivo.bg} ${motivo.text}`}>
                      {motivo.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-bat-text text-sm font-medium truncate">{t.titulo}</p>
                  <p className="text-bat-text-muted text-xs mt-1">
                    {new Date(t.criado_em).toLocaleDateString("pt-BR")} · {t.mensagens.length} mensage{t.mensagens.length !== 1 ? "ns" : "m"}
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
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
              <h3 className="heading text-lg text-bat-text mb-4">Novo Ticket</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-bat-text-secondary text-sm mb-1.5 block">Motivo</label>
                  <div className="flex gap-2">
                    {(["bugs", "ideia", "outros"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setNovoMotivo(m)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
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
                  <label className="text-bat-text-secondary text-sm mb-1.5 block">Título</label>
                  <input
                    type="text"
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                    placeholder="Resuma o problema ou sugestão"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-bat-text-secondary text-sm mb-1.5 block">Descrição</label>
                  <textarea
                    value={novaDesc}
                    onChange={(e) => setNovaDesc(e.target.value)}
                    placeholder="Descreva com detalhes..."
                    rows={4}
                    className="input-field text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button className="btn-primary py-2.5 px-6 text-sm">Enviar Ticket</button>
                  <button
                    onClick={() => setCriandoTicket(false)}
                    className="btn-secondary py-2.5 px-6 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : ticketSelecionado ? (
            /* Chat do ticket */
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
              {/* Header do ticket */}
              <div className="px-6 py-4 border-b border-bat-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${motivoStyles[ticketSelecionado.motivo].bg} ${motivoStyles[ticketSelecionado.motivo].text}`}>
                    {motivoStyles[ticketSelecionado.motivo].label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[ticketSelecionado.status].bg} ${statusStyles[ticketSelecionado.status].text}`}>
                    {statusStyles[ticketSelecionado.status].label}
                  </span>
                </div>
                <h3 className="heading text-base text-bat-text font-bold">{ticketSelecionado.titulo}</h3>
              </div>

              {/* Mensagens (estilo chat) */}
              <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
                {ticketSelecionado.mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "usuario" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "usuario"
                          ? "bg-bat-purple-500/15 border border-bat-purple-500/20 text-bat-text"
                          : "bg-bat-bg-elevated border border-bat-border text-bat-text"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${msg.role === "admin" ? "text-bat-gold-400" : "text-bat-purple-300"}`}>
                          {msg.autor}
                        </span>
                        <span className="text-bat-text-muted text-xs">{msg.hora}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.conteudo}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de nova mensagem */}
              <div className="px-6 py-4 border-t border-bat-border">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    placeholder="Escreva uma mensagem..."
                    className="input-field text-sm flex-1"
                  />
                  <button className="btn-primary py-2.5 px-5 text-sm whitespace-nowrap">
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Placeholder */
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-12 text-center">
              <span className="text-4xl mb-3 block">🎫</span>
              <p className="text-bat-text-secondary">Selecione um ticket ou crie um novo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
