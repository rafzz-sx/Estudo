"use client";

/**
 * Quadro branco da questão.
 *
 * Muitas questões oficiais dependem de uma figura (triângulo, gráfico,
 * tirinha). Os arquivos de prova trazem essa figura como uma descrição
 * textual marcada com [IMAGEM: ...]. Em vez de esconder isso do aluno,
 * a plataforma desenha um quadro branco — como o da sala de aula — com a
 * descrição, e renderiza um SVG quando existir um desenho cadastrado.
 */
export function QuadroFigura({
  descricao,
  svg,
  titulo = "Figura da questão",
}: {
  descricao?: string | null;
  svg?: string | null;
  titulo?: string;
}) {
  if (!descricao && !svg) return null;

  return (
    <figure className="my-5 overflow-hidden rounded-2xl border-2 border-bat-border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      {/* Moldura do quadro */}
      <figcaption className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-4 py-2">
        <span className="text-sm">📐</span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
          {titulo}
        </span>
      </figcaption>

      <div className="px-5 py-5 text-neutral-900">
        {svg ? (
          <div
            className="flex w-full justify-center [&_svg]:h-auto [&_svg]:max-w-full"
            // O SVG vem do banco, cadastrado pela equipe pelo painel admin.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <p className="whitespace-pre-line text-center font-mono text-sm leading-relaxed text-neutral-800">
            {descricao}
          </p>
        )}
      </div>
    </figure>
  );
}
