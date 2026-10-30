"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";
import { QuadroFigura } from "@/components/questoes/QuadroFigura";
import { MathText } from "@/components/MathText";

type Fila = "resolucao" | "figura";

const FILAS: { chave: Fila; rotulo: string; emoji: string; badge: string; ajuda: string }[] = [
  {
    chave: "resolucao",
    rotulo: "Gabaritos Sem Explicação",
    emoji: "✍️",
    badge: "Explicações",
    ajuda: "Questões que só têm a letra certa (gabarito seco). Adicione a explicação e o passo a passo para o aluno entender o porquê.",
  },
  {
    chave: "figura",
    rotulo: "Questões Sem Ilustração",
    emoji: "📐",
    badge: "Desenhos / Figuras",
    ajuda: "Questões com figuras ausentes extraídas de provas (desenhos de geometria, física, ou tirinhas e charges de português).",
  },
];

interface Passo {
  titulo: string;
  conteudo: string;
  formula?: string | null;
}

interface QuestaoPendente {
  id: string;
  enunciado: string;
  texto_base: string | null;
  alternativas: { letra: string; texto: string }[];
  resposta_correta: string;
  explicacao: string | null;
  resolucao_passos: Passo[] | null;
  resolucao_status: string;
  precisa_resolucao: boolean;
  figura_descricao: string | null;
  figura_svg: string | null;
  ano: number | null;
  dia_prova: string | null;
  numero_original: string | null;
  dificuldade: string;
  anulada: boolean;
  vezes_respondida: number | null;
  vezes_acertada: number | null;
  concursos: { sigla: string; nome: string } | null;
  materias: { nome: string; icone_emoji: string | null } | null;
  assuntos: { nome: string } | null;
}

const TITULOS_SUGERIDOS = [
  "1. O que o enunciado fornece",
  "2. Fórmula ou Teorema aplicável",
  "3. Desenvolvimento do cálculo",
  "4. Ponto de atenção / Bizu",
  "5. Conclusão e resposta correta",
];

