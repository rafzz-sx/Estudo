import Link from "next/link";
import { BatBrand } from "@/components/BatLogo";

/**
 * Política de Privacidade — versão 2.1.0
 *
 * A versão anterior (1.1.0) descrevia uma plataforma que já não existe: não
 * mencionava foto de perfil e banner, música, vídeo-aulas do YouTube,
 * coleta de feedback, contagem de tempo de uso, moderação de contas nem o
 * fato de que boa parte do público tem menos de 18 anos (EPCAR aceita a
 * partir dos 14; Colégio Naval, dos 15).
 *
 * Declarar coleta que não acontece é tão ruim quanto omitir a que acontece:
 * cada item abaixo corresponde a uma tabela ou coluna que existe de fato.
 */

export const metadata = {
  title: "Política de Privacidade | BatCaverna Concursos Militares",
  description:
    "Como a BatCaverna coleta, usa e protege os dados dos estudantes, em conformidade com a LGPD.",
};

const ATUALIZADO_EM = "Setembro de 2026";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-bat-bg px-4 py-12 text-bat-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* ═══ Cabeçalho ═══ */}
        <div className="space-y-4 border-b border-bat-border pb-8 text-center">
          <Link href="/" className="mb-2 inline-block no-underline">
            <BatBrand iconSize={40} textSize="text-2xl" />
          </Link>
          <h1 className="heading text-3xl font-bold text-bat-text sm:text-4xl">
            Política de Privacidade
          </h1>
          <p className="text-sm text-bat-text-muted">
            Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) · Versão
            2.1.0 · Atualizada em {ATUALIZADO_EM}
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-bat-border bg-bat-bg-card p-6 text-sm leading-relaxed text-bat-text-secondary shadow-2xl sm:p-10">
          {/* ─── 1 ─── */}
          <Secao numero={1} titulo="Em uma frase">
            <p>
              A BatCaverna guarda o que você estuda para te devolver isso em
              forma de estatística, ranking e recomendação.{" "}
              <strong className="text-bat-text">
                Não vendemos, não alugamos e não compartilhamos seus dados com
                anunciantes
              </strong>{" "}
              — nem temos anúncios.
            </p>
          </Secao>

          {/* ─── 2 ─── */}
          <Secao numero={2} titulo="Dados que coletamos, e por quê">
            <p className="mb-3">
              Cada item abaixo corresponde a algo que a plataforma realmente
              guarda. Nada aqui é genérico:
            </p>

            <Grupo titulo="Cadastro">
              <li>Nome, e-mail, apelido público e data de nascimento</li>
              <li>Senha — armazenada apenas como hash irreversível</li>
              <li>
                <strong>Foto de perfil e banner</strong>, quando você envia.
                Ficam no nosso banco de dados, associados à sua conta
              </li>
              <li>Bio e concursos favoritados</li>
            </Grupo>

            <Grupo titulo="Estudo e desempenho">
              <li>
                Cada questão respondida: alternativa marcada, acerto ou erro,
                tempo gasto e o combo no momento
              </li>
              <li>
                Tempo de estudo cronometrado, XP, nível, sequência de dias
                (streak) e insígnias
              </li>
              <li>Simulados feitos, com nota e desempenho por matéria</li>
              <li>
                Caderno de erros, fila de revisão espaçada e planos de estudo
                que você criar
              </li>
              <li>Teoria e vídeo-aulas marcadas como concluídas</li>
            </Grupo>

            <Grupo titulo="Convivência">
              <li>Mensagens do chat com amigos e pedidos de amizade</li>
              <li>Tickets de suporte e as respostas trocadas</li>
              <li>Histórico de apelidos anteriores</li>
              <li>Músicas favoritadas e playlists que você montar</li>
            </Grupo>

            <Grupo titulo="Uso da plataforma">
              <li>
                <strong>Tempo total acumulado de uso</strong> — é ele que
                dispara o convite de feedback ao cruzar 1 h e 3 h
              </li>
              <li>Data do último acesso e quando a sessão automática expira</li>
              <li>
                O feedback que você enviar (opinião, bug ou ideia), com a nota
                dada
              </li>
            </Grupo>
          </Secao>

          {/* ─── 3 ─── */}
          <Secao numero={3} titulo="O que fica visível para outras pessoas">
            <p className="mb-3">
              A maior parte dos seus dados é privada. O que aparece para outros
              estudantes é só isto:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-bat-text">
              <li>
                Apelido, foto, banner, nível e patente — no ranking e no
                mini-perfil
              </li>
              <li>
                As insígnias que <strong>você escolher</strong> exibir no
                mini-perfil
              </li>
              <li>Concursos favoritados e a matéria que você mais estuda</li>
              <li>Tempo de estudo e acertos, quando você aparece no ranking</li>
            </ul>
            <p className="mt-3 rounded-xl border border-bat-gold-400/25 bg-bat-gold-400/10 px-4 py-2.5 text-bat-text">
              🔒 Você pode <strong>sair do ranking</strong> a qualquer momento
              em <Link href="/perfil" className="text-bat-gold-400">Perfil → Privacidade</Link>. Suas
              estatísticas continuam suas; apenas deixam de ser públicas.
            </p>
            <p className="mt-3">
              Suas mensagens de chat <strong>não são públicas</strong>, mas
              podem ser lidas pela administração em caso de denúncia de abuso —
              é o que nos permite manter a comunidade segura, especialmente por
              haver menores de idade na plataforma.
            </p>
          </Secao>

          {/* ─── 4 ─── */}
          <Secao numero={4} titulo="Estudantes menores de 18 anos">
            <p>
              A BatCaverna prepara para concursos que aceitam adolescentes: a{" "}
              <strong>EPCAR</strong> a partir dos 14 anos e o{" "}
              <strong>Colégio Naval</strong> a partir dos 15. Por isso:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-bat-text">
              <li>
                O cadastro de menor de 16 anos deve ser feito{" "}
                <strong>com o consentimento de um responsável legal</strong>,
                conforme o art. 14 da LGPD
              </li>
              <li>
                Tratamos os dados de crianças e adolescentes sempre no melhor
                interesse deles, e nunca para publicidade dirigida
              </li>
              <li>
                O responsável pode pedir acesso, correção ou exclusão dos dados
                do menor pelo e-mail no fim desta página
              </li>
              <li>
                Se identificarmos conta de menor de 14 anos, ela é suspensa até
                que o responsável se manifeste
              </li>
            </ul>
          </Secao>

          {/* ─── 5 ─── */}
          <Secao numero={5} titulo="Serviços de terceiros">
            <p className="mb-3">
              A plataforma usa poucos serviços externos, e você merece saber
              exatamente quais:
            </p>
            <div className="overflow-x-auto rounded-xl border border-bat-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-bat-bg-secondary text-bat-text-muted">
                  <tr>
                    <th className="px-4 py-2.5">Serviço</th>
                    <th className="px-4 py-2.5">Para quê</th>
                    <th className="px-4 py-2.5">O que ele recebe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bat-border/40 text-bat-text">
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Supabase</td>
                    <td className="px-4 py-2.5">Banco de dados</td>
                    <td className="px-4 py-2.5">Todos os dados acima</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Vercel</td>
                    <td className="px-4 py-2.5">Hospedagem</td>
                    <td className="px-4 py-2.5">
                      IP e dados técnicos da requisição
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">YouTube</td>
                    <td className="px-4 py-2.5">Vídeo-aulas embutidas</td>
                    <td className="px-4 py-2.5">
                      Só ao apertar o play. Usamos o domínio{" "}
                      <code className="text-bat-gold-400">
                        youtube-nocookie
                      </code>
                      , que não rastreia antes disso
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Internet Archive</td>
                    <td className="px-4 py-2.5">
                      Acervo de música em domínio público
                    </td>
                    <td className="px-4 py-2.5">
                      Seu IP, ao tocar uma faixa
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs">
              Não usamos Google Analytics, pixel de rede social, rastreador de
              publicidade nem cookie de terceiro para perfilamento.
            </p>
          </Secao>

          {/* ─── 6 ─── */}
          <Secao numero={6} titulo="Cookies e armazenamento local">
            <p>Guardamos no seu navegador apenas o necessário para funcionar:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-bat-text">
              <li>
                <code className="text-bat-gold-400">bat_access_token</code> e{" "}
                <code className="text-bat-gold-400">bat_refresh_token</code> —
                mantêm você logado. São cookies{" "}
                <strong>HTTP-only e seguros</strong>: nem o JavaScript da
                própria página consegue lê-los
              </li>
              <li>
                Preferências locais — cronômetro em andamento, volume e faixa da
                música. Ficam só no seu aparelho
              </li>
            </ul>
            <p className="mt-2 text-xs">
              Nenhum cookie de publicidade ou de rastreamento entre sites.
            </p>
          </Secao>

          {/* ─── 7 ─── */}
          <Secao numero={7} titulo="Segurança">
            <ul className="list-disc space-y-1 pl-5 text-bat-text">
              <li>
                Senhas passam por hash criptográfico irreversível — nem a
                administração consegue lê-las
              </li>
              <li>Todo o tráfego roda sob HTTPS com TLS</li>
              <li>
                Sessão por JWT com validade limitada e renovação controlada;
                suspender uma conta derruba a sessão na hora
              </li>
              <li>
                Row Level Security ativo no banco: uma conta não alcança os
                dados de outra
              </li>
              <li>
                Toda ação administrativa fica registrada em log de auditoria,
                com autor, alvo e data
              </li>
            </ul>
          </Secao>

          {/* ─── 8 ─── */}
          <Secao numero={8} titulo="Por quanto tempo guardamos">
            <ul className="list-disc space-y-1 pl-5 text-bat-text">
              <li>
                <strong>Enquanto sua conta existir</strong>: cadastro,
                desempenho e conteúdo que você criou
              </li>
              <li>
                <strong>Até você apagar</strong>: notificações — a caixa é sua e
                pode ser esvaziada quando quiser
              </li>
              <li>
                <strong>Após a exclusão da conta</strong>: seus dados pessoais
                são removidos. Estatísticas agregadas e anônimas (por exemplo,
                &quot;72% dos alunos acertaram esta questão&quot;) permanecem,
                pois já não identificam ninguém
              </li>
            </ul>
          </Secao>

          {/* ─── 9 ─── */}
          <Secao numero={9} titulo="Seus direitos e como exercê-los">
            <p className="mb-3">
              A LGPD te dá direito a confirmação, acesso, correção,
              portabilidade, anonimização e exclusão dos seus dados, além de
              revogar consentimento. Na prática:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-bat-text">
              <li>
                <strong>Ver e corrigir</strong> — direto em{" "}
                <Link href="/perfil" className="text-bat-gold-400">
                  Perfil
                </Link>
              </li>
              <li>
                <strong>Sair do ranking</strong> — Perfil → Privacidade
              </li>
              <li>
                <strong>Exportar ou apagar tudo</strong> — abra um chamado em{" "}
                <Link href="/tickets" className="text-bat-gold-400">
                  Suporte
                </Link>{" "}
                ou escreva para o endereço abaixo. Respondemos em até 15 dias
              </li>
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-bat-gold-400/30 bg-bat-bg-primary p-4">
              <div>
                <p className="font-mono font-bold text-bat-gold-400">
                  raf4biel.venafro@gmail.com
                </p>
                <p className="mt-0.5 text-xs text-bat-text-muted">
                  Encarregado de Proteção de Dados (DPO)
                </p>
              </div>
              <span className="badge-admin">DPO BATCAVERNA</span>
            </div>
          </Secao>

          {/* ─── 10 ─── */}
          <Secao numero={10} titulo="Mudanças nesta política">
            <p>
              Quando esta política mudar de forma relevante, você recebe um
              aviso dentro da plataforma — na caixa de notificações, não só uma
              linha nova aqui. A versão e a data no topo desta página dizem
              sempre qual texto está valendo.
            </p>
          </Secao>
        </div>

        {/* ═══ Rodapé ═══ */}
        <div className="flex flex-wrap justify-center gap-4 text-center">
          <Link
            href="/termos"
            className="text-sm text-bat-text-muted transition-colors hover:text-bat-gold-400"
          >
            Termos de Uso
          </Link>
          <Link
            href="/contato"
            className="text-sm text-bat-text-muted transition-colors hover:text-bat-gold-400"
          >
            Contato
          </Link>
          <Link
            href="/"
            className="text-sm text-bat-purple-400 transition-colors hover:text-bat-purple-300"
          >
            ← Página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Auxiliares de layout ────────────────────────────────────
function Secao({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`space-y-3 ${
        numero > 1 ? "border-t border-bat-border/50 pt-6" : ""
      }`}
    >
      <h2 className="heading flex items-center gap-2 text-lg font-bold text-bat-gold-400">
        <span>{numero}.</span> {titulo}
      </h2>
      {children}
    </section>
  );
}

function Grupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-bat-text-secondary">
        {titulo}
      </p>
      <ul className="list-disc space-y-1 pl-5 text-bat-text">{children}</ul>
    </div>
  );
}
