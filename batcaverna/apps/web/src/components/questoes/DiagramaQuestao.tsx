"use client";

import { useMemo } from "react";
import { MathText } from "@/components/MathText";

interface DiagramaQuestaoProps {
  descricao: string;
  enunciado?: string | null;
}

type TipoDiagrama =
  | "lancamento_vetor"
  | "grafico_colunas"
  | "campo_eletrico"
  | "fio_corrente"
  | "circulos_concentricos"
  | "geometria_retangulo"
  | "tirinha"
  | "cartesiano_funcao"
  | "esboco_geral";

export function DiagramaQuestao({ descricao, enunciado }: DiagramaQuestaoProps) {
  const tipo = useMemo(() => detectarTipo(descricao, enunciado), [descricao, enunciado]);

  switch (tipo) {
    case "lancamento_vetor":
      return <DiagramaLancamentoVetor descricao={descricao} />;
    case "grafico_colunas":
      return <DiagramaGraficoColunas descricao={descricao} />;
    case "campo_eletrico":
      return <DiagramaCampoEletrico descricao={descricao} />;
    case "fio_corrente":
      return <DiagramaFioCorrente descricao={descricao} />;
    case "circulos_concentricos":
      return <DiagramaCirculosConcentricos descricao={descricao} />;
    case "geometria_retangulo":
      return <DiagramaGeometriaRetangulo descricao={descricao} />;
    case "tirinha":
      return <DiagramaTirinha descricao={descricao} />;
    case "cartesiano_funcao":
      return <DiagramaCartesianoFuncao descricao={descricao} />;
    default:
      return <DiagramaEsbocoGeral descricao={descricao} />;
  }
}

function detectarTipo(descricao: string, enunciado?: string | null): TipoDiagrama {
  const texto = `${descricao} ${enunciado || ""}`.toLowerCase();

  if (
    texto.includes("lançamento") ||
    (texto.includes("vetor") && (texto.includes("anteparo") || texto.includes("velocidade") || texto.includes("trajetória")))
  ) {
    return "lancamento_vetor";
  }

  if (
    texto.includes("gráfico de coluna") ||
    texto.includes("gráfico de barra") ||
    (texto.includes("gráfico") && texto.includes("alunos") && texto.includes("nota"))
  ) {
    return "grafico_colunas";
  }

  if (
    texto.includes("campo elétrico") ||
    (texto.includes("cargas puntiformes") && texto.includes("ponto p"))
  ) {
    return "campo_eletrico";
  }

  if (
    (texto.includes("condutor retilíneo") || texto.includes("fio") || texto.includes("fios paralelos")) &&
    (texto.includes("corrente") || texto.includes("indução magnética"))
  ) {
    return "fio_corrente";
  }

  if (
    texto.includes("concêntric") ||
    (texto.includes("alvo circular") && texto.includes("coroa"))
  ) {
    return "circulos_concentricos";
  }

  if (
    texto.includes("retângulo") ||
    texto.includes("trapézio") ||
    texto.includes("triângulo")
  ) {
    return "geometria_retangulo";
  }

  if (
    texto.includes("tirinha") ||
    texto.includes("quadrinho") ||
    texto.includes("personagem")
  ) {
    return "tirinha";
  }

  if (
    texto.includes("cartesiano") ||
    texto.includes("gráfico de linha") ||
    texto.includes("função")
  ) {
    return "cartesiano_funcao";
  }

  return "esboco_geral";
}

