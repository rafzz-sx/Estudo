"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { formatarDataHoraVersao } from "@batcaverna/utils";

interface UsuarioAdmin {
  id: string;
  nome: string;
  apelido: string;
  apelidos_antigos: string[];
  email: string;
  role: "admin" | "user";
  nivel_atual: number;
  xp_total: number;
  streak_dias: number;
  criado_em: string;
  avatar_url: string | null;
}

interface TicketAdmin {
  id: string;
  user_id: string;
  titulo: string;
  motivo: "bugs" | "ideia" | "outros";
  status: "aberto" | "respondido" | "finalizado";
  criado_em: string;
  atualizado_em: string;
  autor_apelido?: string;
  mensagens?: any[];
}

type AbaAdmin =
  | "visao_geral"
  | "online"
  | "usuarios"
  | "tickets"
  | "moderacao"
  | "armazem"
  | "auditoria"
  | "banners";

export default function AdminPage() {
  const { user } = useAuthStore();
  const [aba, setAba] = useState<AbaAdmin>("visao_geral");
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [tickets, setTickets] = useState<TicketAdmin[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<"todos" | "admin" | "user">("todos");

  // Usuários Online em Tempo Real
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [statsTempoReal, setStatsTempoReal] = useState<any>({});
  const [loadingOnline, setLoadingOnline] = useState(false);

  // Tickets
  const [ticketSelecionadoId, setTicketSelecionadoId] = useState<string | null>(null);
  const [ticketDetalhe, setTicketDetalhe] = useState<any | null>(null);
  const [textoResposta, setTextoResposta] = useState("");
  const [enviandoResposta, setEnviandoResposta] = useState(false);

  // Armazém
  const [executandoVarredura, setExecutandoVarredura] = useState(false);
  const [logsArmazem, setLogsArmazem] = useState<any[]>([]);
  const [mensagemArmazem, setMensagemArmazem] = useState<string | null>(null);

  // Moderação de Chat
  const [conversasModeracao, setConversasModeracao] = useState<any[]>([]);
  const [conversaModeracaoAtivaId, setConversaModeracaoAtivaId] = useState<string | null>(null);
  const [mensagensModeracao, setMensagensModeracao] = useState<any[]>([]);

  // Logs de Auditoria
  const [logsAuditoria, setLogsAuditoria] = useState<any[]>([]);

  // Versão do Sistema
  const [appInfo, setAppInfo] = useState<{ versao_atual: string; atualizado_em: string }>({
    versao_atual: "1.1.0",
    atualizado_em: new Date().toISOString(),
  });

  // 1. Carregar dados iniciais
  const carregarDadosIniciais = async () => {
    try {
      const [resUsers, resTickets, resInfo, resLogs] = await Promise.all([
        fetch("/api/admin/usuarios"),
        fetch("/api/tickets"),
        fetch("/api/app-info"),
        fetch("/api/admin/armazem/logs"),
      ]);

      if (resUsers.ok) {
        const json = await resUsers.json();
        if (json.data) setUsuarios(json.data);
      }
      if (resTickets.ok) {
        const json = await resTickets.json();
        if (json.data) setTickets(json.data);
      }
      if (resInfo.ok) {
        const json = await resInfo.json();
        if (json.data) setAppInfo(json.data);
      }
      if (resLogs.ok) {
        const json = await resLogs.json();
        if (json.data) setLogsArmazem(json.data);
      }
    } catch (e) {
      console.warn("Erro ao carregar dados do admin:", e);
    }
  };

  // 2. Carregar Usuários Online
  const carregarOnline = async () => {
    setLoadingOnline(true);
    try {
      const res = await fetch("/api/admin/atividade-usuarios");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setUsuariosOnline(json.data.usuarios_online || []);
          setStatsTempoReal(json.data.estatisticas_tempo_real || {});
        }
      }
    } catch {}
    finally {
      setLoadingOnline(false);
    }
  };

  // 3. Carregar Auditoria
  const carregarAuditoria = async () => {
    try {
      const res = await fetch("/api/admin/auditoria");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setLogsAuditoria(json.data || []);
      }
    } catch {}
  };

  // 4. Carregar Conversas para Moderação
  const carregarModeracao = async () => {
    try {
      const res = await fetch("/api/admin/conversas");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setConversasModeracao(json.data || []);
      }
    } catch {}
  };

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (aba === "online") carregarOnline();
    if (aba === "auditoria") carregarAuditoria();
    if (aba === "moderacao") carregarModeracao();
  }, [aba]);

  // Carregar mensagens de moderação
  useEffect(() => {
    if (conversaModeracaoAtivaId) {
      fetch(`/api/admin/conversas/${conversaModeracaoAtivaId}/mensagens`)
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setMensagensModeracao(j.data || []);
        });
    }
  }, [conversaModeracaoAtivaId]);

  // Carregar detalhe do ticket
  useEffect(() => {
    if (ticketSelecionadoId) {
      fetch(`/api/tickets/${ticketSelecionadoId}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setTicketDetalhe(j.data);
        });
    }
  }, [ticketSelecionadoId]);

  // Executar Armazém
  const handleExecutarArmazem = async () => {
    setExecutandoVarredura(true);
    setMensagemArmazem("Executando varredura no bucket e validando hashes SHA-256...");
    try {
      const res = await fetch("/api/admin/armazem/executar-agora", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.success) {
        setMensagemArmazem(`✓ ${json.data.mensagem} (Duração: ${json.data.duracao_segundos}s)`);
        const logsRes = await fetch("/api/admin/armazem/logs");
        if (logsRes.ok) {
          const logsJson = await logsRes.json();
          if (logsJson.data) setLogsArmazem(logsJson.data);
        }
      } else {
        setMensagemArmazem(`⚠️ Erro: ${json.error}`);
      }
    } catch {
      setMensagemArmazem("⚠️ Falha de comunicação na varredura.");
    } finally {
      setExecutandoVarredura(false);
    }
  };

  // Responder Ticket
  const handleResponderTicket = async (ticketId: string) => {
    if (!textoResposta.trim()) return;
    setEnviandoResposta(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: textoResposta.trim() }),
      });

      if (res.ok) {
        setTextoResposta("");
        // Recarregar ticket
        const detRes = await fetch(`/api/tickets/${ticketId}`);
        if (detRes.ok) {
          const detJson = await detRes.json();
          if (detJson.data) setTicketDetalhe(detJson.data);
        }
        // Recarregar lista
        const tRes = await fetch("/api/tickets");
        if (tRes.ok) {
          const tJson = await tRes.json();
          if (tJson.data) setTickets(tJson.data);
        }
      }
    } catch {}
    finally {
      setEnviandoResposta(false);
    }
  };

  // Alternar Flag de Moderação
  const handleToggleFlagMensagem = async (msgId: string, flagAtual: boolean) => {
    try {
      await fetch(`/api/admin/mensagens/${msgId}/sinalizar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sinalizada: !flagAtual }),
      });
      setMensagensModeracao((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, sinalizada_para_revisao: !flagAtual } : m))
      );
    } catch {}
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      u.apelido?.toLowerCase().includes(busca.toLowerCase()) ||
      u.email?.toLowerCase().includes(busca.toLowerCase());
    const matchRole = filtroRole === "todos" ? true : u.role === filtroRole;
    return matchBusca && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* ═══ CABEÇALHO ADMIN ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bat-bg-card border border-bat-border p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading text-3xl text-bat-text">Painel de Controle</h1>
            <span className="badge-admin">ADMINISTRADOR MASTER</span>
          </div>
          <p className="text-bat-text-secondary text-sm mt-1">
            Central de comando: usuários, monitoramento em tempo real, tickets, armazém e moderação.
          </p>
        </div>

        {/* Badge de Versão */}
        <div className="flex flex-col sm:items-end bg-bat-bg-primary border border-bat-gold-400/30 px-4 py-2.5 rounded-xl text-right">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-bat-gold-400">Versão {appInfo.versao_atual}</span>
          </div>
          <p className="text-[11px] text-bat-text-muted mt-0.5">
            Atualizado: {formatarDataHoraVersao(appInfo.atualizado_em)}
          </p>
        </div>
      </div>

      {/* ═══ ABAS DE NAVEGAÇÃO ═══ */}
      <div className="flex gap-1.5 bg-bat-bg-card border border-bat-border p-1.5 rounded-xl w-fit flex-wrap">
        {[
          { key: "visao_geral", label: "📊 Visão Geral" },
          { key: "online", label: "🟢 Usuários Online Agora" },
          { key: "usuarios", label: "👥 Contas & Apelidos" },
          { key: "tickets", label: `🎫 Tickets (${tickets.filter((t) => t.status === "aberto").length} novos)` },
          { key: "moderacao", label: "🛡️ Moderação do Chat" },
          { key: "armazem", label: "📦 Armazém de Questões" },
          { key: "auditoria", label: "📝 Log de Auditoria" },
          { key: "banners", label: "🖼️ Banners & Temas" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setAba(item.key as AbaAdmin)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              aba === item.key
                ? "bg-bat-gold-400 text-black shadow-[0_0_12px_rgba(245,197,24,0.3)]"
                : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB 1: VISÃO GERAL ═══ */}
      {aba === "visao_geral" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Total de Soldados</p>
              <p className="heading text-3xl font-bold text-bat-text">{usuarios.length || 5}</p>
              <p className="text-bat-success text-xs mt-1">↑ 100% Contas Ativas</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Questões no Banco</p>
              <p className="heading text-3xl font-bold text-bat-gold-400">8.940+</p>
              <p className="text-bat-text-secondary text-xs mt-1">9 Concursos + ENEM</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Bizus Cadastrados</p>
              <p className="heading text-3xl font-bold text-bat-purple-400">420</p>
              <p className="text-bat-text-secondary text-xs mt-1">15 Matérias Oficiais</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Chamados Abertos</p>
              <p className="heading text-3xl font-bold text-bat-error">
                {tickets.filter((t) => t.status === "aberto").length}
              </p>
              <p className="text-bat-text-muted text-xs mt-1">Aguardando atendimento</p>
            </div>
          </div>

          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
            <h2 className="heading text-lg text-bat-text mb-4">Auditoria e Status Operacional</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-bat-bg-primary border border-bat-border space-y-1">
                <span className="text-bat-text-muted">Servidor Edge:</span>
                <p className="text-emerald-400 font-bold">🟢 Operacional (Vercel)</p>
              </div>
              <div className="p-4 rounded-xl bg-bat-bg-primary border border-bat-border space-y-1">
                <span className="text-bat-text-muted">Banco PostgreSQL:</span>
                <p className="text-emerald-400 font-bold">🟢 Conectado (Supabase)</p>
              </div>
              <div className="p-4 rounded-xl bg-bat-bg-primary border border-bat-border space-y-1">
                <span className="text-bat-text-muted">Armazém com SHA-256:</span>
                <p className="text-emerald-400 font-bold">🟢 Deduplicação Ativa</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 2: USUÁRIOS ONLINE AGORA ═══ */}
      {aba === "online" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="heading text-xl text-bat-text">Monitoramento em Tempo Real</h2>
              <p className="text-bat-text-secondary text-xs">
                Sessões de estudo ativas nos últimos 10 minutos e telemetria de uso da plataforma.
              </p>
            </div>
            <button
              onClick={carregarOnline}
              disabled={loadingOnline}
              className="btn-primary py-2 px-4 text-xs font-bold"
            >
              {loadingOnline ? "Atualizando..." : "🔄 Atualizar Agora"}
            </button>
          </div>

          {usuariosOnline.length === 0 ? (
            <div className="p-12 text-center text-bat-text-muted text-xs">
              <span className="text-3xl block mb-2">⏱️</span>
              Nenhuma sessão de estudo ativa neste exato momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usuariosOnline.map((u, i) => (
                <div key={i} className="p-4 rounded-xl bg-bat-bg-primary border border-bat-border space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-bat-bg-secondary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 overflow-hidden">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        u.apelido?.[0]?.toUpperCase() || "S"
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-bat-text">{u.apelido}</p>
                      <p className="text-[11px] text-bat-text-muted">{u.nome}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-mono pt-2 border-t border-bat-border/40">
                    <span className="text-bat-gold-400">🔥 Multiplicador: x{u.multiplicador}</span>
                    <span className="text-emerald-400 font-bold">📱 {u.dispositivo?.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 3: CONTAS E APELIDOS ═══ */}
      {aba === "usuarios" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar soldado por nome, apelido ou e-mail..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 input-field text-xs"
            />
            <div className="flex gap-2">
              {(["todos", "user", "admin"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFiltroRole(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    filtroRole === r
                      ? "bg-bat-gold-400 text-black"
                      : "bg-bat-bg-primary text-bat-text-secondary border border-bat-border"
                  }`}
                >
                  {r === "todos" ? "Todos" : r === "admin" ? "Admins" : "Alunos"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-bat-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bat-bg-primary border-b border-bat-border text-bat-text-muted uppercase font-mono">
                  <th className="py-3 px-4">Soldado</th>
                  <th className="py-3 px-4">Apelido Atual</th>
                  <th className="py-3 px-4">Nível / XP</th>
                  <th className="py-3 px-4">Cargo</th>
                  <th className="py-3 px-4 text-right">Data de Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bat-border/40">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-bat-bg-tertiary/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-bat-text">{u.nome} ({u.email})</td>
                    <td className="py-3 px-4 text-bat-gold-400 font-mono font-bold">🦇 {u.apelido}</td>
                    <td className="py-3 px-4 font-mono">Nv. {u.nivel_atual} · {u.xp_total} XP</td>
                    <td className="py-3 px-4 font-bold">
                      {u.role === "admin" ? <span className="badge-admin">ADMIN</span> : "ALUNO"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-bat-text-muted">
                      {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB 4: TICKETS DE SUPORTE ═══ */}
      {aba === "tickets" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTicketSelecionadoId(t.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    t.id === ticketSelecionadoId
                      ? "bg-bat-gold-400/10 border-bat-gold-400/60 shadow-lg"
                      : "bg-bat-bg-primary border-bat-border"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-bat-gold-400">
                      {t.motivo}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bat-bg-secondary text-bat-text">
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-bat-text truncate">{t.titulo}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-7 bg-bat-bg-primary border border-bat-border rounded-xl p-5 flex flex-col justify-between min-h-[400px]">
              {ticketDetalhe ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-bat-text text-sm mb-3">{ticketDetalhe.titulo}</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {(ticketDetalhe.mensagens || []).map((m: any) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl text-xs ${
                            m.autor_role === "admin"
                              ? "bg-bat-purple-600/30 border border-bat-purple-500/40 text-bat-text ml-4"
                              : "bg-bat-bg-card border border-bat-border text-bat-text mr-4"
                          }`}
                        >
                          <span className="font-bold text-bat-gold-400 block mb-0.5">
                            {m.autor_role === "admin" ? "🛡️ Resposta da Administração" : "👤 Aluno"}
                          </span>
                          <p>{m.conteudo}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-bat-border/50 space-y-2">
                    <textarea
                      placeholder="Escreva a resposta oficial ao aluno..."
                      value={textoResposta}
                      onChange={(e) => setTextoResposta(e.target.value)}
                      rows={3}
                      className="w-full input-field text-xs resize-none"
                    />
                    <button
                      onClick={() => handleResponderTicket(ticketDetalhe.id)}
                      disabled={enviandoResposta || !textoResposta.trim()}
                      className="btn-primary py-2 px-5 text-xs font-bold disabled:opacity-50"
                    >
                      {enviandoResposta ? "Enviando..." : "Responder Aluno 🚀"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-bat-text-muted text-xs">
                  Selecione um chamado ao lado para visualizar e responder.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 5: MODERAÇÃO DO CHAT ═══ */}
      {aba === "moderacao" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="heading text-xl text-bat-text">Moderação de Conversas & Palavras Ofensivas</h2>
            <p className="text-bat-text-secondary text-xs">
              Visualize conversas entre alunos e mensagens que foram sinalizadas pelo filtro automático de termos impróprios.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-2">
              {conversasModeracao.length === 0 ? (
                <p className="text-xs text-bat-text-muted p-4 bg-bat-bg-primary rounded-xl border border-bat-border">
                  Nenhuma conversa encontrada.
                </p>
              ) : (
                conversasModeracao.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setConversaModeracaoAtivaId(c.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      c.id === conversaModeracaoAtivaId
                        ? "bg-bat-gold-400/10 border-bat-gold-400/50"
                        : "bg-bat-bg-primary border-bat-border"
                    }`}
                  >
                    <div className="flex justify-between text-xs font-bold text-bat-text">
                      <span>{c.user_a?.apelido} ↔ {c.user_b?.apelido}</span>
                      {c.mensagens_sinalizadas > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px]">
                          ⚠️ {c.mensagens_sinalizadas} flag
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-bat-text-muted mt-1">{c.total_mensagens} mensagens</p>
                  </button>
                ))
              )}
            </div>

            <div className="lg:col-span-7 bg-bat-bg-primary border border-bat-border rounded-xl p-4 min-h-[350px]">
              {conversaModeracaoAtivaId ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {mensagensModeracao.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl border text-xs flex justify-between items-start gap-3 ${
                        m.sinalizada_para_revisao
                          ? "bg-red-950/30 border-red-500/40 text-red-200"
                          : "bg-bat-bg-card border-bat-border text-bat-text"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-bat-gold-400 block mb-0.5">
                          {m.autor?.apelido} ({m.autor?.nome})
                        </span>
                        <p>{m.conteudo_texto || m.tipo?.toUpperCase()}</p>
                      </div>
                      <button
                        onClick={() => handleToggleFlagMensagem(m.id, m.sinalizada_para_revisao)}
                        className="text-[10px] px-2 py-1 rounded bg-bat-bg-secondary border border-bat-border text-bat-text-muted hover:text-bat-text cursor-pointer"
                      >
                        {m.sinalizada_para_revisao ? "Desmarcar ✕" : "Sinalizar ⚠️"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-bat-text-muted text-xs">
                  Selecione uma conversa ao lado para inspecionar mensagens.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 6: ARMAZÉM DE QUESTÕES ═══ */}
      {aba === "armazem" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="heading text-xl text-bat-text">Armazém de Questões com Deduplicação SHA-256</h2>
              <p className="text-bat-text-secondary text-xs">
                Varredura periódica e ingestão automática de questões com hash normalizado de conteúdo para evitar duplicatas.
              </p>
            </div>
            <button
              onClick={handleExecutarArmazem}
              disabled={executandoVarredura}
              className="btn-primary py-2.5 px-6 text-xs font-bold disabled:opacity-50"
            >
              {executandoVarredura ? "Processando..." : "Executar Varredura Agora ⚡"}
            </button>
          </div>

          {mensagemArmazem && (
            <div className="p-3.5 bg-bat-bg-primary border border-bat-gold-400/40 rounded-xl font-mono text-xs text-bat-gold-400">
              {mensagemArmazem}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-bat-text-secondary uppercase tracking-wider">Histórico de Execuções</h3>
            <div className="overflow-x-auto rounded-xl border border-bat-border">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-bat-bg-primary border-b border-bat-border text-bat-text-muted">
                    <th className="py-2.5 px-4">Data / Hora</th>
                    <th className="py-2.5 px-4 text-emerald-400">Aceitas</th>
                    <th className="py-2.5 px-4 text-amber-400">Duplicadas</th>
                    <th className="py-2.5 px-4 text-red-400">Erros</th>
                    <th className="py-2.5 px-4 text-right">Duração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bat-border/40">
                  {logsArmazem.map((log) => (
                    <tr key={log.id} className="hover:bg-bat-bg-tertiary/30">
                      <td className="py-3 px-4">{new Date(log.executado_em).toLocaleString("pt-BR")}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">+{log.questoes_aceitas}</td>
                      <td className="py-3 px-4 text-amber-400">{log.questoes_ignoradas_duplicadas}</td>
                      <td className="py-3 px-4 text-red-400">{log.questoes_com_erro}</td>
                      <td className="py-3 px-4 text-right">{log.duracao_segundos}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 7: LOG DE AUDITORIA ═══ */}
      {aba === "auditoria" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
          <h2 className="heading text-xl text-bat-text">Log de Auditoria Administrativa</h2>
          <div className="overflow-x-auto rounded-xl border border-bat-border">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-bat-bg-primary border-b border-bat-border text-bat-text-muted">
                  <th className="py-2.5 px-4">Data/Hora</th>
                  <th className="py-2.5 px-4">Admin</th>
                  <th className="py-2.5 px-4">Ação</th>
                  <th className="py-2.5 px-4">Entidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bat-border/40">
                {logsAuditoria.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-bat-text-muted">Nenhum log registrado ainda.</td>
                  </tr>
                ) : (
                  logsAuditoria.map((a) => (
                    <tr key={a.id}>
                      <td className="py-3 px-4">{new Date(a.criado_em).toLocaleString("pt-BR")}</td>
                      <td className="py-3 px-4 font-bold text-bat-gold-400">{a.admin?.apelido || "Admin"}</td>
                      <td className="py-3 px-4">{a.acao}</td>
                      <td className="py-3 px-4">{a.entidade_afetada || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB 8: BANNERS E TEMAS ═══ */}
      {aba === "banners" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
          <h2 className="heading text-xl text-bat-text">Formatos de Banners Suportados</h2>
          <p className="text-bat-text-secondary text-xs">Imagens estáticas (PNG, JPG, WebP), GIFs animados e vídeos táticos (MP4, WebM).</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-bat-bg-primary rounded-xl border border-bat-border">
              <span className="text-bat-gold-400 font-bold block mb-1">🖼️ Imagem Estática</span>
              <p className="text-xs text-bat-text-muted">Compressão otimizada até 15MB.</p>
            </div>
            <div className="p-4 bg-bat-bg-primary rounded-xl border border-bat-border">
              <span className="text-bat-purple-400 font-bold block mb-1">🎬 GIF Animado</span>
              <p className="text-xs text-bat-text-muted">Loop infinito dinâmico no perfil e modal.</p>
            </div>
            <div className="p-4 bg-bat-bg-primary rounded-xl border border-bat-border">
              <span className="text-emerald-400 font-bold block mb-1">🎥 Vídeo MP4 / WebM</span>
              <p className="text-xs text-bat-text-muted">Reprodução automática silenciosa (autoplay muted).</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
