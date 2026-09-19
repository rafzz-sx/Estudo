"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/stores/auth-store";
import { QuadroFigura } from "@/components/questoes/QuadroFigura";
import {
  ResolucaoGabarito,
  type PassoResolucao,
} from "@/components/questoes/ResolucaoGabarito";
import { MathText } from "@/components/MathText";

interface QuestaoErrada {
  id: string;
  texto_base: string | null;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  resposta_correta: string;
  explicacao: string | null;
  explicacao_alternativas: any;
  resolucao_passos: PassoResolucao[] | null;
  figura_descricao: string | null;
  figura_svg: string | null;
  precisa_resolucao: boolean;
  ano: number | null;
  dificuldade: string;
  erros: number;
  errada_em: string | null;
  anotacao: string | null;
  resolvida: boolean;
  concursos: { sigla: string; emoji: string | null } | null;
  materias: { nome: string; icone_emoji: string | null } | null;
  assuntos: { nome: string } | null;
}

interface Grupo {
  chave: string;
  materia: string;
  emoji: string;
  questoes: QuestaoErrada[];
}

export default function CadernoPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [resumo, setResumo] = useState({
    total: 0,
    resolvidas: 0,
    recuperadas: 0,
    taxa_recuperacao: 0,
  });
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({
    agrupar: "assunto",
    resolvidas: false,
  });
  const [aberta, setAberta] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const qs = new URLSearchParams({ agrupar: filtros.agrupar });
      if (filtros.resolvidas) qs.set("resolvidas", "1");

      const res = await fetchWithAuth(`/api/caderno-erros?${qs}`);
      const json = await res.json();
      if (json.success) {
        setGrupos(json.data.grupos);
        setResumo({
          total: json.data.total,
          resolvidas: json.data.resolvidas,
          recuperadas: json.data.recuperadas ?? 0,
          taxa_recuperacao: json.data.taxa_recuperacao,
        });
      }
    } catch {
      /* estado vazio cobre */
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const salvarAnotacao = async (questaoId: string) => {
    setSalvando(questaoId);
    try {
      await fetchWithAuth("/api/caderno-erros", {
        method: "PATCH",
        body: JSON.stringify({
          questao_id: questaoId,
          anotacao: rascunho[questaoId] ?? "",
        }),
      });
      setGrupos((gs) =>
        gs.map((g) => ({
          ...g,
          questoes: g.questoes.map((q) =>
            q.id === questaoId ? { ...q, anotacao: rascunho[questaoId] ?? "" } : q
          ),
        }))
      );
    } finally {
      setSalvando(null);
    }
  };

  const marcarResolvida = async (questaoId: string) => {
    await fetchWithAuth("/api/caderno-erros", {
      method: "PATCH",
      body: JSON.stringify({ questao_id: questaoId, resolvida: true }),
    }).catch(() => undefined);
    carregar();
  };

  return (
    <div>
      <header className="mb-5">
        <h1 className="heading flex items-center gap-3 text-2xl font-bold text-bat-text sm:text-3xl">
          <span>📓</span> Caderno de erros
        </h1>
        <p className="mt-1 text-sm text-bat-text-secondary">
          Só o que você errou e ainda não acertou depois, agrupado por assunto.
          É aqui que a aprovação é construída.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Cartao rotulo="Erros em aberto" valor={String(resumo.total)} cor="#EF4444" />
          <Cartao rotulo="Recuperadas" valor={String(resumo.recuperadas)} cor="#22C55E" />
          <Cartao
            rotulo="Taxa de recuperação"
            valor={`${resumo.taxa_recuperacao}%`}
            cor={resumo.taxa_recuperacao >= 50 ? "#22C55E" : "#F5C518"}
          />
          <Cartao rotulo="Marcadas como resolvidas" valor={String(resumo.resolvidas)} />
        </div>
      </header>

      {/* ═══ FILTROS ═══ */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5 rounded-xl border border-bat-border bg-bat-bg-card p-1">
          {[
            ["assunto", "Por assunto"],
            ["materia", "Por matéria"],
          ].map(([valor, rotulo]) => (
            <button
              key={valor}
              onClick={() => setFiltros({ ...filtros, agrupar: valor })}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                filtros.agrupar === valor
                  ? "bg-bat-gold-400 text-black"
                  : "text-bat-text-muted hover:text-bat-text"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-bat-border bg-bat-bg-card px-3.5 py-2">
          <input
            type="checkbox"
            checked={filtros.resolvidas}
            onChange={(e) =>
              setFiltros({ ...filtros, resolvidas: e.target.checked })
            }
            className="accent-bat-gold-400"
          />
          <span className="text-xs text-bat-text-secondary">
            Ver as que marquei como resolvidas
          </span>
        </label>

        <Link
          href="/revisoes"
          className="ml-auto text-xs font-medium text-bat-gold-400 no-underline hover:underline"
        >
          🔁 Ir para a revisão espaçada
        </Link>
      </div>

      {/* ═══ CONTEÚDO ═══ */}
      {carregando ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : grupos.length === 0 ? (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
          <span className="mb-3 block text-4xl">
            {filtros.resolvidas ? "✅" : "🦇"}
          </span>
          <h2 className="heading mb-2 text-lg text-bat-text">
            {filtros.resolvidas
              ? "Nenhuma questão marcada como resolvida"
              : "Seu caderno está limpo"}
          </h2>
          <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-bat-text-secondary">
            {filtros.resolvidas
              ? "Quando você entender uma questão a fundo, marque-a como resolvida para tirá-la da lista principal."
              : "Ou você ainda não errou nenhuma, ou já acertou todas depois. Nos dois casos: siga resolvendo."}
          </p>
          <Link
            href="/questoes"
            className="btn-primary inline-block px-6 py-3 no-underline"
          >
            Resolver questões →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.map((g) => (
            <section
              key={g.chave}
              className="overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card"
            >
              <header className="flex items-center gap-3 border-b border-bat-border bg-bat-bg-secondary/40 px-5 py-3">
                <span className="text-xl">{g.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="heading truncate text-sm font-bold text-bat-text">
                    {g.chave}
                  </h2>
                  {filtros.agrupar === "assunto" && (
                    <p className="text-[11px] text-bat-text-muted">{g.materia}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-lg bg-bat-error/15 px-2.5 py-1 text-xs font-bold text-bat-error">
                  {g.questoes.length} erro{g.questoes.length !== 1 ? "s" : ""}
                </span>
              </header>

              <ul className="divide-y divide-bat-border/40">
                {g.questoes.map((q) => {
                  const expandida = aberta === q.id;
                  return (
                    <li key={q.id}>
                      <button
                        onClick={() => {
                          setAberta(expandida ? null : q.id);
                          if (!expandida && rascunho[q.id] === undefined) {
                            setRascunho((r) => ({ ...r, [q.id]: q.anotacao ?? "" }));
                          }
                        }}
                        className="flex w-full cursor-pointer items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-bat-bg-elevated/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm text-bat-text-secondary">
                            <MathText>{q.enunciado}</MathText>
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-bat-text-muted">
                            <span>
                              {q.concursos?.emoji} {q.concursos?.sigla}
                              {q.ano ? ` ${q.ano}` : ""}
                            </span>
                            {q.erros > 1 && (
                              <span className="rounded bg-bat-error/15 px-1.5 py-0.5 font-bold text-bat-error">
                                errou {q.erros}x
                              </span>
                            )}
                            {q.anotacao && <span>📝 com anotação</span>}
                          </div>
                        </div>
                        <span
                          className={`shrink-0 text-bat-text-muted transition-transform ${
                            expandida ? "rotate-180" : ""
                          }`}
                        >
                          ▾
                        </span>
                      </button>

                      {expandida && (
                        <div className="border-t border-bat-border/40 bg-bat-bg-secondary/20 px-5 py-4">
                          {q.texto_base && (
                            <div className="mb-4 rounded-xl border-l-4 border-bat-gold-400/50 bg-bat-bg-secondary/50 px-4 py-3">
                              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-bat-text-muted">
                                Texto base
                              </p>
                              <div className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
                                <MathText>{q.texto_base}</MathText>
                              </div>
                            </div>
                          )}

                          <QuadroFigura
                            descricao={q.figura_descricao}
                            svg={q.figura_svg}
                          />

                          <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-bat-text">
                            <MathText>{q.enunciado}</MathText>
                          </p>

                          <div className="mb-4 space-y-2">
                            {q.alternativas?.map((alt) => (
                              <div
                                key={alt.letra}
                                className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm ${
                                  alt.letra === q.resposta_correta
                                    ? "border-bat-success/40 bg-bat-success/10 text-bat-success"
                                    : "border-bat-border bg-bat-bg-secondary/50 text-bat-text-secondary"
                                }`}
                              >
                                <span className="font-bold">{alt.letra})</span>
                                <span className="whitespace-pre-line">
                                  <MathText>{alt.texto}</MathText>
                                </span>
                              </div>
                            ))}
                          </div>

                          <ResolucaoGabarito
                            respostaCorreta={q.resposta_correta}
                            explicacao={q.explicacao}
                            explicacaoAlternativas={q.explicacao_alternativas}
                            alternativas={q.alternativas}
                            passos={q.resolucao_passos}
                            figuraDescricao={q.figura_descricao}
                            figuraSvg={q.figura_svg}
                            precisaResolucao={q.precisa_resolucao}
                          />

                          {/* ─── Anotação pessoal ─── */}
                          <div className="mt-4 rounded-xl border border-bat-border bg-bat-bg-card p-4">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-bat-text-secondary">
                              📝 Sua anotação
                            </label>
                            <p className="mb-2 text-[11px] leading-relaxed text-bat-text-muted">
                              Escreva com suas palavras onde seu raciocínio se
                              separou do correto. Reler isso vale mais do que
                              reler o gabarito.
                            </p>
                            <textarea
                              value={rascunho[q.id] ?? ""}
                              onChange={(e) =>
                                setRascunho((r) => ({
                                  ...r,
                                  [q.id]: e.target.value,
                                }))
                              }
                              rows={3}
                              placeholder="Eu marquei B porque confundi média com mediana..."
                              className="input-field w-full resize-none text-sm"
                            />
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                onClick={() => salvarAnotacao(q.id)}
                                disabled={salvando === q.id}
                                className="btn-secondary px-4 py-2 text-xs disabled:opacity-40"
                              >
                                {salvando === q.id ? "Salvando..." : "Salvar anotação"}
                              </button>
                              <button
                                onClick={() => marcarResolvida(q.id)}
                                className="btn-primary px-4 py-2 text-xs"
                              >
                                ✅ Entendi, pode sair do caderno
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
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
    <div className="rounded-xl border border-bat-border bg-bat-bg-card px-4 py-3">
      <p className="heading text-xl font-bold" style={{ color: cor }}>
        {valor}
      </p>
      <p className="text-[11px] text-bat-text-muted">{rotulo}</p>
    </div>
  );
}
