"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";
import { QuadroFigura } from "@/components/questoes/QuadroFigura";

/**
 * Fila de contestações — onde os alunos dizem que a questão está errada.
 *
 * O número que decide o que olhar primeiro não é quantas contestações
 * existem, é quantas pessoas DIFERENTES resolveram a questão e chegaram à
 * MESMA resposta divergente. Um aluno sozinho é quase sempre um aluno que
 * errou; três apontando a mesma letra é a assinatura de um gabarito errado
 * de verdade. A rota ordena por isso, e o selo de consenso marca esses.
 *
 * Julgar não muda a questão como efeito colateral. Corrigir o gabarito e
 * anular são botões separados e explícitos: quem corrige um gabarito tem
 * que dizer que está corrigindo um gabarito.
 */

interface Caso {
  id: string;
  tipo: string;
  motivo: string;
  alternativa_sugerida: string | null;
  status: string;
  resposta_admin: string | null;
  criado_em: string;
  apelido: string;
  avatar_url: string | null;
}

interface QuestaoContestada {
  id: string;
  enunciado: string;
  alternativas: { letra: string; texto: string }[] | null;
  resposta_correta: string;
  explicacao: string | null;
  anulada: boolean;
  ano: number | null;
  numero_original: string | null;
  figura_descricao: string | null;
  figura_svg: string | null;
  vezes_respondida: number | null;
  vezes_acertada: number | null;
  concursos: { sigla: string } | null;
  materias: { nome: string; icone_emoji: string | null } | null;
  assuntos: { nome: string } | null;
}

interface Grupo {
  questao: QuestaoContestada;
  casos: Caso[];
  total: number;
  consenso: { letra: string; votos: number } | null;
}

const ROTULO_TIPO: Record<string, string> = {
  gabarito: "gabarito",
  enunciado: "enunciado",
  alternativa: "alternativa",
  figura: "figura",
  explicacao: "explicação",
};