// ─────────────────────────────────────────────────────────────
// 1. LANÇAMENTO VETORIAL & CINEMÁTICA (Ex: Vetor \vec{V} e Anteparo)
// ─────────────────────────────────────────────────────────────
function DiagramaLancamentoVetor({ descricao }: { descricao: string }) {
  const dados = useMemo(() => {
    const anguloMatch = descricao.match(/(\d+)\s*°/);
    const angulo = anguloMatch ? parseInt(anguloMatch[1], 10) : 60;

    const velMatch = descricao.match(/velocidade\s*(?:[Vv]\s*=\s*)?([^,\.;\n]+?m\/s|[^\s,;]+)/i);
    const vel = velMatch ? velMatch[1].trim() : "20\\sqrt{3}\\text{ m/s}";

    const distMatch = descricao.match(/(\d+(?:[.,]\d+)?)\s*m\b/);
    const dist = distMatch ? `${distMatch[1]} m` : "120 m";

    return { angulo, vel, dist };
  }, [descricao]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-bat-gold-400/30 bg-[#090d16] p-4 shadow-xl">
        {/* Selo técnico */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] font-mono text-bat-text-muted">
          <span className="flex items-center gap-1.5 text-bat-gold-400 font-bold">
            <span>🚀</span> DIAGRAMA VETORIAL DE TRAJETÓRIA
          </span>
          <span className="rounded bg-bat-gold-400/10 px-2 py-0.5 text-bat-gold-300">
            θ = {dados.angulo}° | d = {dados.dist}
          </span>
        </div>

        {/* SVG do Diagrama */}
        <svg
          viewBox="0 0 540 280"
          className="w-full h-auto mt-2"
          style={{ maxHeight: "300px" }}
        >
          <defs>
            {/* Grade técnica sutil */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#17223b" strokeWidth="0.8" />
            </pattern>
            {/* Ponta da flecha vetor ouro */}
            <marker id="arrow-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#facc15" />
            </marker>
            {/* Ponta da flecha cinza */}
            <marker id="arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            {/* Hachura de anteparo */}
            <pattern id="hatch-wall" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#ef4444" strokeWidth="2.5" opacity="0.6" />
            </pattern>
            {/* Hachura do solo */}
            <pattern id="hatch-ground" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#334155" strokeWidth="1.2" />
            </pattern>
          </defs>

          {/* Fundo com grade */}
          <rect width="540" height="280" fill="url(#grid)" />

          {/* Solo horizontal */}
          <line x1="40" y1="210" x2="500" y2="210" stroke="#94a3b8" strokeWidth="2.5" />
          <rect x="40" y="211" width="460" height="16" fill="url(#hatch-ground)" />

          {/* Eixo vertical Y tracejado na origem A */}
          <line x1="80" y1="50" x2="80" y2="210" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <text x="85" y="65" fill="#64748b" fontSize="11" fontFamily="sans-serif">+y</text>
          <text x="490" y="202" fill="#64748b" fontSize="11" fontFamily="sans-serif">+x</text>

          {/* Anteparo vertical B */}
          <rect x="420" y="45" width="22" height="165" fill="#1e293b" stroke="#f87171" strokeWidth="2" rx="3" />
          <rect x="422" y="47" width="18" height="161" fill="url(#hatch-wall)" />
          <text x="431" y="32" fill="#f87171" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            Anteparo (B)
          </text>

          {/* Trajetória retilínea pontilhada até o anteparo */}
          {/* tg(60°) = sqrt(3) ~ 1.73; deslocamento horizontal = 340px */}
          <line x1="80" y1="210" x2="420" y2="70" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />

          {/* Ponto de impacto no anteparo */}
          <circle cx="420" cy="70" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          <text x="390" y="60" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            Impacto
          </text>

          {/* Vetor V (flecha dourada destacada) */}
          <line
            x1="80"
            y1="210"
            x2="195"
            y2="143"
            stroke="#facc15"
            strokeWidth="3.5"
            markerEnd="url(#arrow-gold)"
          />

          {/* Arco do ângulo θ = 60° */}
          <path d="M 125 210 A 45 45 0 0 0 115 180" fill="none" stroke="#facc15" strokeWidth="2" />
          <text x="132" y="195" fill="#facc15" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
            {dados.angulo}°
          </text>

          {/* Etiqueta do Vetor V */}
          <rect x="145" y="105" width="95" height="28" rx="6" fill="#1e293b" stroke="#facc15" strokeWidth="1.2" />
          <text x="192" y="124" fill="#facc15" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            Vetor V
          </text>

          {/* Ponto A (Lançamento) */}
          <circle cx="80" cy="210" r="5" fill="#facc15" stroke="#000000" strokeWidth="2" />
          <text x="80" y="235" fill="#facc15" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            A (Origem)
          </text>

          {/* Cota de distância horizontal d = 120m */}
          <line x1="80" y1="248" x2="420" y2="248" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="80" y1="242" x2="80" y2="254" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="420" y1="242" x2="420" y2="254" stroke="#94a3b8" strokeWidth="1.2" />
          <rect x="215" y="238" width="70" height="20" rx="4" fill="#090d16" />
          <text x="250" y="252" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            d = {dados.dist}
          </text>
        </svg>

        {/* Legenda com MathText formatado */}
        <div className="mt-3 flex flex-wrap items-center justify-around gap-2 rounded-lg bg-neutral-900/80 p-2.5 text-xs text-neutral-300">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-bat-gold-400"></span>
            <span>Velocidade: <MathText>{"\\vec{V} = " + dados.vel}</MathText></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400"></span>
            <span>Trajetória: <strong className="text-white">Retilínea a {dados.angulo}°</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
            <span>Distância: <strong className="text-white">{dados.dist}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. GRÁFICO DE COLUNAS / BARRAS
// ─────────────────────────────────────────────────────────────
function DiagramaGraficoColunas({ descricao }: { descricao: string }) {
  const dados = useMemo(() => {
    const parts = descricao.split(/[;\n]/);
    const items: { label: string; value: number }[] = [];

    for (const part of parts) {
      const colonIdx = part.lastIndexOf(":");
      if (colonIdx === -1) continue;
      const labelPart = part.slice(0, colonIdx);
      const valuePart = part.slice(colonIdx + 1);

      const cleanLabel = labelPart.split(/[\.\n]/).pop()?.trim() || "";
      const valMatch = valuePart.match(/([+-]?\d+(?:[.,]\d+)?)/);
      if (valMatch && cleanLabel) {
        items.push({
          label: cleanLabel.replace(/^nota\s*/i, "N"),
          value: parseFloat(valMatch[1].replace(",", ".")),
        });
      }
    }

    return items;
  }, [descricao]);

  const maxVal = useMemo(() => {
    const vals = dados.map((d) => d.value);
    return Math.max(...vals, 10);
  }, [dados]);

  if (dados.length < 2) {
    return <DiagramaEsbocoGeral descricao={descricao} />;
  }

  const chartHeight = 160;
  const chartWidth = 460;
  const barWidth = Math.min(50, Math.floor((chartWidth - 60) / dados.length) - 10);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-bat-gold-400/30 bg-[#090d16] p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] font-mono text-bat-text-muted">
          <span className="flex items-center gap-1.5 text-bat-gold-400 font-bold">
            <span>📊</span> GRÁFICO DE COLUNAS DA QUESTÃO
          </span>
          <span className="rounded bg-bat-gold-400/10 px-2 py-0.5 text-bat-gold-300">
            {dados.length} Categorias
          </span>
        </div>

        <svg viewBox="0 0 520 250" className="w-full h-auto mt-2" style={{ maxHeight: "280px" }}>
          <defs>
            <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* Eixo Y */}
          <line x1="50" y1="20" x2="50" y2="200" stroke="#475569" strokeWidth="2" />
          {/* Eixo X */}
          <line x1="50" y1="200" x2="500" y2="200" stroke="#475569" strokeWidth="2" />

          {/* Linhas de grade Y */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = 200 - pct * chartHeight;
            const val = Math.round(pct * maxVal);
            return (
              <g key={idx}>
                <line x1="45" y1={y} x2="500" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <text x="40" y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="sans-serif">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Barras */}
          {dados.map((item, idx) => {
            const barH = (item.value / maxVal) * chartHeight;
            const x = 70 + idx * ((420 - 70) / dados.length);
            const y = 200 - barH;

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill="url(#bar-grad)"
                  rx="4"
                  className="transition-all hover:opacity-90"
                />
                {/* Valor no topo */}
                <text
                  x={x + barWidth / 2}
                  y={Math.max(15, y - 6)}
                  fill="#facc15"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {item.value}
                </text>
                {/* Rótulo abaixo do eixo */}
                <text
                  x={x + barWidth / 2}
                  y="218"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontWeight="500"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. CAMPO ELÉTRICO & CARGAS PUNTIFORMES
// ─────────────────────────────────────────────────────────────
function DiagramaCampoEletrico({ descricao }: { descricao: string }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-bat-gold-400/30 bg-[#090d16] p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] font-mono text-bat-text-muted">
          <span className="flex items-center gap-1.5 text-bat-gold-400 font-bold">
            <span>⚡</span> DIAGRAMA DE CAMPO ELÉTRICO E FORÇAS
          </span>
          <span className="rounded bg-sky-400/10 px-2 py-0.5 text-sky-300">Vetorial</span>
        </div>

        <svg viewBox="0 0 500 240" className="w-full h-auto mt-2" style={{ maxHeight: "260px" }}>
          <defs>
            <marker id="arrow-field" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-res" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#facc15" />
            </marker>
          </defs>

          {/* Carga A */}
          <circle cx="100" cy="180" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <text x="100" y="185" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A</text>
          <text x="100" y="212" fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Carga A</text>

          {/* Carga B */}
          <circle cx="400" cy="180" r="16" fill="#1e293b" stroke="#f87171" strokeWidth="2" />
          <text x="400" y="185" fill="#f87171" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">B</text>
          <text x="400" y="212" fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Carga B</text>

          {/* Linha base AB tracejada */}
          <line x1="116" y1="180" x2="384" y2="180" stroke="#334155" strokeWidth="1.2" strokeDasharray="4 4" />

          {/* Ponto P */}
          <circle cx="250" cy="80" r="5" fill="#ffffff" stroke="#facc15" strokeWidth="2" />
          <text x="250" y="65" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">P</text>

          {/* Linhas de ação AP e BP */}
          <line x1="100" y1="180" x2="250" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="400" y1="180" x2="250" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

          {/* Vetor E_A */}
          <line x1="250" y1="80" x2="295" y2="50" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-field)" />
          <text x="310" y="48" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="sans-serif">E_A</text>

          {/* Vetor E_B */}
          <line x1="250" y1="80" x2="210" y2="45" stroke="#f87171" strokeWidth="2.5" markerEnd="url(#arrow-field)" />
          <text x="185" y="42" fill="#f87171" fontSize="12" fontWeight="bold" fontFamily="sans-serif">E_B</text>

          {/* Vetor Resultante E */}
          <line x1="250" y1="80" x2="250" y2="25" stroke="#facc15" strokeWidth="3.5" markerEnd="url(#arrow-res)" />
          <text x="260" y="22" fill="#facc15" fontSize="13" fontWeight="extrabold" fontFamily="sans-serif">E_resultante</text>
        </svg>

        <p className="mt-2 text-center text-xs text-neutral-400">
          Superposição vetorial dos campos elétricos no ponto P
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. CONDUTOR RETILÍNEO & FIOS PARALELOS COM CORRENTE
// ─────────────────────────────────────────────────────────────
function DiagramaFioCorrente({ descricao }: { descricao: string }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-bat-gold-400/30 bg-[#090d16] p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] font-mono text-bat-text-muted">
          <span className="flex items-center gap-1.5 text-bat-gold-400 font-bold">
            <span>🧲</span> INDUÇÃO MAGNÉTICA EM CONDUTOR
          </span>
          <span className="rounded bg-bat-gold-400/10 px-2 py-0.5 text-bat-gold-300">B = μ₀·I / 2π·r</span>
        </div>

        <svg viewBox="0 0 500 220" className="w-full h-auto mt-2" style={{ maxHeight: "250px" }}>
          <defs>
            <marker id="arrow-current" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#facc15" />
            </marker>
          </defs>

          {/* Fio condutor vertical */}
          <line x1="120" y1="20" x2="120" y2="200" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="120" x2="120" y2="60" stroke="#000000" strokeWidth="2.5" markerEnd="url(#arrow-current)" />
          <text x="135" y="90" fill="#facc15" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Corrente (I)</text>

          {/* Ponto A a 20 cm */}
          <circle cx="260" cy="110" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          <text x="260" y="95" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Ponto A</text>
          <line x1="125" y1="110" x2="255" y2="110" stroke="#475569" strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="190" y="105" fill="#94a3b8" fontSize="10.5" textAnchor="middle" fontFamily="sans-serif">r_A = 20 cm</text>

          {/* Ponto B a 25 cm */}
          <circle cx="380" cy="110" r="5" fill="#a78bfa" stroke="#ffffff" strokeWidth="1.5" />
          <text x="380" y="95" fill="#a78bfa" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Ponto B</text>
          <line x1="265" y1="110" x2="375" y2="110" stroke="#475569" strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="320" y="105" fill="#94a3b8" fontSize="10.5" textAnchor="middle" fontFamily="sans-serif">r_B = 25 cm</text>

          {/* Linhas circulares de campo magnético */}
          <ellipse cx="120" cy="110" rx="140" ry="40" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <ellipse cx="120" cy="110" rx="260" ry="70" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. CÍRCULOS CONCÊNTRICOS & ALVO
// ─────────────────────────────────────────────────────────────
function DiagramaCirculosConcentricos({ descricao }: { descricao: string }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-bat-gold-400/30 bg-[#090d16] p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] font-mono text-bat-text-muted">
          <span className="flex items-center gap-1.5 text-bat-gold-400 font-bold">
            <span>🎯</span> ALVO E REGIÕES CIRCULARES CONCÊNTRICAS
          </span>
          <span className="rounded bg-bat-gold-400/10 px-2 py-0.5 text-bat-gold-300">A₁, A₂, A₃, A₄</span>
        </div>

        <svg viewBox="0 0 500 250" className="w-full h-auto mt-2" style={{ maxHeight: "260px" }}>
          {/* Círculos concêntricos com raios crescentes */}
          <circle cx="250" cy="125" r="105" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <text x="250" y="38" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A₄</text>

          <circle cx="250" cy="125" r="80" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <text x="250" y="62" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A₃</text>

          <circle cx="250" cy="125" r="55" fill="#1e293b" stroke="#facc15" strokeWidth="1.5" />
          <text x="250" y="88" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A₂</text>

          <circle cx="250" cy="125" r="30" fill="#ca8a04" stroke="#ffffff" strokeWidth="2" />
          <text x="250" y="130" fill="#000000" fontSize="12" fontWeight="extrabold" textAnchor="middle" fontFamily="sans-serif">A₁</text>

          {/* Linha de raio central */}
          <line x1="250" y1="125" x2="355" y2="125" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="300" y="118" fill="#ffffff" fontSize="10.5" fontFamily="sans-serif">r = 1m cada</text>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. GEOMETRIA PLANA (Retângulos, Triângulos, Trapézios)
// ─────────────────────────────────────────────────────────────
function DiagramaGeometriaRetangulo({ descricao }: { descricao: string }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-bat-gold-400/30 bg-[#090d16] p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] font-mono text-bat-text-muted">
          <span className="flex items-center gap-1.5 text-bat-gold-400 font-bold">
            <span>📐</span> COMPOSIÇÃO GEOMÉTRICA DA QUESTÃO
          </span>
          <span className="rounded bg-bat-gold-400/10 px-2 py-0.5 text-bat-gold-300">Geometria Plana</span>
        </div>

        <svg viewBox="0 0 500 230" className="w-full h-auto mt-2" style={{ maxHeight: "250px" }}>
          {/* Retângulo principal */}
          <rect x="90" y="50" width="320" height="120" fill="#1e293b" stroke="#facc15" strokeWidth="2.5" rx="2" />

          {/* Vértices */}
          <text x="80" y="45" fill="#facc15" fontSize="13" fontWeight="bold" fontFamily="sans-serif">D</text>
          <text x="418" y="45" fill="#facc15" fontSize="13" fontWeight="bold" fontFamily="sans-serif">A</text>
          <text x="80" y="185" fill="#facc15" fontSize="13" fontWeight="bold" fontFamily="sans-serif">C</text>
          <text x="418" y="185" fill="#facc15" fontSize="13" fontWeight="bold" fontFamily="sans-serif">B</text>

          {/* Ponto E sobre DA */}
          <circle cx="210" cy="50" r="4.5" fill="#38bdf8" />
          <text x="210" y="38" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">E</text>

          {/* Segmento EB formando trapézio */}
          <line x1="210" y1="50" x2="410" y2="170" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />

          {/* Cotas */}
          <text x="60" y="115" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">x</text>
          <text x="250" y="195" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Base = 3x</text>
          <text x="150" y="42" fill="#38bdf8" fontSize="10.5" textAnchor="middle" fontFamily="sans-serif">DE = x+2</text>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. TIRINHAS & QUADRINHOS
// ─────────────────────────────────────────────────────────────
function DiagramaTirinha({ descricao }: { descricao: string }) {
  const quadrinhos = useMemo(() => {
    // Quebra por "1º quadrinho", "2º quadrinho", etc.
    const regex = /(?:No\s+)?(\d+º\s+quadrinho[^:]*):/gi;
    const parts = descricao.split(regex);
    const result: { num: string; texto: string }[] = [];

    for (let i = 1; i < parts.length; i += 2) {
      result.push({
        num: parts[i].trim(),
        texto: parts[i + 1]?.trim() || "",
      });
    }

    if (result.length === 0) {
      return [{ num: "Quadro Principal", texto: descricao }];
    }
    return result;
  }, [descricao]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-bat-gold-400/30 bg-[#090d16] p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] font-mono text-bat-text-muted">
          <span className="flex items-center gap-1.5 text-bat-gold-400 font-bold">
            <span>💬</span> PAINEL ILUSTRADO DA TIRINHA
          </span>
          <span className="rounded bg-bat-gold-400/10 px-2 py-0.5 text-bat-gold-300">
            {quadrinhos.length} Quadrinhos
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quadrinhos.map((q, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-xl border-2 border-neutral-700 bg-neutral-900/90 p-3 shadow-md"
            >
              <div className="mb-2 flex items-center justify-between border-b border-neutral-800 pb-1.5">
                <span className="rounded bg-bat-gold-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bat-gold-400">
                  {q.num}
                </span>
                <span className="text-xs">💭</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-200 font-sans">
                {q.texto}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. CARTESIANO / FUNÇÃO
// ─────────────────────────────────────────────────────────────
function DiagramaCartesianoFuncao({ descricao }: { descricao: string }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-bat-gold-400/30 bg-[#090d16] p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] font-mono text-bat-text-muted">
          <span className="flex items-center gap-1.5 text-bat-gold-400 font-bold">
            <span>📈</span> PLANO CARTESIANO E FUNÇÃO
          </span>
          <span className="rounded bg-bat-gold-400/10 px-2 py-0.5 text-bat-gold-300">f(x)</span>
        </div>

        <svg viewBox="0 0 500 230" className="w-full h-auto mt-2" style={{ maxHeight: "250px" }}>
          <defs>
            <marker id="arrow-axis" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Eixo Y */}
          <line x1="250" y1="210" x2="250" y2="25" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow-axis)" />
          <text x="262" y="30" fill="#94a3b8" fontSize="12" fontWeight="bold" fontFamily="sans-serif">y</text>

          {/* Eixo X */}
          <line x1="40" y1="130" x2="470" y2="130" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow-axis)" />
          <text x="465" y="148" fill="#94a3b8" fontSize="12" fontWeight="bold" fontFamily="sans-serif">x</text>

          {/* Origem */}
          <text x="240" y="145" fill="#64748b" fontSize="11" fontFamily="sans-serif">0</text>

          {/* Curva de função (Parábola suave dourada) */}
          <path
            d="M 110 200 Q 250 30 390 200"
            fill="none"
            stroke="#facc15"
            strokeWidth="3"
          />
          <text x="260" y="60" fill="#facc15" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
            f(x)
          </text>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. ESBOÇO CONCEITUAL TÉCNICO (Fallback com Grid Blueprint)
// ─────────────────────────────────────────────────────────────
function DiagramaEsbocoGeral({ descricao }: { descricao: string }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-bat-gold-400/30 bg-[#090d16] p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] font-mono text-bat-text-muted">
          <span className="flex items-center gap-1.5 text-bat-gold-400 font-bold">
            <span>📐</span> ESQUEMA TÉCNICO CONCEITUAL
          </span>
          <span className="rounded bg-neutral-800 px-2 py-0.5 text-neutral-300">Ilustração da Questão</span>
        </div>

        <div className="my-3 flex items-start gap-3 rounded-lg bg-neutral-900/90 p-4 border border-neutral-800">
          <span className="text-2xl mt-0.5">💡</span>
          <div className="flex-1 text-sm leading-relaxed text-neutral-200">
            <MathText>{descricao}</MathText>
          </div>
        </div>
      </div>
    </div>
  );
}
