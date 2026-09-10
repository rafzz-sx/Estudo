"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";
import { formatarDataHoraVersao } from "@batcaverna/utils";
import { PainelAvisos } from "@/components/admin/PainelAvisos";
import { PainelModeracao } from "@/components/admin/PainelModeracao";
import { PainelSaude } from "@/components/admin/PainelSaude";
import { PainelFeedback } from "@/components/admin/PainelFeedback";
import { PainelSessoes } from "@/components/admin/PainelSessoes";
import { PainelImportacao } from "@/components/admin/PainelImportacao";
import { PainelResolucoes } from "@/components/admin/PainelResolucoes";
import { PainelContestacoes } from "@/components/admin/PainelContestacoes";
import { PainelContatos } from "@/components/admin/PainelContatos";
import { PainelLacunasTeoria } from "@/components/admin/PainelLacunasTeoria";
import { PainelResetSenha } from "@/components/admin/PainelResetSenha";

/** Métricas da plataforma vindas de /api/admin/painel */
interface MetricasPlataforma {
  total_usuarios: number;
  online_agora: number;
  novos_24h: number;
  total_questoes: number;
  total_respostas: number;
  tickets_abertos: number;
  feedbacks_novos: number;
}

/** Checagem de saúde vinda de /api/admin/saude */
interface ChecagemSaude {
  nome: string;
  ok: boolean;
  detalhe: string;
  critico: boolean;
}

interface ResumoSaude {
  saudavel: boolean;
  problemas_criticos: number;
  checagens: ChecagemSaude[];
  verificado_em: string;
}

/** Contadores para as abas de notificação */
interface ContadoresAbas {
  moderacao_pendentes: number;
  contatos_nao_lidos: number;
  reset_pendentes: number;
  contestacoes_abertas: number;
}

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
  ativo?: boolean;
  suspenso_ate?: string | null;
  motivo_suspensao?: string | null;
  situacao?: "ativa" | "suspensa" | "desativada";
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
  | "alertas"
  | "saude"
  | "armazem"
  | "resolucoes"
  | "contestacoes"
  | "auditoria"
  | "banners"
  | "avisos"
  | "feedback"
  | "contatos"
  | "teoria"
  | "reset_senha"
  | "sessoes";

