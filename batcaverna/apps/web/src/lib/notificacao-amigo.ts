import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Notifica todos os amigos aceitos que o aluno começou a estudar hoje.
 * 
 * REGRAS DE OURO:
 * 1. Filtro Anti-Falso Disparo: Só dispara se a sessão já tiver durado pelo menos 2 minutos (120 segundos).
 * 2. Limite Diário: Só notifica na PRIMEIRA sessão do dia (fuso BRT UTC-3).
 * 3. Mensagens Dinâmicas: Inclui o concurso alvo do amigo (ex: EEAR, ESA) e adapta o texto pelo horário (Alvorada, Combate, Operação Noturna).
 */
export async function notificarAmigosEstudandoComFiltro(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  duracaoSegundos: number
): Promise<void> {
  // 1. Filtro Anti-Falso Disparo: exige no mínimo 2 minutos (120s) de estudo real
  if (duracaoSegundos < 120) {
    return;
  }

  // Início do dia em BRT (UTC-3)
  const agora = new Date();
  const hojeInicioBRT = new Date(agora);
  hojeInicioBRT.setHours(hojeInicioBRT.getHours() - 3);
  hojeInicioBRT.setHours(0, 0, 0, 0);
  hojeInicioBRT.setHours(hojeInicioBRT.getHours() + 3);
  const hojeInicioISO = hojeInicioBRT.toISOString();

  // 2. Verificar se já existe qualquer notificação enviada HOJE referente a este aluno
  const { data: notificacoesHoje } = await supabase
    .from('notificacoes')
    .select('id, dados_extra')
    .gte('criada_em', hojeInicioISO);

  const jaNotificouHoje = (notificacoesHoje || []).some(
    (n: any) => n.dados_extra && (n.dados_extra.amigo_id === userId || n.dados_extra.autor_id === userId)
  );

  if (jaNotificouHoje) {
    return; // Já enviou notificação hoje, não repete!
  }

  // 3. Verificar se é realmente a primeira sessão de estudo do dia
  const { count: sessoesAnterioresHoje } = await supabase
    .from('study_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('iniciada_em', hojeInicioISO)
    .neq('id', sessionId);

  if (sessoesAnterioresHoje && sessoesAnterioresHoje > 0) {
    return; // Já estudou hoje em outra sessão anterior!
  }

  // 4. Buscar dados do aluno: apelido e concurso alvo
  const { data: perfil } = await supabase
    .from('users')
    .select(`
      id, apelido,
      user_concurso_favoritos (concursos (sigla))
    `)
    .eq('id', userId)
    .maybeSingle();

  const apelido = perfil?.apelido || 'Um soldado amigo';
  const concursoSigla =
    (perfil as any)?.user_concurso_favoritos?.[0]?.concursos?.sigla || null;
  const concursoTexto = concursoSigla ? `rumo à ${concursoSigla}` : 'rumo à aprovação';

  // 5. Buscar amigos aceitos
  const { data: amizades } = await supabase
    .from('amizades')
    .select('user_id_solicitante, user_id_destinatario')
    .or(`user_id_solicitante.eq.${userId},user_id_destinatario.eq.${userId}`)
    .eq('status', 'aceita');

  if (!amizades || amizades.length === 0) return;

  const amigoIds = amizades.map((a) =>
    a.user_id_solicitante === userId ? a.user_id_destinatario : a.user_id_solicitante
  );

  // 6. Mensagens Dinâmicas com base no concurso e no horário local (BRT)
  const horaBRT = (agora.getUTCHours() - 3 + 24) % 24;
  let titulo = '⚔️ Soldado em Combate';
  let mensagem = `${apelido} entrou em combate ${concursoTexto}! Você vai ficar para trás ou vai ligar o cronômetro agora?`;

  if (horaBRT >= 19 || horaBRT < 5) {
    titulo = '🌙 Operação Noturna';
    mensagem = `${apelido} está na ativa nos estudos ${concursoTexto}! Junte-se à patrulha noturna e ative o Bônus de Esquadrão (+10% XP).`;
  } else if (horaBRT >= 5 && horaBRT < 12) {
    titulo = '☀️ Alvorada nos Estudos';
    mensagem = `${apelido} iniciou o combate matinal ${concursoTexto}! Ligue o cronômetro e ative o bônus de estudo juntos.`;
  }

  // 7. Preparar payload com dados estruturados para a ação de 1 toque
  const payloadNotificacoes = amigoIds.map((amigoId) => ({
    user_id: amigoId,
    tipo: 'amigo_estudando' as any,
    titulo,
    mensagem,
    dados_extra: {
      sub_tipo: 'amigo_estudando',
      amigo_id: userId,
      amigo_apelido: apelido,
      concurso: concursoSigla,
      hora_inicio: agora.toISOString(),
      acao_rapida: 'entrar_combate',
    },
    lida: false,
  }));

  // Inserção no Supabase (com fallback seguro para tipo sistema)
  const { error: insErr } = await supabase.from('notificacoes').insert(payloadNotificacoes);
  if (insErr) {
    const fallback = payloadNotificacoes.map((n) => ({ ...n, tipo: 'sistema' as any }));
    await supabase.from('notificacoes').insert(fallback);
  }
}
