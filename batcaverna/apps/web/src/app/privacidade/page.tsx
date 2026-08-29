import Link from "next/link";
import { BatBrand } from "@/components/BatLogo";

export const metadata = {
  title: "Política de Privacidade | BatCaverna Concursos Militares",
  description: "Política de Privacidade e Proteção de Dados Pessoais da Plataforma BatCaverna.",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-bat-bg text-bat-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-4 border-b border-bat-border pb-8">
          <Link href="/" className="inline-block no-underline mb-2">
            <BatBrand iconSize={40} textSize="text-2xl" />
          </Link>
          <h1 className="heading text-3xl sm:text-4xl text-bat-text font-bold">
            Política de Privacidade
          </h1>
          <p className="text-bat-text-muted text-sm">
            Conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) · Versão 1.1.0
          </p>
        </div>

        {/* Conteúdo */}
        <div className="space-y-6 text-sm leading-relaxed text-bat-text-secondary bg-bat-bg-card border border-bat-border rounded-2xl p-6 sm:p-10 shadow-2xl">
          
          <section className="space-y-3">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>1.</span> Compromisso com sua Privacidade
            </h2>
            <p>
              A <strong>BatCaverna Concursos</strong> valoriza a transparência e a segurança das informações de todos os seus estudantes e soldados. Esta política detalha de que maneira coletamos, armazenamos, tratamos e protegemos os seus dados pessoais durante sua jornada de estudos em nossos aplicativos e websites.
            </p>
          </section>

          <section className="space-y-3 border-t border-bat-border/50 pt-6">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>2.</span> Dados que Coletamos
            </h2>
            <p>Para prover uma experiência personalizada de estudos, coletamos:</p>
            <ul className="list-disc pl-5 space-y-1 text-bat-text">
              <li><strong>Informações de Cadastro:</strong> Nome completo, endereço de e-mail verificado, apelido de guerra público, data de nascimento e concursos militares de interesse.</li>
              <li><strong>Métricas de Aprendizado:</strong> Histórico de questões respondidas, percentual de acerto por matéria, tempo dedicado em sessões de estudo (cronômetro Pomodoro), simulados realizados e conquistas de gamificação (XP, Nível, Streak diário).</li>
              <li><strong>Interações na Plataforma:</strong> Mensagens enviadas em canais de chat, chamados de suporte (tickets) e histórico de apelidos anteriores.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-bat-border/50 pt-6">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>3.</span> Finalidade do Uso dos Dados
            </h2>
            <p>Os dados coletados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1 text-bat-text">
              <li>Gerar relatórios de desempenho, gráficos de evolução e recomendações de bizus personalizados.</li>
              <li>Calcular o Ranking semanal e geral da BatCaverna.</li>
              <li>Prevenir fraudes, criação de contas falsas (spam/bots) e garantir a integridade da comunidade.</li>
              <li>Responder chamados e tickets de suporte técnico abertos pelos alunos.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-bat-border/50 pt-6">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>4.</span> Segurança e Criptografia
            </h2>
            <p>
              Adotamos padrões rigorosos de segurança da informação:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-bat-text">
              <li>Senhas nunca são armazenadas em texto simples; todas passam por algoritmos de <em>hash</em> criptográfico irreversível.</li>
              <li>Comunicações entre o aplicativo e os servidores operam sob protocolo HTTPS seguro com criptografia TLS.</li>
              <li>Tokens de autenticação JWT com expiração periódica e controle de refresh seguro.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-bat-border/50 pt-6">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>5.</span> Compartilhamento e Terceiros
            </h2>
            <p>
              A <strong>BatCaverna não comercializa, não aluga e não compartilha seus dados pessoais</strong> com terceiros ou anunciantes. O tráfego de dados ocorre unicamente com nossos provedores de infraestrutura segura de nuvem (como Vercel e Supabase PostgreSQL).
            </p>
          </section>

          <section className="space-y-3 border-t border-bat-border/50 pt-6">
            <h2 className="heading text-lg text-bat-gold-400 font-bold flex items-center gap-2">
              <span>6.</span> Direitos do Titular (LGPD) e Contato do Encarregado
            </h2>
            <p>
              Você tem o direito de solicitar a confirmação, o acesso, a correção ou a exclusão definitiva de seus dados cadastrais a qualquer momento. Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato diretamente com o encarregado de dados da plataforma:
            </p>
            <div className="p-4 rounded-xl bg-bat-bg-primary border border-bat-gold-400/30 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-mono text-bat-gold-400 font-bold">raf4biel.venafro@gmail.com</p>
                <p className="text-xs text-bat-text-muted mt-0.5">Encarregado de Proteção de Dados & Administração</p>
              </div>
              <span className="badge-admin">DPO BATCAVERNA</span>
            </div>
          </section>

        </div>

        {/* Rodapé */}
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
