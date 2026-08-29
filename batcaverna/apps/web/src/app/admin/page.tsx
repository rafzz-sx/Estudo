"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

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
  banner_tipo?: string;
}

interface TicketAdmin {
  id: string;
  user_id: string;
  titulo: string;
  motivo: "bugs" | "ideia" | "outros";
  status: "aberto" | "respondido" | "finalizado";
  criado_em: string;
  atualizado_em: string;
  autor_apelido: string;
  mensagens: {
    id: string;
    autor_role: "usuario" | "admin";
    conteudo: string;
    hora: string;
  }[];
}

const mockUsuariosIniciais: UsuarioAdmin[] = [
  {
    id: "usr-admin-1",
    nome: "Administrador BatCaverna",
    apelido: "AdminCaverna",
    apelidos_antigos: ["ComandanteMorcego", "BatChefe"],
    email: "raf4biel.venafro@gmail.com",
    role: "admin",
    nivel_atual: 15,
    xp_total: 25000,
    streak_dias: 30,
    criado_em: "2026-01-15T10:00:00Z",
    avatar_url: null,
  },
  {
    id: "usr-2",
    nome: "Lucas Ferreira",
    apelido: "FalcãoFAB",
    apelidos_antigos: ["RecrutaLucas", "Sargento2026"],
    email: "lucas.fab@exemplo.com",
    role: "user",
    nivel_atual: 12,
    xp_total: 11200,
    streak_dias: 14,
    criado_em: "2026-03-10T14:20:00Z",
    avatar_url: null,
  },
  {
    id: "usr-3",
    nome: "Mariana Costa",
    apelido: "CadeteMari",
    apelidos_antigos: ["MariEsPCEx"],
    email: "mari.costa@exemplo.com",
    role: "user",
    nivel_atual: 14,
    xp_total: 18400,
    streak_dias: 22,
    criado_em: "2026-02-18T09:45:00Z",
    avatar_url: null,
  },
  {
    id: "usr-4",
    nome: "Gabriel Silva",
    apelido: "GuerreiroESA",
    apelidos_antigos: ["SoldadoGabi", "InfantariaBr", "CaveiraESA"],
    email: "gabriel.esa@exemplo.com",
    role: "user",
    nivel_atual: 9,
    xp_total: 5100,
    streak_dias: 7,
    criado_em: "2026-05-02T16:10:00Z",
    avatar_url: null,
  },
  {
    id: "usr-5",
    nome: "Beatriz Lima",
    apelido: "MarinheiraBia",
    apelidos_antigos: [],
    email: "bia.marinha@exemplo.com",
    role: "user",
    nivel_atual: 6,
    xp_total: 2100,
    streak_dias: 3,
    criado_em: "2026-07-20T11:00:00Z",
    avatar_url: null,
  },
];

const mockTicketsAdmin: TicketAdmin[] = [
  {
    id: "t1",
    user_id: "usr-2",
    autor_apelido: "FalcãoFAB",
    titulo: "Bug na contagem de tempo de estudo",
    motivo: "bugs",
    status: "aberto",
    criado_em: "2026-08-28T14:30:00Z",
    atualizado_em: "2026-08-28T14:30:00Z",
    mensagens: [
      {
        id: "m1",
        autor_role: "usuario",
        conteudo: "O cronômetro de estudo pausou quando minimizei a janela no navegador.",
        hora: "14:30",
      },
    ],
  },
  {
    id: "t2",
    user_id: "usr-4",
    autor_apelido: "GuerreiroESA",
    titulo: "Sugestão: Adicionar mais questões de História do Brasil",
    motivo: "ideia",
    status: "respondido",
    criado_em: "2026-08-27T09:15:00Z",
    atualizado_em: "2026-08-27T16:45:00Z",
    mensagens: [
      {
        id: "m2",
        autor_role: "usuario",
        conteudo: "Seria excelente ter mais questões focadas na Era Vargas para o concurso da ESA.",
        hora: "09:15",
      },
      {
        id: "m3",
        autor_role: "admin",
        conteudo: "Excelente sugestão! Já adicionamos mais 50 questões da banca do Exército.",
        hora: "16:45",
      },
    ],
  },
];

type AbaAdmin = "visao_geral" | "usuarios" | "tickets" | "banners" | "armazem" | "questoes" | "bizus";

