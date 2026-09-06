"use client";

import React from "react";

/**
 * Renderizador de Markdown mínimo, escrito à mão.
 *
 * Por que não `react-markdown`? Adicionar dependência obrigaria um
 * `npm install` novo antes de qualquer build, e o conteúdo teórico usa um
 * subconjunto pequeno e previsível de Markdown. Este renderizador cobre
 * exatamente esse subconjunto — e, por não usar `dangerouslySetInnerHTML`,
 * não abre porta para HTML injetado no conteúdo.
 *
 * Suporta: # a ####, **negrito**, *itálico*, `código`, listas (- e 1.),
 * > citação, --- (linha), tabelas simples e parágrafos.
 */

// ─── Formatação dentro de uma linha ──────────────────────────
const RE_INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function inline(texto: string, chave: string): React.ReactNode[] {
  return texto.split(RE_INLINE).filter(Boolean).map((parte, i) => {
    const k = `${chave}-${i}`;
    if (parte.startsWith("**") && parte.endsWith("**")) {
      return (
        <strong key={k} className="font-bold text-bat-text">
          {parte.slice(2, -2)}
        </strong>
      );
    }
    if (parte.startsWith("`") && parte.endsWith("`")) {
      return (
        <code
          key={k}
          className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[0.9em] text-bat-gold-400"
        >
          {parte.slice(1, -1)}
        </code>
      );
    }
    if (parte.startsWith("*") && parte.endsWith("*") && parte.length > 2) {
      return (
        <em key={k} className="italic">
          {parte.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={k}>{parte}</React.Fragment>;
  });
}

const CLASSE_TITULO: Record<number, string> = {
  1: "heading mt-6 mb-3 text-2xl font-bold text-bat-text",
  2: "heading mt-6 mb-3 text-xl font-bold text-bat-gold-400",
  3: "heading mt-5 mb-2 text-lg font-bold text-bat-text",
  4: "heading mt-4 mb-2 text-base font-bold text-bat-text-secondary",
};

export function Markdown({ children }: { children: string }) {
  const linhas = children.replace(/\r\n/g, "\n").split("\n");
  const blocos: React.ReactNode[] = [];

  let i = 0;
  let n = 0;

  while (i < linhas.length) {
    const linha = linhas[i];
    const k = `b${n++}`;

    // Linha em branco
    if (!linha.trim()) {
      i++;
      continue;
    }

    // Separador
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(linha.trim())) {
      blocos.push(<hr key={k} className="my-6 border-bat-border" />);
      i++;
      continue;
    }

    // Título
    const tit = linha.match(/^(#{1,4})\s+(.*)$/);
    if (tit) {
      const nivel = tit[1].length;
      const Tag = `h${Math.min(nivel + 1, 6)}` as React.ElementType;
      blocos.push(
        <Tag key={k} className={CLASSE_TITULO[nivel]}>
          {inline(tit[2], k)}
        </Tag>
      );
      i++;
      continue;
    }

    // Citação (bloco de destaque)
    if (linha.startsWith(">")) {
      const partes: string[] = [];
      while (i < linhas.length && linhas[i].startsWith(">")) {
        partes.push(linhas[i].replace(/^>\s?/, ""));
        i++;
      }
      blocos.push(
        <blockquote
          key={k}
          className="my-4 rounded-r-xl border-l-4 border-bat-gold-400/60 bg-bat-gold-400/5 py-3 pl-4 pr-3 text-sm leading-relaxed text-bat-text-secondary"
        >
          {inline(partes.join(" "), k)}
        </blockquote>
      );
      continue;
    }

    // Tabela
    if (linha.includes("|") && linhas[i + 1]?.match(/^\s*\|?[\s:|-]+\|/)) {
      const cabecalho = linha.split("|").map((c) => c.trim()).filter(Boolean);
      i += 2;
      const corpo: string[][] = [];
      while (i < linhas.length && linhas[i].includes("|")) {
        corpo.push(linhas[i].split("|").map((c) => c.trim()).filter(Boolean));
        i++;
      }
      blocos.push(
        <div key={k} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-bat-border">
                {cabecalho.map((c, ci) => (
                  <th
                    key={ci}
                    className="px-3 py-2 text-left font-bold text-bat-gold-400"
                  >
                    {inline(c, `${k}h${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corpo.map((linhaTab, li) => (
                <tr key={li} className="border-b border-bat-border/40">
                  {linhaTab.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 text-bat-text-secondary">
                      {inline(c, `${k}c${li}${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Lista numerada
    if (/^\s*\d+\.\s+/.test(linha)) {
      const itens: string[] = [];
      while (i < linhas.length && /^\s*\d+\.\s+/.test(linhas[i])) {
        itens.push(linhas[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocos.push(
        <ol
          key={k}
          className="my-3 list-decimal space-y-1.5 pl-6 text-sm leading-relaxed text-bat-text-secondary marker:font-bold marker:text-bat-gold-400"
        >
          {itens.map((it, ii) => (
            <li key={ii}>{inline(it, `${k}i${ii}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Lista com marcadores
    if (/^\s*[-*+]\s+/.test(linha)) {
      const itens: string[] = [];
      while (i < linhas.length && /^\s*[-*+]\s+/.test(linhas[i])) {
        itens.push(linhas[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      blocos.push(
        <ul
          key={k}
          className="my-3 list-disc space-y-1.5 pl-6 text-sm leading-relaxed text-bat-text-secondary marker:text-bat-gold-400"
        >
          {itens.map((it, ii) => (
            <li key={ii}>{inline(it, `${k}i${ii}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Parágrafo (agrupa linhas seguidas)
    const partes: string[] = [];
    while (
      i < linhas.length &&
      linhas[i].trim() &&
      !/^(#{1,4}\s|>|\s*[-*+]\s|\s*\d+\.\s)/.test(linhas[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(linhas[i].trim())
    ) {
      partes.push(linhas[i].trim());
      i++;
    }
    blocos.push(
      <p key={k} className="my-3 text-sm leading-relaxed text-bat-text-secondary">
        {inline(partes.join(" "), k)}
      </p>
    );
  }

  return <div className="markdown">{blocos}</div>;
}
