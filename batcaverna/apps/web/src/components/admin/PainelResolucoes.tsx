"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";
import { QuadroFigura } from "@/components/questoes/QuadroFigura";

/**
 * Fila de resolução.
 *
 * 540 das questões importadas vêm de provas cujo .txt não trazia gabarito
 * comentado (ENEM 2024 e 2025 inteiros, EPCAR 2022, ESA 2024). O aluno vê
 * a letra certa e fica sem entender o porquê — que é justamente o que a
 * plataforma promete resolver.
 *
 * A fila vem ordenada por DEMANDA: a questão que mais gente errou aparece
 * primeiro. Escrever a resolução dela vale mais do que escrever a de uma
 * questão que ninguém abriu.
 */

interface Passo {
  titulo: string;
  conteudo: string;
  formula?: string | null;
}

interface QuestaoPendente {
  id: string;
  enunciado: string;
  texto_base: string | null;
  alternativas: { letra: string; texto: string }[];
  resposta_correta: string;
  explicacao: string | null;
  resolucao_passos: Passo[] | null;
  resolucao_status: string;
  precisa_resolucao: boolean;
  figura_descricao: string | null;
  figura_svg: string | null;
  ano: number | null;
  dia_prova: string | null;
  numero_original: string | null;
  dificuldade: string;
  anulada: boolean;
  vezes_respondida: number | null;
  vezes_acertada: number | null;
  concursos: { sigla: string; nome: string } | null;
  materias: { nome: string; icone_emoji: string | null } | null;
  assuntos: { nome: string } | null;
}

const TITULOS_SUGERIDOS = [
  "O que o enunciado dá",
  "Aplicando a fórmula",
  "Fazendo a conta",
  "Atenção aqui",
  "Conclusão",
];

