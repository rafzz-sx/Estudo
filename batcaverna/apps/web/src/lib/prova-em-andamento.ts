/**
 * Prova em andamento, guardada no aparelho.
 *
 * Antes, todo o estado da prova vivia em `useState`: recarregar a página no
 * meio de um simulado de 60 questões perdia tudo, e o registro ficava órfão no
 * banco. O `beforeunload` avisava, mas não protege contra o navegador travar, a
 * bateria acabar ou — o caso mais comum no app — o Android matar a WebView em
 * segundo plano.
 *
 * O relógio NÃO é salvo: ele é recalculado a partir do `iniciado_em` que o
 * servidor devolveu. Fechar a aba e voltar não ganha tempo — igual à prova
 * real. Se o tempo já acabou quando a pessoa volta, a prova é entregue com as
 * respostas que ela tinha marcado.
 *
 * As questões vão sem gabarito (o servidor nunca o envia antes de finalizar),
 * então guardá-las localmente não abre brecha nenhuma.
 *
 * ─── Por que isto virou um módulo ───────────────────────────────────────────
 *
 * A primeira versão vivia dentro de `(privado)/simulado/page.tsx` e **não
 * guardava de quem era a prova**. O `localStorage` é do navegador, não da
 * conta, e o logout não apagava a chave. Num computador compartilhado — casa,
 * escola, cursinho — o aluno A começava a prova e saía; o aluno B entrava,
 * abria `/simulado` e caía DENTRO da prova de A, com as respostas de A
 * marcadas. E ficava preso: ao entregar, o servidor responde 404 (a rota
 * `finalizar` confere o dono, corretamente), mas a limpeza só acontecia quando
 * a mensagem continha "finalizado" — e a mensagem é "Simulado não encontrado".
 *
 * Agora a prova carrega o `userId`, `lerProvaSalva` recusa a que não for do
 * usuário atual, e o logout apaga a chave. O módulo separado é o que permite
 * ao `auth-store` limpar sem importar a página — e sem repetir o nome da chave
 * em dois lugares.
 */

const CHAVE_PROVA_ATIVA = 'batcaverna-simulado-em-andamento';

export interface QuestaoSalva {
  id: string;
  [k: string]: unknown;
}

export interface ProvaSalva {
  /** Dono da prova. Sem isto, a prova de um aluno reaparecia para o seguinte. */
  userId: string;
  simuladoId: string;
  questoes: QuestaoSalva[];
  respostas: Record<string, string>;
  /** Onde a pessoa parou. Sem isto, retomar devolvia sempre à questão 1. */
  indice: number;
  iniciadoEm: string;
  duracaoMinutos: number;
}

/**
 * Lê a prova guardada.
 *
 * Passando `userId`, devolve `null` quando a prova for de outra pessoa — e
 * apaga a cópia, que não serve para mais ninguém.
 */
export function lerProvaSalva(userId?: string | null): ProvaSalva | null {
  try {
    const bruto = localStorage.getItem(CHAVE_PROVA_ATIVA);
    if (!bruto) return null;

    const p = JSON.parse(bruto) as ProvaSalva;
    if (!p?.simuladoId || !Array.isArray(p.questoes) || !p.iniciadoEm) return null;

    // Prova de outra conta neste mesmo navegador. Também recusa a gravada
    // antes desta versão, que não tem `userId` — é o comportamento seguro.
    if (userId && p.userId !== userId) {
      apagarProvaSalva();
      return null;
    }

    return p;
  } catch {
    return null;
  }
}

export function gravarProvaSalva(p: ProvaSalva) {
  try {
    localStorage.setItem(CHAVE_PROVA_ATIVA, JSON.stringify(p));
  } catch {
    /* sem espaço ou modo privado: a prova segue só em memória */
  }
}

export function apagarProvaSalva() {
  try {
    localStorage.removeItem(CHAVE_PROVA_ATIVA);
  } catch {
    /* idem */
  }
}
