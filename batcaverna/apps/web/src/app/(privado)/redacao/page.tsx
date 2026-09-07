"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";
import {
  COMPETENCIAS,
  DEGRAUS,
  EXTENSAO,
  NOTA_MAXIMA,
  contarPalavras,
  estimarLinhas,
} from "@/lib/redacao";
import { GuiaRedacao } from "@/components/estudo/GuiaRedacao";

/**
 * Redação.
 *
 * A redação vale 1.000 pontos no ENEM e é eliminatória em vários concursos
 * militares — e não havia nada sobre ela aqui.
 *
 * O que esta tela faz: dá um tema real, cronometra, guarda o texto e depois
 * conduz a AUTOAVALIAÇÃO com o descritor oficial de cada competência na
 * frente. O que ela não faz, de propósito: corrigir sozinha. Um número
 * gerado por regra de três seria pior que número nenhum — o aluno passaria a
 * estudar para o alvo errado. Ver `lib/redacao.ts`.
 */

interface Tema {
  id: string;
  titulo: string;
  ano: number | null;
  origem: string;
  textos_apoio: string | null;
  fonte_url: string | null;
}

interface MinhaRedacao {
  id: string;
  tema_titulo: string;
  palavras: number;
  linhas: number;
  c1: number | null;
  c2: number | null;
  c3: number | null;
  c4: number | null;
  c5: number | null;
  nota_total: number;
  avaliada_em: string | null;
  anotacoes: string | null;
  criado_em: string;
}

type Aba = "guia" | "escrever" | "historico";

