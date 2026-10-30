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
export const CURRENT_ADMIN_VERSION = '2.3.0';

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
    versao: '2.3.0',
    dataLancamento: '2026-10-29T21:10:00-03:00',
    titulo: 'Arsenal Acadêmico com KaTeX, Gestor de Banners, Telemetria Visual & Auditoria Avançada',
    resumo:
      'Grande salto de capacidades do Command Center: cadastro manual de questões com Live Preview KaTeX e ação de duplicação, editor de teoria integrado diretamente nas lacunas pedagógicas, gerenciador ativo de banners e capas com suporte a imagens, GIFs e vídeos, mural de avisos com segmentação por concurso e botão de ação (CTA), métricas visuais com Recharts na Visão Geral, exportação de soldados em CSV, ajuste manual de streak/XP no dossiê, conversão de feedbacks em tickets de suporte e inspecionador de payload JSON na auditoria.',
    alteracoes: [
      {
        modulo: 'Banco de Questões',
        descricao:
          'Criação do modal "Cadastrar Nova Questão Manual" com formulário completo, seletores encadeados (Concurso > Matéria > Assunto), Live Preview KaTeX e ação "Duplicar" para rápida criação de questões inéditas.',
      },
      {
        modulo: 'Lacunas de Teoria',
        descricao:
          'Implementação do Editor de Teoria Integrado com Markdown, fórmulas matemáticas KaTeX, sinopse executiva e modelo tático pronto para publicação instantânea na plataforma.',
      },
      {
        modulo: 'Banners & Capas',
        descricao:
          'Módulo de Banners transformado em gerenciador ativo: cards com preview ao vivo, presets oficiais de concursos e atualização imediata no banco de dados.',
      },
      {
        modulo: 'Mural de Avisos',
        descricao:
          'Adição de segmentação por concurso (alcance global ou restrito ao concurso foco do aluno), anexo de botão CTA com link direto e pré-visualização ao vivo na composição.',
      },
      {
        modulo: 'Telemetria & Gráficos',
        descricao:
          'Gráfico de linha/área com novos soldados nos últimos 7 dias (Recharts), barras de distribuição percentual por concurso e termômetro de retenção com alunos em risco de abandono.',
      },
      {
        modulo: 'Contas & Soldados',
        descricao:
          'Exportação da base de soldados em arquivo CSV/Excel e inclusão de ajuste manual de ofensiva (streak), XP e reset de avatar diretamente pelo Dossiê do Soldado.',
      },
      {
        modulo: 'Feedback dos Alunos',
        descricao:
          'Adição de termômetro de CSAT, filtros por estrelas (críticas, neutras, elogios) e ação de conversão de feedback em ticket de suporte em 1 clique.',
      },
      {
        modulo: 'Auditoria & Logs',
        descricao:
          'Filtros por categoria de ação, busca textual rápida e modal inspecionador de payload JSON para rastrear detalhes brutos de todas as operações administrativas.',
      },
    ],
  },
  {
    versao: '2.2.0',
    dataLancamento: '2026-10-29T20:30:00-03:00',
    titulo: 'Live Chat de Suporte de Elite & Moderação Tática de Mensagens',
    resumo:
      'Nova interface tática do Chat de Atendimento ao Aluno: decriptografia ponta a ponta na visualização do administrador, balões conversacionais de alto contraste (aluno e admin com gradiente dourado e recibo de leitura), respostas rápidas em 1 clique (canned responses), atalho de envio rápido (Ctrl+Enter), marcação automática de resolvido e painel avançado de moderação de diálogos com atalho para o Dossiê Tático dos envolvidos.',
    alteracoes: [
      {
        modulo: 'Suporte & Tickets',
        descricao:
          'Decriptografia em tempo real no GET /api/tickets/[id], corrigindo a exibição de texto cifrado no painel administrativo.',
      },
      {
        modulo: 'Chat de Atendimento',
        descricao:
          'Interface moderna de chat com balões distintos, carimbo de data/hora, confirmação visual de entrega e auto-scroll para a mensagem mais recente.',
      },
      {
        modulo: 'Respostas Rápidas (Canned)',
        descricao:
          'Barra de respostas rápidas com chips para agilizar o suporte (Resolvido, Em Análise, Pedir Print, Sugestão Anotada, Dúvida Esclarecida).',
      },
      {
        modulo: 'Moderação de Diálogos',
        descricao:
          'Auditoria de conversas entre estudantes com identificação visual dos interlocutores, sinalização luminosa de termos impróprios e acesso ao Dossiê Tático dos envolvidos.',
      },
    ],
  },
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
