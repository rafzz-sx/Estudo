"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";
import { QuadroFigura } from "@/components/questoes/QuadroFigura";

interface Alternativa {
  letra: string;
  texto: string;
}

interface Questao {
  id: string;
  enunciado: string;
  texto_base?: string | null;
  alternativas: Alternativa[] | null;
  resposta_correta: string;
  explicacao?: string | null;
  anulada: boolean;
  ano?: number | null;
  banca?: string | null;
  dificuldade?: string | null;
  numero_original?: string | null;
  figura_descricao?: string | null;
  figura_svg?: string | null;
  vezes_respondida?: number | null;
  vezes_acertada?: number | null;
  criado_em: string;
  concursos?: { id: string; sigla: string; nome: string } | null;
  materias?: { id: string; nome: string; icone_emoji: string | null } | null;
  assuntos?: { id: string; nome: string } | null;
}

interface ConcursoOpcao {
  id: string;
  sigla: string;
  nome: string;
}

export function PainelBancoQuestoes() {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);

  // Filtros
  const [busca, setBusca] = useState("");
  const [concursoFiltro, setConcursoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState<"todas" | "ativas" | "anuladas" | "sem_explicacao" | "com_figura">("todas");
  const [ordemFiltro, setOrdemFiltro] = useState("recentes");
  const [concursos, setConcursos] = useState<ConcursoOpcao[]>([]);

  // Questão em visualização expandida
  const [expandidaId, setExpandidaId] = useState<string | null>(null);

  // Questão em edição
  const [questaoEditando, setQuestaoEditando] = useState<Questao | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Exclusão
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  // Carregar concursos para o filtro
  useEffect(() => {
    fetchWithAuth("/api/concursos")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setConcursos(j.data);
      })
      .catch(() => {});
  }, []);

  const carregarQuestoes = useCallback(async (pag: number = pagina) => {
    setCarregando(true);
    setAviso(null);
    try {
      const params = new URLSearchParams({
        page: String(pag),
        per_page: "15",
        status: statusFiltro,
        ordem: ordemFiltro,
      });

      if (concursoFiltro && concursoFiltro !== "todos") {
        params.set("concurso", concursoFiltro);
      }
      if (busca.trim().length >= 2) {
        params.set("busca", busca.trim());
      }

      const res = await fetchWithAuth(`/api/admin/questoes?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setQuestoes(json.data.items || []);
        setTotal(json.data.total || 0);
        setPagina(json.data.page || 1);
        setTotalPaginas(json.data.total_pages || 1);
      } else {
        setAviso({ tipo: "erro", msg: json.error || "Erro ao carregar questões." });
      }
    } catch {
      setAviso({ tipo: "erro", msg: "Falha de conexão com a API de questões." });
    } finally {
      setCarregando(false);
    }
  }, [pagina, statusFiltro, ordemFiltro, concursoFiltro, busca]);

  useEffect(() => {
    carregarQuestoes(1);
  }, [statusFiltro, ordemFiltro, concursoFiltro]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(1);
    carregarQuestoes(1);
  };

  const handleAlternarAnulada = async (q: Questao) => {
    const novoStatus = !q.anulada;
    const msg = novoStatus
      ? `Marcar a questão de ${q.concursos?.sigla || ""} ${q.ano || ""} como ANULADA? Ela deixará de pontuar para os alunos.`
      : `Reativar a questão de ${q.concursos?.sigla || ""} ${q.ano || ""}? Ela voltará para o fluxo normal de estudos.`;

    if (!confirm(msg)) return;

    try {
      const res = await fetchWithAuth("/api/admin/questoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: q.id, anulada: novoStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setAviso({
          tipo: "ok",
          msg: novoStatus ? "Questão marcada como ANULADA." : "Questão reativada com sucesso.",
        });
        setQuestoes((prev) =>
          prev.map((item) => (item.id === q.id ? { ...item, anulada: novoStatus } : item))
        );
      } else {
        setAviso({ tipo: "erro", msg: json.error || "Erro ao alterar status." });
      }
    } catch {
      setAviso({ tipo: "erro", msg: "Falha ao comunicar com o servidor." });
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja EXCLUIR DEFINITIVAMENTE esta questão do banco de dados? Esta ação não pode ser desfeita.")) {
      return;
    }

    setExcluindoId(id);
    try {
      const res = await fetchWithAuth(`/api/admin/questoes?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setAviso({ tipo: "ok", msg: "Questão excluída definitivamente com sucesso." });
        setQuestoes((prev) => prev.filter((q) => q.id !== id));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        setAviso({ tipo: "erro", msg: json.error || "Erro ao excluir questão." });
      }
    } catch {
      setAviso({ tipo: "erro", msg: "Erro ao tentar excluir questão." });
    } finally {
      setExcluindoId(null);
    }
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questaoEditando) return;

    setSalvandoEdicao(true);
    try {
      const res = await fetchWithAuth("/api/admin/questoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: questaoEditando.id,
          enunciado: questaoEditando.enunciado,
          resposta_correta: questaoEditando.resposta_correta,
          explicacao: questaoEditando.explicacao,
          alternativas: questaoEditando.alternativas,
          ano: questaoEditando.ano,
          banca: questaoEditando.banca,
          dificuldade: questaoEditando.dificuldade,
          anulada: questaoEditando.anulada,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAviso({ tipo: "ok", msg: "Questão atualizada com sucesso!" });
        setQuestoes((prev) =>
          prev.map((q) => (q.id === questaoEditando.id ? { ...q, ...json.data } : q))
        );
        setQuestaoEditando(null);
      } else {
        setAviso({ tipo: "erro", msg: json.error || "Erro ao salvar alterações." });
      }
    } catch {
      setAviso({ tipo: "erro", msg: "Falha de conexão ao salvar questão." });
    } finally {
      setSalvandoEdicao(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ═══ CABEÇALHO DO MÓDULO ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bat-bg-primary/80 border border-bat-border p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h2 className="heading text-xl text-bat-text">Gestão do Banco de Questões</h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30">
              {total.toLocaleString("pt-BR")} questões
            </span>
          </div>
          <p className="text-bat-text-secondary text-xs mt-1">
            Pesquisa em tempo real, auditoria de gabaritos, edição de enunciados e gestão de anulações.
          </p>
        </div>

        <button
          onClick={() => carregarQuestoes(pagina)}
          disabled={carregando}
          className="btn-secondary py-2 px-4 text-xs font-bold self-start sm:self-auto cursor-pointer"
        >
          {carregando ? "Carregando..." : "🔄 Atualizar"}
        </button>
      </div>

      {/* Alertas */}
      {aviso && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border ${
            aviso.tipo === "ok"
              ? "bg-bat-success/10 border-bat-success/30 text-bat-success font-bold"
              : "bg-bat-error/10 border-bat-error/30 text-bat-error font-bold"
          }`}
        >
          <span>{aviso.msg}</span>
          <button
            onClick={() => setAviso(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ═══ BARRA DE BUSCA E FILTROS ═══ */}
      <div className="bg-bat-bg-card border border-bat-border p-5 rounded-2xl space-y-4">
        <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por trecho do enunciado (mín. 2 caracteres)..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full input-field text-xs pl-9"
            />
            <span className="absolute left-3 top-2.5 text-xs text-bat-text-muted">🔍</span>
          </div>

          <button
            type="submit"
            className="btn-primary py-2 px-5 text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            Buscar Questões
          </button>
        </form>

        {/* Linha de Filtros Avançados */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-bat-border/50 text-xs">
          {/* Concurso */}
          <div>
            <label className="text-[10px] text-bat-text-muted uppercase font-bold block mb-1">
              Concurso
            </label>
            <select
              value={concursoFiltro}
              onChange={(e) => {
                setConcursoFiltro(e.target.value);
                setPagina(1);
              }}
              className="w-full input-field text-xs bg-bat-bg-primary"
            >
              <option value="todos">Todos os Concursos</option>
              {concursos.map((c) => (
                <option key={c.id} value={c.sigla}>
                  {c.sigla} — {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] text-bat-text-muted uppercase font-bold block mb-1">
              Estado da Questão
            </label>
            <select
              value={statusFiltro}
              onChange={(e) => {
                setStatusFiltro(e.target.value as any);
                setPagina(1);
              }}
              className="w-full input-field text-xs bg-bat-bg-primary"
            >
              <option value="todas">Todas as Questões</option>
              <option value="ativas">🟢 Apenas Ativas</option>
              <option value="anuladas">⚠️ Anuladas pela Banca</option>
              <option value="sem_explicacao">✍️ Sem Gabarito Comentado</option>
              <option value="com_figura">📐 Com Imagem / SVG</option>
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <label className="text-[10px] text-bat-text-muted uppercase font-bold block mb-1">
              Ordenar Por
            </label>
            <select
              value={ordemFiltro}
              onChange={(e) => {
                setOrdemFiltro(e.target.value);
                setPagina(1);
              }}
              className="w-full input-field text-xs bg-bat-bg-primary"
            >
              <option value="recentes">Mais Recentes (Ano / Data)</option>
              <option value="antigas">Mais Antigas</option>
              <option value="mais_respondidas">Mais Respondidas</option>
              <option value="mais_erros">Maior Taxa de Erro</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══ LISTAGEM DE QUESTÕES ═══ */}
      {carregando ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      ) : questoes.length === 0 ? (
        <div className="p-12 text-center text-bat-text-muted bg-bat-bg-card border border-bat-border rounded-2xl space-y-2">
          <span className="text-4xl block">🔍</span>
          <p className="text-sm font-bold text-bat-text">Nenhuma questão encontrada.</p>
          <p className="text-xs">Tente ajustar os termos de busca ou filtros selecionados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questoes.map((q) => {
            const expandida = expandidaId === q.id;
            const taxaAcerto =
              q.vezes_respondida && q.vezes_respondida > 0
                ? Math.round(((q.vezes_acertada || 0) / q.vezes_respondida) * 100)
                : null;

            return (
              <div
                key={q.id}
                className={`bg-bat-bg-card border transition-all rounded-2xl p-5 space-y-4 ${
                  q.anulada
                    ? "border-bat-warning/40 bg-bat-warning/[0.02]"
                    : "border-bat-border hover:border-bat-gold-400/40"
                }`}
              >
                {/* Metadados Superiores */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bat-border/50 pb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {q.concursos && (
                      <span className="font-bold px-2.5 py-0.5 rounded-lg bg-bat-gold-400/15 text-bat-gold-400 border border-bat-gold-400/30">
                        {q.concursos.sigla}
                      </span>
                    )}
                    {q.ano && (
                      <span className="font-mono text-bat-text-secondary bg-bat-bg-primary px-2 py-0.5 rounded border border-bat-border">
                        {q.ano}
                      </span>
                    )}
                    {q.banca && (
                      <span className="text-bat-text-muted font-mono text-[11px]">
                        Banca: {q.banca}
                      </span>
                    )}
                    {q.materias && (
                      <span className="text-bat-text font-medium flex items-center gap-1">
                        <span>{q.materias.icone_emoji || "📚"}</span>
                        <span>{q.materias.nome}</span>
                      </span>
                    )}
                    {q.assuntos && (
                      <span className="text-bat-text-muted text-[11px]">
                        › {q.assuntos.nome}
                      </span>
                    )}
                    {q.numero_original && (
                      <span className="text-bat-text-muted text-[10px] font-mono">
                        (Q.{q.numero_original})
                      </span>
                    )}
                  </div>

                  {/* Badges de Status & Resposta */}
                  <div className="flex items-center gap-2">
                    {q.anulada ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-bat-warning/20 text-bat-warning border border-bat-warning/40 animate-pulse">
                        ⚠️ ANULADA PELA BANCA
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bat-success/15 text-bat-success border border-bat-success/30">
                        🟢 ATIVA
                      </span>
                    )}

                    <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-bat-gold-400 text-black shadow-sm">
                      Gabarito: {q.resposta_correta}
                    </span>
                  </div>
                </div>

                {/* Texto Base (se houver) */}
                {q.texto_base && (
                  <div className="p-3.5 bg-bat-bg-primary/70 rounded-xl border border-bat-border/60 text-xs text-bat-text-secondary italic">
                    <span className="text-[10px] uppercase font-bold text-bat-gold-400 block mb-1">
                      Texto de Apoio:
                    </span>
                    {q.texto_base}
                  </div>
                )}

                {/* Enunciado */}
                <div className="text-xs sm:text-sm text-bat-text leading-relaxed font-sans">
                  {expandida || q.enunciado.length <= 260
                    ? q.enunciado
                    : `${q.enunciado.slice(0, 260)}...`}
                </div>

                {/* Imagem / Figura da Questão */}
                {(q.figura_svg || q.figura_descricao) && (
                  <QuadroFigura
                    svg={q.figura_svg}
                    descricao={q.figura_descricao}
                    titulo="Figura da Questão"
                  />
                )}

                {/* Alternativas */}
                {q.alternativas && q.alternativas.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {q.alternativas.map((alt) => {
                      const ehGabarito =
                        alt.letra?.toUpperCase() === q.resposta_correta?.toUpperCase();
                      return (
                        <div
                          key={alt.letra}
                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-colors ${
                            ehGabarito
                              ? "bg-bat-gold-400/10 border-bat-gold-400/50 text-bat-text font-medium"
                              : "bg-bat-bg-primary/50 border-bat-border/50 text-bat-text-secondary"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                              ehGabarito
                                ? "bg-bat-gold-400 text-black"
                                : "bg-bat-bg-secondary text-bat-text-muted"
                            }`}
                          >
                            {alt.letra}
                          </span>
                          <span className="leading-snug">{alt.texto}</span>
                          {ehGabarito && (
                            <span className="ml-auto text-[10px] font-bold text-bat-gold-400 uppercase tracking-wider shrink-0">
                              ✓ Correta
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explicação / Gabarito Comentado (se houver e estiver expandido) */}
                {expandida && q.explicacao && (
                  <div className="p-4 rounded-xl bg-bat-purple-600/10 border border-bat-purple-500/30 text-xs space-y-1">
                    <span className="font-bold text-bat-purple-400 flex items-center gap-1.5">
                      <span>💡</span> Resolução & Gabarito Comentado:
                    </span>
                    <p className="text-bat-text leading-relaxed whitespace-pre-line">
                      {q.explicacao}
                    </p>
                  </div>
                )}

                {/* Rodapé da Questão: Métricas e Ações */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-bat-border/40 text-xs">
                  <div className="flex items-center gap-4 text-bat-text-muted font-mono text-[11px]">
                    <span>Respostas: {q.vezes_respondida || 0}</span>
                    {taxaAcerto !== null && (
                      <span
                        className={
                          taxaAcerto >= 70
                            ? "text-bat-success"
                            : taxaAcerto >= 45
                            ? "text-bat-warning"
                            : "text-bat-error"
                        }
                      >
                        Taxa de Acerto: {taxaAcerto}%
                      </span>
                    )}
                    {q.explicacao ? (
                      <span className="text-emerald-400 font-bold">✓ Tem Comentário</span>
                    ) : (
                      <span className="text-amber-400">⚠️ Sem Comentário</span>
                    )}
                  </div>

                  {/* Botões de Ação Administrativa */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {q.enunciado.length > 260 && (
                      <button
                        type="button"
                        onClick={() => setExpandidaId(expandida ? null : q.id)}
                        className="px-2.5 py-1 text-[11px] rounded-lg border border-bat-border hover:border-bat-gold-400/50 text-bat-text-secondary hover:text-bat-text cursor-pointer"
                      >
                        {expandida ? "Recolher ▲" : "Ver Completa ▼"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setQuestaoEditando(q)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-bat-gold-400/40 text-bat-gold-400 hover:bg-bat-gold-400/10 cursor-pointer"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAlternarAnulada(q)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                        q.anulada
                          ? "border-bat-success/40 text-bat-success hover:bg-bat-success/10"
                          : "border-bat-warning/40 text-bat-warning hover:bg-bat-warning/10"
                      }`}
                    >
                      {q.anulada ? "Reativar Questão" : "Anular Questão"}
                    </button>

                    <button
                      type="button"
                      disabled={excluindoId === q.id}
                      onClick={() => handleExcluir(q.id)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-bat-error/40 text-bat-error hover:bg-bat-error/10 cursor-pointer disabled:opacity-40"
                    >
                      {excluindoId === q.id ? "Excluindo..." : "🗑️ Excluir"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ═══ PAGINAÇÃO ═══ */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between p-4 bg-bat-bg-card border border-bat-border rounded-xl text-xs">
              <span className="text-bat-text-muted">
                Página <strong className="text-bat-text">{pagina}</strong> de{" "}
                <strong className="text-bat-text">{totalPaginas}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nova = Math.max(1, pagina - 1);
                    setPagina(nova);
                    carregarQuestoes(nova);
                  }}
                  disabled={pagina <= 1}
                  className="btn-secondary py-1 px-3 text-xs disabled:opacity-40 cursor-pointer"
                >
                  ◀ Anterior
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nova = Math.min(totalPaginas, pagina + 1);
                    setPagina(nova);
                    carregarQuestoes(nova);
                  }}
                  disabled={pagina >= totalPaginas}
                  className="btn-secondary py-1 px-3 text-xs disabled:opacity-40 cursor-pointer"
                >
                  Próxima ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ MODAL DE EDIÇÃO DE QUESTÃO ═══ */}
      {questaoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-bat-bg-card border border-bat-gold-400/40 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-bat-border flex items-center justify-between bg-bat-bg-primary">
              <div>
                <h3 className="text-base font-bold text-bat-text flex items-center gap-2">
                  <span>✏️</span> Editar Questão
                </h3>
                <p className="text-[11px] text-bat-text-muted">
                  ID: <code className="font-mono text-bat-gold-400">{questaoEditando.id}</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuestaoEditando(null)}
                className="w-8 h-8 rounded-full bg-bat-bg-secondary flex items-center justify-center text-xs text-bat-text-muted hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Corpo do Formulário com Scroll */}
            <form onSubmit={handleSalvarEdicao} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                    Gabarito Oficial (Letra)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={questaoEditando.resposta_correta}
                    onChange={(e) =>
                      setQuestaoEditando({
                        ...questaoEditando,
                        resposta_correta: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full input-field text-xs font-mono font-bold uppercase text-center"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                    Ano
                  </label>
                  <input
                    type="number"
                    value={questaoEditando.ano || ""}
                    onChange={(e) =>
                      setQuestaoEditando({
                        ...questaoEditando,
                        ano: parseInt(e.target.value) || null,
                      })
                    }
                    className="w-full input-field text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                    Dificuldade
                  </label>
                  <select
                    value={questaoEditando.dificuldade || "medio"}
                    onChange={(e) =>
                      setQuestaoEditando({
                        ...questaoEditando,
                        dificuldade: e.target.value,
                      })
                    }
                    className="w-full input-field text-xs bg-bat-bg-primary"
                  >
                    <option value="facil">Fácil</option>
                    <option value="medio">Médio</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </div>
              </div>

              {/* Status de Anulação */}
              <div className="flex items-center gap-2 p-3 bg-bat-bg-primary rounded-xl border border-bat-border">
                <input
                  type="checkbox"
                  id="chkAnuladaModal"
                  checked={questaoEditando.anulada}
                  onChange={(e) =>
                    setQuestaoEditando({
                      ...questaoEditando,
                      anulada: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <label
                  htmlFor="chkAnuladaModal"
                  className="text-xs font-bold text-bat-text cursor-pointer select-none"
                >
                  Marcar questão como ANULADA pela banca oficial
                </label>
              </div>

              {/* Enunciado */}
              <div>
                <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                  Enunciado da Questão
                </label>
                <textarea
                  rows={5}
                  value={questaoEditando.enunciado}
                  onChange={(e) =>
                    setQuestaoEditando({
                      ...questaoEditando,
                      enunciado: e.target.value,
                    })
                  }
                  className="w-full input-field text-xs font-sans leading-relaxed resize-y"
                  required
                />
              </div>

              {/* Alternativas */}
              <div>
                <label className="text-xs font-bold text-bat-text-secondary block mb-2">
                  Alternativas
                </label>
                <div className="space-y-2">
                  {(questaoEditando.alternativas || []).map((alt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-bat-gold-400/20 text-bat-gold-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {alt.letra}
                      </span>
                      <input
                        type="text"
                        value={alt.texto}
                        onChange={(e) => {
                          const novas = [...(questaoEditando.alternativas || [])];
                          novas[index] = { ...novas[index], texto: e.target.value };
                          setQuestaoEditando({ ...questaoEditando, alternativas: novas });
                        }}
                        className="w-full input-field text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gabarito Comentado / Explicação */}
              <div>
                <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                  Resolução e Explicação Didática (Gabarito Comentado)
                </label>
                <textarea
                  rows={4}
                  placeholder="Escreva a resolução passo a passo ou por que a alternativa correta é a certa..."
                  value={questaoEditando.explicacao || ""}
                  onChange={(e) =>
                    setQuestaoEditando({
                      ...questaoEditando,
                      explicacao: e.target.value,
                    })
                  }
                  className="w-full input-field text-xs font-sans leading-relaxed resize-y"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-4 border-t border-bat-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuestaoEditando(null)}
                  disabled={salvandoEdicao}
                  className="btn-secondary py-2 px-4 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="btn-primary py-2 px-6 text-xs font-bold cursor-pointer"
                >
                  {salvandoEdicao ? "Salvando..." : "Salvar Alterações 💾"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
