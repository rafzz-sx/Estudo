"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/stores/auth-store";
import { MathText } from "@/components/MathText";

/**
 * Fila de Teoria: onde escrever rende mais.
 *
 * 57% das questões não têm texto de teoria vinculado. Escrever tudo é
 * inviável; escrever na ordem que der na cabeça é desperdício. Esta fila
 * ordena por FREQUÊNCIA × ERRO COLETIVO — o assunto que cai muito E derruba
 * geral é onde o texto que falta custa mais caro ao aluno.
 *
 * É a irmã da Fila de Resolução, que faz o mesmo com os gabaritos.
 */

interface Lacuna {
  assunto_id: string;
  assunto: string;
  materia: string;
  emoji: string | null;
  questoes: number;
  respostas: number;
  taxa_acerto: number | null;
  prioridade: number;
  alcance: number;
}

interface Resumo {
  com_teoria: number;
  sem_teoria: number;
  cobertura: number;
  janela_dias?: number;
  respostas_analisadas?: number;
  amostra_truncada?: boolean;
}

export function PainelLacunasTeoria() {
  const [lacunas, setLacunas] = useState<Lacuna[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroMateria, setFiltroMateria] = useState("todas");

  // Editor de Teoria Integrado
  const [assuntoEditor, setAssuntoEditor] = useState<Lacuna | null>(null);
  const [tituloTeoria, setTituloTeoria] = useState("");
  const [resumoTeoria, setResumoTeoria] = useState("");
  const [corpoMarkdown, setCorpoMarkdown] = useState("");
  const [nivelTeoria, setNivelTeoria] = useState<"base" | "aprofundado">("base");
  const [tempoLeitura, setTempoLeitura] = useState(5);
  const [salvandoTeoria, setSalvandoTeoria] = useState(false);
  const [previewTeoria, setPreviewTeoria] = useState(false);
  const [avisoSucesso, setAvisoSucesso] = useState<string | null>(null);

  const handleAbrirEditor = (l: Lacuna) => {
    setAssuntoEditor(l);
    setTituloTeoria(l.assunto);
    setResumoTeoria("");
    setCorpoMarkdown(`### 🎯 1. Conceito Central & Fundamentos\nExplicação direta e focada do tópico para provas.\n\n### ⚡ 2. Fórmulas & Regras de Ouro\n- Definições e equações essenciais...\n\n### ⚠️ 3. Ponto Cego & Pegadinhas da Banca\nOnde os candidatos mais erram neste assunto...\n\n### 💡 4. Exemplo Tático Resolvido\n**Enunciado:** ...\n**Resolução:** ...\n`);
    setNivelTeoria("base");
    setTempoLeitura(5);
    setPreviewTeoria(false);
  };

  const inserirModeloTatico = () => {
    if (!assuntoEditor) return;
    setCorpoMarkdown(
`## 🎯 Guia Tático: ${assuntoEditor.assunto}

### 1. Conceito Fundamental
Definição direta do assunto sem prolixidade. Entenda o princípio que rege a matéria.

### 2. Fórmulas & Regras Práticas
- Regra de aplicação imediata.
- Relação matemática ou gramatical direta:
$$ \\text{Equação ou Regra Geral} $$

### 3. Ponto Cego (A Pegadinha Clássica da Banca)
A banca costuma confundir o candidato trocando os conceitos X e Y. Atenção redobrada nas alternativas que parecem óbvias.

### 4. Passo a Passo de Resolução
1. Identifique os dados do enunciado.
2. Aplique o filtro de eliminação nas alternativas absurdas.
3. Chegue à resposta blindada.`
    );
  };

  const handleSalvarTeoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assuntoEditor) return;

    setSalvandoTeoria(true);
    try {
      const res = await fetchWithAuth("/api/admin/lacunas-teoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assunto_id: assuntoEditor.assunto_id,
          titulo: tituloTeoria.trim(),
          resumo: resumoTeoria.trim(),
          corpo_markdown: corpoMarkdown.trim(),
          nivel: nivelTeoria,
          tempo_leitura_min: tempoLeitura,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setAvisoSucesso(json.mensagem || `Teoria de "${assuntoEditor.assunto}" salva com sucesso!`);
        // Remove da lista de lacunas
        setLacunas((prev) => prev.filter((l) => l.assunto_id !== assuntoEditor.assunto_id));
        if (resumo) {
          const novoCom = resumo.com_teoria + 1;
          const novoSem = Math.max(0, resumo.sem_teoria - 1);
          const total = novoCom + novoSem;
          setResumo({
            ...resumo,
            com_teoria: novoCom,
            sem_teoria: novoSem,
            cobertura: total > 0 ? Number(((novoCom / total) * 100).toFixed(1)) : 100,
          });
        }
        setAssuntoEditor(null);
      } else {
        alert(json.error || "Erro ao salvar teoria.");
      }
    } catch {
      alert("Falha de conexão com a API de teoria.");
    } finally {
      setSalvandoTeoria(false);
    }
  };

  useEffect(() => {
    let cancelado = false;

    fetchWithAuth("/api/admin/lacunas-teoria")
      .then((r) => r.json())
      .then((json) => {
        if (cancelado) return;
        if (json.success) {
          setLacunas(json.data.lacunas ?? []);
          setResumo(json.data.resumo ?? null);
        } else {
          setErro(json.error ?? "Não consegui montar a fila.");
        }
      })
      .catch(() => {
        if (!cancelado) setErro("Falha de conexão ao montar a fila.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const materias = ["todas", ...new Set(lacunas.map((l) => l.materia))].sort();
  const visiveis =
    filtroMateria === "todas"
      ? lacunas
      : lacunas.filter((l) => l.materia === filtroMateria);

  return (
    <div className="space-y-4">
      <header>
        <h2 className="heading text-lg font-bold text-bat-text">
          📝 Fila de Teoria
        </h2>
        <p className="mt-1 max-w-2xl text-xs text-bat-text-muted">
          Assuntos <strong>sem texto de teoria</strong>, ordenados por quanto
          caem nas provas × quanto os alunos erram neles. O primeiro da lista é
          o texto que alcança mais gente.
        </p>
      </header>

      {resumo && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-lg bg-bat-success/15 px-3 py-1.5 font-bold text-bat-success">
            {resumo.com_teoria} com teoria
          </span>
          <span className="rounded-lg bg-bat-gold-400/15 px-3 py-1.5 font-bold text-bat-gold-400">
            {resumo.sem_teoria} sem
          </span>
          <span className="rounded-lg bg-bat-bg-secondary px-3 py-1.5 text-bat-text-secondary">
            {resumo.cobertura}% de cobertura
          </span>
          {resumo.respostas_analisadas != null && (
            <span className="rounded-lg bg-bat-bg-secondary px-3 py-1.5 text-bat-text-muted">
              {resumo.respostas_analisadas.toLocaleString("pt-BR")} respostas
              dos últimos {resumo.janela_dias} dias
            </span>
          )}
        </div>
      )}

      {avisoSucesso && (
        <div className="rounded-xl border border-bat-success/30 bg-bat-success/10 px-4 py-3 text-xs text-bat-success font-bold flex items-center justify-between">
          <span>✨ {avisoSucesso}</span>
          <button
            onClick={() => setAvisoSucesso(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {erro && (
        <p className="rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-2.5 text-sm text-bat-error">
          {erro}
        </p>
      )}

      {carregando ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : lacunas.length === 0 ? (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
          <span className="mb-3 block text-4xl">✅</span>
          <p className="text-sm text-bat-text-secondary">
            Todo assunto com 5 ou mais questões já tem teoria. Nada na fila.
          </p>
        </div>
      ) : (
        <>
          {materias.length > 2 && (
            <div className="flex flex-wrap gap-1.5">
              {materias.map((m) => (
                <button
                  key={m}
                  onClick={() => setFiltroMateria(m)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    filtroMateria === m
                      ? "bg-bat-gold-400 text-black"
                      : "bg-bat-bg-secondary text-bat-text-secondary hover:bg-bat-bg-elevated"
                  }`}
                >
                  {m === "todas" ? "Todas" : m}
                </button>
              ))}
            </div>
          )}

          <ol className="space-y-2">
            {visiveis.map((l, i) => (
              <li
                key={l.assunto_id}
                className="flex items-center gap-3 rounded-xl border border-bat-border bg-bat-bg-card px-4 py-3"
              >
                <span className="w-6 shrink-0 text-center font-mono text-xs text-bat-text-muted">
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-bat-text">
                    {l.emoji ?? "📘"} {l.assunto}
                  </p>
                  <p className="text-xs text-bat-text-muted">
                    {l.materia} · {l.questoes} questões no banco
                    {l.taxa_acerto !== null ? (
                      <>
                        {" "}
                        · alunos acertam{" "}
                        <strong
                          className={
                            l.taxa_acerto < 50
                              ? "text-bat-error"
                              : "text-bat-text-secondary"
                          }
                        >
                          {l.taxa_acerto}%
                        </strong>{" "}
                        em {l.respostas} respostas
                      </>
                    ) : (
                      " · ninguém respondeu ainda"
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="heading text-base font-bold tabular-nums text-bat-gold-400">
                    {l.prioridade}
                  </p>
                  <p className="text-[10px] text-bat-text-muted">prioridade</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAbrirEditor(l)}
                    className="px-3 py-1.5 rounded-lg bg-bat-gold-400 text-black font-bold text-xs hover:bg-bat-gold-300 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,197,24,0.3)]"
                    title="Escrever e publicar o texto de teoria deste assunto"
                  >
                    ✍️ Escrever Teoria
                  </button>

                  <Link
                    href={`/questoes?assunto_id=${l.assunto_id}`}
                    className="rounded-lg border border-bat-border px-2.5 py-1.5 text-xs text-bat-text-secondary no-underline transition-colors hover:border-bat-gold-400/40 hover:text-bat-gold-400"
                    title="Ver as questões deste assunto"
                  >
                    ver
                  </Link>
                </div>
              </li>
            ))}
          </ol>

          <p className="border-t border-bat-border pt-3 text-[11px] leading-relaxed text-bat-text-muted">
            A prioridade combina <strong>frequência</strong> (raiz quadrada, para
            um assunto de 134 questões não esmagar um de 30) com{" "}
            <strong>erro coletivo suavizado</strong> (assunto com poucas
            respostas não sobe ao topo por acaso). A taxa de erro vem das
            respostas dos últimos {resumo?.janela_dias ?? 180} dias — é a que
            interessa para decidir o que escrever agora
            {resumo?.amostra_truncada
              ? ", e a amostra foi truncada no teto de segurança"
              : ""}
            . O texto pode ser editado diretamente aqui ou nos seeds em{" "}
            <code className="rounded bg-bat-bg-secondary px-1">
              supabase/seeds/teoria_*.sql
            </code>
            .
          </p>
        </>
      )}

      {/* ═══ MODAL DO EDITOR DE TEORIA INTEGRADO ═══ */}
      {assuntoEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-bat-bg-card border border-bat-gold-400/50 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-bat-border flex items-center justify-between bg-bat-bg-primary">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{assuntoEditor.emoji ?? "📝"}</span>
                  <h3 className="text-base font-bold text-bat-text">
                    Editor de Teoria: {assuntoEditor.assunto}
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-bat-purple-500/20 text-bat-purple-300 border border-bat-purple-500/30">
                    {assuntoEditor.materia}
                  </span>
                </div>
                <p className="text-[11px] text-bat-text-muted mt-0.5">
                  Preenchendo esta lacuna, você ajudará diretamente mais de{" "}
                  <strong className="text-bat-gold-400">{assuntoEditor.questoes} questões</strong> e centenas de combatentes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssuntoEditor(null)}
                className="w-8 h-8 rounded-full bg-bat-bg-secondary flex items-center justify-center text-xs text-bat-text-muted hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Formulário com Scroll */}
            <form onSubmit={handleSalvarTeoria} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Metadados: Título, Nível e Tempo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                    Título do Módulo de Teoria *
                  </label>
                  <input
                    type="text"
                    value={tituloTeoria}
                    onChange={(e) => setTituloTeoria(e.target.value)}
                    className="w-full input-field text-xs font-bold"
                    placeholder="Ex: Cinemática Escalar: Velocidade Média e Movimento Uniforme"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                      Nível
                    </label>
                    <select
                      value={nivelTeoria}
                      onChange={(e) => setNivelTeoria(e.target.value as any)}
                      className="w-full input-field text-xs bg-bat-bg-primary"
                    >
                      <option value="base">Base</option>
                      <option value="aprofundado">Aprofundado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                      Leitura (min)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={tempoLeitura}
                      onChange={(e) => setTempoLeitura(parseInt(e.target.value) || 5)}
                      className="w-full input-field text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Resumo Executivo (até 400 caracteres) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-bat-text-secondary">
                    Resumo / Sinopse Executiva (Opcional)
                  </label>
                  <span className={`text-[10px] font-mono ${resumoTeoria.length > 400 ? 'text-bat-error font-bold' : 'text-bat-text-muted'}`}>
                    {resumoTeoria.length} / 400 caracteres
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={400}
                  placeholder="Síntese de até 2 linhas que resume a essência do assunto para revisão rápida..."
                  value={resumoTeoria}
                  onChange={(e) => setResumoTeoria(e.target.value)}
                  className="w-full input-field text-xs font-sans leading-relaxed resize-y"
                />
              </div>

              {/* Corpo Markdown com Tabs de Edição e KaTeX Preview */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-bold text-bat-text-secondary">
                    Conteúdo Completo (Markdown & LaTeX) *
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={inserirModeloTatico}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-bat-bg-secondary hover:bg-bat-bg-elevated text-bat-text-secondary border border-bat-border cursor-pointer transition-colors"
                      title="Substituir pelo esqueleto tático completo"
                    >
                      📋 Inserir Modelo Tático
                    </button>

                    <div className="flex items-center gap-1 bg-bat-bg-primary p-0.5 rounded-lg border border-bat-border text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPreviewTeoria(false)}
                        className={`px-2.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          !previewTeoria
                            ? "bg-bat-gold-400 text-black"
                            : "text-bat-text-muted hover:text-bat-text"
                        }`}
                      >
                        ✏️ Escrever Markdown
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTeoria(true)}
                        className={`px-2.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          previewTeoria
                            ? "bg-bat-gold-400 text-black"
                            : "text-bat-text-muted hover:text-bat-text"
                        }`}
                      >
                        👁️ KaTeX Preview
                      </button>
                    </div>
                  </div>
                </div>

                {!previewTeoria ? (
                  <textarea
                    rows={14}
                    placeholder="Escreva a teoria usando Markdown (#, ##, **negrito**, listas) e fórmulas KaTeX ($E=mc^2$ ou $$bloco$$)..."
                    value={corpoMarkdown}
                    onChange={(e) => setCorpoMarkdown(e.target.value)}
                    className="w-full input-field text-xs font-mono leading-relaxed resize-y"
                    required
                  />
                ) : (
                  <div className="p-5 rounded-xl bg-bat-bg-primary border border-bat-border min-h-[280px] max-h-[380px] overflow-y-auto text-xs text-bat-text leading-relaxed prose prose-invert max-w-none">
                    <MathText>{corpoMarkdown || "*(Nenhum texto redigido ainda)*"}</MathText>
                  </div>
                )}
              </div>

              {/* Ações do Rodapé */}
              <div className="pt-4 border-t border-bat-border flex items-center justify-between gap-3">
                <span className="text-[11px] text-bat-text-muted">
                  Ao salvar, o conteúdo entra instantaneamente no portal de teoria dos alunos.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAssuntoEditor(null)}
                    disabled={salvandoTeoria}
                    className="btn-secondary py-2 px-4 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoTeoria}
                    className="btn-primary py-2 px-6 text-xs font-bold cursor-pointer shadow-[0_0_15px_rgba(245,197,24,0.3)]"
                  >
                    {salvandoTeoria ? "Publicando..." : "🚀 Publicar Teoria"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
