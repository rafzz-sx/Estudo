/**
 * Especificações dos formatos reais de cada concurso atendido pela BatCaverna.
 *
 * Cada banca possui estrutura própria de prova (quantidade de questões objetivas,
 * duração oficial em minutos, divisão por áreas/dias, matérias e pesos).
 *
 * ⚠️ REGRA DO SIMULADO REAL:
 * A redação é DESCARTADA do simulado cronometrado para manter o foco 100%
 * nas questões objetivas sob o tempo real de prova correspondente.
 */

export interface DisciplinaBloco {
  nome: string;
  sinonimos?: string[];
  questoes: number;
}

export interface BlocoProva {
  area: string; // Ex: 'Linguagens, Códigos e suas Tecnologias'
  aplicaTRI?: boolean; // true para ENEM (calibração TRI independente nesta área)
  questoesTotal: number;
  disciplinas: DisciplinaBloco[];
}

export interface VariacaoProva {
  id: string;
  nome: string;
  questoes: number;
  minutos: number;
  descricao: string;
  diaProvaNumero?: number; // 1 ou 2
  materiasPermitidas?: string[]; // Nomes das matérias exclusivas deste dia/variação
  pesosFixos?: { nome: string; peso: number }[];
  blocos?: BlocoProva[];
}

export interface FormatoConcursoReal {
  sigla: string;
  nome: string;
  questoes: number;
  minutos: number;
  duracaoHorasTexto: string;
  descricao: string;
  detalhesEdital: string;
  temRedacaoNaProvaReal: boolean;
  materiasEsperadas: { nome: string; peso: number }[];
  blocos?: BlocoProva[];
  variacoes?: VariacaoProva[];
  variacaoAtiva?: VariacaoProva | null;
}

