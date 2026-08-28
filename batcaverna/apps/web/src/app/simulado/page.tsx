"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatarCronometro } from "@batcaverna/utils";

interface SimQuestao {
  id: string;
  materia: string;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  resposta_correta: string;
  explicacao: string;
}

const mockSimuladoQuestoes: SimQuestao[] = [
  {
    id: "sq1",
    materia: "Português",
    enunciado: "Assinale a frase em que o acento indicativo de crase foi empregado INCORRETAMENTE:",
    alternativas: [
      { letra: "A", texto: "Chegamos à praia ao entardecer." },
      { letra: "B", texto: "Ele começou à gritar de repente." },
      { letra: "C", texto: "Fomos àquela festa memorável." },
      { letra: "D", texto: "Entregue a encomenda à diretora." },
    ],
    resposta_correta: "B",
    explicacao: "A alternativa B é a incorreta pois nunca ocorre crase antes de verbo ('gritar').",
  },
  {
    id: "sq2",
    materia: "Matemática",
    enunciado: "Se log₂(x) = 5, então o valor de x é:",
    alternativas: [
      { letra: "A", texto: "10" },
      { letra: "B", texto: "25" },
      { letra: "C", texto: "32" },
      { letra: "D", texto: "64" },
    ],
    resposta_correta: "C",
    explicacao: "Por definição de logaritmo, log₂(x) = 5 <=> x = 2⁵ = 32.",
  },
  {
    id: "sq3",
    materia: "Física",
    enunciado: "Um móvel parte do repouso com aceleração constante de 2 m/s². Qual a sua velocidade após 6 segundos?",
    alternativas: [
      { letra: "A", texto: "3 m/s" },
      { letra: "B", texto: "8 m/s" },
      { letra: "C", texto: "12 m/s" },
      { letra: "D", texto: "36 m/s" },
    ],
    resposta_correta: "C",
    explicacao: "V = V₀ + a*t = 0 + 2*6 = 12 m/s.",
  },
  {
    id: "sq4",
    materia: "Inglês",
    enunciado: "Which preposition correctly completes: 'The briefing starts _____ 08:00 sharp.'",
    alternativas: [
      { letra: "A", texto: "on" },
      { letra: "B", texto: "in" },
      { letra: "C", texto: "at" },
      { letra: "D", texto: "by" },
    ],
    resposta_correta: "C",
    explicacao: "Usamos a preposição 'at' para horários específicos.",
  },
];

type EstadoSimulado = "config" | "em_andamento" | "resultado";

