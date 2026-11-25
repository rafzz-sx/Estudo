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
import { TextoBaseCard } from "@/components/questoes/TextoBaseCard";

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
  chutou_consciente?: boolean;
  revisao?: {
    ativa: boolean;
    etapa: number;
    agendada_para: string | null;
    total_revisoes: number;
    aprendida_em: string | null;
  } | null;
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

interface EstatisticaMateria {
  nome: string;
  emoji: string;
  total_questoes: number;
  total_erros: number;
  percentual: number;
}

interface TopAssuntoCritico {
  assunto: string;
  materia: string;
  emoji: string;
  total_questoes: number;
  total_erros: number;
  reincidentes: number;
}

interface Diagnostico {
  reincidentes: number;
  faceis: number;
  medias: number;
  dificeis: number;
  total_acumulado_erros: number;
}

export default function CadernoPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [resumo, setResumo] = useState({
    total: 0,
    resolvidas: 0,
    recuperadas: 0,
    taxa_recuperacao: 0,
  });
  const [estatisticasMaterias, setEstatisticasMaterias] = useState<EstatisticaMateria[]>([]);
  const [topAssuntosCriticos, setTopAssuntosCriticos] = useState<TopAssuntoCritico[]>([]);
  const [diagnostico, setDiagnostico] = useState<Diagnostico>({
    reincidentes: 0,
    faceis: 0,
    medias: 0,
    dificeis: 0,
    total_acumulado_erros: 0,
  });

  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({
    agrupar: "assunto",
    resolvidas: false,
  });

  // Filtros avançados
  const [abaRapida, setAbaRapida] = useState<"todos" | "reincidentes" | "pendentes" | "resolvidas">("todos");
  const [busca, setBusca] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("todas");
  const [filtroConcurso, setFiltroConcurso] = useState("todos");
  const [filtroAssuntoRapido, setFiltroAssuntoRapido] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<"mais_erros" | "recentes" | "dificuldade">("mais_erros");

  const [aberta, setAberta] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState<string | null>(null);
  const [salvoComSucesso, setSalvoComSucesso] = useState<string | null>(null);

  // Modo Flashcard Tático
  const [flashcardsAberto, setFlashcardsAberto] = useState(false);
  const [flashIdx, setFlashIdx] = useState(0);
  const [flashVirado, setFlashVirado] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const qs = new URLSearchParams({ agrupar: filtros.agrupar });
      if (filtros.resolvidas || abaRapida === "resolvidas") qs.set("resolvidas", "1");

      const res = await fetchWithAuth(`/api/caderno-erros?${qs}`);
      const json = await res.json();
      if (json.success) {
        setGrupos(json.data.grupos || []);
        setResumo({
          total: json.data.total || 0,
          resolvidas: json.data.resolvidas || 0,
          recuperadas: json.data.recuperadas ?? 0,
          taxa_recuperacao: json.data.taxa_recuperacao || 0,
        });
        if (json.data.estatisticas_materias) {
          setEstatisticasMaterias(json.data.estatisticas_materias);
        }
        if (json.data.top_assuntos_criticos) {
          setTopAssuntosCriticos(json.data.top_assuntos_criticos);
        }
        if (json.data.diagnostico) {
          setDiagnostico(json.data.diagnostico);
        }
      }
    } catch {
      /* estado de erro coberto */
    } finally {
      setCarregando(false);
    }
  }, [filtros, abaRapida]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Lista de matérias e concursos para os selects
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

  // Filtragem e ordenação inteligente das questões
  const gruposFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return grupos
      .map((g) => {
        const questoesFiltradas = g.questoes.filter((q) => {
          // Filtro por matéria
          if (filtroMateria !== "todas" && q.materias?.nome !== filtroMateria) return false;
          // Filtro por concurso
          if (filtroConcurso !== "todos" && q.concursos?.sigla !== filtroConcurso) return false;
          // Filtro rápido de assunto crítico selecionado
          if (filtroAssuntoRapido && q.assuntos?.nome !== filtroAssuntoRapido) return false;

          // Filtro por aba rápida
          if (abaRapida === "reincidentes" && q.erros < 2) return false;
          if (abaRapida === "pendentes" && q.resolvida) return false;
          if (abaRapida === "resolvidas" && !q.resolvida) return false;

          // Busca textual
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
          if (ordem === "dificuldade") {
            const peso = (dif: string) => {
              const d = (dif || "").toLowerCase();
              if (d.includes("dificil") || d.includes("difícil")) return 3;
              if (d.includes("media") || d.includes("média")) return 2;
              return 1;
            };
            return peso(b.dificuldade) - peso(a.dificuldade);
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
  }, [grupos, busca, filtroMateria, filtroConcurso, filtroAssuntoRapido, abaRapida, ordem]);

  const totalQuestoesVisiveis = useMemo(() => {
    return gruposFiltrados.reduce((acc, g) => acc + g.questoes.length, 0);
  }, [gruposFiltrados]);

  const listaFlashcards = useMemo(() => {
    return gruposFiltrados.flatMap((g) => g.questoes);
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
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* ═══ CABEÇALHO HERO COM DIAGNÓSTICO DO ALUNO ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bat-error/10 border border-bat-error/30 text-bat-error text-xs font-bold uppercase tracking-wide">
              <span>🎯</span>
              <span>Análise Tática de Vulnerabilidades</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {listaFlashcards.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setFlashIdx(0);
                    setFlashVirado(false);
                    setFlashcardsAberto(true);
                  }}
                  className="py-2 px-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span>⚡</span>
                  <span>Flashcards ({listaFlashcards.length})</span>
                </button>
              )}
              <Link
                href="/questoes"
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md no-underline"
              >
                <span>⚔️</span>
                <span>Treinar Questões</span>
              </Link>
              <Link
                href="/revisoes"
                className="py-2 px-3 rounded-xl bg-bat-bg-secondary border border-bat-border hover:border-bat-gold-400/40 text-xs font-bold text-bat-text flex items-center gap-1.5 transition-all no-underline"
              >
                <span>🔁</span>
                <span>Revisão Espaçada</span>
              </Link>
            </div>
          </div>

          <div>
            <h1 className="heading text-2xl sm:text-4xl text-bat-text font-black tracking-tight flex items-center gap-3">
              <span>📓</span> Caderno de <span className="text-bat-gold-400">Erros & Diagnóstico</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-bat-text-secondary max-w-2xl leading-relaxed">
              Aqui a aprovação é realmente construída. O erro identificado e dissecado é a certeza de não
              perder pontos preciosos na prova real.
            </p>
          </div>

          {/* ═══ CARDS DE ESTATÍSTICA COCKPIT ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Erros em Aberto */}
            <div className="rounded-2xl border border-bat-border bg-bat-bg-primary/80 p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-bat-text-muted uppercase tracking-wider">
                  Erros em Aberto
                </span>
                <span className="text-xs">⚠️</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
                {resumo.total}
              </p>
              <p className="text-[10px] text-bat-text-muted mt-0.5">
                Aguardando superação definitiva
              </p>
              <div className="absolute right-0 bottom-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Reincidentes (Errou 2x+) */}
            <div className="rounded-2xl border border-bat-border bg-bat-bg-primary/80 p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-bat-text-muted uppercase tracking-wider">
                  Reincidentes (2x+)
                </span>
                <span className="text-xs">🔥</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {diagnostico.reincidentes}
              </p>
              <p className="text-[10px] text-bat-text-muted mt-0.5">
                Atenção máxima: armadilhas recorrentes
              </p>
              <div className="absolute right-0 bottom-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Superadas / Recuperadas */}
            <div className="rounded-2xl border border-bat-border bg-bat-bg-primary/80 p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-bat-text-muted uppercase tracking-wider">
                  Recuperadas no Banco
                </span>
                <span className="text-xs">🏆</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {resumo.recuperadas}
              </p>
              <p className="text-[10px] text-bat-text-muted mt-0.5">
                Errou antes e acertou depois
              </p>
              <div className="absolute right-0 bottom-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Taxa de Recuperação */}
            <div className="rounded-2xl border border-bat-border bg-bat-bg-primary/80 p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-bat-text-muted uppercase tracking-wider">
                  Taxa de Recuperação
                </span>
                <span className="text-xs">⚡</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-bat-gold-400 font-mono">
                {resumo.taxa_recuperacao}%
              </p>
              <div className="w-full bg-bat-bg-secondary h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-bat-gold-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, resumo.taxa_recuperacao))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Glow de fundo */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-bat-gold-400/10 via-bat-gold-400/5 to-transparent pointer-events-none" />
      </div>

      {/* ═══ RAIO-X VISUAL: MATÉRIAS VULNERÁVEIS & TOP ASSUNTOS CRÍTICOS ═══ */}
      {estatisticasMaterias.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Coluna Esquerda: Distribuição de Erros por Matéria (5 colunas) */}
          <div className="lg:col-span-5 bg-bat-bg-card border border-bat-border rounded-2xl p-5 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="heading text-xs font-bold text-bat-text uppercase tracking-wider flex items-center gap-2">
                <span>📊</span>
                <span>Onde estão seus erros (por matéria)</span>
              </h3>
              <span className="text-[11px] text-bat-text-muted font-mono">
                {estatisticasMaterias.length} matérias
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {estatisticasMaterias.slice(0, 5).map((mat) => (
                <div
                  key={mat.nome}
                  onClick={() => setFiltroMateria(filtroMateria === mat.nome ? "todas" : mat.nome)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    filtroMateria === mat.nome
                      ? "bg-bat-gold-400/10 border-bat-gold-400 text-bat-text"
                      : "bg-bat-bg-secondary/40 border-bat-border/60 hover:border-bat-gold-400/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                    <span className="flex items-center gap-2 truncate">
                      <span>{mat.emoji}</span>
                      <span className="truncate">{mat.nome}</span>
                    </span>
                    <span className="text-bat-gold-400 font-mono text-[11px] shrink-0 ml-2">
                      {mat.total_questoes} {mat.total_questoes === 1 ? "questão" : "questões"} ({mat.percentual}%)
                    </span>
                  </div>

                  <div className="w-full bg-bat-bg-primary h-2 rounded-full overflow-hidden border border-bat-border/50">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-bat-gold-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, mat.percentual))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna Direita: Radar de Assuntos Críticos (Onde mais sangra pontos) (7 colunas) */}
          <div className="lg:col-span-7 bg-bat-bg-card border border-bat-border rounded-2xl p-5 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="heading text-xs font-bold text-bat-text uppercase tracking-wider flex items-center gap-2">
                <span>🩸</span>
                <span>Radar de Assuntos Críticos (Mais Erros Acumulados)</span>
              </h3>
              {filtroAssuntoRapido && (
                <button
                  onClick={() => setFiltroAssuntoRapido(null)}
                  className="text-[11px] text-bat-gold-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <span>✕ Limpar filtro: {filtroAssuntoRapido}</span>
                </button>
              )}
            </div>

            <p className="text-xs text-bat-text-secondary leading-relaxed">
              Estes são os tópicos específicos onde suas respostas mais divergiram do gabarito. Clique em um
              assunto para filtrar a lista ou treinar direto no banco.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {topAssuntosCriticos.map((ass) => {
                const ativo = filtroAssuntoRapido === ass.assunto;
                return (
                  <div
                    key={ass.assunto}
                    className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      ativo
                        ? "bg-bat-gold-400/20 border-bat-gold-400 text-bat-gold-400 shadow-sm"
                        : "bg-bat-bg-secondary/70 border-bat-border text-bat-text hover:border-bat-gold-400/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setFiltroAssuntoRapido(ativo ? null : ass.assunto)}
                      className="flex items-center gap-1.5 cursor-pointer text-left"
                    >
                      <span>{ass.emoji}</span>
                      <span className="font-bold">{ass.assunto}</span>
                      <span className="px-1.5 py-0.2 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold">
                        {ass.total_questoes} erradas
                      </span>
                      {ass.reincidentes > 0 && (
                        <span className="text-amber-400 text-[11px]" title={`${ass.reincidentes} reincidentes`}>
                          🔥
                        </span>
                      )}
                    </button>

                    <Link
                      href={`/questoes?assunto=${encodeURIComponent(ass.assunto)}`}
                      className="text-bat-text-muted hover:text-bat-gold-400 ml-1 text-xs no-underline"
                      title="Treinar este assunto no Banco de Questões"
                    >
                      ↗
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ABAS RÁPIDAS DE FILTRO & FERRAMENTAS TÁTICAS ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
        {/* Abas Rápidas */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bat-border/60 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "todos", rotulo: "Todos os Erros", icone: "📋" },
              { id: "reincidentes", rotulo: `Críticos Reincidentes (${diagnostico.reincidentes})`, icone: "🔥" },
              { id: "pendentes", rotulo: "Pendentes de Estudo", icone: "⏳" },
              { id: "resolvidas", rotulo: `Resolvidas (${resumo.resolvidas})`, icone: "✅" },
            ].map((aba) => {
              const ativa = abaRapida === aba.id;
              return (
                <button
                  key={aba.id}
                  onClick={() => {
                    setAbaRapida(aba.id as any);
                    if (aba.id === "resolvidas") {
                      setFiltros((prev) => ({ ...prev, resolvidas: true }));
                    } else if (filtros.resolvidas) {
                      setFiltros((prev) => ({ ...prev, resolvidas: false }));
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    ativa
                      ? "bg-bat-gold-400 text-black border-bat-gold-400 shadow-md shadow-bat-gold-400/20"
                      : "bg-bat-bg-secondary text-bat-text-muted hover:text-bat-text border-bat-border hover:border-bat-gold-400/30"
                  }`}
                >
                  <span>{aba.icone}</span>
                  <span>{aba.rotulo}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-bat-text-muted">
            <span className="font-bold text-bat-gold-400">{totalQuestoesVisiveis}</span>
            <span>questões filtradas</span>
          </div>
        </div>

        {/* Linha de Busca e Seletores */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Busca em tempo real (5 colunas) */}
          <div className="sm:col-span-5 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bat-text-muted text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por termo no enunciado, assunto, concurso ou ano..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-bat-bg-primary border border-bat-border rounded-xl pl-9 pr-8 py-2.5 text-xs text-bat-text placeholder-bat-text-muted focus:outline-none focus:border-bat-gold-400 transition-colors"
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

          {/* Filtro Concurso (2 colunas) */}
          <div className="sm:col-span-2">
            <select
              value={filtroConcurso}
              onChange={(e) => setFiltroConcurso(e.target.value)}
              className="w-full bg-bat-bg-primary border border-bat-border rounded-xl py-2.5 px-3 text-xs text-bat-text focus:outline-none focus:border-bat-gold-400 cursor-pointer"
            >
              <option value="todos">Todos os concursos</option>
              {listaConcursos.map((c) => (
                <option key={c} value={c}>
                  🎯 {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Matéria (3 colunas) */}
          <div className="sm:col-span-3">
            <select
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              className="w-full bg-bat-bg-primary border border-bat-border rounded-xl py-2.5 px-3 text-xs text-bat-text focus:outline-none focus:border-bat-gold-400 cursor-pointer"
            >
              <option value="todas">Todas as matérias</option>
              {listaMaterias.map((m) => (
                <option key={m} value={m}>
                  📚 {m}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenação (2 colunas) */}
          <div className="sm:col-span-2">
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as any)}
              className="w-full bg-bat-bg-primary border border-bat-border rounded-xl py-2.5 px-3 text-xs font-bold text-bat-gold-400 focus:outline-none focus:border-bat-gold-400 cursor-pointer"
            >
              <option value="mais_erros">🔥 Mais erradas</option>
              <option value="recentes">🕒 Mais recentes</option>
              <option value="dificuldade">⚡ Mais difíceis</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══ LISTAGEM DAS QUESTÕES AGRUPADAS ═══ */}
      {carregando ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-bat-bg-card border border-bat-border animate-pulse" />
          ))}
        </div>
      ) : gruposFiltrados.length === 0 ? (
        <div className="rounded-3xl border border-bat-border bg-bat-bg-card p-12 text-center space-y-4 shadow-xl">
          <span className="text-5xl block mb-2">
            {abaRapida === "resolvidas" ? "✅" : "🦇"}
          </span>
          <h2 className="heading text-xl font-bold text-bat-text">
            {abaRapida === "resolvidas"
              ? "Nenhuma questão resolvida nos filtros atuais"
              : busca || filtroMateria !== "todas" || filtroAssuntoRapido
              ? "Nenhuma questão encontrada com estes filtros"
              : "Seu Caderno de Erros está limpo!"}
          </h2>
          <p className="mx-auto max-w-md text-sm text-bat-text-secondary leading-relaxed">
            {abaRapida === "resolvidas"
              ? "Quando você aprender uma questão a fundo, marque-a como resolvida para tirá-la da lista principal."
              : busca || filtroMateria !== "todas" || filtroAssuntoRapido
              ? "Tente limpar os termos de busca ou filtros selecionados acima para ver mais questões."
              : "Ou você ainda não errou nenhuma questão ou já recuperou todas no banco de questões. Parabéns, soldado!"}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {(busca || filtroMateria !== "todas" || filtroAssuntoRapido) && (
              <button
                onClick={() => {
                  setBusca("");
                  setFiltroMateria("todas");
                  setFiltroConcurso("todos");
                  setFiltroAssuntoRapido(null);
                  setAbaRapida("todos");
                }}
                className="px-5 py-2.5 rounded-xl border border-bat-border text-xs font-bold text-bat-text hover:border-bat-gold-400/40 cursor-pointer"
              >
                Limpar Todos os Filtros
              </button>
            )}
            <Link
              href="/questoes"
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold no-underline"
            >
              <span>🎯</span>
              <span>Resolver Novas Questões</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {gruposFiltrados.map((g) => (
            <section
              key={g.chave}
              className="overflow-hidden rounded-3xl border border-bat-border bg-bat-bg-card shadow-lg"
            >
              {/* Cabeçalho do Grupo */}
              <header className="flex items-center gap-3 border-b border-bat-border bg-bat-bg-secondary/50 px-5 py-3.5">
                <span className="text-2xl">{g.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="heading truncate text-sm sm:text-base font-bold text-bat-text">
                    {g.chave}
                  </h2>
                  {filtros.agrupar === "assunto" && (
                    <p className="text-[11px] text-bat-text-muted font-medium">{g.materia}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded-xl bg-bat-error/15 px-3 py-1 text-xs font-bold text-bat-error border border-bat-error/30">
                    {g.questoes.length} {g.questoes.length !== 1 ? "erros" : "erro"}
                  </span>
                  <Link
                    href={`/questoes?assunto=${encodeURIComponent(g.chave)}`}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-bat-gold-400 hover:underline px-2.5 py-1 rounded-lg bg-bat-gold-400/10 border border-bat-gold-400/20 no-underline"
                  >
                    <span>🎯</span>
                    <span>Treinar Grupo</span>
                  </Link>
                </div>
              </header>

              {/* Lista de Questões do Grupo */}
              <ul className="divide-y divide-bat-border/40">
                {g.questoes.map((q) => {
                  const expandida = aberta === q.id;
                  const reincidente = q.erros >= 2;

                  return (
                    <li key={q.id}>
                      {/* Botão Gatilho / Prévia da Questão */}
                      <button
                        onClick={() => {
                          setAberta(expandida ? null : q.id);
                          if (!expandida && rascunho[q.id] === undefined) {
                            setRascunho((r) => ({ ...r, [q.id]: q.anotacao ?? "" }));
                          }
                        }}
                        className={`flex w-full cursor-pointer items-start gap-4 p-5 text-left transition-colors ${
                          expandida
                            ? "bg-bat-bg-elevated/60"
                            : "hover:bg-bat-bg-elevated/30"
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-2">
                          {/* Badges de Metadados da Questão */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {/* Concurso e Ano */}
                            <span className="font-bold px-2 py-0.5 rounded-md bg-bat-bg-secondary text-bat-gold-400 border border-bat-gold-400/20 font-mono text-[11px]">
                              {q.concursos?.emoji} {q.concursos?.sigla || "Concurso"}
                              {q.ano ? ` · ${q.ano}` : ""}
                            </span>

                            {/* Dificuldade */}
                            {q.dificuldade && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                                  q.dificuldade.toLowerCase().includes("dificil") || q.dificuldade.toLowerCase().includes("difícil")
                                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                    : q.dificuldade.toLowerCase().includes("facil") || q.dificuldade.toLowerCase().includes("fácil")
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                }`}
                              >
                                {q.dificuldade}
                              </span>
                            )}

                            {/* Badge de Reincidência */}
                            {reincidente ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-bat-error/20 text-bat-error border border-bat-error/40 flex items-center gap-1 shadow-sm">
                                <span>🔥</span>
                                <span>Reincidente: errou {q.erros}x</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-bat-bg-secondary text-bat-text-muted border border-bat-border">
                                Errou 1x
                              </span>
                            )}

                            {/* Último erro */}
                            {q.errada_em && (
                              <span className="text-[10px] text-bat-text-muted">
                                Última tentativa: {new Date(q.errada_em).toLocaleDateString("pt-BR")}
                              </span>
                            )}

                            {/* Anotação */}
                            {q.anotacao && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-bat-gold-400/15 text-bat-gold-400 border border-bat-gold-400/30 flex items-center gap-1">
                                <span>📝</span>
                                <span>Com Anotação</span>
                              </span>
                            )}

                            {/* Chute Consciente */}
                            {q.chutou_consciente && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <span>🎲</span>
                                <span>Acerto por Chute</span>
                              </span>
                            )}

                            {/* Pílula Unificada de Repetição Espaçada */}
                            {q.revisao && (() => {
                              if (!q.revisao.ativa && q.revisao.aprendida_em) {
                                return (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    ✅ Aprendida no SRS
                                  </span>
                                );
                              }
                              if (q.revisao.ativa && q.revisao.agendada_para) {
                                const hojeStr = new Date().toISOString().slice(0, 10);
                                const vencida = q.revisao.agendada_para <= hojeStr;
                                const diffDias = Math.max(
                                  1,
                                  Math.ceil(
                                    (new Date(q.revisao.agendada_para).getTime() - new Date(hojeStr).getTime()) /
                                      86_400_000
                                  )
                                );
                                return (
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                      vencida
                                        ? "bg-bat-gold-400/20 text-bat-gold-400 border-bat-gold-400/50 animate-pulse"
                                        : "bg-sky-500/10 text-sky-300 border-sky-500/30"
                                    }`}
                                  >
                                    {vencida ? "🔁 Revisão hoje" : `📅 Revisão em ${diffDias}d`}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {/* Enunciado resumido */}
                          <p className="line-clamp-2 text-sm text-bat-text/90 leading-relaxed font-medium">
                            <MathText>{q.enunciado}</MathText>
                          </p>

                          {/* Resumo da resposta errada vs gabarito */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                            {q.resposta_dada && (
                              <span className="text-red-400 font-semibold flex items-center gap-1">
                                <span>❌</span> Você marcou: <strong className="font-mono underline">Letra {q.resposta_dada}</strong>
                              </span>
                            )}
                            <span className="text-bat-text-muted">|</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <span>✅</span> Gabarito: <strong className="font-mono underline">Letra {q.resposta_correta}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Ícone de expansão */}
                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={`p-2 rounded-xl bg-bat-bg-secondary text-bat-text-muted transition-transform ${
                              expandida ? "rotate-180 text-bat-gold-400" : ""
                            }`}
                          >
                            ▾
                          </span>
                        </div>
                      </button>

                      {/* Conteúdo Expandido da Questão */}
                      {expandida && (
                        <div className="border-t border-bat-border/60 bg-bat-bg-secondary/20 p-5 sm:p-6 space-y-5 animate-fade-in">
                          {/* Texto base & Figura */}
                          {(() => {
                            const { textoBaseFinal, figuraDescricaoFinal } = tratarTextoBaseEFigura(
                              q.texto_base,
                              q.figura_descricao
                            );
                            return (
                              <>
                                <TextoBaseCard texto={textoBaseFinal} />
                                <QuadroFigura descricao={figuraDescricaoFinal} svg={q.figura_svg} />
                              </>
                            );
                          })()}

                          {/* Enunciado Completo */}
                          <div className="p-4 rounded-2xl bg-bat-bg-card border border-bat-border text-sm leading-relaxed text-bat-text font-medium whitespace-pre-line">
                            <MathText>{q.enunciado}</MathText>
                          </div>

                          {/* ═══ BANNER COMPARATIVO & AÇÕES RÁPIDAS ═══ */}
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bat-border bg-bat-bg-card p-4 shadow-sm">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                              {q.resposta_dada ? (
                                <>
                                  <span className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 font-bold text-red-400">
                                    <span>❌</span> Você marcou: <span className="font-mono text-white underline">Letra {q.resposta_dada}</span>
                                  </span>
                                  <span className="text-bat-text-muted font-bold">➔</span>
                                </>
                              ) : null}
                              <span className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-bold text-emerald-400">
                                <span>✅</span> Gabarito Oficial: <span className="font-mono text-white underline">Letra {q.resposta_correta}</span>
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {q.assuntos?.nome && (
                                <Link
                                  href={`/questoes?assunto=${encodeURIComponent(q.assuntos.nome)}`}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-bat-border bg-bat-bg-secondary px-3.5 py-1.5 text-xs font-bold text-bat-text hover:border-bat-gold-400/40 hover:text-bat-gold-400 transition-all no-underline"
                                >
                                  <span>📚</span> Treinar Assunto
                                </Link>
                              )}
                              <Link
                                href={`/questoes?id=${q.id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-bat-gold-400/40 bg-bat-gold-400/10 px-3.5 py-1.5 text-xs font-bold text-bat-gold-400 hover:bg-bat-gold-400 hover:text-black transition-all no-underline shadow-xs"
                              >
                                <span>🎯</span> Refazer no Banco de Questões
                              </Link>
                            </div>
                          </div>

                          {/* Alternativas */}
                          <div className="space-y-2">
                            {q.alternativas?.map((alt) => {
                              const ehGabarito = alt.letra === q.resposta_correta;
                              const ehSuaResposta = alt.letra === q.resposta_dada;

                              let estiloBorda = "border-bat-border bg-bat-bg-secondary/40 text-bat-text-secondary";
                              if (ehGabarito) {
                                estiloBorda = "border-emerald-500/60 bg-emerald-500/10 text-bat-text shadow-sm";
                              } else if (ehSuaResposta) {
                                estiloBorda = "border-red-500/60 bg-red-500/10 text-bat-text shadow-sm";
                              }

                              return (
                                <div
                                  key={alt.letra}
                                  className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 text-sm transition-colors ${estiloBorda}`}
                                >
                                  <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <span
                                      className={`font-bold font-mono px-2.5 py-0.5 rounded-lg text-xs shrink-0 ${
                                        ehGabarito
                                          ? "bg-emerald-500 text-black font-extrabold"
                                          : ehSuaResposta
                                          ? "bg-red-500 text-white font-extrabold"
                                          : "bg-bat-bg-card text-bat-text-muted"
                                      }`}
                                    >
                                      {alt.letra}
                                    </span>
                                    <span className="whitespace-pre-line leading-relaxed font-medium">
                                      <MathText>{alt.texto}</MathText>
                                    </span>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5">
                                    {ehGabarito && (
                                      <span className="rounded-lg bg-emerald-500/20 text-emerald-400 px-2.5 py-1 text-xs font-bold border border-emerald-500/40">
                                        ✓ Gabarito Oficial
                                      </span>
                                    )}
                                    {ehSuaResposta && !ehGabarito && (
                                      <span className="rounded-lg bg-red-500/20 text-red-400 px-2.5 py-1 text-xs font-bold border border-red-500/40">
                                        ✗ Seu Chute Anterior
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Resolução comentada passo a passo */}
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

                          {/* ═══ ANOTAÇÃO PESSOAL DE APRENDIZADO ═══ */}
                          <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold uppercase tracking-wider text-bat-text flex items-center gap-2">
                                <span>📝</span>
                                <span>Sua Anotação de Aprendizado & Diagnóstico Pessoal</span>
                              </label>
                              {salvoComSucesso === q.id && (
                                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                                  <span>✓</span> Anotação salva com sucesso!
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-bat-text-muted leading-relaxed">
                              Registre com suas palavras por que você caiu nessa pegadinha e qual raciocínio deve
                              ser lembrado na hora da prova.
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
                              placeholder="Ex: Confundi a fórmula do volume com a área lateral do cilindro. Atenção ao raio ao quadrado..."
                              className="w-full bg-bat-bg-primary border border-bat-border rounded-xl p-3.5 text-xs sm:text-sm text-bat-text placeholder-bat-text-muted focus:outline-none focus:border-bat-gold-400 transition-colors resize-y min-h-[90px]"
                            />

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <button
                                onClick={() => salvarAnotacao(q.id)}
                                disabled={salvando === q.id}
                                className="px-4 py-2 rounded-xl bg-bat-bg-secondary border border-bat-border hover:border-bat-gold-400/40 text-bat-text text-xs font-bold disabled:opacity-40 cursor-pointer transition-all flex items-center gap-1.5"
                              >
                                <span>💾</span>
                                <span>{salvando === q.id ? "Salvando..." : "Salvar Anotação"}</span>
                              </button>

                              {!q.resolvida && (
                                <button
                                  onClick={() => marcarResolvida(q.id)}
                                  className="btn-primary px-4 py-2 text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md"
                                >
                                  <span>✅</span>
                                  <span>Entendi Completamente · Marcar como Superada</span>
                                </button>
                              )}
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

      {/* ═══ MODAL MODO FLASHCARD TÁTICO ═══ */}
      {flashcardsAberto && listaFlashcards.length > 0 && (() => {
        const idxSeguro = Math.min(flashIdx, listaFlashcards.length - 1);
        const card = listaFlashcards[idxSeguro];
        const altCerta = card.alternativas?.find((a) => a.letra === card.resposta_correta);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl rounded-3xl border border-bat-gold-400/35 bg-bat-bg-card shadow-2xl overflow-hidden animate-fade-in">
              {/* Topo do Deck */}
              <div className="flex items-center justify-between border-b border-bat-border bg-bat-bg-secondary/60 px-5 py-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-bat-gold-400">
                  <span>⚡</span>
                  <span>Flashcard Tático</span>
                  <span className="rounded-md bg-bat-bg-primary px-2 py-0.5 text-bat-text-muted font-mono">
                    {idxSeguro + 1} / {listaFlashcards.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFlashcardsAberto(false)}
                  className="rounded-lg p-1.5 text-bat-text-muted hover:bg-bat-bg-elevated hover:text-bat-text cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Corpo do Cartão */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-md bg-bat-bg-secondary px-2 py-0.5 font-bold text-bat-gold-400 border border-bat-gold-400/20">
                    {card.concursos?.sigla || "Questão"} {card.ano ? `· ${card.ano}` : ""}
                  </span>
                  {card.materias?.nome && (
                    <span className="rounded-md bg-bat-bg-secondary px-2 py-0.5 text-bat-text-secondary">
                      {card.materias.icone_emoji} {card.materias.nome}
                    </span>
                  )}
                  {card.assuntos?.nome && (
                    <span className="rounded-md bg-bat-bg-secondary px-2 py-0.5 text-bat-text-muted">
                      {card.assuntos.nome}
                    </span>
                  )}
                </div>

                {/* Frente */}
                <div className="rounded-2xl border border-bat-border bg-bat-bg-primary p-5 text-sm leading-relaxed text-bat-text whitespace-pre-line">
                  <MathText>{card.enunciado}</MathText>
                </div>

                {/* Verso (Gabarito & Raciocínio) */}
                {!flashVirado ? (
                  <button
                    type="button"
                    onClick={() => setFlashVirado(true)}
                    className="w-full rounded-2xl border border-bat-gold-400/50 bg-bat-gold-400/15 py-4 text-sm font-bold text-bat-gold-400 hover:bg-bat-gold-400/25 transition-all cursor-pointer"
                  >
                    🔄 Virar Cartão e Ver Resposta
                  </button>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-1">
                        ✅ Gabarito: Letra {card.resposta_correta}
                      </p>
                      {altCerta && (
                        <p className="text-bat-text font-medium">
                          <MathText>{altCerta.texto}</MathText>
                        </p>
                      )}
                    </div>

                    {card.anotacao && (
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-bat-text-secondary leading-relaxed">
                        <strong className="text-amber-300 block mb-1">📝 Sua Anotação:</strong>
                        {card.anotacao}
                      </div>
                    )}

                    {card.explicacao && (
                      <div className="rounded-2xl border border-bat-border bg-bat-bg-secondary/50 p-4 text-xs text-bat-text-secondary leading-relaxed whitespace-pre-line">
                        <strong className="text-bat-text block mb-1">💡 Comentário Oficial:</strong>
                        <MathText>{card.explicacao}</MathText>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ações de Navegação e Retenção */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-bat-border bg-bat-bg-secondary/40 px-5 py-3.5">
                <button
                  type="button"
                  disabled={idxSeguro === 0}
                  onClick={() => {
                    setFlashIdx((i) => Math.max(0, i - 1));
                    setFlashVirado(false);
                  }}
                  className="rounded-xl border border-bat-border px-3.5 py-2 text-xs font-bold text-bat-text-secondary hover:text-bat-text disabled:opacity-30 cursor-pointer"
                >
                  ← Anterior
                </button>

                <div className="flex items-center gap-2">
                  {flashVirado && !card.resolvida && (
                    <button
                      type="button"
                      onClick={async () => {
                        await marcarResolvida(card.id);
                        setFlashVirado(false);
                        setFlashIdx((i) => (i + 1 < listaFlashcards.length ? i : 0));
                      }}
                      className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 cursor-pointer"
                    >
                      ✅ Dominei! Superar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFlashVirado(false);
                      setFlashIdx((i) => (i + 1 < listaFlashcards.length ? i + 1 : 0));
                    }}
                    className="btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    {idxSeguro + 1 < listaFlashcards.length ? "Próximo Card →" : "Reiniciar Deck ↻"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