export const FORMATOS_OFICIAIS: Record<string, FormatoConcursoReal> = {
  EEAR: {
    sigla: 'EEAR',
    nome: 'Escola de Especialistas de Aeronáutica',
    questoes: 96,
    minutos: 260, // 4h20
    duracaoHorasTexto: '4h20min',
    descricao: '96 questões objetivas · 4h20min (24 Port, 24 Ing, 24 Mat, 24 Fís)',
    detalhesEdital:
      'Prova única com 96 questões divididas igualmente (25% cada) entre Língua Portuguesa, Língua Inglesa, Matemática e Física. Sem redação.',
    temRedacaoNaProvaReal: false,
    materiasEsperadas: [
      { nome: 'Português', peso: 24 },
      { nome: 'Inglês', peso: 24 },
      { nome: 'Matemática', peso: 24 },
      { nome: 'Física', peso: 24 },
    ],
    blocos: [
      {
        area: 'Língua Portuguesa',
        questoesTotal: 24,
        disciplinas: [{ nome: 'Português', sinonimos: ['Língua Portuguesa'], questoes: 24 }],
      },
      {
        area: 'Língua Inglesa',
        questoesTotal: 24,
        disciplinas: [{ nome: 'Inglês', sinonimos: ['Língua Inglesa'], questoes: 24 }],
      },
      {
        area: 'Matemática',
        questoesTotal: 24,
        disciplinas: [{ nome: 'Matemática', questoes: 24 }],
      },
      {
        area: 'Física',
        questoesTotal: 24,
        disciplinas: [{ nome: 'Física', questoes: 24 }],
      },
    ],
    variacoes: [
      {
        id: 'completa',
        nome: 'Prova Oficial Completa (96 questões)',
        questoes: 96,
        minutos: 260,
        descricao: '96 questões · 4h20min (24 Port, 24 Ing, 24 Mat, 24 Fís)',
        materiasPermitidas: ['Português', 'Inglês', 'Matemática', 'Física'],
        pesosFixos: [
          { nome: 'Português', peso: 24 },
          { nome: 'Inglês', peso: 24 },
          { nome: 'Matemática', peso: 24 },
          { nome: 'Física', peso: 24 },
        ],
        blocos: [
          {
            area: 'Língua Portuguesa',
            questoesTotal: 24,
            disciplinas: [{ nome: 'Português', sinonimos: ['Língua Portuguesa'], questoes: 24 }],
          },
          {
            area: 'Língua Inglesa',
            questoesTotal: 24,
            disciplinas: [{ nome: 'Inglês', sinonimos: ['Língua Inglesa'], questoes: 24 }],
          },
          {
            area: 'Matemática',
            questoesTotal: 24,
            disciplinas: [{ nome: 'Matemática', questoes: 24 }],
          },
          {
            area: 'Física',
            questoesTotal: 24,
            disciplinas: [{ nome: 'Física', questoes: 24 }],
          },
        ],
      },
      {
        id: 'reduzida',
        nome: 'Simulado Padrão (48 questões)',
        questoes: 48,
        minutos: 130, // 2h10min
        descricao: '48 questões · 2h10min (12 Port, 12 Ing, 12 Mat, 12 Fís)',
        materiasPermitidas: ['Português', 'Inglês', 'Matemática', 'Física'],
        pesosFixos: [
          { nome: 'Português', peso: 12 },
          { nome: 'Inglês', peso: 12 },
          { nome: 'Matemática', peso: 12 },
          { nome: 'Física', peso: 12 },
        ],
        blocos: [
          {
            area: 'Língua Portuguesa',
            questoesTotal: 12,
            disciplinas: [{ nome: 'Português', sinonimos: ['Língua Portuguesa'], questoes: 12 }],
          },
          {
            area: 'Língua Inglesa',
            questoesTotal: 12,
            disciplinas: [{ nome: 'Inglês', sinonimos: ['Língua Inglesa'], questoes: 12 }],
          },
          {
            area: 'Matemática',
            questoesTotal: 12,
            disciplinas: [{ nome: 'Matemática', questoes: 12 }],
          },
          {
            area: 'Física',
            questoesTotal: 12,
            disciplinas: [{ nome: 'Física', questoes: 12 }],
          },
        ],
      },
    ],
  },
  ESA: {
    sigla: 'ESA',
    nome: 'Escola de Sargentos das Armas',
    questoes: 50,
    minutos: 240, // 4h00
    duracaoHorasTexto: '4h00min',
    descricao: '50 questões objetivas · 4h00min (14 Mat, 14 Port, 6 Hist, 6 Geo, 10 Ing)',
    detalhesEdital:
      'Prova com 50 questões objetivas: 14 Matemática, 14 Português, 6 História do Brasil, 6 Geografia do Brasil e 10 Inglês. A redação oficial é descartada no simulado.',
    temRedacaoNaProvaReal: true,
    materiasEsperadas: [
      { nome: 'Matemática', peso: 14 },
      { nome: 'Português', peso: 14 },
      { nome: 'História do Brasil', peso: 6 },
      { nome: 'Geografia do Brasil', peso: 6 },
      { nome: 'Inglês', peso: 10 },
    ],
    blocos: [
      {
        area: 'Matemática',
        questoesTotal: 14,
        disciplinas: [{ nome: 'Matemática', questoes: 14 }],
      },
      {
        area: 'Língua Portuguesa',
        questoesTotal: 14,
        disciplinas: [{ nome: 'Português', questoes: 14 }],
      },
      {
        area: 'História do Brasil',
        questoesTotal: 6,
        disciplinas: [{ nome: 'História', sinonimos: ['História do Brasil'], questoes: 6 }],
      },
      {
        area: 'Geografia do Brasil',
        questoesTotal: 6,
        disciplinas: [{ nome: 'Geografia', sinonimos: ['Geografia do Brasil'], questoes: 6 }],
      },
      {
        area: 'Língua Inglesa',
        questoesTotal: 10,
        disciplinas: [{ nome: 'Inglês', sinonimos: ['Língua Inglesa'], questoes: 10 }],
      },
    ],
    variacoes: [
      {
        id: 'completa',
        nome: 'Prova Oficial (50 questões)',
        questoes: 50,
        minutos: 240,
        descricao: '50 questões · 4h00min (14 Mat, 14 Port, 6 Hist, 6 Geo, 10 Ing)',
        materiasPermitidas: ['Matemática', 'Português', 'História', 'Geografia', 'Inglês'],
        pesosFixos: [
          { nome: 'Matemática', peso: 14 },
          { nome: 'Português', peso: 14 },
          { nome: 'História', peso: 6 },
          { nome: 'Geografia', peso: 6 },
          { nome: 'Inglês', peso: 10 },
        ],
        blocos: [
          {
            area: 'Matemática',
            questoesTotal: 14,
            disciplinas: [{ nome: 'Matemática', questoes: 14 }],
          },
          {
            area: 'Língua Portuguesa',
            questoesTotal: 14,
            disciplinas: [{ nome: 'Português', questoes: 14 }],
          },
          {
            area: 'História do Brasil',
            questoesTotal: 6,
            disciplinas: [{ nome: 'História', sinonimos: ['História do Brasil'], questoes: 6 }],
          },
          {
            area: 'Geografia do Brasil',
            questoesTotal: 6,
            disciplinas: [{ nome: 'Geografia', sinonimos: ['Geografia do Brasil'], questoes: 6 }],
          },
          {
            area: 'Língua Inglesa',
            questoesTotal: 10,
            disciplinas: [{ nome: 'Inglês', sinonimos: ['Língua Inglesa'], questoes: 10 }],
          },
        ],
      },
      {
        id: 'reduzida',
        nome: 'Simulado Reduzido (25 questões)',
        questoes: 25,
        minutos: 120, // 2h00
        descricao: '25 questões · 2h00min (7 Mat, 7 Port, 3 Hist, 3 Geo, 5 Ing)',
        materiasPermitidas: ['Matemática', 'Português', 'História', 'Geografia', 'Inglês'],
        pesosFixos: [
          { nome: 'Matemática', peso: 7 },
          { nome: 'Português', peso: 7 },
          { nome: 'História', peso: 3 },
          { nome: 'Geografia', peso: 3 },
          { nome: 'Inglês', peso: 5 },
        ],
        blocos: [
          {
            area: 'Matemática',
            questoesTotal: 7,
            disciplinas: [{ nome: 'Matemática', questoes: 7 }],
          },
          {
            area: 'Língua Portuguesa',
            questoesTotal: 7,
            disciplinas: [{ nome: 'Português', questoes: 7 }],
          },
          {
            area: 'História do Brasil',
            questoesTotal: 3,
            disciplinas: [{ nome: 'História', sinonimos: ['História do Brasil'], questoes: 3 }],
          },
          {
            area: 'Geografia do Brasil',
            questoesTotal: 3,
            disciplinas: [{ nome: 'Geografia', sinonimos: ['Geografia do Brasil'], questoes: 3 }],
          },
          {
            area: 'Língua Inglesa',
            questoesTotal: 5,
            disciplinas: [{ nome: 'Inglês', sinonimos: ['Língua Inglesa'], questoes: 5 }],
          },
        ],
      },
    ],
  },
  EPCAR: {
    sigla: 'EPCAR',
    nome: 'Escola Preparatória de Cadetes do Ar',
    questoes: 48,
    minutos: 320, // 5h20
    duracaoHorasTexto: '5h20min',
    descricao: '48 questões objetivas · 5h20min (16 Port, 16 Mat, 16 Ing — sem redação)',
    detalhesEdital:
      'Prova objetiva com 48 questões: 16 Língua Portuguesa, 16 Matemática e 16 Língua Inglesa. Duração total de 5h20min. Redação descartada.',
    temRedacaoNaProvaReal: true,
    materiasEsperadas: [
      { nome: 'Português', peso: 16 },
      { nome: 'Matemática', peso: 16 },
      { nome: 'Inglês', peso: 16 },
    ],
    blocos: [
      {
        area: 'Língua Portuguesa',
        questoesTotal: 16,
        disciplinas: [{ nome: 'Português', questoes: 16 }],
      },
      {
        area: 'Matemática',
        questoesTotal: 16,
        disciplinas: [{ nome: 'Matemática', questoes: 16 }],
      },
      {
        area: 'Língua Inglesa',
        questoesTotal: 16,
        disciplinas: [{ nome: 'Inglês', questoes: 16 }],
      },
    ],
    variacoes: [
      {
        id: 'completa',
        nome: 'Prova Oficial (48 questões)',
        questoes: 48,
        minutos: 320,
        descricao: '48 questões · 5h20min (16 Port, 16 Mat, 16 Ing)',
        materiasPermitidas: ['Português', 'Matemática', 'Inglês'],
        pesosFixos: [
          { nome: 'Português', peso: 16 },
          { nome: 'Matemática', peso: 16 },
          { nome: 'Inglês', peso: 16 },
        ],
        blocos: [
          {
            area: 'Língua Portuguesa',
            questoesTotal: 16,
            disciplinas: [{ nome: 'Português', questoes: 16 }],
          },
          {
            area: 'Matemática',
            questoesTotal: 16,
            disciplinas: [{ nome: 'Matemática', questoes: 16 }],
          },
          {
            area: 'Língua Inglesa',
            questoesTotal: 16,
            disciplinas: [{ nome: 'Inglês', questoes: 16 }],
          },
        ],
      },
      {
        id: 'reduzida',
        nome: 'Simulado Reduzido (24 questões)',
        questoes: 24,
        minutos: 160, // 2h40
        descricao: '24 questões · 2h40min (8 Port, 8 Mat, 8 Ing)',
        materiasPermitidas: ['Português', 'Matemática', 'Inglês'],
        pesosFixos: [
          { nome: 'Português', peso: 8 },
          { nome: 'Matemática', peso: 8 },
          { nome: 'Inglês', peso: 8 },
        ],
        blocos: [
          {
            area: 'Língua Portuguesa',
            questoesTotal: 8,
            disciplinas: [{ nome: 'Português', questoes: 8 }],
          },
          {
            area: 'Matemática',
            questoesTotal: 8,
            disciplinas: [{ nome: 'Matemática', questoes: 8 }],
          },
          {
            area: 'Língua Inglesa',
            questoesTotal: 8,
            disciplinas: [{ nome: 'Inglês', questoes: 8 }],
          },
        ],
      },
    ],
  },
  CN: {
    sigla: 'CN',
    nome: 'Colégio Naval',
    questoes: 90,
    minutos: 300, // 5h00
    duracaoHorasTexto: '5h00min',
    descricao: '90 questões objetivas · Prova Completa (sem redação)',
    detalhesEdital:
      'Prova oficial em 2 dias: 1º dia com 40 questões (20 Mat, 20 Ing) e 2º dia com 50 questões (20 Port, 12 Estudos Sociais, 18 Ciências). Redação descartada.',
    temRedacaoNaProvaReal: true,
    materiasEsperadas: [
      { nome: 'Matemática', peso: 20 },
      { nome: 'Inglês', peso: 20 },
      { nome: 'Português', peso: 20 },
      { nome: 'Ciências da Natureza', peso: 18 },
      { nome: 'Ciências Humanas', peso: 12 },
    ],
    variacoes: [
      {
        id: 'dia1',
        nome: '1º Dia Real (Matemática + Inglês)',
        questoes: 40,
        minutos: 300,
        descricao: '40 questões · 5h00min (20 Mat + 20 Ing)',
        diaProvaNumero: 1,
        materiasPermitidas: ['Matemática', 'Inglês'],
        pesosFixos: [
          { nome: 'Matemática', peso: 20 },
          { nome: 'Inglês', peso: 20 },
        ],
        blocos: [
          {
            area: 'Matemática',
            questoesTotal: 20,
            disciplinas: [{ nome: 'Matemática', questoes: 20 }],
          },
          {
            area: 'Língua Inglesa',
            questoesTotal: 20,
            disciplinas: [{ nome: 'Inglês', questoes: 20 }],
          },
        ],
      },
      {
        id: 'dia2',
        nome: '2º Dia Real (Português + Sociais + Ciências)',
        questoes: 50,
        minutos: 300,
        descricao: '50 questões · 5h00min (20 Port + 12 Sociais + 18 Ciências)',
        diaProvaNumero: 2,
        materiasPermitidas: [
          'Português',
          'História',
          'História do Brasil',
          'Geografia',
          'Geografia do Brasil',
          'Ciências da Natureza',
          'Ciências Humanas',
          'Física',
          'Química',
          'Biologia',
        ],
        pesosFixos: [
          { nome: 'Português', peso: 20 },
          { nome: 'História', peso: 6 },
          { nome: 'Geografia', peso: 6 },
          { nome: 'Física', peso: 6 },
          { nome: 'Química', peso: 6 },
          { nome: 'Biologia', peso: 6 },
        ],
        blocos: [
          {
            area: 'Língua Portuguesa',
            questoesTotal: 20,
            disciplinas: [{ nome: 'Português', questoes: 20 }],
          },
          {
            area: 'Estudos Sociais',
            questoesTotal: 12,
            disciplinas: [
              { nome: 'História', sinonimos: ['História do Brasil'], questoes: 6 },
              { nome: 'Geografia', sinonimos: ['Geografia do Brasil'], questoes: 6 },
            ],
          },
          {
            area: 'Ciências',
            questoesTotal: 18,
            disciplinas: [
              { nome: 'Física', questoes: 6 },
              { nome: 'Química', questoes: 6 },
              { nome: 'Biologia', sinonimos: ['Ciências da Natureza'], questoes: 6 },
            ],
          },
        ],
      },
      {
        id: 'completa',
        nome: 'Prova Completa (2 Dias Unificados)',
        questoes: 90,
        minutos: 300,
        descricao: '90 questões de todas as disciplinas do Colégio Naval',
      },
    ],
  },
  EFOMM: {
    sigla: 'EFOMM',
    nome: 'Escola de Formação de Oficiais da Marinha Mercante',
    questoes: 80,
    minutos: 240, // 4h00
    duracaoHorasTexto: '4h00min',
    descricao: '80 questões objetivas · Prova Completa (sem redação)',
    detalhesEdital:
      'Prova em 2 dias (40 questões por dia em 4 horas cada): 1º dia (20 Port, 20 Ing) e 2º dia (20 Mat, 20 Fís). Redação descartada.',
    temRedacaoNaProvaReal: true,
    materiasEsperadas: [
      { nome: 'Português', peso: 20 },
      { nome: 'Inglês', peso: 20 },
      { nome: 'Matemática', peso: 20 },
      { nome: 'Física', peso: 20 },
    ],
    variacoes: [
      {
        id: 'dia1',
        nome: '1º Dia Real (Português + Inglês)',
        questoes: 40,
        minutos: 240,
        descricao: '40 questões · 4h00min (20 Port + 20 Ing)',
        diaProvaNumero: 1,
        materiasPermitidas: ['Português', 'Inglês'],
        pesosFixos: [
          { nome: 'Português', peso: 20 },
          { nome: 'Inglês', peso: 20 },
        ],
        blocos: [
          {
            area: 'Língua Portuguesa',
            questoesTotal: 20,
            disciplinas: [{ nome: 'Português', questoes: 20 }],
          },
          {
            area: 'Língua Inglesa',
            questoesTotal: 20,
            disciplinas: [{ nome: 'Inglês', questoes: 20 }],
          },
        ],
      },
      {
        id: 'dia2',
        nome: '2º Dia Real (Matemática + Física)',
        questoes: 40,
        minutos: 240,
        descricao: '40 questões · 4h00min (20 Mat + 20 Fís)',
        diaProvaNumero: 2,
        materiasPermitidas: ['Matemática', 'Física'],
        pesosFixos: [
          { nome: 'Matemática', peso: 20 },
          { nome: 'Física', peso: 20 },
        ],
        blocos: [
          {
            area: 'Matemática',
            questoesTotal: 20,
            disciplinas: [{ nome: 'Matemática', questoes: 20 }],
          },
          {
            area: 'Física',
            questoesTotal: 20,
            disciplinas: [{ nome: 'Física', questoes: 20 }],
          },
        ],
      },
      {
        id: 'completa',
        nome: 'Prova Completa (80 questões)',
        questoes: 80,
        minutos: 240,
        descricao: '80 questões unificadas das 4 disciplinas da EFOMM',
      },
    ],
  },
  ESPCEX: {
    sigla: 'ESPCEX',
    nome: 'Escola Preparatória de Cadetes do Exército',
    questoes: 100,
    minutos: 270, // 4h30
    duracaoHorasTexto: '4h30min',
    descricao: '100 questões objetivas · Prova Completa dos 2 dias (sem redação)',
    detalhesEdital:
      'Prova oficial em 2 dias (4h30min cada): 1º dia com 44 questões (20 Port, 12 Fís, 12 Quím) e 2º dia com 56 questões (20 Mat, 12 Hist, 12 Geo, 12 Ing). Redação descartada.',
    temRedacaoNaProvaReal: true,
    materiasEsperadas: [
      { nome: 'Português', peso: 20 },
      { nome: 'Matemática', peso: 20 },
      { nome: 'Física', peso: 12 },
      { nome: 'Química', peso: 12 },
      { nome: 'História do Brasil', peso: 12 },
      { nome: 'Geografia do Brasil', peso: 12 },
      { nome: 'Inglês', peso: 12 },
    ],
    variacoes: [
      {
        id: 'dia1',
        nome: '1º Dia Real (Português + Física + Química)',
        questoes: 44,
        minutos: 270,
        descricao: '44 questões · 4h30min (20 Port + 12 Fís + 12 Quím)',
        diaProvaNumero: 1,
        materiasPermitidas: ['Português', 'Física', 'Química'],
        pesosFixos: [
          { nome: 'Português', peso: 20 },
          { nome: 'Física', peso: 12 },
          { nome: 'Química', peso: 12 },
        ],
        blocos: [
          {
            area: 'Língua Portuguesa',
            questoesTotal: 20,
            disciplinas: [{ nome: 'Português', questoes: 20 }],
          },
          {
            area: 'Física',
            questoesTotal: 12,
            disciplinas: [{ nome: 'Física', questoes: 12 }],
          },
          {
            area: 'Química',
            questoesTotal: 12,
            disciplinas: [{ nome: 'Química', questoes: 12 }],
          },
        ],
      },
      {
        id: 'dia2',
        nome: '2º Dia Real (Matemática + História + Geografia + Inglês)',
        questoes: 56,
        minutos: 270,
        descricao: '56 questões · 4h30min (20 Mat + 12 Hist + 12 Geo + 12 Ing)',
        diaProvaNumero: 2,
        materiasPermitidas: [
          'Matemática',
          'História do Brasil',
          'Geografia do Brasil',
          'História',
          'Geografia',
          'Inglês',
        ],
        pesosFixos: [
          { nome: 'Matemática', peso: 20 },
          { nome: 'História do Brasil', peso: 12 },
          { nome: 'Geografia do Brasil', peso: 12 },
          { nome: 'Inglês', peso: 12 },
        ],
        blocos: [
          {
            area: 'Matemática',
            questoesTotal: 20,
            disciplinas: [{ nome: 'Matemática', questoes: 20 }],
          },
          {
            area: 'História do Brasil',
            questoesTotal: 12,
            disciplinas: [
              { nome: 'História', sinonimos: ['História do Brasil', 'História Geral'], questoes: 12 },
            ],
          },
          {
            area: 'Geografia do Brasil',
            questoesTotal: 12,
            disciplinas: [
              { nome: 'Geografia', sinonimos: ['Geografia do Brasil', 'Geografia Geral'], questoes: 12 },
            ],
          },
          {
            area: 'Língua Inglesa',
            questoesTotal: 12,
            disciplinas: [{ nome: 'Inglês', sinonimos: ['Língua Inglesa'], questoes: 12 }],
          },
        ],
      },
      {
        id: 'completa',
        nome: 'Prova Completa (100 questões)',
        questoes: 100,
        minutos: 270,
        descricao: '100 questões objetivas de todas as disciplinas da EsPCEx',
      },
    ],
  },
  ENEM: {
    sigla: 'ENEM',
    nome: 'Exame Nacional do Ensino Médio',
    questoes: 90,
    minutos: 300, // 5h00
    duracaoHorasTexto: '5h00min',
    descricao: '90 questões objetivas · 1º Dia Oficial (Linguagens + Humanas)',
    detalhesEdital:
      'O ENEM aplica 90 questões por dia: 1º dia com 45 Linguagens (5 de Língua Estrangeira + 40 de Português/Literatura/Artes/Ed. Física) e 45 Humanas; 2º dia com 45 Natureza (Física, Química e Biologia) e 45 Matemática. A TRI avalia a consistência pedagógica de cada uma das 4 áreas de forma independente.',
    temRedacaoNaProvaReal: true,
    materiasEsperadas: [
      { nome: 'Português', peso: 20 },
      { nome: 'Literatura', peso: 10 },
      { nome: 'Inglês', peso: 5 },
      { nome: 'Artes', peso: 5 },
      { nome: 'Educação Física', peso: 5 },
      { nome: 'História', peso: 15 },
      { nome: 'Geografia', peso: 15 },
      { nome: 'Filosofia', peso: 8 },
      { nome: 'Sociologia', peso: 7 },
    ],
    variacoes: [
      {
        id: 'dia1',
        nome: '1º Dia Oficial (Linguagens + Humanas)',
        questoes: 90,
        minutos: 300,
        descricao: '90 questões · 5h00min (45 Linguagens [com 5 Inglês] + 45 Humanas)',
        diaProvaNumero: 1,
        materiasPermitidas: [
          'Português',
          'Literatura',
          'Inglês',
          'Artes',
          'Educação Física',
          'História',
          'Geografia',
          'Filosofia',
          'Sociologia',
          'Ciências Humanas',
          'Atualidades',
        ],
        pesosFixos: [
          { nome: 'Português', peso: 20 },
          { nome: 'Literatura', peso: 10 },
          { nome: 'Inglês', peso: 5 },
          { nome: 'Artes', peso: 5 },
          { nome: 'Educação Física', peso: 5 },
          { nome: 'História', peso: 15 },
          { nome: 'Geografia', peso: 15 },
          { nome: 'Filosofia', peso: 8 },
          { nome: 'Sociologia', peso: 7 },
        ],
        blocos: [
          {
            area: 'Linguagens, Códigos e suas Tecnologias',
            aplicaTRI: true,
            questoesTotal: 45,
            disciplinas: [
              { nome: 'Inglês', sinonimos: ['Língua Inglesa', 'Espanhol'], questoes: 5 },
              { nome: 'Português', sinonimos: ['Língua Portuguesa'], questoes: 20 },
              { nome: 'Literatura', questoes: 10 },
              { nome: 'Artes', questoes: 5 },
              { nome: 'Educação Física', questoes: 5 },
            ],
          },
          {
            area: 'Ciências Humanas e suas Tecnologias',
            aplicaTRI: true,
            questoesTotal: 45,
            disciplinas: [
              { nome: 'História', sinonimos: ['História Geral', 'História do Brasil'], questoes: 15 },
              { nome: 'Geografia', sinonimos: ['Geografia Geral', 'Geografia do Brasil'], questoes: 15 },
              { nome: 'Filosofia', questoes: 8 },
              { nome: 'Sociologia', sinonimos: ['Ciências Humanas', 'Atualidades'], questoes: 7 },
            ],
          },
        ],
      },
      {
        id: 'dia2',
        nome: '2º Dia Oficial (Natureza + Matemática)',
        questoes: 90,
        minutos: 300,
        descricao: '90 questões · 5h00min (45 Natureza [Fís/Quím/Bio] + 45 Matemática)',
        diaProvaNumero: 2,
        materiasPermitidas: [
          'Matemática',
          'Física',
          'Química',
          'Biologia',
          'Ciências da Natureza',
        ],
        pesosFixos: [
          { nome: 'Física', peso: 15 },
          { nome: 'Química', peso: 15 },
          { nome: 'Biologia', peso: 15 },
          { nome: 'Matemática', peso: 45 },
        ],
        blocos: [
          {
            area: 'Ciências da Natureza e suas Tecnologias',
            aplicaTRI: true,
            questoesTotal: 45,
            disciplinas: [
              { nome: 'Física', questoes: 15 },
              { nome: 'Química', questoes: 15 },
              { nome: 'Biologia', sinonimos: ['Ciências da Natureza'], questoes: 15 },
            ],
          },
          {
            area: 'Matemática e suas Tecnologias',
            aplicaTRI: true,
            questoesTotal: 45,
            disciplinas: [
              { nome: 'Matemática', questoes: 45 },
            ],
          },
        ],
      },
      {
        id: 'completa',
        nome: 'Simulado Maratona (180 questões)',
        questoes: 180,
        minutos: 330,
        descricao: '180 questões objetivas unindo os 2 dias do exame (LC + CH + CN + MT)',
        blocos: [
          {
            area: 'Linguagens, Códigos e suas Tecnologias',
            aplicaTRI: true,
            questoesTotal: 45,
            disciplinas: [
              { nome: 'Inglês', sinonimos: ['Língua Inglesa', 'Espanhol'], questoes: 5 },
              { nome: 'Português', sinonimos: ['Língua Portuguesa'], questoes: 20 },
              { nome: 'Literatura', questoes: 10 },
              { nome: 'Artes', questoes: 5 },
              { nome: 'Educação Física', questoes: 5 },
            ],
          },
          {
            area: 'Ciências Humanas e suas Tecnologias',
            aplicaTRI: true,
            questoesTotal: 45,
            disciplinas: [
              { nome: 'História', sinonimos: ['História Geral', 'História do Brasil'], questoes: 15 },
              { nome: 'Geografia', sinonimos: ['Geografia Geral', 'Geografia do Brasil'], questoes: 15 },
              { nome: 'Filosofia', questoes: 8 },
              { nome: 'Sociologia', sinonimos: ['Ciências Humanas', 'Atualidades'], questoes: 7 },
            ],
          },
          {
            area: 'Ciências da Natureza e suas Tecnologias',
            aplicaTRI: true,
            questoesTotal: 45,
            disciplinas: [
              { nome: 'Física', questoes: 15 },
              { nome: 'Química', questoes: 15 },
              { nome: 'Biologia', sinonimos: ['Ciências da Natureza'], questoes: 15 },
            ],
          },
          {
            area: 'Matemática e suas Tecnologias',
            aplicaTRI: true,
            questoesTotal: 45,
            disciplinas: [
              { nome: 'Matemática', questoes: 45 },
            ],
          },
        ],
      },
    ],
  },
  EAM: {
    sigla: 'EAM',
    nome: 'Escola de Aprendizes-Marinheiros',
    questoes: 50,
    minutos: 240, // 4h00
    duracaoHorasTexto: '4h00min',
    descricao: '50 questões objetivas · 4h00min (15 Port, 15 Mat, 15 Ciênc, 5 Ing)',
    detalhesEdital:
      'Prova única com 50 questões: 15 Português, 15 Matemática, 15 Ciências (Física/Química) e 5 Inglês. Duração de 4 horas. Sem redação.',
    temRedacaoNaProvaReal: false,
    materiasEsperadas: [
      { nome: 'Português', peso: 15 },
      { nome: 'Matemática', peso: 15 },
      { nome: 'Ciências da Natureza', peso: 15 },
      { nome: 'Inglês', peso: 5 },
    ],
    blocos: [
      {
        area: 'Língua Portuguesa',
        questoesTotal: 15,
        disciplinas: [{ nome: 'Português', questoes: 15 }],
      },
      {
        area: 'Matemática',
        questoesTotal: 15,
        disciplinas: [{ nome: 'Matemática', questoes: 15 }],
      },
      {
        area: 'Ciências',
        questoesTotal: 15,
        disciplinas: [
          { nome: 'Física', sinonimos: ['Ciências da Natureza'], questoes: 8 },
          { nome: 'Química', sinonimos: ['Ciências da Natureza'], questoes: 7 },
        ],
      },
      {
        area: 'Língua Inglesa',
        questoesTotal: 5,
        disciplinas: [{ nome: 'Inglês', sinonimos: ['Língua Inglesa'], questoes: 5 }],
      },
    ],
  },
  AFA: {
    sigla: 'AFA',
    nome: 'Academia da Força Aérea',
    questoes: 64,
    minutos: 310, // 5h10
    duracaoHorasTexto: '5h10min',
    descricao: '64 questões objetivas · 5h10min (16 Port, 16 Fís, 16 Mat, 16 Ing)',
    detalhesEdital:
      'Prova objetiva com 64 questões (16 por matéria) em 5h10min. Redação descartada no simulado.',
    temRedacaoNaProvaReal: true,
    materiasEsperadas: [
      { nome: 'Português', peso: 16 },
      { nome: 'Física', peso: 16 },
      { nome: 'Matemática', peso: 16 },
      { nome: 'Inglês', peso: 16 },
    ],
    blocos: [
      {
        area: 'Língua Portuguesa',
        questoesTotal: 16,
        disciplinas: [{ nome: 'Português', questoes: 16 }],
      },
      {
        area: 'Física',
        questoesTotal: 16,
        disciplinas: [{ nome: 'Física', questoes: 16 }],
      },
      {
        area: 'Matemática',
        questoesTotal: 16,
        disciplinas: [{ nome: 'Matemática', questoes: 16 }],
      },
      {
        area: 'Língua Inglesa',
        questoesTotal: 16,
        disciplinas: [{ nome: 'Inglês', questoes: 16 }],
      },
    ],
  },
  ITA: {
    sigla: 'ITA',
    nome: 'Instituto Tecnológico de Aeronáutica (1ª Fase)',
    questoes: 48,
    minutos: 300, // 5h00
    duracaoHorasTexto: '5h00min',
    descricao: '48 questões objetivas · 5h00min (12 Mat, 12 Fís, 12 Quím, 12 Ing)',
    detalhesEdital:
      'Primeira fase objetiva do ITA com 48 questões de altíssimo nível (12 por disciplina) em 5 horas.',
    temRedacaoNaProvaReal: false,
    materiasEsperadas: [
      { nome: 'Matemática', peso: 12 },
      { nome: 'Física', peso: 12 },
      { nome: 'Química', peso: 12 },
      { nome: 'Inglês', peso: 12 },
    ],
    blocos: [
      {
        area: 'Matemática',
        questoesTotal: 12,
        disciplinas: [{ nome: 'Matemática', questoes: 12 }],
      },
      {
        area: 'Física',
        questoesTotal: 12,
        disciplinas: [{ nome: 'Física', questoes: 12 }],
      },
      {
        area: 'Química',
        questoesTotal: 12,
        disciplinas: [{ nome: 'Química', questoes: 12 }],
      },
      {
        area: 'Língua Inglesa',
        questoesTotal: 12,
        disciplinas: [{ nome: 'Inglês', questoes: 12 }],
      },
    ],
  },
  IME: {
    sigla: 'IME',
    nome: 'Instituto Militar de Engenharia (1ª Fase)',
    questoes: 40,
    minutos: 240, // 4h00
    duracaoHorasTexto: '4h00min',
    descricao: '40 questões objetivas · 4h00min (15 Mat, 15 Fís, 10 Quím)',
    detalhesEdital:
      'Primeira fase objetiva do IME com 40 questões (15 Matemática, 15 Física e 10 Química) em 4 horas.',
    temRedacaoNaProvaReal: false,
    materiasEsperadas: [
      { nome: 'Matemática', peso: 15 },
      { nome: 'Física', peso: 15 },
      { nome: 'Química', peso: 10 },
    ],
    blocos: [
      {
        area: 'Matemática',
        questoesTotal: 15,
        disciplinas: [{ nome: 'Matemática', questoes: 15 }],
      },
      {
        area: 'Física',
        questoesTotal: 15,
        disciplinas: [{ nome: 'Física', questoes: 15 }],
      },
      {
        area: 'Química',
        questoesTotal: 10,
        disciplinas: [{ nome: 'Química', questoes: 10 }],
      },
    ],
  },
};

