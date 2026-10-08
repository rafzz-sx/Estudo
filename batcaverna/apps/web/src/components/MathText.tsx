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
  "text", "operatorname", "mathbf", "mathbb", "mathcal", "mathrm", "mathit", "textbf", "textit", "bm",
  "left", "right", "overline", "underline", "hat", "vec", "bar",
  "tilde", "dot", "ddot", "overrightarrow",
]);

// Regex para detectar comandos LaTeX fora de delimitadores (incluindo comandos com argumentos entre chaves como \vec{V}, \frac{a}{b}, \sqrt{x})
const NAKED_MATH_REGEX = /\\+(frac\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|sqrt(?:\[[^{}]*\])?\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|(?:operatorname|text|textbf|textit|mathrm|mathbf|mathbb|mathcal|mathit|bm|overline|underline|vec|hat|bar|tilde|dot|ddot|overrightarrow)\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}(?:\^[\\{]?[a-zA-Z0-9^\circ]+[\\}]?|_\{?[a-zA-Z0-9]+\}?)?|[a-zA-Z]+(?:\^[\\{]?[a-zA-Z0-9^\circ]+[\\}]?|_\{?[a-zA-Z0-9]+\}?)?)/g;

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

  // Se não tem $ nem \ e nem símbolos/expressões matemáticas em texto puro,
  // faz o caminho rápido seguro sem dangerouslySetInnerHTML
  if (!children.includes("$") && !children.includes("\\") && !hasMathFeatures(children)) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Lógica de detecção e conversão de matemática informal ───

function hasMathFeatures(text: string): boolean {
  return isPureMathExpression(text) || /[√∛π\^]|sqrt\(|root\(|\bpi\b|\d+\s*\/\s*\d+/.test(text);
}

function isPureMathExpression(text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  // Se já tem delimitadores $, o tokenizer principal de renderMathText extrai o miolo para o KaTeX.
  // Nunca deve ser tratado como expressão pura sem delimitador, pois causaria envio do $ ao KaTeX!
  if (t.includes("$")) return false;

  // Palavras comuns do português que denotam frase discursiva/enunciado
  const hasPortugueseWords =
    /\b(o|a|os|as|um|uma|de|do|da|dos|das|em|no|na|nos|nas|por|para|com|que|se|não|sim|é|são|foi|ser|estar|onde|como|mais|menos|sua|seu|dele|dela|qual|quando|quanto|valor|área|perímetro|triângulo|reta|ponto|plano|figura|resposta|opção|correta|incorreta|altura|base|lado|afirmar|apenas|ambos|quadrilátero|afirmações|assinale|abaixo|sabendo|analise|sobre|mesmo|entre|outro|outra|está|navio|bloco|haste|partícula|esfera)\b/i.test(
      t
    );
  if (hasPortugueseWords) return false;

  // Frases com palavras consecutivas em português
  if (/[a-zA-Zá-úÁ-Ú]{3,}\s+[a-zA-Zá-úÁ-Ú]{3,}\s+[a-zA-Zá-úÁ-Ú]{3,}/.test(t)) {
    return false;
  }

  // Se começa com comando LaTeX puro sem delimitadores (ex: \frac{3}{4}, \sqrt{13})
  if (t.startsWith("\\")) {
    const firstCmd = t.replace(/^\\+/, "").split(/[^a-zA-Z]/)[0];
    if (KNOWN_MATH_COMMANDS.has(firstCmd)) {
      return true;
    }
  }

  // Símbolos matemáticos ASCII (sem frases de texto)
  const hasMathSymbols = /[√∛π\^]|sqrt\(|root\(|\bpi\b|\*|\/|\=/.test(t);
  if (hasMathSymbols) {
    return true;
  }

  // Frações puras numéricas: 3/4, -1/2
  if (/^[+-]?\s*\d+\s*\/\s*\d+$/.test(t)) {
    return true;
  }

  return false;
}

function convertPlainMathToLatex(expr: string): string {
  let s = expr.trim();

  // 1. Unicodes e raízes
  s = s.replace(/∛\s*([0-9a-zA-Z]+|\([^\)]+\))/g, "\\sqrt[3]{$1}");
  s = s.replace(/√\s*([0-9a-zA-Z]+|\([^\)]+\))/g, "\\sqrt{$1}");
  s = s.replace(/root\((\d+)\)\(([^)]+)\)/g, "\\sqrt[$1]{$2}");
  s = s.replace(/sqrt\(([^()]+(?:\([^()]*\)[^()]*)*)\)/g, "\\sqrt{$1}");

  // 2. Letras gregas em texto ASCII
  s = s.replace(
    /\b(alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|rho|sigma|tau|phi|omega)\b/gi,
    (m) => `\\${m.toLowerCase()}`
  );

  // 3. Potências
  s = s.replace(/\^([a-zA-Z0-9]+)/g, "^{$1}");
  s = s.replace(/²|\^2/g, "^{2}");
  s = s.replace(/³|\^3/g, "^{3}");

  // 3.5 Expressões com raiz e fração: a*sqrt(b) / c -> \frac{a\sqrt{b}}{c}
  s = s.replace(
    /([0-9a-zA-Z]+)\s*(?:\*|\s*)\s*(\\sqrt\{[^}]+\})\s*\/\s*([0-9a-zA-Z]+)/g,
    "\\frac{$1$2}{$3}"
  );

  // 4. Multiplicação * -> \cdot
  s = s.replace(/(\d+)\s*\*\s*\\pi/g, "$1\\pi");
  s = s.replace(/\s*\*\s*/g, " \\cdot ");

  // 5. Frações puras entre parênteses: (9/2), (9\pi/4)
  s = s.replace(
    /\(([a-zA-Z0-9_\\\s\cdot]+)\s*\/\s*([a-zA-Z0-9_\\\s\cdot]+)\)/g,
    "\\frac{$1}{$2}"
  );

  // 6. Frações simples sem parênteses: 9/2, 1/512, \pi/2, \sqrt{3}/2
  s = s.replace(
    /((?:\\sqrt\{[^{}]+\}|\\sqrt\[[^{}]*\]\{[^{}]*\}|\\pi|[0-9a-zA-Z]+))\s*\/\s*([0-9a-zA-Z]+)/g,
    "\\frac{$1}{$2}"
  );

  // 7. Frações com parênteses: (m + M) / (2g)
  s = s.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, "\\frac{$1}{$2}");
  s = s.replace(/\(([^()]+)\)\s*\/\s*([a-zA-Z0-9]+)/g, "\\frac{$1}{$2}");

  // 8. Ajusta parênteses para \left( e \right) quando contêm frações
  s = s.replace(/\(([^()]*\\frac[^()]*)\)/g, "\\left($1\\right)");

  return s;
}

