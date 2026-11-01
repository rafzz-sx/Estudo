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
import { MathText } from "@/components/MathText";
import { formatarCronometro } from "@batcaverna/utils";
import { tratarTextoBaseEFigura } from "@/lib/questoes-figura";
import {
  lerProvaSalva,
  gravarProvaSalva,
  apagarProvaSalva,
} from "@/lib/prova-em-andamento";
import {
  obterFormatoConcurso,
  type FormatoConcursoReal,
} from "@/lib/formatos-concursos";
import { type VagasDificuldade } from "@/lib/balanceamento-simulado";
import { type ResultadoTRI } from "@/lib/tri-enem";

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
  area_conhecimento?: string;
  numero_no_simulado?: number;
  bloco_numero?: number;
  concursos: { sigla: string; emoji: string | null } | null;
  materias: { nome: string; icone_emoji: string | null } | null;
  assuntos: { nome: string } | null;
}

interface Detalhe {
  questao_id: string;
  enunciado: string;
  dificuldade?: string;
  materia_nome?: string | null;
  resposta_dada: string | null;
  resposta_correta: string;
  correta: boolean;
  explicacao: string | null;
  resolucao_passos: PassoResolucao[] | null;
  figura_descricao: string | null;
}

interface DesempenhoDificuldade {
  tipo: string;
  chave: string;
  total: number;
  acertos: number;
  taxa: number;
}

interface DesempenhoMateria {
  materia_id: string;
  nome: string;
  emoji: string | null;
  total: number;
  acertos: number;
  taxa: number;
}

interface ReferenciaCorte {
  percentual: number;
  nota: string;
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
  desempenho_dificuldade?: DesempenhoDificuldade[];
  desempenho_materias?: DesempenhoMateria[];
  referencia_corte?: ReferenciaCorte | null;
  resultado_tri?: ResultadoTRI | null;
  ineditas_info?: {
    solicitado: boolean;
    total_ineditas: number;
    total_repetidas: number;
    percentual_ineditas: number;
  } | null;
  detalhes: Detalhe[];
}

interface ConcursoOpcao {
  id: string;
  sigla: string;
  nome: string;
  emoji: string | null;
  total_questoes: number;
}

interface MateriaOpcao {
  id: string;
  nome: string;
  icone_emoji: string | null;
  total_questoes: number;
}

const MODOS = [
  {
    tipo: "oficial",
    rotulo: "Simulado Real da Prova",
    icone: "🏛️",
    questoes: 50,
    minutos: 240,
    desc: "Formato oficial do concurso com tempo e questões reais",
    destaque: true,
  },
  {
    tipo: "rapido",
    rotulo: "Rápido",
    icone: "⚡",
    questoes: 10,
    minutos: 20,
    desc: "Aquecimento de 20 minutos balanceado",
  },
  {
    tipo: "erros",
    rotulo: "Refazer meus erros",
    icone: "🎯",
    questoes: 20,
    minutos: 50,
    desc: "Apenas questões que você já errou",
  },
  {
    tipo: "materia",
    rotulo: "Por matéria",
    icone: "📚",
    questoes: 20,
    minutos: 40,
    desc: "Foco aprofundado numa disciplina",
  },
  {
    tipo: "completo",
    rotulo: "Treino Completo",
    icone: "📦",
    questoes: 45,
    minutos: 150,
    desc: "Volume intermediário de prova",
  },
  {
    tipo: "personalizado",
    rotulo: "Personalizado",
    icone: "⚙️",
    questoes: 20,
    minutos: 45,
    desc: "Você define quantidade, tempo e filtros",
  },
];

const LIMITES = { questoesMin: 5, questoesMax: 180, minutosMin: 5, minutosMax: 360 };

