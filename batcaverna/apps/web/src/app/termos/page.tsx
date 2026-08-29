import Link from "next/link";
import { BatBrand } from "@/components/BatLogo";

export const metadata = {
  title: "Termos de Uso | BatCaverna Concursos Militares",
  description: "Termos e Condições Gerais de Uso da Plataforma BatCaverna Concursos.",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-bat-bg text-bat-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-4 border-b border-bat-border pb-8">
          <Link href="/" className="inline-block no-underline mb-2">
            <BatBrand iconSize={40} textSize="text-2xl" />
          </Link>
          <h1 className="heading text-3xl sm:text-4xl text-bat-text font-bold">
            Termos de Uso da Plataforma
          </h1>
          <p className="text-bat-text-muted text-sm">
            Última atualização: 29 de Agosto de 2026 · Versão 1.1.0
          </p>
        </div>

        {/* Conteúdo dos Termos */}
        <div className="space-y-6 text-sm leading-relaxed text-bat-text-secondary bg-bat-bg-card border border-bat-border rounded-2xl p-6 sm:p-10 shadow-2xl">
          
          <section className="space-y-3">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>1.</span> Aceitação dos Termos
            </h2>
            <p>
              Ao criar uma conta, navegar ou utilizar qualquer funcionalidade do aplicativo e site <strong>BatCaverna Concursos</strong>, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso e com a nossa Política de Privacidade. Caso não concorde com qualquer disposição aqui presente, solicitamos que não utilize a plataforma.
            </p>
          </section>

          <section className="space-y-3 border-t border-bat-border/50 pt-6">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>2.</span> Finalidade e Serviços da Plataforma
            </h2>
            <p>
              A <strong>BatCaverna</strong> é uma central preparatória tática para estudantes e candidatos a concursos públicos militares (como EEAR, ESA, EsPCEx, Colégio Naval, EPCAR, EAM, EFOMM, IME) e vestibulares nacionais (ENEM). Os serviços compreendem:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-bat-text">
              <li>Banco de questões comentadas e simulados com contagem de tempo.</li>
              <li>Macetes e resumos estratégicos (Bizus).</li>
              <li>Sistema de gamificação com Níveis (1 a 15), XP, Combo e Badges.</li>
              <li>Comunicação entre estudantes através de Chat e Esquadrões de Estudo.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-bat-border/50 pt-6">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>3.</span> Cadastro, Segurança da Conta e Apelidos
            </h2>
            <p>
              Para acessar as ferramentas de estudo, é necessário realizar cadastro fornecendo informações verídicas e um <strong>e-mail real e ativo</strong>. A utilização de e-mails descartáveis, temporários ou falsos é expressamente vedada por motivos de segurança e integridade do ranking.
            </p>
            <p>
              O <strong>Apelido (Nome de Guerra)</strong> escolhido deve ser respeitoso e único na plataforma. O usuário tem a liberdade de alterar seu apelido nas configurações de perfil, estando ciente de que o histórico de alterações anteriores é mantido para fins de auditoria e moderação contra fraudes.
            </p>
          </section>

          <section className="space-y-3 border-t border-bat-border/50 pt-6">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>4.</span> Conduta do Usuário e Moderação
            </h2>
            <p>É estritamente proibido:</p>
            <ul className="list-disc pl-5 space-y-1 text-bat-text">
              <li>Praticar qualquer tipo de assédio, preconceito, discurso de ódio ou ofensa em chats e tickets.</li>
              <li>Utilizar scripts, bots ou automações para manipular pontuações de XP ou respostas de simulados.</li>
              <li>Compartilhar credenciais de acesso com terceiros.</li>
            </ul>
            <p>
              O descumprimento destas regras sujeita a conta infratora a advertência, suspensão temporária ou exclusão definitiva sem aviso prévio.
            </p>
          </section>

          <section className="space-y-3 border-t border-bat-border/50 pt-6">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>5.</span> Propriedade Intelectual e Isenção de Vínculo
            </h2>
            <p>
              A marca <strong>BatCaverna</strong>, sua identidade visual, códigos-fonte e algoritmos são propriedade exclusiva dos desenvolvedores. As menções e logotipos de instituições militares e órgãos públicos têm caráter meramente informativo e pedagógico, não havendo qualquer afiliação oficial com as Forças Armadas, Ministério da Defesa ou bancas examinadoras.
            </p>
          </section>

          <section className="space-y-3 border-t border-bat-border/50 pt-6">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>6.</span> Contato e Suporte Oficial
            </h2>
            <p>
              Para dúvidas legais, reportes de vulnerabilidade ou solicitações de suporte, entre em contato diretamente com a administração da plataforma pelo e-mail oficial:
            </p>
            <div className="p-4 rounded-xl bg-bat-bg-primary border border-bat-gold-400/30 flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-bat-gold-400 font-bold">raf4biel.venafro@gmail.com</span>
              <span className="text-xs text-bat-text-muted">Administração Master BatCaverna</span>
            </div>
          </section>

        </div>

        {/* Rodapé da Página */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-bat-purple-400 hover:text-bat-purple-300 transition-colors"
          >
            <span>←</span>
            <span>Voltar para a Página Inicial</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