function preprocessPlainTextMath(text: string): string {
  return text.replace(
    /(\(?[a-zA-Z0-9_\*]+\s*\*\s*(?:sqrt\([^)]+\)|√\d+)\)?\s*\/\s*\d+|\([a-zA-Z0-9_\*]+\s*\/\s*[a-zA-Z0-9_\*]+\))/g,
    (m) => `$${convertPlainMathToLatex(m)}$`
  );
}

// ─── Lógica de parsing e tokenização ─────────────────────────

function renderMathText(text: string): string {
  if (!text) return "";

  // Se for uma expressão matemática pura em texto informal, renderiza diretamente
  if (isPureMathExpression(text)) {
    const lat = convertPlainMathToLatex(text);
    return renderKatex(lat, false);
  }

  // Preprocessa trechos matemáticos informais isolados no texto
  const processed = preprocessPlainTextMath(text);

  if (!processed.includes("$") && !processed.includes("\\")) return escapeHtml(processed);

  const tokens: string[] = [];
  let remaining = processed;

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

  // Normaliza comandos de vetor/acento sem chaves (ex: \vec V -> \vec{V}, \hat i -> \hat{i})
  const normalizedText = text
    .replace(/\\vec\s+([a-zA-Z])/g, (_m, p1) => `\\vec{${p1}}`)
    .replace(/\\hat\s+([a-zA-Z])/g, (_m, p1) => `\\hat{${p1}}`)
    .replace(/\\bar\s+([a-zA-Z])/g, (_m, p1) => `\\bar{${p1}}`)
    .replace(/\\dot\s+([a-zA-Z])/g, (_m, p1) => `\\dot{${p1}}`);

  // Se o trecho inteiro começa com \ e é uma expressão matemática pura sem frases
  // Ex: "\frac{7!}{5!} \cdot \frac{5!}{3!}"
  const trimmed = normalizedText.trim();
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
  while ((match = NAKED_MATH_REGEX.exec(normalizedText)) !== null) {
    const fullMatch = match[0];
    const matchStart = match.index;
    const cmdName = match[1].split(/[^a-zA-Z]/)[0];

    // Ignora caracteres não-matemáticos (como \t, \n)
    if (!KNOWN_MATH_COMMANDS.has(cmdName)) {
      continue;
    }

    // Adiciona o texto puro anterior
    if (matchStart > lastIndex) {
      parts.push(escapeHtml(normalizedText.slice(lastIndex, matchStart)));
    }

    // Renderiza o comando ou expressão LaTeX
    const cleanCmd = fullMatch.replace(/^\\+/, "\\");
    parts.push(renderKatex(cleanCmd, false));
    lastIndex = matchStart + fullMatch.length;
  }

  if (lastIndex < normalizedText.length) {
    parts.push(escapeHtml(normalizedText.slice(lastIndex)));
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