export function PainelResolucoes() {
  const [itens, setItens] = useState<QuestaoPendente[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [fila, setFila] = useState<Fila>("resolucao");
  const [filtros, setFiltros] = useState({
    concurso: "todos",
    materia: "todas",
    ordem: "erradas",
  });
  const [busca, setBusca] = useState("");

  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<{
    explicacao: string;
    passos: Passo[];
    figura_svg: string;
  }>({ explicacao: "", passos: [], figura_svg: "" });

  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [concursos, setConcursos] = useState<{ sigla: string }[]>([]);
  const [materias, setMaterias] = useState<{ id: string; nome: string; icone_emoji: string | null }[]>([]);

  useEffect(() => {
    fetchWithAuth("/api/questoes/filtros")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) {
          if (j.data.concursos) setConcursos(j.data.concursos);
          if (j.data.materias) setMaterias(j.data.materias);
        }
      })
      .catch(() => undefined);
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const qs = new URLSearchParams({
        page: String(pagina),
        per_page: "20",
        ordem: filtros.ordem,
        filtro: fila,
      });
      if (filtros.concurso !== "todos") qs.set("concurso", filtros.concurso);
      if (filtros.materia !== "todas") qs.set("materia", filtros.materia);

      const res = await fetchWithAuth(`/api/admin/questoes/pendentes?${qs}`);
      const json = await res.json();
      if (json.success) {
        setItens(json.data.items);
        setTotal(json.data.total);
      }
    } catch {
      setAviso("Não foi possível carregar as questões pendentes.");
    } finally {
      setCarregando(false);
    }
  }, [pagina, filtros, fila]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrir = (q: QuestaoPendente) => {
    if (abertaId === q.id) {
      setAbertaId(null);
      return;
    }
    setAbertaId(q.id);
    setAviso(null);
    setRascunho({
      explicacao: q.explicacao ?? "",
      passos: q.resolucao_passos?.length
        ? q.resolucao_passos
        : [
            { titulo: TITULOS_SUGERIDOS[0], conteudo: "", formula: null },
            { titulo: TITULOS_SUGERIDOS[1], conteudo: "", formula: null },
          ],
      figura_svg: q.figura_svg ?? "",
    });
  };

  const salvar = async (q: QuestaoPendente) => {
    setSalvando(true);
    setAviso(null);
    try {
      const res = await fetchWithAuth(`/api/admin/questoes/${q.id}/resolucao`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          explicacao: rascunho.explicacao,
          passos: rascunho.passos.filter((p) => p.conteudo.trim()),
          figura_svg: rascunho.figura_svg,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        setAviso(json.error ?? "Não consegui salvar a resolução.");
        return;
      }

      const alvo = `${q.concursos?.sigla || "Questão"} ${q.ano ? `(${q.ano})` : ""}`;
      const temSvg = !!rascunho.figura_svg.trim();
      const resolveu = fila === "figura" ? temSvg : true;

      if (resolveu) {
        setItens((lista) => lista.filter((i) => i.id !== q.id));
        setTotal((t) => Math.max(0, t - 1));
        setAbertaId(null);
        setAviso(
          fila === "figura"
            ? `✅ Ilustração de ${alvo} salva com sucesso!`
            : `✅ Resolução completa de ${alvo} publicada com sucesso!`
        );
      } else {
        setItens((lista) =>
          lista.map((i) =>
            i.id === q.id
              ? { ...i, explicacao: rascunho.explicacao, figura_svg: null }
              : i
          )
        );
        setAviso(
          `Salvo parcialmente, mas ${alvo} continua pendente de ilustração SVG.`
        );
      }
    } catch {
      setAviso("Falha de conexão ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const alterarPasso = (i: number, campo: keyof Passo, valor: string) => {
    setRascunho((r) => ({
      ...r,
      passos: r.passos.map((p, idx) =>
        idx === i ? { ...p, [campo]: valor } : p
      ),
    }));
  };

  const adicionarPasso = () => {
    const proximoTitulo = TITULOS_SUGERIDOS[rascunho.passos.length] || `Passo ${rascunho.passos.length + 1}`;
    setRascunho((r) => ({
      ...r,
      passos: [...r.passos, { titulo: proximoTitulo, conteudo: "", formula: null }],
    }));
  };

  const itensFiltrados = itens.filter((q) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      q.enunciado.toLowerCase().includes(termo) ||
      (q.concursos?.sigla && q.concursos.sigla.toLowerCase().includes(termo)) ||
      (q.materias?.nome && q.materias.nome.toLowerCase().includes(termo)) ||
      (q.assuntos?.nome && q.assuntos.nome.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="space-y-6">
      {/* ═══ CARTÃO GUIA DIDÁTICO ADAPTÁVEL ═══ */}
      <div className="rounded-3xl border border-bat-border bg-gradient-to-br from-bat-bg-card via-bat-bg-card to-bat-bg-secondary p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5 border-b border-bat-border/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bat-gold-400/10 border border-bat-gold-400/25 text-bat-gold-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <span>{fila === "figura" ? "📐" : "✍️"}</span>{" "}
              {fila === "figura" ? "Ilustração Técnica & Artes Visuais" : "Moderação de Conteúdo Pedagógico"}
            </div>
            <h2 className="heading text-2xl font-black text-white">
              {fila === "figura" ? "Questões com Figuras & Ilustrações Pendentes" : "Comentar Questões & Gabaritos"}
            </h2>
            <p className="text-bat-text-secondary text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {fila === "figura"
                ? "Adicione ilustrações em vetor (SVG) para questões de Geometria, Física ou Tirinhas/Charges de Português extraídas das provas que não vieram com imagem renderizada."
                : "Escreva explicações e resoluções passo a passo com fórmulas matemáticas para que os soldados da BatCaverna não fiquem apenas com a letra seca do gabarito."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-bat-gold-400/30 bg-bat-gold-400/10 px-5 py-3 text-center shadow-xs">
              <span className="text-[10px] font-bold text-bat-text-muted uppercase tracking-wider block">
                {fila === "figura" ? "Figuras na Fila" : "Resoluções na Fila"}
              </span>
              <span className="heading text-2xl font-black text-bat-gold-400">
                {total.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Passos Rápidos de Uso Adaptados */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
          <div className="p-3.5 rounded-2xl bg-bat-bg-elevated/40 border border-bat-border/60">
            <span className="text-base mb-1 block font-bold text-bat-gold-400">
              1️⃣ Escolha a Questão
            </span>
            <p className="text-[11px] text-bat-text-secondary leading-relaxed">
              {fila === "figura"
                ? "Filtre por concurso e matéria (ex: Matemática para geometria, Português para charges/tirinhas)."
                : "A lista prioriza as questões que os alunos mais erram em simulados e provas oficiais."}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-bat-bg-elevated/40 border border-bat-border/60">
            <span className="text-base mb-1 block font-bold text-bat-gold-400">
              {fila === "figura" ? "2️⃣ Insira o Desenho / SVG" : "2️⃣ Escreva a Explicação"}
            </span>
            <p className="text-[11px] text-bat-text-secondary leading-relaxed">
              {fila === "figura"
                ? "Cole o código vetorial <svg> correspondente à descrição extraída da prova para renderização nítida."
                : "Explique o raciocínio em texto simples e divida o desenvolvimento do cálculo em etapas."}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-bat-bg-elevated/40 border border-bat-border/60">
            <span className="text-base mb-1 block font-bold text-bat-gold-400">
              3️⃣ Salve & Publique
            </span>
            <p className="text-[11px] text-bat-text-secondary leading-relaxed">
              {fila === "figura"
                ? "Ao salvar, o desenho é exibido imediatamente no enunciado da questão para todos os estudantes."
                : "A resolução entra no ar imediatamente no gabarito comentado acessado pelos alunos."}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ ABAS DE PENDÊNCIA & FILTROS ═══ */}
      <div className="space-y-3 bg-bat-bg-card border border-bat-border p-4 rounded-2xl shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Seletor de Fila */}
          <div className="flex flex-wrap gap-2">
            {FILAS.map((f) => {
              const ativa = fila === f.chave;
              return (
                <button
                  key={f.chave}
                  onClick={() => {
                    if (fila === f.chave) return;
                    setFila(f.chave);
                    setPagina(1);
                    setAbertaId(null);
                    setAviso(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    ativa
                      ? "bg-bat-gold-400 text-black shadow-md shadow-bat-gold-400/20"
                      : "bg-bat-bg-primary text-bat-text-secondary hover:text-white border border-bat-border"
                  }`}
                >
                  <span className="text-sm">{f.emoji}</span>
                  <span>{f.rotulo}</span>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
                      ativa ? "bg-black text-bat-gold-400" : "bg-bat-bg-elevated text-bat-text-muted"
                    }`}
                  >
                    {f.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filtros por Concurso, Matéria e Ordem */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filtros.concurso}
              onChange={(e) => {
                setPagina(1);
                setFiltros({ ...filtros, concurso: e.target.value });
              }}
              className="input-field text-xs py-2 px-3 min-w-[140px]"
            >
              <option value="todos">Todos os Concursos</option>
              {concursos.map((c) => (
                <option key={c.sigla} value={c.sigla}>
                  {c.sigla}
                </option>
              ))}
            </select>

            <select
              value={filtros.materia}
              onChange={(e) => {
                setPagina(1);
                setFiltros({ ...filtros, materia: e.target.value });
              }}
              className="input-field text-xs py-2 px-3 min-w-[140px]"
            >
              <option value="todas">Todas as Matérias</option>
              {materias.map((m) => (
                <option key={m.id} value={m.nome}>
                  {m.icone_emoji ? `${m.icone_emoji} ` : ""}{m.nome}
                </option>
              ))}
            </select>

            <select
              value={filtros.ordem}
              onChange={(e) => {
                setPagina(1);
                setFiltros({ ...filtros, ordem: e.target.value });
              }}
              className="input-field text-xs py-2 px-3 min-w-[170px]"
            >
              <option value="erradas">Mais erradas primeiro (Alta demanda)</option>
              <option value="recentes">Provas mais recentes primeiro</option>
            </select>
          </div>
        </div>

        {/* Busca por texto do enunciado */}
        <div className="relative">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por palavra no enunciado, disciplina, assunto..."
            className="input-field text-xs py-2 px-3 w-full"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-3 top-2.5 text-xs text-bat-text-muted hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {aviso && (
        <div className="p-3.5 rounded-xl border border-bat-gold-400/30 bg-bat-gold-400/10 text-xs font-bold text-bat-gold-400 flex items-center justify-between">
          <span>{aviso}</span>
          <button onClick={() => setAviso(null)} className="text-xs hover:underline cursor-pointer">
            ✕ Fechar
          </button>
        </div>
      )}

      {/* ═══ LISTA DE QUESTÕES PENDENTES ═══ */}
      {carregando ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : itensFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-12 text-center">
          <span className="text-4xl mb-3 block">{fila === "figura" ? "🎨" : "🎉"}</span>
          <h3 className="heading text-lg font-bold text-bat-text">
            {fila === "figura"
              ? "Nenhuma questão pendente de ilustração nesta categoria!"
              : "Nenhuma questão pendente de resolução nesta categoria!"}
          </h3>
          <p className="text-xs text-bat-text-secondary mt-1">
            {busca.trim()
              ? "Tente ajustar o termo de busca ou limpar os filtros."
              : "Todas as questões selecionadas já possuem o conteúdo cadastrado."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {itensFiltrados.map((q) => {
            const aberta = abertaId === q.id;
            const taxa =
              q.vezes_respondida && q.vezes_respondida > 0
                ? Math.round(((q.vezes_acertada ?? 0) / q.vezes_respondida) * 100)
                : null;

            const ehPortuguesOuHumanas =
              q.materias?.nome === "Português" ||
              q.materias?.nome === "Linguagens" ||
              q.materias?.nome === "Literatura" ||
              q.materias?.nome === "História" ||
              q.materias?.nome === "Geografia";

            return (
              <article
                key={q.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  aberta
                    ? "border-bat-gold-400/60 bg-bat-bg-card shadow-xl shadow-bat-gold-400/5"
                    : "border-bat-border bg-bat-bg-card hover:border-bat-gold-400/30"
                }`}
              >
                {/* Cabeçalho do Card */}
                <button
                  onClick={() => abrir(q)}
                  className="flex w-full cursor-pointer items-start justify-between gap-4 p-4.5 text-left transition-colors hover:bg-bat-bg-elevated/40"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-bat-gold-400/30 bg-bat-gold-400/15 px-2.5 py-0.5 text-xs font-mono font-bold text-bat-gold-400">
                        {q.concursos?.sigla || "CONCURSO"} {q.ano ? `· ${q.ano}` : ""}
                      </span>

                      {q.materias?.nome && (
                        <span className="rounded-lg bg-bat-bg-secondary px-2.5 py-0.5 text-xs font-medium text-bat-text-secondary border border-bat-border/50">
                          {q.materias.icone_emoji} {q.materias.nome}
                        </span>
                      )}

                      {/* Identificação Didática da Figura para tirar dúvidas do Admin */}
                      {fila === "figura" && (
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[11px] font-bold border ${
                            ehPortuguesOuHumanas
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                              : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                          }`}
                        >
                          {ehPortuguesOuHumanas ? "📰 Tirinha / Charge Visual" : "📐 Geometria / Gráfico"}
                        </span>
                      )}

                      {q.precisa_resolucao && fila !== "figura" && (
                        <span className="rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-bold text-cyan-400">
                          Exige Cálculo
                        </span>
                      )}

                      {taxa !== null && (
                        <span
                          className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                            taxa < 40
                              ? "bg-red-500/15 text-red-400 border border-red-500/30"
                              : "bg-bat-bg-secondary text-bat-text-muted border border-bat-border/50"
                          }`}
                        >
                          {taxa}% de acertos ({q.vezes_respondida} resoluções)
                        </span>
                      )}
                    </div>

                    {/* Resumo da Descrição da Figura para orientar o admin */}
                    {fila === "figura" && q.figura_descricao && (
                      <div className="rounded-lg bg-bat-bg-secondary/70 border border-bat-border/70 px-3 py-1.5 text-xs text-bat-gold-400/90 font-mono">
                        <span className="font-bold text-bat-text-muted uppercase text-[10px] block mb-0.5">
                          Descrição Extraída da Prova Original:
                        </span>
                        <p className="line-clamp-2 italic font-sans text-bat-text-secondary text-[11px]">
                          &ldquo;{q.figura_descricao}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="line-clamp-2 text-xs sm:text-sm text-bat-text/90 leading-relaxed font-sans">
                      <MathText>{q.enunciado}</MathText>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-bat-gold-400 bg-bat-gold-400/10 px-2.5 py-1 rounded-lg border border-bat-gold-400/20">
                      {aberta
                        ? "Fechar Editor"
                        : fila === "figura"
                        ? "📐 Adicionar Ilustração"
                        : "Escrever Resolução"}
                    </span>
                    <span
                      className={`text-bat-text-muted transition-transform duration-200 ${
                        aberta ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </div>
                </button>

                {/* ═══ EDITOR EXPANDIDO DA QUESTÃO ═══ */}
                {aberta && (
                  <div className="border-t border-bat-border bg-bat-bg-primary/60 p-5 sm:p-6 space-y-6">
                    {/* Visualização de Apoio (Como o aluno lê a questão) */}
                    <div className="rounded-2xl border border-bat-border/80 bg-bat-bg-card p-5 space-y-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-bat-text-muted block">
                        Enunciado Completo da Questão & Alternativas
                      </span>

                      {q.texto_base && (
                        <div className="p-3 rounded-xl border border-bat-border bg-bat-bg-secondary/40 text-xs leading-relaxed text-bat-text-secondary max-h-48 overflow-y-auto">
                          <MathText>{q.texto_base}</MathText>
                        </div>
                      )}

                      <QuadroFigura descricao={q.figura_descricao} svg={rascunho.figura_svg || q.figura_svg} />

                      <p className="text-xs sm:text-sm text-bat-text font-medium leading-relaxed whitespace-pre-line">
                        <MathText>{q.enunciado}</MathText>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {q.alternativas?.map((a) => (
                          <div
                            key={a.letra}
                            className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                              a.letra === q.resposta_correta
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                                : "bg-bat-bg-elevated/30 border-bat-border/60 text-bat-text-secondary"
                            }`}
                          >
                            <span className="font-mono text-bat-gold-400 uppercase">
                              {a.letra})
                            </span>
                            <span className="flex-1">
                              <MathText>{a.texto}</MathText>
                            </span>
                            {a.letra === q.resposta_correta && (
                              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                                Gabarito Oficial
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SE ESTIVER NA FILA DE FIGURAS: O CAMPO DE ILUSTRAÇÃO FICA EM PRIMEIRO LUGAR! */}
                    {fila === "figura" && (
                      <div className="space-y-3 rounded-2xl border border-bat-gold-400/40 bg-bat-gold-400/5 p-4.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-bat-gold-400 flex items-center gap-1.5">
                            <span>📐</span> Inserir Ilustração Técnica ou Arte (SVG)
                          </label>
                          <span className="text-[11px] text-bat-text-muted">
                            Cole o código &lt;svg&gt; do desenho geométrico, gráfico ou tirinha
                          </span>
                        </div>

                        {q.figura_descricao && (
                          <div className="rounded-xl border border-bat-gold-400/25 bg-bat-bg-card p-3 text-xs text-bat-text-secondary">
                            <span className="font-bold text-bat-gold-400 block mb-1">
                              💡 Descrição original identificada na prova:
                            </span>
                            <p className="italic leading-relaxed">{q.figura_descricao}</p>
                          </div>
                        )}

                        <textarea
                          value={rascunho.figura_svg}
                          onChange={(e) =>
                            setRascunho({ ...rascunho, figura_svg: e.target.value })
                          }
                          rows={6}
                          placeholder="<svg viewBox='0 0 400 300' xmlns='http://www.w3.org/2000/svg'> ... </svg>"
                          className="input-field text-xs font-mono w-full"
                        />

                        {/* Pré-visualização do SVG em tempo real */}
                        {rascunho.figura_svg && (
                          <div className="mt-3 p-4 rounded-xl border border-bat-border bg-bat-bg-card">
                            <span className="text-[10px] font-mono font-bold uppercase text-bat-text-muted block mb-2">
                              Prévia em Tempo Real da Imagem:
                            </span>
                            <div
                              className="w-full flex justify-center items-center overflow-x-auto max-h-64"
                              dangerouslySetInnerHTML={{ __html: rascunho.figura_svg }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Campo: Explicação Geral / Conceitual */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-bat-text flex items-center gap-1.5">
                          <span>💡</span> Explicação Geral do Gabarito
                        </label>
                        <span className="text-[11px] text-bat-text-muted">
                          Explicação em texto para o aluno entender a alternativa
                        </span>
                      </div>
                      <textarea
                        value={rascunho.explicacao}
                        onChange={(e) =>
                          setRascunho({ ...rascunho, explicacao: e.target.value })
                        }
                        rows={3}
                        placeholder="Escreva de forma clara por que a alternativa correta é a certa e por que as outras estão incorretas..."
                        className="input-field w-full text-xs sm:text-sm resize-y"
                      />
                    </div>

                    {/* Campo: Passos Detalhados de Resolução */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-bat-text flex items-center gap-1.5">
                          <span>🪜</span> Resolução Passo a Passo (Opcional)
                        </label>
                        <button
                          type="button"
                          onClick={adicionarPasso}
                          className="px-3 py-1 rounded-lg bg-bat-gold-400/15 text-bat-gold-400 border border-bat-gold-400/30 text-xs font-bold hover:bg-bat-gold-400/25 transition-colors cursor-pointer"
                        >
                          ＋ Adicionar Etapa
                        </button>
                      </div>

                      <div className="space-y-3">
                        {rascunho.passos.map((p, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-2xl border border-bat-border bg-bat-bg-card space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="w-6 h-6 rounded-full bg-bat-gold-400 text-black flex items-center justify-center font-bold text-xs shrink-0">
                                  {i + 1}
                                </span>
                                <input
                                  type="text"
                                  value={p.titulo}
                                  onChange={(e) => alterarPasso(i, "titulo", e.target.value)}
                                  placeholder="Título da etapa (ex: Teorema de Pitágoras)"
                                  className="input-field text-xs py-1.5 flex-1"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setRascunho((r) => ({
                                    ...r,
                                    passos: r.passos.filter((_, idx) => idx !== i),
                                  }))
                                }
                                className="text-xs text-bat-text-muted hover:text-red-400 p-1 cursor-pointer"
                                title="Excluir este passo"
                              >
                                ✕
                              </button>
                            </div>

                            <textarea
                              value={p.conteudo}
                              onChange={(e) => alterarPasso(i, "conteudo", e.target.value)}
                              rows={2}
                              placeholder="O que se faz nesta etapa e raciocínio aplicado..."
                              className="input-field text-xs w-full resize-y"
                            />

                            <input
                              type="text"
                              value={p.formula || ""}
                              onChange={(e) => alterarPasso(i, "formula", e.target.value)}
                              placeholder="Fórmula matemática em destaque (opcional, ex: a² = b² + c²)"
                              className="input-field text-xs font-mono text-bat-gold-400/90 py-1.5 w-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SE ESTIVER NA FILA DE RESOLUÇÃO: O CAMPO DE SVG FICA ABAIXO */}
                    {fila === "resolucao" && (
                      <div className="space-y-2 pt-2 border-t border-bat-border/50">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-bat-text flex items-center gap-1.5">
                            <span>📐</span> Código SVG da Ilustração (Opcional)
                          </label>
                          <span className="text-[11px] text-bat-text-muted">
                            Cole o código &lt;svg&gt; se a questão depender de um desenho
                          </span>
                        </div>
                        <textarea
                          value={rascunho.figura_svg}
                          onChange={(e) =>
                            setRascunho({ ...rascunho, figura_svg: e.target.value })
                          }
                          rows={3}
                          placeholder="<svg viewBox='0 0 300 200' ...> ... </svg>"
                          className="input-field text-xs font-mono w-full"
                        />
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-bat-border/60">
                      <button
                        type="button"
                        onClick={() => setAbertaId(null)}
                        className="py-2.5 px-5 rounded-xl bg-bat-bg-secondary border border-bat-border text-bat-text-muted text-xs hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={salvando}
                        onClick={() => salvar(q)}
                        className="btn-primary py-2.5 px-6 text-xs font-bold disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        <span>
                          {salvando
                            ? "Salvando..."
                            : fila === "figura"
                            ? "Salvar Ilustração & Publicar 📐"
                            : "Salvar & Publicar Resolução ⚡"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
