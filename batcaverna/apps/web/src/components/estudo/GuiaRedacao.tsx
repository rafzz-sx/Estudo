"use client";

import { useMemo, useState } from "react";
import {
  ANATOMIA,
  CONECTIVOS,
  REPERTORIOS,
  ARMADILHAS,
  ELEMENTOS_PROPOSTA,
} from "@/lib/redacao-guia";

/**
 * "Como escrever" — o método, separado da régua.
 *
 * A aba de autoavaliação diz COMO VOCÊ É CORRIGIDO. Esta diz COMO SE ESCREVE
 * para atender aquilo: a anatomia dos quatro parágrafos, os conectivos por
 * função, o banco de repertórios por contexto e as armadilhas que zeram.
 *
 * Tudo abre fechado, menos a primeira seção: é material de consulta, e uma
 * parede de texto aberta faz o aluno rolar sem ler.
 */

type Secao = "anatomia" | "conectivos" | "repertorios" | "proposta" | "armadilhas";

const SECOES: { chave: Secao; rotulo: string }[] = [
  { chave: "anatomia", rotulo: "🧱 Estrutura" },
  { chave: "conectivos", rotulo: "🔗 Conectivos" },
  { chave: "repertorios", rotulo: "💡 Repertórios" },
  { chave: "proposta", rotulo: "🎯 Proposta" },
  { chave: "armadilhas", rotulo: "⚠️ O que zera" },
];

const COR_GRAVIDADE: Record<string, { borda: string; texto: string; rotulo: string }> = {
  zera: { borda: "border-bat-error/40", texto: "text-bat-error", rotulo: "ZERA" },
  caro: { borda: "border-bat-gold-400/40", texto: "text-bat-gold-400", rotulo: "CUSTA CARO" },
  atencao: { borda: "border-bat-border", texto: "text-bat-text-muted", rotulo: "ATENÇÃO" },
};