// ═══════════════════════════════════════════════════════════════
function Simulado() {
  const params = useSearchParams();
  const updateUser = useAuthStore((s) => s.updateUser);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  const [fase, setFase] = useState<"config" | "prova" | "resultado">("config");
  const [concursos, setConcursos] = useState<ConcursoOpcao[]>([]);
  const tipoDaUrl = params.get("tipo");

  const [config, setConfig] = useState({
    concurso: params.get("concurso") ?? "",
    tipo: MODOS.some((m) => m.tipo === tipoDaUrl) ? tipoDaUrl! : "oficial",
    variacao_id: "",
    dificuldade_modo: "balanceado" as "balanceado" | "facil" | "medio" | "dificil" | "custom",
    dificuldade_proporcao: { facil: 30, medio: 50, dificil: 20 },
    materia_id: "",
    ano: "",
    total_questoes: 20,
    duracao_minutos: 45,
    apenas_ineditas: false,
  });

  const [materias, setMaterias] = useState<MateriaOpcao[]>([]);
  const [anos, setAnos] = useState<number[]>([]);

  const [simuladoId, setSimuladoId] = useState<string | null>(null);
  const [questoes, setQuestoes] = useState<QuestaoSim[]>([]);
  const [indice, setIndice] = useState(0);
  const [distribuicao, setDistribuicao] = useState<
    { materia: string; questoes: number }[] | null
  >(null);
  const [distribuicaoDificuldade, setDistribuicaoDificuldade] =
    useState<VagasDificuldade | null>(null);
  const [formatoInfo, setFormatoInfo] = useState<{
    sigla: string;
    nome: string;
    descricao: string;
    detalhesEdital: string;
    temRedacaoNaProvaReal: boolean;
    redacaoDescartada: boolean;
    adaptadoEstoque?: boolean;
    variacaoAtiva?: any;
    blocos?: any;
  } | null>(null);
  const [ineditasInfo, setIneditasInfo] = useState<{
    solicitado: boolean;
    total_ineditas: number;
    total_repetidas: number;
    percentual_ineditas: number;
  } | null>(null);

  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [revisando, setRevisando] = useState<number | null>(null);

  const inicioProva = useRef<number>(0);
  const finalizarRef = useRef<() => void>(() => {});

  // ─── Catálogo de Concursos ─────────────────────────────────
  useEffect(() => {
    fetchWithAuth("/api/concursos")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const comQuestoes = json.data.filter((c: ConcursoOpcao) => c.total_questoes >= 1);
          setConcursos(comQuestoes);
          setConfig((c) => ({
            ...c,
            concurso: c.concurso || comQuestoes[0]?.sigla || "EEAR",
          }));
        }
      })
      .catch(() => undefined);
  }, []);

  // ─── Matérias e Anos do Concurso ───────────────────────────
  useEffect(() => {
    if (!config.concurso) return;
    let cancelado = false;

    fetchWithAuth(
      `/api/questoes/filtros?concurso=${encodeURIComponent(config.concurso)}`
    )
      .then((r) => r.json())
      .then((json) => {
        if (cancelado || !json.success) return;
        setMaterias(json.data.materias ?? []);
        setAnos(json.data.anos ?? []);
        setConfig((c) => ({ ...c, materia_id: "", ano: "", variacao_id: "" }));
      })
      .catch(() => undefined);

    return () => {
      cancelado = true;
    };
  }, [config.concurso]);

  // ─── Formato Oficial do Concurso Atual ─────────────────────
  const formatoAtual: FormatoConcursoReal = obterFormatoConcurso(
    config.concurso,
    config.variacao_id
  );

  // ─── Iniciar Simulado ──────────────────────────────────────
  const iniciar = useCallback(async () => {
    if (!config.concurso || ocupado) return;
    setOcupado(true);
    setErro(null);

    const modo = MODOS.find((m) => m.tipo === config.tipo)!;
    const personalizado = config.tipo === "personalizado";
    const oficial = config.tipo === "oficial";

    const quantidade = personalizado
      ? config.total_questoes
      : oficial
      ? formatoAtual.questoes
      : modo.questoes;

    const minutos = personalizado
      ? config.duracao_minutos
      : oficial
      ? formatoAtual.minutos
      : modo.minutos;

    try {
      const res = await fetchWithAuth("/api/simulados/start", {
        method: "POST",
        body: JSON.stringify({
          concurso: config.concurso,
          tipo: modo.tipo,
          variacao_id: config.variacao_id || undefined,
          dificuldade_modo: config.dificuldade_modo,
          dificuldade_proporcao:
            config.dificuldade_modo === "custom"
              ? config.dificuldade_proporcao
              : undefined,
          total_questoes: quantidade,
          duracao_minutos: minutos,
          apenas_ineditas: config.apenas_ineditas,
          ...(config.materia_id ? { materia_id: config.materia_id } : {}),
          ...(config.ano ? { ano: Number(config.ano) } : {}),
        }),
      });
      const json = await res.json();

      if (!json.success) {
        setErro(json.error ?? "Não consegui montar o simulado.");
        return;
      }

      setSimuladoId(json.data.simulado_id);
      setQuestoes(json.data.questoes);
      setDistribuicao(json.data.distribuicao ?? null);
      setDistribuicaoDificuldade(json.data.distribuicao_dificuldade ?? null);
      setFormatoInfo(json.data.formato_info ?? null);
      setIneditasInfo(json.data.ineditas_info ?? null);
      setSegundosRestantes(json.data.duracao_minutos * 60);
      setRespostas({});
      setIndice(0);

      const iniciadoEm: string = json.data.iniciado_em ?? new Date().toISOString();
      inicioProva.current = new Date(iniciadoEm).getTime();
      gravarProvaSalva({
        userId: userId ?? "",
        simuladoId: json.data.simulado_id,
        questoes: json.data.questoes,
        respostas: {},
        indice: 0,
        iniciadoEm,
        duracaoMinutos: json.data.duracao_minutos,
      });
      setFase("prova");
      window.dispatchEvent(new Event("batcaverna_study_activity"));
    } catch {
      setErro("Falha de conexão ao iniciar o simulado.");
    } finally {
      setOcupado(false);
    }
  }, [config, ocupado, formatoAtual, userId]);

  // ─── Retomar Prova Interrompida ────────────────────────────
  const restaurou = useRef(false);
  useEffect(() => {
    if (restaurou.current) return;
    if (!userId) return;
    const salva = lerProvaSalva(userId);
    if (!salva) return;
    restaurou.current = true;

    const decorrido = Math.floor((Date.now() - new Date(salva.iniciadoEm).getTime()) / 1000);
    const restante = salva.duracaoMinutos * 60 - decorrido;

    setSimuladoId(salva.simuladoId);
    setQuestoes(salva.questoes as any);
    setDistribuicao(null);
    setRespostas(salva.respostas ?? {});
    setIndice(
      Math.min(Math.max(0, salva.indice ?? 0), Math.max(0, salva.questoes.length - 1))
    );
    inicioProva.current = new Date(salva.iniciadoEm).getTime();
    setSegundosRestantes(Math.max(1, restante));
    setFase("prova");
    window.dispatchEvent(new Event("batcaverna_study_activity"));
  }, [userId]);

  // ─── Persistência local contínua ───────────────────────────
  useEffect(() => {
    if (fase !== "prova" || !simuladoId) return;
    const salva = lerProvaSalva(userId);
    if (!salva || salva.simuladoId !== simuladoId) return;
    gravarProvaSalva({ ...salva, respostas, indice });
  }, [fase, simuladoId, respostas, indice, userId]);

  // ─── Auto-Start (?auto=1) ──────────────────────────────────
  const autoDisparado = useRef(false);
  useEffect(() => {
    if (params.get("auto") !== "1") return;
    if (restaurou.current) return;
    if (autoDisparado.current || fase !== "config" || !config.concurso) return;
    autoDisparado.current = true;
    iniciar();
  }, [params, fase, config.concurso, iniciar]);

  // ─── Finalizar Prova ───────────────────────────────────────
  const finalizar = useCallback(async () => {
    if (!simuladoId || ocupado) return;
    setOcupado(true);
    setErro(null);

    const tempo = Math.round((Date.now() - inicioProva.current) / 1000);

    try {
      const res = await fetchWithAuth(`/api/simulados/${simuladoId}/finalizar`, {
        method: "POST",
        body: JSON.stringify({ respostas, tempo_gasto_segundos: tempo }),
      });
      const json = await res.json();

      if (!json.success) {
        const jaEra =
          res.status === 404 ||
          /finalizad|não encontrad|nao encontrad/i.test(String(json.error ?? ""));

        if (jaEra) {
          apagarProvaSalva();
          restaurou.current = false;
          setFase("config");
          setSimuladoId(null);
          setQuestoes([]);
          setRespostas({});
        }
        setErro(json.error ?? "Erro ao corrigir o simulado.");
        return;
      }

      apagarProvaSalva();
      const r: Resultado = json.data;
      if (ineditasInfo) {
        r.ineditas_info = ineditasInfo;
      }
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
          finalizarRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fase]);

  // ─── Trava contra saída acidental ──────────────────────────
  useEffect(() => {
    if (fase !== "prova") return;
    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [fase]);

  // ═════════════════════════════════════════════════════════════
  // TELA DE CONFIGURAÇÃO DO SIMULADO
  // ═════════════════════════════════════════════════════════════
  if (fase === "config") {
    const modo = MODOS.find((m) => m.tipo === config.tipo)!;
    const personalizado = config.tipo === "personalizado";
    const porMateria = config.tipo === "materia";
    const modoErros = config.tipo === "erros";
    const oficial = config.tipo === "oficial";

    const qtd = personalizado
      ? config.total_questoes
      : oficial
      ? formatoAtual.questoes
      : modo.questoes ?? 20;

    const min = personalizado
      ? config.duracao_minutos
      : oficial
      ? formatoAtual.minutos
      : modo.minutos ?? 45;

    const materiaEscolhida = materias.find((m) => m.id === config.materia_id);
    const concursoEscolhido = concursos.find((c) => c.sigla === config.concurso);
    const disponiveis = materiaEscolhida
      ? materiaEscolhida.total_questoes
      : concursoEscolhido?.total_questoes ?? 0;

    const vaiAdaptarEstoque = !modoErros && disponiveis > 0 && disponiveis < qtd;

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-bat-gold-400/10 px-2.5 py-1 text-xs font-bold text-bat-gold-400 border border-bat-gold-400/20">
              Ambiente de Prova Oficial
            </span>
            <span className="text-xs text-bat-text-muted">
              Tempo Real & Gabarito Blindado
            </span>
          </div>
          <h1 className="heading mt-2 text-3xl font-extrabold text-bat-text">
            Simulado BatCaverna
          </h1>
          <p className="mt-1 text-sm text-bat-text-secondary leading-relaxed">
            Treino fiel sob condições reais de prova. O gabarito, as resoluções
            passo a passo e as estatísticas de desempenho ficam{" "}
            <strong className="text-bat-text">100% ocultos</strong> durante a prova
            e só aparecem após o término — exatamente como no dia do seu concurso.
          </p>
        </header>

        {erro && (
          <div className="rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-3 text-sm text-bat-error">
            {erro}
          </div>
        )}

        <div className="space-y-6 rounded-2xl border border-bat-border bg-bat-bg-card p-6 shadow-sm">
          {/* 1. SELEÇÃO DO CONCURSO */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-bat-text">
              1. Escolha o Concurso Alvo
            </label>
            <select
              value={config.concurso}
              onChange={(e) => setConfig({ ...config, concurso: e.target.value })}
              className="input-field text-base font-medium"
            >
              {concursos.length === 0 && (
                <option value="">Nenhum concurso disponível</option>
              )}
              {concursos.map((c) => (
                <option key={c.id} value={c.sigla}>
                  {c.emoji ?? "🎯"} {c.sigla} — {c.nome} ({c.total_questoes.toLocaleString("pt-BR")} questões no banco)
                </option>
              ))}
            </select>
          </div>

          {/* CARD DE DETALHES DO FORMATO REAL DO CONCURSO */}
          <div className="rounded-xl border border-bat-gold-400/30 bg-bat-gold-400/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bat-gold-400/15 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{concursoEscolhido?.emoji ?? "🏛️"}</span>
                <div>
                  <p className="text-sm font-bold text-bat-text">
                    Formato Oficial: {formatoAtual.sigla}
                  </p>
                  <p className="text-[11px] text-bat-text-muted">
                    {formatoAtual.nome}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-md bg-bat-gold-400/20 px-2 py-0.5 text-xs font-bold text-bat-gold-400">
                  {formatoAtual.questoes} questões · {formatoAtual.duracaoHorasTexto}
                </span>
              </div>
            </div>

            <p className="text-xs text-bat-text-secondary leading-relaxed">
              {formatoAtual.detalhesEdital}
            </p>

            {formatoAtual.temRedacaoNaProvaReal && (
              <p className="mt-2 text-[11px] font-medium text-bat-gold-400/90 flex items-center gap-1.5">
                <span>✍️</span>
                <span>
                  <strong>Redação oficial descartada no simulado:</strong> foco
                  100% nas questões objetivas sob a velocidade e tempo real da prova.
                </span>
              </p>
            )}

            {/* Variações de Prova (ex: ENEM 1º dia / 2º dia / EEAR / ESA / CN) */}
            {oficial && formatoAtual.variacoes && formatoAtual.variacoes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-bat-gold-400/15">
                <label className="mb-1.5 block text-xs font-semibold text-bat-text">
                  Selecione o Dia ou Modelo da Prova:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {formatoAtual.variacoes.map((v) => {
                    const ativo = (config.variacao_id || formatoAtual.variacoes![0].id) === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setConfig({ ...config, variacao_id: v.id })}
                        className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                          ativo
                            ? "border-bat-gold-400 bg-bat-gold-400/15 text-bat-gold-400 font-bold ring-1 ring-bat-gold-400/40"
                            : "border-bat-border bg-bat-bg-secondary text-bat-text-secondary hover:border-bat-gold-400/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold">{v.nome}</p>
                          <span className="text-[10px] font-semibold text-bat-text-muted">
                            {v.questoes} q
                          </span>
                        </div>
                        <p className="text-[10px] text-bat-text-muted mt-1 leading-tight">
                          {v.descricao}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. MODO DO SIMULADO */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-bat-text">
              2. Modo de Treino
            </label>
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
              {MODOS.map((m) => (
                <button
                  key={m.tipo}
                  type="button"
                  onClick={() => setConfig({ ...config, tipo: m.tipo })}
                  className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all relative ${
                    config.tipo === m.tipo
                      ? "border-bat-gold-400/60 bg-bat-gold-400/10 ring-1 ring-bat-gold-400/40"
                      : "border-bat-border bg-bat-bg-secondary hover:border-bat-gold-400/25"
                  }`}
                >
                  {m.destaque && (
                    <span className="absolute top-2 right-2 rounded-full bg-bat-gold-400/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-bat-gold-400">
                      Oficial
                    </span>
                  )}
                  <p
                    className={`text-sm font-bold flex items-center gap-1.5 ${
                      config.tipo === m.tipo ? "text-bat-gold-400" : "text-bat-text"
                    }`}
                  >
                    <span>{m.icone}</span>
                    <span>{m.rotulo}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-bat-text-muted leading-tight">
                    {m.desc}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-bat-text-secondary">
                    {m.tipo === "personalizado"
                      ? "Você escolhe"
                      : m.tipo === "erros"
                      ? "Até 20 dos seus erros"
                      : m.tipo === "oficial"
                      ? `${formatoAtual.questoes} q · ${formatoAtual.duracaoHorasTexto}`
                      : `${m.questoes} questões · ${m.minutos} min`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. CALIBRAÇÃO DE DIFICULDADE (TOTALMENTE CONFIGURÁVEL) */}
          <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 p-4">
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-sm font-semibold text-bat-text">
                3. Nível e Calibração de Dificuldade
              </label>
              <span className="text-[11px] text-bat-text-muted">
                Configurável pelo aluno
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* BALANCEADO REAL (RECOMENDADO) */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, dificuldade_modo: "balanceado" })}
                className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                  config.dificuldade_modo === "balanceado"
                    ? "border-bat-gold-400/70 bg-bat-gold-400/15 ring-1 ring-bat-gold-400/50"
                    : "border-bat-border bg-bat-bg-card hover:border-bat-gold-400/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-bat-gold-400">
                    ⚖️ Balanceado Real da Prova
                  </span>
                  <span className="rounded-full bg-bat-gold-400/20 px-2 py-0.5 text-[9px] font-bold text-bat-gold-400">
                    Padrão
                  </span>
                </div>
                <p className="mt-1 text-xs text-bat-text-secondary leading-snug">
                  O sistema calibra realisticamente: ~30% Fáceis, ~50% Médias e ~20% Difíceis.
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-[10px] font-semibold text-bat-text-muted">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Fácil
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span> Média
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-400"></span> Difícil
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-bat-gold-400 font-medium">
                  🛡️ Nunca coloca somente fáceis, médias ou difíceis.
                </p>
              </button>

              {/* FOCO EM FÁCEIS */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, dificuldade_modo: "facil" })}
                className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                  config.dificuldade_modo === "facil"
                    ? "border-emerald-500/70 bg-emerald-500/15 ring-1 ring-emerald-500/50"
                    : "border-bat-border bg-bat-bg-card hover:border-emerald-500/30"
                }`}
              >
                <span className="text-sm font-bold text-emerald-400">
                  🟢 Foco em Fáceis
                </span>
                <p className="mt-1 text-xs text-bat-text-secondary leading-snug">
                  Aquecimento e fixação. Prioriza velocidade, confiança e revisão de conceitos fundamentais.
                </p>
              </button>

              {/* FOCO EM MÉDIAS */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, dificuldade_modo: "medio" })}
                className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                  config.dificuldade_modo === "medio"
                    ? "border-amber-500/70 bg-amber-500/15 ring-1 ring-amber-500/50"
                    : "border-bat-border bg-bat-bg-card hover:border-amber-500/30"
                }`}
              >
                <span className="text-sm font-bold text-amber-400">
                  🟡 Foco em Médias
                </span>
                <p className="mt-1 text-xs text-bat-text-secondary leading-snug">
                  O miolo da prova. Questões típicas que definem o ponto de corte do concurso.
                </p>
              </button>

              {/* FOCO EM DIFÍCEIS */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, dificuldade_modo: "dificil" })}
                className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                  config.dificuldade_modo === "dificil"
                    ? "border-rose-500/70 bg-rose-500/15 ring-1 ring-rose-500/50"
                    : "border-bat-border bg-bat-bg-card hover:border-rose-500/30"
                }`}
              >
                <span className="text-sm font-bold text-rose-400">
                  🔴 Foco em Difíceis / Aprofundamento
                </span>
                <p className="mt-1 text-xs text-bat-text-secondary leading-snug">
                  Nível de desempate. Questões complexas para disputar os primeiros lugares.
                </p>
              </button>
            </div>

            {/* CONTROLE PERSONALIZADO DE PROPORÇÕES */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    dificuldade_modo:
                      config.dificuldade_modo === "custom" ? "balanceado" : "custom",
                  })
                }
                className="text-xs text-bat-gold-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>🎛️</span>
                {config.dificuldade_modo === "custom"
                  ? "Fechar dosagem manual (voltar ao balanceamento recomendado)"
                  : "Deseja dosar as porcentagens manualmente? Toque aqui"}
              </button>

              {config.dificuldade_modo === "custom" && (
                <div className="mt-3 rounded-xl border border-bat-gold-400/30 bg-bat-gold-400/5 p-4 space-y-3">
                  <p className="text-xs font-semibold text-bat-text">
                    Defina a proporção desejada (o sistema normalizará as vagas):
                  </p>
                  <Ajuste
                    rotulo="🟢 Porcentagem de Fáceis"
                    valor={config.dificuldade_proporcao.facil}
                    minimo={0}
                    maximo={100}
                    passo={5}
                    sufixo="%"
                    onChange={(v) =>
                      setConfig({
                        ...config,
                        dificuldade_proporcao: {
                          ...config.dificuldade_proporcao,
                          facil: v,
                        },
                      })
                    }
                  />
                  <Ajuste
                    rotulo="🟡 Porcentagem de Médias"
                    valor={config.dificuldade_proporcao.medio}
                    minimo={0}
                    maximo={100}
                    passo={5}
                    sufixo="%"
                    onChange={(v) =>
                      setConfig({
                        ...config,
                        dificuldade_proporcao: {
                          ...config.dificuldade_proporcao,
                          medio: v,
                        },
                      })
                    }
                  />
                  <Ajuste
                    rotulo="🔴 Porcentagem de Difíceis"
                    valor={config.dificuldade_proporcao.dificil}
                    minimo={0}
                    maximo={100}
                    passo={5}
                    sufixo="%"
                    onChange={(v) =>
                      setConfig({
                        ...config,
                        dificuldade_proporcao: {
                          ...config.dificuldade_proporcao,
                          dificil: v,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* MATÉRIA (PARA MODO MATÉRIA OU PERSONALIZADO) */}
          {(porMateria || personalizado) && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-bat-text">
                Matéria{" "}
                {personalizado && (
                  <span className="font-normal text-bat-text-muted">
                    (opcional)
                  </span>
                )}
              </label>
              <select
                value={config.materia_id}
                onChange={(e) =>
                  setConfig({ ...config, materia_id: e.target.value })
                }
                className="input-field"
              >
                <option value="">
                  {porMateria
                    ? "Escolha a disciplina do treino"
                    : "Todas as matérias do concurso"}
                </option>
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.icone_emoji ? `${m.icone_emoji} ` : ""}
                    {m.nome} — {m.total_questoes.toLocaleString("pt-BR")} questões
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* AJUSTES FINOS (MODO PERSONALIZADO) */}
          {personalizado && (
            <div className="space-y-4 rounded-xl border border-bat-gold-400/20 bg-bat-gold-400/5 p-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-bat-text">
                  Ano da prova{" "}
                  <span className="font-normal text-bat-text-muted">
                    (opcional)
                  </span>
                </label>
                <select
                  value={config.ano}
                  onChange={(e) => setConfig({ ...config, ano: e.target.value })}
                  className="input-field"
                >
                  <option value="">Todos os anos</option>
                  {anos.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <Ajuste
                rotulo="Quantidade de questões"
                valor={config.total_questoes}
                minimo={LIMITES.questoesMin}
                maximo={LIMITES.questoesMax}
                passo={5}
                sufixo="questões"
                onChange={(v) => setConfig({ ...config, total_questoes: v })}
              />

              <Ajuste
                rotulo="Tempo de prova"
                valor={config.duracao_minutos}
                minimo={LIMITES.minutosMin}
                maximo={LIMITES.minutosMax}
                passo={5}
                sufixo="minutos"
                onChange={(v) => setConfig({ ...config, duracao_minutos: v })}
              />
            </div>
          )}

          {/* 4. OPÇÃO DE QUESTÕES INÉDITAS (ANTI-REPETIÇÃO) */}
          <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 p-4 transition-all hover:border-bat-gold-400/30">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.apenas_ineditas}
                onChange={(e) =>
                  setConfig({ ...config, apenas_ineditas: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 rounded border-bat-border text-bat-gold-400 focus:ring-bat-gold-400/40 bg-bat-bg-card cursor-pointer accent-bat-gold-400"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-bat-text flex items-center gap-1.5">
                    <span>✨</span> Apenas questões inéditas
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                    Anti-repetição
                  </span>
                </div>
                <p className="mt-1 text-xs text-bat-text-secondary leading-snug">
                  Gera o simulado priorizando exclusivamente questões que você <strong>ainda não respondeu</strong> na plataforma, evitando qualquer repetição de treinos anteriores.
                </p>
              </div>
            </label>
          </div>

          {/* RESUMO DOS PARÂMETROS DE EXECUÇÃO */}
          <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/60 px-4 py-3 text-xs leading-relaxed text-bat-text-secondary">
            ⏱️ Você terá <strong className="text-bat-gold-400">{min} minutos</strong>{" "}
            para resolver <strong>{qtd} questões</strong> — média de{" "}
            <strong>{Math.round((min * 60) / qtd)} segundos</strong> por questão.
            Quando o tempo acabar, a prova é entregue automaticamente.
            {config.apenas_ineditas && (
              <span className="mt-2 block text-emerald-400 font-medium flex items-center gap-1.5">
                <span>✨</span> Filtro ativo: seleção com foco em questões que você ainda não respondeu.
              </span>
            )}
            {vaiAdaptarEstoque && (
              <span className="mt-2 block text-bat-warning font-medium">
                ⚠️ O banco de questões possui {disponiveis.toLocaleString("pt-BR")} questões
                neste momento. O simulado será montado com todas as {disponiveis} disponíveis.
              </span>
            )}
          </div>

          <button
            onClick={iniciar}
            disabled={!config.concurso || ocupado || (porMateria && !config.materia_id)}
            className="btn-primary w-full py-4 text-base font-bold disabled:opacity-40 cursor-pointer shadow-md"
          >
            {ocupado ? "Montando prova oficial..." : "Iniciar simulado agora →"}
          </button>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // TELA DE EXECUÇÃO DA PROVA (CONDIÇÃO REAL: GABARITO OCULTO)
  // ═════════════════════════════════════════════════════════════
  if (fase === "prova") {
    const q = questoes[indice];
    if (!q) return null;

    const respondidas = Object.keys(respostas).length;
    const tempoAcabando = segundosRestantes < 120;

    return (
      <div className="mx-auto max-w-3xl">
        {erro && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-3 text-sm text-bat-error"
          >
            <p className="font-semibold">{erro}</p>
            <p className="mt-1 text-xs text-bat-error/80">
              Suas respostas continuam salvas neste aparelho. Confira a conexão
              e toque em entregar de novo.
            </p>
          </div>
        )}

        {/* Resumo da distribuição do simulado na primeira questão */}
        {respondidas === 0 && (distribuicao || distribuicaoDificuldade) && (
          <div className="mb-4 rounded-xl border border-bat-gold-400/25 bg-bat-gold-400/5 px-4 py-3">
            <p className="mb-1.5 text-xs font-bold text-bat-gold-400 flex items-center gap-1.5">
              <span>🏛️</span>
              <span>Prova Calibrada Oficial ({questoes.length} questões)</span>
            </p>
            {distribuicao && distribuicao.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-1.5">
                {distribuicao.map((d) => (
                  <span key={d.materia} className="text-xs text-bat-text-secondary">
                    {d.materia}: <strong className="text-bat-text">{d.questoes}</strong>
                  </span>
                ))}
              </div>
            )}
            {distribuicaoDificuldade && (
              <div className="flex items-center gap-3 text-[11px] text-bat-text-muted pt-1 border-t border-bat-gold-400/15">
                <span>🟢 {distribuicaoDificuldade.facil} Fáceis</span>
                <span>🟡 {distribuicaoDificuldade.medio} Médias</span>
                <span>🔴 {distribuicaoDificuldade.dificil} Difíceis</span>
                <span className="text-bat-gold-400/90 font-medium ml-auto">
                  Gabarito 100% blindado
                </span>
              </div>
            )}
          </div>
        )}

        {/* BARRA SUPERIOR FIXA: CRONÔMETRO + NAVEGAÇÃO */}
        <div className="sticky top-16 z-20 mb-5 rounded-2xl border border-bat-border bg-bat-bg-card/95 p-4 backdrop-blur-md lg:top-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-bat-text-muted">
                Questão {indice + 1} de {questoes.length}
              </p>
              <p className="text-sm font-semibold text-bat-text">
                {respondidas} de {questoes.length} respondida{respondidas !== 1 ? "s" : ""}
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

          {/* MAPA DE QUESTÕES (ORGANIZADO POR ÁREA / DISCIPLINA QUANDO HOUVER) */}
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {(() => {
              // Agrupamento por área de conhecimento oficial
              const areasMap = new Map<string, { questao: QuestaoSim; idx: number }[]>();
              for (let i = 0; i < questoes.length; i++) {
                const qq = questoes[i];
                const areaKey = qq.area_conhecimento || "Questões da Prova";
                if (!areasMap.has(areaKey)) areasMap.set(areaKey, []);
                areasMap.get(areaKey)!.push({ questao: qq, idx: i });
              }

              if (areasMap.size <= 1) {
                return (
                  <div className="flex flex-wrap gap-1.5">
                    {questoes.map((qq, i) => {
                      const respondida = !!respostas[qq.id];
                      const ativa = i === indice;
                      return (
                        <button
                          key={qq.id}
                          onClick={() => setIndice(i)}
                          className={`h-7 w-7 cursor-pointer rounded-md text-[11px] font-bold transition-all ${
                            ativa
                              ? "bg-bat-gold-400 text-black shadow"
                              : respondida
                              ? "bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/40"
                              : "bg-bat-bg-secondary text-bat-text-muted hover:bg-bat-bg-elevated"
                          }`}
                          aria-label={`Ir para a questão ${i + 1}`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                );
              }

              return [...areasMap.entries()].map(([areaNome, items]) => (
                <div key={areaNome} className="pt-1 border-t first:border-t-0 border-bat-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-bat-gold-400">
                      🏛️ {areaNome} ({items[0].idx + 1} a {items[items.length - 1].idx + 1})
                    </span>
                    <span className="text-[10px] text-bat-text-muted">
                      {items.filter((it) => !!respostas[it.questao.id]).length}/{items.length} resp.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map(({ questao: qq, idx: i }) => {
                      const respondida = !!respostas[qq.id];
                      const ativa = i === indice;
                      return (
                        <button
                          key={qq.id}
                          onClick={() => setIndice(i)}
                          className={`h-7 w-7 cursor-pointer rounded-md text-[11px] font-bold transition-all ${
                            ativa
                              ? "bg-bat-gold-400 text-black shadow"
                              : respondida
                              ? "bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/40"
                              : "bg-bat-bg-secondary text-bat-text-muted hover:bg-bat-bg-elevated"
                          }`}
                          aria-label={`Ir para a questão ${i + 1}`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* QUESTÃO ATUAL */}
        <article className="rounded-2xl border border-bat-border bg-bat-bg-card p-5 sm:p-6 shadow-sm">
          <header className="mb-4 flex flex-wrap items-center gap-2 border-b border-bat-border/60 pb-3">
            <span className="rounded-lg border border-bat-gold-400/20 bg-bat-gold-400/10 px-2.5 py-1 text-xs font-bold text-bat-gold-400">
              {q.concursos?.emoji} {q.concursos?.sigla}
              {q.ano ? ` — ${q.ano}` : ""}
            </span>
            {q.area_conhecimento && (
              <span className="rounded-lg border border-bat-gold-400/30 bg-bat-gold-400/15 px-2.5 py-1 text-xs font-bold text-bat-gold-400">
                🏛️ {q.area_conhecimento}
              </span>
            )}
            {q.materias?.nome && (
              <span className="rounded-lg bg-bat-bg-secondary px-2.5 py-1 text-xs font-medium text-bat-text-secondary">
                {q.materias.icone_emoji} {q.materias.nome}
              </span>
            )}
            {q.assuntos?.nome && (
              <span className="rounded-lg bg-bat-bg-secondary/60 px-2.5 py-1 text-xs text-bat-text-muted">
                {q.assuntos.nome}
              </span>
            )}
            <span className="ml-auto text-xs text-bat-text-muted font-medium">
              Questão {indice + 1} de {questoes.length}
            </span>
          </header>

          {(() => {
            const { textoBaseFinal, figuraDescricaoFinal } = tratarTextoBaseEFigura(
              q.texto_base,
              q.figura_descricao
            );
            return (
              <>
                {textoBaseFinal && (
                  <div className="mb-5 rounded-xl border-l-4 border-bat-gold-400/50 bg-bat-bg-secondary/50 px-4 py-3.5">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-bat-text-muted">
                      Texto base
                    </p>
                    <div className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
                      <MathText>{textoBaseFinal}</MathText>
                    </div>
                  </div>
                )}

                <QuadroFigura descricao={figuraDescricaoFinal} svg={q.figura_svg} />
              </>
            );
          })()}

          <p className="mb-6 whitespace-pre-line text-base leading-relaxed text-bat-text font-normal">
            <MathText>{q.enunciado}</MathText>
          </p>

          <div className="mb-6 space-y-3">
            {q.alternativas?.map((alt) => {
              const marcada = respostas[q.id] === alt.letra;
              return (
                <button
                  key={alt.letra}
                  onClick={() =>
                    setRespostas((r) =>
                      r[q.id] === alt.letra
                        ? Object.fromEntries(
                            Object.entries(r).filter(([k]) => k !== q.id)
                          )
                        : { ...r, [q.id]: alt.letra }
                    )
                  }
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                    marcada
                      ? "border-bat-gold-400/60 bg-bat-gold-400/15 font-semibold text-bat-gold-400 ring-1 ring-bat-gold-400/40"
                      : "border-bat-border bg-bat-bg-secondary text-bat-text-secondary hover:border-bat-gold-400/30"
                  }`}
                >
                  <span className="mt-px shrink-0 font-bold">{alt.letra})</span>
                  <span className="whitespace-pre-line"><MathText>{alt.texto}</MathText></span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIndice((i) => Math.max(0, i - 1))}
              disabled={indice === 0}
              className="btn-secondary px-5 py-2.5 disabled:opacity-30 cursor-pointer"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setIndice((i) => Math.min(questoes.length - 1, i + 1))}
              disabled={indice >= questoes.length - 1}
              className="btn-secondary px-5 py-2.5 disabled:opacity-30 cursor-pointer"
            >
              Próxima →
            </button>
            <button
              onClick={() => {
                const faltam = questoes.length - Object.keys(respostas).length;
                const msg = faltam
                  ? `Você deixou ${faltam} questão(ões) em branco. Deseja entregar o simulado agora e acessar seu resultado?`
                  : "Deseja finalizar o simulado e acessar seu resultado oficial?";
                if (confirm(msg)) finalizar();
              }}
              disabled={ocupado}
              className="btn-primary ml-auto px-6 py-2.5 disabled:opacity-40 cursor-pointer font-bold"
            >
              {ocupado ? "Corrigindo..." : "Entregar prova"}
            </button>
          </div>
        </article>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // TELA DE RESULTADO (REVELADA SOMENTE APÓS O TÉRMINO)
  // ═════════════════════════════════════════════════════════════
  if (!resultado) return null;

  const aproveitamento = resultado.pontuacao;
  const corNota =
    aproveitamento >= 70 ? "#22C55E" : aproveitamento >= 50 ? "#F5C518" : "#EF4444";

  const refCorte = resultado.referencia_corte;
  const passouCorte = refCorte ? aproveitamento >= refCorte.percentual : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* PLACAR PRINCIPAL */}
      <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-6 text-center shadow-sm">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-bat-text-muted">
          Resultado Oficial do Simulado
        </p>
        <p className="heading text-6xl font-extrabold" style={{ color: corNota }}>
          {resultado.acertos}
          <span className="text-2xl text-bat-text-muted font-normal">
            /{resultado.total_questoes}
          </span>
        </p>
        <p className="mt-1 text-xl font-bold" style={{ color: corNota }}>
          {aproveitamento}% de aproveitamento
        </p>

        {/* COMPARATIVO COM A NOTA DE CORTE HISTÓRICA DO CONCURSO */}
        {refCorte && (
          <div className="mt-4 inline-block rounded-xl border border-bat-border bg-bat-bg-secondary/60 px-4 py-2.5 text-xs text-bat-text-secondary max-w-md mx-auto">
            <p className="font-semibold text-bat-text">
              {passouCorte ? (
                <span className="text-emerald-400">
                  🎉 Desempenho Competitivo para Aprovação!
                </span>
              ) : (
                <span className="text-amber-400">
                  ⚠️ Abaixo da Faixa Histórica de Aprovação
                </span>
              )}
            </p>
            <p className="mt-0.5 text-[11px] text-bat-text-muted">
              Corte de referência: ~{refCorte.percentual}% ({refCorte.nota})
            </p>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini rotulo="Acertos" valor={String(resultado.acertos)} cor="#22C55E" />
          <Mini rotulo="Erros" valor={String(resultado.erros)} cor="#EF4444" />
          <Mini rotulo="Em branco" valor={String(resultado.em_branco)} />
          <Mini
            rotulo="Tempo de prova"
            valor={formatarCronometro(resultado.tempo_gasto_segundos)}
          />
        </div>

        <p className="mt-4 inline-block rounded-lg border border-bat-gold-400/25 bg-bat-gold-400/10 px-3.5 py-1.5 text-sm font-bold text-bat-gold-400">
          +{resultado.xp_ganho} XP Conquistados
        </p>

        {/* INÉDITAS STATUS */}
        {resultado.ineditas_info?.solicitado && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <span>✨</span>
            <span>
              {resultado.ineditas_info.percentual_ineditas === 100
                ? "Simulado 100% Inédito (sem repetição de questões)"
                : `Simulado com ${resultado.ineditas_info.total_ineditas} questões inéditas (${resultado.ineditas_info.percentual_ineditas}%)`}
            </span>
          </div>
        )}

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
              apagarProvaSalva();
              restaurou.current = false;
              setFase("config");
              setResultado(null);
              setSimuladoId(null);
            }}
            className="btn-primary px-6 py-3 cursor-pointer font-bold"
          >
            Fazer outro simulado
          </button>
          <Link href="/dashboard" className="btn-secondary px-6 py-3 no-underline">
            Voltar ao dashboard
          </Link>
        </div>
      </div>

      {/* PAINEL OFICIAL DE TRI — ENEM */}
      {resultado.resultado_tri && (
        <section className="rounded-2xl border border-bat-gold-400/40 bg-gradient-to-b from-bat-bg-card via-bat-bg-card to-bat-bg-secondary/40 p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-bat-border/60 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <h2 className="heading text-lg font-bold text-bat-gold-400">
                  Estimativa Oficial de TRI (ENEM)
                </h2>
                <span className="rounded-full bg-bat-gold-400/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-bat-gold-400">
                  Teoria de Resposta ao Item
                </span>
              </div>
              <p className="text-xs text-bat-text-muted mt-0.5">
                Cálculo calibrado com penalização por chute e validação de coerência pedagógica na Escala Guttman.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-bat-text-muted block">Faixa ENEM SiSU</span>
              <span className="text-xs font-bold text-bat-text">
                {resultado.resultado_tri.notaGeral >= 750
                  ? "Altamente Competitivo (Medicina/Direito)"
                  : resultado.resultado_tri.notaGeral >= 680
                  ? "Competitivo (Engenharias/Saúde)"
                  : resultado.resultado_tri.notaGeral >= 600
                  ? "Acesso Geral Superior"
                  : "Desenvolvimento de Base"}
              </span>
            </div>
          </div>

          {/* PLACAR GERAL TRI & COERÊNCIA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* NOTA TRI GERAL */}
            <div className="rounded-xl border border-bat-gold-400/30 bg-bat-gold-400/10 p-4 text-center flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-bat-gold-400">
                Sua Nota TRI Estimada
              </span>
              <p className="heading text-5xl font-black text-bat-gold-400 my-1">
                {resultado.resultado_tri.notaGeral}
                <span className="text-base text-bat-text-muted font-normal"> / 1000</span>
              </p>
              <p className="text-xs text-bat-text-secondary">
                Média calibrada das áreas presentes neste simulado
              </p>
            </div>

            {/* COERÊNCIA PEDAGÓGICA */}
            <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/70 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-bat-text">
                    Coerência Pedagógica
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      resultado.resultado_tri.coerenciaGeral === "alta"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : resultado.resultado_tri.coerenciaGeral === "media"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {resultado.resultado_tri.coerenciaGeral === "alta"
                      ? "Alta Coerência"
                      : resultado.resultado_tri.coerenciaGeral === "media"
                      ? "Coerência Média"
                      : "Alerta de Inconsistência"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 rounded-full bg-bat-bg-card overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        resultado.resultado_tri.coerenciaGeralPercentual >= 85
                          ? "bg-emerald-400"
                          : resultado.resultado_tri.coerenciaGeralPercentual >= 72
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      }`}
                      style={{ width: `${resultado.resultado_tri.coerenciaGeralPercentual}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-bat-text">
                    {resultado.resultado_tri.coerenciaGeralPercentual}%
                  </span>
                </div>
                <p className="text-xs text-bat-text-secondary leading-snug">
                  {resultado.resultado_tri.explicacaoGeral}
                </p>
              </div>
              <p className="mt-2 text-[10px] text-bat-text-muted border-t border-bat-border/50 pt-1.5">
                💡 <strong>Como a TRI funciona:</strong> se você errar questões fáceis e acertar difíceis, o algoritmo do ENEM deduz que houve chute casual e diminui sua pontuação. Garantir as fáceis e médias é o segredo para notas 800+.
              </p>
            </div>
          </div>

          {/* DESEMPENHO TRI POR ÁREA */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-bat-text-muted mb-2.5">
              Detalhamento TRI por Grande Área do Conhecimento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resultado.resultado_tri.areas.map((area) => (
                <div
                  key={area.codigo}
                  className="rounded-xl border border-bat-border bg-bat-bg-card p-3.5 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{area.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-bat-text">
                          {area.nome}
                        </p>
                        <p className="text-[11px] text-bat-text-muted">
                          {area.acertos} de {area.totalQuestoes} acertos ({Math.round((area.acertos / area.totalQuestoes) * 100)}%)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="heading text-xl font-black text-bat-gold-400">
                        {area.notaTRI}
                      </p>
                      <span
                        className={`text-[9px] font-bold ${
                          area.coerencia === "alta"
                            ? "text-emerald-400"
                            : area.coerencia === "media"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        Coerência {area.coerenciaPercentual}%
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-bat-text-secondary bg-bat-bg-secondary/50 rounded-lg p-2 leading-tight">
                    {area.explicacaoCoerencia}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DESEMPENHO POR DIFICULDADE (REVELADO APÓS O FIM) */}
      {resultado.desempenho_dificuldade && (
        <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
          <h2 className="heading mb-1 text-lg font-bold text-bat-text">
            Desempenho por Dificuldade
          </h2>
          <p className="mb-4 text-xs text-bat-text-muted">
            Veja sua precisão em cada nível de complexidade das questões deste simulado.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {resultado.desempenho_dificuldade.map((d) => {
              const cor =
                d.chave === "facil"
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                  : d.chave === "medio"
                  ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                  : "text-rose-400 border-rose-500/30 bg-rose-500/10";

              return (
                <div
                  key={d.chave}
                  className={`rounded-xl border p-3.5 text-center ${cor}`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">
                    {d.tipo}
                  </p>
                  <p className="heading text-2xl font-extrabold mt-1">
                    {d.acertos}/{d.total}
                  </p>
                  <p className="text-xs font-semibold mt-0.5 opacity-90">
                    {d.taxa}% de acertos
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* DESEMPENHO POR MATÉRIA */}
      {resultado.desempenho_materias && resultado.desempenho_materias.length > 0 && (
        <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
          <h2 className="heading mb-1 text-lg font-bold text-bat-text">
            Desempenho por Disciplina
          </h2>
          <p className="mb-4 text-xs text-bat-text-muted">
            Distribuição de aproveitamento pelas matérias cobradas na prova.
          </p>

          <div className="space-y-3">
            {resultado.desempenho_materias.map((m) => (
              <div key={m.materia_id} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-bat-text flex items-center gap-1.5">
                    <span>{m.emoji ?? "📖"}</span>
                    <span>{m.nome}</span>
                  </span>
                  <span className="text-bat-text-secondary">
                    {m.acertos}/{m.total} ({m.taxa}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-bat-bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${m.taxa}%`,
                      backgroundColor:
                        m.taxa >= 70 ? "#22C55E" : m.taxa >= 50 ? "#F5C518" : "#EF4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* REVISÃO COMPLETA QUESTÃO A QUESTÃO */}
      <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <h2 className="heading mb-1 text-lg font-bold text-bat-text">
          Revisão da Prova e Gabarito Comentado
        </h2>
        <p className="mb-4 text-xs text-bat-text-muted">
          Toque em uma questão para abrir o gabarito oficial, os passos de resolução
          e a explicação detalhada.
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {resultado.detalhes.map((d, i) => (
            <button
              key={d.questao_id}
              onClick={() => setRevisando(revisando === i ? null : i)}
              className={`h-8 w-8 cursor-pointer rounded-md text-[11px] font-bold transition-all ${
                revisando === i ? "ring-2 ring-bat-gold-400" : ""
              } ${
                d.correta
                  ? "bg-bat-success/20 text-bat-success"
                  : d.resposta_dada
                  ? "bg-bat-error/20 text-bat-error"
                  : "bg-bat-bg-secondary text-bat-text-muted"
              }`}
              title={d.correta ? "Acertou" : d.resposta_dada ? "Errou" : "Em branco"}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {revisando !== null && resultado.detalhes[revisando] && (
          <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded bg-bat-gold-400/20 px-2 py-0.5 text-xs font-bold text-bat-gold-400">
                Questão {revisando + 1}
              </span>
              {resultado.detalhes[revisando].materia_nome && (
                <span className="text-xs text-bat-text-muted">
                  {resultado.detalhes[revisando].materia_nome}
                </span>
              )}
              {resultado.detalhes[revisando].dificuldade && (
                <span className="text-[11px] font-medium text-bat-text-muted ml-auto uppercase">
                  Nível: {resultado.detalhes[revisando].dificuldade}
                </span>
              )}
            </div>

            <p className="mb-3 whitespace-pre-line text-sm leading-relaxed text-bat-text">
              <MathText>{resultado.detalhes[revisando].enunciado}</MathText>
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

function Ajuste({
  rotulo,
  valor,
  minimo,
  maximo,
  passo,
  sufixo,
  onChange,
}: {
  rotulo: string;
  valor: number;
  minimo: number;
  maximo: number;
  passo: number;
  sufixo: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-sm font-medium text-bat-text">{rotulo}</label>
        <span className="heading text-base font-bold tabular-nums text-bat-gold-400">
          {valor}{" "}
          <span className="text-[11px] font-normal text-bat-text-muted">
            {sufixo}
          </span>
        </span>
      </div>
      <input
        type="range"
        min={minimo}
        max={maximo}
        step={passo}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-bat-gold-400"
        aria-label={rotulo}
      />
      <div className="mt-0.5 flex justify-between text-[10px] text-bat-text-muted">
        <span>{minimo}</span>
        <span>{maximo}</span>
      </div>
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
