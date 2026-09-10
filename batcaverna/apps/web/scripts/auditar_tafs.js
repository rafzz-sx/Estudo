const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf-8');
let url = '', key = '';
env.split('\n').forEach(l => {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim().replace(/["']/g, '');
  if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = l.split('=')[1].trim().replace(/["']/g, '');
});

const sb = createClient(url, key);

async function run() {
  const { data: concursos } = await sb.from('concursos').select('id, sigla, nome');
  const concMap = Object.fromEntries(concursos.map(c => [c.id, c.sigla]));
  
  const { data: tafs, error } = await sb.from('taf_provas')
    .select('id, concurso_id, sexo, exercicio, unidade, minimo_aprovacao, observacao, ordem')
    .order('concurso_id')
    .order('sexo')
    .order('ordem');

  if (error) {
    console.error('Erro ao ler taf_provas:', error);
    return;
  }

  console.log(`Total de registros TAF no banco: ${tafs.length}`);
  tafs.forEach(t => {
    console.log(`[${concMap[t.concurso_id]}] ${t.sexo.toUpperCase()} - ${t.exercicio} (${t.unidade}): ${t.minimo_aprovacao} | obs: ${t.observacao || 'sem obs'}`);
  });
}

run();