export default function RedacaoPage() {
  const [aba, setAba] = useState<Aba>("guia");
  const [temas, setTemas] = useState<Tema[]>([]);
  const [minhas, setMinhas] = useState<MinhaRedacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);

  // ─── Escrita ───────────────────────────────────────────────
  const [temaId, setTemaId] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const inicio = useRef<number | null>(null);
  const [segundos, setSegundos] = useState(0);

  // ─── Autoavaliação ─────────────────────────────────────────
  const [avaliando, setAvaliando] = useState<MinhaRedacao | null>(null);
  const [notas, setNotas] = useState<Record<string, number | null>>({});
  const [anotacoes, setAnotacoes] = useState("");
  const [lendo, setLendo] = useState<{ id: string; texto: string } | null>(null);

  const carregar = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/redacao");
      const json = await res.json();
      if (json.success) {
        setTemas(json.data.temas ?? []);
        setMinhas(json.data.minhas ?? []);
      } else {
        setAviso(json.error ?? "Não consegui carregar.");
      }
    } catch {
      setAviso("Falha de conexão.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Cronômetro: começa na primeira tecla. Na prova o tempo é parte do
  // exercício, e saber quanto se leva é metade do treino.
  useEffect(() => {
    if (inicio.current === null) return;
    const t = setInterval(() => {
      setSegundos(Math.floor((Date.now() - (inicio.current ?? Date.now())) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [inicio.current]);

  const palavras = useMemo(() => contarPalavras(texto), [texto]);
  const linhas = useMemo(() => estimarLinhas(texto), [texto]);
  const temaEscolhido = temas.find((t) => t.id === temaId);

  const enviar = async () => {
    if (!temaId) {
      setAviso("Escolha um tema antes de enviar.");
      return;
    }
    if (texto.trim().length < 200) {
      setAviso("O texto ainda está muito curto para ser uma dissertação.");
      return;
    }

    setEnviando(true);
    setAviso(null);
    try {
      const res = await fetchWithAuth("/api/redacao", {
        method: "POST",
        body: JSON.stringify({
          tema_id: temaId,
          texto,
          tempo_segundos: segundos || null,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setTexto("");
        setTemaId("");
        inicio.current = null;
        setSegundos(0);
        await carregar();
        setAvaliando(json.data);
        setNotas({});
        setAnotacoes("");
        setAba("historico");
        setAviso("✅ Redação guardada. Agora corrija você mesmo, abaixo.");
      } else {
        setAviso(json.error ?? "Não consegui guardar.");
      }
    } catch {
      setAviso("Falha de conexão ao enviar.");
    } finally {
      setEnviando(false);
    }
  };

  const salvarAvaliacao = async () => {
    if (!avaliando) return;
    const faltando = COMPETENCIAS.filter((c) => notas[`c${c.numero}`] == null);
    if (faltando.length) {
      setAviso(
        `Avalie todas as competências. Falta: ${faltando
          .map((c) => `C${c.numero}`)
          .join(", ")}.`
      );
      return;
    }

    const res = await fetchWithAuth("/api/redacao", {
      method: "PATCH",
      body: JSON.stringify({ id: avaliando.id, ...notas, anotacoes }),
    }).catch(() => null);

    const json = res ? await res.json().catch(() => null) : null;
    if (!json?.success) {
      setAviso(json?.error ?? "Não consegui gravar a avaliação.");
      return;
    }

    setMinhas((atual) =>
      atual.map((r) => (r.id === avaliando.id ? { ...r, ...json.data } : r))
    );
    setAvaliando(null);
    setNotas({});
    setAnotacoes("");
    setAviso(`✅ Avaliada: ${json.data.nota_total} de ${NOTA_MAXIMA}.`);
  };

  const abrirTexto = async (id: string) => {
    if (lendo?.id === id) {
      setLendo(null);
      return;
    }
    const res = await fetchWithAuth(`/api/redacao/${id}`).catch(() => null);
    const json = res ? await res.json().catch(() => null) : null;
    if (json?.success) setLendo({ id, texto: json.data.texto });
  };

  const somaParcial = COMPETENCIAS.reduce(
    (a, c) => a + (notas[`c${c.numero}`] ?? 0),
    0
  );

  // Evolução por competência: só faz sentido com duas avaliadas ou mais.
  const avaliadas = minhas.filter((r) => r.avaliada_em).slice(0, 10).reverse();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading text-2xl font-bold text-bat-text">
          ✍️ Redação
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-bat-text-secondary">
          Escolha um tema que já caiu, escreva no tempo da prova e depois
          corrija o próprio texto com a régua oficial na frente.
        </p>
      </header>

      {/* A ressalva vem no topo, não no rodapé: é o tipo de coisa que muda o
          que o aluno espera da ferramenta, e ele precisa saber antes. */}
      <div className="rounded-xl border border-bat-info/30 bg-bat-info/10 px-4 py-3 text-sm text-bat-text-secondary">
        <strong className="text-bat-text">A plataforma não corrige sua
        redação.</strong>{" "}
        Corrigir exige leitor humano treinado, e uma nota inventada por regra
        seria pior que nota nenhuma. O que ela faz é te dar a{" "}
        <strong className="text-bat-text">rubrica oficial das 5
        competências</strong> e te guiar na autoavaliação — o exercício de
        julgar o próprio texto contra a régua é o que ensina a enxergar o que
        falta.
      </div>

      <div className="flex gap-2">
        {(
          [
            ["guia", "📖 Como escrever"],
            ["escrever", "✍️ Escrever"],
            ["historico", `📚 Minhas redações (${minhas.length})`],
          ] as const
        ).map(([v, r]) => (
          <button
            key={v}
            onClick={() => setAba(v)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              aba === v
                ? "bg-bat-gold-400 text-black"
                : "bg-bat-bg-secondary text-bat-text-secondary hover:bg-bat-bg-elevated"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {aviso && (
        <p className="rounded-xl border border-bat-border bg-bat-bg-secondary/60 px-4 py-2.5 text-sm text-bat-text-secondary">
          {aviso}
        </p>
      )}

      {/* ═══════════ COMO ESCREVER ═══════════ */}
      {aba === "guia" && <GuiaRedacao />}

      {/* ═══════════ ESCREVER ═══════════ */}
      {aba === "escrever" && (
        <div className="space-y-4">
          {carregando ? (
            <div className="skeleton h-64 rounded-2xl" />
          ) : temas.length === 0 ? (
            <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
              <span className="mb-3 block text-4xl">📭</span>
              <p className="text-sm text-bat-text-secondary">
                Nenhum tema cadastrado ainda. Rode a migration{" "}
                <code className="rounded bg-bat-bg-secondary px-1">
                  016_redacao.sql
                </code>{" "}
                no Supabase.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
                <label
                  htmlFor="tema"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-bat-text-muted"
                >
                  Tema
                </label>
                <select
                  id="tema"
                  value={temaId}
                  onChange={(e) => setTemaId(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Escolha um tema que já caiu…</option>
                  {temas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.ano ? `${t.ano} — ` : ""}
                      {t.titulo}
                    </option>
                  ))}
                </select>

                {temaEscolhido && (
                  <div className="mt-3 rounded-xl border-l-4 border-bat-gold-400/50 bg-bat-bg-secondary/50 px-4 py-3">
                    <p className="text-sm leading-relaxed text-bat-text">
                      {temaEscolhido.titulo}
                    </p>
                    {temaEscolhido.fonte_url && (
                      <a
                        href={temaEscolhido.fonte_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-bat-gold-400"
                      >
                        ver a prova original →
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="texto"
                    className="text-xs font-bold uppercase tracking-wider text-bat-text-muted"
                  >
                    Sua dissertação
                  </label>

                  <div className="flex items-center gap-3 text-xs tabular-nums">
                    <span
                      className={
                        palavras >= EXTENSAO.palavrasIdealMin &&
                        palavras <= EXTENSAO.palavrasIdealMax
                          ? "text-bat-success"
                          : "text-bat-text-muted"
                      }
                    >
                      {palavras} palavras
                    </span>
                    <span
                      className={
                        linhas > EXTENSAO.linhasMaximas
                          ? "text-bat-error"
                          : "text-bat-text-muted"
                      }
                      title="Estimativa: ~12 palavras por linha na folha oficial"
                    >
                      ~{linhas}/{EXTENSAO.linhasMaximas} linhas
                    </span>
                    {segundos > 0 && (
                      <span className="text-bat-gold-400">
                        {Math.floor(segundos / 60)}min
                      </span>
                    )}
                  </div>
                </div>

                <textarea
                  id="texto"
                  value={texto}
                  onChange={(e) => {
                    if (inicio.current === null && e.target.value.length > 0) {
                      inicio.current = Date.now();
                    }
                    setTexto(e.target.value);
                  }}
                  rows={18}
                  placeholder="Introdução com a tese, dois parágrafos de desenvolvimento e a conclusão com a proposta de intervenção…"
                  className="input-field w-full resize-y font-serif leading-relaxed"
                />

                {linhas > EXTENSAO.linhasMaximas && (
                  <p className="mt-2 text-xs text-bat-error">
                    ⚠️ Passou das {EXTENSAO.linhasMaximas} linhas da folha
                    oficial. O que passa não é lido.
                  </p>
                )}

                <button
                  onClick={enviar}
                  disabled={enviando || !temaId || texto.trim().length < 200}
                  className="btn-primary mt-4 px-6 py-2.5 text-sm disabled:opacity-40"
                >
                  {enviando ? "Guardando…" : "Guardar e corrigir"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════ HISTÓRICO ═══════════ */}
      {aba === "historico" && (
        <div className="space-y-4">
          {avaliadas.length >= 2 && (
            <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
              <h2 className="heading mb-3 text-base font-bold text-bat-text">
                Evolução por competência
              </h2>
              <div className="space-y-2">
                {COMPETENCIAS.map((c) => (
                  <div key={c.numero} className="flex items-center gap-3">
                    <span className="w-8 shrink-0 font-mono text-xs text-bat-text-muted">
                      C{c.numero}
                    </span>
                    <div className="flex flex-1 items-end gap-1">
                      {avaliadas.map((r) => {
                        const v = (r as any)[`c${c.numero}`] ?? 0;
                        return (
                          <div
                            key={r.id}
                            className="flex-1 rounded-t bg-bat-gold-400/70"
                            style={{ height: `${Math.max(3, (v / 200) * 32)}px` }}
                            title={`${v}/200 · ${new Date(
                              r.criado_em
                            ).toLocaleDateString("pt-BR")}`}
                          />
                        );
                      })}
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs tabular-nums text-bat-text-secondary">
                      {(avaliadas[avaliadas.length - 1] as any)[`c${c.numero}`] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-bat-text-muted">
                Da mais antiga à mais recente. A competência com a barra mais
                baixa é onde a próxima redação deve mirar.
              </p>
            </section>
          )}

          {minhas.length === 0 ? (
            <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
              <span className="mb-3 block text-4xl">✍️</span>
              <p className="text-sm text-bat-text-secondary">
                Você ainda não escreveu nenhuma. Comece pela aba Escrever.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {minhas.map((r) => (
                <li
                  key={r.id}
                  className="overflow-hidden rounded-xl border border-bat-border bg-bat-bg-card"
                >
                  <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-bat-text">
                        {r.tema_titulo}
                      </p>
                      <p className="text-xs text-bat-text-muted">
                        {new Date(r.criado_em).toLocaleDateString("pt-BR")} ·{" "}
                        {r.palavras} palavras
                      </p>
                    </div>

                    {r.avaliada_em ? (
                      <span className="shrink-0 rounded-lg bg-bat-gold-400/15 px-3 py-1 text-sm font-bold text-bat-gold-400 tabular-nums">
                        {r.nota_total}/{NOTA_MAXIMA}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setAvaliando(r);
                          setNotas({});
                          setAnotacoes("");
                        }}
                        className="btn-primary shrink-0 px-3 py-1.5 text-xs"
                      >
                        Corrigir
                      </button>
                    )}

                    <button
                      onClick={() => abrirTexto(r.id)}
                      className="shrink-0 cursor-pointer rounded-lg border border-bat-border px-3 py-1.5 text-xs text-bat-text-secondary transition-colors hover:text-bat-text"
                    >
                      {lendo?.id === r.id ? "fechar" : "ler"}
                    </button>
                  </div>

                  {lendo?.id === r.id && (
                    <div className="border-t border-bat-border px-4 py-3">
                      <p className="whitespace-pre-line font-serif text-sm leading-relaxed text-bat-text-secondary">
                        {lendo.texto}
                      </p>
                      {r.anotacoes && (
                        <p className="mt-3 rounded-lg bg-bat-bg-secondary/60 px-3 py-2 text-xs text-bat-text-muted">
                          <strong className="text-bat-text">Suas anotações:</strong>{" "}
                          {r.anotacoes}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ═══════════ AUTOAVALIAÇÃO ═══════════ */}
      {avaliando && (
        <section className="rounded-2xl border border-bat-gold-400/40 bg-bat-bg-card p-5">
          <header className="mb-4">
            <h2 className="heading text-base font-bold text-bat-gold-400">
              Corrigindo: {avaliando.tema_titulo}
            </h2>
            <p className="mt-1 text-xs text-bat-text-muted">
              Releia o seu texto com cada descritor na frente e escolha o nível
              que ele realmente atinge — não o que você queria que atingisse.
            </p>
          </header>

          <div className="space-y-5">
            {COMPETENCIAS.map((c) => {
              const chave = `c${c.numero}`;
              const escolhido = notas[chave];
              return (
                <div key={c.numero} className="border-t border-bat-border pt-4">
                  <p className="text-sm font-bold text-bat-text">
                    C{c.numero} · {c.titulo}
                  </p>
                  <p className="mt-0.5 text-xs text-bat-text-muted">{c.resumo}</p>
                  <p className="mt-2 text-xs italic text-bat-text-secondary">
                    {c.pergunta}
                  </p>

                  <div className="mt-3 space-y-1.5">
                    {c.niveis.map((n) => (
                      <button
                        key={n.pontos}
                        onClick={() =>
                          setNotas((a) => ({ ...a, [chave]: n.pontos }))
                        }
                        className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                          escolhido === n.pontos
                            ? "border-bat-gold-400 bg-bat-gold-400/10"
                            : "border-bat-border hover:border-bat-gold-400/30"
                        }`}
                      >
                        <span
                          className={`w-8 shrink-0 text-center text-xs font-bold tabular-nums ${
                            escolhido === n.pontos
                              ? "text-bat-gold-400"
                              : "text-bat-text-muted"
                          }`}
                        >
                          {n.pontos}
                        </span>
                        <span className="text-xs leading-snug text-bat-text-secondary">
                          {n.descricao}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-bat-border pt-4">
            <label
              htmlFor="anotacoes"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-bat-text-muted"
            >
              O que você percebeu relendo
            </label>
            <textarea
              id="anotacoes"
              value={anotacoes}
              onChange={(e) => setAnotacoes(e.target.value)}
              rows={3}
              placeholder="Ex.: repeti 'além disso' três vezes; a proposta não tem detalhamento…"
              className="input-field w-full resize-y text-sm"
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="heading text-lg font-bold tabular-nums text-bat-gold-400">
                {somaParcial}/{NOTA_MAXIMA}
              </span>
              <button
                onClick={salvarAvaliacao}
                className="btn-primary px-5 py-2 text-sm"
              >
                Salvar avaliação
              </button>
              <button
                onClick={() => {
                  setAvaliando(null);
                  setNotas({});
                }}
                className="cursor-pointer text-sm text-bat-text-muted hover:text-bat-text"
              >
                Cancelar
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