/**
 * Retorna o formato oficial de um concurso, considerando variação (se houver).
 */
export function obterFormatoConcurso(
  siglaConcurso: string,
  variacaoId?: string | null
): FormatoConcursoReal {
  const chave = String(siglaConcurso || '').trim().toUpperCase();
  const base = FORMATOS_OFICIAIS[chave];

  if (!base) {
    return {
      sigla: chave || 'GERAL',
      nome: 'Simulado Geral',
      questoes: 50,
      minutos: 240,
      duracaoHorasTexto: '4h00min',
      descricao: '50 questões objetivas · 4h00min',
      detalhesEdital: 'Formato padrão de 50 questões com duração de 4 horas.',
      temRedacaoNaProvaReal: false,
      materiasEsperadas: [],
      variacaoAtiva: null,
    };
  }

  // Se houver variações e nenhuma variação específica foi pedida,
  // selecionamos a primeira variação padrão (ex: Dia 1 para ENEM)
  const varId = variacaoId || (base.variacoes && base.variacoes.length > 0 ? base.variacoes[0].id : null);

  if (varId && base.variacoes) {
    const v = base.variacoes.find((item) => item.id === varId);
    if (v) {
      return {
        ...base,
        questoes: v.questoes,
        minutos: v.minutos,
        descricao: v.descricao,
        blocos: v.blocos ?? base.blocos,
        variacaoAtiva: v,
      };
    }
  }

  return {
    ...base,
    variacaoAtiva: null,
  };
}
