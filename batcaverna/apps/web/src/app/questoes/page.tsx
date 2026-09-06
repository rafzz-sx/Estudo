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
import { ComboBanner, ComboCompacto } from "@/components/questoes/ComboBadge";

// ─── Contratos ───────────────────────────────────────────────
interface Alternativa {
  letra: string;
  texto: string;
}

interface Questao {
  id: string;
  texto_base: string | null;
  enunciado: string;
  alternativas: Alternativa[];
  ano: number | null;
  banca: string | null;
  dificuldade: string;
  dia_prova: string | null;
  numero_ordem: number | null;
  numero_original: string | null;
  figura_descricao: string | null;
  figura_svg: string | null;
  precisa_resolucao: boolean;
  anulada: boolean | null;
  vezes_respondida: number | null;
  vezes_acertada: number | null;
  concursos: { sigla: string; nome: string; emoji: string | null; cor_tema: string | null } | null;
  materias: { nome: string; icone_emoji: string | null } | null;
  assuntos: { nome: string } | null;
}

interface Resultado {
  correta: boolean;
  resposta_correta: string;
  explicacao: string | null;
  explicacao_alternativas: Record<string, { texto: string; armadilha?: string | null } | string> | null;
  resolucao_passos: PassoResolucao[] | null;
  figura_descricao: string | null;
  figura_svg: string | null;
  precisa_resolucao: boolean;
  revisao: {
    agendada_para: string | null;
    etapa: number | null;
    aprendida: boolean;
    entrou_na_fila: boolean;
  } | null;
  xp_ganho: number;
  xp_total: number;
  novo_combo: number;
  combo_anterior: number;
  patamar: { rotulo: string; cor: string; emoji: string } | null;
  patamar_novo: boolean;
  maior_combo_pessoal: number;
  streak_dias: number;
  nivel: { nivel: number; titulo: string };
  subiu_nivel: boolean;
  frase_motivacional: string | null;
  badges_novas: { nome: string; icone: string; cor_hex: string }[];
  total_respondidas: number;
  total_acertos: number;
}

interface OpcoesFiltro {
  concursos: { id: string; sigla: string; nome: string; total_questoes: number }[];
  materias: { id: string; nome: string; icone_emoji: string | null; total_questoes: number }[];
  anos: number[];
}

const DIFICULDADES = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "facil", rotulo: "Fácil" },
  { valor: "medio", rotulo: "Médio" },
  { valor: "dificil", rotulo: "Difícil" },
];

const ROTULO_DIFICULDADE: Record<string, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

