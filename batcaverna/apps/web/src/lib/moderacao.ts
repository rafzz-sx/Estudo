/**
 * Classificador de mensagens do chat.
 *
 * O que existia antes: uma lista de 12 palavrões e um `texto.includes(termo)`.
 * Três problemas com isso.
 *
 *   1. `includes` casa dentro de palavra. "lixo" sinalizava "prolixo"; "puta"
 *      sinalizava "computador"; "foder" sinalizava "confodere". O admin
 *      recebia ruído e parava de olhar — que é o pior desfecho possível para
 *      uma fila de moderação.
 *   2. A lista só tinha palavrão. Não cobria ameaça, conteúdo sexual, aliciamento
 *      nem pedido de contato fora da plataforma — que são justamente os riscos
 *      que importam num site com adolescentes.
 *   3. Tudo caía no mesmo balde. "que prova do caralho" e "vou te matar" viravam
 *      a mesma bandeira vermelha, e quem modera não tinha por onde começar.
 *
 * Aqui as ocorrências têm CATEGORIA e GRAVIDADE, e a gravidade decide se o
 * admin é acordado na hora ou se aquilo espera a próxima olhada na fila.
 *
 * ─── O que este arquivo NÃO faz ───────────────────────────────────────────
 * Não bloqueia mensagem nenhuma. Sinaliza para uma pessoa revisar. Filtro
 * automático erra — em gíria, em citação, em conversa entre amigos que se
 * xingam de brincadeira — e apagar a mensagem de alguém por causa de uma
 * regex é pior que deixar o admin ler e decidir.
 */

export type CategoriaModeracao =
  | 'ameaca'
  | 'sexual'
  | 'aliciamento'
  | 'discriminacao'
  | 'autolesao'
  | 'drogas'
  | 'assedio'
  | 'palavrao';

export type GravidadeModeracao = 'critica' | 'alta' | 'media' | 'baixa';

export interface OcorrenciaModeracao {
  categoria: CategoriaModeracao;
  gravidade: GravidadeModeracao;
  /** O que casou, já normalizado — vai para o painel, não para o aluno. */
  trecho: string;
}

export interface ResultadoModeracao {
  sinalizada: boolean;
  gravidade: GravidadeModeracao | null;
  categorias: CategoriaModeracao[];
  ocorrencias: OcorrenciaModeracao[];
  /** true quando alguém precisa olhar HOJE, não na próxima varredura. */
  alertaImediato: boolean;
}

// ─── Normalização ────────────────────────────────────────────
// Quem quer escapar de filtro escreve `c@ralho`, `m3rda`, `p.u.t.a` ou
// `caaaralho`. Nenhum desses truques é sofisticado, e todos derrotam um
// `includes` cru.

// `!`, `$` e `|` ficaram DE FORA de propósito: em português são pontuação e
// moeda muito mais vezes do que disfarce. Mapear `!`→`i` transformaria
// "vamos!!!" em "vamosi" e só geraria ruído na fila do admin.
const TROCA_LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't',
  '@': 'a', '*': '',
};

export function normalizarParaModeracao(texto: string): string {
  let t = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // tira acento

  t = t.replace(/[013457@*]/g, (c) => TROCA_LEET[c] ?? c);

  // p.u.t.a → puta. Só junta quando o separador está ENTRE letras soltas,
  // para não destruir "e-mail" nem "ok. beleza".
  t = t.replace(/\b(?:[a-z][.\-_ ]){2,}[a-z]\b/g, (m) => m.replace(/[.\-_ ]/g, ''));

  // caaaralho → caralho. Só a partir de 3 repetições: "carro" e "passe"
  // continuam inteiros.
  t = t.replace(/(.)\1{2,}/g, '$1');

  return t.replace(/\s+/g, ' ').trim();
}

// ─── Dicionários ─────────────────────────────────────────────
// Cada entrada vira uma regex com fronteira de palavra. `\b` não funciona
// direito com acento, mas o texto já chega sem acento aqui.

interface Regra {
  categoria: CategoriaModeracao;
  gravidade: GravidadeModeracao;
  termos: string[];
  /** Quando presente, só conta se o padrão também aparecer na mensagem. */
  exigeAlvo?: boolean;
}

/**
 * Sinais de que a frase é DIRIGIDA a quem está lendo.
 * É o que separa "essa prova foi uma merda" de "você é uma merda".
 */
const PADRAO_ALVO =
  /\b(voce|vc|tu|te|ti|seu|sua|teu|tua|contigo|com voce|cê|ce)\b/;

