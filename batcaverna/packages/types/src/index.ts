// ============================================================
// @batcaverna/types — Tipos TypeScript compartilhados
// Modelos de dados, contratos de API, enums
// ============================================================

// ─── Enums ───────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export type Forca = 'aeronautica' | 'marinha' | 'exercito' | 'enem';

export type NivelEnsino = 'fundamental' | 'medio' | 'avancado';

export type NivelImpacto = 'alto' | 'util' | 'avancado';

export type Dificuldade = 'facil' | 'medio' | 'dificil';

export type ProgressoStatus = 'nao_iniciado' | 'em_andamento' | 'concluido';

export type DispositivoOrigem = 'web' | 'app' | 'pwa';

export type RankingTipo = 'tempo_estudo' | 'questoes_respondidas';

export type RankingPeriodo = 'semanal' | 'mensal' | 'geral';

export type TicketMotivo = 'bugs' | 'ideia' | 'outros';

export type TicketStatus = 'aberto' | 'respondido' | 'finalizado';

export type TicketMensagemRole = 'usuario' | 'admin';

export type BannerTipo = 'imagem' | 'gif' | 'video';

export type FavoritoTipo = 'bizu' | 'questao';

export type NotificacaoTipo =
  | 'xp_ganho'
  | 'subiu_nivel'
  | 'mensagem_motivacional'
  | 'atualizacao_plataforma'
  | 'resposta_ticket'
  | 'streak'
  | 'badge_conquistado'
  | 'ranking'
  | 'nova_mensagem_amigo'
  | 'solicitacao_amizade';

export type AmizadeStatus = 'pendente' | 'aceita' | 'recusada' | 'bloqueada';

export type MensagemChatTipo = 'texto' | 'audio' | 'imagem';

export type QuestaoImportadaStatus = 'aceita' | 'ignorada_duplicada' | 'erro_validacao';

// ─── Entidades Principais ────────────────────────────────────

export interface User {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  senha_hash?: string; // nunca enviado ao client
  email_verified: boolean;
  avatar_url: string | null;
  banner_url: string | null;
  banner_tipo: BannerTipo | null;
  bio: string | null;
  data_nascimento: string | null;
  criado_em: string;
  role: UserRole;
  xp_total: number;
  nivel_atual: number;
  maior_combo_pessoal: number;
  streak_dias: number;
  ultimo_dia_estudado: string | null;
}

/** Dados públicos retornados no mini perfil */
export interface UserMiniPerfil {
  id: string;
  apelido: string;
  avatar_url: string | null;
  banner_url: string | null;
  banner_tipo: BannerTipo | null;
  bio: string | null;
  nivel_atual: number;
  titulo_nivel: string;
  xp_total: number;
  maior_combo_pessoal: number;
  concursos_favoritos: ConcursoFavoritoDisplay[];
  categoria_escrita: string | null;
}

export interface ConcursoFavoritoDisplay {
  concurso_id: string;
  sigla: string;
  brasao_url: string | null;
  ordem: number;
}

export interface UserConcursoFavorito {
  user_id: string;
  concurso_id: string;
  ordem: number;
}

export interface UserCategoriaEscrita {
  user_id: string;
  texto: string;
}

export interface NivelGamificacao {
  nivel: number;
  titulo: string;
  xp_minimo_necessario: number;
  icone_url: string | null;
}

export interface EmailVerificationToken {
  id: string;
  user_id: string;
  token: string;
  expira_em: string;
  usado: boolean;
}

// ─── Conteúdo Educacional ────────────────────────────────────

export interface Concurso {
  id: string;
  nome: string;
  sigla: string;
  descricao: string;
  nivel_ensino: NivelEnsino;
  forca: Forca;
  icone_url: string | null;
  brasao_url: string | null;
  imagem_fundo_url: string | null;
  frase_curta_card: string;
}

export interface Materia {
  id: string;
  nome: string;
  descricao: string;
  icone_emoji: string;
}

export interface ConcursoMateria {
  concurso_id: string;
  materia_id: string;
  peso_na_prova: number | null;
}

export interface Assunto {
  id: string;
  materia_id: string;
  nome: string;
  ordem: number;
  resumo_teorico: string | null;
}

export interface ConcursoAssunto {
  concurso_id: string;
  assunto_id: string;
  incluido: boolean;
  peso_relativo: number | null;
}

export interface Bizu {
  id: string;
  assunto_id: string;
  titulo: string;
  conteudo: string;
  nivel_impacto: NivelImpacto;
  exemplo_pratico: string | null;
}

export interface Questao {
  id: string;
  concurso_id: string;
  materia_id: string;
  assunto_id: string;
  enunciado: string;
  alternativas: AlternativaQuestao[];
  resposta_correta: string; // letra da alternativa correta
  explicacao: string;
  ano: number | null;
  banca: string | null;
  dificuldade: Dificuldade;
  bizu_relacionado_id: string | null;
}

export interface AlternativaQuestao {
  letra: string;
  texto: string;
}

// ─── Progresso e Respostas ───────────────────────────────────

