"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";
import { QuadroFigura } from "@/components/questoes/QuadroFigura";
import {
  ResolucaoGabarito,
  type PassoResolucao,
} from "@/components/questoes/ResolucaoGabarito";
import { formatarCronometro } from "@batcaverna/utils";

// ─── Contratos ───────────────────────────────────────────────
interface QuestaoSim {
  id: string;
  texto_base: string | null;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  ano: number | null;
  dificuldade: string;
  figura_descricao: string | null;
  figura_svg: string | null;
  numero_original: string | null;
  concursos: { sigla: string; emoji: string | null } | null;
  materias: { nome: string; icone_emoji: string | null } | null;
  assuntos: { nome: string } | null;
}

interface Detalhe {
  questao_id: string;
  enunciado: string;
  resposta_dada: string | null;
  resposta_correta: string;
  correta: boolean;
  explicacao: string | null;
  resolucao_passos: PassoResolucao[] | null;
  figura_descricao: string | null;
}

interface Resultado {
  total_questoes: number;
  respondidas: number;
  em_branco: number;
  acertos: number;
  erros: number;
  pontuacao: number;
  tempo_gasto_segundos: number;
  xp_ganho: number;
  nivel: { nivel: number; titulo: string };
  subiu_nivel: boolean;
  badges_novas: { nome: string; icone: string; cor_hex: string }[];
  detalhes: Detalhe[];
}

interface ConcursoOpcao {
  id: string;
  sigla: string;
  nome: string;
  emoji: string | null;
  total_questoes: number;
}

const MODOS = [
  { tipo: "rapido", rotulo: "Rápido", questoes: 10, minutos: 20, desc: "Aquecimento de 20 minutos" },
  { tipo: "materia", rotulo: "Por matéria", questoes: 20, minutos: 40, desc: "Foco numa disciplina" },
  { tipo: "completo", rotulo: "Prova completa", questoes: 45, minutos: 150, desc: "Simula o dia da prova" },
];

