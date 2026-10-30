"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

interface Feedback {
  id: string;
  user_id?: string;
  tipo: string;
  nota: number | null;
  mensagem: string;
  marco_horas: number | null;
  lido_por_admin: boolean;
  aprovado_para_vitrine?: boolean;
  criado_em: string;
  users: { id?: string; apelido: string; nome?: string; avatar_url: string | null; nivel_atual: number } | null;
}

interface Resumo {
  total: number;
  nao_lidos: number;
  vitrine: number;
  nota_media: number | null;
  por_tipo: { depoimento?: number; opiniao: number; bug: number; ideia: number };
}

const ICONE_TIPO: Record<string, string> = {
  depoimento: "🌟",
  opiniao: "💬",
  bug: "🐛",
  ideia: "💡",
};

const COR_TIPO: Record<string, string> = {
  depoimento: "#10B981",
  opiniao: "#3B82F6",
  bug: "#EF4444",
  ideia: "#F5C518",
};

export function PainelFeedback({
  onResumo,
}: {
  onResumo?: (r: Resumo) => void;
}) {
  const [itens, setItens] = useState<Feedback[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroNota, setFiltroNota] = useState<"todas" | "criticas" | "neutras" | "elogios">("todas");
  const [carregando, setCarregando] = useState(true);
  const [criandoTicketId, setCriandoTicketId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);

  const carregar = (tipo: string) => {
    setCarregando(true);
    fetchWithAuth(`/api/admin/feedback?tipo=${tipo}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setItens(json.data.itens);
          setResumo(json.data.resumo);
          onResumo?.(json.data.resumo);
        }
      })
      .catch(() => undefined)
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregar(filtroTipo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo]);

  const marcarLido = async (id: string) => {
    setItens((atual) =>
      atual.map((f) => (f.id === id ? { ...f, lido_por_admin: true } : f))
    );
    await fetchWithAuth("/api/admin/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => undefined);
  };

  const marcarTodosLidos = async () => {
    setItens((atual) => atual.map((f) => ({ ...f, lido_por_admin: true })));
    await fetchWithAuth("/api/admin/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todos: true }),
    }).catch(() => undefined);
  };

  const toggleVitrine = async (id: string, atual: boolean) => {
    const novoValor = !atual;
    setItens((list) =>
      list.map((f) =>
        f.id === id ? { ...f, aprovado_para_vitrine: novoValor } : f
      )
    );
    setResumo((prev) =>
      prev ? { ...prev, vitrine: prev.vitrine + (novoValor ? 1 : -1) } : prev
    );
    await fetchWithAuth("/api/admin/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, aprovado_para_vitrine: novoValor }),
    }).catch(() => undefined);
  };

  const excluirFeedback = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este feedback?")) return;
    setItens((list) => list.filter((f) => f.id !== id));
    await fetchWithAuth(`/api/admin/feedback?id=${id}`, {
      method: "DELETE",
    }).catch(() => undefined);
  };

  const converterEmTicket = async (f: Feedback) => {
    const studentId = f.users?.id || f.user_id;
    if (!studentId) {
      setAviso({ tipo: "erro", msg: "Este feedback é anônimo ou sem usuário vinculado." });
      return;
    }

    setCriandoTicketId(f.id);
    try {
      const res = await fetchWithAuth("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivo: f.tipo === "bug" ? "bug" : "outro",
          titulo: `[Feedback ${f.tipo.toUpperCase()}] ${f.users?.apelido || "Aluno"}`,
          descricao: `[Origem: Feedback ${f.nota ? `${f.nota}★` : ""}]

${f.mensagem}`,
          user_id: studentId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAviso({
          tipo: "ok",
          msg: `🎫 Ticket de suporte criado com sucesso para ${f.users?.apelido || "o aluno"}! Veja na aba de Chamados.`,
        });
        marcarLido(f.id);
      } else {
        setAviso({ tipo: "erro", msg: json.error || "Erro ao criar ticket." });
      }
    } catch {
      setAviso({ tipo: "erro", msg: "Falha de conexão ao criar ticket." });
    } finally {
      setCriandoTicketId(null);
    }
  };

  // Filtragem combinada por tipo e por nota
  const itensFiltrados = itens.filter((f) => {
    if (filtroNota === "criticas") return f.nota !== null && f.nota <= 2;
    if (filtroNota === "neutras") return f.nota === 3;
    if (filtroNota === "elogios") return f.nota !== null && f.nota >= 4;
    return true;
  });

  // Cálculo de CSAT (% de notas 4 e 5 entre feedbacks com nota)
  const feedbacksComNota = itens.filter((f) => f.nota !== null);
  const feedbacksSatisfeitos = feedbacksComNota.filter((f) => (f.nota || 0) >= 4);
  const taxaCsat = feedbacksComNota.length > 0
    ? Math.round((feedbacksSatisfeitos.length / feedbacksComNota.length) * 100)
    : null;

  return (
    <div className="space-y-5">
      {/* ═══ CABEÇALHO DO MÓDULO ═══ */}
      <div className="bg-bat-bg-primary/80 border border-bat-border p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <h2 className="heading text-xl text-bat-text">Caixa de Feedback & Depoimentos</h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30">
              {itens.length} avaliações
            </span>
          </div>
          <p className="text-bat-text-secondary text-xs mt-1">
            Auditoria da satisfação dos soldados, moderação de vitrine pública e conversão de críticas em tickets de suporte.
          </p>
        </div>

        <button
          onClick={() => carregar(filtroTipo)}
          disabled={carregando}
          className="btn-secondary py-2 px-4 text-xs font-bold self-start sm:self-auto cursor-pointer"
        >
          {carregando ? "Carregando..." : "🔄 Atualizar"}
        </button>
      </div>

      {/* Alerta de Feedback */}
      {aviso && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border font-bold ${
            aviso.tipo === "ok"
              ? "bg-bat-success/10 border-bat-success/30 text-bat-success"
              : "bg-bat-error/10 border-bat-error/30 text-bat-error"
          }`}
        >
          <span>{aviso.msg}</span>
          <button
            onClick={() => setAviso(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ═══ RESUMO & CSAT GAUGE ═══ */}
      {resumo && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Cartao rotulo="Total Recebido" valor={String(resumo.total)} />
          <Cartao
            rotulo="Na Vitrine (Home)"
            valor={String(resumo.vitrine ?? 0)}
            cor={resumo.vitrine > 0 ? "#10B981" : undefined}
          />
          <Cartao
            rotulo="Não Lidos"
            valor={String(resumo.nao_lidos)}
            cor={resumo.nao_lidos > 0 ? "#F5C518" : undefined}
          />
          <Cartao
            rotulo="Índice de Satisfação (CSAT)"
            valor={taxaCsat !== null ? `${taxaCsat}% (${resumo.nota_media} ★)` : "—"}
            cor={
              taxaCsat !== null
                ? taxaCsat >= 80
                  ? "#22C55E"
                  : taxaCsat >= 60
                  ? "#F5C518"
                  : "#EF4444"
                : undefined
            }
          />
        </div>
      )}

      {/* ═══ FILTROS POR CATEGORIA E NOTA ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bat-bg-card border border-bat-border p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {[
            ["todos", "Todos"],
            ["vitrine", `🏪 Na Vitrine (${resumo?.vitrine ?? 0})`],
            ["depoimento", `🌟 Depoimentos (${resumo?.por_tipo?.depoimento ?? 0})`],
            ["opiniao", "💬 Opiniões"],
            ["bug", "🐛 Bugs"],
            ["ideia", "💡 Ideias"],
          ].map(([valor, rotulo]) => (
            <button
              key={valor}
              onClick={() => setFiltroTipo(valor)}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                filtroTipo === valor
                  ? "border-bat-gold-400/40 bg-bat-gold-400/15 text-bat-gold-400 font-bold"
                  : "border-bat-border bg-bat-bg-secondary text-bat-text-secondary hover:border-bat-border-hover"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {/* Filtro por Estrelas */}
        <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-bat-border/60 pt-2 sm:pt-0 sm:pl-3">
          <span className="text-[10px] text-bat-text-muted uppercase font-bold mr-1">
            Nota:
          </span>
          {[
            ["todas", "Todas"],
            ["criticas", "🚨 1-2★"],
            ["neutras", "⭐ 3★"],
            ["elogios", "🏆 4-5★"],
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setFiltroNota(val as any)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                filtroNota === val
                  ? "bg-bat-gold-400 text-black shadow-sm"
                  : "bg-bat-bg-primary text-bat-text-secondary hover:text-bat-text border border-bat-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {resumo && resumo.nao_lidos > 0 && (
        <div className="flex justify-end">
          <button
            onClick={marcarTodosLidos}
            className="cursor-pointer text-xs font-bold text-bat-gold-400 hover:underline"
          >
            ✓ Marcar todos os feedbacks como lidos
          </button>
        </div>
      )}

      {/* ═══ LISTA DE FEEDBACKS ═══ */}
      {carregando ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : itensFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
          <span className="mb-3 block text-4xl">💬</span>
          <p className="text-sm text-bat-text-secondary">
            {filtroTipo === "vitrine"
              ? "Nenhum feedback aprovado para a vitrine ainda. Clique em 'Aprovar para a Vitrine' em qualquer feedback para fazê-lo aparecer na página inicial."
              : "Nenhum feedback encontrado para os filtros selecionados."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {itensFiltrados.map((f) => (
            <li
              key={f.id}
              onClick={() => !f.lido_por_admin && marcarLido(f.id)}
              className={`rounded-2xl border p-5 transition-all ${
                f.aprovado_para_vitrine
                  ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                  : f.lido_por_admin
                  ? "border-bat-border bg-bat-bg-card opacity-90"
                  : "border-bat-gold-400/40 bg-bat-gold-400/5 shadow-[0_0_15px_rgba(245,197,24,0.08)]"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-lg border px-2.5 py-0.5 text-[11px] font-bold"
                  style={{
                    color: COR_TIPO[f.tipo] || "#3B82F6",
                    borderColor: `${COR_TIPO[f.tipo] || "#3B82F6"}44`,
                    background: `${COR_TIPO[f.tipo] || "#3B82F6"}15`,
                  }}
                >
                  {ICONE_TIPO[f.tipo] || "💬"} {f.tipo}
                </span>

                {f.nota && (
                  <span className="text-xs text-bat-gold-400 font-semibold">
                    {"★".repeat(f.nota)}
                    <span className="text-bat-text-muted">
                      {"☆".repeat(5 - f.nota)}
                    </span>
                  </span>
                )}

                <span className="text-xs font-bold text-bat-text">
                  {f.users?.apelido ?? f.users?.nome ?? "Anônimo"}
                </span>
                <span className="text-[11px] text-bat-text-muted">
                  Nv. {f.users?.nivel_atual ?? 1}
                </span>

                {/* Status da Vitrine */}
                {f.aprovado_para_vitrine ? (
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    ✓ NO AR NA HOME
                  </span>
                ) : (
                  <span className="rounded-full border border-bat-border bg-bat-bg-secondary px-2 py-0.5 text-[10px] text-bat-text-muted">
                    Oculto ao público
                  </span>
                )}

                <span className="ml-auto text-[11px] text-bat-text-muted">
                  {new Date(f.criado_em).toLocaleString("pt-BR")}
                  {f.marco_horas ? ` · após ${f.marco_horas}h de estudo` : ""}
                </span>

                {!f.lido_por_admin && (
                  <span className="h-2 w-2 rounded-full bg-bat-gold-400" title="Novo não lido" />
                )}
              </div>

              <p className="whitespace-pre-line text-sm leading-relaxed text-bat-text font-normal mb-4 bg-bat-bg-primary/50 p-4 rounded-xl border border-bat-border/60">
                "{f.mensagem}"
              </p>

              {/* Barra de Ações: Vitrine, Converter em Ticket, Excluir */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-bat-border/40">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVitrine(f.id, !!f.aprovado_para_vitrine);
                    }}
                    className={`cursor-pointer rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                      f.aprovado_para_vitrine
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40"
                        : "border-bat-gold-400/40 bg-bat-gold-400/10 text-bat-gold-400 hover:bg-bat-gold-400/25"
                    }`}
                  >
                    {f.aprovado_para_vitrine ? "✅ Na Vitrine (Ocultar)" : "🏪 Aprovar para Home"}
                  </button>

                  {/* Converter em Ticket */}
                  {(f.users?.id || f.user_id) && (
                    <button
                      type="button"
                      disabled={criandoTicketId === f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        converterEmTicket(f);
                      }}
                      className="cursor-pointer rounded-xl border border-bat-purple-400/40 bg-bat-purple-500/10 text-bat-purple-300 hover:bg-bat-purple-500/20 px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
                      title="Criar um ticket de suporte a partir deste relato"
                    >
                      <span>🎫</span>
                      <span>{criandoTicketId === f.id ? "Criando..." : "Converter em Ticket"}</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    excluirFeedback(f.id);
                  }}
                  className="cursor-pointer text-xs text-bat-text-muted hover:text-red-400 hover:underline px-2 py-1 transition-colors"
                >
                  🗑️ Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Cartao({
  rotulo,
  valor,
  cor,
}: {
  rotulo: string;
  valor: string;
  cor?: string;
}) {
  return (
    <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-4 shadow-sm">
      <p className="mb-1 text-xs text-bat-text-muted">{rotulo}</p>
      <p className="heading text-2xl font-bold" style={{ color: cor }}>
        {valor}
      </p>
    </div>
  );
}