export interface UserProgresso {
  user_id: string;
  assunto_id: string;
  status: ProgressoStatus;
  percentual: number;
}

export interface UserQuestaoResposta {
  id: string;
  user_id: string;
  questao_id: string;
  resposta_dada: string;
  correta: boolean;
  tempo_gasto_segundos: number;
  respondido_em: string;
  combo_no_momento: number;
}

export interface Simulado {
  id: string;
  user_id: string;
  concurso_id: string;
  questoes_ids: string[];
  iniciado_em: string;
  finalizado_em: string | null;
  pontuacao: number | null;
  total_questoes: number;
  acertos: number;
}

export interface Favorito {
  user_id: string;
  tipo: FavoritoTipo;
  item_id: string;
}

// ─── Gamificação ─────────────────────────────────────────────

export interface Badge {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  criterio: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  conquistado_em: string;
}

// ─── Sessões de Estudo ───────────────────────────────────────

export interface StudySession {
  id: string;
  user_id: string;
  dispositivo_origem: DispositivoOrigem;
  iniciada_em: string;
  ultima_atividade_em: string;
  finalizada_em: string | null;
  duracao_segundos: number;
  blocos_continuos_completados: number;
  multiplicador_continuidade_atual: number;
  xp_ganho_na_sessao: number;
}

// ─── Ranking ─────────────────────────────────────────────────

export interface RankingCache {
  user_id: string;
  tipo: RankingTipo;
  periodo: RankingPeriodo;
  concurso_id: string | null;
  materia_id: string | null;
  tempo_total_segundos: number;
  total_questoes_respondidas: number;
  percentual_acerto: number;
  posicao: number;
  atualizado_em: string;
}

export interface RankingEntry {
  posicao: number;
  user_id: string;
  apelido: string;
  avatar_url: string | null;
  nivel_atual: number;
  titulo_nivel: string;
  valor: number; // tempo em segundos ou total de questões
  percentual_acerto?: number;
}

export interface UserPrivacySettings {
  user_id: string;
  ocultar_do_ranking: boolean;
}

// ─── Tickets de Suporte ──────────────────────────────────────

export interface Ticket {
  id: string;
  user_id: string;
  motivo: TicketMotivo;
  titulo: string;
  status: TicketStatus;
  criado_em: string;
  atualizado_em: string;
  finalizado_em: string | null;
  finalizado_por_admin_id: string | null;
}

export interface TicketMensagem {
  id: string;
  ticket_id: string;
  autor_id: string;
  autor_role: TicketMensagemRole;
  conteudo: string;
  enviado_em: string;
}

// ─── Notificações ────────────────────────────────────────────

export interface Notificacao {
  id: string;
  user_id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  dados_extra: Record<string, unknown> | null;
  lida: boolean;
  criada_em: string;
}

// ─── Armazém de Questões ─────────────────────────────────────

export interface QuestaoImportada {
  id: string;
  hash_conteudo: string;
  questao_id: string | null;
  arquivo_origem: string;
  status: QuestaoImportadaStatus;
  motivo_ignorada: string | null;
  importado_em: string;
}

export interface ImportacaoLog {
  id: string;
  executado_em: string;
  arquivos_encontrados: number;
  questoes_aceitas: number;
  questoes_ignoradas_duplicadas: number;
  questoes_com_erro: number;
  duracao_segundos: number;
}

// ─── App Info ────────────────────────────────────────────────

export interface AppInfo {
  id: string;
  versao_atual: string;
  atualizado_em: string;
}

// ─── Auditoria ───────────────────────────────────────────────

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  acao: string;
  entidade_afetada: string;
  entidade_id: string;
  detalhes: Record<string, unknown> | null;
  criado_em: string;
}

// ─── Amizades e Chat ─────────────────────────────────────────

export interface Amizade {
  id: string;
  user_id_solicitante: string;
  user_id_destinatario: string;
  status: AmizadeStatus;
  criado_em: string;
  respondido_em: string | null;
}

export interface Conversa {
  id: string;
  amizade_id: string;
  user_id_a: string;
  user_id_b: string;
  criada_em: string;
  ultima_mensagem_em: string | null;
}

export interface MensagemChat {
  id: string;
  conversa_id: string;
  autor_id: string;
  tipo: MensagemChatTipo;
  conteudo_texto: string | null;
  midia_url: string | null;
  duracao_segundos: number | null;
  enviado_em: string;
  lida: boolean;
  sinalizada_para_revisao: boolean;
}

// ─── Contratos de API (Request/Response) ─────────────────────

export interface RegisterRequest {
  nome: string;
  apelido: string;
  email: string;
  senha: string;
  data_nascimento?: string;
  concursos_interesse: string[];
  aceite_termos: boolean;
  aceite_menor_idade?: boolean;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: Omit<User, 'senha_hash'>;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface HeartbeatResponse {
  duracao_segundos: number;
  xp_ganho: number;
  multiplicador: number;
  blocos_completados: number;
}

export interface TempoTotalEstudoResponse {
  tempo_total_segundos: number;
  formatado: string;
  sessao_ativa: boolean;
}
