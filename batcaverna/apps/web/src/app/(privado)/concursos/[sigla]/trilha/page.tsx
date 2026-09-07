"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/stores/auth-store";
import { Markdown } from "@/components/Markdown";
import { VideoAulaPlayer, type VideoAula } from "@/components/VideoAulaPlayer";

// ─── Contratos ───────────────────────────────────────────────
interface TeoriaResumo {
  id: string;
  tema: string;
  titulo: string;
  resumo: string | null;
  nivel: string;
  tempo_leitura_min: number;
  concluido: boolean;
}

interface Tema {
  tema: string;
  teoria: TeoriaResumo[];
  videos: VideoAula[];
}

interface MateriaTrilha {
  id: string;
  nome: string;
  descricao: string | null;
  icone_emoji: string | null;
  total_questoes: number;
  progresso: { respondidas: number; taxa: number };
  temas: Tema[];
  assuntos_mais_cobrados: { id: string; nome: string; total_questoes: number }[];
}

interface Trilha {
  concurso: { sigla: string; nome: string; emoji: string | null; cor_tema: string | null };
  materias: MateriaTrilha[];
  total_questoes: number;
}

// `useSearchParams` exige uma fronteira de Suspense no App Router: sem ela o
// build do Next falha com "should be wrapped in a suspense boundary". Mesmo
// padrão das telas de simulado e de questões.
function Trilha() {
  const params = useParams();
  const sigla = String(params?.sigla ?? "").toUpperCase();
  const params_ = useSearchParams();

  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [materiaAberta, setMateriaAberta] = useState<string | null>(null);
  const [teoriaAberta, setTeoriaAberta] = useState<{
    id: string;
    titulo: string;
    corpo_markdown: string;
    tempo_leitura_min: number;
  } | null>(null);
  const [carregandoTeoria, setCarregandoTeoria] = useState(false);

  // "A trilha não carregou" e "este concurso ainda não tem conteúdo" eram a
  // MESMA tela: o `.catch(() => undefined)` engolia a falha e caía no estado
  // vazio. O aluno com internet instável concluía que o conteúdo não existe e
  // não tentava de novo — e é plausível, porque EAM, EsPCEx e IME realmente
  // não têm questões ainda.
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    setFalhou(false);
    fetchWithAuth(`/api/concursos/${sigla}/trilha`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setTrilha(json.data);
          setMateriaAberta(json.data.materias[0]?.id ?? null);
        } else {
          setFalhou(true);
        }
      })
      .catch(() => setFalhou(true))
      .finally(() => setCarregando(false));
  }, [sigla]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // O radar de fraqueza manda o aluno para cá com ?teoria=<id>: abrir o texto
  // sozinho é o que fecha o caminho "você erra isto -> leia aquilo". Sem
  // isto, ele cairia na trilha inteira e teria de procurar o assunto na mão.
  const teoriaDaUrl = params_.get("teoria");
  const abriuDaUrl = useRef(false);

  useEffect(() => {
    if (!teoriaDaUrl || abriuDaUrl.current || carregando) return;
    abriuDaUrl.current = true;
    abrirTeoria(teoriaDaUrl);
    // `abrirTeoria` é estável dentro do componente e não entra nas deps de
    // propósito: incluí-la reabriria o modal a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teoriaDaUrl, carregando]);

  const abrirTeoria = async (id: string) => {
    setCarregandoTeoria(true);
    try {
      const res = await fetchWithAuth(`/api/teoria/${id}`);
      const json = await res.json();
      if (json.success) setTeoriaAberta(json.data);
    } catch {
      /* silencioso: o modal simplesmente não abre */
    } finally {
      setCarregandoTeoria(false);
    }
  };

  const marcarLida = async (id: string) => {
    await fetchWithAuth(`/api/teoria/${id}/concluir`, { method: "POST" }).catch(
      () => undefined
    );
    setTrilha((t) =>
      t
        ? {
            ...t,
            materias: t.materias.map((m) => ({
              ...m,
              temas: m.temas.map((tm) => ({
                ...tm,
                teoria: tm.teoria.map((te) =>
                  te.id === id ? { ...te, concluido: true } : te
                ),
              })),
            })),
          }
        : t
    );
    setTeoriaAberta(null);
  };

  if (carregando) return <div className="skeleton h-96 w-full rounded-3xl" />;

  if (falhou) {
    return (
      <div className="rounded-2xl border border-bat-error/30 bg-bat-error/10 p-10 text-center">
        <span className="mb-3 block text-4xl">📡</span>
        <h1 className="heading mb-2 text-lg text-bat-text">
          Não consegui carregar a trilha
        </h1>
        <p className="mx-auto mb-5 max-w-md text-sm text-bat-text-secondary">
          Isto é falha de conexão, não falta de conteúdo. Confira a internet e
          tente de novo.
        </p>
        <button onClick={carregar} className="btn-primary px-5 py-2.5">
          Tentar de novo
        </button>
      </div>
    );
  }

  if (!trilha || trilha.materias.length === 0) {
    return (
      <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
        <span className="mb-3 block text-4xl">📖</span>
        <h1 className="heading mb-2 text-lg text-bat-text">
          Trilha de {sigla} em construção
        </h1>
        <p className="mx-auto mb-5 max-w-md text-sm text-bat-text-secondary">
          Ainda não há questões nem conteúdo cadastrados para este concurso.
        </p>
        <Link
          href={`/concursos/${sigla.toLowerCase()}`}
          className="btn-secondary inline-block px-5 py-2.5 no-underline"
        >
          ← Voltar ao concurso
        </Link>
      </div>
    );
  }

  const cor = trilha.concurso.cor_tema ?? "#F5C518";

  return (
    <div>
      <Link
        href={`/concursos/${sigla.toLowerCase()}`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-bat-text-muted no-underline hover:text-bat-gold-400"
      >
        ← Voltar ao {trilha.concurso.sigla}
      </Link>

      <header className="mb-6">
        <h1 className="heading flex items-center gap-3 text-2xl font-bold text-bat-text sm:text-3xl">
          <span>{trilha.concurso.emoji ?? "📖"}</span>
          Trilha de estudos — {trilha.concurso.sigla}
        </h1>
        <p className="mt-1 text-sm text-bat-text-secondary">
          Matérias ordenadas pelo peso real na prova, medido pelas{" "}
          {trilha.total_questoes.toLocaleString("pt-BR")} questões oficiais
          catalogadas deste concurso.
        </p>
      </header>

      {/* ═══ MATÉRIAS ═══ */}
      <div className="space-y-3">
        {trilha.materias.map((m) => {
          const aberta = materiaAberta === m.id;
          const temTeoria = m.temas.some((t) => t.teoria.length > 0);
          const temVideo = m.temas.some((t) => t.videos.length > 0);

          return (
            <section
              key={m.id}
              className="overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card"
            >
              {/* Cabeçalho da matéria */}
              <button
                onClick={() => setMateriaAberta(aberta ? null : m.id)}
                className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-bat-bg-elevated"
                aria-expanded={aberta}
              >
                <span className="text-2xl">{m.icone_emoji ?? "📚"}</span>

                <div className="min-w-0 flex-1">
                  <h2 className="heading text-base font-bold text-bat-text">
                    {m.nome}
                  </h2>
                  <p className="mt-0.5 text-xs text-bat-text-muted">
                    {m.total_questoes.toLocaleString("pt-BR")} questões
                    {m.progresso.respondidas > 0 && (
                      <>
                        {" · "}
                        <span className="text-bat-text-secondary">
                          você já fez {m.progresso.respondidas} ({m.progresso.taxa}%
                          de acerto)
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {temTeoria && (
                    <span className="rounded-md bg-bat-bg-secondary px-2 py-1 text-[10px] text-bat-text-muted">
                      📖 teoria
                    </span>
                  )}
                  {temVideo && (
                    <span className="rounded-md bg-bat-bg-secondary px-2 py-1 text-[10px] text-bat-text-muted">
                      🎬 vídeo
                    </span>
                  )}
                  <span
                    className={`text-bat-text-muted transition-transform ${
                      aberta ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </div>
              </button>

              {/* Barra de progresso da matéria */}
              <div className="h-1 w-full bg-bat-bg-secondary">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      100,
                      m.total_questoes
                        ? (m.progresso.respondidas / m.total_questoes) * 100
                        : 0
                    )}%`,
                    background: cor,
                  }}
                />
              </div>

              {aberta && (
                <div className="space-y-5 border-t border-bat-border px-5 py-5">
                  {/* ─── Teoria e vídeos por tema ─── */}
                  {m.temas.length > 0 ? (
                    m.temas.map((t) => (
                      <div key={t.tema}>
                        <h3 className="heading mb-2.5 text-sm font-bold uppercase tracking-wider text-bat-gold-400">
                          {t.tema}
                        </h3>

                        {t.teoria.length > 0 && (
                          <div className="mb-3 space-y-2">
                            {t.teoria.map((te) => (
                              <button
                                key={te.id}
                                onClick={() => abrirTeoria(te.id)}
                                disabled={carregandoTeoria}
                                className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-bat-border bg-bat-bg-secondary/50 px-4 py-3 text-left transition-all hover:border-bat-gold-400/40"
                              >
                                <span className="text-lg">
                                  {te.concluido ? "✅" : "📖"}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-bat-text">
                                    {te.titulo}
                                  </p>
                                  {te.resumo && (
                                    <p className="mt-0.5 line-clamp-1 text-xs text-bat-text-muted">
                                      {te.resumo}
                                    </p>
                                  )}
                                </div>
                                <span className="shrink-0 text-[11px] text-bat-text-muted">
                                  {te.tempo_leitura_min} min
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {t.videos.length > 0 && (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {t.videos.map((v) => (
                              <VideoAulaPlayer key={v.id} video={v} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 px-4 py-3.5">
                      <p className="text-xs leading-relaxed text-bat-text-secondary">
                        📝 O material teórico de <strong>{m.nome}</strong> para
                        este concurso ainda está sendo escrito. Enquanto isso, a
                        prática vale muito: são{" "}
                        {m.total_questoes.toLocaleString("pt-BR")} questões
                        oficiais com gabarito comentado.
                      </p>
                    </div>
                  )}

                  {/* ─── Assuntos mais cobrados ─── */}
                  {m.assuntos_mais_cobrados.length > 0 && (
                    <div>
                      <h3 className="heading mb-2.5 text-sm font-bold uppercase tracking-wider text-bat-text-secondary">
                        Assuntos que mais caem
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {m.assuntos_mais_cobrados.slice(0, 12).map((a) => (
                          <Link
                            key={a.id}
                            href={`/questoes?concurso=${sigla}&materia=${encodeURIComponent(m.nome)}`}
                            className="rounded-lg border border-bat-border bg-bat-bg-secondary px-3 py-1.5 text-xs text-bat-text-secondary no-underline transition-colors hover:border-bat-gold-400/40 hover:text-bat-gold-400"
                          >
                            {a.nome}
                            <span className="ml-1.5 text-bat-text-muted">
                              {a.total_questoes}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/questoes?concurso=${sigla}&materia=${encodeURIComponent(m.nome)}`}
                    className="btn-primary inline-block px-6 py-2.5 text-sm no-underline"
                  >
                    Praticar {m.nome} →
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ═══ MODAL DE TEORIA ═══ */}
      {teoriaAberta && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setTeoriaAberta(null)}
        >
          <div
            className="my-8 w-full max-w-3xl rounded-3xl border border-bat-gold-400/30 bg-bat-bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-3xl border-b border-bat-border bg-bat-bg-card px-6 py-4">
              <div>
                <h2 className="heading text-lg font-bold text-bat-text">
                  {teoriaAberta.titulo}
                </h2>
                <p className="mt-0.5 text-xs text-bat-text-muted">
                  Leitura de {teoriaAberta.tempo_leitura_min} minutos
                </p>
              </div>
              <button
                onClick={() => setTeoriaAberta(null)}
                className="shrink-0 cursor-pointer text-bat-text-muted transition-colors hover:text-bat-text"
                aria-label="Fechar"
              >
                ✕
              </button>
            </header>

            <div className="px-6 py-5">
              <Markdown>{teoriaAberta.corpo_markdown}</Markdown>
            </div>

            <footer className="flex flex-wrap gap-3 border-t border-bat-border px-6 py-4">
              <button
                onClick={() => marcarLida(teoriaAberta.id)}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                ✅ Marcar como estudado
              </button>
              <button
                onClick={() => setTeoriaAberta(null)}
                className="btn-secondary px-6 py-2.5 text-sm"
              >
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrilhaPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full rounded-2xl" />}>
      <Trilha />
    </Suspense>
  );
}
