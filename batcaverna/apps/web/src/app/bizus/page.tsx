"use client";

import { useState, useEffect } from "react";

// ─── Mock de bizus ───────────────────────────────────────────
const mockBizus = [
  {
    id: "b1", materia: "Português", assunto: "Crase", impacto: "alto" as const,
    titulo: "Regra do MNEMÔNICO para Crase",
    conteudo: "NUNCA crase antes de: verbo, masculino, pronomes pessoais/indefinidos, palavras repetidas. Se trocar \"a\" por \"para a\" e funcionar → tem crase!",
    exemplo: "Fui à escola (para a escola ✓) vs. Fui a pé (para a pé ✗)",
    favoritado: true,
  },
  {
    id: "b2", materia: "Matemática", assunto: "Triângulo Retângulo", impacto: "alto" as const,
    titulo: "Ternas Pitagóricas — decore apenas 4",
    conteudo: "Decore: (3,4,5), (5,12,13), (8,15,17), (7,24,25). 90% das questões usam múltiplos dessas ternas.",
    exemplo: "(6,8,10) = 2×(3,4,5); (10,24,26) = 2×(5,12,13)",
    favoritado: false,
  },
  {
    id: "b3", materia: "Física", assunto: "Cinemática", impacto: "util" as const,
    titulo: "MRU vs MRUV — Identifique em 3 segundos",
    conteudo: "Velocidade constante → MRU (S = S₀ + vt). Tem aceleração → MRUV (S = S₀ + v₀t + at²/2). Olhe se o enunciado menciona aceleração.",
    exemplo: "\"Um carro a 60 km/h\" = MRU. \"Um carro parte do repouso e acelera\" = MRUV.",
    favoritado: true,
  },
  {
    id: "b4", materia: "Química", assunto: "Balanceamento", impacto: "util" as const,
    titulo: "Balanceamento por TENTATIVA — Atalho",
    conteudo: "Ordem: metais → não-metais → hidrogênio → oxigênio. Funciona em 80% dos casos sem método algébrico.",
    exemplo: "Fe + O₂ → Fe₂O₃ → Comece pelo Fe: 2Fe, depois O: 3/2 O₂, multiplique tudo por 2.",
    favoritado: false,
  },
  {
    id: "b5", materia: "Português", assunto: "Concordância Verbal", impacto: "alto" as const,
    titulo: "Sujeito Composto — Regra de Ouro",
    conteudo: "Sujeito composto ANTES do verbo → verbo no PLURAL. Sujeito composto DEPOIS do verbo → verbo concorda com o mais próximo ou vai ao plural.",
    exemplo: "\"Pedro e Maria foram\" (antes). \"Foi Pedro e Maria\" ou \"Foram Pedro e Maria\" (depois).",
    favoritado: false,
  },
  {
    id: "b6", materia: "Inglês", assunto: "Prepositions", impacto: "util" as const,
    titulo: "IN / ON / AT — Quando usar cada um",
    conteudo: "AT → horários e endereços específicos. ON → dias e datas. IN → meses, anos, estações e períodos do dia (exceto 'at night').",
    exemplo: "at 3 PM, on Monday, in January, in the morning, AT night",
    favoritado: false,
  },
  {
    id: "b7", materia: "Matemática", assunto: "Porcentagem", impacto: "alto" as const,
    titulo: "Fator Multiplicativo — Acabou a dor de cabeça",
    conteudo: "Aumento de X% → multiplique por (1 + X/100). Desconto de X% → multiplique por (1 - X/100). Encadeie para aumentos/descontos sucessivos.",
    exemplo: "Aumento de 20% + desconto de 10% = 1,20 × 0,90 = 1,08 → aumento real de 8%.",
    favoritado: true,
  },
  {
    id: "b8", materia: "História do Brasil", assunto: "Era Vargas", impacto: "avancado" as const,
    titulo: "3 Fases de Vargas — Mnemônico",
    conteudo: "Gov. Provisório (1930-34) → Era Constitucional (34-37) → Estado Novo (37-45). Lembre: P-C-N (Provisório, Constitucional, Novo).",
    exemplo: "A CLT foi criada no Estado Novo (1943).",
    favoritado: false,
  },
];

const materiasFilter = ["Todas", "Português", "Matemática", "Física", "Química", "Inglês", "História do Brasil"];
const impactoFilter = [
  { value: "todos", label: "Todos", emoji: "" },
  { value: "alto", label: "Alto impacto", emoji: "🔥" },
  { value: "util", label: "Útil", emoji: "⚡" },
  { value: "avancado", label: "Avançado", emoji: "🎓" },
];

