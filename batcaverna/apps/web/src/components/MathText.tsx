"use client";

import { useMemo } from "react";
import katex from "katex";

/**
 * Comandos LaTeX matemáticos reconhecidos.
 * Permite auto-renderizar expressões matemáticas mesmo quando não estão
 * explicitamente delimitadas por $...$ ou $$...$$.
 */
const KNOWN_MATH_COMMANDS = new Set([
  "frac", "sqrt", "cdot", "times", "div", "pm", "mp",
  "implies", "Rightarrow", "Leftarrow", "iff", "Leftrightarrow",
  "le", "ge", "leq", "geq", "neq", "approx", "sim", "equiv",
  "alpha", "beta", "gamma", "delta", "epsilon", "varepsilon",
  "zeta", "eta", "theta", "vartheta", "iota", "kappa",
  "lambda", "mu", "nu", "xi", "pi", "varpi", "rho", "varrho",
  "sigma", "varsigma", "tau", "upsilon", "phi", "varphi",
  "chi", "psi", "omega",
  "Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi", "Sigma",
  "Upsilon", "Phi", "Psi", "Omega",
  "sin", "cos", "tan", "sec", "csc", "cot",
  "sen", "tg", "cotg", "cosec", "arctg", "arcsen",
  "log", "ln", "exp", "lim", "sum", "prod", "int", "oint",
  "infty", "partial", "nabla", "circ", "degree",
  "in", "notin", "subset", "subseteq", "supset", "supseteq",
  "cap", "cup", "setminus", "forall", "exists", "nexists",
  "text", "operatorname", "mathbf", "mathbb", "mathcal", "mathrm",
  "left", "right", "overline", "underline", "hat", "vec", "bar",
]);

// Regex para detectar comandos LaTeX fora de delimitadores
const NAKED_MATH_REGEX = /\\+(frac\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|sqrt(?:\[[^{}]*\])?\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|(?:operatorname|text|mathbb|mathbf|mathcal|overline)\{[^{}]*\}|[a-zA-Z]+(?:\^[\\{]?[a-zA-Z0-9^\circ]+[\\}]?|_\{?[a-zA-Z0-9]+\}?)?)/g;

/**
 * Renderiza texto que pode conter expressões LaTeX:
 *   - Delimitadas: $$...$$ (display) ou $...$ (inline)
 *   - Não-delimitadas: \frac{...}{...}, \sqrt{...}, \pi, \alpha, \mu, etc.
 *
 * Trechos fora de expressões matemáticas são mantidos como texto puro
 * seguro (HTML-escaped), preservando quebras de linha.
 */
export function MathText({
  children,
  className,
}: {
  children: string | null | undefined;
  className?: string;
}) {
  const html = useMemo(() => renderMathText(children ?? ""), [children]);

  if (!children) return null;

  // Texto sem $ e sem \ → caminho rápido e direto sem dangerouslySetInnerHTML
  if (!children.includes("$") && !children.includes("\\")) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Lógica de parsing e tokenização ─────────────────────────

function renderMathText(text: string): string {
  if (!text) return "";
  if (!text.includes("$") && !text.includes("\\")) return escapeHtml(text);

  const tokens: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const idxDouble = remaining.indexOf("$$");
    const idxSingle = remaining.indexOf("$");

    // Nenhum $ restante → processa resto procurando comandos LaTeX nus
    if (idxSingle === -1) {
      tokens.push(renderSegmentWithNakedMath(remaining));
      break;
    }

    // $$ aparece antes de $ (ou na mesma posição) → display math
    if (idxDouble !== -1 && idxDouble <= idxSingle) {
      if (idxDouble > 0) {
        tokens.push(renderSegmentWithNakedMath(remaining.slice(0, idxDouble)));
      }
      const closeIdx = remaining.indexOf("$$", idxDouble + 2);
      if (closeIdx === -1) {
        tokens.push(renderSegmentWithNakedMath(remaining.slice(idxDouble)));
        break;
      }
      tokens.push(renderKatex(remaining.slice(idxDouble + 2, closeIdx), true));
      remaining = remaining.slice(closeIdx + 2);
      continue;
    }

    // $ simples (inline math)
    if (idxSingle > 0) {
      tokens.push(renderSegmentWithNakedMath(remaining.slice(0, idxSingle)));
    }

    // Procura o $ de fechamento
    let closeIdx = -1;
    for (let i = idxSingle + 1; i < remaining.length; i++) {
      if (remaining[i] === "$") {
        if (i + 1 < remaining.length && remaining[i + 1] === "$") continue;
        if (i > 0 && remaining[i - 1] === "\\") continue;
        closeIdx = i;
        break;
      }
    }

    if (closeIdx === -1) {
      tokens.push(renderSegmentWithNakedMath(remaining.slice(idxSingle)));
      break;
    }

    tokens.push(renderKatex(remaining.slice(idxSingle + 1, closeIdx), false));
    remaining = remaining.slice(closeIdx + 1);
  }

  return tokens.join("");
}

