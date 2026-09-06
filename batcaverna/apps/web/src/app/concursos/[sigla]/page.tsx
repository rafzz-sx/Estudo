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
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const res = await fetchWithAuth(`/api/concursos/${sigla}`);
        const json = await res.json();
        if (json.success) setConcurso(json.data);
        else setErro(json.error ?? "Concurso não encontrado");
      } catch {
        setErro("Não consegui carregar este concurso.");
      } finally {
        setCarregando(false);
      }
    };
    if (sigla) carregar();
  }, [sigla]);

  /** Simulado rápido já no contexto do concurso em que o aluno está. */
  const iniciarSimuladoRapido = async () => {
    if (!concurso || gerandoSimulado) return;
    setGerandoSimulado(true);
    try {
      const res = await fetchWithAuth("/api/simulados/start", {
        method: "POST",
        body: JSON.stringify({
          concurso_id: concurso.id,
          tipo: "rapido",
          total_questoes: 10,
          duracao_minutos: 20,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.simulado_id) {
        router.push(`/simulado?id=${json.data.simulado_id}`);
      } else {
        setErro(json.error ?? "Não consegui montar o simulado agora.");
      }
    } catch {
      setErro("Falha de conexão ao montar o simulado.");
    } finally {
      setGerandoSimulado(false);
    }
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
  const cards = [
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
    },
    {
      icon: "💡",
      titulo: `Bizus Estratégicos ${concurso.sigla}`,
      desc: "Macetes, atalhos e fórmulas de alto impacto para a prova desta banca.",
      href: `/bizus?concurso=${concurso.sigla}`,
      cor: "#A855F7",
    },
    {
      icon: "⏱️",
      titulo: `Simulado ${concurso.sigla}`,
      desc: "Prova cronometrada nos moldes da banca, com correção e análise ao final.",
      href: `/simulado?concurso=${concurso.sigla}`,
      cor: "#EF4444",
    },
    {
      icon: "📊",
      titulo: `Minhas Estatísticas no ${concurso.sigla}`,
      desc: concurso.progresso?.respondidas
        ? `${concurso.progresso.respondidas} questões respondidas · ${concurso.progresso.taxa}% de acerto.`
        : "Acompanhe acertos por matéria, evolução e pontos fracos.",
      href: `/concursos/${concurso.sigla.toLowerCase()}/estatisticas`,
      cor: "#22C55E",
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
        {concurso.imagem_fundo_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url(${concurso.imagem_fundo_url})` }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />

        <div className="relative p-6 sm:p-8">
          <Link
            href="/concursos"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-bat-text-muted no-underline transition-colors hover:text-bat-gold-400"
          >
            ← Voltar a todos os concursos
          </Link>

          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border text-4xl shadow-xl backdrop-blur-md"
              style={{ background: `${cor}20`, borderColor: `${cor}50` }}
            >
              {concurso.emoji ?? "🎯"}
            </div>

            <div className="min-w-0">
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
        {cards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-3xl border border-bat-border bg-bat-bg-card p-6 no-underline transition-all duration-300 hover:scale-[1.02] hover:border-bat-gold-400/50 hover:shadow-[0_0_25px_rgba(245,197,24,0.15)]"
          >
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
              <span className="flex translate-x-[-6px] items-center gap-1 text-xs font-bold text-bat-gold-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                Acessar →
              </span>
            </div>
          </Link>
        ))}
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