function getImpactoStyle(impacto: string) {
  switch (impacto) {
    case "alto": return { bg: "bg-bat-error/10", text: "text-bat-error", label: "🔥 Alto impacto" };
    case "util": return { bg: "bg-bat-gold-400/10", text: "text-bat-gold-400", label: "⚡ Útil" };
    case "avancado": return { bg: "bg-bat-info/10", text: "text-bat-info", label: "🎓 Avançado" };
    default: return { bg: "bg-bat-bg-secondary", text: "text-bat-text-muted", label: impacto };
  }
}

export default function BizusPage() {
  const [visible, setVisible] = useState(false);
  const [busca, setBusca] = useState("");
  const [materia, setMateria] = useState("Todas");
  const [impacto, setImpacto] = useState("todos");
  const [apenasMinhas, setApenasMinhas] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(
    new Set(mockBizus.filter((b) => b.favoritado).map((b) => b.id))
  );

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const toggleFavorito = (id: string) => {
    setFavoritos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const bizusFiltrados = mockBizus.filter((b) => {
    if (materia !== "Todas" && b.materia !== materia) return false;
    if (impacto !== "todos" && b.impacto !== impacto) return false;
    if (apenasMinhas && !favoritos.has(b.id)) return false;
    if (busca && !b.titulo.toLowerCase().includes(busca.toLowerCase()) &&
        !b.conteudo.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="mb-6">
        <h1 className="heading text-3xl text-bat-text mb-2">💡 Banco de Bizus</h1>
        <p className="text-bat-text-secondary">Macetes, atalhos e dicas que economizam tempo na prova.</p>
      </div>

      {/* ═══ FILTROS ═══ */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar bizu por título ou conteúdo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="input-field text-sm"
          />
        </div>
        <select
          value={materia}
          onChange={(e) => setMateria(e.target.value)}
          className="input-field text-sm w-full sm:w-44"
        >
          {materiasFilter.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={impacto}
          onChange={(e) => setImpacto(e.target.value)}
          className="input-field text-sm w-full sm:w-40"
        >
          {impactoFilter.map((i) => (
            <option key={i.value} value={i.value}>{i.emoji} {i.label}</option>
          ))}
        </select>
        <button
          onClick={() => setApenasMinhas(!apenasMinhas)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${
            apenasMinhas
              ? "bg-bat-gold-400/15 border-bat-gold-400/30 text-bat-gold-400"
              : "bg-bat-bg-card border-bat-border text-bat-text-muted hover:text-bat-text"
          }`}
        >
          ⭐ Meus Bizus
        </button>
      </div>

      {/* ═══ CONTAGEM ═══ */}
      <p className="text-bat-text-muted text-sm mb-4">{bizusFiltrados.length} bizu{bizusFiltrados.length !== 1 ? "s" : ""} encontrado{bizusFiltrados.length !== 1 ? "s" : ""}</p>

      {/* ═══ CARDS DE BIZUS ═══ */}
      {bizusFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-bat-bg-card border border-bat-border rounded-2xl">
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-bat-text-secondary">Nenhum bizu encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bizusFiltrados.map((bizu) => {
            const imp = getImpactoStyle(bizu.impacto);
            const isExpanded = expandido === bizu.id;

            return (
              <div
                key={bizu.id}
                className="card-glow bg-bat-bg-card border border-bat-border rounded-2xl p-5 hover:border-bat-purple-500/30 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${imp.bg} ${imp.text}`}>
                      {imp.label}
                    </span>
                    <span className="text-xs text-bat-purple-400 bg-bat-purple-500/10 px-2.5 py-1 rounded-full">
                      {bizu.materia}
                    </span>
                    <span className="text-xs text-bat-text-muted bg-bat-bg-secondary px-2.5 py-1 rounded-full">
                      {bizu.assunto}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFavorito(bizu.id)}
                    className="text-lg transition-transform hover:scale-125 cursor-pointer"
                    title={favoritos.has(bizu.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    {favoritos.has(bizu.id) ? "⭐" : "☆"}
                  </button>
                </div>

                {/* Título */}
                <h3 className="heading text-base text-bat-text font-bold mb-2">{bizu.titulo}</h3>

                {/* Conteúdo */}
                <p className="text-bat-text-secondary text-sm leading-relaxed mb-3">{bizu.conteudo}</p>

                {/* Exemplo (expandível) */}
                {bizu.exemplo && (
                  <div>
                    <button
                      onClick={() => setExpandido(isExpanded ? null : bizu.id)}
                      className="text-bat-purple-400 text-xs hover:underline cursor-pointer mb-2"
                    >
                      {isExpanded ? "▾ Ocultar exemplo" : "▸ Ver exemplo prático"}
                    </button>
                    {isExpanded && (
                      <div className="bg-bat-bg-secondary border border-bat-border rounded-xl p-3 mt-1">
                        <p className="text-bat-text text-sm font-mono leading-relaxed">{bizu.exemplo}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