const REGRAS: Regra[] = [
  // ── CRÍTICA ────────────────────────────────────────────────
  {
    categoria: 'ameaca',
    gravidade: 'critica',
    termos: [
      'vou te matar', 'te mato', 'vou te pegar', 'te pego na saida',
      'sei onde voce mora', 'sei onde vc mora', 'sei onde tu mora',
      'vou acabar com voce', 'vou acabar com vc', 'vou te bater',
      'vou te quebrar', 'te espero na saida', 'vou na sua casa',
      'vou te encontrar', 'voce ta morto', 'vc ta morto',
      'vou te esfaquear', 'vou atirar em voce',
    ],
    // "ta morto" sozinho saiu da lista: "esse assunto ta morto" e "meu
    // celular ta morto" são fala de todo dia. Só conta com o pronome.
  },
  {
    categoria: 'aliciamento',
    gravidade: 'critica',
    // Padrão clássico de aliciamento: puxar a criança para fora do ambiente
    // moderado. Sozinho não prova nada — dois amigos trocam Instagram o
    // tempo todo — mas é exatamente por isso que vai para revisão humana e
    // não para bloqueio automático.
    // Sinal FORTE: sigilo, foto e endereço. Nenhum destes tem uso inocente
    // frequente entre dois estudantes falando de prova.
    termos: [
      'nao conta pra ninguem', 'nao fala pra ninguem', 'segredo nosso',
      'apaga essa conversa', 'apaga depois de ler', 'me manda foto sua',
      'manda uma foto sua', 'tira uma foto pra mim',
      'vamos nos encontrar', 'me passa seu endereco', 'qual seu endereco',
      'onde voce mora', 'nao mostra pros seus pais',
    ],
  },
  {
    // Sinal FRACO, e por isso 'alta' e não 'critica'. Cada um destes tem uso
    // inocente comum — dois alunos trocam Instagram e perguntam idade o
    // tempo todo. O que importa é aparecerem JUNTO com os de cima, e é o
    // painel agrupando por conversa que mostra isso.
    categoria: 'aliciamento',
    gravidade: 'alta',
    termos: [
      'quantos anos voce tem', 'quantos anos vc tem', 'ta sozinho em casa',
      'ta sozinha em casa', 'seus pais estao', 'me chama no zap',
      'me passa seu numero', 'me passa seu whats', 'me passa seu insta',
    ],
  },
  {
    // Explícito por si só. Num site cuja base tem gente de 14 a 22 anos,
    // isto não precisa de pronome ao lado para merecer uma olhada. "manda
    // nudes" já é imperativo — esperar por um "você" na frase seria deixar
    // passar justamente a forma mais comum.
    categoria: 'sexual',
    gravidade: 'critica',
    termos: [
      'nudes', 'pack de foto', 'foto pelada', 'foto pelado',
      'me manda pelada', 'me manda pelado', 'sexo comigo', 'pau duro',
      'pornografia', 'onlyfans',
    ],
    // 'privacy' saiu: aparece em texto de prova de Inglês ("privacy policy")
    // e os alunos discutem essas provas no chat.
  },
  {
    // Ambíguo fora de contexto: "bunda" aparece em aula de anatomia e em
    // piada entre amigos. Só conta quando é dirigido a alguém.
    categoria: 'sexual',
    gravidade: 'alta',
    termos: ['peito', 'bunda', 'buceta', 'gostosa', 'gostoso', 'transar'],
    exigeAlvo: true,
  },
  {
    categoria: 'autolesao',
    gravidade: 'critica',
    // NÃO é punitivo. Este bloco existe para alguém poder OFERECER AJUDA.
    // Estudante de véspera de concurso, adolescente, sob pressão de família:
    // a plataforma é um dos poucos lugares onde ele fala. Se ele escreve
    // isso aqui, a pior resposta possível é ninguém ler.
    termos: [
      'quero morrer', 'vou me matar', 'quero me matar', 'pensei em me matar',
      'nao aguento mais viver', 'acabar com a minha vida',
      'tirar a minha vida', 'vou me cortar', 'me cortei', 'melhor sem mim',
      'ninguem sentiria minha falta', 'nao vale a pena viver',
      'nao quero mais existir', 'queria sumir de vez',
    ],
    // 'me matar' solto ficou de fora: "essa prova vai me matar" é a frase
    // mais comum da plataforma. Um alerta que dispara toda hora é um alerta
    // que ninguém lê — e nesta categoria, especificamente, ninguém pode
    // parar de ler.
  },

  // ── ALTA ───────────────────────────────────────────────────
  {
    categoria: 'discriminacao',
    gravidade: 'alta',
    termos: [
      'macaco', 'preto imundo', 'volta pra senzala', 'viado', 'bicha',
      'traveco', 'sapatao', 'nazista', 'hitler tinha razao',
      'retardado', 'mongoloide', 'aleijado', 'favelado', 'nordestino burro',
    ],
  },
  {
    categoria: 'drogas',
    gravidade: 'alta',
    termos: [
      'vendo maconha', 'vendo cocaina', 'tenho pra vender',
      'quer comprar droga', 'cocaina', 'lsd', 'ecstasy',
      'rebite pra estudar', 'ritalina sem receita', 'vendo remedio',
    ],
    // 'baseado' e 'crack' saíram. Nesta plataforma "baseado no edital" é
    // frase de todo dia, e "ele é um crack em matemática" é elogio.
  },
  {
    categoria: 'assedio',
    gravidade: 'alta',
    termos: [
      'idiota', 'imbecil', 'otario', 'arrombado', 'corno', 'vagabundo',
      'desgracado', 'lixo', 'burro', 'burra', 'inutil', 'fracassado',
      'ninguem gosta de voce', 'some daqui', 'cala a boca',
    ],
    exigeAlvo: true,
  },

  // ── MÉDIA / BAIXA ──────────────────────────────────────────
  {
    categoria: 'palavrao',
    gravidade: 'baixa',
    termos: [
      'merda', 'caralho', 'porra', 'foda', 'foder', 'puta', 'putaria',
      'buceta', 'cacete', 'droga', 'bosta', 'desgraca',
    ],
  },
];

