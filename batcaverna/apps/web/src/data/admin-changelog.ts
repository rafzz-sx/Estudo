/**
 * VERSÃO ATUAL DO PAINEL DE CONTROLE / ADMIN (BATCAVERNA COMMAND CENTER)
 *
 * REGRA DO PROJETO:
 * O Painel de Admin possui versionamento PRÓPRIO e ISOLADO da versão dos alunos.
 * Quando melhoramos algo exclusivo do painel de administração/moderação:
 * 1. Incrementamos APENAS o `CURRENT_ADMIN_VERSION` aqui.
 * 2. Registramos as novidades técnicas no `ADMIN_CHANGELOG_HISTORY`.
 * 3. NUNCA vazamos informações administrativas no `changelog.ts` público dos alunos.
 */
export const CURRENT_ADMIN_VERSION = '2.1.0';

export interface AdminAlteracao {
  modulo: string;
  descricao: string;
}

export interface AdminReleaseItem {
  versao: string;
  dataLancamento: string;
  titulo: string;
  resumo: string;
  alteracoes: AdminAlteracao[];
}

export const ADMIN_CHANGELOG_HISTORY: AdminReleaseItem[] = [
  {
    versao: '2.1.0',
    dataLancamento: '2026-10-19T18:25:00-03:00',
    titulo: 'Central de Suporte com Dossiê do Soldado & Ações Táticas',
    resumo:
      'Reestruturação completa da moderação de chamados: identificação real do aluno (avatar, e-mail, patente, streak), botão de acesso ao Dossiê completo, fluxo de status (Em Análise, Resolvido, Reabrir), busca textual, filtros e layout master-detail otimizado para mobile.',
    alteracoes: [
      {
        modulo: 'Suporte & Tickets',
        descricao:
          'Substituição do identificador genérico pelo Card do Soldado, com avatar, e-mail e botão direto para abrir o Dossiê completo do aluno.',
      },
      {
        modulo: 'Status de Chamados',
        descricao:
          'Implementação do endpoint PATCH /api/tickets/[id] e botões de ação tática rápida (Em Análise, Marcar Resolvido, Reabrir).',
      },
      {
        modulo: 'Filtros & Busca',
        descricao:
          'Filtro por status (Todos, Abertos, Resolvidos) e busca por nome, apelido ou assunto do ticket.',
      },
      {
        modulo: 'Mobile & Usabilidade',
        descricao:
          'Navegação master-detail responsiva para smartphones com botão de retorno à lista.',
      },
      {
        modulo: 'Segurança & Infra',
        descricao:
          'Remoção de chaves mestras do repositório, higienização de scripts legados e blindagem anti-pausa com Vercel Cron e GitHub Actions.',
      },
    ],
  },
  {
    versao: '2.0.0',
    dataLancamento: '2026-10-10T20:00:00-03:00',
    titulo: 'Lançamento do Centro de Comando Admin Unificado',
    resumo:
      'Unificação dos módulos de auditoria de questões, moderação de contas, avisos globais, contestação de gabaritos e saúde da infraestrutura.',
    alteracoes: [
      {
        modulo: 'Arquitetura',
        descricao: 'Centralização de 18 módulos administrativos em abas dinâmicas e menu launcher moderno.',
      },
    ],
  },
];