export function PainelContestacoes() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [resumo, setResumo] = useState<{ abertas: number; questoes: number } | null>(
    null
  );
  const [carregando, setCarregando] = useState(true);
  const [status, setStatus] = useState("aberta");
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);

  const [resposta, setResposta] = useState("");
  const [novoGabarito, setNovoGabarito] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetchWithAuth(`/api/admin/contestacoes?status=${status}`);
      const json = await res.json();
      if (json.success) {
        setGrupos(json.data.grupos ?? []);
        setResumo(json.data.resumo ?? null);
      } else {
        setAviso(json.error ?? "Não consegui carregar a fila.");
      }
    } catch {
      setAviso("Falha de conexão ao carregar a fila.");
    } finally {
      setCarregando(false);
    }
  }, [status]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const julgar = async (
    grupo: Grupo,
    caso: Caso,
    novoStatus: string,
    opcoes: { anular?: boolean; gabarito?: string } = {}
  ) => {
    setSalvando(caso.id);
    setAviso(null);
    try {
      const res = await fetchWithAuth("/api/admin/contestacoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: caso.id,
          status: novoStatus,
          resposta_admin: resposta.trim() || undefined,
          anular_questao: opcoes.anular || undefined,
          novo_gabarito: opcoes.gabarito || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setAviso(json.error ?? "Não consegui julgar.");
        return;
      }
      setResposta("");
      setNovoGabarito("");
      setAviso(
        opcoes.gabarito
          ? `Gabarito de ${grupo.questao.concursos?.sigla} nº ${grupo.questao.numero_original} corrigido para ${opcoes.gabarito}.`
          : opcoes.anular
            ? "Questão anulada."
            : "Caso julgado."
      );
      await carregar();
    } catch {
      setAviso("Falha de conexão ao julgar.");
    } finally {
      setSalvando(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* ═══ Cabeçalho ═══ */}
      <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="heading mb-1 text-base font-bold text-bat-text">
              ⚖️ Contestações de gabarito
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-bat-text-secondary">
              As questões vieram de extração de PDF, e extração de PDF erra. O
              aluno que resolveu com atenção e discorda é o melhor detector que
              a plataforma tem. Vem ordenado por <strong>consenso</strong>:
              várias pessoas apontando a <em>mesma</em> letra é o sinal que
              importa — uma sozinha costuma ser quem errou.
            </p>
          </div>
          {resumo && (
            <div className="rounded-xl border border-bat-warning/25 bg-bat-warning/10 px-4 py-2 text-center">
              <p className="heading text-2xl font-bold text-bat-warning">
                {resumo.questoes}
              </p>
              <p className="text-[11px] text-bat-text-muted">questões na fila</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {[
            { v: "aberta", r: "Abertas" },
            { v: "procede", r: "Procedentes" },
            { v: "improcede", r: "Improcedentes" },
            { v: "todas", r: "Todas" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => {
                setStatus(o.v);
                setAbertaId(null);
              }}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                status === o.v
                  ? "bg-bat-gold-400 text-black"
                  : "bg-bat-bg-secondary text-bat-text-secondary hover:bg-bat-bg-elevated"
              }`}
            >
              {o.r}
            </button>
          ))}
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
      ) : grupos.length === 0 ? (
        <div className="rounded-2xl border border-bat-success/25 bg-bat-success/5 p-10 text-center">
          <span className="mb-3 block text-4xl">✅</span>
          <p className="heading text-lg text-bat-text">Nenhuma contestação aqui</p>
          <p className="mt-1 text-sm text-bat-text-secondary">
            {status === "aberta"
              ? "Nenhum aluno contestou questão nenhuma ainda — ou todas já foram julgadas."
              : "Nada com esse filtro."}
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          {grupos.map((g) => {
            const aberta = abertaId === g.questao.id;
            const taxa =
              g.questao.vezes_respondida && g.questao.vezes_respondida > 0
                ? Math.round(
                    ((g.questao.vezes_acertada ?? 0) / g.questao.vezes_respondida) *
                      100
                  )
                : null;

            return (
              <li
                key={g.questao.id}
                className="overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card"
              >
                <button
                  onClick={() => {
                    setAbertaId(aberta ? null : g.questao.id);
                    setResposta("");
                    setNovoGabarito("");
                  }}
                  className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-bat-bg-elevated"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-bat-bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-bat-text-secondary">
                        {g.questao.concursos?.sigla ?? "—"} {g.questao.ano ?? ""}
                        {g.questao.numero_original
                          ? ` · nº ${g.questao.numero_original}`
                          : ""}
                      </span>
                      <span className="text-[10px] text-bat-text-muted">
                        {g.questao.materias?.icone_emoji ?? "📘"}{" "}
                        {g.questao.materias?.nome ?? "—"}
                      </span>
                      {g.questao.anulada && (
                        <span className="rounded bg-bat-error/15 px-1.5 py-0.5 text-[10px] font-bold text-bat-error">
                          ANULADA
                        </span>
                      )}
                      {g.consenso && (
                        <span className="rounded bg-bat-warning/20 px-1.5 py-0.5 text-[10px] font-bold text-bat-warning">
                          ⚠ {g.consenso.votos} alunos dizem que é{" "}
                          {g.consenso.letra}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm text-bat-text">
                      {g.questao.enunciado}
                    </p>
                    <p className="mt-1 text-[11px] text-bat-text-muted">
                      gabarito atual <strong>{g.questao.resposta_correta}</strong>
                      {taxa !== null && ` · ${taxa}% acertam`}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="heading text-lg font-bold tabular-nums text-bat-gold-400">
                      {g.total}
                    </p>
                    <p className="text-[10px] text-bat-text-muted">
                      contestaç{g.total === 1 ? "ão" : "ões"}
                    </p>
                  </div>
                </button>

                {aberta && (
                  <div className="border-t border-bat-border bg-bat-bg-secondary/40 px-4 py-4">
                    {/* A questão como o aluno viu */}
                    {(g.questao.figura_descricao || g.questao.figura_svg) && (
                      <QuadroFigura
                        descricao={g.questao.figura_descricao}
                        svg={g.questao.figura_svg}
                      />
                    )}

                    <ul className="mb-4 space-y-1">
                      {(g.questao.alternativas ?? []).map((a) => (
                        <li
                          key={a.letra}
                          className={`rounded-lg px-3 py-1.5 text-xs ${
                            a.letra === g.questao.resposta_correta
                              ? "bg-bat-success/15 font-bold text-bat-success"
                              : g.consenso && a.letra === g.consenso.letra
                                ? "bg-bat-warning/15 text-bat-warning"
                                : "text-bat-text-secondary"
                          }`}
                        >
                          <strong>{a.letra})</strong> {a.texto}
                          {a.letra === g.questao.resposta_correta && " ← gabarito"}
                          {g.consenso &&
                            a.letra === g.consenso.letra &&
                            " ← os alunos"}
                        </li>
                      ))}
                    </ul>

                    {/* Os casos */}
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-bat-text-muted">
                      O que disseram
                    </p>
                    <ul className="mb-4 space-y-2">
                      {g.casos.map((c) => (
                        <li
                          key={c.id}
                          className="rounded-xl border border-bat-border bg-bat-bg-card px-3 py-2"
                        >
                          <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px]">
                            <strong className="text-bat-text">{c.apelido}</strong>
                            <span className="rounded bg-bat-bg-secondary px-1.5 py-0.5 text-bat-text-muted">
                              {ROTULO_TIPO[c.tipo] ?? c.tipo}
                            </span>
                            {c.alternativa_sugerida && (
                              <span className="rounded bg-bat-warning/15 px-1.5 py-0.5 font-bold text-bat-warning">
                                defende {c.alternativa_sugerida}
                              </span>
                            )}
                            <span className="text-bat-text-muted">
                              {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                            </span>
                            {c.status !== "aberta" && (
                              <span className="rounded bg-bat-bg-secondary px-1.5 py-0.5 text-bat-text-secondary">
                                {c.status}
                              </span>
                            )}
                          </div>
                          <p className="whitespace-pre-line text-xs leading-relaxed text-bat-text-secondary">
                            {c.motivo}
                          </p>

                          {c.status === "aberta" && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <button
                                disabled={salvando === c.id}
                                onClick={() => julgar(g, c, "improcede")}
                                className="cursor-pointer rounded-lg border border-bat-border px-2.5 py-1 text-[11px] text-bat-text-secondary transition-colors hover:border-bat-error/40 hover:text-bat-error disabled:opacity-40"
                              >
                                Improcede
                              </button>
                              <button
                                disabled={salvando === c.id}
                                onClick={() => julgar(g, c, "procede")}
                                className="cursor-pointer rounded-lg border border-bat-success/40 px-2.5 py-1 text-[11px] text-bat-success transition-colors hover:bg-bat-success/10 disabled:opacity-40"
                              >
                                Procede (sem mudar a questão)
                              </button>
                              {c.alternativa_sugerida && (
                                <button
                                  disabled={salvando === c.id}
                                  onClick={() =>
                                    julgar(g, c, "procede", {
                                      gabarito: c.alternativa_sugerida!,
                                    })
                                  }
                                  className="cursor-pointer rounded-lg bg-bat-gold-400 px-2.5 py-1 text-[11px] font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                                >
                                  Procede e corrigir para{" "}
                                  {c.alternativa_sugerida}
                                </button>
                              )}
                              <button
                                disabled={salvando === c.id}
                                onClick={() =>
                                  julgar(g, c, "procede", { anular: true })
                                }
                                className="cursor-pointer rounded-lg border border-bat-warning/40 px-2.5 py-1 text-[11px] text-bat-warning transition-colors hover:bg-bat-warning/10 disabled:opacity-40"
                              >
                                Procede e anular
                              </button>
                            </div>
                          )}

                          {c.resposta_admin && (
                            <p className="mt-2 rounded-lg bg-bat-bg-secondary px-2.5 py-1.5 text-[11px] text-bat-text-muted">
                              <strong>Resposta:</strong> {c.resposta_admin}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>

                    <label className="mb-1 block text-[11px] text-bat-text-muted">
                      Resposta ao aluno (vai junto com o julgamento)
                    </label>
                    <textarea
                      value={resposta}
                      onChange={(e) => setResposta(e.target.value)}
                      rows={2}
                      placeholder="Conferi no gabarito oficial do INEP: a resposta é C mesmo. Sua conta parou na etapa 2."
                      className="input-field w-full resize-y text-xs"
                    />
                    <p className="mt-1 text-[10px] text-bat-text-muted">
                      Contestar e nunca saber no que deu ensina o aluno a não
                      contestar mais. Vale escrever.
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