// ═══════════════════════════════════════════════════════════════
function Simulado() {
  const params = useSearchParams();
  const updateUser = useAuthStore((s) => s.updateUser);

  const [fase, setFase] = useState<"config" | "prova" | "resultado">("config");
  const [concursos, setConcursos] = useState<ConcursoOpcao[]>([]);
  const [config, setConfig] = useState({
    concurso: params.get("concurso") ?? "",
    tipo: "rapido",
  });

  const [simuladoId, setSimuladoId] = useState<string | null>(null);
  const [questoes, setQuestoes] = useState<QuestaoSim[]>([]);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [revisando, setRevisando] = useState<number | null>(null);

  const inicioProva = useRef<number>(0);
  const finalizarRef = useRef<() => void>(() => {});

  // ─── Catálogo ──────────────────────────────────────────────
  useEffect(() => {
    fetchWithAuth("/api/concursos")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const comQuestoes = json.data.filter((c: ConcursoOpcao) => c.total_questoes >= 5);
          setConcursos(comQuestoes);
          setConfig((c) => ({
            ...c,
            concurso: c.concurso || comQuestoes[0]?.sigla || "",
          }));
        }
      })
      .catch(() => undefined);
  }, []);

  // ─── Iniciar ───────────────────────────────────────────────
  const iniciar = async () => {
    if (!config.concurso || ocupado) return;
    setOcupado(true);
    setErro(null);

    const modo = MODOS.find((m) => m.tipo === config.tipo)!;

    try {
      const res = await fetchWithAuth("/api/simulados/start", {
        method: "POST",
        body: JSON.stringify({
          concurso: config.concurso,
          tipo: modo.tipo,
          total_questoes: modo.questoes,
          duracao_minutos: modo.minutos,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        setErro(json.error ?? "Não consegui montar o simulado.");
        return;
      }

      setSimuladoId(json.data.simulado_id);
      setQuestoes(json.data.questoes);
      setSegundosRestantes(json.data.duracao_minutos * 60);
      setRespostas({});
      setIndice(0);
      inicioProva.current = Date.now();
      setFase("prova");
    } catch {
      setErro("Falha de conexão ao iniciar o simulado.");
    } finally {
      setOcupado(false);
    }
  };

  // ─── Finalizar ─────────────────────────────────────────────
  const finalizar = useCallback(async () => {
    if (!simuladoId || ocupado) return;
    setOcupado(true);

    const tempo = Math.round((Date.now() - inicioProva.current) / 1000);

    try {
      const res = await fetchWithAuth(`/api/simulados/${simuladoId}/finalizar`, {
        method: "POST",
        body: JSON.stringify({ respostas, tempo_gasto_segundos: tempo }),
      });
      const json = await res.json();

      if (!json.success) {
        setErro(json.error ?? "Erro ao corrigir o simulado.");
        return;
      }

      const r: Resultado = json.data;
      setResultado(r);
      setFase("resultado");

      updateUser({ xp_total: json.data.xp_total, nivel_atual: r.nivel.nivel });

      window.dispatchEvent(
        new CustomEvent("batcaverna_xp_ganho", {
          detail: {
            xp: r.xp_ganho,
            totalXp: json.data.xp_total,
            motivo: `Simulado concluído: ${r.acertos}/${r.total_questoes}`,
          },
        })
      );
      if (r.subiu_nivel) {
        window.dispatchEvent(
          new CustomEvent("batcaverna_level_up", {
            detail: { novoNivel: r.nivel.nivel, titulo: r.nivel.titulo },
          })
        );
      }
    } catch {
      setErro("Falha de conexão ao enviar suas respostas.");
    } finally {
      setOcupado(false);
    }
  }, [simuladoId, respostas, ocupado, updateUser]);

  finalizarRef.current = finalizar;

  // ─── Cronômetro ────────────────────────────────────────────
  useEffect(() => {
    if (fase !== "prova") return;

    const timer = setInterval(() => {
      setSegundosRestantes((s) => {
        if (s <= 1) {
          clearInterval(timer);
          // Tempo esgotado entrega a prova como está — igual à prova real.
          finalizarRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fase]);

  // ─── Avisa antes de sair no meio da prova ──────────────────
  useEffect(() => {
    if (fase !== "prova") return;
    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [fase]);

  // ═══════════ CONFIGURAÇÃO ═══════════
  if (fase === "config") {
    const modo = MODOS.find((m) => m.tipo === config.tipo)!;

    return (
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <h1 className="heading text-3xl font-bold text-bat-text">Simulado</h1>
          <p className="mt-1 text-sm text-bat-text-secondary">
            Prova cronometrada com questões oficiais. O gabarito só aparece
            depois que você entregar — como na prova de verdade.
          </p>
        </header>

        {erro && (
          <div className="mb-4 rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-3 text-sm text-bat-error">
            {erro}
          </div>
        )}

        <div className="space-y-5 rounded-2xl border border-bat-border bg-bat-bg-card p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-bat-text">
              Concurso
            </label>
            <select
              value={config.concurso}
              onChange={(e) => setConfig({ ...config, concurso: e.target.value })}
              className="input-field"
            >
              {concursos.length === 0 && (
                <option value="">Nenhum concurso com questões suficientes</option>
              )}
              {concursos.map((c) => (
                <option key={c.id} value={c.sigla}>
                  {c.emoji} {c.sigla} — {c.total_questoes.toLocaleString("pt-BR")} questões
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-bat-text">
              Modo
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {MODOS.map((m) => (
                <button
                  key={m.tipo}
                  onClick={() => setConfig({ ...config, tipo: m.tipo })}
                  className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                    config.tipo === m.tipo
                      ? "border-bat-gold-400/50 bg-bat-gold-400/10"
                      : "border-bat-border bg-bat-bg-secondary hover:border-bat-gold-400/25"
                  }`}
                >
                  <p
                    className={`text-sm font-bold ${
                      config.tipo === m.tipo ? "text-bat-gold-400" : "text-bat-text"
                    }`}
                  >
                    {m.rotulo}
                  </p>
                  <p className="mt-0.5 text-[11px] text-bat-text-muted">{m.desc}</p>
                  <p className="mt-1.5 text-[11px] text-bat-text-secondary">
                    {m.questoes} questões · {m.minutos} min
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/50 px-4 py-3 text-xs leading-relaxed text-bat-text-secondary">
            ⏱️ Você terá <strong className="text-bat-gold-400">{modo.minutos} minutos</strong>{" "}
            para {modo.questoes} questões — cerca de{" "}
            {Math.round((modo.minutos * 60) / modo.questoes)} segundos por questão.
            Quando o tempo acabar, a prova é entregue automaticamente.
          </div>

          <button
            onClick={iniciar}
            disabled={!config.concurso || ocupado}
            className="btn-primary w-full py-3.5 disabled:opacity-40"
          >
            {ocupado ? "Montando a prova..." : "Iniciar simulado →"}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════ PROVA ═══════════
  if (fase === "prova") {
    const q = questoes[indice];
    if (!q) return null;

    const respondidas = Object.keys(respostas).length;
    const tempoAcabando = segundosRestantes < 120;

    return (
      <div className="mx-auto max-w-3xl">
        {/* Barra fixa: cronômetro + progresso */}
        <div className="sticky top-16 z-20 mb-5 rounded-2xl border border-bat-border bg-bat-bg-card/95 p-4 backdrop-blur-md lg:top-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-bat-text-muted">
                Questão {indice + 1} de {questoes.length}
              </p>
              <p className="text-sm font-medium text-bat-text">
                {respondidas} respondida{respondidas !== 1 ? "s" : ""}
              </p>
            </div>

            <div
              className={`rounded-xl border px-4 py-2 text-center ${
                tempoAcabando
                  ? "animate-pulse border-bat-error/40 bg-bat-error/10"
                  : "border-bat-border bg-bat-bg-secondary"
              }`}
            >
              <p
                className={`heading text-xl font-extrabold tabular-nums ${
                  tempoAcabando ? "text-bat-error" : "text-bat-gold-400"
                }`}
              >
                {formatarCronometro(segundosRestantes)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-bat-text-muted">
                restante
              </p>
            </div>
          </div>

          {/* Mapa de questões */}
          <div className="flex flex-wrap gap-1.5">
            {questoes.map((qq, i) => (
              <button
                key={qq.id}
                onClick={() => setIndice(i)}
                className={`h-7 w-7 cursor-pointer rounded-md text-[11px] font-bold transition-all ${
                  i === indice
                    ? "bg-bat-gold-400 text-black"
                    : respostas[qq.id]
                    ? "bg-bat-success/20 text-bat-success"
                    : "bg-bat-bg-secondary text-bat-text-muted hover:bg-bat-bg-elevated"
                }`}
                aria-label={`Ir para a questão ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Questão */}
        <article className="rounded-2xl border border-bat-border bg-bat-bg-card p-5 sm:p-6">
          <header className="mb-4 flex flex-wrap items-center gap-2 border-b border-bat-border/60 pb-3">
            <span className="rounded-lg border border-bat-gold-400/20 bg-bat-gold-400/10 px-2.5 py-1 text-xs font-bold text-bat-gold-400">
              {q.concursos?.emoji} {q.concursos?.sigla}
              {q.ano ? ` — ${q.ano}` : ""}
            </span>
            {q.materias?.nome && (
              <span className="rounded-lg bg-bat-bg-secondary px-2.5 py-1 text-xs text-bat-text-muted">
                {q.materias.icone_emoji} {q.materias.nome}
              </span>
            )}
          </header>

          {q.texto_base && (
            <div className="mb-5 rounded-xl border-l-4 border-bat-gold-400/50 bg-bat-bg-secondary/50 px-4 py-3.5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-bat-text-muted">
                Texto base
              </p>
              <div className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
                {q.texto_base}
              </div>
            </div>
          )}

          <QuadroFigura descricao={q.figura_descricao} svg={q.figura_svg} />

          <p className="mb-6 whitespace-pre-line text-base leading-relaxed text-bat-text">
            {q.enunciado}
          </p>

          <div className="mb-6 space-y-3">
            {q.alternativas?.map((alt) => {
              const marcada = respostas[q.id] === alt.letra;
              return (
                <button
                  key={alt.letra}
                  onClick={() =>
                    setRespostas((r) =>
                      // Clicar de novo desmarca: permite deixar em branco.
                      r[q.id] === alt.letra
                        ? Object.fromEntries(
                            Object.entries(r).filter(([k]) => k !== q.id)
                          )
                        : { ...r, [q.id]: alt.letra }
                    )
                  }
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                    marcada
                      ? "border-bat-gold-400/45 bg-bat-gold-400/10 font-medium text-bat-gold-400"
                      : "border-bat-border bg-bat-bg-secondary text-bat-text-secondary hover:border-bat-gold-400/30"
                  }`}
                >
                  <span className="mt-px shrink-0 font-bold">{alt.letra})</span>
                  <span className="whitespace-pre-line">{alt.texto}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIndice((i) => Math.max(0, i - 1))}
              disabled={indice === 0}
              className="btn-secondary px-5 py-2.5 disabled:opacity-30"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setIndice((i) => Math.min(questoes.length - 1, i + 1))}
              disabled={indice >= questoes.length - 1}
              className="btn-secondary px-5 py-2.5 disabled:opacity-30"
            >
              Próxima →
            </button>
            <button
              onClick={() => {
                const faltam = questoes.length - Object.keys(respostas).length;
                const msg = faltam
                  ? `Você deixou ${faltam} questão(ões) em branco. Entregar mesmo assim?`
                  : "Entregar o simulado e ver o resultado?";
                if (confirm(msg)) finalizar();
              }}
              disabled={ocupado}
              className="btn-primary ml-auto px-6 py-2.5 disabled:opacity-40"
            >
              {ocupado ? "Corrigindo..." : "Entregar prova"}
            </button>
          </div>
        </article>
      </div>
    );
  }

  // ═══════════ RESULTADO ═══════════
  if (!resultado) return null;

  const aproveitamento = resultado.pontuacao;
  const corNota =
    aproveitamento >= 70 ? "#22C55E" : aproveitamento >= 50 ? "#F5C518" : "#EF4444";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Placar */}
      <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-6 text-center">
        <p className="mb-1 text-sm text-bat-text-muted">Resultado do simulado</p>
        <p className="heading text-5xl font-extrabold" style={{ color: corNota }}>
          {resultado.acertos}
          <span className="text-2xl text-bat-text-muted">/{resultado.total_questoes}</span>
        </p>
        <p className="mt-1 text-lg font-bold" style={{ color: corNota }}>
          {aproveitamento}% de aproveitamento
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini rotulo="Acertos" valor={String(resultado.acertos)} cor="#22C55E" />
          <Mini rotulo="Erros" valor={String(resultado.erros)} cor="#EF4444" />
          <Mini rotulo="Em branco" valor={String(resultado.em_branco)} />
          <Mini
            rotulo="Tempo"
            valor={formatarCronometro(resultado.tempo_gasto_segundos)}
          />
        </div>

        <p className="mt-4 inline-block rounded-lg border border-bat-gold-400/25 bg-bat-gold-400/10 px-3 py-1.5 text-sm font-bold text-bat-gold-400">
          +{resultado.xp_ganho} XP
        </p>

        {resultado.badges_novas.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {resultado.badges_novas.map((b) => (
              <span
                key={b.nome}
                className="rounded-lg border px-2.5 py-1 text-xs font-bold"
                style={{
                  color: b.cor_hex,
                  borderColor: `${b.cor_hex}55`,
                  background: `${b.cor_hex}18`,
                }}
              >
                {b.icone} {b.nome}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setFase("config");
              setResultado(null);
              setSimuladoId(null);
            }}
            className="btn-primary px-6 py-3"
          >
            Fazer outro simulado
          </button>
          <Link href="/dashboard" className="btn-secondary px-6 py-3 no-underline">
            Voltar ao dashboard
          </Link>
        </div>
      </div>

      {/* Revisão questão a questão */}
      <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <h2 className="heading mb-1 text-lg text-bat-text">Revisão da prova</h2>
        <p className="mb-4 text-xs text-bat-text-muted">
          Toque numa questão para abrir a resolução. Revisar os erros logo após
          a prova é onde o simulado vira aprendizado.
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {resultado.detalhes.map((d, i) => (
            <button
              key={d.questao_id}
              onClick={() => setRevisando(revisando === i ? null : i)}
              className={`h-8 w-8 cursor-pointer rounded-md text-[11px] font-bold transition-all ${
                revisando === i
                  ? "ring-2 ring-bat-gold-400"
                  : ""
              } ${
                d.correta
                  ? "bg-bat-success/20 text-bat-success"
                  : d.resposta_dada
                  ? "bg-bat-error/20 text-bat-error"
                  : "bg-bat-bg-secondary text-bat-text-muted"
              }`}
              title={
                d.correta ? "Acertou" : d.resposta_dada ? "Errou" : "Em branco"
              }
            >
              {i + 1}
            </button>
          ))}
        </div>

        {revisando !== null && resultado.detalhes[revisando] && (
          <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 p-4">
            <p className="mb-3 whitespace-pre-line text-sm leading-relaxed text-bat-text">
              <strong className="text-bat-gold-400">
                Questão {revisando + 1}.
              </strong>{" "}
              {resultado.detalhes[revisando].enunciado}
            </p>
            <ResolucaoGabarito
              respostaCorreta={resultado.detalhes[revisando].resposta_correta}
              explicacao={resultado.detalhes[revisando].explicacao}
              passos={resultado.detalhes[revisando].resolucao_passos}
              figuraDescricao={resultado.detalhes[revisando].figura_descricao}
              alternativaEscolhida={resultado.detalhes[revisando].resposta_dada}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function Mini({
  rotulo,
  valor,
  cor,
}: {
  rotulo: string;
  valor: string;
  cor?: string;
}) {
  return (
    <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/50 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-bat-text-muted">
        {rotulo}
      </p>
      <p
        className="heading text-lg font-bold"
        style={{ color: cor ?? undefined }}
      >
        {valor}
      </p>
    </div>
  );
}

export default function SimuladoPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full rounded-2xl" />}>
      <Simulado />
    </Suspense>
  );
}
