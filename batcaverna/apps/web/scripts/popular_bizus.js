const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bzrrbbaqzlfmertirbak.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnJiYmFxemxmbWVydGlyYmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk1OTYzOCwiZXhwIjoyMTAzNTM1NjM4fQ.YfNFyyNHbjF9kYF48uNWchYvQuI_PGaIC-2LNE2UktE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Parser tokenizador para tuplas SQL: ('val1', 'val2', 'val3', ...)
function parseSqlTuples(sqlText) {
  const tuples = [];
  let i = 0;
  const len = sqlText.length;

  while (i < len) {
    // Procura o início de uma tupla '('
    while (i < len && sqlText[i] !== '(') {
      // Pula comentários de linha
      if (sqlText[i] === '-' && sqlText[i + 1] === '-') {
        while (i < len && sqlText[i] !== '\n') i++;
      }
      i++;
    }
    if (i >= len) break;

    i++; // pula '('
    const values = [];

    while (i < len) {
      // Pula espaços e comentários
      while (i < len && /\s/.test(sqlText[i])) i++;
      if (sqlText[i] === '-' && sqlText[i + 1] === '-') {
        while (i < len && sqlText[i] !== '\n') i++;
        continue;
      }

      if (sqlText[i] === ')') {
        i++; // fim da tupla
        break;
      }

      if (sqlText[i] === "'") {
        i++; // pula apóstrofo inicial
        let strVal = '';
        while (i < len) {
          if (sqlText[i] === "'") {
            if (sqlText[i + 1] === "'") {
              strVal += "'";
              i += 2;
            } else {
              i++; // fim da string
              break;
            }
          } else {
            strVal += sqlText[i];
            i++;
          }
        }
        values.push(strVal);
      }

      // Pula até a vírgula ou parêntese de fechamento
      while (i < len && sqlText[i] !== ',' && sqlText[i] !== ')') {
        if (sqlText[i] === '-' && sqlText[i + 1] === '-') {
          while (i < len && sqlText[i] !== '\n') i++;
        } else {
          i++;
        }
      }

      if (sqlText[i] === ',') {
        i++; // pula vírgula
      }
    }

    if (values.length === 6) {
      tuples.push({
        materiaNome: values[0].trim(),
        assuntoNome: values[1].trim(),
        titulo: values[2].trim(),
        conteudo: values[3].trim(),
        nivelImpacto: values[4].trim(),
        exemploPratico: values[5].trim(),
      });
    }
  }

  return tuples;
}

async function main() {
  console.log('Iniciando importação de bizus...');

  const seedPath = path.resolve(__dirname, '../../../supabase/seeds/bizus_01.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  const bizusInsertIdx = sql.indexOf('INSERT INTO bizus');
  const valuesIdx = sql.indexOf('JOIN (VALUES', bizusInsertIdx);
  const endIdx = sql.indexOf(') AS v(materia', valuesIdx);
  const valuesStr = sql.slice(valuesIdx + 12, endIdx);

  const bizusParaInserir = parseSqlTuples(valuesStr);
  console.log(`Encontrados ${bizusParaInserir.length} bizus no arquivo de seed.`);

  // Buscar todas as matérias
  const { data: materias, error: matErr } = await supabase.from('materias').select('id, nome');
  if (matErr) throw matErr;

  const matMap = new Map();
  materias.forEach(m => matMap.set(m.nome.toLowerCase(), m.id));

  // Buscar todos os assuntos
  const { data: assuntos, error: assErr } = await supabase.from('assuntos').select('id, nome, materia_id');
  if (assErr) throw assErr;

  const assMap = new Map();
  assuntos.forEach(a => assMap.set(`${a.materia_id}_${a.nome.toLowerCase()}`, a.id));

  let inseridos = 0;
  let jaExistentes = 0;

  for (const b of bizusParaInserir) {
    let materiaId = matMap.get(b.materiaNome.toLowerCase());
    if (!materiaId) {
      for (const [nome, id] of matMap.entries()) {
        if (nome.includes(b.materiaNome.toLowerCase()) || b.materiaNome.toLowerCase().includes(nome)) {
          materiaId = id;
          break;
        }
      }
    }

    if (!materiaId) {
      console.error(`Não foi possível encontrar matéria para: ${b.materiaNome}`);
      continue;
    }

    // Assunto
    let assuntoKey = `${materiaId}_${b.assuntoNome.toLowerCase()}`;
    let assuntoId = assMap.get(assuntoKey);

    if (!assuntoId) {
      console.log(`Criando assunto '${b.assuntoNome}' para matéria '${b.materiaNome}'...`);
      const { data: novoAssunto, error: crErr } = await supabase
        .from('assuntos')
        .insert({
          materia_id: materiaId,
          nome: b.assuntoNome,
          ordem: 0,
        })
        .select()
        .single();

      if (crErr) {
        console.error(`Erro ao criar assunto ${b.assuntoNome}:`, crErr.message);
        continue;
      }
      assuntoId = novoAssunto.id;
      assMap.set(assuntoKey, assuntoId);
    }

    // Verifica se já existe bizu com esse título
    const { data: existente } = await supabase
      .from('bizus')
      .select('id')
      .eq('titulo', b.titulo)
      .maybeSingle();

    if (existente) {
      jaExistentes++;
      continue;
    }

    const { error: insErr } = await supabase.from('bizus').insert({
      assunto_id: assuntoId,
      titulo: b.titulo,
      conteudo: b.conteudo,
      nivel_impacto: b.nivelImpacto,
      exemplo_pratico: b.exemploPratico || null,
      concurso_id: null,
    });

    if (insErr) {
      console.error(`Erro ao inserir bizu '${b.titulo}':`, insErr.message);
    } else {
      inseridos++;
    }
  }

  console.log(`\nImportação concluída com sucesso!`);
  console.log(`- Novos bizus inseridos: ${inseridos}`);
  console.log(`- Já existentes ignorados: ${jaExistentes}`);

  // Verificar contagem final
  const { count } = await supabase.from('bizus').select('*', { count: 'exact', head: true });
  console.log(`- Total de bizus no banco agora: ${count}`);
}

main().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
