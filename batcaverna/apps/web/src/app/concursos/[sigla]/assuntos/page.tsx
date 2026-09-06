"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Assuntos cobrados no concurso.
 *
 * A lista sai das PROVAS OFICIAIS já importadas, não de uma transcrição do
 * conteúdo programático. O edital diz o que *pode* cair e trata tudo como
 * igual; a prova diz o que *cai* e quanto. Saber que Geometria Plana
 * apareceu 79 vezes e Números Complexos 4 muda onde o aluno investe a
 * próxima hora — a lista do edital, não.
 *
 * Quando o aluno está logado, cada assunto mostra também o desempenho dele
 * ali. É isso que transforma a lista num plano de ataque.
 */

interface Assunto {
  id: string | null;
  nome: string;
  total_questoes: number;
  primeiro_ano: number | null;
  ultimo_ano: number | null;
  anos_distintos: number;
  taxa_comunidade: number | null;
  meu_total: number;
  meus_acertos: number;
  minha_taxa: number | null;
}

interface Materia {
  id: string | null;
  nome: string;
  emoji: string | null;
  total_questoes: number;
  assuntos: Assunto[];
}

interface Dados {
  concurso: {
    sigla: string;
    nome: string;
    emoji: string | null;
    cor_tema: string | null;
    edital_url: string | null;
    etapas: string | null;
  };
  materias: Materia[];
  resumo: {
    total_questoes: number;
    total_assuntos: number;
    total_materias: number;
    logado: boolean;
  };
}

type Ordem = "frequencia" | "meu_ponto_fraco";