interface ResumoFeedback {
  total: number;
  nao_lidos: number;
  nota_media: number | null;
  por_tipo: { opiniao: number; bug: number; ideia: number };
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const [aba, setAba] = useState<AbaAdmin>("visao_geral");
  const [resumoFeedback, setResumoFeedback] = useState<ResumoFeedback | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [tickets, setTickets] = useState<TicketAdmin[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<"todos" | "admin" | "user">("todos");

  // Moderação de contas
  const [moderando, setModerando] = useState<string | null>(null);
  const [avisoConta, setAvisoConta] = useState<string | null>(null);

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
  const [logsArmazem, setLogsArmazem] = useState<any[]>([]);

  // Moderação de Chat
  const [conversasModeracao, setConversasModeracao] = useState<any[]>([]);
  const [conversaModeracaoAtivaId, setConversaModeracaoAtivaId] = useState<string | null>(null);
  const [mensagensModeracao, setMensagensModeracao] = useState<any[]>([]);

  // Logs de Auditoria
  const [logsAuditoria, setLogsAuditoria] = useState<any[]>([]);

  // Versão do Sistema
  const [appInfo, setAppInfo] = useState<{ versao_atual: string; atualizado_em: string }>({
    versao_atual: "2.9.0",
    atualizado_em: new Date().toISOString(),
  });

  // Métricas reais da plataforma (vindas da API)
  const [metricas, setMetricas] = useState<MetricasPlataforma | null>(null);

  // Saúde real da instalação (vindas de /api/admin/saude)
  const [resumoSaude, setResumoSaude] = useState<ResumoSaude | null>(null);

  // Contadores para badges nas abas
  const [contadoresAbas, setContadoresAbas] = useState<ContadoresAbas>({
    moderacao_pendentes: 0,
    contatos_nao_lidos: 0,
    reset_pendentes: 0,
    contestacoes_abertas: 0,
  });

  // Hora em tempo real no cabeçalho
  const [horaAtual, setHoraAtual] = useState(new Date());

  // Transição de aba
  const [abaVisivel, setAbaVisivel] = useState(true);
  const abaAnteriorRef = useRef<AbaAdmin>("visao_geral");

  // 1. Carregar dados iniciais
  const carregarDadosIniciais = async () => {
    try {
      const [resUsers, resTickets, resInfo, resLogs, resPainel, resSaude] = await Promise.all([
        fetchWithAuth("/api/admin/usuarios"),
        fetchWithAuth("/api/tickets"),
        fetchWithAuth("/api/app-info"),
        fetchWithAuth("/api/admin/armazem/logs"),
        fetchWithAuth("/api/admin/painel"),
        fetchWithAuth("/api/admin/saude"),
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
      if (resPainel.ok) {
        const json = await resPainel.json();
        if (json.data?.metricas) setMetricas(json.data.metricas);
      }
      if (resSaude.ok) {
        const json = await resSaude.json();
        if (json.success) setResumoSaude(json.data);
      }
    } catch (e) {
      console.warn("Erro ao carregar dados do admin:", e);
    }
  };

  // Carregar contadores para badges das abas
  const carregarContadoresAbas = async () => {
    try {
      const [resMod, resCont, resReset, resContest] = await Promise.all([
        fetchWithAuth("/api/admin/moderacao?estado=pendentes").catch(() => null),
        fetchWithAuth("/api/admin/contatos?filtro=nao_lidos").catch(() => null),
        fetchWithAuth("/api/admin/reset-senha").catch(() => null),
        fetchWithAuth("/api/admin/contestacoes?status=aberta").catch(() => null),
      ]);

      const contadores: ContadoresAbas = {
        moderacao_pendentes: 0,
        contatos_nao_lidos: 0,
        reset_pendentes: 0,
        contestacoes_abertas: 0,
      };

      if (resMod?.ok) {
        const j = await resMod.json();
        contadores.moderacao_pendentes = j.data?.resumo?.pendentes ?? 0;
      }
      if (resCont?.ok) {
        const j = await resCont.json();
        contadores.contatos_nao_lidos = j.data?.resumo?.nao_lidos ?? 0;
      }
      if (resReset?.ok) {
        const j = await resReset.json();
        contadores.reset_pendentes = (j.data ?? []).filter((s: any) => s.status === "pendente").length;
      }
      if (resContest?.ok) {
        const j = await resContest.json();
        contadores.contestacoes_abertas = j.data?.resumo?.abertas ?? 0;
      }

      setContadoresAbas(contadores);
    } catch {}
  };

  // 2. Carregar Usuários Online
  const carregarOnline = async () => {
    setLoadingOnline(true);
    try {
      const res = await fetchWithAuth("/api/admin/atividade-usuarios");
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
      const res = await fetchWithAuth("/api/admin/auditoria");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setLogsAuditoria(json.data || []);
      }
    } catch {}
  };

  // 4. Carregar Conversas para Moderação
  const carregarModeracao = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/conversas");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setConversasModeracao(json.data || []);
      }
    } catch {}
  };

  useEffect(() => {
    carregarDadosIniciais();
    carregarContadoresAbas();

    // Relógio do cabeçalho atualiza a cada minuto
    const clockTimer = setInterval(() => setHoraAtual(new Date()), 60_000);
    return () => clearInterval(clockTimer);
  }, []);

  // Transição suave ao trocar de aba
  const trocarAba = (novaAba: AbaAdmin) => {
    if (novaAba === aba) return;
    setAbaVisivel(false);
    abaAnteriorRef.current = aba;
    setTimeout(() => {
      setAba(novaAba);
      setAbaVisivel(true);
    }, 120);
  };

  useEffect(() => {
    if (aba === "online") carregarOnline();
    if (aba === "auditoria") carregarAuditoria();
    if (aba === "moderacao") carregarModeracao();
  }, [aba]);

  // Carregar mensagens de moderação
  useEffect(() => {
    if (conversaModeracaoAtivaId) {
      fetchWithAuth(`/api/admin/conversas/${conversaModeracaoAtivaId}/mensagens`)
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setMensagensModeracao(j.data || []);
        });
    }
  }, [conversaModeracaoAtivaId]);

  // Carregar detalhe do ticket
  useEffect(() => {
    if (ticketSelecionadoId) {
      fetchWithAuth(`/api/tickets/${ticketSelecionadoId}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setTicketDetalhe(j.data);
        });
    }
  }, [ticketSelecionadoId]);

  // ─── Polling ao vivo: ticket selecionado no admin (4s) ─────────
  useEffect(() => {
    if (!ticketSelecionadoId) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchWithAuth(`/api/tickets/${ticketSelecionadoId}`)
          .then((r) => r.json())
          .then((j) => {
            if (j.success) setTicketDetalhe(j.data);
          });
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [ticketSelecionadoId]);

  /** Promove, rebaixa, suspende, desativa ou libera uma conta. */
  const moderarConta = async (
    u: UsuarioAdmin,
    acao: "promover" | "rebaixar" | "suspender" | "liberar" | "desativar"
  ) => {
    const rotulos: Record<string, string> = {
      promover: `Tornar ${u.apelido} administrador?`,
      rebaixar: `Remover o cargo de administrador de ${u.apelido}?`,
      suspender: `Suspender ${u.apelido} por 7 dias?`,
      desativar: `Desativar a conta de ${u.apelido}? Ela não conseguirá entrar.`,
      liberar: `Liberar o acesso de ${u.apelido}?`,
    };
    if (!confirm(rotulos[acao])) return;

    const motivo =
      acao === "suspender" || acao === "desativar"
        ? prompt("Motivo (o usuário vê isso na notificação):") ?? undefined
        : undefined;

    setModerando(u.id);
    setAvisoConta(null);
    try {
      const res = await fetchWithAuth("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: u.id, acao, motivo, dias: 7 }),
      });
      const json = await res.json();
      if (!json.success) {
        setAvisoConta(json.error ?? "Não consegui aplicar a ação.");
        return;
      }
      setAvisoConta(json.mensagem);
      await carregarDadosIniciais();
    } catch {
      setAvisoConta("Falha de conexão.");
    } finally {
      setModerando(null);
    }
  };

  // Responder Ticket
  const handleResponderTicket = async (ticketId: string) => {
    if (!textoResposta.trim()) return;
    setEnviandoResposta(true);
    try {
      const res = await fetchWithAuth(`/api/tickets/${ticketId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: textoResposta.trim() }),
      });

      if (res.ok) {
        setTextoResposta("");
        // Recarregar ticket
        const detRes = await fetchWithAuth(`/api/tickets/${ticketId}`);
        if (detRes.ok) {
          const detJson = await detRes.json();
          if (detJson.data) setTicketDetalhe(detJson.data);
        }
        // Recarregar lista
        const tRes = await fetchWithAuth("/api/tickets");
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
      await fetchWithAuth(`/api/admin/mensagens/${msgId}/sinalizar`, {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bat-bg-card border border-bat-border p-6 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Glow sutil de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-bat-gold-400/[0.03] via-transparent to-bat-gold-400/[0.03] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="heading text-2xl sm:text-3xl text-bat-text">Painel de Controle</h1>
            <span className="badge-admin">ADMINISTRADOR MASTER</span>
          </div>
          <p className="text-bat-text-secondary text-sm mt-1">
            {user?.apelido ? (
              <>Olá, <strong className="text-bat-gold-400">{user.apelido}</strong> — </>
            ) : ("")}
            {horaAtual.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {horaAtual.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Badge de Versão */}
        <div className="relative flex flex-col sm:items-end bg-bat-bg-primary border border-bat-gold-400/30 px-4 py-2.5 rounded-xl text-right">
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
      {/* Mobile: Seletor Inteligente Categorizado + Atalhos */}
      <div className="sm:hidden bg-bat-bg-card border border-bat-border p-3.5 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px] text-bat-gold-400">
            Módulo Administrativo
          </span>
          <span className="text-[10px] text-bat-text-muted">18 painéis disponíveis</span>
        </div>
        <div className="relative">
          <select
            value={aba}
            onChange={(e) => trocarAba(e.target.value as AbaAdmin)}
            className="w-full bg-bat-bg-primary border border-bat-gold-400/40 text-bat-text font-bold text-xs rounded-xl px-3.5 py-3 appearance-none focus:outline-none focus:border-bat-gold-400 pr-8"
          >
            <optgroup label="📊 Monitoramento Geral">
              <option value="visao_geral">📊 Visão Geral</option>
              <option value="online">🟢 Online Agora {metricas?.online_agora ? `(${metricas.online_agora})` : ""}</option>
              <option value="saude">🩺 Diagnóstico da Instalação {resumoSaude && !resumoSaude.saudavel ? `(🚨 ${resumoSaude.problemas_criticos})` : ""}</option>
              <option value="sessoes">⏳ Sessões de Estudo</option>
            </optgroup>
            <optgroup label="👥 Soldados & Suporte">
              <option value="usuarios">👥 Contas & Moderação de Soldados</option>
              <option value="tickets">🎫 Tickets de Atendimento {tickets.filter((t) => t.status === "aberto").length ? `(${tickets.filter((t) => t.status === "aberto").length})` : ""}</option>
              <option value="feedback">💬 Feedback dos Alunos {resumoFeedback?.nao_lidos ? `(${resumoFeedback.nao_lidos})` : ""}</option>
              <option value="contatos">📨 Contatos do Fale Conosco {contadoresAbas.contatos_nao_lidos ? `(${contadoresAbas.contatos_nao_lidos})` : ""}</option>
              <option value="reset_senha">🔑 Redefinições de Senha {contadoresAbas.reset_pendentes ? `(${contadoresAbas.reset_pendentes})` : ""}</option>
            </optgroup>
            <optgroup label="🛡️ Moderação & Alertas">
              <option value="alertas">🚨 Moderação & Denúncias {contadoresAbas.moderacao_pendentes ? `(${contadoresAbas.moderacao_pendentes})` : ""}</option>
              <option value="contestacoes">⚖️ Contestações de Questões {contadoresAbas.contestacoes_abertas ? `(${contadoresAbas.contestacoes_abertas})` : ""}</option>
              <option value="moderacao">🛡️ Chat & Palavras Ofensivas</option>
            </optgroup>
            <optgroup label="📚 Conteúdo & Plataforma">
              <option value="armazem">📥 Importar Questões</option>
              <option value="resolucoes">✍️ Resoluções Comentadas</option>
              <option value="teoria">📝 Lacunas de Teoria</option>
              <option value="banners">🖼️ Banners de Concursos</option>
              <option value="avisos">📢 Mural de Avisos</option>
              <option value="auditoria">📝 Auditoria & Logs</option>
            </optgroup>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-bat-gold-400 font-bold">
            ▾
          </div>
        </div>

        {/* Atalhos Rápidos no Mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {[
            { key: "visao_geral", label: "Geral" },
            { key: "usuarios", label: "Contas" },
            { key: "tickets", label: "Tickets", badge: tickets.filter((t) => t.status === "aberto").length },
            { key: "alertas", label: "Moderação", badge: contadoresAbas.moderacao_pendentes },
            { key: "saude", label: "Saúde", badge: resumoSaude && !resumoSaude.saudavel ? resumoSaude.problemas_criticos : 0 },
            { key: "sessoes", label: "Sessões" },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => trocarAba(p.key as AbaAdmin)}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                aba === p.key
                  ? "bg-bat-gold-400 text-black shadow-sm"
                  : "bg-bat-bg-primary text-bat-text-secondary border border-bat-border hover:text-bat-text"
              }`}
            >
              {p.label}
              {p.badge && p.badge > 0 ? (
                <span className="ml-1 rounded-full bg-bat-error px-1.5 py-0.2 text-[9px] text-white">
                  {p.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Grid/Flex de Abas Clássicas com Badges */}
      <div className="hidden sm:block w-full">
        <div className="flex flex-wrap gap-1.5 bg-bat-bg-card border border-bat-border p-1.5 rounded-xl w-full">
          {[
            { key: "visao_geral", label: "📊 Visão Geral", badge: 0 },
            { key: "online", label: "🟢 Online Agora", badge: metricas?.online_agora ?? 0 },
            { key: "usuarios", label: "👥 Contas", badge: 0 },
            { key: "tickets", label: "🎫 Tickets", badge: tickets.filter((t) => t.status === "aberto").length },
            { key: "alertas", label: "🚨 Moderação", badge: contadoresAbas.moderacao_pendentes },
            { key: "saude", label: "🩺 Diagnóstico", badge: resumoSaude && !resumoSaude.saudavel ? resumoSaude.problemas_criticos : 0 },
            { key: "moderacao", label: "🛡️ Chat", badge: 0 },
            { key: "armazem", label: "📥 Importar", badge: 0 },
            { key: "resolucoes", label: "✍️ Resolução", badge: 0 },
            { key: "contestacoes", label: "⚖️ Contestações", badge: contadoresAbas.contestacoes_abertas },
            { key: "teoria", label: "📝 Teoria", badge: 0 },
            { key: "sessoes", label: "⏳ Sessões", badge: 0 },
            { key: "avisos", label: "📢 Aviso", badge: 0 },
            { key: "feedback", label: "💬 Feedback", badge: resumoFeedback?.nao_lidos ?? 0 },
            { key: "contatos", label: "📨 Contato", badge: contadoresAbas.contatos_nao_lidos },
            { key: "reset_senha", label: "🔑 Senhas", badge: contadoresAbas.reset_pendentes },
            { key: "auditoria", label: "📝 Auditoria", badge: 0 },
            { key: "banners", label: "🖼️ Banners", badge: 0 },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => trocarAba(item.key as AbaAdmin)}
              className={`relative px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                aba === item.key
                  ? "bg-bat-gold-400 text-black shadow-[0_0_12px_rgba(245,197,24,0.3)]"
                  : "text-bat-text-muted hover:text-bat-text hover:bg-bat-bg-elevated/50"
              }`}
            >
              {item.label}
              {item.badge > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-extrabold ${
                  aba === item.key
                    ? "bg-black text-bat-gold-400"
                    : "bg-bat-error text-white"
                }`}>
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ CONTEÚDO COM TRANSIÇÃO ═══ */}
      <div
        className="transition-all duration-150"
        style={{
          opacity: abaVisivel ? 1 : 0,
          transform: abaVisivel ? "translateY(0)" : "translateY(6px)",
        }}
      >

      {/* ═══ TAB 1: VISÃO GERAL ═══ */}
      {aba === "visao_geral" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-glow bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Total de Soldados</p>
              <p className="heading text-3xl font-bold text-bat-text">
                {metricas ? metricas.total_usuarios.toLocaleString("pt-BR") : usuarios.length}
              </p>
              <p className="text-bat-text-secondary text-xs mt-1">
                {metricas && metricas.online_agora > 0
                  ? <><span className="text-bat-success">●</span> {metricas.online_agora} online agora</>
                  : "Plataforma ativa"
                }
              </p>
            </div>
            <div className="card-glow bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Questões no Banco</p>
              <p className="heading text-3xl font-bold text-bat-gold-400">
                {metricas ? metricas.total_questoes.toLocaleString("pt-BR") : "—"}
              </p>
              <p className="text-bat-text-secondary text-xs mt-1">
                {metricas ? `${metricas.total_respostas.toLocaleString("pt-BR")} respostas` : "Carregando..."}
              </p>
            </div>
            <div className="card-glow bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Novos em 24h</p>
              <p className="heading text-3xl font-bold text-bat-info">
                {metricas ? metricas.novos_24h : "—"}
              </p>
              <p className="text-bat-text-secondary text-xs mt-1">
                {metricas?.feedbacks_novos
                  ? `${metricas.feedbacks_novos} feedback${metricas.feedbacks_novos !== 1 ? "s" : ""} não lido${metricas.feedbacks_novos !== 1 ? "s" : ""}`
                  : "Nenhum feedback pendente"
                }
              </p>
            </div>
            <div className="card-glow bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Chamados Abertos</p>
              <p className="heading text-3xl font-bold text-bat-error">
                {metricas ? metricas.tickets_abertos : tickets.filter((t) => t.status === "aberto").length}
              </p>
              <p className="text-bat-text-muted text-xs mt-1">Aguardando atendimento</p>
            </div>
          </div>

          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="heading text-lg text-bat-text">Status da Instalação</h2>
              {resumoSaude && (
                <span className={`rounded-lg px-3 py-1 text-xs font-bold ${
                  resumoSaude.saudavel
                    ? "bg-bat-success/10 text-bat-success"
                    : "bg-bat-error/10 text-bat-error"
                }`}>
                  {resumoSaude.saudavel
                    ? "✅ Instalação íntegra"
                    : `🚨 ${resumoSaude.problemas_criticos} problema${resumoSaude.problemas_criticos !== 1 ? "s" : ""}`
                  }
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {resumoSaude ? (
                resumoSaude.checagens.filter((c) => c.critico).slice(0, 3).map((c) => (
                  <div key={c.nome} className={`p-4 rounded-xl border space-y-1 ${
                    c.ok
                      ? "bg-bat-bg-primary border-bat-border"
                      : "bg-bat-error/5 border-bat-error/40"
                  }`}>
                    <span className="text-bat-text-muted">{c.nome}:</span>
                    <p className={`font-bold ${c.ok ? "text-emerald-400" : "text-bat-error"}`}>
                      {c.ok ? "🟢" : "🔴"} {c.detalhe}
                    </p>
                  </div>
                ))
              ) : (
                // Skeleton enquanto carrega
                [0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))
              )}
            </div>
            {resumoSaude?.verificado_em && (
              <p className="text-center text-[10px] text-bat-text-muted mt-3">
                Verificado em {new Date(resumoSaude.verificado_em).toLocaleString("pt-BR")}
              </p>
            )}
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

          {avisoConta && (
            <p className="rounded-xl border border-bat-border bg-bat-bg-secondary px-3 py-2 text-sm text-bat-text-secondary">
              {avisoConta}
            </p>
          )}

          {/* ═══ VISUALIZAÇÃO MOBILE (Cards verticais sem rolagem lateral) ═══ */}
          <div className="sm:hidden space-y-3">
            {usuariosFiltrados.length === 0 ? (
              <p className="p-8 text-center text-xs text-bat-text-muted bg-bat-bg-primary rounded-xl border border-bat-border">
                Nenhum soldado encontrado com os filtros atuais.
              </p>
            ) : (
              usuariosFiltrados.map((u) => {
                const situacao = u.situacao ?? "ativa";
                const ocupado = moderando === u.id;
                return (
                  <div
                    key={u.id}
                    className="p-4 rounded-xl border border-bat-border bg-bat-bg-primary space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-bat-text text-sm truncate">{u.nome}</p>
                          {u.role === "admin" ? (
                            <span className="badge-admin text-[10px]">ADMIN</span>
                          ) : (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bat-bg-secondary text-bat-text-muted">
                              ALUNO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-bat-text-muted truncate">{u.email}</p>
                        <p className="text-xs text-bat-gold-400 font-mono font-bold mt-1">
                          🦇 {u.apelido}
                          {u.apelidos_antigos?.length > 0 && (
                            <span className="font-normal text-[10px] text-bat-text-muted ml-1">
                              (antes: {u.apelidos_antigos.join(", ")})
                            </span>
                          )}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                          situacao === "ativa"
                            ? "bg-bat-success/10 text-bat-success"
                            : situacao === "suspensa"
                            ? "bg-bat-warning/10 text-bat-warning"
                            : "bg-bat-error/10 text-bat-error"
                        }`}
                      >
                        {situacao.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-bat-text-muted pt-2 border-t border-bat-border/50">
                      <span className="text-bat-text">Nv. {u.nivel_atual} · {u.xp_total.toLocaleString("pt-BR")} XP</span>
                      <span>desde {new Date(u.criado_em).toLocaleDateString("pt-BR")}</span>
                    </div>

                    {u.motivo_suspensao && (
                      <p className="text-[11px] text-bat-warning bg-bat-warning/10 p-2 rounded-lg">
                        Motivo: {u.motivo_suspensao}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-bat-border/40">
                      {u.role === "admin" ? (
                        <AcaoConta
                          rotulo="Rebaixar"
                          onClick={() => moderarConta(u, "rebaixar")}
                          ocupado={ocupado}
                        />
                      ) : (
                        <AcaoConta
                          rotulo="Promover"
                          onClick={() => moderarConta(u, "promover")}
                          ocupado={ocupado}
                        />
                      )}

                      {situacao === "ativa" ? (
                        <>
                          <AcaoConta
                            rotulo="Suspender 7d"
                            tom="aviso"
                            onClick={() => moderarConta(u, "suspender")}
                            ocupado={ocupado}
                          />
                          <AcaoConta
                            rotulo="Desativar"
                            tom="erro"
                            onClick={() => moderarConta(u, "desativar")}
                            ocupado={ocupado}
                          />
                        </>
                      ) : (
                        <AcaoConta
                          rotulo="Liberar"
                          tom="ok"
                          onClick={() => moderarConta(u, "liberar")}
                          ocupado={ocupado}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ═══ VISUALIZAÇÃO DESKTOP (Tabela original) ═══ */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-bat-border">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead>
                <tr className="bg-bat-bg-primary border-b border-bat-border text-bat-text-muted uppercase font-mono">
                  <th className="py-3 px-4">Soldado</th>
                  <th className="py-3 px-4">Apelido Atual</th>
                  <th className="py-3 px-4">Nível / XP</th>
                  <th className="py-3 px-4">Cargo</th>
                  <th className="py-3 px-4">Situação</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bat-border/40">
                {usuariosFiltrados.map((u) => {
                  const situacao = u.situacao ?? "ativa";
                  const ocupado = moderando === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-bat-bg-tertiary/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-bat-text">
                        {u.nome}
                        <span className="block font-normal text-bat-text-muted">{u.email}</span>
                        <span className="block font-mono text-[10px] text-bat-text-muted">
                          desde {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-bat-gold-400 font-mono font-bold">
                        🦇 {u.apelido}
                        {u.apelidos_antigos?.length > 0 && (
                          <span className="block font-normal text-[10px] text-bat-text-muted">
                            antes: {u.apelidos_antigos.join(", ")}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">Nv. {u.nivel_atual} · {u.xp_total} XP</td>
                      <td className="py-3 px-4 font-bold">
                        {u.role === "admin" ? <span className="badge-admin">ADMIN</span> : "ALUNO"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                            situacao === "ativa"
                              ? "bg-bat-success/10 text-bat-success"
                              : situacao === "suspensa"
                              ? "bg-bat-warning/10 text-bat-warning"
                              : "bg-bat-error/10 text-bat-error"
                          }`}
                        >
                          {situacao}
                        </span>
                        {u.motivo_suspensao && (
                          <span className="mt-0.5 block max-w-[160px] truncate text-[10px] text-bat-text-muted">
                            {u.motivo_suspensao}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {u.role === "admin" ? (
                            <AcaoConta
                              rotulo="Rebaixar"
                              onClick={() => moderarConta(u, "rebaixar")}
                              ocupado={ocupado}
                            />
                          ) : (
                            <AcaoConta
                              rotulo="Promover"
                              onClick={() => moderarConta(u, "promover")}
                              ocupado={ocupado}
                            />
                          )}

                          {situacao === "ativa" ? (
                            <>
                              <AcaoConta
                                rotulo="Suspender 7d"
                                tom="aviso"
                                onClick={() => moderarConta(u, "suspender")}
                                ocupado={ocupado}
                              />
                              <AcaoConta
                                rotulo="Desativar"
                                tom="erro"
                                onClick={() => moderarConta(u, "desativar")}
                                ocupado={ocupado}
                              />
                            </>
                          ) : (
                            <AcaoConta
                              rotulo="Liberar"
                              tom="ok"
                              onClick={() => moderarConta(u, "liberar")}
                              ocupado={ocupado}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
      {aba === "saude" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
          <PainelSaude />
        </div>
      )}

      {aba === "alertas" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
          <PainelModeracao />
        </div>
      )}

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
        <div className="space-y-6">
          {/* Importador real. O que existia aqui antes era uma fachada:
              inseria duas questoes escritas no proprio codigo, em colunas
              que nem existem mais no schema. Nenhuma prova entrou por ali. */}
          <PainelImportacao />

          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-bat-text-secondary uppercase tracking-wider">Histórico de Importações</h3>
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
          <p className="text-bat-text-muted text-xs">
            Todos os banners da plataforma usam <code className="text-bat-gold-400">object-fit: cover</code>,
            então qualquer proporção de imagem preenche a faixa sem esticar nem
            vazar — não é preciso recortar antes de enviar.
          </p>
        </div>
      )}

      {/* ═══ TAB: SESSÕES & LOGINS ═══ */}
      {aba === "resolucoes" && <PainelResolucoes />}

      {aba === "contestacoes" && <PainelContestacoes />}

      {aba === "sessoes" && <PainelSessoes />}

      {/* ═══ TAB: AVISO GLOBAL ═══ */}
      {aba === "avisos" && <PainelAvisos />}

      {/* ═══ TAB: FEEDBACK DOS ALUNOS ═══ */}
      {aba === "feedback" && <PainelFeedback onResumo={setResumoFeedback} />}

      {aba === "contatos" && <PainelContatos />}

      {aba === "teoria" && <PainelLacunasTeoria />}

      {/* ═══ TAB: REDEFINIÇÕES DE SENHA ═══ */}
      {aba === "reset_senha" && <PainelResetSenha />}
    </div>{/* fim do wrapper de transição */}
    </div>
  );
}

/** Botão de ação da tabela de contas. */
function AcaoConta({
  rotulo,
  onClick,
  ocupado,
  tom,
}: {
  rotulo: string;
  onClick: () => void;
  ocupado: boolean;
  tom?: "ok" | "aviso" | "erro";
}) {
  const cor =
    tom === "erro"
      ? "border-bat-error/30 text-bat-error hover:bg-bat-error/10"
      : tom === "aviso"
      ? "border-bat-warning/30 text-bat-warning hover:bg-bat-warning/10"
      : tom === "ok"
      ? "border-bat-success/30 text-bat-success hover:bg-bat-success/10"
      : "border-bat-border text-bat-text-secondary hover:border-bat-gold-400/40 hover:text-bat-gold-400";

  return (
    <button
      onClick={onClick}
      disabled={ocupado}
      className={`cursor-pointer rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors disabled:opacity-40 ${cor}`}
    >
      {ocupado ? "..." : rotulo}
    </button>
  );
}
