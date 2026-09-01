"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useStudySessionStore,
  formatarSegundosParaTimer,
} from "@/stores/study-session-store";

interface AssuntoItem {
  id: string;
  nome: string;
  resumo_teorico: string;
  status: "nao_iniciado" | "em_andamento" | "concluido";
  bizu?: string;
  questoes_count: number;
}

interface MateriaTrilha {
  nome: string;
  emoji: string;
  assuntos: AssuntoItem[];
}

const mockTrilhas: Record<string, MateriaTrilha[]> = {
  eear: [
    {
      nome: "Português",
      emoji: "📝",
      assuntos: [
        {
          id: "p1",
          nome: "Acentuação Gráfica",
          resumo_teorico: "Regras gerais das proparoxítonas (todas acentuadas), paroxítonas (terminadas em R, X, N, L, I, IS, UM, UNS, US, PS, Ã, ÃS, ÃOS, ditongo) e oxítonas (A, E, O, EM, ENS). Regra do hiato I e U tônicos sozinhos ou com S.",
          status: "nao_iniciado",
          bizu: "Proparoxítonas SEMPRE levam acento. Olhe a antepenúltima sílaba.",
          questoes_count: 42,
        },
        {
          id: "p2",
          nome: "Crase",
          resumo_teorico: "Fusão da preposição 'a' com o artigo feminino 'a' ou pronomes demonstrativos 'aquele(s)', 'aquela(s)', 'aquilo'. Casos proibitivos: antes de masculino, verbos, pronomes pessoais e indefinidos.",
          status: "nao_iniciado",
          bizu: "Troque a palavra seguinte por uma masculina equivalente. Se virar 'ao', tem crase!",
          questoes_count: 58,
        },
        {
          id: "p3",
          nome: "Concordância Verbal e Nominal",
          resumo_teorico: "Regra geral: o verbo concorda com o sujeito em número e pessoa. Casos especiais com sujeito composto, porcentagem, coletivos e partitivos.",
          status: "nao_iniciado",
          bizu: "Sujeito composto antes = verbo no plural. Sujeito composto depois = concorda com o mais próximo ou plural.",
          questoes_count: 36,
        },
      ],
    },
    {
      nome: "Matemática",
      emoji: "📐",
      assuntos: [
        {
          id: "m1",
          nome: "Equações do 1º e 2º Grau",
          resumo_teorico: "Fórmula de Bhaskara, relações de Girard (Soma = -b/a, Produto = c/a), estudo do discriminante Delta (Delta > 0, = 0, < 0).",
          status: "nao_iniciado",
          bizu: "A soma das raízes é sempre -b/a e o produto é c/a. Não precisa fazer Bhaskara em todas!",
          questoes_count: 64,
        },
        {
          id: "m2",
          nome: "Geometria Plana — Triângulos e Áreas",
          resumo_teorico: "Teorema de Pitágoras, Lei dos Senos e Cossenos, Áreas de figuras planas (triângulo, círculo, trapézio, losango).",
          status: "nao_iniciado",
          bizu: "Ternas (3,4,5), (5,12,13), (8,15,17). Identifique os catetos e hipotenusa em segundos.",
          questoes_count: 75,
        },
        {
          id: "m3",
          nome: "Progressões (PA e PG)",
          resumo_teorico: "Termo geral da PA (an = a1 + (n-1)r), soma dos termos da PA. Termo geral da PG (an = a1 * q^(n-1)), soma da PG finita e infinita.",
          status: "nao_iniciado",
          bizu: "Para 3 termos em PA: use (x-r, x, x+r). Facilita o cálculo da soma!",
          questoes_count: 48,
        },
      ],
    },
    {
      nome: "Inglês",
      emoji: "🇬🇧",
      assuntos: [
        {
          id: "i1",
          nome: "Verb Tenses (Present, Past, Future)",
          resumo_teorico: "Simple Present vs Present Continuous; Simple Past vs Past Continuous; Present Perfect (have + past participle) para ações que começaram no passado com impacto no presente.",
          status: "nao_iniciado",
          bizu: "Palavras-chave: 'yesterday' = Past Simple; 'since/for/already' = Present Perfect.",
          questoes_count: 50,
        },
        {
          id: "i2",
          nome: "Prepositions of Time and Place",
          resumo_teorico: "IN (meses, anos, estações, países, cidades), ON (dias da semana, datas específicas, superfícies), AT (horas exatas, locais pontuais).",
          status: "nao_iniciado",
          bizu: "AT 5pm, ON Friday, IN 2026. Lembre-se: 'at night' é exceção!",
          questoes_count: 32,
        },
      ],
    },
  ],
};