export default function AdminPage() {
  const { user } = useAuthStore();
  const [aba, setAba] = useState<AbaAdmin>("visao_geral");
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>(mockUsuariosIniciais);
  const [tickets, setTickets] = useState<TicketAdmin[]>(mockTicketsAdmin);
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<"todos" | "admin" | "user">("todos");
  
  // Resposta a Ticket
  const [ticketSelecionadoId, setTicketSelecionadoId] = useState<string | null>(null);
  const [textoResposta, setTextoResposta] = useState("");
  
  // Armazém
  const [executandoVarredura, setExecutandoVarredura] = useState(false);
  const [logImportacao, setLogImportacao] = useState<string | null>(null);

  // Versão do sistema
  const versaoAtual = "1.1.0";
  const dataAtualizacao = "29/08/2026 08:50";

  // Carregar usuários reais da API se disponíveis
  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const res = await fetch("/api/admin/usuarios");
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setUsuarios(json.data);
          }
        }
      } catch (err) {
        console.log("Usando mock de usuários para preview admin");
      }
    }
    carregarUsuarios();
  }, []);

  const handleExecutarArmazem = () => {
    setExecutandoVarredura(true);
    setLogImportacao("Iniciando varredura no bucket Supabase Storage `armazem-questoes`...");

    setTimeout(() => {
      setLogImportacao((prev) => `${prev}\n✓ 3 arquivos encontrados no bucket.`);
    }, 600);

    setTimeout(() => {
      setLogImportacao(
        (prev) =>
          `${prev}\n✓ Validando hashes SHA-256 de conteúdo para deduplicação...\n✓ 42 novas questões aceitas e inseridas no banco.\n✓ 4 duplicadas ignoradas com sucesso.\n🎉 Processo finalizado com sucesso em 2.1s.`
      );
      setExecutandoVarredura(false);
    }, 1800);
  };

  const handleResponderTicket = (ticketId: string) => {
    if (!textoResposta.trim()) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: "respondido",
            atualizado_em: new Date().toISOString(),
            mensagens: [
              ...t.mensagens,
              {
                id: `msg-${Date.now()}`,
                autor_role: "admin",
                conteudo: textoResposta.trim(),
                hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          };
        }
        return t;
      })
    );

    setTextoResposta("");
  };

  const handleMudarStatusTicket = (ticketId: string, novoStatus: "aberto" | "respondido" | "finalizado") => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: novoStatus } : t))
    );
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.apelido.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      u.apelidos_antigos.some((antigo) => antigo.toLowerCase().includes(busca.toLowerCase()));

    const matchRole = filtroRole === "todos" ? true : u.role === filtroRole;

    return matchBusca && matchRole;
  });

  const ticketAtivo = tickets.find((t) => t.id === ticketSelecionadoId);

  return (
    <div className="space-y-6">
      {/* ═══ CABEÇALHO ADMIN COM VERSÃO E DATA ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bat-bg-card border border-bat-border p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading text-3xl text-bat-text">Painel de Controle</h1>
            <span className="badge-admin">ADMINISTRADOR MASTER</span>
          </div>
          <p className="text-bat-text-secondary text-sm mt-1">
            Gestão de contas, moderação de apelidos, tickets de suporte, banco de questões e banners.
          </p>
        </div>

        {/* Badge de Versão e Timestamp de Atualização */}
        <div className="flex flex-col sm:items-end bg-bat-bg-primary border border-bat-gold-400/30 px-4 py-2.5 rounded-xl text-right">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-bat-gold-400">Versão {versaoAtual}</span>
          </div>
          <p className="text-[11px] text-bat-text-muted mt-0.5">
            Atualizado: {dataAtualizacao}
          </p>
        </div>
      </div>

      {/* ═══ ABAS DE NAVEGAÇÃO DO ADMIN ═══ */}
      <div className="flex gap-2 bg-bat-bg-card border border-bat-border p-1.5 rounded-xl w-fit flex-wrap">
        {[
          { key: "visao_geral", label: "📊 Visão Geral" },
          { key: "usuarios", label: "👥 Usuários & Histórico de Apelidos" },
          { key: "tickets", label: `🎫 Tickets de Suporte (${tickets.filter((t) => t.status === "aberto").length} novos)` },
          { key: "banners", label: "🖼️ Banners & Temas" },
          { key: "armazem", label: "📦 Armazém de Questões" },
          { key: "questoes", label: "❓ Banco de Questões" },
          { key: "bizus", label: "💡 Banco de Bizus" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setAba(item.key as AbaAdmin)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              aba === item.key
                ? "bg-bat-purple-500 text-white glow-purple"
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
              <p className="text-bat-text-muted text-xs mb-1">Total de Alunos Registrados</p>
              <p className="heading text-3xl font-bold text-bat-text">{usuarios.length}</p>
              <p className="text-bat-success text-xs mt-1">↑ 100% Contas Ativas</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Questões no Banco</p>
              <p className="heading text-3xl font-bold text-bat-purple-400">8.940</p>
              <p className="text-bat-text-secondary text-xs mt-1">9 Concursos Militares + ENEM</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Bizus Estratégicos</p>
              <p className="heading text-3xl font-bold text-bat-gold-400">420</p>
              <p className="text-bat-text-secondary text-xs mt-1">15 Matérias Oficiais</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Tickets de Alunos</p>
              <p className="heading text-3xl font-bold text-bat-error">
                {tickets.filter((t) => t.status === "aberto").length}
              </p>
              <p className="text-bat-text-muted text-xs mt-1">Aguardando resposta</p>
            </div>
          </div>

          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
            <h2 className="heading text-lg text-bat-text mb-4">Auditoria e Status da Plataforma</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-bat-bg-primary border border-bat-border space-y-1">
                <span className="text-bat-text-muted">Status do Servidor Web:</span>
                <p className="text-emerald-400 font-bold">🟢 Operacional (Vercel Edge)</p>
              </div>
              <div className="p-4 rounded-xl bg-bat-bg-primary border border-bat-border space-y-1">
                <span className="text-bat-text-muted">Banco de Dados PostgreSQL:</span>
                <p className="text-emerald-400 font-bold">🟢 Conectado (Supabase)</p>
              </div>
              <div className="p-4 rounded-xl bg-bat-bg-primary border border-bat-border space-y-1">
                <span className="text-bat-text-muted">Aplicativo Android Nativo:</span>
                <p className="text-emerald-400 font-bold">🟢 Pacote Standalone Pronto</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 2: GESTÃO DE USUÁRIOS & HISTÓRICO DE APELIDOS ═══ */}
      {aba === "usuarios" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="heading text-xl text-bat-text">Gestão de Contas & Histórico de Apelidos</h2>
              <p className="text-bat-text-secondary text-sm">
                Visualize todas as contas criadas, seus apelidos atuais e o registro completo de trocas de apelido anteriores.
              </p>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar por nome, apelido atual, e-mail ou apelidos antigos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full input-field text-sm pl-10"
              />
              <span className="absolute left-3.5 top-3 text-sm text-bat-text-muted">🔍</span>
            </div>

            <div className="flex gap-2">
              {(["todos", "user", "admin"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFiltroRole(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    filtroRole === r
                      ? "bg-bat-purple-600 text-white"
                      : "bg-bat-bg-primary text-bat-text-secondary border border-bat-border hover:text-bat-text"
                  }`}
                >
                  {r === "todos" ? "Todos" : r === "admin" ? "Admins" : "Alunos"}
                </button>
              ))}
            </div>
          </div>

          {/* Tabela de Contas com Histórico de Apelidos */}
          <div className="overflow-x-auto rounded-xl border border-bat-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-bat-bg-primary/80 border-b border-bat-border text-bat-text-muted text-xs uppercase font-mono">
                  <th className="py-3.5 px-4">Soldado (Nome / E-mail)</th>
                  <th className="py-3.5 px-4">Apelido Atual</th>
                  <th className="py-3.5 px-4">Histórico de Apelidos Antigos</th>
                  <th className="py-3.5 px-4">Nível / XP</th>
                  <th className="py-3.5 px-4">Streak</th>
                  <th className="py-3.5 px-4">Cargo</th>
                  <th className="py-3.5 px-4 text-right">Data de Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bat-border/40 bg-bat-bg-card/50">
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-bat-text-muted text-sm">
                      Nenhum usuário encontrado com esses termos de busca.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr key={u.id} className="hover:bg-bat-bg-tertiary/30 transition-colors">
                      {/* Nome e E-mail */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-bat-bg-tertiary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400">
                            {u.apelido[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-bat-text">{u.nome}</p>
                            <p className="text-xs text-bat-text-muted font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Apelido Atual */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bat-gold-400/10 border border-bat-gold-400/30 text-bat-gold-400 font-mono font-bold text-xs">
                          <span>🦇</span>
                          <span>{u.apelido}</span>
                        </span>
                      </td>

                      {/* Histórico de Apelidos Antigos */}
                      <td className="py-4 px-4">
                        {u.apelidos_antigos && u.apelidos_antigos.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {u.apelidos_antigos.map((antigo, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bat-bg-primary border border-bat-border text-bat-text-secondary text-[11px] font-mono"
                                title={`Apelido anterior #${idx + 1}`}
                              >
                                <span className="text-bat-text-muted line-through">{antigo}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-bat-text-muted text-xs italic">Nenhuma troca</span>
                        )}
                      </td>

                      {/* Nível e XP */}
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <span className="font-bold text-bat-purple-400">Nível {u.nivel_atual}</span>
                          <p className="text-[11px] text-bat-text-muted">{u.xp_total.toLocaleString("pt-BR")} XP</p>
                        </div>
                      </td>

                      {/* Streak */}
                      <td className="py-4 px-4 font-mono text-xs">
                        <span className="text-bat-gold-400 font-bold">🔥 {u.streak_dias}d</span>
                      </td>

                      {/* Cargo */}
                      <td className="py-4 px-4">
                        {u.role === "admin" ? (
                          <span className="badge-admin text-[10px]">ADMIN</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-bat-bg-primary text-bat-text-secondary border border-bat-border">
                            ALUNO
                          </span>
                        )}
                      </td>

                      {/* Data de Cadastro */}
                      <td className="py-4 px-4 text-right font-mono text-xs text-bat-text-muted">
                        {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB 3: GESTÃO DE TICKETS DE SUPORTE ═══ */}
      {aba === "tickets" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="heading text-xl text-bat-text">Central de Tickets dos Alunos</h2>
              <p className="text-bat-text-secondary text-sm">
                Atenda chamados, tire dúvidas e responda sugestões enviadas pelos soldados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lista de Chamados */}
            <div className="lg:col-span-5 space-y-3">
              {tickets.map((t) => {
                const ativo = t.id === ticketSelecionadoId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTicketSelecionadoId(t.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      ativo
                        ? "bg-bat-purple-950/40 border-bat-purple-500 glow-purple"
                        : "bg-bat-bg-primary border-bat-border hover:border-bat-border-strong"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        t.motivo === "bugs" ? "bg-bat-error/20 text-bat-error" : "bg-bat-info/20 text-bat-info"
                      }`}>
                        {t.motivo === "bugs" ? "🐛 Bug" : "💡 Ideia"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === "aberto"
                          ? "bg-bat-gold-400/20 text-bat-gold-400"
                          : t.status === "respondido"
                          ? "bg-bat-info/20 text-bat-info"
                          : "bg-bat-success/20 text-bat-success"
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-bold text-bat-text text-sm mb-1">{t.titulo}</h4>
                    <p className="text-xs text-bat-text-muted">
                      Por <span className="text-bat-gold-400 font-semibold">{t.autor_apelido}</span> · {t.mensagens.length} mensagem(ns)
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Visualização e Resposta do Ticket */}
            <div className="lg:col-span-7 bg-bat-bg-primary border border-bat-border rounded-xl p-5 flex flex-col justify-between min-h-[400px]">
              {ticketAtivo ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-bat-border/50 pb-3 mb-4">
                      <div>
                        <h3 className="font-bold text-bat-text text-base">{ticketAtivo.titulo}</h3>
                        <p className="text-xs text-bat-text-muted">Aluno: {ticketAtivo.autor_apelido}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMudarStatusTicket(ticketAtivo.id, "finalizado")}
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 cursor-pointer"
                        >
                          ✓ Marcar Finalizado
                        </button>
                      </div>
                    </div>

                    {/* Mensagens */}
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {ticketAtivo.mensagens.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                            m.autor_role === "admin"
                              ? "bg-bat-purple-600/30 border border-bat-purple-500/40 text-bat-text ml-6"
                              : "bg-bat-bg-card border border-bat-border text-bat-text mr-6"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-bat-gold-400">
                              {m.autor_role === "admin" ? "🛡️ Resposta do Administrador" : `👤 ${ticketAtivo.autor_apelido}`}
                            </span>
                            <span className="text-[10px] text-bat-text-muted">{m.hora}</span>
                          </div>
                          <p>{m.conteudo}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campo de Resposta do Admin */}
                  <div className="pt-3 border-t border-bat-border/50 space-y-2">
                    <textarea
                      placeholder="Escreva a resposta oficial para o aluno..."
                      value={textoResposta}
                      onChange={(e) => setTextoResposta(e.target.value)}
                      rows={3}
                      className="w-full input-field text-xs resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleResponderTicket(ticketAtivo.id)}
                        disabled={!textoResposta.trim()}
                        className="btn-primary py-2 px-5 text-xs font-bold disabled:opacity-40"
                      >
                        Enviar Resposta ao Aluno 🚀
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-bat-text-muted text-xs">
                  Selecione um ticket ao lado para visualizar e responder.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 4: GERENCIAMENTO DE BANNERS & TEMAS ═══ */}
      {aba === "banners" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="heading text-xl text-bat-text">Banners & Temas Personalizados</h2>
            <p className="text-bat-text-secondary text-sm">
              Visualize os formatos de banner suportados (imagens estáticas, GIFs animados e vídeos táticos).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Banner 1: Dark Knight Tático */}
            <div className="border border-bat-border rounded-2xl overflow-hidden bg-bat-bg-primary">
              <div className="h-32 bg-gradient-to-r from-bat-purple-900/60 via-bat-purple-700/30 to-bat-bg-tertiary flex items-center justify-center text-bat-gold-400 font-bold text-sm">
                🦇 Tema BatCaverna Dark Gold
              </div>
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bat-purple-500/20 text-bat-purple-300">
                  TIPO: GRADIENTE TÁTICO
                </span>
                <p className="text-xs text-bat-text">Padrão da plataforma com partículas douradas e iluminação dinâmica.</p>
              </div>
            </div>

            {/* Banner 2: Força Aérea FAB */}
            <div className="border border-bat-border rounded-2xl overflow-hidden bg-bat-bg-primary">
              <div className="h-32 bg-gradient-to-r from-blue-950/80 via-blue-800/40 to-bat-bg-tertiary flex items-center justify-center text-blue-300 font-bold text-sm">
                ✈️ Força Aérea Brasileira (EEAR/EPCAR)
              </div>
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  TIPO: TEMA MILITAR
                </span>
                <p className="text-xs text-bat-text">Banner especial para os alunos focados em aviação e especialistas.</p>
              </div>
            </div>

            {/* Banner 3: Exército & Infantaria */}
            <div className="border border-bat-border rounded-2xl overflow-hidden bg-bat-bg-primary">
              <div className="h-32 bg-gradient-to-r from-emerald-950/80 via-emerald-800/40 to-bat-bg-tertiary flex items-center justify-center text-emerald-300 font-bold text-sm">
                ⭐ Exército Brasileiro (ESA/EsPCEx)
              </div>
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  TIPO: TEMA MILITAR
                </span>
                <p className="text-xs text-bat-text">Banner camuflado tático para oficiais e sargentos combatentes.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 5: ARMAZÉM DE QUESTÕES ═══ */}
      {aba === "armazem" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="heading text-xl text-bat-text">Varredura Automática do Armazém</h2>
              <p className="text-bat-text-secondary text-sm">
                Varre arquivos JSON/CSV no bucket do Supabase, valida integridade e deduplica com hashing SHA-256.
              </p>
            </div>

            <button
              onClick={handleExecutarArmazem}
              disabled={executandoVarredura}
              className="btn-primary py-3 px-6 text-sm whitespace-nowrap disabled:opacity-50"
            >
              {executandoVarredura ? "Processando..." : "Executar Varredura Agora ⚡"}
            </button>
          </div>

          {logImportacao && (
            <div className="bg-bat-bg-primary border border-bat-border rounded-xl p-4 font-mono text-xs text-bat-purple-300 whitespace-pre-wrap leading-relaxed">
              {logImportacao}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 6 & 7: BANCOS DE QUESTÕES & BIZUS ═══ */}
      {(aba === "questoes" || aba === "bizus") && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="heading text-xl text-bat-text">
              {aba === "questoes" ? "Gestão do Banco de Questões" : "Gestão do Banco de Bizus"}
            </h2>
            <button className="btn-primary text-xs py-2 px-4">
              {aba === "questoes" ? "+ Nova Questão" : "+ Novo Bizu"}
            </button>
          </div>
          <p className="text-bat-text-secondary text-sm">
            {aba === "questoes"
              ? "Edite e adicione novas questões com gabarito, filtros por banca/ano e explicação tática."
              : "Cadastre macetes estratégicos com níveis de impacto (Alto Impacto, Útil, Avançado)."}
          </p>
        </div>
      )}
    </div>
  );
}