export function PainelResolucoes() {
  const [itens, setItens] = useState<QuestaoPendente[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({ concurso: "todos", ordem: "erradas" });

  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<{
    explicacao: string;
    passos: Passo[];
    figura_svg: string;
  }>({ explicacao: "", passos: [], figura_svg: "" });

  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const [concursos, setConcursos] = useState<{ sigla: string }[]>([]);

  useEffect(() => {
    fetchWithAuth("/api/concursos")
      .then((r) => r.json())
      .then((j) => j.success && setConcursos(j.data))
      .catch(() => undefined);
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const qs = new URLSearchParams({
        page: String(pagina),
        per_page: "20",
        ordem: filtros.ordem,
      });
      if (filtros.concurso !== "todos") qs.set("concurso", filtros.concurso);

      const res = await fetchWithAuth(`/api/admin/questoes/pendentes?${qs}`);
      const json = await res.json();
      if (json.success) {
        setItens(json.data.items);
        setTotal(json.data.total);
      }
    } catch {
      setAviso("Não consegui carregar a fila.");
    } finally {
      setCarregando(false);
    }
  }, [pagina, filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrir = (q: QuestaoPendente) => {
    if (abertaId === q.id) {
      setAbertaId(null);
      return;
    }
    setAbertaId(q.id);
    setAviso(null);
    setRascunho({
      explicacao: q.explicacao ?? "",
      passos: q.resolucao_passos?.length
        ? q.resolucao_passos
        : [{ titulo: TITULOS_SUGERIDOS[0], conteudo: "", formula: null }],
      figura_svg: q.figura_svg ?? "",
    });
  };

  const salvar = async (q: QuestaoPendente) => {
    setSalvando(true);
    setAviso(null);
    try {
      const res = await fetchWithAuth(`/api/admin/questoes/${q.id}/resolucao`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          explicacao: rascunho.explicacao,
          passos: rascunho.passos.filter((p) => p.conteudo.trim()),
          figura_svg: rascunho.figura_svg,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        setAviso(json.error ?? "Não consegui salvar.");
        return;
      }

      // Sai da fila na hora: a lista é de pendentes.
      setItens((lista) => lista.filter((i) => i.id !== q.id));
      setTotal((t) => Math.max(0, t - 1));
      setAbertaId(null);
      setAviso(`✅ Resolução de ${q.concursos?.sigla} nº ${q.numero_original} salva.`);
    } catch {
      setAviso("Falha de conexão ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const alterarPasso = (i: number, campo: keyof Passo, valor: string) => {
    setRascunho((r) => ({
      ...r,
      passos: r.passos.map((p, idx) =>
        idx === i ? { ...p, [campo]: valor } : p
      ),
    }));
  };

  return (
    <div className="space-y-5">
      {/* ═══ Cabeçalho ═══ */}
      <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="heading mb-1 text-base font-bold text-bat-text">
              ✍️ Fila de resolução
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-bat-text-secondary">
              Questões que entraram <strong>sem gabarito comentado</strong>. O
              aluno vê a letra certa e não entende o porquê. A fila vem
              ordenada por quem mais derruba gente — escrever a do topo rende
              mais.
            </p>
          </div>
          <div className="rounded-xl border border-bat-warning/25 bg-bat-warning/10 px-4 py-2 text-center">
            <p className="heading text-2xl font-bold text-bat-warning">
              {total.toLocaleString("pt-BR")}
            </p>
            <p className="text-[11px] text-bat-text-muted">na fila</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={filtros.concurso}
            onChange={(e) => {
              setPagina(1);
              setFiltros({ ...filtros, concurso: e.target.value });
            }}
            className="input-field max-w-[200px] text-sm"
          >
            <option value="todos">Todos os concursos</option>
            {concursos.map((c) => (
              <option key={c.sigla} value={c.sigla}>
                {c.sigla}
              </option>
            ))}
          </select>

          <select
            value={filtros.ordem}
            onChange={(e) => {
              setPagina(1);
              setFiltros({ ...filtros, ordem: e.target.value });
            }}
            className="input-field max-w-[220px] text-sm"
          >
            <option value="erradas">As que mais derrubam primeiro</option>
            <option value="recentes">Provas mais recentes primeiro</option>
          </select>
        </div>

        {aviso && (
          <p className="mt-3 rounded-xl border border-bat-border bg-bat-bg-secondary px-3 py-2 text-sm text-bat-text-secondary">
            {aviso}
          </p>
        )}
      </div>

      {/* ═══ Lista ═══ */}
      {carregando ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : itens.length === 0 ? (
        <div className="rounded-2xl border border-bat-success/25 bg-bat-success/5 p-10 text-center">
          <span className="mb-3 block text-4xl">🎉</span>
          <p className="heading text-lg text-bat-text">
            Nenhuma questão pendente com esse filtro
          </p>
          <p className="mt-1 text-sm text-bat-text-secondary">
            Todo gabarito desse recorte já está comentado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {itens.map((q) => {
            const aberta = abertaId === q.id;
            const taxa =
              q.vezes_respondida && q.vezes_respondida > 0
                ? Math.round(
                    ((q.vezes_acertada ?? 0) / q.vezes_respondida) * 100
                  )
                : null;

            return (
              <article
                key={q.id}
                className="overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card"
              >
                {/* Cabeçalho clicável */}
                <button
                  onClick={() => abrir(q)}
                  className="flex w-full cursor-pointer items-start gap-3 p-4 text-left transition-colors hover:bg-bat-bg-elevated"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-bat-gold-400/20 bg-bat-gold-400/10 px-2 py-0.5 text-[11px] font-bold text-bat-gold-400">
                        {q.concursos?.sigla} {q.ano}
                      </span>
                      {q.materias?.nome && (
                        <span className="rounded-lg bg-bat-bg-secondary px-2 py-0.5 text-[11px] text-bat-text-muted">
                          {q.materias.icone_emoji} {q.materias.nome}
                        </span>
                      )}
                      {q.precisa_resolucao && (
                        <span className="rounded-lg bg-bat-info/10 px-2 py-0.5 text-[11px] font-bold text-bat-info">
                          cálculo
                        </span>
                      )}
                      {taxa !== null && (
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                            taxa < 40
                              ? "bg-bat-error/10 text-bat-error"
                              : "bg-bat-bg-secondary text-bat-text-muted"
                          }`}
                        >
                          {taxa}% de acerto · {q.vezes_respondida} respostas
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm text-bat-text-secondary">
                      {q.enunciado}
                    </p>
                  </div>
                  <span
                    className={`mt-1 shrink-0 text-bat-text-muted transition-transform ${
                      aberta ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {/* Editor */}
                {aberta && (
                  <div className="space-y-4 border-t border-bat-border bg-bat-bg-secondary/40 p-4">
                    {/* A questão como o aluno vê */}
                    <div className="rounded-xl border border-bat-border bg-bat-bg-card p-4">
                      {q.texto_base && (
                        <div className="mb-3 max-h-40 overflow-y-auto border-l-2 border-bat-gold-400/40 pl-3 text-xs leading-relaxed text-bat-text-muted">
                          {q.texto_base}
                        </div>
                      )}
                      <QuadroFigura
                        descricao={q.figura_descricao}
                        svg={q.figura_svg}
                      />
                      <p className="mb-3 whitespace-pre-line text-sm text-bat-text">
                        {q.enunciado}
                      </p>
                      <div className="space-y-1">
                        {q.alternativas?.map((a) => (
                          <p
                            key={a.letra}
                            className={`rounded-lg px-2.5 py-1.5 text-xs ${
                              a.letra === q.resposta_correta
                                ? "bg-bat-success/10 font-medium text-bat-success"
                                : "text-bat-text-secondary"
                            }`}
                          >
                            <strong>{a.letra})</strong> {a.texto}
                            {a.letra === q.resposta_correta && " ✓ oficial"}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Explicação */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-bat-text-secondary">
                        Por que essa é a resposta
                      </label>
                      <textarea
                        value={rascunho.explicacao}
                        onChange={(e) =>
                          setRascunho({ ...rascunho, explicacao: e.target.value })
                        }
                        rows={4}
                        placeholder="O raciocínio em prosa. Para questão de interpretação, isso já basta."
                        className="input-field w-full resize-y text-sm"
                      />
                    </div>

                    {/* Passos */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-bat-text-secondary">
                          Resolução passo a passo
                        </label>
                        <span className="text-[11px] text-bat-text-muted">
                          {q.precisa_resolucao
                            ? "questão de cálculo — o aluno precisa disso"
                            : "opcional para interpretação"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {rascunho.passos.map((p, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-bat-border bg-bat-bg-card p-3"
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bat-gold-400/15 text-[11px] font-bold text-bat-gold-400">
                                {i + 1}
                              </span>
                              <input
                                list="titulos-passo"
                                value={p.titulo}
                                onChange={(e) =>
                                  alterarPasso(i, "titulo", e.target.value)
                                }
                                placeholder="Título do passo"
                                className="input-field flex-1 py-1.5 text-xs"
                              />
                              <button
                                onClick={() =>
                                  setRascunho((r) => ({
                                    ...r,
                                    passos: r.passos.filter((_, x) => x !== i),
                                  }))
                                }
                                className="shrink-0 cursor-pointer px-2 text-xs text-bat-text-muted hover:text-bat-error"
                                title="Remover passo"
                              >
                                ✕
                              </button>
                            </div>
                            <textarea
                              value={p.conteudo}
                              onChange={(e) =>
                                alterarPasso(i, "conteudo", e.target.value)
                              }
                              rows={2}
                              placeholder="O que se faz nesta etapa, e por quê."
                              className="input-field w-full resize-y text-xs"
                            />
                            <input
                              value={p.formula ?? ""}
                              onChange={(e) =>
                                alterarPasso(i, "formula", e.target.value)
                              }
                              placeholder="Fórmula em destaque (opcional): A = b·h/2"
                              className="input-field mt-2 w-full py-1.5 font-mono text-xs"
                            />
                          </div>
                        ))}
                      </div>

                      <datalist id="titulos-passo">
                        {TITULOS_SUGERIDOS.map((t) => (
                          <option key={t} value={t} />
                        ))}
                      </datalist>

                      <button
                        onClick={() =>
                          setRascunho((r) => ({
                            ...r,
                            passos: [
                              ...r.passos,
                              {
                                titulo:
                                  TITULOS_SUGERIDOS[
                                    Math.min(
                                      r.passos.length,
                                      TITULOS_SUGERIDOS.length - 1
                                    )
                                  ],
                                conteudo: "",
                                formula: null,
                              },
                            ],
                          }))
                        }
                        className="mt-2 cursor-pointer rounded-lg border border-bat-border px-3 py-1.5 text-xs text-bat-text-secondary hover:border-bat-gold-400/40 hover:text-bat-gold-400"
                      >
                        + Adicionar passo
                      </button>
                    </div>

                    {/* SVG do quadro branco */}
                    <details className="rounded-xl border border-bat-border bg-bat-bg-card px-3 py-2">
                      <summary className="cursor-pointer text-xs font-semibold text-bat-text-secondary">
                        Desenho da figura (SVG) — para questões de geometria
                      </summary>
                      <textarea
                        value={rascunho.figura_svg}
                        onChange={(e) =>
                          setRascunho({ ...rascunho, figura_svg: e.target.value })
                        }
                        rows={4}
                        placeholder='<svg viewBox="0 0 200 120">…</svg>'
                        className="input-field mt-2 w-full resize-y font-mono text-[11px]"
                      />
                      <p className="mt-1 text-[11px] text-bat-text-muted">
                        Renderiza no quadro branco da questão. Script, evento
                        inline e referência externa são recusados.
                      </p>
                    </details>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => salvar(q)}
                        disabled={
                          salvando ||
                          (!rascunho.explicacao.trim() &&
                            !rascunho.passos.some((p) => p.conteudo.trim()))
                        }
                        className="btn-primary px-6 py-2.5 text-sm disabled:opacity-40"
                      >
                        {salvando ? "Salvando…" : "Salvar e tirar da fila"}
                      </button>
                      <button
                        onClick={() => setAbertaId(null)}
                        className="btn-secondary px-5 py-2.5 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* ═══ Paginação ═══ */}
      {total > 20 && (
        <div className="flex items-center justify-between rounded-2xl border border-bat-border bg-bat-bg-card px-4 py-3">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="btn-secondary px-4 py-2 text-xs disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="text-xs text-bat-text-muted">
            Página {pagina} de {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPagina((p) => p + 1)}
            disabled={pagina >= Math.ceil(total / 20)}
            className="btn-secondary px-4 py-2 text-xs disabled:opacity-30"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