/**
 * Processa um trecho que não estava delimitado por $.
 * Se contiver comandos LaTeX matemáticos conhecidos (\frac, \sqrt, \pi, etc.),
 * renderiza-os com KaTeX e mantém o restante como texto seguro.
 */
function renderSegmentWithNakedMath(text: string): string {
  if (!text.includes("\\")) {
    return escapeHtml(text);
  }

  // Se o trecho inteiro começa com \ e é uma expressão matemática pura sem frases
  // Ex: "\frac{7!}{5!} \cdot \frac{5!}{3!}"
  const trimmed = text.trim();
  if (trimmed.startsWith("\\") && !/[a-zA-Z]{5,}\s+[a-zA-Z]{5,}/.test(trimmed)) {
    const firstWord = trimmed.replace(/^\\+/, "").split(/[^a-zA-Z]/)[0];
    if (KNOWN_MATH_COMMANDS.has(firstWord)) {
      return renderKatex(trimmed, false);
    }
  }

  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  NAKED_MATH_REGEX.lastIndex = 0;
  while ((match = NAKED_MATH_REGEX.exec(text)) !== null) {
    const fullMatch = match[0];
    const matchStart = match.index;
    const cmdName = match[1].split(/[^a-zA-Z]/)[0];

    // Ignora caracteres não-matemáticos (como \t, \n)
    if (!KNOWN_MATH_COMMANDS.has(cmdName)) {
      continue;
    }

    // Adiciona o texto puro anterior
    if (matchStart > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, matchStart)));
    }

    // Renderiza o comando ou expressão LaTeX
    const cleanCmd = fullMatch.replace(/^\\+/, "\\");
    parts.push(renderKatex(cleanCmd, false));
    lastIndex = matchStart + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }

  return parts.join("");
}

/**
 * Renderiza uma expressão LaTeX usando KaTeX.
 * Normaliza barras duplas escapadas (comuns em bancos de dados / JSON).
 */
function renderKatex(latex: string, displayMode: boolean): string {
  // Normaliza barras duplas (ex: \\frac -> \frac, \\sqrt -> \sqrt)
  const normalized = latex.replace(/\\\\([a-zA-Z]+)/g, "\\$1");

  try {
    return katex.renderToString(normalized, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
      // Macros comuns em provas brasileiras e militares
      macros: {
        "\\sen": "\\operatorname{sen}",
        "\\tg": "\\operatorname{tg}",
        "\\cotg": "\\operatorname{cotg}",
        "\\cosec": "\\operatorname{cosec}",
        "\\sec": "\\operatorname{sec}",
        "\\arctg": "\\operatorname{arctg}",
        "\\arcsen": "\\operatorname{arcsen}",
        "\\degree": "^{\\circ}",
      },
    });
  } catch {
    // Fallback gracioso: exibe o código original formatado
    const escaped = escapeHtml(latex);
    return displayMode
      ? `<div class="math-fallback-block"><code>${escaped}</code></div>`
      : `<code class="math-fallback-inline">${escaped}</code>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");
}
