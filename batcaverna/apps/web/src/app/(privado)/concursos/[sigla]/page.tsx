"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/stores/auth-store";

// ─── Contratos ───────────────────────────────────────────────
interface MateriaResumo {
  id: string;
  nome: string;
  icone_emoji: string | null;
  total_questoes: number;
}

interface TafItem {
  sexo: string;
  exercicio: string;
  unidade: string;
  minimo_aprovacao: string;
  faixa_etaria: string | null;
  observacao: string | null;
  ano_edital: number | null;
}

interface ConcursoDetalhe {
  id: string;
  nome: string;
  sigla: string;
  descricao: string | null;
  forca: string;
  emoji: string | null;
  cor_tema: string | null;
  tem_taf: boolean;
  orgao: string | null;
  escolaridade: string | null;
  faixa_etaria: string | null;
  duracao_curso: string | null;
  etapas: string | null;
  edital_url: string | null;
  edital_ano: number | null;
  imagem_fundo_url: string | null;
  materias: MateriaResumo[];
  anos: number[];
  total_questoes: number;
  taf: TafItem[];
  progresso: {
    respondidas: number;
    acertos: number;
    taxa: number;
    favoritado: boolean;
  } | null;
}

const NOME_FORCA: Record<string, string> = {
  aeronautica: "Aeronáutica",
  marinha: "Marinha",
  exercito: "Exército",
  enem: "Vestibular",
};

/** "para a EEAR" vs "para o ENEM" — pequeno, mas evita texto capenga. */
function artigo(sigla: string): string {
  return ["EEAR", "ESA", "EAM", "EFOMM", "EPCAR", "ESPCEX"].includes(
    sigla.toUpperCase()
  )
    ? "a"
    : "o";
}

