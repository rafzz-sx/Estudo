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
  nota_media: number | null;
  por_tipo: { opiniao: number; bug: number; ideia: number };
}

const ICONE_TIPO: Record<string, string> = {
  opiniao: "💬",
  bug: "🐛",
  ideia: "💡",
};

const COR_TIPO: Record<string, string> = {
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
    setItens((list) =>
      list.map((f) =>
        f.id === id ? { ...f, aprovado_para_vitrine: !atual } : f
      )
    );
    await fetchWithAuth("/api/admin/feedback", {
      method: "PATCH",
      body: JSON.stringify({ id, aprovado_para_vitrine: !atual }),
    }).catch(() => undefined);
  };

  return (
    <div className="space-y-5">
      {/* ═══ RESUMO ═══ */}
      {resumo && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Cartao rotulo="Total recebido" valor={String(resumo.total)} />
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
          <Cartao
            rotulo="Bugs reportados"
            valor={String(resumo.por_tipo.bug)}
            cor={resumo.por_tipo.bug > 0 ? "#EF4444" : undefined}
          />
        </div>
      )}

      {/* ═══ FILTROS ═══ */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          ["todos", "Todos"],
          ["opiniao", "💬 Opiniões"],
          ["bug", "🐛 Bugs"],
          ["ideia", "💡 Ideias"],
        ].map(([valor, rotulo]) => (
          <button
            key={valor}
            onClick={() => setFiltro(valor)}
            className={`cursor-pointer rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
              filtro === valor
                ? "border-bat-gold-400/40 bg-bat-gold-400/15 text-bat-gold-400"
                : "border-bat-border bg-bat-bg-card text-bat-text-secondary"
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
            Nenhum feedback nesta categoria ainda. O convite aparece para o
            aluno depois de 1 hora de uso acumulado.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {itens.map((f) => (
            <li
              key={f.id}
              onClick={() => !f.lido_por_admin && marcarLido(f.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                f.lido_por_admin
                  ? "border-bat-border bg-bat-bg-card opacity-70"
                  : "border-bat-gold-400/30 bg-bat-gold-400/5"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-lg border px-2 py-0.5 text-[11px] font-bold"
                  style={{
                    color: COR_TIPO[f.tipo],
                    borderColor: `${COR_TIPO[f.tipo]}44`,
                    background: `${COR_TIPO[f.tipo]}15`,
                  }}
                >
                  {ICONE_TIPO[f.tipo]} {f.tipo}
                </span>

                {f.nota && (
                  <span className="text-xs text-bat-gold-400">
                    {"★".repeat(f.nota)}
                    <span className="text-bat-text-muted">
                      {"☆".repeat(5 - f.nota)}
                    </span>
                  </span>
                )}

                <span className="text-xs font-medium text-bat-text">
                  {f.users?.apelido ?? "Anônimo"}
                </span>
                <span className="text-[11px] text-bat-text-muted">
                  Nv. {f.users?.nivel_atual ?? 1}
                </span>

                <span className="ml-auto text-[11px] text-bat-text-muted">
                  {new Date(f.criado_em).toLocaleString("pt-BR")}
                  {f.marco_horas ? ` · após ${f.marco_horas}h de uso` : ""}
                </span>

                {!f.lido_por_admin && (
                  <span className="h-2 w-2 rounded-full bg-bat-gold-400" />
                )}
              </div>

              <p className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
                {f.mensagem}
              </p>

              {/* Botão aprovar para vitrine */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVitrine(f.id, !!f.aprovado_para_vitrine);
                  }}
                  className={`cursor-pointer rounded-lg border px-3 py-1 text-[11px] font-bold transition-all ${
                    f.aprovado_para_vitrine
                      ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-400"
                      : "border-bat-border bg-bat-bg-card text-bat-text-secondary hover:border-bat-gold-400/40 hover:text-bat-gold-400"
                  }`}
                >
                  {f.aprovado_para_vitrine ? "✅ Na Vitrine" : "🏪 Colocar na Vitrine"}
                </button>
                {f.aprovado_para_vitrine && (
                  <span className="text-[10px] text-emerald-400/70">
                    Aparece na página inicial
                  </span>
                )}
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