export default function SimuladoPage() {
  const [estado, setEstado] = useState<EstadoSimulado>("config");
  const [concursoSel, setConcursoSel] = useState("EEAR");
  const [tempoRestante, setTempoRestante] = useState(1800); // 30 min
  const [questaoIndex, setQuestaoIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [questoes, setQuestoes] = useState<SimQuestao[]>(mockSimuladoQuestoes);

  // Timer
  useEffect(() => {
    if (estado !== "em_andamento") return;

    const timer = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setEstado("resultado");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [estado]);

  const handleStart = () => {
    setRespostas({});
    setQuestaoIndex(0);
    setTempoRestante(1800);
    setEstado("em_andamento");
  };

  const handleSelectAlternativa = (letra: string) => {
    const q = questoes[questaoIndex];
    setRespostas((prev) => ({ ...prev, [q.id]: letra }));
  };

  const handleFinalizar = () => {
    if (confirm("Deseja realmente entregar o simulado agora?")) {
      setEstado("resultado");
    }
  };

  // Cálculo de resultados
  const totalQuestoes = questoes.length;
  const acertos = questoes.filter((q) => respostas[q.id] === q.resposta_correta).length;
  const pontuacaoPercent = Math.round((acertos / totalQuestoes) * 100);
  const xpGanho = acertos * 20 + 50;

  return (
    <div className="space-y-6">
      {/* ═══ TELA 1: CONFIGURAÇÃO DO SIMULADO ═══ */}
      {estado === "config" && (
        <div className="max-w-2xl mx-auto bg-bat-bg-card border border-bat-border rounded-2xl p-8 text-center space-y-6">
          <span className="text-5xl block">⏱️</span>
          <div>
            <h1 className="heading text-3xl text-bat-text">Simulado Cronometrado</h1>
            <p className="text-bat-text-secondary text-sm max-w-md mx-auto mt-2">
              Teste seus conhecimentos com tempo contado, simulando as condições reais da sua prova militar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto">
            <div>
              <label className="text-bat-text-muted text-xs block mb-1">Concurso Alvo</label>
              <select
                value={concursoSel}
                onChange={(e) => setConcursoSel(e.target.value)}
                className="input-field text-sm"
              >
                {["EEAR", "ESA", "EAM", "CN", "EPCAR", "EsPCEx", "EFOMM", "IME", "ENEM"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-bat-text-muted text-xs block mb-1">Duração</label>
              <input
                type="text"
                value="30 minutos (Express)"
                readOnly
                className="input-field text-sm opacity-70"
              />
            </div>
          </div>

          <div className="bg-bat-bg-secondary border border-bat-border rounded-xl p-4 text-xs text-bat-text-muted text-left max-w-md mx-auto space-y-1">
            <p>• O cronômetro não pausa após iniciado.</p>
            <p>• Você poderá navegar livremente entre as questões.</p>
            <p>• O gabarito comentado será liberado ao finalizar.</p>
          </div>

          <button onClick={handleStart} className="btn-primary py-3 px-8 text-base glow-purple">
            Iniciar Simulado Agora 🚀
          </button>
        </div>
      )}

      {/* ═══ TELA 2: PROVA EM ANDAMENTO ═══ */}
      {estado === "em_andamento" && (
        <div className="space-y-6">
          {/* Topbar do Simulado com Cronômetro */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="heading text-lg text-bat-purple-400 font-bold">{concursoSel}</span>
              <span className="text-bat-text-muted text-xs">
                Questão {questaoIndex + 1} de {totalQuestoes}
              </span>
            </div>

            {/* Cronômetro */}
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                tempoRestante < 300
                  ? "bg-bat-error/15 border-bat-error text-bat-error glow-error animate-pulse"
                  : "bg-bat-bg-secondary border-bat-border text-bat-gold-400"
              }`}
            >
              <span>⏱️</span>
              <span>{formatarCronometro(tempoRestante)}</span>
            </div>

            <button
              onClick={handleFinalizar}
              className="px-4 py-1.5 text-xs font-semibold bg-bat-error/15 border border-bat-error/30 text-bat-error rounded-xl hover:bg-bat-error hover:text-white transition cursor-pointer"
            >
              Entregar Prova
            </button>
          </div>

          {/* Navegador de Questões (Grid de bolinhas/índices) */}
          <div className="flex gap-2 flex-wrap bg-bat-bg-card border border-bat-border p-3 rounded-xl">
            {questoes.map((q, idx) => {
              const respondida = !!respostas[q.id];
              const isCurrent = idx === questaoIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setQuestaoIndex(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-bat-purple-500 text-white border-2 border-white shadow-md"
                      : respondida
                      ? "bg-bat-purple-500/20 border border-bat-purple-500/40 text-bat-purple-300"
                      : "bg-bat-bg-secondary border border-bat-border text-bat-text-muted hover:text-bat-text"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Questão Atual */}
          {questoes[questaoIndex] && (
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-bat-border">
                <span className="text-xs font-bold text-bat-purple-400 bg-bat-purple-500/10 px-3 py-1 rounded-full">
                  {questoes[questaoIndex].materia}
                </span>
                <span className="text-bat-text-muted text-xs">
                  Respondida: {respostas[questoes[questaoIndex].id] || "Não"}
                </span>
              </div>

              <p className="text-bat-text text-base leading-relaxed font-medium">
                {questoes[questaoIndex].enunciado}
              </p>

              {/* Alternativas */}
              <div className="space-y-3">
                {questoes[questaoIndex].alternativas.map((alt) => {
                  const isSelected = respostas[questoes[questaoIndex].id] === alt.letra;

                  return (
                    <button
                      key={alt.letra}
                      onClick={() => handleSelectAlternativa(alt.letra)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? "bg-bat-purple-500/15 border-bat-purple-500 text-bat-purple-300 glow-purple"
                          : "bg-bat-bg-secondary border-bat-border text-bat-text-secondary hover:border-bat-purple-500/30"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? "bg-bat-purple-500 text-white" : "bg-bat-bg-card text-bat-text-muted"
                        }`}
                      >
                        {alt.letra}
                      </span>
                      <span className="text-sm">{alt.texto}</span>
                    </button>
                  );
                })}
              </div>

              {/* Controles de Navegação */}
              <div className="flex justify-between pt-4 border-t border-bat-border">
                <button
                  onClick={() => setQuestaoIndex((i) => Math.max(0, i - 1))}
                  disabled={questaoIndex === 0}
                  className="btn-secondary py-2 px-5 text-xs disabled:opacity-30"
                >
                  ← Anterior
                </button>

                {questaoIndex < totalQuestoes - 1 ? (
                  <button
                    onClick={() => setQuestaoIndex((i) => Math.min(totalQuestoes - 1, i + 1))}
                    className="btn-primary py-2 px-5 text-xs"
                  >
                    Próxima →
                  </button>
                ) : (
                  <button
                    onClick={handleFinalizar}
                    className="btn-primary py-2 px-6 text-xs bg-bat-success hover:bg-bat-success/80"
                  >
                    Finalizar Simulado ✅
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ TELA 3: RESULTADO & GABARITO COMENTADO ═══ */}
      {estado === "resultado" && (
        <div className="space-y-6">
          {/* Card de Score */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-8 text-center space-y-4">
            <span className="text-5xl block">
              {pontuacaoPercent >= 70 ? "🏆" : pontuacaoPercent >= 50 ? "⚡" : "📚"}
            </span>
            <h1 className="heading text-3xl text-bat-text">Simulado Concluído!</h1>
            <p className="text-bat-text-secondary text-sm">
              Confira seu desempenho detalhado e o gabarito comentado abaixo.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
              <div className="bg-bat-bg-secondary p-4 rounded-xl border border-bat-border">
                <p className="heading text-2xl text-bat-purple-400 font-bold">{pontuacaoPercent}%</p>
                <p className="text-bat-text-muted text-xs">Aproveitamento</p>
              </div>
              <div className="bg-bat-bg-secondary p-4 rounded-xl border border-bat-border">
                <p className="heading text-2xl text-bat-success font-bold">{acertos}/{totalQuestoes}</p>
                <p className="text-bat-text-muted text-xs">Acertos</p>
              </div>
              <div className="bg-bat-bg-secondary p-4 rounded-xl border border-bat-border">
                <p className="heading text-2xl text-bat-gold-400 font-bold">+{xpGanho} XP</p>
                <p className="text-bat-text-muted text-xs">Ganho na Caverna</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button onClick={() => setEstado("config")} className="btn-primary py-2.5 px-6 text-sm">
                Fazer Outro Simulado
              </button>
              <Link href="/dashboard" className="btn-secondary py-2.5 px-6 text-sm no-underline inline-block">
                Voltar ao Dashboard
              </Link>
            </div>
          </div>

          {/* Gabarito Comentado Item por Item */}
          <div className="space-y-4">
            <h2 className="heading text-xl text-bat-text">Gabarito Comentado</h2>

            {questoes.map((q, idx) => {
              const respDada = respostas[q.id];
              const correta = respDada === q.resposta_correta;

              return (
                <div
                  key={q.id}
                  className={`bg-bat-bg-card border rounded-2xl p-5 space-y-3 ${
                    correta ? "border-bat-success/30" : "border-bat-error/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-bat-text-muted">Questão {idx + 1}</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        correta ? "bg-bat-success/15 text-bat-success" : "bg-bat-error/15 text-bat-error"
                      }`}
                    >
                      {correta ? "✅ Acertou" : "❌ Errou"} (Sua: {respDada || "Em branco"} | Gabarito: {q.resposta_correta})
                    </span>
                  </div>

                  <p className="text-bat-text text-sm font-medium">{q.enunciado}</p>

                  <div className="bg-bat-bg-secondary/60 border border-bat-border rounded-xl p-3.5 text-xs text-bat-text-secondary leading-relaxed">
                    <strong className="text-bat-purple-400 block mb-1">Explicação do Professor:</strong>
                    {q.explicacao}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