export function GuiaRedacao() {
  const [secao, setSecao] = useState<Secao>("anatomia");
  const [aberta, setAberta] = useState<string | null>("introducao");
  const [contexto, setContexto] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const repertoriosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return REPERTORIOS.filter(
      (c) => contexto === "todos" || c.chave === contexto
    )
      .map((c) => ({
        ...c,
        itens: termo
          ? c.itens.filter(
              (i) =>
                i.fonte.toLowerCase().includes(termo) ||
                (i.autor ?? "").toLowerCase().includes(termo) ||
                i.ideia.toLowerCase().includes(termo) ||
                i.serve.some((s) => s.toLowerCase().includes(termo))
            )
          : c.itens,
      }))
      .filter((c) => c.itens.length > 0);
  }, [contexto, busca]);

  const totalRepertorios = REPERTORIOS.reduce((a, c) => a + c.itens.length, 0);

  return (
    <div className="space-y-4">
      {/* ═══ Navegação ═══ */}
      <div className="flex flex-wrap gap-1.5">
        {SECOES.map((s) => (
          <button
            key={s.chave}
            onClick={() => setSecao(s.chave)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              secao === s.chave
                ? "bg-bat-gold-400 text-black"
                : "bg-bat-bg-secondary text-bat-text-secondary hover:bg-bat-bg-elevated"
            }`}
          >
            {s.rotulo}
          </button>
        ))}
      </div>

      {/* ═══════════ ESTRUTURA ═══════════ */}
      {secao === "anatomia" && (
        <div className="space-y-3">
          <p className="text-sm text-bat-text-secondary">
            Quatro parágrafos, cada um com uma função. Não é fórmula: é a
            estrutura que a correção espera encontrar — e o corretor tem cerca
            de três minutos para achá-la.
          </p>

          {ANATOMIA.map((p) => {
            const aberto = aberta === p.chave;
            return (
              <section
                key={p.chave}
                className="overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card"
              >
                <button
                  onClick={() => setAberta(aberto ? null : p.chave)}
                  className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left"
                  aria-expanded={aberto}
                >
                  <div className="min-w-0 flex-1">
                    <p className="heading text-base font-bold text-bat-gold-400">
                      {p.titulo}
                    </p>
                    <p className="text-xs text-bat-text-muted">
                      {p.linhasSugeridas} · {p.objetivo}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-bat-text-muted">
                    {aberto ? "▲" : "▼"}
                  </span>
                </button>

                {aberto && (
                  <div className="space-y-5 border-t border-bat-border px-5 py-4">
                    {/* Passos */}
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-bat-text-muted">
                        Os movimentos, na ordem
                      </p>
                      <ol className="space-y-2">
                        {p.passos.map((passo) => (
                          <li
                            key={passo.nome}
                            className="rounded-xl border-l-2 border-bat-gold-400/40 bg-bat-bg-secondary/40 px-3 py-2"
                          >
                            <p className="text-sm font-bold text-bat-text">
                              {passo.nome}
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-bat-text-secondary">
                              {passo.explicacao}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Aberturas */}
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-bat-text-muted">
                        Moldes de abertura
                      </p>
                      <ul className="space-y-1">
                        {p.aberturas.map((a) => (
                          <li
                            key={a}
                            className="rounded-lg bg-bat-bg-secondary/50 px-3 py-1.5 font-serif text-xs text-bat-text-secondary"
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-1.5 text-[11px] text-bat-text-muted">
                        São andaimes para começar, não frases para decorar: o
                        corretor reconhece texto montado com peças prontas.
                      </p>
                    </div>

                    {/* Exemplo */}
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-bat-text-muted">
                        Exemplo · {p.exemplo.tema}
                      </p>
                      <p className="rounded-xl border border-bat-gold-400/20 bg-bat-gold-400/5 px-4 py-3 font-serif text-sm leading-relaxed text-bat-text-secondary">
                        {p.exemplo.texto}
                      </p>
                    </div>

                    {/* Erros */}
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-bat-text-muted">
                        Onde se perde ponto aqui
                      </p>
                      <ul className="space-y-1">
                        {p.erros.map((e) => (
                          <li
                            key={e}
                            className="flex gap-2 text-xs leading-relaxed text-bat-text-secondary"
                          >
                            <span className="shrink-0 text-bat-error">✕</span>
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* ═══════════ CONECTIVOS ═══════════ */}
      {secao === "conectivos" && (
        <div className="space-y-3">
          <p className="text-sm text-bat-text-secondary">
            A competência 4 mede exatamente isto. Repetir o mesmo conectivo é o
            desvio mais comum de todos — e o mais fácil de evitar: ao revisar,
            liste os que você usou.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {CONECTIVOS.map((g) => (
              <section
                key={g.funcao}
                className="rounded-2xl border border-bat-border bg-bat-bg-card p-4"
              >
                <p className="text-sm font-bold text-bat-gold-400">{g.funcao}</p>
                <p className="mb-2.5 text-[11px] text-bat-text-muted">{g.onde}</p>

                <div className="flex flex-wrap gap-1.5">
                  {g.termos.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-bat-bg-secondary px-2 py-1 font-serif text-xs text-bat-text-secondary"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {g.cuidado && (
                  <p className="mt-3 border-t border-bat-border pt-2 text-[11px] leading-relaxed text-bat-gold-400/90">
                    ⚠️ {g.cuidado}
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ REPERTÓRIOS ═══════════ */}
      {secao === "repertorios" && (
        <div className="space-y-3">
          <p className="text-sm text-bat-text-secondary">
            {totalRepertorios} repertórios reais, organizados por contexto.
            Nenhum é inventado — repertório falso é o erro mais caro que existe,
            porque o corretor conhece a obra.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por tema, autor ou obra…"
              className="input-field min-w-0 flex-1 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setContexto("todos")}
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                contexto === "todos"
                  ? "bg-bat-gold-400 text-black"
                  : "bg-bat-bg-secondary text-bat-text-secondary hover:bg-bat-bg-elevated"
              }`}
            >
              Todos
            </button>
            {REPERTORIOS.map((c) => (
              <button
                key={c.chave}
                onClick={() => setContexto(c.chave)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  contexto === c.chave
                    ? "bg-bat-gold-400 text-black"
                    : "bg-bat-bg-secondary text-bat-text-secondary hover:bg-bat-bg-elevated"
                }`}
              >
                {c.emoji} {c.titulo}
              </button>
            ))}
          </div>

          {repertoriosFiltrados.length === 0 ? (
            <p className="rounded-2xl border border-bat-border bg-bat-bg-card p-8 text-center text-sm text-bat-text-muted">
              Nenhum repertório para “{busca}”. Tente por tema — “educação”,
              “violência”, “tecnologia”.
            </p>
          ) : (
            repertoriosFiltrados.map((c) => (
              <section key={c.chave} className="space-y-2">
                <header className="pt-1">
                  <h3 className="heading text-base font-bold text-bat-text">
                    {c.emoji} {c.titulo}
                  </h3>
                  <p className="text-xs text-bat-text-muted">{c.descricao}</p>
                </header>

                {c.itens.map((r) => (
                  <article
                    key={r.fonte}
                    className="rounded-2xl border border-bat-border bg-bat-bg-card p-4"
                  >
                    <p className="text-sm font-bold text-bat-text">
                      {r.fonte}
                      {r.autor && (
                        <span className="font-normal text-bat-text-muted">
                          {" "}
                          · {r.autor}
                        </span>
                      )}
                    </p>

                    <p className="mt-1.5 text-xs leading-relaxed text-bat-text-secondary">
                      {r.ideia}
                    </p>

                    <div className="mt-3 rounded-xl border-l-2 border-bat-gold-400/50 bg-bat-bg-secondary/40 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-bat-gold-400">
                        Como usar
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-bat-text-secondary">
                        {r.comoUsar}
                      </p>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {r.serve.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-bat-bg-secondary px-2 py-0.5 text-[10px] text-bat-text-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </section>
            ))
          )}
        </div>
      )}

      {/* ═══════════ PROPOSTA ═══════════ */}
      {secao === "proposta" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-bat-gold-400/30 bg-bat-gold-400/5 p-4">
            <p className="text-sm text-bat-text-secondary">
              A competência 5 vale <strong className="text-bat-text">200
              pontos</strong> e é a mais mecânica de todas: são cinco elementos,
              e faltando um você cai para 160. É o ponto mais barato da redação
              inteira — e o que mais gente perde.
            </p>
          </div>

          <div className="space-y-2">
            {ELEMENTOS_PROPOSTA.map((e, i) => (
              <section
                key={e.nome}
                className="rounded-2xl border border-bat-border bg-bat-bg-card p-4"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-bat-gold-400">
                    {i + 1}
                  </span>
                  <p className="text-sm font-bold text-bat-text">{e.nome}</p>
                </div>
                <p className="mt-0.5 text-xs italic text-bat-text-muted">
                  {e.pergunta}
                </p>

                <ul className="mt-2.5 space-y-1">
                  {e.exemplos.map((ex) => (
                    <li
                      key={ex}
                      className="rounded-lg bg-bat-bg-secondary/50 px-3 py-1.5 font-serif text-xs text-bat-text-secondary"
                    >
                      {ex}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="rounded-2xl border border-bat-error/30 bg-bat-error/10 p-4">
            <p className="text-sm font-bold text-bat-error">
              A regra que zera
            </p>
            <p className="mt-1 text-xs leading-relaxed text-bat-text-secondary">
              Proposta que fere direitos humanos zera a competência inteira.
              Pena de morte, castigo físico, esterilização, exclusão de grupo:
              200 pontos a menos, por mais bem escrito que esteja o resto.
            </p>
          </div>
        </div>
      )}

      {/* ═══════════ ARMADILHAS ═══════════ */}
      {secao === "armadilhas" && (
        <div className="space-y-2">
          <p className="text-sm text-bat-text-secondary">
            Em ordem de estrago. As quatro primeiras anulam a redação ou uma
            competência inteira — vale reler esta lista antes de entregar.
          </p>

          {ARMADILHAS.map((a) => {
            const c = COR_GRAVIDADE[a.gravidade];
            return (
              <article
                key={a.titulo}
                className={`rounded-xl border bg-bat-bg-card p-4 ${c.borda}`}
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span
                    className={`rounded-md bg-bat-bg-secondary px-2 py-0.5 font-mono text-[10px] font-bold ${c.texto}`}
                  >
                    {c.rotulo}
                  </span>
                  <p className="text-sm font-bold text-bat-text">{a.titulo}</p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-bat-text-secondary">
                  {a.explicacao}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