export default function ConcursoPage() {
  const params = useParams();
  const router = useRouter();
  const sigla = String(params?.sigla ?? "").toUpperCase();

  const [concurso, setConcurso] = useState<ConcursoDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [gerandoSimulado, setGerandoSimulado] = useState(false);
  const [isAlvo, setIsAlvo] = useState(false);
  const [salvandoAlvo, setSalvandoAlvo] = useState(false);
  const [msgAlvo, setMsgAlvo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const [resConcurso, resFav] = await Promise.all([
          fetchWithAuth(`/api/concursos/${sigla}`),
          fetchWithAuth("/api/usuarios/me/concursos-favoritos"),
        ]);
        const json = await resConcurso.json();
        if (json.success) setConcurso(json.data);
        else setErro(json.error ?? "Concurso não encontrado");

        if (resFav.ok) {
          const jsonFav = await resFav.json();
          if (jsonFav?.success && Array.isArray(jsonFav.data) && jsonFav.data.length > 0) {
            setIsAlvo(jsonFav.data[0]?.toUpperCase() === sigla.toUpperCase());
          }
        }
      } catch {
        setErro("Não consegui carregar este concurso.");
      } finally {
        setCarregando(false);
      }
    };
    if (sigla) carregar();
  }, [sigla]);

  const definirComoAlvo = async () => {
    if (!concurso) return;
    setSalvandoAlvo(true);
    try {
      // Buscar favoritos atuais e mover este para o topo
      const resAtuais = await fetchWithAuth("/api/usuarios/me/concursos-favoritos");
      const jsonAtuais = await resAtuais.json();
      const atuais: string[] = jsonAtuais?.success && Array.isArray(jsonAtuais.data) ? jsonAtuais.data : [];
      const novaLista = [concurso.sigla, ...atuais.filter((s) => s.toUpperCase() !== concurso.sigla.toUpperCase())];

      const res = await fetchWithAuth("/api/usuarios/me/concursos-favoritos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concursos: novaLista }),
      });
      const json = await res.json();
      if (json.success) {
        setIsAlvo(true);
        setMsgAlvo("🎯 Este concurso agora é seu Alvo Principal! A caverna inteira se adaptou para sua aprovação.");
        setTimeout(() => setMsgAlvo(null), 6000);
      }
    } catch {
      // Ignora erro de rede
    } finally {
      setSalvandoAlvo(false);
    }
  };

  /**
   * Simulado rápido já no contexto do concurso em que o aluno está.
   *
   * Antes esta função chamava /api/simulados/start aqui e redirecionava para
   * `/simulado?id=<uuid>`. A tela de simulado nunca leu esse `id`: ela só
   * conhece `concurso`. O aluno era jogado na tela de configuração como se
   * nada tivesse acontecido — e a prova recém-criada ficava órfã no banco,
   * sem nenhuma resposta, sujando o histórico e as estatísticas.
   *
   * Agora quem monta a prova é a própria tela de simulado, que já sabe fazer
   * isso: mandamos o contexto pela URL e ela inicia sozinha com `auto=1`.
   */
  const iniciarSimuladoRapido = () => {
    if (!concurso || gerandoSimulado) return;
    setGerandoSimulado(true);
    router.push(
      `/simulado?concurso=${encodeURIComponent(concurso.sigla)}&tipo=rapido&auto=1`
    );
  };

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-44 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!concurso) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-bat-text-secondary">
          {erro ?? "Concurso não encontrado."}
        </p>
        <Link
          href="/concursos"
          className="mt-4 inline-block text-bat-gold-400 no-underline hover:underline"
        >
          ← Voltar aos concursos
        </Link>
      </div>
    );
  }

  const cor = concurso.cor_tema ?? "#F5C518";
  const art = artigo(concurso.sigla);

  // ─── Cards de ação ─────────────────────────────────────────
  // `precisaQuestoes` marca o que não funciona sem banco de questões.
  // EAM, EsPCEx e IME ainda estão com zero: o botão de simulado já se
  // desabilitava sozinho, mas os cards levavam a telas vazias — um beco
  // sem saída que parecia defeito. Agora eles dizem o que falta.
  const cards: {
    icon: string;
    titulo: string;
    desc: string;
    href: string;
    cor: string;
    selo?: string;
    precisaQuestoes?: boolean;
  }[] = [
    {
      icon: "📖",
      titulo: `Começar a estudar para ${art} ${concurso.sigla}`,
      desc: "Trilha completa: teoria escrita, vídeo-aulas e assuntos na ordem do edital.",
      href: `/concursos/${concurso.sigla.toLowerCase()}/trilha`,
      cor,
    },
    {
      icon: "❓",
      titulo: `Banco de Questões ${concurso.sigla}`,
      desc: concurso.total_questoes
        ? `${concurso.total_questoes.toLocaleString("pt-BR")} questões oficiais com gabarito comentado.`
        : "Questões oficiais com gabarito comentado e resolução passo a passo.",
      href: `/questoes?concurso=${concurso.sigla}`,
      cor: "#F5C518",
      precisaQuestoes: true,
      selo: concurso.total_questoes
        ? `${concurso.total_questoes.toLocaleString("pt-BR")} questões`
        : undefined,
    },
    {
      icon: "📋",
      titulo: `Assuntos que caem n${art} ${concurso.sigla}`,
      desc: "Tudo que já foi cobrado nas provas oficiais, na ordem do que mais aparece — com o seu desempenho em cada assunto.",
      href: `/concursos/${concurso.sigla.toLowerCase()}/assuntos`,
      cor: "#06B6D4",
      precisaQuestoes: true,
    },
    {
      icon: "💡",
      titulo: `Bizus Estratégicos ${concurso.sigla}`,
      desc: "Macetes e fórmulas de alto impacto das matérias que caem nesta prova, mais os macetes próprios da banca.",
      href: `/bizus?concurso=${concurso.sigla}`,
      cor: "#A855F7",
    },
    {
      icon: "⏱️",
      titulo: `Simulado ${concurso.sigla}`,
      desc: "Prova cronometrada nos moldes da banca, com correção e análise ao final.",
      href: `/simulado?concurso=${concurso.sigla}`,
      cor: "#EF4444",
      precisaQuestoes: true,
    },
    {
      icon: "📊",
      titulo: `Minhas Estatísticas no ${concurso.sigla}`,
      desc: concurso.progresso?.respondidas
        ? `${concurso.progresso.respondidas} questões respondidas · ${concurso.progresso.taxa}% de acerto.`
        : "Acompanhe acertos por matéria, evolução e pontos fracos.",
      href: `/concursos/${concurso.sigla.toLowerCase()}/estatisticas`,
      cor: "#22C55E",
      precisaQuestoes: true,
    },
  ];

  if (concurso.tem_taf && concurso.taf.length > 0) {
    cards.push({
      icon: "🏃",
      titulo: `TAF do ${concurso.sigla}`,
      desc: "Índices mínimos de aprovação no teste físico, por exercício e sexo.",
      href: `/concursos/${concurso.sigla.toLowerCase()}/taf`,
      cor: "#F97316",
    });
  }

  return (
    <div>
      {/* ═══════════ CABEÇALHO ═══════════ */}
      <header className="relative mb-8 overflow-hidden rounded-3xl border border-bat-border bg-bat-bg-card shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage: `url(${concurso.imagem_fundo_url || `/images/concursos/${concurso.sigla.toLowerCase()}.jpg`})`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40" />

        <div className="relative p-6 sm:p-8">
          <Link
            href="/concursos"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-bat-text-muted no-underline transition-colors hover:text-bat-gold-400"
          >
            ← Voltar a todos os concursos
          </Link>

          {msgAlvo && (
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-bat-gold-400/50 bg-bat-gold-400/20 px-4 py-3 text-sm font-semibold text-bat-gold-400 shadow-xl animate-fadeIn">
              <div className="flex items-center gap-2">
                <span>🦇</span>
                <span>{msgAlvo}</span>
              </div>
              <button
                onClick={() => setMsgAlvo(null)}
                className="cursor-pointer text-xs text-bat-text-muted hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border text-4xl shadow-xl backdrop-blur-md"
              style={{ background: `${cor}20`, borderColor: `${cor}50` }}
            >
              {concurso.emoji ?? "🎯"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="heading text-3xl font-bold text-bat-text sm:text-4xl">
                  {concurso.sigla}
                </h1>
                <span
                  className="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm"
                  style={{
                    background: `${cor}25`,
                    color: cor,
                    borderColor: `${cor}40`,
                  }}
                >
                  {NOME_FORCA[concurso.forca] ?? concurso.forca}
                </span>

                {/* Botão / Selo de Concurso Alvo Decidido pelo Aluno */}
                {isAlvo ? (
                  <span className="rounded-full border border-bat-gold-400/80 bg-bat-gold-400/25 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-bat-gold-400 shadow-[0_0_15px_rgba(245,197,24,0.35)] flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>Seu Alvo Principal</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={definirComoAlvo}
                    disabled={salvandoAlvo}
                    className="cursor-pointer rounded-full border border-bat-gold-400/50 bg-bat-gold-400/15 hover:bg-bat-gold-400 hover:text-black px-3.5 py-1 text-xs font-bold text-bat-gold-400 transition-all shadow-md flex items-center gap-1.5"
                    title="Configurar este concurso como o foco principal da sua preparação"
                  >
                    <span>🎯</span>
                    <span>{salvandoAlvo ? "Definindo..." : "Definir como meu Concurso Alvo"}</span>
                  </button>
                )}
              </div>
              <p className="mt-1 max-w-xl text-base text-bat-text-secondary">
                {concurso.nome}
              </p>

              {/* Dados do edital */}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-bat-text-muted">
                {concurso.escolaridade && <span>🎓 {concurso.escolaridade}</span>}
                {concurso.faixa_etaria && <span>🎂 {concurso.faixa_etaria}</span>}
                {concurso.duracao_curso && <span>⏳ {concurso.duracao_curso}</span>}
                {concurso.orgao && <span>🛡️ {concurso.orgao}</span>}
              </div>

              {/* Referência do edital — o aluno precisa saber de quando é a
                  base do que está estudando, e poder conferir na fonte. Um
                  ano gravado no banco vale mais que a promessa de estar
                  "atualizado". */}
              {(concurso.edital_ano || concurso.edital_url) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {concurso.edital_ano && (
                    <span className="rounded-lg border border-bat-border bg-black/40 px-2.5 py-1 text-[11px] text-bat-text-secondary backdrop-blur-sm">
                      📅 Base: provas oficiais até{" "}
                      <strong className="text-bat-gold-400">
                        {concurso.edital_ano}
                      </strong>
                    </span>
                  )}
                  {concurso.edital_url && (
                    <a
                      href={concurso.edital_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-bat-gold-400/30 bg-bat-gold-400/10 px-2.5 py-1 text-[11px] font-semibold text-bat-gold-400 no-underline backdrop-blur-sm transition-colors hover:bg-bat-gold-400/20"
                    >
                      🔗 Edital e site oficial ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ação rápida em destaque */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={iniciarSimuladoRapido}
              disabled={gerandoSimulado || concurso.total_questoes < 5}
              className="btn-primary px-6 py-3 text-sm disabled:opacity-40"
              title={
                concurso.total_questoes < 5
                  ? "Ainda não há questões suficientes cadastradas"
                  : undefined
              }
            >
              {gerandoSimulado
                ? "Montando seu simulado..."
                : `⚡ Simulado rápido de ${concurso.sigla} (10 questões)`}
            </button>
            <Link
              href={`/questoes?concurso=${concurso.sigla}`}
              className="btn-secondary px-6 py-3 text-sm no-underline"
            >
              Resolver questões avulsas
            </Link>
          </div>

          {erro && (
            <p className="mt-3 text-xs text-bat-error">{erro}</p>
          )}
        </div>
      </header>

      {/* ═══════════ ETAPAS DO CONCURSO ═══════════ */}
      {concurso.etapas && (
        <section className="mb-8 rounded-2xl border border-bat-border bg-bat-bg-card p-5">
          <h2 className="heading mb-3 text-sm font-bold uppercase tracking-wider text-bat-text-secondary">
            Como é o processo seletivo
          </h2>
          <div className="flex flex-wrap gap-2">
            {concurso.etapas.split("·").map((etapa, i) => (
              <span
                key={i}
                className="rounded-xl border border-bat-border bg-bat-bg-secondary px-3 py-1.5 text-xs text-bat-text-secondary"
              >
                <strong className="text-bat-gold-400">{i + 1}.</strong>{" "}
                {etapa.trim()}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ CARDS ═══════════ */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, i) => {
          // Sem questões cadastradas, estes cards levam a telas vazias. Vira
          // um bloco inerte que EXPLICA o motivo, em vez de um link que
          // parece quebrado.
          const bloqueado = !!card.precisaQuestoes && !concurso.total_questoes;

          const classe = `group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-3xl border border-bat-border bg-bat-bg-card p-6 no-underline transition-all duration-300 ${
            bloqueado
              ? "cursor-not-allowed opacity-55"
              : "hover:scale-[1.02] hover:border-bat-gold-400/50 hover:shadow-[0_0_25px_rgba(245,197,24,0.15)]"
          }`;

          const miolo = (
            <>
            <div
              className="absolute bottom-0 left-0 top-0 w-1.5 opacity-60 transition-opacity group-hover:opacity-100"
              style={{ background: card.cor }}
            />

            <div className="relative z-10 pl-2">
              <div className="mb-3 flex items-start justify-between">
                <span className="text-3xl">{card.icon}</span>
                {card.selo && (
                  <span
                    className="rounded-lg border px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      color: card.cor,
                      borderColor: `${card.cor}40`,
                      background: `${card.cor}15`,
                    }}
                  >
                    {card.selo}
                  </span>
                )}
              </div>
              <h3 className="heading mb-2 text-base font-bold text-bat-text transition-colors group-hover:text-bat-gold-400">
                {card.titulo}
              </h3>
              <p className="text-xs leading-relaxed text-bat-text-secondary">
                {card.desc}
              </p>
            </div>

            <div className="relative z-10 mt-4 flex justify-end">
              {bloqueado ? (
                <span className="text-xs font-medium text-bat-text-muted">
                  Sem questões cadastradas ainda
                </span>
              ) : (
                <span className="flex translate-x-[-6px] items-center gap-1 text-xs font-bold text-bat-gold-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                  Acessar →
                </span>
              )}
            </div>
            </>
          );

          // Dois ramos explícitos em vez de um componente escolhido em tempo
          // de execução: `bloqueado ? "div" : Link` deixa o tipo do elemento
          // como união, e as props de cada lado não são as mesmas.
          return bloqueado ? (
            <div key={i} aria-disabled className={classe}>
              {miolo}
            </div>
          ) : (
            <Link key={i} href={card.href} className={classe}>
              {miolo}
            </Link>
          );
        })}
      </div>

      {/* ═══════════ MATÉRIAS COBRADAS ═══════════ */}
      {concurso.materias.length > 0 && (
        <section className="mt-8">
          <h2 className="heading mb-4 text-lg text-bat-text">
            Matérias cobradas n{art} {concurso.sigla}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {concurso.materias.map((m) => (
              <Link
                key={m.id}
                href={`/questoes?concurso=${concurso.sigla}&materia=${encodeURIComponent(m.nome)}`}
                className="rounded-xl border border-bat-border bg-bat-bg-card px-4 py-3 no-underline transition-all hover:border-bat-gold-400/40"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.icone_emoji ?? "📚"}</span>
                  <span className="truncate text-sm font-medium text-bat-text">
                    {m.nome}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-bat-text-muted">
                  {m.total_questoes > 0
                    ? `${m.total_questoes.toLocaleString("pt-BR")} questões`
                    : "Em construção"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
