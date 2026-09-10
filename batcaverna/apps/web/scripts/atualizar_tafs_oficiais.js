/**
 * Auditoria e Correção dos TAFs Oficiais
 * 
 * Limpa duplicatas da EsPCEx e atualiza todos os índices
 * para os editais oficiais vigentes 2025/2026.
 */
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

// TAFs oficiais conforme editais vigentes 2025/2026
const TAF_OFICIAIS = [
  // ─── EEAR (TACF — Edital 2025) ─────────────────────────────
  { sigla: 'EEAR', sexo: 'masculino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '2.250 m', faixa: '17 a 25 anos', ordem: 1, obs: 'Teste de Avaliação do Condicionamento Físico' },
  { sigla: 'EEAR', sexo: 'masculino', exercicio: 'Flexão de braço no solo', unidade: 'repetições', minimo: '26 repetições', faixa: '17 a 25 anos', ordem: 2, obs: 'Apoio de frente sobre o solo' },
  { sigla: 'EEAR', sexo: 'masculino', exercicio: 'Abdominal tipo remador', unidade: 'repetições', minimo: '42 em 1 min', faixa: '17 a 25 anos', ordem: 3, obs: null },
  { sigla: 'EEAR', sexo: 'feminino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '1.850 m', faixa: '17 a 25 anos', ordem: 1, obs: null },
  { sigla: 'EEAR', sexo: 'feminino', exercicio: 'Flexão de braço no solo', unidade: 'repetições', minimo: '16 repetições', faixa: '17 a 25 anos', ordem: 2, obs: 'Modalidade adaptada (joelhos)' },
  { sigla: 'EEAR', sexo: 'feminino', exercicio: 'Abdominal tipo remador', unidade: 'repetições', minimo: '34 em 1 min', faixa: '17 a 25 anos', ordem: 3, obs: null },
  
  // ─── ESA (TAF — Edital 2025) ──────────────────────────────
  { sigla: 'ESA', sexo: 'masculino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '2.450 m', faixa: '17 a 24 anos', ordem: 1, obs: null },
  { sigla: 'ESA', sexo: 'masculino', exercicio: 'Flexão na barra fixa', unidade: 'repetições', minimo: '3 repetições', faixa: '17 a 24 anos', ordem: 2, obs: 'Pegada pronada' },
  { sigla: 'ESA', sexo: 'masculino', exercicio: 'Flexão de braço no solo', unidade: 'repetições', minimo: '21 repetições', faixa: '17 a 24 anos', ordem: 3, obs: null },
  { sigla: 'ESA', sexo: 'masculino', exercicio: 'Abdominal supra', unidade: 'repetições', minimo: '30 em 1 min', faixa: '17 a 24 anos', ordem: 4, obs: null },
  { sigla: 'ESA', sexo: 'feminino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '2.100 m', faixa: '17 a 24 anos', ordem: 1, obs: null },
  { sigla: 'ESA', sexo: 'feminino', exercicio: 'Barra fixa estática (isometria)', unidade: 'segundos', minimo: '10 segundos', faixa: '17 a 24 anos', ordem: 2, obs: null },
  { sigla: 'ESA', sexo: 'feminino', exercicio: 'Flexão de braço no solo', unidade: 'repetições', minimo: '12 repetições', faixa: '17 a 24 anos', ordem: 3, obs: null },
  { sigla: 'ESA', sexo: 'feminino', exercicio: 'Abdominal supra', unidade: 'repetições', minimo: '27 em 1 min', faixa: '17 a 24 anos', ordem: 4, obs: null },

  // ─── EPCAR (TACF — Edital 2025) ───────────────────────────
  { sigla: 'EPCAR', sexo: 'masculino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '2.050 m', faixa: '14 a 18 anos', ordem: 1, obs: null },
  { sigla: 'EPCAR', sexo: 'masculino', exercicio: 'Flexão de braço no solo', unidade: 'repetições', minimo: '26 repetições', faixa: '14 a 18 anos', ordem: 2, obs: null },
  { sigla: 'EPCAR', sexo: 'masculino', exercicio: 'Abdominal tipo remador', unidade: 'repetições', minimo: '38 em 1 min', faixa: '14 a 18 anos', ordem: 3, obs: null },
  { sigla: 'EPCAR', sexo: 'feminino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '1.650 m', faixa: '14 a 18 anos', ordem: 1, obs: null },
  { sigla: 'EPCAR', sexo: 'feminino', exercicio: 'Flexão de braço no solo', unidade: 'repetições', minimo: '16 repetições', faixa: '14 a 18 anos', ordem: 2, obs: null },
  { sigla: 'EPCAR', sexo: 'feminino', exercicio: 'Abdominal tipo remador', unidade: 'repetições', minimo: '32 em 1 min', faixa: '14 a 18 anos', ordem: 3, obs: null },

  // ─── CN — Colégio Naval (TSF — Edital 2025) ───────────────
  { sigla: 'CN', sexo: 'masculino', exercicio: 'Natação 25 m', unidade: 'segundos', minimo: '50 segundos', faixa: '15 a 18 anos', ordem: 1, obs: 'Teste de Suficiência Física — Eliminatório' },
  { sigla: 'CN', sexo: 'masculino', exercicio: 'Corrida de 2.400 m', unidade: 'minutos', minimo: '16 minutos', faixa: '15 a 18 anos', ordem: 2, obs: null },
  { sigla: 'CN', sexo: 'feminino', exercicio: 'Natação 25 m', unidade: 'segundos', minimo: '1 minuto', faixa: '15 a 18 anos', ordem: 1, obs: 'Eliminatório' },
  { sigla: 'CN', sexo: 'feminino', exercicio: 'Corrida de 2.400 m', unidade: 'minutos', minimo: '17 minutos', faixa: '15 a 18 anos', ordem: 2, obs: null },

  // ─── EAM — Aprendizes-Marinheiros (TSF — Edital 2025) ─────
  { sigla: 'EAM', sexo: 'masculino', exercicio: 'Natação 50 m', unidade: 'minutos', minimo: '1 min 30 s', faixa: '18 a 21 anos', ordem: 1, obs: 'Eliminatório' },
  { sigla: 'EAM', sexo: 'masculino', exercicio: 'Corrida de 2.400 m', unidade: 'minutos', minimo: '14 min 30 s', faixa: '18 a 21 anos', ordem: 2, obs: null },
  { sigla: 'EAM', sexo: 'feminino', exercicio: 'Natação 50 m', unidade: 'minutos', minimo: '2 min 20 s', faixa: '18 a 21 anos', ordem: 1, obs: 'Eliminatório' },
  { sigla: 'EAM', sexo: 'feminino', exercicio: 'Corrida de 2.400 m', unidade: 'minutos', minimo: '16 minutos', faixa: '18 a 21 anos', ordem: 2, obs: null },

  // ─── EsPCEx (TAF — Edital 2025) ───────────────────────────
  { sigla: 'EsPCEx', sexo: 'masculino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '2.450 m', faixa: '17 a 22 anos', ordem: 1, obs: null },
  { sigla: 'EsPCEx', sexo: 'masculino', exercicio: 'Flexão na barra fixa', unidade: 'repetições', minimo: '3 repetições', faixa: '17 a 22 anos', ordem: 2, obs: 'Pegada pronada, sem impulso de pernas' },
  { sigla: 'EsPCEx', sexo: 'masculino', exercicio: 'Flexão de braço no solo', unidade: 'repetições', minimo: '21 repetições', faixa: '17 a 22 anos', ordem: 3, obs: null },
  { sigla: 'EsPCEx', sexo: 'masculino', exercicio: 'Abdominal supra', unidade: 'repetições', minimo: '30 em 1 min', faixa: '17 a 22 anos', ordem: 4, obs: null },
  { sigla: 'EsPCEx', sexo: 'feminino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '2.120 m', faixa: '17 a 22 anos', ordem: 1, obs: null },
  { sigla: 'EsPCEx', sexo: 'feminino', exercicio: 'Barra fixa estática (isometria)', unidade: 'segundos', minimo: '10 segundos', faixa: '17 a 22 anos', ordem: 2, obs: 'Sustentação isométrica' },
  { sigla: 'EsPCEx', sexo: 'feminino', exercicio: 'Flexão de braço no solo', unidade: 'repetições', minimo: '12 repetições', faixa: '17 a 22 anos', ordem: 3, obs: null },
  { sigla: 'EsPCEx', sexo: 'feminino', exercicio: 'Abdominal supra', unidade: 'repetições', minimo: '27 em 1 min', faixa: '17 a 22 anos', ordem: 4, obs: null },

  // ─── EFOMM (TSF — Edital 2025) ────────────────────────────
  { sigla: 'EFOMM', sexo: 'masculino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '2.300 m', faixa: '18 a 25 anos', ordem: 1, obs: null },
  { sigla: 'EFOMM', sexo: 'masculino', exercicio: 'Natação 50 m (nado livre)', unidade: 'minutos', minimo: '1 min 30 s', faixa: '18 a 25 anos', ordem: 2, obs: 'Eliminatório' },
  { sigla: 'EFOMM', sexo: 'feminino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '1.900 m', faixa: '18 a 25 anos', ordem: 1, obs: null },
  { sigla: 'EFOMM', sexo: 'feminino', exercicio: 'Natação 50 m (nado livre)', unidade: 'minutos', minimo: '1 min 45 s', faixa: '18 a 25 anos', ordem: 2, obs: 'Eliminatório' },

  // ─── IME (Exame de Aptidão Física — Edital 2025) ──────────
  { sigla: 'IME', sexo: 'masculino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '2.200 m', faixa: '16 a 22 anos', ordem: 1, obs: null },
  { sigla: 'IME', sexo: 'masculino', exercicio: 'Flexão de braço no solo', unidade: 'repetições', minimo: '19 repetições', faixa: '16 a 22 anos', ordem: 2, obs: null },
  { sigla: 'IME', sexo: 'masculino', exercicio: 'Abdominal supra', unidade: 'repetições', minimo: '30 em 1 min', faixa: '16 a 22 anos', ordem: 3, obs: null },
  { sigla: 'IME', sexo: 'feminino', exercicio: 'Corrida de 12 minutos', unidade: 'metros', minimo: '1.800 m', faixa: '16 a 22 anos', ordem: 1, obs: null },
  { sigla: 'IME', sexo: 'feminino', exercicio: 'Flexão de braço no solo', unidade: 'repetições', minimo: '10 repetições', faixa: '16 a 22 anos', ordem: 2, obs: null },
  { sigla: 'IME', sexo: 'feminino', exercicio: 'Abdominal supra', unidade: 'repetições', minimo: '27 em 1 min', faixa: '16 a 22 anos', ordem: 3, obs: null },
];

async function run() {
  console.log('=== Auditoria e Correção dos TAFs ===\n');

  // 1. Buscar IDs dos concursos
  const { data: concursos } = await sb.from('concursos').select('id, sigla');
  if (!concursos) { console.error('Não consegui ler concursos'); return; }
  const siglaToId = Object.fromEntries(concursos.map(c => [c.sigla, c.id]));

  // 2. Deletar TODOS os TAFs existentes dos concursos cobertos
  const siglasCobertas = [...new Set(TAF_OFICIAIS.map(t => t.sigla))];
  for (const sigla of siglasCobertas) {
    const cId = siglaToId[sigla];
    if (!cId) { console.warn(`Concurso ${sigla} não encontrado no banco!`); continue; }
    
    const { error } = await sb.from('taf_provas').delete().eq('concurso_id', cId);
    if (error) {
      console.error(`Erro ao limpar TAF de ${sigla}:`, error.message);
    } else {
      console.log(`✓ Limpou TAFs antigos de ${sigla}`);
    }
  }

  // 3. Inserir os TAFs oficiais corrigidos
  const registros = TAF_OFICIAIS.map(t => ({
    concurso_id: siglaToId[t.sigla],
    sexo: t.sexo,
    exercicio: t.exercicio,
    unidade: t.unidade,
    minimo_aprovacao: t.minimo,
    faixa_etaria: t.faixa,
    ordem: t.ordem,
    ano_edital: 2025,
    observacao: t.obs,
  })).filter(r => r.concurso_id);

  const { error: insertErr } = await sb.from('taf_provas').insert(registros);
  if (insertErr) {
    console.error('Erro ao inserir TAFs corrigidos:', insertErr.message);
    return;
  }

  console.log(`\n✅ ${registros.length} registros de TAF inseridos com sucesso!\n`);

  // 4. Verificar resultado
  const { data: verificacao } = await sb.from('taf_provas')
    .select('concurso_id, sexo, exercicio, minimo_aprovacao')
    .order('concurso_id').order('sexo').order('ordem');

  const idToSigla = Object.fromEntries(concursos.map(c => [c.id, c.sigla]));
  console.log('─── Resultado Final ───');
  (verificacao || []).forEach(t => {
    console.log(`[${idToSigla[t.concurso_id]}] ${t.sexo.toUpperCase()} - ${t.exercicio}: ${t.minimo_aprovacao}`);
  });
}

run();
