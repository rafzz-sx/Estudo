/**
 * Utilitário para tratamento de figuras e textos-base de questões.
 *
 * Muitas questões vindas de bancas trazem a descrição da imagem dentro do texto_base
 * no formato `[DESCRIÇÃO DA IMAGEM: ...]` ou `[IMAGEM: ...]`.
 *
 * Esta função:
 * 1. Extrai a descrição da imagem para o quadro de figura se `figura_descricao` estiver vazia;
 * 2. Remove o bloco da imagem do `texto_base` para não duplicar visualmente;
 * 3. Se o `texto_base` só continha a tag da imagem, retorna `null` para ocultar o quadro "Texto base".
 */
export function tratarTextoBaseEFigura(
  textoBase?: string | null,
  figuraDescricao?: string | null
): {
  textoBaseFinal: string | null;
  figuraDescricaoFinal: string | null;
} {
  let textoBaseFinal = textoBase ? textoBase.trim() : null;
  let figuraDescricaoFinal = figuraDescricao ? figuraDescricao.trim() : null;

  if (textoBaseFinal) {
    const match = textoBaseFinal.match(/\[(?:DESCRIÇÃO DA IMAGEM|IMAGEM):\s*([\s\S]*?)\]/i);
    if (match) {
      if (!figuraDescricaoFinal) {
        figuraDescricaoFinal = match[1].trim();
      }
      const semTag = textoBaseFinal.replace(match[0], "").trim();
      textoBaseFinal = semTag.length > 0 ? semTag : null;
    }
  }

  return { textoBaseFinal, figuraDescricaoFinal };
}