export default function TrilhaConcursoPage() {
  const params = useParams();
  const siglaParam = (params?.sigla as string)?.toLowerCase() || "eear";
  const siglaUpper = siglaParam.toUpperCase();

  const trilhaData = mockTrilhas[siglaParam] || mockTrilhas["eear"];
  const [materias, setMaterias] = useState<MateriaTrilha[]>(trilhaData);
  const [assuntoAberto, setAssuntoAberto] = useState<string | null>("p1");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // ═══ TEMPORIZADOR DE ESTUDO EXCLUSIVO DA TRILHA ═══
  const {
    isActive,
    isPaused,
    duracaoSegundos,
    multiplicador,
    xpGanhoNaSessao,
    initSession,
    sendHeartbeat,
    tick,
    pauseSession,
    resumeSession,
    stopSession,
  } = useStudySessionStore();

  // 1. Iniciar sessão de estudo ao entrar na trilha
  useEffect(() => {
    initSession();

    // Cronômetro ativo na trilha (1 segundo)
    const timerInterval = setInterval(() => {
      tick();
    }, 1000);

    // Heartbeat a cada 30 segundos
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    // 2. Ao sair da trilha: salvar e pausar sessão para não contar tempo fora da trilha
    return () => {
      clearInterval(timerInterval);
      clearInterval(heartbeatInterval);
      sendHeartbeat();
      pauseSession();
    };
  }, [initSession, sendHeartbeat, tick, pauseSession]);

  // Estatísticas de progresso
  const todosAssuntos = materias.flatMap((m) => m.assuntos);
  const concluidos = todosAssuntos.filter((a) => a.status === "concluido").length;
  const emAndamento = todosAssuntos.filter((a) => a.status === "em_andamento").length;
  const percentualTotal = Math.round((concluidos / todosAssuntos.length) * 100);

  const toggleStatus = (assuntoId: string) => {
    setMaterias((prev) =>
      prev.map((mat) => ({
        ...mat,
        assuntos: mat.assuntos.map((ass) => {
          if (ass.id !== assuntoId) return ass;
          const nextStatus =
            ass.status === "nao_iniciado"
              ? "em_andamento"
              : ass.status === "em_andamento"
              ? "concluido"
              : "nao_iniciado";
          return { ...ass, status: nextStatus };
        }),
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* ═══ BARRA DE ESTUDO ATIVO NA TRILHA (TEMPORIZADOR REAL) ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`w-3.5 h-3.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-bat-success animate-pulse"}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-bat-text-secondary">
                {isPaused ? "Estudo Pausado" : `Estudando Trilha ${siglaUpper}`}
              </span>
              {multiplicador > 1 && (
                <span className="text-[10px] font-bold bg-bat-gold-400 text-black px-1.5 py-0.5 rounded shadow-sm">
                  {multiplicador}x XP BÔNUS
                </span>
              )}
            </div>
            <p className="heading text-2xl font-mono font-bold text-bat-gold-400">
              {formatarSegundosParaTimer(duracaoSegundos)}
            </p>
          </div>
        </div>

        {/* Informações de Bônus e Ações */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-bat-text-muted">XP Acumulado na Trilha</p>
            <p className="text-sm font-bold text-bat-text">+{xpGanhoNaSessao} XP</p>
          </div>

          <div className="flex gap-2">
            {isPaused ? (
              <button
                onClick={() => resumeSession()}
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
              >
                ▶️ Retomar
              </button>
            ) : (
              <button
                onClick={() => pauseSession()}
                className="py-2 px-4 rounded-xl text-xs font-semibold bg-bat-bg-secondary border border-bat-border hover:bg-bat-bg-elevated text-bat-text transition-colors cursor-pointer flex items-center gap-1.5"
              >
                ⏸️ Pausar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ CABEÇALHO & PROGRESSO ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <Link
              href={`/concursos/${siglaParam}`}
              className="text-bat-text-muted text-xs hover:text-bat-purple-400 no-underline mb-2 inline-block"
            >
              ← Voltar para {siglaUpper}
            </Link>
            <h1 className="heading text-2xl sm:text-3xl text-bat-text">
              Trilha de Estudos — <span className="text-bat-purple-400">{siglaUpper}</span>
            </h1>
            <p className="text-bat-text-secondary text-sm">
              Complete os tópicos do edital na ordem recomendada para maximizar sua retenção.
            </p>
          </div>

          {/* Badge de Conclusão */}
          <div className="flex items-center gap-4 bg-bat-bg-secondary border border-bat-border px-5 py-3 rounded-xl">
            <div className="text-right">
              <p className="heading text-2xl font-bold text-bat-purple-400">{percentualTotal}%</p>
              <p className="text-bat-text-muted text-xs">{concluidos}/{todosAssuntos.length} tópicos</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-bat-border flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full border-4 border-bat-purple-500"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${percentualTotal >= 25 ? "100% 0%" : "50% 0%"}, ${percentualTotal >= 50 ? "100% 100%" : "50% 0%"}, ${percentualTotal >= 75 ? "0% 100%" : "50% 0%"}, ${percentualTotal === 100 ? "0% 0%" : "50% 0%"})`,
                }}
              />
              <span className="text-sm">🎯</span>
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="w-full h-2.5 bg-bat-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percentualTotal}%`,
              background: "linear-gradient(90deg, #7C3AED, #A855F7, #F5C518)",
              boxShadow: "0 0 12px rgba(124, 58, 237, 0.4)",
            }}
          />
        </div>
      </div>

      {/* ═══ FILTROS DE STATUS ═══ */}
      <div className="flex gap-2">
        {[
          { key: "todos", label: "Todos os Tópicos" },
          { key: "concluido", label: "✅ Concluídos" },
          { key: "em_andamento", label: "⏳ Em Andamento" },
          { key: "nao_iniciado", label: "🔒 Pendentes" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltroStatus(f.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filtroStatus === f.key
                ? "bg-bat-purple-500/20 border-bat-purple-500 text-bat-purple-300 shadow-sm"
                : "bg-bat-bg-card border-bat-border text-bat-text-muted hover:text-bat-text"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ═══ ÁRVORE DE MATÉRIAS E ASSUNTOS ═══ */}
      <div className="space-y-6">
        {materias.map((mat) => {
          const assuntosFiltrados = mat.assuntos.filter(
            (a) => filtroStatus === "todos" || a.status === filtroStatus
          );

          if (assuntosFiltrados.length === 0) return null;

          return (
            <div key={mat.nome} className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
              {/* Header da Matéria */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-bat-border">
                <span className="text-2xl">{mat.emoji}</span>
                <h2 className="heading text-xl text-bat-text">{mat.nome}</h2>
                <span className="text-xs text-bat-text-muted ml-auto">
                  {mat.assuntos.filter((a) => a.status === "concluido").length}/{mat.assuntos.length} concluídos
                </span>
              </div>

              {/* Lista de Assuntos */}
              <div className="space-y-3">
                {assuntosFiltrados.map((ass) => {
                  const isAberto = assuntoAberto === ass.id;

                  return (
                    <div
                      key={ass.id}
                      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                        ass.status === "concluido"
                          ? "bg-bat-success/5 border-bat-success/20"
                          : ass.status === "em_andamento"
                          ? "bg-bat-purple-500/5 border-bat-purple-500/25"
                          : "bg-bat-bg-secondary/40 border-bat-border"
                      }`}
                    >
                      {/* Linha do Assunto (Click para expandir) */}
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => setAssuntoAberto(isAberto ? null : ass.id)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(ass.id);
                            }}
                            className="text-lg transition-transform hover:scale-110 cursor-pointer"
                            title="Clique para alternar status"
                          >
                            {ass.status === "concluido"
                              ? "✅"
                              : ass.status === "em_andamento"
                              ? "⏳"
                              : "⚪"}
                          </button>

                          <div>
                            <p className="text-bat-text text-sm font-semibold hover:text-bat-purple-300 transition-colors">
                              {ass.nome}
                            </p>
                            <span className="text-bat-text-muted text-xs">
                              {ass.questoes_count} questões disponíveis
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(ass.id)}
                            className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer font-medium ${
                              ass.status === "concluido"
                                ? "bg-bat-success/15 border-bat-success/30 text-bat-success"
                                : ass.status === "em_andamento"
                                ? "bg-bat-purple-500/15 border-bat-purple-500/30 text-bat-purple-300"
                                : "bg-bat-bg-card border-bat-border text-bat-text-muted"
                            }`}
                          >
                            {ass.status === "concluido"
                              ? "Concluído"
                              : ass.status === "em_andamento"
                              ? "Em Andamento"
                              : "Não Iniciado"}
                          </button>

                          <button
                            onClick={() => setAssuntoAberto(isAberto ? null : ass.id)}
                            className="text-bat-text-muted p-1 hover:text-bat-text transition cursor-pointer"
                          >
                            {isAberto ? "▲" : "▼"}
                          </button>
                        </div>
                      </div>

                      {/* Conteúdo Expandido do Assunto */}
                      {isAberto && (
                        <div className="px-5 pb-5 pt-2 border-t border-bat-border/50 bg-bat-bg-card/50 space-y-4">
                          {/* Resumo Teórico */}
                          <div>
                            <h4 className="heading text-xs uppercase tracking-wider text-bat-text-secondary mb-1">
                              📖 Resumo Teórico
                            </h4>
                            <p className="text-bat-text-secondary text-sm leading-relaxed">
                              {ass.resumo_teorico}
                            </p>
                          </div>

                          {/* Bizu Vinculado */}
                          {ass.bizu && (
                            <div className="bg-bat-gold-400/10 border border-bat-gold-400/25 rounded-xl p-3.5 flex items-start gap-3">
                              <span className="text-lg">💡</span>
                              <div>
                                <p className="text-xs font-bold text-bat-gold-400 uppercase tracking-wider">
                                  Bizu da Caverna
                                </p>
                                <p className="text-bat-text text-sm leading-relaxed mt-0.5">
                                  {ass.bizu}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Ações do Tópico */}
                          <div className="flex gap-3 pt-1">
                            <Link
                              href={`/questoes?concurso_id=${siglaParam}&assunto_id=${ass.id}`}
                              className="btn-primary text-xs py-2 px-4 no-underline inline-block"
                            >
                              Resolver {ass.questoes_count} Questões →
                            </Link>
                            <Link
                              href={`/bizus?assunto_id=${ass.id}`}
                              className="btn-secondary text-xs py-2 px-4 no-underline inline-block"
                            >
                              Ver Bizus Deste Assunto
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