// ═══════════════════════════════════════════════════════════════
function BancoDeQuestoes() {
  const params = useSearchParams();
  const updateUser = useAuthStore((s) => s.updateUser);
  const comboPersistido = useAuthStore((s) => s.user?.combo_atual ?? 0);

  const [filtros, setFiltros] = useState({
    concurso: params.get("concurso") ?? "todos",
    materia: params.get("materia") ?? "todas",
    area: params.get("area") ?? "todas",
    ano: params.get("ano") ?? "todos",
    dificuldade: "todas",
    nao_respondidas: false,
  });

  const [opcoes, setOpcoes] = useState<OpcoesFiltro | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [indice, setIndice] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarGabarito, setMostrarGabarito] = useState(false);

  // Combo espelha o banco; só muda quando o servidor responde.
  const [combo, setCombo] = useState(comboPersistido);
  const [sessao, setSessao] = useState({ respondidas: 0, acertos: 0 });

  const inicioQuestao = useRef<number>(Date.now());
  const topoRef = useRef<HTMLDivElement>(null);

  useEffect(() => setCombo(comboPersistido), [comboPersistido]);

  // ─── Opções de filtro ──────────────────────────────────────
  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await fetchWithAuth(
          `/api/questoes/filtros?concurso=${encodeURIComponent(filtros.concurso)}`
        );
        const json = await res.json();
        if (json.success) setOpcoes(json.data);
      } catch {
        /* filtros são um extra; a listagem funciona sem eles */
      }
    };
    carregar();
  }, [filtros.concurso]);

  // ─── Listagem ──────────────────────────────────────────────
  const carregarQuestoes = useCallback(
    async (page: number) => {
      setCarregando(true);
      setErro(null);
      try {
        const qs = new URLSearchParams({
          page: String(page),
          per_page: "10",
          concurso: filtros.concurso,
          materia: filtros.materia,
          area: filtros.area,
          ano: filtros.ano,
          dificuldade: filtros.dificuldade,
        });
        if (filtros.nao_respondidas) qs.set("nao_respondidas", "1");

        const res = await fetchWithAuth(`/api/questoes?${qs}`);
        const json = await res.json();

        if (!json.success) throw new Error(json.error || "Falha ao carregar");

        setQuestoes(json.data.items);
        setTotal(json.data.total);
        setIndice(0);
        setEscolhida(null);
        setResultado(null);
        setMostrarGabarito(false);
        inicioQuestao.current = Date.now();
      } catch (e) {
        setErro(
          "Não consegui carregar as questões. Verifique sua conexão e tente de novo."
        );
      } finally {
        setCarregando(false);
      }
    },
    [filtros]
  );

  useEffect(() => {
    setPagina(1);
    carregarQuestoes(1);
  }, [carregarQuestoes]);

  const questao = questoes[indice];

  // ─── Responder ─────────────────────────────────────────────
  const responder = async () => {
    if (!escolhida || !questao || enviando || resultado) return;
    setEnviando(true);

    const tempo = Math.round((Date.now() - inicioQuestao.current) / 1000);

    try {
      const res = await fetchWithAuth(`/api/questoes/${questao.id}/responder`, {
        method: "POST",
        body: JSON.stringify({
          resposta_dada: escolhida,
          tempo_gasto_segundos: tempo,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        setErro(json.error || "Não consegui registrar sua resposta.");
        return;
      }

      const r: Resultado = json.data;
      setResultado(r);
      setCombo(r.novo_combo);
      setSessao((s) => ({
        respondidas: s.respondidas + 1,
        acertos: s.acertos + (r.correta ? 1 : 0),
      }));

      // O servidor é a fonte da verdade: o store só reflete o que foi gravado.
      updateUser({
        xp_total: r.xp_total,
        nivel_atual: r.nivel.nivel,
        combo_atual: r.novo_combo,
        maior_combo_pessoal: r.maior_combo_pessoal,
        streak_dias: r.streak_dias,
        questoes_respondidas: r.total_respondidas,
        total_acertos: r.total_acertos,
      });

      window.dispatchEvent(
        new CustomEvent("batcaverna_xp_ganho", {
          detail: {
            xp: r.xp_ganho,
            totalXp: r.xp_total,
            motivo: r.correta
              ? `Acertou ${questao.materias?.nome ?? "a questão"}!${
                  r.patamar ? ` ${r.patamar.rotulo} x${r.novo_combo}` : ""
                }`
              : "Tentativa registrada — o XP de combate conta também",
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
      setErro("Falha de conexão ao enviar a resposta. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  // ─── Navegação ─────────────────────────────────────────────
  const proxima = () => {
    setEscolhida(null);
    setResultado(null);
    setMostrarGabarito(false);
    inicioQuestao.current = Date.now();
    topoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (indice + 1 < questoes.length) {
      setIndice(indice + 1);
    } else if (pagina * 10 < total) {
      const prox = pagina + 1;
      setPagina(prox);
      carregarQuestoes(prox);
    }
  };

  const acabaram = indice + 1 >= questoes.length && pagina * 10 >= total;

  // ─── Render ────────────────────────────────────────────────
  return (
    <div ref={topoRef} className="flex flex-col gap-6 lg:flex-row">
      {/* ═══════════ FILTROS ═══════════ */}
      <aside className="space-y-4 lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="heading text-lg text-bat-text">Filtros</h2>
          {total > 0 && (
            <span className="rounded-lg bg-bat-bg-secondary px-2 py-0.5 text-xs text-bat-text-muted">
              {total.toLocaleString("pt-BR")}
            </span>
          )}
        </div>

        <Campo label="Concurso">
          <select
            value={filtros.concurso}
            onChange={(e) =>
              setFiltros({ ...filtros, concurso: e.target.value, materia: "todas", ano: "todos" })
            }
            className="input-field text-sm"
          >
            <option value="todos">Todos os concursos</option>
            {opcoes?.concursos
              .filter((c) => c.total_questoes > 0)
              .map((c) => (
                <option key={c.id} value={c.sigla}>
                  {c.sigla} ({c.total_questoes})
                </option>
              ))}
          </select>
        </Campo>

        <Campo label="Matéria">
          <select
            value={filtros.materia}
            onChange={(e) => setFiltros({ ...filtros, materia: e.target.value })}
            className="input-field text-sm"
          >
            <option value="todas">Todas as matérias</option>
            {opcoes?.materias.map((m) => (
              <option key={m.id} value={m.nome}>
                {m.icone_emoji ? `${m.icone_emoji} ` : ""}
                {m.nome} ({m.total_questoes})
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Ano da prova">
          <select
            value={filtros.ano}
            onChange={(e) => setFiltros({ ...filtros, ano: e.target.value })}
            className="input-field text-sm"
          >
            <option value="todos">Todos os anos</option>
            {opcoes?.anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Dificuldade">
          <select
            value={filtros.dificuldade}
            onChange={(e) => setFiltros({ ...filtros, dificuldade: e.target.value })}
            className="input-field text-sm"
          >
            {DIFICULDADES.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.rotulo}
              </option>
            ))}
          </select>
        </Campo>

        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-bat-border bg-bat-bg-card px-3 py-2.5">
          <input
            type="checkbox"
            checked={filtros.nao_respondidas}
            onChange={(e) =>
              setFiltros({ ...filtros, nao_respondidas: e.target.checked })
            }
            className="accent-bat-gold-400"
          />
          <span className="text-xs text-bat-text-secondary">
            Só questões inéditas para mim
          </span>
        </label>

        {/* ═══ Painel da sessão ═══ */}
        <div className="rounded-xl border border-bat-border bg-bat-bg-card p-4">
          <p className="mb-2.5 text-xs text-bat-text-muted">Nesta sessão</p>
          <div className="space-y-2 text-sm">
            <Linha rotulo="Respondidas" valor={String(sessao.respondidas)} />
            <Linha
              rotulo="Acertos"
              valor={
                sessao.respondidas > 0
                  ? `${sessao.acertos} (${Math.round(
                      (sessao.acertos / sessao.respondidas) * 100
                    )}%)`
                  : "—"
              }
            />
            <div className="flex justify-between">
              <span className="text-bat-text-secondary">Sequência</span>
              <ComboCompacto combo={combo} />
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════ QUESTÃO ═══════════ */}
      <section className="min-w-0 flex-1">
        {combo >= 3 && (
          <ComboBanner combo={combo} destaque={!!resultado?.patamar_novo} />
        )}

        {erro && (
          <div className="mb-4 rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-3 text-sm text-bat-error">
            {erro}
          </div>
        )}

        {carregando ? (
          <EsqueletoQuestao />
        ) : !questao ? (
          <VazioSemQuestoes filtros={filtros} />
        ) : (
          <article className="rounded-2xl border border-bat-border bg-bat-bg-card p-5 sm:p-6">
            {/* ─── Cabeçalho: CONCURSO — ANO ─── */}
            <header className="mb-5 border-b border-bat-border/60 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="heading flex items-center gap-2 text-xl font-extrabold text-bat-text sm:text-2xl">
                  {questao.concursos?.emoji && <span>{questao.concursos.emoji}</span>}
                  <span style={{ color: questao.concursos?.cor_tema ?? undefined }}>
                    {questao.concursos?.sigla ?? "—"}
                  </span>
                  {questao.ano && (
                    <>
                      <span className="text-bat-text-muted">—</span>
                      <span>{questao.ano}</span>
                    </>
                  )}
                </h1>

                <div className="flex items-center gap-2">
                  {questao.dia_prova && (
                    <Etiqueta>{questao.dia_prova}</Etiqueta>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      questao.dificuldade === "facil"
                        ? "bg-bat-success/10 text-bat-success"
                        : questao.dificuldade === "dificil"
                        ? "bg-bat-error/10 text-bat-error"
                        : "bg-bat-warning/10 text-bat-warning"
                    }`}
                  >
                    {ROTULO_DIFICULDADE[questao.dificuldade] ?? "Médio"}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {questao.materias?.nome && (
                  <Etiqueta destaque>
                    {questao.materias.icone_emoji} {questao.materias.nome}
                  </Etiqueta>
                )}
                {questao.assuntos?.nome && <Etiqueta>{questao.assuntos.nome}</Etiqueta>}
                {questao.numero_original && (
                  <span className="text-[11px] text-bat-text-muted">
                    Questão {questao.numero_original} da prova original
                  </span>
                )}
              </div>
            </header>

            {/* Questão anulada pela banca */}
            {questao.anulada && (
              <div className="mb-5 rounded-xl border border-bat-warning/35 bg-bat-warning/10 px-4 py-3">
                <p className="text-sm font-bold text-bat-warning">
                  ⚠️ Questão anulada pela banca
                </p>
                <p className="mt-1 text-xs leading-relaxed text-bat-text-secondary">
                  Vale como acerto para todos os candidatos. Ela continua aqui
                  porque o conteúdo cobrado segue caindo — mas qualquer
                  alternativa que você marcar conta como correta.
                </p>
              </div>
            )}

            {/* ─── Texto base ─── */}
            {questao.texto_base && (
              <div className="mb-5 rounded-xl border-l-4 border-bat-gold-400/50 bg-bat-bg-secondary/50 px-4 py-3.5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-bat-text-muted">
                  Texto base
                </p>
                <div className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
                  {questao.texto_base}
                </div>
              </div>
            )}

            {/* ─── Figura ─── */}
            <QuadroFigura
              descricao={questao.figura_descricao}
              svg={questao.figura_svg}
            />

            {/* ─── Enunciado ─── */}
            <div className="mb-6 whitespace-pre-line text-base leading-relaxed text-bat-text">
              {questao.enunciado}
            </div>

            {/* ─── Alternativas ─── */}
            <div className="mb-6 space-y-3">
              {questao.alternativas?.map((alt) => {
                const correta = resultado?.resposta_correta === alt.letra;
                const marcada = escolhida === alt.letra;

                let estilo =
                  "bg-bat-bg-secondary border-bat-border text-bat-text-secondary hover:border-bat-gold-400/30 hover:bg-bat-bg-elevated";
                if (resultado) {
                  if (correta) {
                    estilo =
                      "bg-bat-success/10 border-bat-success/45 text-bat-success font-medium";
                  } else if (marcada) {
                    estilo = "bg-bat-error/10 border-bat-error/45 text-bat-error";
                  } else {
                    estilo =
                      "bg-bat-bg-secondary border-bat-border text-bat-text-disabled opacity-50";
                  }
                } else if (marcada) {
                  estilo =
                    "bg-bat-gold-400/10 border-bat-gold-400/45 text-bat-gold-400 font-medium";
                }

                return (
                  <button
                    key={alt.letra}
                    onClick={() => !resultado && setEscolhida(alt.letra)}
                    disabled={!!resultado}
                    className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${estilo}`}
                  >
                    <span className="mt-px shrink-0 font-bold">{alt.letra})</span>
                    <span className="whitespace-pre-line">{alt.texto}</span>
                    {resultado && correta && <span className="ml-auto">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* ─── Ações ─── */}
            {!resultado ? (
              <button
                onClick={responder}
                disabled={!escolhida || enviando}
                className="btn-primary px-8 py-3 disabled:opacity-30"
              >
                {enviando ? "Registrando..." : "Confirmar resposta"}
              </button>
            ) : (
              <div>
                {/* Veredito */}
                <div
                  className={`mb-4 rounded-xl border p-4 ${
                    resultado.correta
                      ? "border-bat-success/30 bg-bat-success/10"
                      : "border-bat-error/30 bg-bat-error/10"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`heading text-base font-bold ${
                        resultado.correta ? "text-bat-success" : "text-bat-error"
                      }`}
                    >
                      {resultado.correta ? "✅ Acertou!" : "❌ Não foi dessa vez"}
                    </p>
                    <span className="rounded-lg border border-bat-gold-400/25 bg-bat-gold-400/10 px-2.5 py-1 text-xs font-bold text-bat-gold-400">
                      +{resultado.xp_ganho} XP
                    </span>
                  </div>

                  {/* Mensagem motivadora — o ponto alto de errar aqui */}
                  {resultado.frase_motivacional && (
                    <p className="mt-2.5 text-sm italic leading-relaxed text-bat-text-secondary">
                      🦇 {resultado.frase_motivacional}
                    </p>
                  )}

                  {resultado.badges_novas.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
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
                          {b.icone} Nova insígnia: {b.nome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ver gabarito primeiro OU pular direto */}
                <div className="flex flex-wrap gap-3">
                  {!mostrarGabarito && (
                    <button
                      onClick={() => setMostrarGabarito(true)}
                      className="btn-secondary px-6 py-3"
                    >
                      📖 Ver gabarito comentado
                    </button>
                  )}
                  <button
                    onClick={proxima}
                    disabled={acabaram}
                    className="btn-primary px-8 py-3 disabled:opacity-40"
                  >
                    {acabaram ? "Fim das questões deste filtro" : "Próxima questão →"}
                  </button>
                </div>

                {/* Ao errar, insistimos para o aluno entender antes de seguir */}
                {!resultado.correta && !mostrarGabarito && (
                  <p className="mt-3 text-xs text-bat-text-muted">
                    Vale a pena abrir o gabarito antes de seguir — é entendendo
                    o porquê que essa questão para de te derrubar.
                  </p>
                )}

                {mostrarGabarito && (
                  <ResolucaoGabarito
                    respostaCorreta={resultado.resposta_correta}
                    explicacao={resultado.explicacao}
                    explicacaoAlternativas={resultado.explicacao_alternativas}
                    alternativas={questao.alternativas}
                    passos={resultado.resolucao_passos}
                    figuraDescricao={resultado.figura_descricao}
                    figuraSvg={resultado.figura_svg}
                    precisaResolucao={resultado.precisa_resolucao}
                    alternativaEscolhida={escolhida}
                    revisao={resultado.revisao}
                  />
                )}
              </div>
            )}

            {/* Índice de acerto da comunidade */}
            {questao.vezes_respondida != null && questao.vezes_respondida > 10 && (
              <p className="mt-5 border-t border-bat-border/50 pt-3 text-[11px] text-bat-text-muted">
                {Math.round(
                  ((questao.vezes_acertada ?? 0) / questao.vezes_respondida) * 100
                )}
                % dos alunos da caverna acertaram esta questão.
              </p>
            )}
          </article>
        )}
      </section>
    </div>
  );
}

// ─── Auxiliares de layout ────────────────────────────────────
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-bat-text-muted">{label}</label>
      {children}
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-bat-text-secondary">{rotulo}</span>
      <span className="font-medium text-bat-text">{valor}</span>
    </div>
  );
}

function Etiqueta({
  children,
  destaque,
}: {
  children: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <span
      className={`rounded-lg px-2.5 py-1 text-xs ${
        destaque
          ? "border border-bat-gold-400/20 bg-bat-gold-400/10 font-bold text-bat-gold-400"
          : "bg-bat-bg-secondary text-bat-text-muted"
      }`}
    >
      {children}
    </span>
  );
}

function EsqueletoQuestao() {
  return (
    <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-6">
      <div className="skeleton mb-4 h-7 w-48 rounded-lg" />
      <div className="skeleton mb-2 h-4 w-full rounded" />
      <div className="skeleton mb-6 h-4 w-4/5 rounded" />
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function VazioSemQuestoes({ filtros }: { filtros: { concurso: string } }) {
  return (
    <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
      <span className="mb-3 block text-4xl">🦇</span>
      <h2 className="heading mb-2 text-lg text-bat-text">
        Nenhuma questão com esses filtros
      </h2>
      <p className="mx-auto mb-5 max-w-md text-sm text-bat-text-secondary">
        {filtros.concurso !== "todos"
          ? `Ainda não há questões cadastradas para ${filtros.concurso} com essa combinação. Tente afrouxar um filtro.`
          : "Afrouxe um dos filtros ou desmarque “só questões inéditas”."}
      </p>
      <Link href="/concursos" className="btn-secondary inline-block px-5 py-2.5 no-underline">
        Explorar concursos
      </Link>
    </div>
  );
}

// useSearchParams exige fronteira de Suspense no App Router.
export default function QuestoesPage() {
  return (
    <Suspense fallback={<EsqueletoQuestao />}>
      <BancoDeQuestoes />
    </Suspense>
  );
}
