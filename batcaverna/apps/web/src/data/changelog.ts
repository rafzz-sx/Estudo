import type { ReleaseItem } from '@batcaverna/types';

/**
 * VERSÃO ATUAL DA PLATAFORMA BATCAVERNA
 * Esta é a ÚNICA constante de referência da versão do aplicativo web.
 */
export const CURRENT_APP_VERSION = '3.3.2';

/**
 * HISTÓRICO CANÔNICO DE ATUALIZAÇÕES DA BATCAVERNA
 * Organizado estritamente em ordem decrescente (da versão mais recente para a mais antiga).
 *
 * Taxonomia de Classificação:
 * - 'maior': Muda o 1º número da esquerda (vX.0.0) -> ⭐ Maior Atualização (Salto de geração)
 * - 'grande': Muda o número do meio (v3.X.0) -> 🚀 Grande Atualização (Grandes módulos e arsenais)
 * - 'atualizacao': Muda o 3º número da direita (v3.5.X) -> ⚡ Atualização (Novos recursos notáveis)
 * - 'pequena': Muda o 3º número da direita (v3.5.X) -> 🛠️ Pequena Atualização (Ajustes, design, correções)
 */
export const CHANGELOG_HISTORY: ReleaseItem[] = [
  {
    versao: '3.3.2',
    dataLancamento: '2026-10-09T17:40:00-03:00',
    titulo: 'Blindagem de Acesso & Recuperação Tática de Credenciais',
    resumo:
      'Novo fluxo seguro de recuperação de conta para os alunos, entrega instantânea de tokens e códigos de autorização via e-mail oficial com layout temático da BatCaverna e melhorias na visibilidade de senhas.',
    destaque: true,
    impacto: 'patch',
    classificacao: 'atualizacao',
    alteracoes: [
      {
        id: 'recuperacao-senha-alunos',
        tipo: 'novo',
        titulo: 'Recuperação Tática de Conta e Senha',
        descricao:
          'Os alunos agora podem redefinir suas credenciais de forma rápida e segura: basta informar o e-mail cadastrado para receber um link de uso único e um código numérico de 6 dígitos de alta segurança.',
        tag: 'Segurança',
      },
      {
        id: 'emails-oficiais-batcaverna',
        tipo: 'melhoria',
        titulo: 'Notificações e E-mails Militares Tematizados',
        descricao:
          'E-mails transacionais com o brasão oficial da BatCaverna, modo escuro tático, botões de ação com destaque e avisos automáticos de segurança sempre que uma credencial for atualizada.',
        tag: 'Comunicação',
      },
      {
        id: 'alternancia-olho-senha',
        tipo: 'melhoria',
        titulo: 'Alternância de Visibilidade de Senha',
        descricao:
          'Botão integrado de exibir/ocultar senha com ícone tático em todas as telas de autenticação e redefinição para total precisão na digitação.',
        tag: 'Interface / UX',
      },
    ],
  },
  {
    versao: '3.3.1',
    dataLancamento: '2026-10-08T21:40:00-03:00',
    titulo: 'Sistema de Classificação Tática de Lançamentos',
    resumo:
      'Padronização de insígnias para cada porte de atualização: Maior Atualização (vX.0.0), Grande Atualização (v3.X.0), Atualização e Pequena Atualização (v3.5.X), com guia explicativo integrado.',
    destaque: false,
    impacto: 'patch',
    classificacao: 'pequena',
    alteracoes: [
      {
        id: 'taxonomia-lancamentos',
        tipo: 'novo',
        titulo: 'Selos de Classificação de Lançamento',
        descricao:
          'Cada versão agora conta com identificação clara de porte: Maior Atualização (exclusivo para mudanças de geração no 1º número), Grande Atualização (número central), Atualização e Pequena Atualização (último dígito).',
        tag: 'Design / UX',
      },
      {
        id: 'guia-taxonomia-versoes',
        tipo: 'melhoria',
        titulo: 'Guia Interativo de Versões',
        descricao:
          'Painel informativo demonstrando a hierarquia das versões (v3.5.4) para os alunos acompanharem a evolução do sistema.',
        tag: 'Plataforma',
      },
    ],
  },
  {
    versao: '3.3.0',
    dataLancamento: '2026-10-08T21:00:00-03:00',
    titulo: 'Central de Novidades & Sistema Inteligente de Versões',
    resumo:
      'Lançamento da página oficial de Novidades, detecção automática de melhorias perdidas para soldados que retornam à base e unificação global do controle de versões.',
    destaque: true,
    impacto: 'minor',
    classificacao: 'grande',
    alteracoes: [
      {
        id: 'novidades-page',
        tipo: 'novo',
        titulo: 'Página Dedicada /novidades',
        descricao:
          'Linha do tempo tática completa com filtros por tipo (Novos recursos, Melhorias, Correções), busca em tempo real e visualização de datas relativas.',
        tag: 'Plataforma',
      },
      {
        id: 'missed-updates-modal',
        tipo: 'novo',
        titulo: 'Detector de Atualizações Perdidas',
        descricao:
          'Se você esteve fora da BatCaverna por dias ou pulou várias versões, a plataforma detecta automaticamente e apresenta um resumo tático do que você perdeu sem interromper seus simulados.',
        tag: 'UX / Retenção',
      },
      {
        id: 'unified-version-engine',
        tipo: 'melhoria',
        titulo: 'Sincronização Unificada de Versão',
        descricao:
          'Eliminação de discrepâncias de versão entre o portal Web, o APK Android e as tabelas do banco de dados, com validação semântica semver.',
        tag: 'Core / Infra',
      },
      {
        id: 'nav-indicator-badge',
        tipo: 'melhoria',
        titulo: 'Selo Visual Indicador no Menu',
        descricao:
          'Aviso sutil e elegante na barra de navegação alertando quando há um novo lote de melhorias disponíveis.',
        tag: 'Navegação',
      },
    ],
  },
  {
    versao: '3.2.4',
    dataLancamento: '2026-10-08T18:00:00-03:00',
    titulo: 'Diagramas Geométricos Vetoriais & Estabilidade Matemática',
    resumo:
      'Renderização de figuras geométricas fiéis para EPCAR e Colégio Naval, suporte completo a KaTeX nas alternativas e blindagem contra erros de navegação rápida.',
    destaque: false,
    impacto: 'patch',
    classificacao: 'atualizacao',
    alteracoes: [
      {
        id: 'diagramas-geometricos',
        tipo: 'novo',
        titulo: 'Diagramas Geométricos SVG Nativos',
        descricao:
          'Geração e exibição de diagramas geométricos fiéis em SVG para questões que exigem análise visual (como o paralelogramo da EPCAR e figuras de geometria plana).',
        tag: 'Questões',
      },
      {
        id: 'katex-alternativas',
        tipo: 'melhoria',
        titulo: 'Formatação Matemática em Alternativas',
        descricao:
          'Todas as opções de resposta (A, B, C, D, E) agora contam com parser matemático robusto, exibindo frações, raízes e vetores com fidelidade tipográfica.',
        tag: 'Matemática',
      },
      {
        id: 'fix-mathtext-red-text',
        tipo: 'correcao',
        titulo: 'Correção de Erro KaTeX e Texto Vermelho',
        descricao:
          'Eliminado o bug em que enunciados com cifrão monetário ou notação mista quebravam o parser e exibiam textos vermelhos ou rótulos indefinidos.',
        tag: 'Correção',
      },
      {
        id: 'fix-fast-nav-reload',
        tipo: 'correcao',
        titulo: 'Recarregamento Suave na Troca Rápida de Abas',
        descricao:
          'Ajuste nos Error Boundaries e no debounce de navegação para impedir congelamento de tela ao alternar rapidamente entre abas da plataforma.',
        tag: 'Estabilidade',
      },
    ],
  },
  {
    versao: '3.2.3',
    dataLancamento: '2026-10-07T19:30:00-03:00',
    titulo: 'Otimização de Infraestrutura Edge & Roteamento São Paulo',
    resumo:
      'Migração das rotas de borda para o datacenter de São Paulo (gru1), reduzindo a latência para estudantes de todo o Brasil.',
    destaque: false,
    impacto: 'patch',
    classificacao: 'pequena',
    alteracoes: [
      {
        id: 'infra-edge-gru1',
        tipo: 'melhoria',
        titulo: 'Latência Reduzida (Datacenter GRU1)',
        descricao:
          'Configuração de servidor edge dedicada no Brasil, diminuindo o tempo de resposta em requisições de questões e autenticação em até 40%.',
        tag: 'Performance',
      },
      {
        id: 'cache-inteligente',
        tipo: 'melhoria',
        titulo: 'Cache Tático Stale-While-Revalidate',
        descricao:
          'Estatísticas e listagens estáticas com entrega instantânea e revalidação assíncrona em background.',
        tag: 'Performance',
      },
      {
        id: 'guardiao-health',
        tipo: 'novo',
        titulo: 'Guardião de Integridade & Rota Health',
        descricao:
          'Monitoramento ativo de saúde dos serviços essenciais com verificação contínua do banco Supabase.',
        tag: 'Segurança',
      },
    ],
  },
  {
    versao: '3.2.2',
    dataLancamento: '2026-10-06T15:00:00-03:00',
    titulo: 'Otimização de Banco de Dados & Índices de Busca',
    resumo:
      'Criação de índices compostos no PostgreSQL para filtros instantâneos no banco de questões e no caderno de erros.',
    destaque: false,
    impacto: 'patch',
    classificacao: 'pequena',
    alteracoes: [
      {
        id: 'sql-indices-banco',
        tipo: 'melhoria',
        titulo: 'Índices Estratégicos no Supabase',
        descricao:
          'Consultas por concurso, disciplina, assunto e ano calibradas para carregar sem engasgos mesmo com milhares de questões.',
        tag: 'Banco de Dados',
      },
      {
        id: 'fix-hash-conteudo',
        tipo: 'correcao',
        titulo: 'Desduplicação Estrita de Questões',
        descricao:
          'Tratamento preventivo contra duplicidade em migrações e sincronizações manuais do banco.',
        tag: 'Correção',
      },
    ],
  },
  {
    versao: '3.2.1',
    dataLancamento: '2026-10-05T14:00:00-03:00',
    titulo: 'Novos Ícones Nativos do Aplicativo & Favicon Web',
    resumo:
      'Padronização de alta fidelidade visual do ícone do morcego dourado no app Android, telas de início e abas dos navegadores.',
    destaque: false,
    impacto: 'patch',
    classificacao: 'pequena',
    alteracoes: [
      {
        id: 'mobile-icons-hd',
        tipo: 'melhoria',
        titulo: 'Ícones Nativos Android em Alta Definição',
        descricao:
          'Atualização de todos os mipmaps (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) com fundo escuro militar e contraste ouro 24k.',
        tag: 'Mobile',
      },
      {
        id: 'web-favicon-refresh',
        tipo: 'melhoria',
        titulo: 'Favicon e Metadados do Navegador',
        descricao:
          'Aba do navegador estilizada com o emblema oficial da BatCaverna.',
        tag: 'Design',
      },
    ],
  },
  {
    versao: '3.2.0',
    dataLancamento: '2026-10-04T22:00:00-03:00',
    titulo: 'Criptografia em Repouso & Moderação Blindada',
    resumo:
      'Implementação de segurança máxima nas conversas dos esquadrões com criptografia AES-256-GCM e inspeção contra abusos.',
    destaque: true,
    impacto: 'minor',
    classificacao: 'grande',
    alteracoes: [
      {
        id: 'chat-encryption',
        tipo: 'novo',
        titulo: 'Criptografia AES-256-GCM no Chat',
        descricao:
          'Todas as mensagens trocadas entre alunos contam com criptografia reforçada no banco de dados, protegendo a privacidade dos esquadrões.',
        tag: 'Segurança',
      },
      {
        id: 'moderacao-cifrada',
        tipo: 'melhoria',
        titulo: 'Fila de Moderação Segura',
        descricao:
          'Capacidade do painel administrativo de analisar mensagens denunciadas mesmo sob cifras criptográficas.',
        tag: 'Admin',
      },
      {
        id: 'rate-limiting',
        tipo: 'melhoria',
        titulo: 'Rate Limiting Distribuído',
        descricao:
          'Proteção contra tentativas repetitivas de força bruta em autenticação e emissão de mensagens.',
        tag: 'Segurança',
      },
    ],
  },
  {
    versao: '3.1.5',
    dataLancamento: '2026-10-02T16:30:00-03:00',
    titulo: 'Visualização de Senhas & Refinamento de Autenticação',
    resumo:
      'Inclusão obrigatória de botão de alternância de visibilidade de senha em todos os formulários da plataforma.',
    destaque: false,
    impacto: 'patch',
    classificacao: 'atualizacao',
    alteracoes: [
      {
        id: 'auth-eye-toggle',
        tipo: 'novo',
        titulo: 'Alternância de Olho para Ver Senha',
        descricao:
          'Botão tático para conferir a senha digitada nas telas de login, cadastro e redefinição de credenciais.',
        tag: 'Acessibilidade',
      },
    ],
  },
  {
    versao: '3.1.4',
    dataLancamento: '2026-10-01T17:00:00-03:00',
    titulo: 'Suporte Nativo a Fórmulas Matemáticas LaTeX com KaTeX',
    resumo:
      'Transformação dos enunciados e bizus para leitura de fórmulas matemáticas em alta fidelidade tipográfica.',
    destaque: false,
    impacto: 'patch',
    classificacao: 'atualizacao',
    alteracoes: [
      {
        id: 'katex-engine',
        tipo: 'novo',
        titulo: 'Motor KaTeX Integrado',
        descricao:
          'Renderização matemática veloz para todas as questões de exatas das Forças Armadas e ENEM.',
        tag: 'Matemática',
      },
      {
        id: 'admin-bank-questions',
        tipo: 'melhoria',
        titulo: 'Gestão Tática do Banco de Questões',
        descricao:
          'Novas ferramentas administrativas para catalogação, higienização de enunciados e remoção de itens anulados.',
        tag: 'Admin',
      },
    ],
  },
  {
    versao: '3.1.2',
    dataLancamento: '2026-09-28T19:00:00-03:00',
    titulo: 'Barra Inferior Mobile com Rolagem Livre Touch',
    resumo:
      'Navegação mobile reconstruída com drag-to-scroll suave e acesso imediato a todas as ferramentas.',
    destaque: false,
    impacto: 'patch',
    classificacao: 'pequena',
    alteracoes: [
      {
        id: 'bottom-bar-drag',
        tipo: 'melhoria',
        titulo: 'Bottom Bar Rolável com Arraste Livre',
        descricao:
          'Acesso aos 15 atalhos principais da plataforma pelo rodapé mobile sem engasgos ou cliques involuntários.',
        tag: 'Mobile',
      },
      {
        id: 'chat-no-flicker',
        tipo: 'correcao',
        titulo: 'Fim dos Tremores e Flickering no Chat',
        descricao:
          'Estabilização da janela de mensagens durante o envio de novas mensagens em tempo real.',
        tag: 'Chat',
      },
    ],
  },
  {
    versao: '3.1.0',
    dataLancamento: '2026-09-25T20:00:00-03:00',
    titulo: 'Otimizações Globais & Player de Concentração',
    resumo:
      'Aceleração no carregamento das faixas musicais, suporte a redação multi-banca e cronograma calibrado.',
    destaque: false,
    impacto: 'minor',
    classificacao: 'grande',
    alteracoes: [
      {
        id: 'music-player-fast',
        tipo: 'melhoria',
        titulo: 'Áudio Rápido no Player de Foco',
        descricao:
          'Pré-carregamento eficiente de streams de áudio lofi para estudo sem travamentos.',
        tag: 'Música',
      },
      {
        id: 'redacao-multi-banca',
        tipo: 'melhoria',
        titulo: 'Critérios Especializados de Redação',
        descricao:
          'Correção com critérios calibrados para bancas militares e matriz de competências do ENEM.',
        tag: 'Redação',
      },
    ],
  },
  {
    versao: '3.0.0',
    dataLancamento: '2026-09-20T10:00:00-03:00',
    titulo: 'BatCaverna v3.0 — Era dos Esquadrões & Combate Conjunto',
    resumo:
      'Salto de geração da plataforma com Sincronia de Esquadrão, Radar de Soldados ao Vivo e novas conquistas.',
    destaque: true,
    impacto: 'major',
    classificacao: 'maior',
    alteracoes: [
      {
        id: 'squad-sync-xp',
        tipo: 'novo',
        titulo: 'Sincronia de Esquadrão (+10% XP)',
        descricao:
          'Bônus multiplicador de experiência em sessões simultâneas de estudo com amigos adicionados.',
        tag: 'Gamificação',
      },
      {
        id: 'radar-soldados-live',
        tipo: 'novo',
        titulo: 'Radar de Soldados ao Vivo na Dashboard',
        descricao:
          'Visualização tática em tempo real dos companheiros de farda que estão em combate na plataforma.',
        tag: 'Dashboard',
      },
      {
        id: 'insignia-fundador-6',
        tipo: 'novo',
        titulo: 'Insígnia de Fundador Nível 6',
        descricao:
          'Reconhecimento visual com borda dourada pulsante para os pioneiros da plataforma.',
        tag: 'Conquistas',
      },
      {
        id: 'mobile-mic-audio',
        tipo: 'melhoria',
        titulo: 'Permissões Nativas de Áudio no APK',
        descricao:
          'Compatibilidade com comandos de voz e reprodução contínua em segundo plano no Android.',
        tag: 'Mobile',
      },
    ],
  },
];
