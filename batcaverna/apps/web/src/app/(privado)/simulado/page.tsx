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
import {
  lerProvaSalva,
  gravarProvaSalva,
  apagarProvaSalva,
} from "@/lib/prova-em-andamento";

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

interface MateriaOpcao {
  id: string;
  nome: string;
  icone_emoji: string | null;
  total_questoes: number;
}

/**
 * Formato real de cada banca — espelha FORMATO_OFICIAL do servidor.
 * Serve só para a tela mostrar o número antes de começar; quem decide é o
 * back-end.
 */
const FORMATO_OFICIAL: Record<string, { questoes: number; minutos: number }> = {
  EEAR: { questoes: 60, minutos: 240 },
  ESA: { questoes: 50, minutos: 240 },
  EPCAR: { questoes: 60, minutos: 240 },
  CN: { questoes: 60, minutos: 240 },
  EFOMM: { questoes: 40, minutos: 240 },
  EAM: { questoes: 50, minutos: 240 },
  ESPCEX: { questoes: 60, minutos: 240 },
  ENEM: { questoes: 45, minutos: 270 },
};

const MODOS = [
  { tipo: "rapido", rotulo: "Rápido", questoes: 10, minutos: 20, desc: "Aquecimento de 20 minutos" },
  { tipo: "oficial", rotulo: "Formato da banca", questoes: 60, minutos: 240, desc: "A prova como ela é" },
  { tipo: "erros", rotulo: "Refazer meus erros", questoes: 20, minutos: 50, desc: "Só o que você errou" },
  { tipo: "materia", rotulo: "Por matéria", questoes: 20, minutos: 40, desc: "Foco numa disciplina" },
  { tipo: "completo", rotulo: "Prova completa", questoes: 45, minutos: 150, desc: "Volume de treino" },
  { tipo: "personalizado", rotulo: "Personalizado", questoes: 20, minutos: 45, desc: "Você define tudo" },
];

/** Faixas aceitas pelo servidor (`/api/simulados/start`). Espelhadas aqui
 *  para a tela não deixar o aluno pedir algo que o back vai recortar calado. */
const LIMITES = { questoesMin: 5, questoesMax: 100, minutosMin: 5, minutosMax: 300 };

