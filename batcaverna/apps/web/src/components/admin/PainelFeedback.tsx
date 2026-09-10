"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

interface Feedback {
  id: string;
  tipo: string;
  nota: number | null;
  mensagem: string;
  marco_horas: number | null;
  lido_por_admin: boolean;
  aprovado_para_vitrine?: boolean;
  criado_em: string;
  users: { apelido: string; nome?: string; avatar_url: string | null; nivel_atual: number } | null;
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
  const [filtro, setFiltro] = useState("todos");
  const [carregando, setCarregando] = useState(true);

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
    carregar(filtro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  const marcarLido = async (id: string) => {
    setItens((atual) =>
      atual.map((f) => (f.id === id ? { ...f, lido_por_admin: true } : f))
    );
    await fetchWithAuth("/api/admin/feedback", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    }).catch(() => undefined);
  };

  const marcarTodosLidos = async () => {
    setItens((atual) => atual.map((f) => ({ ...f, lido_por_admin: true })));
    await fetchWithAuth("/api/admin/feedback", {
      method: "PATCH",
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

  return (
    <div className="space-y-5">
      {/* ═══ RESUMO ═══ */}
      {resumo && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Cartao rotulo="Total recebido" valor={String(resumo.total)} />
          <Cartao
            rotulo="Na Vitrine (Página Inicial)"
            valor={String(resumo.vitrine ?? 0)}
            cor={resumo.vitrine > 0 ? "#10B981" : undefined}
          />
          <Cartao
            rotulo="Não lidos"
            valor={String(resumo.nao_lidos)}
            cor={resumo.nao_lidos > 0 ? "#F5C518" : undefined}
          />
          <Cartao
            rotulo="Nota média"
            valor={resumo.nota_media ? `${resumo.nota_media} ★` : "—"}
            cor={
              resumo.nota_media
                ? resumo.nota_media >= 4
                  ? "#22C55E"
                  : resumo.nota_media >= 3
                  ? "#F5C518"
                  : "#EF4444"
                : undefined
            }
          />
        </div>
      )}

      {/* ═══ FILTROS ═══ */}
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
            onClick={() => setFiltro(valor)}
            className={`cursor-pointer rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
              filtro === valor
                ? "border-bat-gold-400/40 bg-bat-gold-400/15 text-bat-gold-400 font-bold"
                : "border-bat-border bg-bat-bg-card text-bat-text-secondary hover:border-bat-border-hover"
            }`}
          >
            {rotulo}
          </button>
        ))}

        {resumo && resumo.nao_lidos > 0 && (
          <button
            onClick={marcarTodosLidos}
            className="ml-auto cursor-pointer text-xs font-medium text-bat-gold-400 hover:underline"
          >
            Marcar todos como lidos
          </button>
        )}
      </div>

      {/* ═══ LISTA ═══ */}
      {carregando ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : itens.length === 0 ? (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
          <span className="mb-3 block text-4xl">💬</span>
          <p className="text-sm text-bat-text-secondary">
            {filtro === "vitrine"
              ? "Nenhum feedback aprovado para a vitrine ainda. Clique em 'Aprovar para a Vitrine' em qualquer feedback para fazê-lo aparecer na página inicial."
              : "Nenhum feedback nesta categoria ainda."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {itens.map((f) => (
            <li
              key={f.id}
              onClick={() => !f.lido_por_admin && marcarLido(f.id)}
              className={`rounded-2xl border p-5 transition-all ${
                f.aprovado_para_vitrine
                  ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                  : f.lido_por_admin
                  ? "border-bat-border bg-bat-bg-card opacity-80"
                  : "border-bat-gold-400/30 bg-bat-gold-400/5"
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

                {/* Status da Vitrine no cabeçalho */}
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

              <p className="whitespace-pre-line text-sm leading-relaxed text-bat-text font-normal mb-4 bg-bat-bg-primary/40 p-3.5 rounded-xl border border-bat-border/50">
                "{f.mensagem}"
              </p>

              {/* Barra de Ações: Controle de Vitrine e Excluir */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-bat-border/40">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVitrine(f.id, !!f.aprovado_para_vitrine);
                    }}
                    className={`cursor-pointer rounded-xl border px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                      f.aprovado_para_vitrine
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40"
                        : "border-bat-gold-400/40 bg-bat-gold-400/10 text-bat-gold-400 hover:bg-bat-gold-400/25"
                    }`}
                  >
                    {f.aprovado_para_vitrine ? "✅ Publicado na Vitrine (Clique para Ocultar)" : "🏪 Aprovar e Exibir na Página Inicial"}
                  </button>

                  <span className="text-[11px] text-bat-text-muted">
                    {f.aprovado_para_vitrine
                      ? "Este depoimento está visível na página inicial."
                      : "Apenas administradores podem ler este feedback."}
                  </span>
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
    <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-4">
      <p className="mb-1 text-xs text-bat-text-muted">{rotulo}</p>
      <p className="heading text-2xl font-bold" style={{ color: cor }}>
        {valor}
      </p>
    </div>
  );
}
