"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";
import { formatarDataHoraVersao } from "@batcaverna/utils";
import { CURRENT_APP_VERSION } from "@/data/changelog";
import { CURRENT_ADMIN_VERSION, ADMIN_CHANGELOG_HISTORY } from "@/data/admin-changelog";
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
import { PainelBancoQuestoes } from "@/components/admin/PainelBancoQuestoes";

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
  historico_detalhado?: { apelido: string; data: string }[];
  email: string;
  email_verified?: boolean;
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
  concurso_alvo?: string | null;
  concurso_nome?: string | null;
  total_questoes_respondidas?: number;
  total_acertos?: number;
  taxa_acerto?: number | null;
  ultimo_login_em?: string | null;
}

function formatarTempoRelativo(dataIso?: string | null): string {
  if (!dataIso) return "Nunca";
  const ms = Date.now() - new Date(dataIso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `Há ${mins}m`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `Há ${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `Há ${dias}d`;
  return new Date(dataIso).toLocaleDateString("pt-BR");
}

function formatarTempoEstudoMinutos(segundos?: number): string {
  if (!segundos || segundos <= 0) return "0 min";
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface TicketAdmin {
  id: string;
  user_id: string;
  titulo: string;
  motivo: "bugs" | "ideia" | "outros";
  status: "aberto" | "em_andamento" | "respondido" | "resolvido" | "fechado" | "finalizado";
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
  | "questoes"
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
  const [categoriaDesktop, setCategoriaDesktop] = useState<"todas" | "monitoramento" | "soldados" | "seguranca" | "conteudo">("todas");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [modalAdminNovidadesAberto, setModalAdminNovidadesAberto] = useState(false);
  const [resumoFeedback, setResumoFeedback] = useState<ResumoFeedback | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [tickets, setTickets] = useState<TicketAdmin[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<"todos" | "admin" | "user">("todos");

  // Moderação de contas
  const [moderando, setModerando] = useState<string | null>(null);
  const [avisoConta, setAvisoConta] = useState<string | null>(null);
  const [soldadoDossie, setSoldadoDossie] = useState<UsuarioAdmin | null>(null);

  // Usuários Online em Tempo Real
  const [usuariosOnline, setUsuariosOnline] = useState<any[]>([]);
  const [statsTempoReal, setStatsTempoReal] = useState<any>({});
  const [loadingOnline, setLoadingOnline] = useState(false);

  // Tickets
  const [ticketSelecionadoId, setTicketSelecionadoId] = useState<string | null>(null);
  const [ticketDetalhe, setTicketDetalhe] = useState<any | null>(null);
  const [textoResposta, setTextoResposta] = useState("");
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [buscaTickets, setBuscaTickets] = useState("");
  const [filtroStatusTickets, setFiltroStatusTickets] = useState<"todos" | "abertos" | "resolvidos">("todos");
  const [atualizandoStatusTicket, setAtualizandoStatusTicket] = useState(false);
  const [resolverAoResponder, setResolverAoResponder] = useState(false);
  const [emailCopiado, setEmailCopiado] = useState(false);
  const chatMensagensEndRef = useRef<HTMLDivElement | null>(null);

  // Armazém
  const [logsArmazem, setLogsArmazem] = useState<any[]>([]);

  // Moderação de Chat
  const [conversasModeracao, setConversasModeracao] = useState<any[]>([]);
  const [conversaModeracaoAtivaId, setConversaModeracaoAtivaId] = useState<string | null>(null);
  const [mensagensModeracao, setMensagensModeracao] = useState<any[]>([]);
  const [buscaConversasModeracao, setBuscaConversasModeracao] = useState("");
  const [filtroApenasSinalizadas, setFiltroApenasSinalizadas] = useState(false);

  // Logs de Auditoria
  const [logsAuditoria, setLogsAuditoria] = useState<any[]>([]);

  // Versão do Sistema
  const [appInfo, setAppInfo] = useState<{ versao_atual: string; atualizado_em: string }>({
    versao_atual: CURRENT_APP_VERSION,
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

  // Auto-scroll do chat para a mensagem mais recente
  useEffect(() => {
    if (ticketSelecionadoId && chatMensagensEndRef.current) {
      chatMensagensEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticketDetalhe?.mensagens?.length, ticketSelecionadoId]);

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
    if (!textoResposta.trim() || enviandoResposta) return;
    setEnviandoResposta(true);
    try {
      const res = await fetchWithAuth(`/api/tickets/${ticketId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: textoResposta.trim() }),
      });

      if (res.ok) {
        setTextoResposta("");

        // Se a opção de marcar como resolvido estiver ativa
        if (resolverAoResponder) {
          await fetchWithAuth(`/api/tickets/${ticketId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "resolvido" }),
          });
        }

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

  const handleMudarStatusTicket = async (ticketId: string, novoStatus: string) => {
    setAtualizandoStatusTicket(true);
    try {
      const res = await fetchWithAuth(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (res.ok) {
        setTicketDetalhe((prev: any) => (prev ? { ...prev, status: novoStatus } : prev));
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: novoStatus as any } : t))
        );
      }
    } catch {}
    finally {
      setAtualizandoStatusTicket(false);
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

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-bat-bg-card border border-bat-border rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-bat-error/10 border border-bat-error/30 text-3xl flex items-center justify-center mx-auto text-bat-error">
            🦇
          </div>
          <h2 className="heading text-2xl text-bat-text">Acesso Restrito aos Guardiões</h2>
          <p className="text-xs text-bat-text-secondary leading-relaxed">
            Seu perfil militar está registrado como <strong>Soldado ({user.apelido})</strong>. Apenas membros do Alto Comando (Administradores) possuem acesso a esta central.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="btn-primary inline-flex py-2.5 px-6 text-xs font-bold"
            >
              Voltar à Central de Estudos
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Badges de Versão: Painel Admin (Isolado) e Plataforma Alunos */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Badge de Versão do Painel de Admin */}
          <button
            type="button"
            onClick={() => setModalAdminNovidadesAberto(true)}
            className="flex flex-col items-start sm:items-end bg-bat-bg-primary hover:bg-bat-gold-400/[0.08] border border-bat-gold-400/40 hover:border-bat-gold-400 px-3.5 py-2 rounded-xl text-left sm:text-right transition-all group cursor-pointer shadow-md"
            title="Ver notas técnicas e atualizações exclusivas do Painel de Admin"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-bat-gold-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-bat-gold-400 group-hover:underline">
                Painel Admin v{CURRENT_ADMIN_VERSION}
              </span>
            </div>
            <p className="text-[10px] text-bat-text-muted mt-0.5">
              Diário Tático de Moderação ⚡
            </p>
          </button>

          {/* Badge de Versão Pública dos Alunos */}
          <Link
            href="/novidades"
            className="flex flex-col items-start sm:items-end bg-bat-bg-primary/60 hover:bg-bat-bg-card border border-bat-border hover:border-bat-gold-400/30 px-3 py-2 rounded-xl text-left sm:text-right transition-all no-underline group"
            title="Ver diário público de novidades dos alunos"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-bat-text-secondary group-hover:text-bat-text">
                App v{appInfo.versao_atual}
              </span>
            </div>
            <p className="text-[10px] text-bat-text-muted mt-0.5">
              {formatarDataHoraVersao(appInfo.atualizado_em)}
            </p>
          </Link>
        </div>
      </div>

      {/* ═══ ABAS DE NAVEGAÇÃO ═══ */}
      {/* Mobile: Centro de Comando Moderno (Sem select feio nativo do Android) */}
      <div className="sm:hidden bg-bat-bg-card border border-bat-border p-3.5 rounded-2xl space-y-3 shadow-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[11px] text-bat-gold-400 flex items-center gap-1.5">
            <span>🦇</span> Centro de Comando
          </span>
          <span className="text-[10px] text-bat-text-muted">18 módulos disponíveis</span>
        </div>

        {/* Botão de seleção ativo com visual moderno de launcher */}
        <button
          type="button"
          onClick={() => setMenuMobileAberto(true)}
          className="w-full p-3.5 rounded-xl bg-bat-bg-primary border border-bat-gold-400/40 hover:border-bat-gold-400 flex items-center justify-between gap-3 text-left transition-all cursor-pointer shadow-inner active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-bat-gold-400/10 border border-bat-gold-400/30 flex items-center justify-center text-xl shrink-0 text-bat-gold-400">
              {aba === "visao_geral" ? "📊" :
               aba === "online" ? "🟢" :
               aba === "saude" ? "🩺" :
               aba === "sessoes" ? "⏳" :
               aba === "usuarios" ? "👥" :
               aba === "tickets" ? "🎫" :
               aba === "feedback" ? "💬" :
               aba === "contatos" ? "📨" :
               aba === "reset_senha" ? "🔑" :
               aba === "alertas" ? "🚨" :
               aba === "contestacoes" ? "⚖️" :
               aba === "moderacao" ? "🛡️" :
               aba === "questoes" ? "📚" :
               aba === "armazem" ? "📥" :
               aba === "resolucoes" ? "✍️" :
               aba === "teoria" ? "📝" :
               aba === "banners" ? "🖼️" :
               aba === "avisos" ? "📢" :
               aba === "auditoria" ? "📝" : "📊"}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-bat-text-muted uppercase font-bold tracking-wider block">
                Módulo Selecionado
              </span>
              <span className="text-xs font-bold text-bat-text block truncate">
                {aba === "visao_geral" ? "Visão Geral" :
                 aba === "online" ? "Soldados Online Agora" :
                 aba === "saude" ? "Diagnóstico da Instalação" :
                 aba === "sessoes" ? "Sessões de Estudo" :
                 aba === "usuarios" ? "Contas & Moderação" :
                 aba === "tickets" ? "Tickets de Atendimento" :
                 aba === "feedback" ? "Feedback dos Alunos" :
                 aba === "contatos" ? "Fale Conosco" :
                 aba === "reset_senha" ? "Redefinições de Senha" :
                 aba === "alertas" ? "Moderação & Denúncias" :
                 aba === "contestacoes" ? "Contestações de Questões" :
                 aba === "moderacao" ? "Chat & Palavras Ofensivas" :
                 aba === "questoes" ? "Banco de Questões" :
                 aba === "armazem" ? "Importar Questões" :
                 aba === "resolucoes" ? "Resoluções Comentadas" :
                 aba === "teoria" ? "Lacunas de Teoria" :
                 aba === "banners" ? "Banners de Concursos" :
                 aba === "avisos" ? "Mural de Avisos" :
                 aba === "auditoria" ? "Auditoria & Logs" : "Visão Geral"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-bat-gold-400 bg-bat-gold-400/10 border border-bat-gold-400/25 px-2.5 py-1.5 rounded-lg shrink-0">
            <span>Explorar</span>
            <span className="text-xs">▾</span>
          </div>
        </button>

        {/* Atalhos Rápidos no Mobile com Scroll Suave */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {[
            { key: "visao_geral", label: "📊 Geral" },
            { key: "usuarios", label: "👥 Contas" },
            { key: "tickets", label: "🎫 Tickets", badge: tickets.filter((t) => t.status === "aberto").length },
            { key: "alertas", label: "🚨 Moderação", badge: contadoresAbas.moderacao_pendentes },
            { key: "saude", label: "🩺 Saúde", badge: resumoSaude && !resumoSaude.saudavel ? resumoSaude.problemas_criticos : 0 },
            { key: "sessoes", label: "⏳ Sessões" },
            { key: "online", label: "🟢 Online", badge: metricas?.online_agora },
          ].map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => trocarAba(p.key as AbaAdmin)}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                aba === p.key
                  ? "bg-bat-gold-400 text-black shadow-md"
                  : "bg-bat-bg-primary text-bat-text-secondary border border-bat-border hover:text-bat-text"
              }`}
            >
              <span>{p.label}</span>
              {p.badge && p.badge > 0 ? (
                <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${
                  aba === p.key ? "bg-black text-bat-gold-400" : "bg-bat-error text-white"
                }`}>
                  {p.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Drawer Bottom Sheet para Mobile */}
      {menuMobileAberto && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end justify-center">
          {/* Fundo escurecido com blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuMobileAberto(false)}
          />

          {/* Drawer Moderno */}
          <div className="relative w-full max-h-[85vh] bg-bat-bg-card border-t-2 border-bat-gold-400/40 rounded-t-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-slide-up">
            {/* Indicador de toque */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-bat-border rounded-full" />
            </div>

            {/* Cabeçalho */}
            <div className="px-5 py-3 border-b border-bat-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-bat-text flex items-center gap-2">
                  <span className="text-bat-gold-400">🦇</span> Centro de Comando Master
                </h3>
                <p className="text-[11px] text-bat-text-muted">Selecione o painel administrativo</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuMobileAberto(false)}
                className="w-8 h-8 rounded-full bg-bat-bg-secondary border border-bat-border flex items-center justify-center text-xs text-bat-text-muted hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Seções Categorizadas de Módulos */}
            <div className="p-4 overflow-y-auto space-y-4 divide-y divide-bat-border/30">
              {/* Categoria 1 */}
              <div>
                <p className="text-[11px] font-extrabold text-bat-gold-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>📊</span> Monitoramento Geral
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: "visao_geral", label: "Visão Geral", icone: "📊", desc: "Métricas globais e faturamento" },
                    { key: "online", label: "Online Agora", icone: "🟢", desc: "Soldados ativos em tempo real", badge: metricas?.online_agora },
                    { key: "saude", label: "Diagnóstico da Instalação", icone: "🩺", desc: "Verificação de tabelas e Supabase", badge: resumoSaude && !resumoSaude.saudavel ? resumoSaude.problemas_criticos : 0, badgeCor: "bg-bat-error" },
                    { key: "sessoes", label: "Sessões de Estudo", icone: "⏳", desc: "Cronômetros e blocos contínuos" },
                  ].map((m) => {
                    const ativo = aba === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          trocarAba(m.key as AbaAdmin);
                          setMenuMobileAberto(false);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          ativo
                            ? "bg-bat-gold-400/15 border-bat-gold-400 text-bat-text shadow-sm"
                            : "bg-bat-bg-primary/70 border-bat-border/70 hover:border-bat-gold-400/40 text-bat-text-secondary hover:text-bat-text"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl shrink-0">{m.icone}</span>
                          <div className="min-w-0">
                            <span className={`text-xs font-bold block truncate ${ativo ? "text-bat-gold-400" : "text-bat-text"}`}>
                              {m.label}
                            </span>
                            <span className="text-[10px] text-bat-text-muted block truncate">
                              {m.desc}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {m.badge && m.badge > 0 ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${m.badgeCor || "bg-bat-gold-400/90 text-black font-extrabold"}`}>
                              {m.badge}
                            </span>
                          ) : null}
                          {ativo && (
                            <span className="text-bat-gold-400 font-bold text-sm">✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categoria 2 */}
              <div className="pt-4">
                <p className="text-[11px] font-extrabold text-bat-gold-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>👥</span> Soldados & Suporte
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: "usuarios", label: "Contas & Moderação de Soldados", icone: "👥", desc: "Usuários, cargos e suspensões" },
                    { key: "tickets", label: "Tickets de Atendimento", icone: "🎫", desc: "Dúvidas e suporte direto", badge: tickets.filter((t) => t.status === "aberto").length },
                    { key: "feedback", label: "Feedback dos Alunos", icone: "💬", desc: "Avaliações e sugestões", badge: resumoFeedback?.nao_lidos },
                    { key: "contatos", label: "Contatos do Fale Conosco", icone: "📨", desc: "Mensagens da landing page", badge: contadoresAbas.contatos_nao_lidos },
                    { key: "reset_senha", label: "Redefinições de Senha", icone: "🔑", desc: "Solicitações pendentes", badge: contadoresAbas.reset_pendentes },
                  ].map((m) => {
                    const ativo = aba === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          trocarAba(m.key as AbaAdmin);
                          setMenuMobileAberto(false);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          ativo
                            ? "bg-bat-gold-400/15 border-bat-gold-400 text-bat-text shadow-sm"
                            : "bg-bat-bg-primary/70 border-bat-border/70 hover:border-bat-gold-400/40 text-bat-text-secondary hover:text-bat-text"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl shrink-0">{m.icone}</span>
                          <div className="min-w-0">
                            <span className={`text-xs font-bold block truncate ${ativo ? "text-bat-gold-400" : "text-bat-text"}`}>
                              {m.label}
                            </span>
                            <span className="text-[10px] text-bat-text-muted block truncate">
                              {m.desc}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {m.badge && m.badge > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-bat-error">
                              {m.badge}
                            </span>
                          ) : null}
                          {ativo && (
                            <span className="text-bat-gold-400 font-bold text-sm">✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categoria 3 */}
              <div className="pt-4">
                <p className="text-[11px] font-extrabold text-bat-gold-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>🛡️</span> Moderação & Alertas
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: "alertas", label: "Moderação & Denúncias", icone: "🚨", desc: "Alertas críticos e violações", badge: contadoresAbas.moderacao_pendentes, badgeCor: "bg-bat-error" },
                    { key: "contestacoes", label: "Contestações de Questões", icone: "⚖️", desc: "Recursos de gabarito abertos", badge: contadoresAbas.contestacoes_abertas },
                    { key: "moderacao", label: "Chat & Palavras Ofensivas", icone: "🛡️", desc: "Histórico e mensagens sinalizadas" },
                  ].map((m) => {
                    const ativo = aba === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          trocarAba(m.key as AbaAdmin);
                          setMenuMobileAberto(false);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          ativo
                            ? "bg-bat-gold-400/15 border-bat-gold-400 text-bat-text shadow-sm"
                            : "bg-bat-bg-primary/70 border-bat-border/70 hover:border-bat-gold-400/40 text-bat-text-secondary hover:text-bat-text"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl shrink-0">{m.icone}</span>
                          <div className="min-w-0">
                            <span className={`text-xs font-bold block truncate ${ativo ? "text-bat-gold-400" : "text-bat-text"}`}>
                              {m.label}
                            </span>
                            <span className="text-[10px] text-bat-text-muted block truncate">
                              {m.desc}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {m.badge && m.badge > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-bat-error">
                              {m.badge}
                            </span>
                          ) : null}
                          {ativo && (
                            <span className="text-bat-gold-400 font-bold text-sm">✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categoria 4 */}
              <div className="pt-4">
                <p className="text-[11px] font-extrabold text-bat-gold-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>📚</span> Conteúdo & Plataforma
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: "questoes", label: "Banco de Questões", icone: "📚", desc: "Pesquisa, filtros, edição e anulação" },
                    { key: "armazem", label: "Importar Questões", icone: "📥", desc: "Carga em lote e IA de questões" },
                    { key: "resolucoes", label: "Resoluções Comentadas", icone: "✍️", desc: "Gabaritos e comentários" },
                    { key: "teoria", label: "Lacunas de Teoria", icone: "📝", desc: "Resumos e tópicos de aula" },
                    { key: "banners", label: "Banners de Concursos", icone: "🖼️", desc: "Carrossel e destaques da home" },
                    { key: "avisos", label: "Mural de Avisos", icone: "📢", desc: "Comunicados no feed do aluno" },
                    { key: "auditoria", label: "Auditoria & Logs", icone: "📝", desc: "Histórico de ações administrativas" },
                  ].map((m) => {
                    const ativo = aba === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          trocarAba(m.key as AbaAdmin);
                          setMenuMobileAberto(false);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          ativo
                            ? "bg-bat-gold-400/15 border-bat-gold-400 text-bat-text shadow-sm"
                            : "bg-bat-bg-primary/70 border-bat-border/70 hover:border-bat-gold-400/40 text-bat-text-secondary hover:text-bat-text"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl shrink-0">{m.icone}</span>
                          <div className="min-w-0">
                            <span className={`text-xs font-bold block truncate ${ativo ? "text-bat-gold-400" : "text-bat-text"}`}>
                              {m.label}
                            </span>
                            <span className="text-[10px] text-bat-text-muted block truncate">
                              {m.desc}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {ativo && (
                            <span className="text-bat-gold-400 font-bold text-sm">✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Centro de Comando Categorizado com Alta Densidade */}
      <div className="hidden sm:block w-full space-y-2">
        {/* Barra Superior de Categorias Táticas */}
        <div className="flex items-center gap-1.5 bg-bat-bg-card border border-bat-border p-1.5 rounded-2xl">
          {[
            { id: "todas", label: "⚡ Todas as Abas", icone: "⚡" },
            { id: "monitoramento", label: "Monitoramento", icone: "📊", badge: resumoSaude && !resumoSaude.saudavel ? resumoSaude.problemas_criticos : 0, badgeCor: "bg-bat-error" },
            { id: "soldados", label: "Soldados & Suporte", icone: "👥", badge: tickets.filter((t) => t.status === "aberto").length + (resumoFeedback?.nao_lidos ?? 0) + contadoresAbas.contatos_nao_lidos + contadoresAbas.reset_pendentes },
            { id: "seguranca", label: "Segurança & Moderação", icone: "🛡️", badge: contadoresAbas.moderacao_pendentes, badgeCor: "bg-bat-error" },
            { id: "conteudo", label: "Conteúdo & Questões", icone: "📚", badge: contadoresAbas.contestacoes_abertas },
          ].map((cat) => {
            const ativa = categoriaDesktop === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaDesktop(cat.id as any)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  ativa
                    ? "bg-bat-gold-400 text-black shadow-md shadow-bat-gold-400/20"
                    : "text-bat-text-secondary hover:text-bat-text hover:bg-bat-bg-primary"
                }`}
              >
                <span>{cat.icone}</span>
                <span>{cat.label}</span>
                {cat.badge && cat.badge > 0 ? (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                      ativa ? "bg-black text-bat-gold-400" : cat.badgeCor || "bg-bat-gold-400/90 text-black"
                    }`}
                  >
                    {cat.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Sub-Abas Específicas da Categoria */}
        <div className="flex flex-wrap gap-1.5 bg-bat-bg-primary/90 border border-bat-border/80 p-2 rounded-xl w-full shadow-inner">
          {[
            // Monitoramento
            { key: "visao_geral", label: "📊 Visão Geral", cat: "monitoramento", badge: 0 },
            { key: "online", label: "🟢 Online Agora", cat: "monitoramento", badge: metricas?.online_agora ?? 0 },
            { key: "saude", label: "🩺 Diagnóstico", cat: "monitoramento", badge: resumoSaude && !resumoSaude.saudavel ? resumoSaude.problemas_criticos : 0, badgeCor: "bg-bat-error" },
            { key: "sessoes", label: "⏳ Sessões de Estudo", cat: "monitoramento", badge: 0 },

            // Soldados & Suporte
            { key: "usuarios", label: "👥 Contas & Moderação", cat: "soldados", badge: 0 },
            { key: "tickets", label: "🎫 Tickets de Alunos", cat: "soldados", badge: tickets.filter((t) => t.status === "aberto").length },
            { key: "feedback", label: "💬 Feedback", cat: "soldados", badge: resumoFeedback?.nao_lidos ?? 0 },
            { key: "contatos", label: "📨 Fale Conosco", cat: "soldados", badge: contadoresAbas.contatos_nao_lidos },
            { key: "reset_senha", label: "🔑 Redefinição de Senha", cat: "soldados", badge: contadoresAbas.reset_pendentes },

            // Segurança & Moderação
            { key: "alertas", label: "🚨 Moderação & Denúncias", cat: "seguranca", badge: contadoresAbas.moderacao_pendentes, badgeCor: "bg-bat-error" },
            { key: "moderacao", label: "🛡️ Chat & Ofensas", cat: "seguranca", badge: 0 },
            { key: "auditoria", label: "📝 Auditoria & Logs", cat: "seguranca", badge: 0 },

            // Conteúdo & Questões
            { key: "questoes", label: "📚 Banco de Questões", cat: "conteudo", badge: 0 },
            { key: "armazem", label: "📥 Importar Questões", cat: "conteudo", badge: 0 },
            { key: "resolucoes", label: "✍️ Resoluções Comentadas", cat: "conteudo", badge: 0 },
            { key: "contestacoes", label: "⚖️ Contestações", cat: "conteudo", badge: contadoresAbas.contestacoes_abertas },
            { key: "teoria", label: "📝 Lacunas de Teoria", cat: "conteudo", badge: 0 },
            { key: "avisos", label: "📢 Mural de Avisos", cat: "conteudo", badge: 0 },
            { key: "banners", label: "🖼️ Banners", cat: "conteudo", badge: 0 },
          ]
            .filter((item) => categoriaDesktop === "todas" || item.cat === categoriaDesktop)
            .map((item) => (
              <button
                key={item.key}
                onClick={() => trocarAba(item.key as AbaAdmin)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  aba === item.key
                    ? "bg-bat-gold-400 text-black shadow-[0_0_12px_rgba(245,197,24,0.35)]"
                    : "text-bat-text-muted hover:text-bat-text hover:bg-bat-bg-elevated/60"
                }`}
              >
                {item.label}
                {item.badge > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                      aba === item.key
                        ? "bg-black text-bat-gold-400"
                        : (item as any).badgeCor || "bg-bat-error text-white"
                    }`}
                  >
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

          {/* ═══ CENTRO DE AÇÕES IMEDIATAS & PENDÊNCIAS ═══ */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="heading text-lg text-bat-text flex items-center gap-2">
                  <span>⚡</span> Centro de Ações Imediatas
                </h3>
                <p className="text-xs text-bat-text-secondary">
                  Demandas abertas que exigem tomada de decisão e resposta do Alto Comando.
                </p>
              </div>
              <span className="text-[11px] font-mono text-bat-gold-400 bg-bat-gold-400/10 px-2.5 py-1 rounded-lg border border-bat-gold-400/20">
                Acesso Direto
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Tickets */}
              <button
                type="button"
                onClick={() => trocarAba("tickets")}
                className="p-4 rounded-xl border border-bat-border bg-bat-bg-primary/70 hover:border-bat-gold-400/50 text-left transition-all cursor-pointer group hover:bg-bat-bg-elevated/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🎫</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    tickets.filter((t) => t.status === "aberto").length > 0
                      ? "bg-bat-error text-white"
                      : "bg-bat-success/20 text-bat-success"
                  }`}>
                    {tickets.filter((t) => t.status === "aberto").length} abertos
                  </span>
                </div>
                <p className="text-xs font-bold text-bat-text group-hover:text-bat-gold-400 transition-colors">
                  Tickets de Atendimento
                </p>
                <p className="text-[10px] text-bat-text-muted mt-0.5">
                  Dúvidas e chamados de soldados
                </p>
              </button>

              {/* Contestações */}
              <button
                type="button"
                onClick={() => trocarAba("contestacoes")}
                className="p-4 rounded-xl border border-bat-border bg-bat-bg-primary/70 hover:border-bat-gold-400/50 text-left transition-all cursor-pointer group hover:bg-bat-bg-elevated/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">⚖️</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    contadoresAbas.contestacoes_abertas > 0
                      ? "bg-amber-500 text-black font-extrabold"
                      : "bg-bat-success/20 text-bat-success"
                  }`}>
                    {contadoresAbas.contestacoes_abertas} abertas
                  </span>
                </div>
                <p className="text-xs font-bold text-bat-text group-hover:text-bat-gold-400 transition-colors">
                  Recursos de Questões
                </p>
                <p className="text-[10px] text-bat-text-muted mt-0.5">
                  Contestações com consenso de erro
                </p>
              </button>

              {/* Moderação */}
              <button
                type="button"
                onClick={() => trocarAba("alertas")}
                className="p-4 rounded-xl border border-bat-border bg-bat-bg-primary/70 hover:border-bat-gold-400/50 text-left transition-all cursor-pointer group hover:bg-bat-bg-elevated/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🚨</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    contadoresAbas.moderacao_pendentes > 0
                      ? "bg-bat-error text-white"
                      : "bg-bat-success/20 text-bat-success"
                  }`}>
                    {contadoresAbas.moderacao_pendentes} alertas
                  </span>
                </div>
                <p className="text-xs font-bold text-bat-text group-hover:text-bat-gold-400 transition-colors">
                  Moderação & Denúncias
                </p>
                <p className="text-[10px] text-bat-text-muted mt-0.5">
                  Alertas críticos e conduta
                </p>
              </button>

              {/* Banco de Questões */}
              <button
                type="button"
                onClick={() => trocarAba("questoes")}
                className="p-4 rounded-xl border border-bat-border bg-bat-bg-primary/70 hover:border-bat-gold-400/50 text-left transition-all cursor-pointer group hover:bg-bat-bg-elevated/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📚</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30">
                    {metricas ? metricas.total_questoes.toLocaleString("pt-BR") : "2.896"} ativas
                  </span>
                </div>
                <p className="text-xs font-bold text-bat-text group-hover:text-bat-gold-400 transition-colors">
                  Banco de Questões
                </p>
                <p className="text-[10px] text-bat-text-muted mt-0.5">
                  Pesquisar, auditar e anular
                </p>
              </button>
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
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h2 className="heading text-xl text-bat-text">Soldados em Combate Agora</h2>
              </div>
              <p className="text-bat-text-secondary text-xs mt-0.5">
                Sessões ativas com telemetria em tempo real e identificação de dispositivo (Aplicativo APK vs Navegador Web).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-bat-bg-primary border border-bat-border text-xs font-mono text-bat-gold-400">
                ⚡ {usuariosOnline.length} soldado{usuariosOnline.length !== 1 ? "s" : ""} ativo{usuariosOnline.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={carregarOnline}
                disabled={loadingOnline}
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span className={loadingOnline ? "animate-spin" : ""}>🔄</span>
                {loadingOnline ? "Sincronizando..." : "Atualizar"}
              </button>
            </div>
          </div>

          {usuariosOnline.length === 0 ? (
            <div className="p-12 text-center text-bat-text-muted text-xs bg-bat-bg-primary/50 border border-bat-border/50 rounded-2xl">
              <span className="text-4xl block mb-3">🛡️</span>
              <p className="text-sm font-bold text-bat-text">Nenhum soldado estudando no momento</p>
              <p className="text-bat-text-muted mt-1">
                As sessões aparecem aqui em tempo real enquanto os alunos mantêm o cronômetro ligado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usuariosOnline.map((u, i) => {
                const ehApp = u.dispositivo === "app";
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-bat-bg-primary border border-bat-border hover:border-bat-gold-400/50 transition-all space-y-3 relative overflow-hidden group shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-bat-bg-secondary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 overflow-hidden shrink-0 shadow-inner">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.apelido?.[0]?.toUpperCase() || "S"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-bat-text truncate">{u.apelido}</p>
                            {u.concurso_sigla && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30">
                                {u.concurso_sigla}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-bat-text-muted truncate">{u.nome || u.email}</p>
                        </div>
                      </div>

                      {/* Badge Dispositivo */}
                      {ehApp ? (
                        <span className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                          <span>📱</span>
                          <span>APK (App)</span>
                        </span>
                      ) : (
                        <span className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1 shadow-sm">
                          <span>💻</span>
                          <span>Web</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1 py-2 px-2.5 rounded-lg bg-bat-bg-secondary/60 text-center font-mono text-[11px]">
                      <div>
                        <span className="text-[10px] text-bat-text-muted block">Duração</span>
                        <span className="font-bold text-bat-text">
                          ⏱️ {formatarTempoEstudoMinutos(u.duracao_segundos)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-bat-text-muted block">Bônus</span>
                        <span className="font-bold text-bat-gold-400">
                          🔥 x{u.multiplicador}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-bat-text-muted block">XP Ganho</span>
                        <span className="font-bold text-emerald-400">
                          +{u.xp_ganho || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              placeholder="Buscar soldado por nome, apelido, e-mail ou concurso..."
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
                      ? "bg-bat-gold-400 text-black shadow-md shadow-bat-gold-400/20"
                      : "bg-bat-bg-primary text-bat-text-secondary border border-bat-border hover:text-bat-text"
                  }`}
                >
                  {r === "todos" ? `Todos (${usuarios.length})` : r === "admin" ? "Admins" : "Alunos"}
                </button>
              ))}
            </div>
          </div>

          {avisoConta && (
            <p className="rounded-xl border border-bat-border bg-bat-bg-secondary px-3 py-2 text-sm text-bat-text-secondary">
              {avisoConta}
            </p>
          )}

          {/* ═══ VISUALIZAÇÃO MOBILE (Cards verticais) ═══ */}
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
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-bat-bg-secondary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 shrink-0 overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.apelido?.[0]?.toUpperCase() || "S"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-bat-text text-sm truncate">{u.nome}</p>
                            {u.role === "admin" ? (
                              <span className="badge-admin text-[10px]">ADMIN</span>
                            ) : null}
                            {u.concurso_alvo && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30">
                                🎯 {u.concurso_alvo}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-bat-text-muted truncate">{u.email}</p>
                          <p className="text-xs text-bat-gold-400 font-mono font-bold mt-0.5">
                            🦇 {u.apelido}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                          situacao === "ativa"
                            ? "bg-bat-success/10 text-bat-success border border-bat-success/30"
                            : situacao === "suspensa"
                            ? "bg-bat-warning/10 text-bat-warning border border-bat-warning/30"
                            : "bg-bat-error/10 text-bat-error border border-bat-error/30"
                        }`}
                      >
                        {situacao.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-bat-bg-secondary/40 text-[11px] font-mono">
                      <div>
                        <span className="text-[10px] text-bat-text-muted block">Patente</span>
                        <span className="text-bat-text font-bold">Nv. {u.nivel_atual}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-bat-text-muted block">Precisão</span>
                        <span className="text-emerald-400 font-bold">
                          {u.taxa_acerto !== null && u.taxa_acerto !== undefined ? `${u.taxa_acerto}%` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-bat-text-muted block">Ofensiva</span>
                        <span className="text-bat-gold-400 font-bold">🔥 {u.streak_dias}d</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-bat-border/40">
                      <button
                        onClick={() => setSoldadoDossie(u)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-bat-gold-400/10 hover:bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30 cursor-pointer"
                      >
                        👁️ Ver Dossiê
                      </button>
                      <div className="flex gap-1">
                        {situacao === "ativa" ? (
                          <AcaoConta
                            rotulo="Suspender"
                            tom="aviso"
                            onClick={() => moderarConta(u, "suspender")}
                            ocupado={ocupado}
                          />
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
                  </div>
                );
              })
            )}
          </div>

          {/* ═══ VISUALIZAÇÃO DESKTOP (Tabela Completa Enriquecida) ═══ */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-bat-border">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead>
                <tr className="bg-bat-bg-primary border-b border-bat-border text-bat-text-muted uppercase font-mono">
                  <th className="py-3 px-4">Soldado</th>
                  <th className="py-3 px-4">Apelido</th>
                  <th className="py-3 px-4">Concurso Alvo</th>
                  <th className="py-3 px-4">Patente & XP</th>
                  <th className="py-3 px-4">Desempenho</th>
                  <th className="py-3 px-4">Último Login</th>
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
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-bat-bg-secondary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 overflow-hidden shrink-0 shadow-inner">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              u.apelido?.[0]?.toUpperCase() || "S"
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-bat-text truncate">{u.nome}</p>
                            <span className="block font-normal text-bat-text-muted text-[11px] truncate">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-bat-gold-400 font-mono font-bold">
                        🦇 {u.apelido}
                        {u.apelidos_antigos?.length > 0 && (
                          <span className="block font-normal text-[10px] text-bat-text-muted">
                            antes: {u.apelidos_antigos.join(", ")}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.concurso_alvo ? (
                          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-bat-gold-400/15 text-bat-gold-400 border border-bat-gold-400/30">
                            🎯 {u.concurso_alvo}
                          </span>
                        ) : (
                          <span className="text-bat-text-muted text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-bat-text">Nv. {u.nivel_atual}</span>
                        <span className="block text-bat-text-muted text-[10px]">
                          {u.xp_total.toLocaleString("pt-BR")} XP
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400">
                              {u.taxa_acerto !== null && u.taxa_acerto !== undefined ? `${u.taxa_acerto}%` : "—"}
                            </span>
                            <span className="text-bat-gold-400 text-[11px]">🔥 {u.streak_dias}d</span>
                          </div>
                          <span className="block text-[10px] text-bat-text-muted">
                            {u.total_questoes_respondidas || 0} questões
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-bat-text-muted">
                        {formatarTempoRelativo(u.ultimo_login_em)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                            situacao === "ativa"
                              ? "bg-bat-success/10 text-bat-success border border-bat-success/30"
                              : situacao === "suspensa"
                              ? "bg-bat-warning/10 text-bat-warning border border-bat-warning/30"
                              : "bg-bat-error/10 text-bat-error border border-bat-error/30"
                          }`}
                        >
                          {situacao}
                        </span>
                        {u.role === "admin" && (
                          <span className="ml-1 badge-admin text-[9px]">ADMIN</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <button
                            onClick={() => setSoldadoDossie(u)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-bat-gold-400/10 hover:bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30 cursor-pointer"
                          >
                            👁️ Dossiê
                          </button>

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
                                rotulo="Suspender"
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

      {/* ═══ MODAL: DOSSIÊ TÁTICO DO SOLDADO ═══ */}
      {soldadoDossie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => setSoldadoDossie(null)}
              className="absolute top-4 right-4 text-bat-text-muted hover:text-bat-text text-xl p-2 cursor-pointer"
            >
              ✕
            </button>

            {/* Cabeçalho do Dossiê */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-bat-bg-secondary border-2 border-bat-gold-400/40 flex items-center justify-center font-bold text-2xl text-bat-gold-400 overflow-hidden shadow-lg shrink-0">
                {soldadoDossie.avatar_url ? (
                  <img src={soldadoDossie.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  soldadoDossie.apelido?.[0]?.toUpperCase() || "S"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="heading text-lg text-bat-text font-bold truncate">
                    {soldadoDossie.nome}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    soldadoDossie.role === 'admin' ? 'bg-bat-gold-400 text-black' : 'bg-bat-bg-secondary text-bat-text-muted border border-bat-border'
                  }`}>
                    {soldadoDossie.role === 'admin' ? 'ADMIN' : 'ALUNO'}
                  </span>
                </div>
                <p className="text-xs text-bat-text-muted">{soldadoDossie.email}</p>
                <p className="text-xs font-mono font-bold text-bat-gold-400 mt-1">
                  🦇 Apelido Atual: {soldadoDossie.apelido}
                </p>
              </div>
            </div>

            {/* Concurso Foco */}
            <div className="p-3.5 rounded-xl bg-bat-bg-primary border border-bat-border flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-bat-text-muted block">Concurso Alvo</span>
                <span className="text-sm font-bold text-bat-gold-400">
                  {soldadoDossie.concurso_alvo ? `🎯 ${soldadoDossie.concurso_alvo} ${soldadoDossie.concurso_nome ? `· ${soldadoDossie.concurso_nome}` : ''}` : 'Nenhum concurso selecionado'}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                soldadoDossie.situacao === 'ativa'
                  ? 'bg-bat-success/15 text-bat-success border border-bat-success/30'
                  : soldadoDossie.situacao === 'suspensa'
                  ? 'bg-bat-warning/15 text-bat-warning border border-bat-warning/30'
                  : 'bg-bat-error/15 text-bat-error border border-bat-error/30'
              }`}>
                {soldadoDossie.situacao?.toUpperCase()}
              </span>
            </div>

            {/* Estatísticas de Combate */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-bat-bg-primary border border-bat-border text-center">
                <span className="text-[10px] text-bat-text-muted block">Patente / Nível</span>
                <span className="text-base font-bold text-bat-text font-mono">Nv. {soldadoDossie.nivel_atual}</span>
                <span className="text-[10px] text-bat-text-muted block">{soldadoDossie.xp_total.toLocaleString("pt-BR")} XP</span>
              </div>
              <div className="p-3 rounded-xl bg-bat-bg-primary border border-bat-border text-center">
                <span className="text-[10px] text-bat-text-muted block">Ofensiva</span>
                <span className="text-base font-bold text-bat-gold-400 font-mono">🔥 {soldadoDossie.streak_dias} dias</span>
                <span className="text-[10px] text-bat-text-muted block">Sequência</span>
              </div>
              <div className="p-3 rounded-xl bg-bat-bg-primary border border-bat-border text-center">
                <span className="text-[10px] text-bat-text-muted block">Questões Feitas</span>
                <span className="text-base font-bold text-bat-text font-mono">{soldadoDossie.total_questoes_respondidas || 0}</span>
                <span className="text-[10px] text-bat-text-muted block">{soldadoDossie.total_acertos || 0} acertos</span>
              </div>
              <div className="p-3 rounded-xl bg-bat-bg-primary border border-bat-border text-center">
                <span className="text-[10px] text-bat-text-muted block">Precisão</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {soldadoDossie.taxa_acerto !== null && soldadoDossie.taxa_acerto !== undefined ? `${soldadoDossie.taxa_acerto}%` : '—'}
                </span>
                <span className="text-[10px] text-bat-text-muted block">Taxa de acerto</span>
              </div>
            </div>

            {/* Histórico de Apelidos */}
            {soldadoDossie.apelidos_antigos && soldadoDossie.apelidos_antigos.length > 0 && (
              <div className="p-3.5 rounded-xl bg-bat-bg-primary border border-bat-border space-y-1">
                <span className="text-[11px] font-bold text-bat-text-muted block">Histórico de Apelidos Anteriores:</span>
                <div className="flex flex-wrap gap-1.5">
                  {soldadoDossie.apelidos_antigos.map((ap, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-bat-bg-secondary text-[11px] font-mono text-bat-text-secondary border border-bat-border">
                      {ap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Datas de Acesso */}
            <div className="flex justify-between text-xs text-bat-text-muted font-mono pt-2 border-t border-bat-border/50">
              <span>Cadastrado: {new Date(soldadoDossie.criado_em).toLocaleDateString("pt-BR")}</span>
              <span>Último login: {formatarTempoRelativo(soldadoDossie.ultimo_login_em)}</span>
            </div>

            {/* Ações Táticas */}
            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-bat-border/50">
              {soldadoDossie.role === 'admin' ? (
                <button
                  onClick={() => {
                    moderarConta(soldadoDossie, "rebaixar");
                    setSoldadoDossie(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-bat-bg-secondary hover:bg-bat-error/20 text-bat-error border border-bat-error/30 cursor-pointer"
                >
                  Rebaixar a Aluno
                </button>
              ) : (
                <button
                  onClick={() => {
                    moderarConta(soldadoDossie, "promover");
                    setSoldadoDossie(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-bat-bg-secondary hover:bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30 cursor-pointer"
                >
                  Promover a Administrador
                </button>
              )}

              {soldadoDossie.situacao === 'ativa' ? (
                <>
                  <button
                    onClick={() => {
                      moderarConta(soldadoDossie, "suspender");
                      setSoldadoDossie(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-bat-warning/15 hover:bg-bat-warning/25 text-bat-warning border border-bat-warning/30 cursor-pointer"
                  >
                    Suspender por 7 Dias
                  </button>
                  <button
                    onClick={() => {
                      moderarConta(soldadoDossie, "desativar");
                      setSoldadoDossie(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-bat-error/15 hover:bg-bat-error/25 text-bat-error border border-bat-error/30 cursor-pointer"
                  >
                    Desativar Conta
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    moderarConta(soldadoDossie, "liberar");
                    setSoldadoDossie(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-bat-success/15 hover:bg-bat-success/25 text-bat-success border border-bat-success/30 cursor-pointer"
                >
                  Liberar Acesso
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 4: TICKETS DE SUPORTE (CHAT DE ATENDIMENTO) ═══ */}
      {aba === "tickets" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-bat-border/60">
            <div>
              <h2 className="heading text-xl text-bat-text flex items-center gap-2">
                <span>🎫</span> Central de Suporte & Chat com Alunos
              </h2>
              <p className="text-bat-text-secondary text-xs mt-0.5">
                Atendimento tático em tempo real: resolva chamados, responda dúvidas e preste suporte com identificação completa do combatente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-bat-error/15 text-bat-error border border-bat-error/30 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-bat-error animate-ping"></span>
                {tickets.filter((t) => t.status === "aberto").length} aberto(s)
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold">
                {tickets.filter((t) => t.status === "em_andamento").length} em análise
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
            {/* COLUNA ESQUERDA: LISTA DE TICKETS */}
            <div className={`lg:col-span-5 space-y-3 flex flex-col ${ticketSelecionadoId ? "hidden lg:flex" : "flex"}`}>
              {/* Filtros e Busca */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Buscar por aluno, email ou assunto..."
                  value={buscaTickets}
                  onChange={(e) => setBuscaTickets(e.target.value)}
                  className="input-field text-xs py-2 px-3 w-full"
                />
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-bat-bg-primary rounded-xl border border-bat-border text-xs">
                  {(["todos", "abertos", "resolvidos"] as const).map((f) => {
                    const count =
                      f === "todos"
                        ? tickets.length
                        : f === "abertos"
                        ? tickets.filter((t) => t.status === "aberto" || t.status === "em_andamento").length
                        : tickets.filter((t) => t.status === "resolvido" || t.status === "finalizado" || t.status === "respondido").length;

                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFiltroStatusTickets(f)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          filtroStatusTickets === f
                            ? "bg-bat-gold-400 text-black shadow-xs font-extrabold"
                            : "text-bat-text-muted hover:text-bat-text"
                        }`}
                      >
                        <span>{f === "todos" ? "Todos" : f === "abertos" ? "Abertos" : "Resolvidos"}</span>
                        <span className={`text-[10px] px-1 rounded-full ${filtroStatusTickets === f ? "bg-black/20 text-black" : "bg-bat-bg-card text-bat-text-secondary"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lista de Chamados */}
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 flex-1 custom-scrollbar">
                {(() => {
                  const listaFiltrada = tickets.filter((t: any) => {
                    const matchBusca =
                      !buscaTickets ||
                      t.titulo?.toLowerCase().includes(buscaTickets.toLowerCase()) ||
                      t.users?.nome?.toLowerCase().includes(buscaTickets.toLowerCase()) ||
                      t.users?.apelido?.toLowerCase().includes(buscaTickets.toLowerCase()) ||
                      t.users?.email?.toLowerCase().includes(buscaTickets.toLowerCase());

                    const matchStatus =
                      filtroStatusTickets === "todos"
                        ? true
                        : filtroStatusTickets === "abertos"
                        ? t.status === "aberto" || t.status === "em_andamento"
                        : t.status === "resolvido" || t.status === "finalizado" || t.status === "respondido";

                    return matchBusca && matchStatus;
                  });

                  if (listaFiltrada.length === 0) {
                    return (
                      <div className="p-8 text-center text-xs text-bat-text-muted bg-bat-bg-primary rounded-xl border border-bat-border space-y-1">
                        <span className="text-2xl block">📭</span>
                        <p>Nenhum chamado encontrado com esses filtros.</p>
                      </div>
                    );
                  }

                  return listaFiltrada.map((t: any) => {
                    const ativo = t.id === ticketSelecionadoId;
                    const ehAberto = t.status === "aberto";
                    const ehResolvido = t.status === "resolvido" || t.status === "finalizado";
                    const ehEmAndamento = t.status === "em_andamento";

                    return (
                      <button
                        key={t.id}
                        onClick={() => setTicketSelecionadoId(t.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                          ativo
                            ? "bg-bat-gold-400/15 border-bat-gold-400 shadow-lg ring-1 ring-bat-gold-400/40"
                            : "bg-bat-bg-primary border-bat-border/80 hover:border-bat-gold-400/40 hover:bg-bat-bg-elevated/40"
                        }`}
                      >
                        {ativo && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-bat-gold-400" />
                        )}

                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] uppercase font-bold text-bat-gold-400 tracking-wider flex items-center gap-1">
                            {t.motivo === "bugs" ? "🐛 Bug" : t.motivo === "ideia" ? "💡 Sugestão" : "📋 Dúvida"}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              ehAberto
                                ? "bg-bat-error/20 text-bat-error border border-bat-error/30 animate-pulse"
                                : ehEmAndamento
                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                : ehResolvido
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-bat-bg-secondary text-bat-text-muted"
                            }`}
                          >
                            {t.status.toUpperCase()}
                          </span>
                        </div>

                        <p className={`text-xs font-bold truncate ${ativo ? "text-bat-gold-400" : "text-bat-text"}`}>
                          {t.titulo}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-bat-border/40 text-[11px] text-bat-text-muted">
                          <span className="truncate font-medium text-bat-text-secondary flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-bat-gold-400/20 text-bat-gold-400 text-[9px] font-bold inline-flex items-center justify-center shrink-0">
                              {t.users?.apelido?.[0]?.toUpperCase() || "A"}
                            </span>
                            <span>{t.users?.nome || t.users?.apelido || "Aluno"}</span>
                          </span>
                          <span className="font-mono text-[10px] shrink-0 text-bat-text-muted">
                            {formatarTempoRelativo(t.atualizado_em || t.criado_em)}
                          </span>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* COLUNA DIREITA: CONVERSA / DETALHES DO TICKET */}
            <div className={`lg:col-span-7 bg-bat-bg-primary border border-bat-border rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-[560px] ${!ticketSelecionadoId ? "hidden lg:flex" : "flex"}`}>
              {ticketDetalhe ? (
                <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Botão voltar no mobile */}
                    <div className="lg:hidden mb-2">
                      <button
                        onClick={() => setTicketSelecionadoId(null)}
                        className="text-xs font-bold text-bat-gold-400 flex items-center gap-1.5 p-1 rounded-lg hover:bg-bat-bg-secondary cursor-pointer"
                      >
                        ← Voltar para lista de chamados
                      </button>
                    </div>

                    {/* Card de Identificação Completa do Aluno */}
                    <div className="p-3.5 rounded-xl bg-bat-bg-card border border-bat-border flex flex-wrap items-center justify-between gap-3 mb-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/50 flex items-center justify-center font-bold text-bat-gold-400 shrink-0 overflow-hidden text-sm shadow-inner">
                          {ticketDetalhe.users?.avatar_url ? (
                            <img src={ticketDetalhe.users.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            ticketDetalhe.users?.apelido?.[0]?.toUpperCase() || "A"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-bat-text text-xs sm:text-sm truncate">
                              {ticketDetalhe.users?.nome || "Aluno"}
                            </p>
                            <span className="px-1.5 py-0.2 rounded bg-bat-gold-400/15 text-bat-gold-400 text-[10px] font-mono font-bold">
                              Nv. {ticketDetalhe.users?.nivel_atual || 1}
                            </span>
                            {ticketDetalhe.users?.concurso_alvo && (
                              <span className="px-1.5 py-0.2 rounded bg-bat-bg-secondary text-bat-text-secondary text-[10px] font-bold border border-bat-border">
                                🎯 {ticketDetalhe.users.concurso_alvo}
                              </span>
                            )}
                            {ticketDetalhe.users?.streak_dias > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold">
                                🔥 {ticketDetalhe.users.streak_dias}d
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-bat-text-muted truncate mt-0.5">
                            🦇 @{ticketDetalhe.users?.apelido} · <span className="font-mono text-bat-text-secondary">{ticketDetalhe.users?.email}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {ticketDetalhe.users?.email && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(ticketDetalhe.users.email);
                              setEmailCopiado(true);
                              setTimeout(() => setEmailCopiado(false), 2000);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-bat-bg-secondary hover:bg-bat-bg-elevated text-bat-text-secondary border border-bat-border cursor-pointer transition-colors"
                          >
                            {emailCopiado ? "✓ Copiado!" : "📋 Copiar E-mail"}
                          </button>
                        )}
                        {ticketDetalhe.users && (
                          <button
                            type="button"
                            onClick={() => setSoldadoDossie(ticketDetalhe.users)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-bat-gold-400/10 hover:bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30 cursor-pointer transition-colors"
                          >
                            👁️ Ver Dossiê
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cabeçalho do Chamado e Controles de Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-bat-border/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-bat-bg-secondary text-bat-gold-400 border border-bat-border">
                            {ticketDetalhe.motivo === "bugs" ? "🐛 Bug" : ticketDetalhe.motivo === "ideia" ? "💡 Sugestão" : "📋 Dúvida"}
                          </span>
                          <h3 className="font-bold text-bat-text text-sm sm:text-base">
                            {ticketDetalhe.titulo}
                          </h3>
                        </div>
                        <p className="text-[11px] text-bat-text-muted font-mono mt-1">
                          Ticket #{ticketDetalhe.id.slice(0, 8)} · Aberto em {new Date(ticketDetalhe.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>

                      {/* Controle de Status Tático */}
                      <div className="flex items-center gap-1.5">
                        {ticketDetalhe.status !== "em_andamento" && ticketDetalhe.status !== "resolvido" && (
                          <button
                            onClick={() => handleMudarStatusTicket(ticketDetalhe.id, "em_andamento")}
                            disabled={atualizandoStatusTicket}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 cursor-pointer disabled:opacity-50 transition-colors"
                          >
                            ⚡ Colocar Em Análise
                          </button>
                        )}
                        {ticketDetalhe.status !== "resolvido" && ticketDetalhe.status !== "finalizado" ? (
                          <button
                            onClick={() => handleMudarStatusTicket(ticketDetalhe.id, "resolvido")}
                            disabled={atualizandoStatusTicket}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 cursor-pointer disabled:opacity-50 transition-colors"
                          >
                            ✅ Marcar Resolvido
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMudarStatusTicket(ticketDetalhe.id, "aberto")}
                            disabled={atualizandoStatusTicket}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-bat-gold-400/15 hover:bg-bat-gold-400/25 text-bat-gold-400 border border-bat-gold-400/30 cursor-pointer disabled:opacity-50 transition-colors"
                          >
                            🔄 Reabrir Chamado
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chat Feed de Mensagens (Estilo Conversacional Moderno) */}
                    <div className="space-y-3.5 h-[360px] sm:h-[400px] overflow-y-auto pr-2 p-3.5 bg-bat-bg-card/40 rounded-2xl border border-bat-border/60 custom-scrollbar">
                      {/* Pinned Card de Abertura do Chamado */}
                      <div className="text-center my-1">
                        <span className="inline-block px-3 py-1 rounded-full bg-bat-bg-secondary border border-bat-border text-[10px] font-semibold text-bat-text-muted">
                          📌 Início do chamado aberto por @{ticketDetalhe.users?.apelido || "aluno"}
                        </span>
                      </div>

                      {(ticketDetalhe.mensagens || []).map((m: any) => {
                        const ehAdmin = m.autor_role === "admin";
                        const horaFormatada = m.enviado_em
                          ? new Date(m.enviado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                          : "";

                        if (ehAdmin) {
                          // Balão da Administração (Direita)
                          return (
                            <div key={m.id} className="flex items-end gap-2.5 max-w-[85%] sm:max-w-[78%] ml-auto justify-end">
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] text-bat-gold-400 font-bold mr-1 mb-1 flex items-center gap-1">
                                  <span>🛡️</span> Administração (Você)
                                </span>
                                <div className="p-3.5 rounded-2xl rounded-tr-xs bg-gradient-to-br from-bat-gold-400/20 via-bat-gold-400/10 to-bat-bg-elevated border border-bat-gold-400/40 text-bat-text shadow-md">
                                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed select-text font-normal">
                                    {m.conteudo}
                                  </p>
                                  <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-bat-gold-400/80 font-mono">
                                    <span>{horaFormatada}</span>
                                    <span title="Entregue ao aluno">✓✓</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/50 flex items-center justify-center font-bold text-bat-gold-400 shrink-0 text-xs shadow-xs">
                                🦇
                              </div>
                            </div>
                          );
                        }

                        // Balão do Aluno (Esquerda)
                        return (
                          <div key={m.id} className="flex items-end gap-2.5 max-w-[85%] sm:max-w-[78%] mr-auto">
                            <div className="w-8 h-8 rounded-full bg-bat-bg-card border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 shrink-0 overflow-hidden text-xs shadow-xs">
                              {ticketDetalhe.users?.avatar_url ? (
                                <img src={ticketDetalhe.users.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                ticketDetalhe.users?.apelido?.[0]?.toUpperCase() || "A"
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-bat-text-muted font-semibold ml-1 mb-1 flex items-center gap-1">
                                <span>👤</span> {ticketDetalhe.users?.nome || ticketDetalhe.users?.apelido || "Aluno"}
                              </span>
                              <div className="p-3.5 rounded-2xl rounded-tl-xs bg-bat-bg-card border border-bat-border text-bat-text shadow-sm">
                                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed select-text font-normal">
                                  {m.conteudo}
                                </p>
                                <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-bat-text-muted font-mono">
                                  <span>{horaFormatada}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatMensagensEndRef} />
                    </div>
                  </div>

                  {/* Respostas Rápidas & Caixa de Envio */}
                  <div className="pt-2 border-t border-bat-border/60 space-y-2.5">
                    {/* Chips de Resposta Rápida (Canned Responses) */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] uppercase font-bold text-bat-text-muted tracking-wider">
                          ⚡ Respostas Rápidas:
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                        {[
                          { label: "🚀 Resolvido", texto: "Olá, soldado! O erro reportado foi analisado e corrigido com sucesso em nossa plataforma. Qualquer outra dúvida, estamos à disposição!" },
                          { label: "🔍 Em Análise", texto: "Olá! Recebemos seu chamado e nossa equipe técnica já está analisando os detalhes para solucionar o mais rápido possível." },
                          { label: "📸 Pedir Print", texto: "Olá, combatente! Poderia nos fornecer mais detalhes sobre o ocorrido (ou um print da tela e qual aparelho/navegador você está usando) para agilizar o suporte?" },
                          { label: "💡 Ideia Anotada", texto: "Excelente sugestão! Registramos sua recomendação diretamente no nosso backlog de melhorias da plataforma. Muito obrigado pela contribuição!" },
                          { label: "✅ Dúvida Esclarecida", texto: "Olá! Esperamos ter esclarecido sua dúvida. Se precisar de mais alguma orientação nos estudos, pode contar sempre com a BatCaverna!" },
                        ].map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => setTextoResposta(chip.texto)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-bat-bg-secondary hover:bg-bat-gold-400/15 hover:text-bat-gold-400 hover:border-bat-gold-400/40 text-bat-text-secondary border border-bat-border cursor-pointer shrink-0 transition-all"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Caixa de Texto */}
                    <div className="space-y-2">
                      <textarea
                        placeholder={`Escreva sua resposta para @${ticketDetalhe.users?.apelido || "o aluno"} (ou selecione uma resposta rápida acima)...`}
                        value={textoResposta}
                        onChange={(e) => setTextoResposta(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            e.preventDefault();
                            handleResponderTicket(ticketDetalhe.id);
                          }
                        }}
                        rows={3}
                        className="w-full input-field text-xs sm:text-sm resize-none rounded-xl py-2.5 px-3.5 focus:border-bat-gold-400"
                      />
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-bat-text-secondary cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={resolverAoResponder}
                              onChange={(e) => setResolverAoResponder(e.target.checked)}
                              className="h-3.5 w-3.5 rounded border-bat-border text-bat-gold-400 focus:ring-bat-gold-400/40 bg-bat-bg-card accent-bat-gold-400 cursor-pointer"
                            />
                            <span>Marcar como resolvido após enviar</span>
                          </label>
                          <span className="hidden sm:inline-block text-[11px] text-bat-text-muted">
                            · Pressione <kbd className="px-1 py-0.5 rounded bg-bat-bg-secondary border border-bat-border text-[10px] font-mono">Ctrl+Enter</kbd>
                          </span>
                        </div>
                        <button
                          onClick={() => handleResponderTicket(ticketDetalhe.id)}
                          disabled={enviandoResposta || !textoResposta.trim()}
                          className="btn-primary py-2 px-6 text-xs sm:text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md w-full sm:w-auto"
                        >
                          {enviandoResposta ? "Enviando resposta..." : "Enviar Resposta 🚀"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-bat-text-muted text-xs p-8 text-center space-y-3">
                  <span className="text-4xl block">🎫</span>
                  <p className="font-bold text-bat-text text-sm">Nenhum chamado selecionado</p>
                  <p className="max-w-xs text-bat-text-muted">
                    Selecione um chamado na lista ao lado para abrir a conversa ao vivo, consultar o perfil do aluno e responder.
                  </p>
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
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-bat-border/60">
            <div>
              <h2 className="heading text-xl text-bat-text flex items-center gap-2">
                <span>🛡️</span> Moderação de Conversas & Palavras Ofensivas
              </h2>
              <p className="text-bat-text-secondary text-xs mt-0.5">
                Auditoria de mensagens entre alunos: identifique assédio, termos ofensivos ou comportamento inapropriado.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-bat-bg-secondary text-bat-text-secondary border border-bat-border font-bold">
                {conversasModeracao.length} conversa(s)
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-bat-error/15 text-bat-error border border-bat-error/30 font-bold">
                {conversasModeracao.filter((c) => c.mensagens_sinalizadas > 0).length} com alerta(s)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
            {/* COLUNA ESQUERDA: LISTA DE CONVERSAS */}
            <div className="lg:col-span-5 space-y-3 flex flex-col">
              {/* Barra de Busca e Filtro */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Buscar combatente por nome ou apelido..."
                  value={buscaConversasModeracao}
                  onChange={(e) => setBuscaConversasModeracao(e.target.value)}
                  className="input-field text-xs py-2 px-3 w-full"
                />
                <button
                  type="button"
                  onClick={() => setFiltroApenasSinalizadas(!filtroApenasSinalizadas)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                    filtroApenasSinalizadas
                      ? "bg-bat-error/20 text-bat-error border-bat-error/40 shadow-xs"
                      : "bg-bat-bg-primary text-bat-text-secondary border-bat-border hover:text-bat-text"
                  }`}
                >
                  <span>⚠️</span>
                  <span>{filtroApenasSinalizadas ? "Mostrando apenas conversas com flags" : "Filtrar apenas com mensagens sinalizadas"}</span>
                </button>
              </div>

              {/* Lista */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 flex-1 custom-scrollbar">
                {(() => {
                  const conversasFiltradas = conversasModeracao.filter((c) => {
                    const termo = buscaConversasModeracao.toLowerCase().trim();
                    const matchBusca =
                      !termo ||
                      c.user_a?.apelido?.toLowerCase().includes(termo) ||
                      c.user_a?.nome?.toLowerCase().includes(termo) ||
                      c.user_b?.apelido?.toLowerCase().includes(termo) ||
                      c.user_b?.nome?.toLowerCase().includes(termo);

                    const matchFlag = filtroApenasSinalizadas ? c.mensagens_sinalizadas > 0 : true;

                    return matchBusca && matchFlag;
                  });

                  if (conversasFiltradas.length === 0) {
                    return (
                      <div className="p-8 text-center text-xs text-bat-text-muted bg-bat-bg-primary rounded-xl border border-bat-border space-y-1">
                        <span className="text-2xl block">💬</span>
                        <p>Nenhuma conversa encontrada com esses filtros.</p>
                      </div>
                    );
                  }

                  return conversasFiltradas.map((c) => {
                    const ativa = c.id === conversaModeracaoAtivaId;
                    const temFlag = c.mensagens_sinalizadas > 0;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setConversaModeracaoAtivaId(c.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                          ativa
                            ? "bg-bat-gold-400/15 border-bat-gold-400 shadow-md ring-1 ring-bat-gold-400/40"
                            : temFlag
                            ? "bg-bat-bg-primary border-bat-error/40 hover:border-bat-error/70"
                            : "bg-bat-bg-primary border-bat-border/80 hover:border-bat-gold-400/40 hover:bg-bat-bg-elevated/40"
                        }`}
                      >
                        {ativa && <div className="absolute left-0 top-0 bottom-0 w-1 bg-bat-gold-400" />}

                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-bat-text truncate">
                              @{c.user_a?.apelido || "Aluno A"}
                            </span>
                            <span className="text-bat-gold-400 text-xs font-bold">↔</span>
                            <span className="text-xs font-bold text-bat-text truncate">
                              @{c.user_b?.apelido || "Aluno B"}
                            </span>
                          </div>
                          {temFlag && (
                            <span className="px-2 py-0.5 rounded-full bg-bat-error/20 text-bat-error border border-bat-error/30 text-[10px] font-bold shrink-0 animate-pulse">
                              ⚠️ {c.mensagens_sinalizadas} flag(s)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-bat-text-muted mt-2 pt-2 border-t border-bat-border/40">
                          <span>{c.total_mensagens || 0} mensagens trocadas</span>
                          <span className="font-mono text-[10px]">
                            {c.ultima_mensagem_em ? formatarTempoRelativo(c.ultima_mensagem_em) : ""}
                          </span>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* COLUNA DIREITA: VISUALIZADOR DE CONVERSA */}
            <div className="lg:col-span-7 bg-bat-bg-primary border border-bat-border rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-[520px]">
              {(() => {
                const conversaAtiva = conversasModeracao.find((c) => c.id === conversaModeracaoAtivaId);

                if (!conversaModeracaoAtivaId || !conversaAtiva) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-bat-text-muted text-xs p-8 text-center space-y-2 my-auto">
                      <span className="text-3xl block">🛡️</span>
                      <p className="font-bold text-bat-text text-sm">Selecione uma conversa ao lado</p>
                      <p>Escolha um diálogo para auditar o histórico de mensagens e termos sinalizados.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Header com os Dois Alunos e Atalhos para Dossiê */}
                      <div className="p-3.5 rounded-xl bg-bat-bg-card border border-bat-border mb-3.5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Aluno A */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center font-bold text-cyan-400 shrink-0 text-xs">
                              {conversaAtiva.user_a?.apelido?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-bat-text text-xs truncate">
                                {conversaAtiva.user_a?.nome || conversaAtiva.user_a?.apelido}
                              </p>
                              <p className="text-[10px] text-cyan-400 font-mono">@{conversaAtiva.user_a?.apelido}</p>
                            </div>
                            {conversaAtiva.user_a && (
                              <button
                                type="button"
                                onClick={() => {
                                  const u = usuarios.find((user) => user.id === conversaAtiva.user_a?.id);
                                  if (u) setSoldadoDossie(u);
                                }}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-bat-bg-secondary hover:bg-bat-bg-elevated text-bat-text-secondary border border-bat-border cursor-pointer transition-colors shrink-0"
                              >
                                👁️ Dossiê
                              </button>
                            )}
                          </div>

                          <div className="hidden sm:flex text-bat-gold-400 font-bold text-sm px-2">↔</div>

                          {/* Aluno B */}
                          <div className="flex items-center gap-2.5 min-w-0 justify-end">
                            {conversaAtiva.user_b && (
                              <button
                                type="button"
                                onClick={() => {
                                  const u = usuarios.find((user) => user.id === conversaAtiva.user_b?.id);
                                  if (u) setSoldadoDossie(u);
                                }}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-bat-bg-secondary hover:bg-bat-bg-elevated text-bat-text-secondary border border-bat-border cursor-pointer transition-colors shrink-0"
                              >
                                👁️ Dossiê
                              </button>
                            )}
                            <div className="min-w-0 text-right">
                              <p className="font-bold text-bat-text text-xs truncate">
                                {conversaAtiva.user_b?.nome || conversaAtiva.user_b?.apelido}
                              </p>
                              <p className="text-[10px] text-amber-400 font-mono">@{conversaAtiva.user_b?.apelido}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center font-bold text-amber-400 shrink-0 text-xs">
                              {conversaAtiva.user_b?.apelido?.[0]?.toUpperCase() || "B"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Feed de Mensagens */}
                      <div className="space-y-3 h-[380px] sm:h-[420px] overflow-y-auto pr-2 p-3.5 bg-bat-bg-card/40 rounded-2xl border border-bat-border/60 custom-scrollbar">
                        {mensagensModeracao.length === 0 ? (
                          <div className="text-center text-bat-text-muted text-xs py-10">
                            Nenhuma mensagem registrada nesta conversa.
                          </div>
                        ) : (
                          mensagensModeracao.map((m) => {
                            const isUserA = m.autor?.id === conversaAtiva.user_a?.id;
                            const horaFormatada = m.enviado_em
                              ? new Date(m.enviado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                              : "";

                            return (
                              <div
                                key={m.id}
                                className={`flex flex-col ${isUserA ? "items-start mr-auto" : "items-end ml-auto"} max-w-[85%] sm:max-w-[75%]`}
                              >
                                <span className="text-[10px] text-bat-text-muted font-semibold mb-1 flex items-center gap-1">
                                  <span className={isUserA ? "text-cyan-400" : "text-amber-400"}>
                                    @{m.autor?.apelido || "Aluno"}
                                  </span>
                                  <span>· {horaFormatada}</span>
                                </span>

                                <div
                                  className={`p-3.5 rounded-2xl border transition-all ${
                                    m.sinalizada_para_revisao
                                      ? "bg-red-950/40 border-red-500/70 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-red-500/50"
                                      : isUserA
                                      ? "bg-bat-bg-card rounded-tl-xs border-cyan-500/25 text-bat-text"
                                      : "bg-bat-bg-card rounded-tr-xs border-amber-500/25 text-bat-text"
                                  }`}
                                >
                                  {m.sinalizada_para_revisao && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 mb-1.5 uppercase tracking-wider">
                                      <span>🚨</span>
                                      <span>Sinalizada para revisão</span>
                                    </div>
                                  )}
                                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed select-text">
                                    {m.conteudo_texto || m.tipo?.toUpperCase() || "(Mensagem sem texto)"}
                                  </p>
                                </div>

                                <div className="mt-1 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFlagMensagem(m.id, m.sinalizada_para_revisao)}
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold cursor-pointer border transition-colors ${
                                      m.sinalizada_para_revisao
                                        ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"
                                        : "bg-bat-bg-secondary text-bat-text-muted border-bat-border hover:text-bat-text"
                                    }`}
                                  >
                                    {m.sinalizada_para_revisao ? "Desmarcar ✕" : "Sinalizar ⚠️"}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
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

      {/* ═══ TAB: BANCO DE QUESTÕES (NOVO) ═══ */}
      {aba === "questoes" && <PainelBancoQuestoes />}

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

      {/* ═══ MODAL: DIÁRIO TÁTICO DE ATUALIZAÇÕES DO ADMIN ═══ */}
      {modalAdminNovidadesAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-bat-bg-card border border-bat-gold-400/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-bat-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/40 font-mono">
                    PAINEL ADMIN v{CURRENT_ADMIN_VERSION}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-bat-bg-secondary text-bat-text-muted border border-bat-border">
                    CONFIDENCIAL DO ALTO COMANDO
                  </span>
                </div>
                <h2 className="heading text-xl sm:text-2xl text-bat-text">
                  Diário Tático de Atualizações do Admin
                </h2>
                <p className="text-xs text-bat-text-secondary leading-relaxed">
                  Histórico isolado de evolução interna da moderação, suporte, auditoria e infraestrutura da BatCaverna. Estas informações não são visíveis aos alunos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAdminNovidadesAberto(false)}
                className="w-8 h-8 rounded-full bg-bat-bg-primary hover:bg-bat-bg-secondary border border-bat-border flex items-center justify-center text-bat-text-muted hover:text-bat-text transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Lista de Versões do Admin */}
            <div className="space-y-6">
              {ADMIN_CHANGELOG_HISTORY.map((rel) => (
                <div
                  key={rel.versao}
                  className="bg-bat-bg-primary border border-bat-border rounded-2xl p-5 space-y-3.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-bat-gold-400 bg-bat-gold-400/10 px-2.5 py-1 rounded-lg border border-bat-gold-400/30">
                        v{rel.versao}
                      </span>
                      {rel.versao === CURRENT_ADMIN_VERSION && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 rounded">
                          ATIVO
                        </span>
                      )}
                      <h3 className="font-bold text-sm text-bat-text">{rel.titulo}</h3>
                    </div>
                    <span className="text-[10px] text-bat-text-muted font-mono">
                      {formatarDataHoraVersao(rel.dataLancamento)}
                    </span>
                  </div>

                  <p className="text-xs text-bat-text-secondary leading-relaxed bg-bat-bg-card p-3 rounded-xl border border-bat-border/60">
                    {rel.resumo}
                  </p>

                  <div className="space-y-2 pt-1">
                    <h4 className="text-[11px] font-bold text-bat-text-muted uppercase tracking-wider">
                      Módulos Atualizados:
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {rel.alteracoes.map((alt, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-bat-text-secondary bg-bat-bg-secondary/40 p-2.5 rounded-lg border border-bat-border/40"
                        >
                          <span className="text-bat-gold-400 font-bold shrink-0 text-[11px] min-w-[120px]">
                            [{alt.modulo}]
                          </span>
                          <span className="leading-snug">{alt.descricao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé com botão de fechar */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setModalAdminNovidadesAberto(false)}
                className="btn-primary py-2 px-6 text-xs font-bold"
              >
                Fechar Diário Tático
              </button>
            </div>
          </div>
        </div>
      )}
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
