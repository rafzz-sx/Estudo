"use client";

import { useState, useEffect } from "react";

// ─── Mock de questões ────────────────────────────────────────
const mockQuestoes = [
  {
    id: "q1", concurso: "EEAR", materia: "Português", assunto: "Crase",
    enunciado: "Assinale a alternativa em que o uso da crase está CORRETO:",
    alternativas: [
      { letra: "A", texto: "Fui à São Paulo ontem." },
      { letra: "B", texto: "Refiro-me à sua proposta." },
      { letra: "C", texto: "Ela saiu à pé." },
      { letra: "D", texto: "Entreguei à ele o documento." },
    ],
    resposta_correta: "B",
    explicacao: "A alternativa B está correta porque 'refiro-me' é regência de 'referir-se a' + artigo 'a' = crase. As demais: A) cidade sem artigo, C) antes de palavra masculina, D) antes de pronome pessoal.",
    dificuldade: "medio", ano: 2023, banca: "Aeronáutica",
  },
  {
    id: "q2", concurso: "ESA", materia: "Matemática", assunto: "Equações do 2º Grau",
    enunciado: "Qual o valor da soma das raízes da equação 2x² - 10x + 12 = 0?",
    alternativas: [
      { letra: "A", texto: "3" },
      { letra: "B", texto: "5" },
      { letra: "C", texto: "6" },
      { letra: "D", texto: "10" },
    ],
    resposta_correta: "B",
    explicacao: "Pela relação de Girard, a soma das raízes = -b/a = -(-10)/2 = 10/2 = 5.",
    dificuldade: "facil", ano: 2022, banca: "Exército",
  },
  {
    id: "q3", concurso: "EEAR", materia: "Inglês", assunto: "Verb Tenses",
    enunciado: "Choose the correct alternative: 'She _____ to the store yesterday.'",
    alternativas: [
      { letra: "A", texto: "go" },
      { letra: "B", texto: "goes" },
      { letra: "C", texto: "went" },
      { letra: "D", texto: "gone" },
    ],
    resposta_correta: "C",
    explicacao: "'Yesterday' indica passado simples. O passado de 'go' é 'went'.",
    dificuldade: "facil", ano: 2023, banca: "Aeronáutica",
  },
];

const concursosFilter = ["Todos", "EEAR", "ESA", "EAM", "CN", "EPCAR", "EsPCEx", "EFOMM", "IME", "ENEM"];
const materiasFilter = ["Todas", "Português", "Matemática", "Física", "Química", "Inglês", "História", "Geografia"];
const dificuldadeFilter = ["Todas", "Fácil", "Médio", "Difícil"];