// ═══════════════════════════════════════════════════════════════
function Simulado() {
  const params = useSearchParams();
  const updateUser = useAuthStore((s) => s.updateUser);
  // A prova guardada no aparelho carrega o dono: sem isso, num computador
  // compartilhado o próximo aluno caía dentro da prova do anterior.
  const userId = useAuthStore((s) => s.user?.id ?? null);

  const [fase, setFase] = useState<"config" | "prova" | "resultado">("config");
  const [concursos, setConcursos] = useState<ConcursoOpcao[]>([]);
  // O `tipo` também vem da URL: os atalhos do card do concurso mandam
  // ?concurso=EEAR&tipo=rapido&auto=1 e a prova começa sozinha.
  const tipoDaUrl = params.get("tipo");
  const [config, setConfig] = useState({
    concurso: params.get("concurso") ?? "",
    tipo: MODOS.some((m) => m.tipo === tipoDaUrl) ? tipoDaUrl! : "rapido",
    materia_id: "",
    ano: "",
    total_questoes: 20,
    duracao_minutos: 45,
  });

  const [materias, setMaterias] = useState<MateriaOpcao[]>([]);
  const [anos, setAnos] = useState<number[]>([]);

  const [simuladoId, setSimuladoId] = useState<string | null>(null);
  const [questoes, setQuestoes] = useState<QuestaoSim[]>([]);
  const [indice, setIndice] = useState(0);
  /**
   * Quantas questões de cada matéria a prova recebeu.
   *
   * Só vem preenchido no "Formato da banca": lá a prova é repartida na
   * proporção real da banca, em vez de sorteada uniformemente. Mostrar isso
   * é parte do treino — o aluno precisa saber que caem 24 de Matemática e 6
   * de Inglês, não 15 de cada.
   */
  const [distribuicao, setDistribuicao] = useState<
    { materia: string; questoes: number }[] | null
  >(null);
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

  // ─── Matérias e anos do concurso escolhido ─────────────────
  // Sem isto o modo "Por matéria" era propaganda enganosa: mandava o tipo
  // 'materia' sem nenhum `materia_id`, e o servidor sorteava do concurso
  // inteiro — o aluno escolhia "foco numa disciplina" e recebia mistura.
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
        // Trocar de concurso invalida a matéria antes escolhida.
        setConfig((c) => ({ ...c, materia_id: "", ano: "" }));
      })
      .catch(() => undefined);

    return () => {
      cancelado = true;
    };
  }, [config.concurso]);

  // ─── Iniciar ───────────────────────────────────────────────
  const iniciar = useCallback(async () => {
    if (!config.concurso || ocupado) return;
    setOcupado(true);
    setErro(null);

    const modo = MODOS.find((m) => m.tipo === config.tipo)!;
    const personalizado = config.tipo === "personalizado";

    const quantidade = personalizado ? config.total_questoes : modo.questoes;
    const minutos = personalizado ? config.duracao_minutos : modo.minutos;

    try {
      const res = await fetchWithAuth("/api/simulados/start", {
        method: "POST",
        body: JSON.stringify({
          concurso: config.concurso,
          tipo: modo.tipo,
          total_questoes: quantidade,
          duracao_minutos: minutos,
          // Só vão quando fazem sentido: o back trata ausência como "todas".
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
      setSegundosRestantes(json.data.duracao_minutos * 60);
      setRespostas({});
      setIndice(0);
      // O relógio da prova é o do servidor: é ele que vale se a página
      // recarregar. Cai para o do cliente só se a resposta não trouxer.
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
      // Sinaliza estudo real: o simulado está em andamento.
      window.dispatchEvent(new Event("batcaverna_study_activity"));
    } catch {
      setErro("Falha de conexão ao iniciar o simulado.");
    } finally {
      setOcupado(false);
    }
  }, [config, ocupado]);

  // ─── Início automático (?auto=1) ───────────────────────────
  // O botão "Simulado rápido" do card do concurso cai aqui: o aluno pediu a
  // prova lá, não faria sentido cair numa tela de configuração de novo.
  // O ref garante que dispare uma única vez, mesmo com o catálogo chegando
  // depois e re-renderizando a tela.
  // ─── Retomar prova interrompida ────────────────────────────
  // Roda ANTES do auto-start (ordem de declaração = ordem de execução dos
  // efeitos), e o ref abaixo é o que impede o auto-start de montar uma
  // prova nova por cima da que estava em andamento.
  const restaurou = useRef(false);
  useEffect(() => {
    if (restaurou.current) return;
    // Só espera pelo usuário; sem ele não dá para saber se a prova é dele.
    if (!userId) return;
    // `lerProvaSalva` recusa (e apaga) a prova de outra conta.
    const salva = lerProvaSalva(userId);
    if (!salva) return;
    restaurou.current = true;

    const decorrido = Math.floor((Date.now() - new Date(salva.iniciadoEm).getTime()) / 1000);
    const restante = salva.duracaoMinutos * 60 - decorrido;

    setSimuladoId(salva.simuladoId);
    setQuestoes(salva.questoes);
    setDistribuicao(null);
    setRespostas(salva.respostas ?? {});
    // Volta para onde a pessoa parou. Antes era sempre 0: quem recarregava na
    // questão 47 de 60 voltava para a primeira e navegava tudo de novo.
    setIndice(
      Math.min(Math.max(0, salva.indice ?? 0), Math.max(0, salva.questoes.length - 1))
    );
    inicioProva.current = new Date(salva.iniciadoEm).getTime();
    // Tempo esgotado enquanto a aba estava fechada: entra com 1 s para o
    // cronômetro entregar a prova pelo caminho normal, com o que foi
    // respondido. Não devolve o tempo perdido — a prova real também não.
    setSegundosRestantes(Math.max(1, restante));
    setFase("prova");
    // Sinaliza estudo real: retomada de prova em andamento.
    window.dispatchEvent(new Event("batcaverna_study_activity"));
  }, [userId]);

  // Cada resposta marcada — e cada troca de questão — vai para o aparelho na
  // hora. É pouco dado (um mapa id -> letra e um número), então não há por que
  // adiar.
  useEffect(() => {
    if (fase !== "prova" || !simuladoId) return;
    const salva = lerProvaSalva(userId);
    if (!salva || salva.simuladoId !== simuladoId) return;
    gravarProvaSalva({ ...salva, respostas, indice });
  }, [fase, simuladoId, respostas, indice, userId]);

  const autoDisparado = useRef(false);
  useEffect(() => {
    if (params.get("auto") !== "1") return;
    if (restaurou.current) return;
    if (autoDisparado.current || fase !== "config" || !config.concurso) return;
    autoDisparado.current = true;
    iniciar();
  }, [params, fase, config.concurso, iniciar]);

  // ─── Finalizar ─────────────────────────────────────────────
  const finalizar = useCallback(async () => {
    if (!simuladoId || ocupado) return;
    setOcupado(true);
    // Nova tentativa começa sem o erro da anterior na tela.
    setErro(null);

    const tempo = Math.round((Date.now() - inicioProva.current) / 1000);

    try {
      const res = await fetchWithAuth(`/api/simulados/${simuladoId}/finalizar`, {
        method: "POST",
        body: JSON.stringify({ respostas, tempo_gasto_segundos: tempo }),
      });
      const json = await res.json();

      if (!json.success) {
        // A cópia local não corresponde a nenhuma prova aberta do usuário: ou
        // o servidor já a fechou (outra aba, outro aparelho), ou ela não
        // existe / não é dele — a rota devolve 404 "Simulado não encontrado".
        //
        // Antes só o primeiro caso limpava, porque a comparação procurava a
        // palavra "finalizado". No segundo, a prova morta era restaurada a
        // cada visita e o aluno ficava preso nela sem saída.
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
    const personalizado = config.tipo === "personalizado";
    const porMateria = config.tipo === "materia";
    const modoErros = config.tipo === "erros";
    const oficial = config.tipo === "oficial";

    const formato = FORMATO_OFICIAL[config.concurso?.toUpperCase()];
    const qtd = personalizado
      ? config.total_questoes
      : oficial && formato
      ? formato.questoes
      : modo.questoes;
    const min = personalizado
      ? config.duracao_minutos
      : oficial && formato
      ? formato.minutos
      : modo.minutos;

    // Quantas questões existem de fato no recorte escolhido. Prometer 45
    // questões de uma matéria que só tem 12 é frustrar o aluno na largada.
    const materiaEscolhida = materias.find((m) => m.id === config.materia_id);
    const disponiveis = materiaEscolhida
      ? materiaEscolhida.total_questoes
      : concursos.find((c) => c.sigla === config.concurso)?.total_questoes ?? 0;
    // No modo "erros" o pool é a lista de erros do próprio aluno, não o
    // banco do concurso: comparar com `disponiveis` daria um aviso falso.
    const vaiFaltar = !modoErros && disponiveis > 0 && disponiveis < qtd;

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
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
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
                    {m.tipo === "personalizado"
                      ? "Você escolhe"
                      : m.tipo === "erros"
                      ? "Até 20 dos seus erros"
                      : m.tipo === "oficial"
                      ? (() => {
                          const f = FORMATO_OFICIAL[config.concurso?.toUpperCase()];
                          return f
                            ? `${f.questoes} questões · ${f.minutos} min`
                            : "Formato da prova";
                        })()
                      : `${m.questoes} questões · ${m.minutos} min`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Matéria: obrigatória no modo "Por matéria", opcional no
                  personalizado ─── */}
          {(porMateria || personalizado) && (
            <div>
              <label className="mb-2 block text-sm font-medium text-bat-text">
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
              {porMateria && !config.materia_id && (
                <p className="mt-1.5 text-[11px] text-bat-warning">
                  Escolha uma matéria — sem isso a prova sai com todas
                  misturadas e o treino perde o foco.
                </p>
              )}
            </div>
          )}

          {/* ─── Ajustes finos ─── */}
          {personalizado && (
            <div className="space-y-4 rounded-xl border border-bat-gold-400/20 bg-bat-gold-400/5 p-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-bat-text">
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

          {modoErros && (
            <div className="rounded-xl border border-bat-gold-400/25 bg-bat-gold-400/5 px-4 py-3 text-xs leading-relaxed text-bat-text-secondary">
              🎯 A prova é montada só com questões que você{" "}
              <strong className="text-bat-gold-400">errou e ainda não refez</strong>.
              É o treino de maior rendimento que existe aqui — e o que quase
              ninguém faz sozinho, porque dói mais que resolver questão nova.
              Acertar aqui tira a questão da sua fila.
            </div>
          )}

          {oficial && (
            <div className="rounded-xl border border-bat-info/25 bg-bat-info/5 px-4 py-3 text-xs leading-relaxed text-bat-text-secondary">
              {formato ? (
                <>
                  📋 Formato real do {config.concurso}:{" "}
                  <strong className="text-bat-text">{formato.questoes} questões</strong>{" "}
                  em <strong className="text-bat-text">{Math.round(formato.minutos / 60)} horas</strong>.
                  Treinar no formato errado ensina um ritmo que não serve no dia
                  da prova.
                </>
              ) : (
                <>
                  📋 Ainda não tenho o formato oficial deste concurso cadastrado.
                  A prova sai no preset genérico — se você tiver o edital com a
                  quantidade de questões e a duração, me passe que eu cadastro.
                </>
              )}
            </div>
          )}

          <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/50 px-4 py-3 text-xs leading-relaxed text-bat-text-secondary">
            ⏱️ Você terá <strong className="text-bat-gold-400">{min} minutos</strong>{" "}
            para {qtd} questões — cerca de {Math.round((min * 60) / qtd)} segundos
            por questão. Quando o tempo acabar, a prova é entregue
            automaticamente.
            {vaiFaltar && (
              <span className="mt-2 block text-bat-warning">
                ⚠️ Este recorte tem {disponiveis.toLocaleString("pt-BR")} questões
                cadastradas. A prova virá com {disponiveis} em vez de {qtd}.
              </span>
            )}
          </div>

          <button
            onClick={iniciar}
            disabled={
              !config.concurso || ocupado || (porMateria && !config.materia_id)
            }
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
        {/* Falha ao entregar.
            O bloco de erro só existia na tela de configuração. Uma queda de
            rede na hora de entregar não mostrava NADA: o botão voltava a ficar
            clicável e o aluno concluía que estava quebrado — depois de 60
            questões. É o pior momento possível para um erro mudo. */}
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

        {/* Como a banca reparte a prova.
            Só aparece no "Formato da banca", e some depois da primeira
            questão respondida — é informação de largada, não de percurso. */}
        {distribuicao && distribuicao.length > 0 && respondidas === 0 && (
          <div className="mb-4 rounded-xl border border-bat-gold-400/25 bg-bat-gold-400/5 px-4 py-3">
            <p className="mb-2 text-xs font-bold text-bat-gold-400">
              📐 Esta prova está repartida como a da banca
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {distribuicao.map((d) => (
                <span key={d.materia} className="text-xs text-bat-text-secondary">
                  {d.materia}{" "}
                  <strong className="text-bat-text">{d.questoes}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

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
              apagarProvaSalva();
              restaurou.current = false;
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

/** Deslizador + número, para os ajustes do modo personalizado. */
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
