"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/stores/auth-store";
import { QuadroFigura } from "@/components/questoes/QuadroFigura";
import {
  ResolucaoGabarito,
  type PassoResolucao,
} from "@/components/questoes/ResolucaoGabarito";
import { MathText } from "@/components/MathText";
import { tratarTextoBaseEFigura } from "@/lib/questoes-figura";

interface QuestaoErrada {
  id: string;
  texto_base: string | null;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  resposta_correta: string;
  resposta_dada?: string | null;
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
  const [busca, setBusca] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("todas");
  const [filtroConcurso, setFiltroConcurso] = useState("todos");
  const [ordem, setOrdem] = useState<"mais_erros" | "recentes">("mais_erros");

  const [aberta, setAberta] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState<string | null>(null);
  const [salvoComSucesso, setSalvoComSucesso] = useState<string | null>(null);

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

  // Lista de matérias e concursos presentes nas questões do caderno para os filtros
  const { listaMaterias, listaConcursos } = useMemo(() => {
    const matSet = new Set<string>();
    const concSet = new Set<string>();
    for (const g of grupos) {
      for (const q of g.questoes) {
        if (q.materias?.nome) matSet.add(q.materias.nome);
        if (q.concursos?.sigla) concSet.add(q.concursos.sigla);
      }
    }
    return {
      listaMaterias: Array.from(matSet).sort(),
      listaConcursos: Array.from(concSet).sort(),
    };
  }, [grupos]);