export default function QuestoesPage() {
  const [visible, setVisible] = useState(false);
  const [filtro, setFiltro] = useState({ concurso: "Todos", materia: "Todas", dificuldade: "Todas" });
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostaSelecionada, setRespostaSelecionada] = useState<string | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [combo, setCombo] = useState(0);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const q = mockQuestoes[questaoAtual];

  const handleResponder = () => {
    if (!respostaSelecionada) return;
    setRespondida(true);
    if (respostaSelecionada === q.resposta_correta) {
      setCombo((c) => c + 1);
    } else {
      setCombo(0);
    }
  };

  const handleProxima = () => {
    setQuestaoAtual((prev) => (prev + 1) % mockQuestoes.length);
    setRespostaSelecionada(null);
    setRespondida(false);
  };

  const isCorreta = respostaSelecionada === q.resposta_correta;

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ═══ SIDEBAR FILTROS ═══ */}
        <div className="lg:w-64 space-y-4">
          <h2 className="heading text-lg text-bat-text">Filtros</h2>

          <div>
            <label className="text-bat-text-muted text-xs mb-1 block">Concurso</label>
            <select
              value={filtro.concurso}
              onChange={(e) => setFiltro({ ...filtro, concurso: e.target.value })}
              className="input-field text-sm"
            >
              {concursosFilter.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-bat-text-muted text-xs mb-1 block">Matéria</label>
            <select
              value={filtro.materia}
              onChange={(e) => setFiltro({ ...filtro, materia: e.target.value })}
              className="input-field text-sm"
            >
              {materiasFilter.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-bat-text-muted text-xs mb-1 block">Dificuldade</label>
            <select
              value={filtro.dificuldade}
              onChange={(e) => setFiltro({ ...filtro, dificuldade: e.target.value })}
              className="input-field text-sm"
            >
              {dificuldadeFilter.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Estatísticas rápidas */}
          <div className="bg-bat-bg-card border border-bat-border rounded-xl p-4 mt-4">
            <p className="text-bat-text-muted text-xs mb-2">Nesta sessão</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-bat-text-secondary">Respondidas</span>
                <span className="text-bat-text font-medium">{questaoAtual + (respondida ? 1 : 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-bat-text-secondary">Combo atual</span>
                <span className={`font-bold ${combo >= 5 ? "text-bat-gold-400" : combo > 0 ? "text-bat-success" : "text-bat-text-muted"}`}>
                  {combo > 0 ? `🔥 x${combo}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ QUESTÃO ═══ */}
        <div className="flex-1">
          {/* Combo banner */}
          {combo >= 5 && (
            <div className="mb-4 bg-bat-gold-400/10 border border-bat-gold-400/30 rounded-xl px-4 py-2 text-center glow-gold">
              <span className="heading text-bat-gold-400 text-lg font-bold">🔥 COMBO x{combo}!</span>
            </div>
          )}

          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
            {/* Header da questão */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-bat-gold-400 bg-bat-gold-400/10 border border-bat-gold-400/20 px-2.5 py-1 rounded-lg">
                  {q.concurso}
                </span>
                <span className="text-xs text-bat-text-muted bg-bat-bg-secondary px-2.5 py-1 rounded-lg">
                  {q.materia}
                </span>
                <span className="text-xs text-bat-text-muted bg-bat-bg-secondary px-2.5 py-1 rounded-lg">
                  {q.assunto}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {q.ano && <span className="text-xs text-bat-text-muted">{q.ano}</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  q.dificuldade === "facil" ? "bg-bat-success/10 text-bat-success" :
                  q.dificuldade === "medio" ? "bg-bat-warning/10 text-bat-warning" :
                  "bg-bat-error/10 text-bat-error"
                }`}>
                  {q.dificuldade === "facil" ? "Fácil" : q.dificuldade === "medio" ? "Médio" : "Difícil"}
                </span>
              </div>
            </div>

            {/* Enunciado */}
            <p className="text-bat-text text-base leading-relaxed mb-6">{q.enunciado}</p>

            {/* Alternativas */}
            <div className="space-y-3 mb-6">
              {q.alternativas.map((alt) => {
                let estilo = "bg-bat-bg-secondary border-bat-border text-bat-text-secondary hover:border-bat-gold-400/30 hover:bg-bat-bg-elevated";

                if (respondida) {
                  if (alt.letra === q.resposta_correta) {
                    estilo = "bg-bat-success/10 border-bat-success/40 text-bat-success glow-success font-medium";
                  } else if (alt.letra === respostaSelecionada && !isCorreta) {
                    estilo = "bg-bat-error/10 border-bat-error/40 text-bat-error glow-error";
                  } else {
                    estilo = "bg-bat-bg-secondary border-bat-border text-bat-text-disabled opacity-50";
                  }
                } else if (respostaSelecionada === alt.letra) {
                  estilo = "bg-bat-gold-400/10 border-bat-gold-400/40 text-bat-gold-400 font-medium";
                }

                return (
                  <button
                    key={alt.letra}
                    onClick={() => !respondida && setRespostaSelecionada(alt.letra)}
                    disabled={respondida}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${estilo}`}
                  >
                    <span className="font-bold mr-3">{alt.letra})</span>
                    {alt.texto}
                  </button>
                );
              })}
            </div>

            {/* Botão responder / próxima */}
            {!respondida ? (
              <button
                onClick={handleResponder}
                disabled={!respostaSelecionada}
                className="btn-primary py-3 px-8 disabled:opacity-30"
              >
                Confirmar resposta
              </button>
            ) : (
              <div>
                {/* Feedback */}
                <div className={`mb-4 p-4 rounded-xl border ${
                  isCorreta
                    ? "bg-bat-success/10 border-bat-success/30"
                    : "bg-bat-error/10 border-bat-error/30"
                }`}>
                  <p className={`heading text-base font-bold mb-2 ${isCorreta ? "text-bat-success" : "text-bat-error"}`}>
                    {isCorreta ? "✅ Correto!" : "❌ Incorreto"}
                  </p>
                  <p className="text-bat-text-secondary text-sm leading-relaxed">{q.explicacao}</p>
                </div>

                <button onClick={handleProxima} className="btn-primary py-3 px-8">
                  Próxima questão →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
