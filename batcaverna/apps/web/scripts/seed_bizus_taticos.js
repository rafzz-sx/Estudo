const fs = require('fs');
const env = fs.readFileSync('c:/Users/perei/OneDrive/Documentos/Estudo/batcaverna/apps/web/.env.local', 'utf-8');
const envVars = {};
for (const l of env.split('\n')) {
  const match = l.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
}
const { createClient } = require('c:/Users/perei/OneDrive/Documentos/Estudo/batcaverna/node_modules/@supabase/supabase-js');
const s = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: concursos } = await s.from('concursos').select('id, sigla');
  const enemId = concursos.find(c => c.sigla === 'ENEM')?.id || null;

  const { data: assuntos } = await s.from('assuntos').select('id, nome');
  const getAssunto = (nome) => assuntos.find(a => a.nome.toLowerCase().includes(nome.toLowerCase()))?.id || assuntos[0].id;

  const novosBizus = [
    {
      titulo: 'ENEM & TRI: A Regra de Ouro da Coerência Pedagógica',
      conteudo: 'No ENEM, uma questão difícil vale MENOS se você errar as fáceis da mesma prova! O algoritmo da TRI interpreta isso como chute. Priorize sempre responder primeiro o que você domina com segurança.',
      exemplo_pratico: 'Estratégia TRI: 1ª passada = questões fáceis e rápidas. 2ª passada = médias. Só no final invista tempo nas complexas com cálculos longos.',
      nivel_impacto: 'alto',
      concurso_id: enemId,
      assunto_id: getAssunto('Interpretação de Texto'),
    },
    {
      titulo: 'Escala no ENEM: Cuidado com a Armadilha da Dimensão',
      conteudo: 'A escala dada na legenda (ex: 1:100) é LINEAR (comprimento). Se a questão pedir Área, você deve elevar ao quadrado (1:10.000). Se pedir Volume ou Capacidade (Litros), deve elevar ao cubo (1:1.000.000)!',
      exemplo_pratico: 'Escala 1:50\nComprimento: ×50\nÁrea: ×50² = ×2.500\nVolume: ×50³ = ×125.000',
      nivel_impacto: 'alto',
      concurso_id: enemId,
      assunto_id: getAssunto('Porcentagem'),
    },
    {
      titulo: 'Crase Sem Erro: O Teste do "Ao" e a Proibição do Verbo',
      conteudo: 'Quer ter certeza se vai crase? Troque o termo feminino seguinte por um masculino (ex: troque "cidade" por "bairro", "escola" por "colégio"). Se virar "ao", tem crase! Se virar apenas "o", NÃO tem crase. E memorize: NUNCA use crase antes de verbo!',
      exemplo_pratico: 'Fui à praia  →  Fui AO clube (tem crase à)\nDisposto a lutar  →  Lutar é verbo (proibido crase!)',
      nivel_impacto: 'alto',
      concurso_id: null,
      assunto_id: getAssunto('Crase'),
    },
    {
      titulo: 'Conversão Relâmpago: km/h para m/s em 3 Segundos',
      conteudo: 'Dividir por 3,6 no meio da prova gasta tempo precioso. Memorize os múltiplos do "Passo 5 para 18": cada 5 m/s equivalem exatamente a 18 km/h. É uma tabuada mágica que cai em 90% das questões!',
      exemplo_pratico: '5 m/s = 18 km/h\n10 m/s = 36 km/h\n15 m/s = 54 km/h\n20 m/s = 72 km/h\n25 m/s = 90 km/h\n30 m/s = 108 km/h',
      nivel_impacto: 'alto',
      concurso_id: null,
      assunto_id: getAssunto('Leis de Newton'),
    },
    {
      titulo: 'Cálculo Mental: Porcentagens Rápidas com a Técnica 10% e 1%',
      conteudo: 'Não arme conta montando fração com 100 no denominador. Para achar 10%, desloque a vírgula 1 casa para a esquerda. Para 1%, desloque 2 casas. Qualquer porcentagem vira uma soma mental simples.',
      exemplo_pratico: 'Calcular 15% de 240:\n10% = 24\n5% (metade) = 12\n15% = 24 + 12 = 36!',
      nivel_impacto: 'util',
      concurso_id: null,
      assunto_id: getAssunto('Porcentagem'),
    },
    {
      titulo: 'Redação ENEM Nota 1000: Os 5 Elementos Obrigatórios da C5',
      conteudo: 'A proposta de intervenção na Conclusão do ENEM vale 200 pontos inteiros e exige 5 elementos obrigatórios. Se faltar apenas um, sua nota cai direto para 160 ou 120!',
      exemplo_pratico: '1. Agente (Quem fará? Ex: Ministério da Educação)\n2. Ação (O que fará? Ex: criar oficinas formativas)\n3. Meio/Modo (Como? Ex: por meio de parcerias com ONGs)\n4. Efeito (Para quê? Ex: a fim de reduzir a evasão)\n5. Detalhamento (Explicação extra de um dos itens acima)',
      nivel_impacto: 'alto',
      concurso_id: enemId,
      assunto_id: getAssunto('Interpretação de Texto'),
    },
    {
      titulo: 'Fórmula de Bhaskara Sem Contas: Técnica de Soma e Produto',
      conteudo: 'Para qualquer equação do tipo x² − Sx + P = 0 com a = 1: a soma das raízes é -b e o produto é c. Não use delta e fórmula longa quando puder simplesmente pensar em dois números.',
      exemplo_pratico: 'x² − 7x + 12 = 0\nSoma = 7, Produto = 12\nQuais números multiplicados dão 12 e somados dão 7? Raízes: 3 e 4 direto!',
      nivel_impacto: 'alto',
      concurso_id: null,
      assunto_id: getAssunto('Equações'),
    },
    {
      titulo: 'Oxirredução Sem Confusão: O Macete do "DARA"',
      conteudo: 'Bancas adoram trocar "agente oxidante" com "agente redutor". Para nunca mais errar: quem DÁ elétrons OXIDA, tem seu NOX Aumentado, e atua como AGENTE REDUTOR (reduz o outro). Mnemônico: D-A-R-A!',
      exemplo_pratico: 'D - Dá elétrons\nA - Aumenta NOX (Oxida)\nR - Reduz o outro elemento\nA - Agente Redutor',
      nivel_impacto: 'alto',
      concurso_id: null,
      assunto_id: getAssunto('Trabalho e Energia'),
    },
    {
      titulo: 'Regência Verbal Perigosa: Assistir, Visar e Aspirar',
      conteudo: 'Esses três verbos mudam de sentido e regência dependendo da preposição. As bancas colocam no gabarito a forma popular que você fala no dia a dia para te induzir ao erro!',
      exemplo_pratico: 'Assistir a (ver/presenciar): "Assisti AO jogo" (não "o jogo").\nAspirar a (desejar): "Aspira AO cargo".\nAspirar (respirar): "Aspirou o pó".\nVisar a (objetivar): "Visou AO sucesso".',
      nivel_impacto: 'alto',
      concurso_id: null,
      assunto_id: getAssunto('Regência'),
    },
    {
      titulo: 'Potência e Energia Elétrica: O Macete "E = P · Δt"',
      conteudo: 'A conta de luz cai todo ano no ENEM e nos concursos militares. Lembre-se: Energia (em kWh) é Potência (em kW) multiplicada pelo Tempo (em Horas). Para converter Watts para kW, basta dividir por 1.000.',
      exemplo_pratico: 'Chuveiro de 5000 W (5 kW) usado por 30 minutos (0,5 h) ao dia durante 30 dias:\nE = 5 kW × 0,5 h × 30 = 75 kWh.',
      nivel_impacto: 'util',
      concurso_id: null,
      assunto_id: getAssunto('Trabalho e Energia'),
    }
  ];

  console.log('Inserindo', novosBizus.length, 'novos bizus táticos...');
  for (const b of novosBizus) {
    // Evita duplicar se já existir pelo título
    const { data: ex } = await s.from('bizus').select('id').ilike('titulo', b.titulo).maybeSingle();
    if (!ex) {
      const { error } = await s.from('bizus').insert(b);
      if (error) console.error('Erro ao inserir:', b.titulo, error.message);
      else console.log('✓ Inserido:', b.titulo);
    } else {
      console.log('Já existe:', b.titulo);
    }
  }

  const { count: totalFinal } = await s.from('bizus').select('id', { count: 'exact', head: true });
  console.log('Total final de bizus no Supabase:', totalFinal);
}
run();