  // Grupos filtrados e ordenados pelo usuário
  const gruposFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return grupos
      .map((g) => {
        const questoesFiltradas = g.questoes.filter((q) => {
          if (filtroMateria !== "todas" && q.materias?.nome !== filtroMateria) return false;
          if (filtroConcurso !== "todos" && q.concursos?.sigla !== filtroConcurso) return false;

          if (termo) {
            const matchesEnunciado = q.enunciado.toLowerCase().includes(termo);
            const matchesAssunto = q.assuntos?.nome?.toLowerCase().includes(termo);
            const matchesConcurso = q.concursos?.sigla?.toLowerCase().includes(termo);
            const matchesMateria = q.materias?.nome?.toLowerCase().includes(termo);
            const matchesAno = q.ano ? String(q.ano).includes(termo) : false;
            if (!matchesEnunciado && !matchesAssunto && !matchesConcurso && !matchesMateria && !matchesAno) {
              return false;
            }
          }
          return true;
        });

        // Ordenação das questões dentro do grupo
        const questoesOrdenadas = [...questoesFiltradas].sort((a, b) => {
          if (ordem === "mais_erros") {
            return b.erros - a.erros;
          }
          const dataA = a.errada_em ? new Date(a.errada_em).getTime() : 0;
          const dataB = b.errada_em ? new Date(b.errada_em).getTime() : 0;
          return dataB - dataA;
        });

        return {
          ...g,
          questoes: questoesOrdenadas,
        };
      })
      .filter((g) => g.questoes.length > 0);
  }, [grupos, busca, filtroMateria, filtroConcurso, ordem]);

  const totalQuestoesVisiveis = useMemo(() => {
    return gruposFiltrados.reduce((acc, g) => acc + g.questoes.length, 0);
  }, [gruposFiltrados]);

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
      setSalvoComSucesso(questaoId);
      setTimeout(() => setSalvoComSucesso(null), 3000);
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
          Todas as questões que você errou e ainda não acertou depois, com comparação da sua resposta anterior e do gabarito oficial.
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

      {/* ═══ BARRA DE BUSCA E FILTROS TÁTICOS ═══ */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Busca em tempo real */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bat-text-muted text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por termo no enunciado, assunto, concurso ou ano..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input-field w-full pl-9 pr-8 text-xs"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bat-text-muted hover:text-bat-text text-xs p-1"
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro por Concurso */}
          {listaConcursos.length > 0 && (
            <select
              value={filtroConcurso}
              onChange={(e) => setFiltroConcurso(e.target.value)}
              className="input-field text-xs py-2 px-3 bg-bat-bg-card border-bat-border shrink-0 cursor-pointer"
            >
              <option value="todos">Todos os concursos</option>
              {listaConcursos.map((c) => (
                <option key={c} value={c}>
                  🎯 {c}
                </option>
              ))}
            </select>
          )}

          {/* Filtro por Matéria */}
          {listaMaterias.length > 0 && (
            <select
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              className="input-field text-xs py-2 px-3 bg-bat-bg-card border-bat-border shrink-0 cursor-pointer"
            >
              <option value="todas">Todas as matérias</option>
              {listaMaterias.map((m) => (
                <option key={m} value={m}>
                  📚 {m}
                </option>
              ))}
            </select>
          )}

          {/* Ordenação */}
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value as any)}
            className="input-field text-xs py-2 px-3 bg-bat-bg-card border-bat-border shrink-0 cursor-pointer font-bold text-bat-gold-400"
          >
            <option value="mais_erros">🔥 Mais erradas primeiro</option>
            <option value="recentes">🕒 Mais recentes primeiro</option>
          </select>
        </div>

        {/* Agrupamento & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
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
                      ? "bg-bat-gold-400 text-black shadow-xs"
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
                Ver as marcadas como resolvidas
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-bat-text-muted">
              {totalQuestoesVisiveis} {totalQuestoesVisiveis === 1 ? "questão visível" : "questões visíveis"}
            </span>
            <Link
              href="/revisoes"
              className="text-xs font-medium text-bat-gold-400 no-underline hover:underline flex items-center gap-1"
            >
              <span>🔁 Revisão espaçada</span>
              <span>→</span>
            </Link>
          </div>
        </div>
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
                          {(() => {
                            const { textoBaseFinal, figuraDescricaoFinal } = tratarTextoBaseEFigura(
                              q.texto_base,
                              q.figura_descricao
                            );
                            return (
                              <>
                                {textoBaseFinal && (
                                  <div className="mb-4 rounded-xl border-l-4 border-bat-gold-400/50 bg-bat-bg-secondary/50 px-4 py-3">
                                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-bat-text-muted">
                                      Texto base
                                    </p>
                                    <div className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
                                      <MathText>{textoBaseFinal}</MathText>
                                    </div>
                                  </div>
                                )}

                                <QuadroFigura
                                  descricao={figuraDescricaoFinal}
                                  svg={q.figura_svg}
                                />
                              </>
                            );
                          })()}

                          <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-bat-text">
                            <MathText>{q.enunciado}</MathText>
                          </p>

                          {/* ─── BANNER COMPARATIVO & REFAZER QUESTÃO ─── */}
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bat-border/60 bg-bat-bg-card p-3.5 shadow-sm">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                              {q.resposta_dada ? (
                                <>
                                  <span className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1 font-bold text-red-400">
                                    <span>❌</span> Você marcou: <span className="font-mono text-white underline">Letra {q.resposta_dada}</span>
                                  </span>
                                  <span className="text-bat-text-muted">➔</span>
                                </>
                              ) : null}
                              <span className="flex items-center gap-1.5 rounded-lg border border-green-500/40 bg-green-500/10 px-2.5 py-1 font-bold text-green-400">
                                <span>✅</span> Gabarito oficial: <span className="font-mono text-white underline">Letra {q.resposta_correta}</span>
                              </span>
                            </div>

                            <Link
                              href={`/questoes?id=${q.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-bat-gold-400/40 bg-bat-gold-400/10 px-3.5 py-1.5 text-xs font-bold text-bat-gold-400 hover:bg-bat-gold-400 hover:text-black transition-all no-underline"
                            >
                              <span>🎯</span> Refazer no Banco de Questões
                            </Link>
                          </div>

                          <div className="mb-4 space-y-2">
                            {q.alternativas?.map((alt) => {
                              const ehGabarito = alt.letra === q.resposta_correta;
                              const ehSuaResposta = alt.letra === q.resposta_dada;

                              let estiloBorda = "border-bat-border bg-bat-bg-secondary/50 text-bat-text-secondary";
                              if (ehGabarito) {
                                estiloBorda = "border-green-500/50 bg-green-500/10 text-bat-text shadow-xs";
                              } else if (ehSuaResposta) {
                                estiloBorda = "border-red-500/50 bg-red-500/10 text-bat-text shadow-xs";
                              }

                              return (
                                <div
                                  key={alt.letra}
                                  className={`flex items-start justify-between gap-3 rounded-xl border p-3 text-sm transition-colors ${estiloBorda}`}
                                >
                                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                    <span
                                      className={`font-bold font-mono px-2 py-0.5 rounded text-xs shrink-0 ${
                                        ehGabarito
                                          ? "bg-green-500 text-black font-extrabold"
                                          : ehSuaResposta
                                          ? "bg-red-500 text-white font-extrabold"
                                          : "bg-bat-bg-card text-bat-text-muted"
                                      }`}
                                    >
                                      {alt.letra}
                                    </span>
                                    <span className="whitespace-pre-line leading-relaxed">
                                      <MathText>{alt.texto}</MathText>
                                    </span>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5">
                                    {ehGabarito && (
                                      <span className="rounded-md bg-green-500/20 text-green-400 px-2 py-0.5 text-[11px] font-bold border border-green-500/30">
                                        ✓ Gabarito
                                      </span>
                                    )}
                                    {ehSuaResposta && !ehGabarito && (
                                      <span className="rounded-md bg-red-500/20 text-red-400 px-2 py-0.5 text-[11px] font-bold border border-red-500/30">
                                        ✗ Seu erro
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
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
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-bold uppercase tracking-wider text-bat-text-secondary">
                                📝 Sua anotação de aprendizado
                              </label>
                              {salvoComSucesso === q.id && (
                                <span className="text-xs text-green-400 font-bold flex items-center gap-1 animate-pulse">
                                  <span>✓</span> Salvo com sucesso!
                                </span>
                              )}
                            </div>
                            <p className="mb-2 text-[11px] leading-relaxed text-bat-text-muted">
                              Escreva com suas palavras onde seu raciocínio se
                              separou do correto. Reler isso fixa muito mais do que
                              apenas ver a resposta.
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
                              placeholder="Ex: Eu marquei B porque confundi média com mediana, esqueci de ordenar os números..."
                              className="input-field w-full resize-none text-sm"
                            />
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                onClick={() => salvarAnotacao(q.id)}
                                disabled={salvando === q.id}
                                className="btn-secondary px-4 py-2 text-xs disabled:opacity-40 cursor-pointer"
                              >
                                {salvando === q.id ? "Salvando..." : "Salvar anotação"}
                              </button>
                              <button
                                onClick={() => marcarResolvida(q.id)}
                                className="btn-primary px-4 py-2 text-xs cursor-pointer"
                              >
                                ✅ Entendi, pode arquivar do caderno
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