export default function AssuntosPage() {
  const params = useParams();
  const sigla = String(params?.sigla ?? "").toUpperCase();

  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<Ordem>("frequencia");
  const [abertas, setAbertas] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sigla) return;
    fetchWithAuth(`/api/concursos/${sigla}/assuntos`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setDados(j.data);
          // A matéria com mais questões já abre.
          if (j.data.materias[0]) {
            setAbertas(new Set([j.data.materias[0].nome]));
          }
        } else {
          setErro(j.error ?? "Concurso não encontrado.");
        }
      })
      .catch(() => setErro("Não consegui carregar os assuntos."))
      .finally(() => setCarregando(false));
  }, [sigla]);

  const alternar = (nome: string) =>
    setAbertas((s) => {
      const nova = new Set(s);
      nova.has(nome) ? nova.delete(nome) : nova.add(nome);
      return nova;
    });

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-28 w-full rounded-3xl" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!dados) {
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

  const cor = dados.concurso.cor_tema ?? "#F5C518";
  const { resumo } = dados;

  // Ordena as matérias conforme o modo escolhido.
  const materias = [...dados.materias].sort((a, b) => {
    if (ordem === "frequencia") return b.total_questoes - a.total_questoes;
    const fraco = (m: Materia) => {
      const comNota = m.assuntos.filter((x) => x.minha_taxa !== null);
      if (!comNota.length) return 999; // sem dado meu vai para o fim
      return (
        comNota.reduce((s, x) => s + (x.minha_taxa ?? 0), 0) / comNota.length
      );
    };
    return fraco(a) - fraco(b);
  });

  return (
    <div>
      {/* ═══════════ CABEÇALHO ═══════════ */}
      <header className="mb-6 rounded-3xl border border-bat-border bg-bat-bg-card p-6">
        <Link
          href={`/concursos/${sigla.toLowerCase()}`}
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-bat-text-muted no-underline transition-colors hover:text-bat-gold-400"
        >
          ← Voltar para {dados.concurso.sigla}
        </Link>

        <h1 className="heading flex flex-wrap items-center gap-2 text-2xl font-bold text-bat-text sm:text-3xl">
          {dados.concurso.emoji && <span>{dados.concurso.emoji}</span>}
          <span style={{ color: cor }}>{dados.concurso.sigla}</span>
          <span className="text-bat-text-muted">—</span>
          <span>Assuntos cobrados</span>
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-bat-text-secondary">
          Tudo que já caiu nas provas oficiais deste concurso, na ordem do que
          mais aparece. Diferente da lista do edital — que trata todo assunto
          como igual — aqui você vê{" "}
          <strong className="text-bat-gold-400">quantas vezes cada um caiu</strong>{" "}
          e em quais anos.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Numero valor={resumo.total_assuntos} rotulo="assuntos" />
          <Numero valor={resumo.total_materias} rotulo="matérias" />
          <Numero valor={resumo.total_questoes} rotulo="questões" />
        </div>

        {dados.concurso.edital_url && (
          <a
            href={dados.concurso.edital_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-bat-text-muted no-underline transition-colors hover:text-bat-gold-400"
          >
            📄 Conteúdo programático oficial no site do concurso ↗
          </a>
        )}
      </header>

      {/* ═══════════ ORDENAÇÃO ═══════════ */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Aba
          ativa={ordem === "frequencia"}
          onClick={() => setOrdem("frequencia")}
        >
          🔥 O que mais cai
        </Aba>
        {resumo.logado && (
          <Aba
            ativa={ordem === "meu_ponto_fraco"}
            onClick={() => setOrdem("meu_ponto_fraco")}
          >
            🎯 Meus pontos fracos
          </Aba>
        )}
      </div>

      {/* ═══════════ LISTA ═══════════ */}
      {materias.length === 0 ? (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
          <span className="mb-3 block text-4xl">🦇</span>
          <h2 className="heading mb-2 text-lg text-bat-text">
            Nenhuma prova de {sigla} cadastrada ainda
          </h2>
          <p className="mx-auto max-w-md text-sm text-bat-text-secondary">
            Esta lista se monta sozinha assim que a primeira prova oficial for
            importada pelo painel.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {materias.map((m) => {
            const aberta = abertas.has(m.nome);
            const fatia = resumo.total_questoes
              ? Math.round((m.total_questoes / resumo.total_questoes) * 100)
              : 0;

            return (
              <section
                key={m.nome}
                className="overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card"
              >
                <button
                  onClick={() => alternar(m.nome)}
                  className="flex w-full cursor-pointer items-center gap-3 p-4 text-left transition-colors hover:bg-bat-bg-elevated"
                  aria-expanded={aberta}
                >
                  <span className="text-2xl">{m.emoji ?? "📚"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h2 className="heading text-base font-bold text-bat-text">
                        {m.nome}
                      </h2>
                      <span className="text-xs text-bat-text-muted">
                        {m.assuntos.length} assuntos ·{" "}
                        {m.total_questoes.toLocaleString("pt-BR")} questões ·{" "}
                        {fatia}% da prova
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bat-bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${fatia}%`, background: cor }}
                      />
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-bat-text-muted transition-transform ${
                      aberta ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {aberta && (
                  <div className="border-t border-bat-border/60 p-3">
                    <div className="space-y-1.5">
                      {m.assuntos.map((a) => (
                        <Link
                          key={`${a.id ?? a.nome}`}
                          href={`/questoes?concurso=${sigla}&materia=${encodeURIComponent(
                            m.nome
                          )}`}
                          className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 no-underline transition-all hover:border-bat-gold-400/30 hover:bg-bat-bg-secondary"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-bat-text">
                              {a.nome}
                            </p>
                            <p className="mt-0.5 text-[11px] text-bat-text-muted">
                              {a.total_questoes}{" "}
                              {a.total_questoes === 1 ? "questão" : "questões"}
                              {a.primeiro_ano && a.ultimo_ano && (
                                <>
                                  {" · "}
                                  {a.primeiro_ano === a.ultimo_ano
                                    ? a.primeiro_ano
                                    : `${a.primeiro_ano}–${a.ultimo_ano}`}
                                </>
                              )}
                              {a.anos_distintos > 2 && (
                                <span className="ml-1 text-bat-gold-400">
                                  · caiu em {a.anos_distintos} anos
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Meu desempenho neste assunto */}
                          {a.minha_taxa !== null ? (
                            <span
                              className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold ${
                                a.minha_taxa < 50
                                  ? "bg-bat-error/10 text-bat-error"
                                  : a.minha_taxa < 75
                                  ? "bg-bat-warning/10 text-bat-warning"
                                  : "bg-bat-success/10 text-bat-success"
                              }`}
                              title={`Você acertou ${a.meus_acertos} de ${a.meu_total}`}
                            >
                              você {a.minha_taxa}%
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-lg bg-bat-bg-secondary px-2 py-1 text-[11px] text-bat-text-muted">
                              inédito
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* ═══════════ NOTA DE PROCEDÊNCIA ═══════════ */}
      <p className="mt-6 rounded-xl border border-bat-border bg-bat-bg-secondary/50 px-4 py-3 text-xs leading-relaxed text-bat-text-muted">
        Esta lista é contada a partir das provas oficiais já cadastradas na
        plataforma — não é uma transcrição do conteúdo programático. Assunto
        que o edital prevê mas que nunca caiu nas provas importadas ainda não
        aparece aqui. Para a relação oficial completa, use o link do edital
        no topo.
      </p>
    </div>
  );
}

// ─── Auxiliares ──────────────────────────────────────────────
function Numero({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div className="rounded-xl border border-bat-border bg-bat-bg-secondary px-3 py-2.5 text-center">
      <p className="heading text-xl font-bold text-bat-gold-400">
        {valor.toLocaleString("pt-BR")}
      </p>
      <p className="text-[11px] text-bat-text-muted">{rotulo}</p>
    </div>
  );
}

function Aba({
  ativa,
  onClick,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
        ativa
          ? "bg-bat-gold-400 text-black"
          : "border border-bat-border text-bat-text-muted hover:text-bat-text"
      }`}
    >
      {children}
    </button>
  );
}