/** Escapa o termo e exige fronteira de palavra dos dois lados. */
function regexDoTermo(termo: string): RegExp {
  const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Termos com espaço já são específicos o bastante; os de uma palavra
  // precisam da fronteira, senão "lixo" acha "prolixo".
  return termo.includes(' ')
    ? new RegExp(escapado)
    : new RegExp(`(?:^|[^a-z])${escapado}(?:[^a-z]|$)`);
}

const ORDEM_GRAVIDADE: Record<GravidadeModeracao, number> = {
  critica: 4,
  alta: 3,
  media: 2,
  baixa: 1,
};

/**
 * Analisa o texto de uma mensagem.
 *
 * Devolve sempre — mensagem limpa vem com `sinalizada: false` e listas
 * vazias, e nesse caso nada é gravado nem notificado.
 */
export function analisarMensagem(texto: string | null | undefined): ResultadoModeracao {
  const limpo: ResultadoModeracao = {
    sinalizada: false,
    gravidade: null,
    categorias: [],
    ocorrencias: [],
    alertaImediato: false,
  };

  if (!texto || !texto.trim()) return limpo;

  const normalizado = normalizarParaModeracao(texto);
  const temAlvo = PADRAO_ALVO.test(normalizado);

  const ocorrencias: OcorrenciaModeracao[] = [];

  for (const regra of REGRAS) {
    for (const termo of regra.termos) {
      if (!regexDoTermo(termo).test(normalizado)) continue;

      // Regra que exige alvo e não achou alvo simplesmente não conta: é o
      // que impede "essa prova foi uma bosta" de virar ocorrência de assédio.
      if (regra.exigeAlvo && !temAlvo) continue;

      // Palavrão sem destinatário é desabafo; com destinatário, é ofensa.
      // Tratar os dois igual é o que faz o admin desistir da fila.
      let gravidade = regra.gravidade;
      if (regra.categoria === 'palavrao' && temAlvo) {
        gravidade = 'media';
      }

      ocorrencias.push({ categoria: regra.categoria, gravidade, trecho: termo });
      break; // um acerto por regra basta
    }
  }

  if (!ocorrencias.length) return limpo;

  const gravidade = ocorrencias.reduce<GravidadeModeracao>(
    (pior, o) =>
      ORDEM_GRAVIDADE[o.gravidade] > ORDEM_GRAVIDADE[pior] ? o.gravidade : pior,
    'baixa'
  );

  return {
    sinalizada: true,
    gravidade,
    categorias: [...new Set(ocorrencias.map((o) => o.categoria))],
    ocorrencias,
    // Palavrão solto entra na fila e espera. Ameaça, conteúdo sexual,
    // aliciamento e sinal de autolesão avisam o admin na hora.
    alertaImediato: gravidade === 'critica' || gravidade === 'alta',
  };
}

/** Rótulo legível para o painel. */
export const ROTULO_CATEGORIA: Record<CategoriaModeracao, string> = {
  ameaca: 'Ameaça',
  sexual: 'Conteúdo sexual',
  aliciamento: 'Possível aliciamento',
  discriminacao: 'Discriminação',
  autolesao: 'Sinal de autolesão',
  drogas: 'Drogas',
  assedio: 'Ofensa direcionada',
  palavrao: 'Palavrão',
};

export const ROTULO_GRAVIDADE: Record<GravidadeModeracao, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

/** Corta a mensagem para caber na notificação sem virar um parágrafo. */
export function trechoParaAlerta(texto: string, max = 140): string {
  const t = texto.trim().replace(/\s+/g, ' ');
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}
