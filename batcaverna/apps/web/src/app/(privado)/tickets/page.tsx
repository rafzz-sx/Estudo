"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  user_id?: string;
  titulo: string;
  motivo: "bugs" | "ideia" | "outros";
  status: "aberto" | "respondido" | "finalizado";
  criado_em: string;
  atualizado_em: string;
  mensagens?: TicketMensagem[];
}

type CategoriaOption = {
  id: string;
  motivoDb: "bugs" | "ideia" | "outros";
  label: string;
  icon: string;
  desc: string;
  prefixo?: string;
};

const CATEGORIAS: CategoriaOption[] = [
  {
    id: "duvida",
    motivoDb: "outros",
    label: "Dúvida de Estudo",
    icon: "❓",
    desc: "Dúvidas sobre matérias, questões ou ferramentas da plataforma",
    prefixo: "[Dúvida]",
  },
  {
    id: "bugs",
    motivoDb: "bugs",
    label: "Reportar Bug",
    icon: "🐛",
    desc: "Falha técnica, erro em simulado ou problema de exibição",
    prefixo: "[Bug]",
  },
  {
    id: "pagamento",
    motivoDb: "outros",
    label: "Assinatura & Planos",
    icon: "💳",
    desc: "Pagamentos, renovações, faturas ou liberação de acesso",
    prefixo: "[Assinatura]",
  },
  {
    id: "ideia",
    motivoDb: "ideia",
    label: "Sugestão / Ideia",
    icon: "💡",
    desc: "Recurso ou melhoria que você gostaria de ver na caverna",
    prefixo: "[Ideia]",
  },
  {
    id: "denuncia",
    motivoDb: "outros",
    label: "Moderação & Denúncia",
    icon: "🚨",
    desc: "Comportamento abusivo de usuários no chat ou grupos",
    prefixo: "[Moderação]",
  },
  {
    id: "outros",
    motivoDb: "outros",
    label: "Outro Assunto",
    icon: "📋",
    desc: "Qualquer outro tópico que você queira tratar com o comando",
    prefixo: "[Geral]",
  },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string; icon: string }> = {
  aberto: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    label: "Em Análise",
    icon: "⏳",
  },
  respondido: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    label: "Respondido pelo Comando",
    icon: "💬",
  },
  finalizado: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
    label: "Concluído",
    icon: "✅",
  },
};

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
  const [filtroAba, setFiltroAba] = useState<"todos" | "aberto" | "respondido" | "finalizado">("todos");
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketAbertoId, setTicketAbertoId] = useState<string | null>(null);
  const [ticketDetalhe, setTicketDetalhe] = useState<Ticket | null>(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [finalizandoTicket, setFinalizandoTicket] = useState(false);

  // Form Novo Ticket
  const [criandoTicket, setCriandoTicket] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("duvida");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDesc, setNovaDesc] = useState("");
  const [enviandoTicket, setEnviandoTicket] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  // Form Nova Mensagem
  const [novaMensagem, setNovaMensagem] = useState("");
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  const mensagensEndRef = useRef<HTMLDivElement>(null);

  const rolarParaFinal = (suave = true) => {
    mensagensEndRef.current?.scrollIntoView({
      behavior: suave ? "smooth" : "auto",
    });
  };

  // 1. Carregar lista de tickets pessoais do aluno (estritamente do usuário autenticado)
  const carregarTickets = useCallback(async (silencioso = false) => {
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
  }, [ticketAbertoId, criandoTicket]);

  // 2. Carregar detalhes e mensagens do ticket aberto
  const carregarDetalhesTicket = useCallback(async (id: string, silencioso = true) => {
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
  }, [ticketDetalhe]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    carregarTickets();
  }, [carregarTickets]);

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
  }, [ticketAbertoId, carregarDetalhesTicket, tickets]);

  // Polling silencioso adaptativo (somente quando visível)
  useEffect(() => {
    if (!ticketAbertoId) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        carregarDetalhesTicket(ticketAbertoId, true);
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [ticketAbertoId, carregarDetalhesTicket]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        carregarTickets(true);
      }
    }, 20000);
    return () => clearInterval(timer);
  }, [carregarTickets]);

  // Criar novo ticket
  const handleCriarTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm(null);

    const tituloLimpo = novoTitulo.trim();
    const descLimpa = novaDesc.trim();

    if (tituloLimpo.length < 5) {
      setErroForm("Por favor, informe um título com pelo menos 5 caracteres.");
      return;
    }
    if (descLimpa.length < 10) {
      setErroForm("Por favor, descreva sua solicitação com pelo menos 10 caracteres.");
      return;
    }

    const catObj = CATEGORIAS.find((c) => c.id === categoriaSelecionada) || CATEGORIAS[0];
    const tituloFinal = catObj.prefixo && !tituloLimpo.startsWith("[")
      ? `${catObj.prefixo} ${tituloLimpo}`
      : tituloLimpo;

    setEnviandoTicket(true);
    try {
      const res = await fetchWithAuth("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivo: catObj.motivoDb,
          titulo: tituloFinal,
          descricao: descLimpa,
          mensagem_inicial: descLimpa,
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
        setErroForm(json.error || "Não foi possível enviar o chamado. Verifique os campos.");
      }
    } catch {
      setErroForm("Erro de conexão ao enviar chamado.");
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
    } catch {
      alert("Erro ao enviar mensagem.");
      carregarDetalhesTicket(ticketAbertoId, true);
    } finally {
      setEnviandoMensagem(false);
    }
  };

  // Aluno resolve/finaliza o próprio chamado
  const handleFinalizarTicket = async () => {
    if (!ticketAbertoId || finalizandoTicket) return;
    const confirmou = window.confirm("Deseja marcar este chamado como resolvido e concluído?");
    if (!confirmou) return;

    setFinalizandoTicket(true);
    try {
      const res = await fetchWithAuth(`/api/tickets/${ticketAbertoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "finalizado" }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setTicketDetalhe((prev) => (prev ? { ...prev, status: "finalizado" } : prev));
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketAbertoId ? { ...t, status: "finalizado" } : t))
        );
      } else {
        alert(json.error || "Não foi possível concluir o chamado.");
      }
    } catch {
      alert("Erro ao finalizar chamado.");
    } finally {
      setFinalizandoTicket(false);
    }
  };

  // Contadores de status
  const contagens = useMemo(() => {
    const abertos = tickets.filter((t) => t.status === "aberto").length;
    const respondidos = tickets.filter((t) => t.status === "respondido").length;
    const finalizados = tickets.filter((t) => t.status === "finalizado").length;
    return { abertos, respondidos, finalizados, total: tickets.length };
  }, [tickets]);

  // Filtragem dos tickets do aluno
  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((t) => {
      if (filtroAba !== "todos" && t.status !== filtroAba) return false;
      if (!buscaTickets.trim()) return true;
      const termo = buscaTickets.toLowerCase();
      return (
        t.titulo.toLowerCase().includes(termo) ||
        t.motivo.toLowerCase().includes(termo) ||
        t.status.toLowerCase().includes(termo) ||
        t.id.toLowerCase().includes(termo)
      );
    });
  }, [tickets, filtroAba, buscaTickets]);

  const obterBadgeCategoria = (titulo: string, motivo: string) => {
    for (const cat of CATEGORIAS) {
      if (cat.prefixo && titulo.includes(cat.prefixo)) {
        return { label: cat.label, icon: cat.icon };
      }
    }
    if (motivo === "bugs") return { label: "Bug Técnico", icon: "🐛" };
    if (motivo === "ideia") return { label: "Sugestão", icon: "💡" };
    return { label: "Atendimento", icon: "📋" };
  };

  return (
    <div className={`space-y-6 pb-20 max-w-7xl mx-auto transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
      {/* ═══ CABEÇALHO HERO COM SELO DE PRIVACIDADE & BLINDAGEM ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-4">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-bat-gold-400/10 border border-bat-gold-400/30 text-bat-gold-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-bat-gold-400 animate-pulse" />
              Canal de Atendimento Privado · Soldado {user?.apelido || "BatCaverna"}
            </div>

            <h1 className="heading text-2xl sm:text-4xl text-bat-text font-black tracking-tight">
              Central de <span className="text-bat-gold-400">Suporte Oficial</span>
            </h1>

            <p className="text-bat-text-secondary text-xs sm:text-sm max-w-2xl leading-relaxed">
              Tire dúvidas pedagógicas, relate inconsistências ou fale diretamente com a equipe do Comando BatCaverna.
            </p>
          </div>

          <button
            onClick={() => {
              setCriandoTicket(true);
              setTicketAbertoId(null);
              setTicketDetalhe(null);
            }}
            className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-bat-gold-400/20 cursor-pointer self-start sm:self-auto"
          >
            <span>＋</span>
            <span>Abrir Novo Chamado</span>
          </button>
        </div>

        {/* ═══ BANNER DE GARANTIA DE PRIVACIDADE ═══ */}
        <div className="relative z-10 p-3.5 sm:p-4 rounded-2xl bg-bat-bg-primary/90 border border-bat-border/80 flex items-start gap-3 text-xs">
          <span className="text-xl shrink-0 p-1 rounded-lg bg-bat-gold-400/10 text-bat-gold-400">
            🔒
          </span>
          <div className="space-y-0.5">
            <h4 className="font-bold text-bat-text text-xs flex items-center gap-2">
              <span>Isolamento e Sigilo Absoluto dos Chamados</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                100% Confidencial
              </span>
            </h4>
            <p className="text-bat-text-muted leading-relaxed text-[11px]">
              Seus tickets são estritamente individuais e identificados por protocolo exclusivo. Nenhum outro
              aluno da plataforma tem permissão para visualizar suas mensagens, dados ou históricos de atendimento.
            </p>
          </div>
        </div>

        {/* Efeito luminoso de fundo */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-bat-gold-400/10 via-bat-gold-400/5 to-transparent pointer-events-none" />
      </div>

      {/* ═══ CONTAINER PRINCIPAL (LISTA + CONVERSA) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* ─── LATERAL ESQUERDA: LISTA DE CHAMADOS DO ALUNO (4 COLUNAS) ─── */}
        <div className="lg:col-span-4 flex flex-col bg-bat-bg-card border border-bat-border rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
          {/* Topo da lista com contadores e abas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-bat-text-muted">
                Seus Protocolos ({tickets.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Sincronizado
              </span>
            </div>

            {/* Abas Rápidas de Status */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-bat-bg-primary rounded-xl border border-bat-border/60 text-[11px] font-bold">
              <button
                onClick={() => setFiltroAba("todos")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer truncate ${
                  filtroAba === "todos"
                    ? "bg-bat-gold-400 text-black shadow-xs"
                    : "text-bat-text-muted hover:text-bat-text"
                }`}
              >
                Todos ({contagens.total})
              </button>
              <button
                onClick={() => setFiltroAba("aberto")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer truncate ${
                  filtroAba === "aberto"
                    ? "bg-amber-400 text-black shadow-xs"
                    : "text-bat-text-muted hover:text-bat-text"
                }`}
              >
                Abertos ({contagens.abertos})
              </button>
              <button
                onClick={() => setFiltroAba("respondido")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer truncate ${
                  filtroAba === "respondido"
                    ? "bg-emerald-400 text-black shadow-xs"
                    : "text-bat-text-muted hover:text-bat-text"
                }`}
              >
                Respostas ({contagens.respondidos})
              </button>
              <button
                onClick={() => setFiltroAba("finalizado")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer truncate ${
                  filtroAba === "finalizado"
                    ? "bg-slate-300 text-black shadow-xs"
                    : "text-bat-text-muted hover:text-bat-text"
                }`}
              >
                Fim ({contagens.finalizados})
              </button>
            </div>

            {/* Busca textual de chamados */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por protocolo, assunto ou status..."
                value={buscaTickets}
                onChange={(e) => setBuscaTickets(e.target.value)}
                className="w-full bg-bat-bg-primary border border-bat-border rounded-xl pl-8 pr-7 py-2 text-xs text-bat-text placeholder-bat-text-muted focus:outline-none focus:border-bat-gold-400/60 transition-colors"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-bat-text-muted text-xs">
                🔍
              </span>
              {buscaTickets && (
                <button
                  onClick={() => setBuscaTickets("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-bat-text-muted hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Lista Rolável de Tickets */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[560px]">
            {loadingTickets ? (
              <div className="p-8 text-center text-xs text-bat-text-muted animate-pulse">
                Carregando seus chamados...
              </div>
            ) : ticketsFiltrados.length === 0 ? (
              <div className="p-8 text-center text-bat-text-muted text-xs bg-bat-bg-primary/50 rounded-2xl border border-bat-border/50 space-y-2">
                <span className="text-3xl block">🎫</span>
                <p className="font-bold text-bat-text">Nenhum chamado neste filtro</p>
                <p className="text-[11px] leading-relaxed">
                  {buscaTickets
                    ? "Tente buscar por outro termo ou limpe a busca."
                    : "Você ainda não possui chamados abertos nesta categoria."}
                </p>
              </div>
            ) : (
              ticketsFiltrados.map((t) => {
                const ativo = ticketAbertoId === t.id && !criandoTicket;
                const categoria = obterBadgeCategoria(t.titulo, t.motivo);
                const statusCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.aberto;
                const protocolo = `#TKT-${t.id.slice(0, 8).toUpperCase()}`;

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCriandoTicket(false);
                      setTicketAbertoId(t.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative ${
                      ativo
                        ? "bg-bat-gold-400/10 border-bat-gold-400 shadow-md shadow-bat-gold-400/10"
                        : "bg-bat-bg-primary/70 border-bat-border/70 hover:border-bat-gold-400/40 hover:bg-bat-bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-bat-gold-400 bg-bat-bg-card px-2 py-0.5 rounded border border-bat-gold-400/20">
                        {protocolo}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        <span>{statusCfg.icon}</span>
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-bold truncate mb-1 ${
                        ativo ? "text-bat-gold-400" : "text-bat-text"
                      }`}
                    >
                      {t.titulo}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-bat-text-muted mt-2 pt-2 border-t border-bat-border/40 font-mono">
                      <span className="flex items-center gap-1">
                        <span>{categoria.icon}</span>
                        <span>{categoria.label}</span>
                      </span>
                      <span>{new Date(t.criado_em).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ─── ÁREA PRINCIPAL: CHAT DE ATENDIMENTO OU FORMULÁRIO (8 COLUNAS) ─── */}
        <div className="lg:col-span-8 flex flex-col bg-bat-bg-card border border-bat-border rounded-3xl overflow-hidden shadow-xl">
          {criandoTicket ? (
            /* ═══ FORMULÁRIO DE NOVO CHAMADO ═══ */
            <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full animate-fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-bat-gold-400/10 text-bat-gold-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <span>🚀</span>
                  <span>Abertura de Protocolo Individual</span>
                </div>
                <h3 className="heading text-xl sm:text-2xl font-black text-bat-text">
                  Como o Comando BatCaverna pode te ajudar?
                </h3>
                <p className="text-xs text-bat-text-secondary mt-1 leading-relaxed">
                  Descreva sua necessidade com o máximo de detalhes para podermos resolver o quanto antes.
                </p>
              </div>

              <form onSubmit={handleCriarTicket} className="space-y-4">
                {/* Seleção de Categoria */}
                <div>
                  <label className="text-bat-text-secondary text-xs mb-1.5 block font-bold uppercase tracking-wider">
                    1. Qual a categoria do chamado?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIAS.map((cat) => {
                      const selecionada = categoriaSelecionada === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoriaSelecionada(cat.id)}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                            selecionada
                              ? "bg-bat-gold-400/15 border-bat-gold-400 text-bat-text shadow-sm"
                              : "bg-bat-bg-primary/80 border-bat-border text-bat-text-muted hover:border-bat-gold-400/30 hover:text-bat-text"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{cat.icon}</span>
                            <span className="font-bold text-xs">{cat.label}</span>
                          </div>
                          <p className="text-[10px] text-bat-text-muted leading-tight line-clamp-2">
                            {cat.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Título do Chamado */}
                <div>
                  <label className="text-bat-text-secondary text-xs mb-1.5 block font-bold uppercase tracking-wider">
                    2. Título Resumido do Assunto
                  </label>
                  <input
                    type="text"
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                    placeholder="Ex: Dúvida na resolução da questão 142 de Física ou Erro no simulado da ESA"
                    className="w-full bg-bat-bg-primary border border-bat-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-bat-text placeholder-bat-text-muted focus:outline-none focus:border-bat-gold-400 transition-colors"
                    required
                  />
                </div>

                {/* Mensagem Inicial */}
                <div>
                  <label className="text-bat-text-secondary text-xs mb-1.5 block font-bold uppercase tracking-wider">
                    3. Detalhes & Mensagem Inicial
                  </label>
                  <textarea
                    value={novaDesc}
                    onChange={(e) => setNovaDesc(e.target.value)}
                    placeholder="Explique o que aconteceu, qual questão gerou dúvida, comportamento inesperado ou solicitação..."
                    rows={5}
                    className="w-full bg-bat-bg-primary border border-bat-border rounded-xl p-4 text-xs sm:text-sm text-bat-text placeholder-bat-text-muted focus:outline-none focus:border-bat-gold-400 transition-colors resize-y min-h-[120px]"
                    required
                  />
                </div>

                {/* Mensagem de Erro */}
                {erroForm && (
                  <div className="p-3 rounded-xl bg-bat-error/10 border border-bat-error/30 text-bat-error text-xs font-semibold">
                    ⚠️ {erroForm}
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCriandoTicket(false);
                      if (tickets.length > 0) setTicketAbertoId(tickets[0].id);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-bat-border text-bat-text-muted hover:text-bat-text text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoTicket || novoTitulo.trim().length < 5 || novaDesc.trim().length < 10}
                    className="btn-primary py-2.5 px-6 text-xs sm:text-sm font-bold disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-bat-gold-400/20"
                  >
                    {enviandoTicket ? "Registrando Protocolo..." : "Abrir Chamado Oficial 🚀"}
                  </button>
                </div>
              </form>
            </div>
          ) : ticketDetalhe ? (
            /* ═══ CONVERSA DO TICKET (EXPERIÊNCIA DE SUPORTE EM TEMPO REAL) ═══ */
            <div className="flex flex-col h-full min-h-[580px]">
              {/* Header do Chamado Selecionado */}
              <div className="px-6 py-4 border-b border-bat-border bg-bat-bg-primary/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-bat-gold-400/10 border border-bat-gold-400/30 flex items-center justify-center text-xl shrink-0 text-bat-gold-400 shadow-sm">
                    {obterBadgeCategoria(ticketDetalhe.titulo, ticketDetalhe.motivo).icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-bat-gold-400 bg-bat-bg-card px-2 py-0.5 rounded border border-bat-gold-400/20">
                        #TKT-{ticketDetalhe.id.slice(0, 8).toUpperCase()}
                      </span>
                      <h3 className="heading text-sm sm:text-base text-bat-text font-bold truncate max-w-md">
                        {ticketDetalhe.titulo}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          STATUS_CONFIG[ticketDetalhe.status]?.bg || ""
                        } ${STATUS_CONFIG[ticketDetalhe.status]?.text || ""} ${
                          STATUS_CONFIG[ticketDetalhe.status]?.border || ""
                        }`}
                      >
                        {STATUS_CONFIG[ticketDetalhe.status]?.icon}{" "}
                        {STATUS_CONFIG[ticketDetalhe.status]?.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-bat-text-muted flex items-center gap-2 mt-1 font-mono">
                      <span>Aberto em {new Date(ticketDetalhe.criado_em).toLocaleDateString("pt-BR")}</span>
                      <span>·</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Canal Direto de Atendimento
                      </span>
                    </p>
                  </div>
                </div>

                {/* Botão de Encerramento pelo Aluno */}
                {ticketDetalhe.status !== "finalizado" && (
                  <button
                    onClick={handleFinalizarTicket}
                    disabled={finalizandoTicket}
                    className="px-3.5 py-1.5 rounded-xl bg-bat-bg-secondary border border-bat-border hover:border-emerald-500/40 text-xs font-semibold text-bat-text-muted hover:text-emerald-400 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Se sua dúvida ou problema já foi resolvido, marque o chamado como concluído."
                  >
                    <span>✓</span>
                    <span>{finalizandoTicket ? "Concluindo..." : "Marcar como Resolvido"}</span>
                  </button>
                )}
              </div>

              {/* Mensagens Roláveis */}
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-bat-bg-primary/20 via-bat-bg-card to-bat-bg-card max-h-[460px]">
                {loadingDetalhe && (!ticketDetalhe.mensagens || ticketDetalhe.mensagens.length === 0) ? (
                  <div className="space-y-4 py-8 animate-pulse">
                    <div className="flex justify-end">
                      <div className="h-14 w-2/3 bg-bat-bg-secondary rounded-2xl rounded-tr-xs" />
                    </div>
                    <div className="flex justify-start">
                      <div className="h-16 w-3/4 bg-bat-bg-secondary rounded-2xl rounded-tl-xs" />
                    </div>
                  </div>
                ) : !ticketDetalhe.mensagens || ticketDetalhe.mensagens.length === 0 ? (
                  <div className="p-12 text-center text-bat-text-muted text-xs">
                    Nenhuma mensagem registrada neste chamado ainda.
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
                            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-bat-bg-card border border-bat-border/80 text-bat-text-muted shadow-sm">
                              {formatarDataChat(msg.enviado_em)}
                            </span>
                          </div>
                        )}

                        <div className={`flex items-end gap-2.5 ${ehUsuario ? "justify-end" : "justify-start"}`}>
                          {/* Avatar do Suporte (quando mensagem do admin) */}
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
                                ? "bg-gradient-to-br from-bat-gold-400 via-bat-gold-400 to-amber-400 text-black font-medium rounded-2xl rounded-br-xs shadow-bat-gold-400/10"
                                : "bg-bat-bg-card border border-bat-border/90 text-bat-text rounded-2xl rounded-bl-xs"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-black/10 dark:border-white/10">
                              <span
                                className={`font-bold text-[11px] flex items-center gap-1 ${
                                  ehUsuario ? "text-black" : "text-bat-gold-400"
                                }`}
                              >
                                {ehUsuario ? "Você" : "🛡️ Comando BatCaverna"}
                              </span>
                              <span
                                className={`text-[10px] font-mono ${
                                  ehUsuario ? "text-black/70" : "text-bat-text-muted"
                                }`}
                              >
                                {new Date(msg.enviado_em).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">
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
                                (user?.apelido || "V")[0]?.toUpperCase()
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

              {/* Barra de Digitação */}
              <div className="p-4 border-t border-bat-border bg-bat-bg-primary/95 shrink-0">
                {ticketDetalhe.status === "finalizado" ? (
                  <div className="p-3.5 text-center text-xs text-bat-text-muted bg-bat-bg-card rounded-2xl border border-bat-border/80 flex items-center justify-center gap-2">
                    <span>🔒</span>
                    <span>Este chamado foi concluído. Caso tenha uma nova dúvida, abra um novo protocolo acima.</span>
                  </div>
                ) : (
                  <form onSubmit={handleEnviarMensagem} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      placeholder="Escreva sua mensagem para a equipe do Comando BatCaverna..."
                      className="min-w-0 flex-1 bg-bat-bg-card border border-bat-border focus:border-bat-gold-400/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-bat-text placeholder-bat-text-muted focus:outline-none transition-all shadow-inner"
                      disabled={enviandoMensagem}
                    />
                    <button
                      type="submit"
                      disabled={enviandoMensagem || !novaMensagem.trim()}
                      className="btn-primary py-3 px-5 sm:px-6 text-xs font-bold shrink-0 rounded-2xl flex items-center gap-1.5 shadow-md shadow-bat-gold-400/20 disabled:opacity-40 cursor-pointer"
                    >
                      <span>{enviandoMensagem ? "Enviando..." : "Enviar"}</span>
                      <span>⚡</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-bat-text-muted space-y-3">
              <span className="text-5xl block">🛡️</span>
              <p className="text-base font-bold text-bat-text">Nenhum chamado selecionado</p>
              <p className="text-xs text-bat-text-secondary max-w-sm">
                Selecione um dos seus protocolos ao lado para visualizar a conversa ou abra um novo chamado para falar com o suporte.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
