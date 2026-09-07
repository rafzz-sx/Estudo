import { NextRequest, NextResponse } from 'next/server';
import { aplicarLimite } from '@/lib/seguranca';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  hashToken,
  hashSenha,
  getResetTokenExpiry,
  MINUTOS_DO_CODIGO,
} from '@/lib/auth';
import {
  enviarEmail,
  modeloCodigoDeSenha,
  temProvedorDeEmail,
} from '@/lib/email';
import { isStrongPassword } from '@/lib/validators';

function getSupabase() {
  return createServerSupabaseClient();
}

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/recuperar — Solicitar recuperação de senha
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    // 4 pedidos a cada 15 min: recuperacao de senha e o alvo classico
    // de quem quer descobrir quais e-mails existem na base.
    const bloqueio = aplicarLimite(req, 'recuperar', 4, 900);
    if (bloqueio) return bloqueio;

    const body = await req.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'E-mail é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Buscar usuário pelo e-mail
    const { data: user } = await supabase
      .from('users')
      .select('id, nome, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    // Sempre retorna sucesso por segurança (evita enumerar e-mails)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.',
      });
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await hashToken(code);

    // Pedir um código novo invalida os anteriores.
    //
    // Antes, cada pedido só INSERIA. Com o limite de 4 pedidos a cada 15
    // minutos e a validade de 24 h que este código herdava da verificação de
    // e-mail, uma conta podia acumular dezenas de códigos válidos ao mesmo
    // tempo — cada um deles abrindo a conta. Quem pede um código novo está
    // dizendo que o anterior não serve mais.
    await supabase
      .from('email_verification_tokens')
      .update({ usado: true })
      .eq('user_id', user.id)
      .eq('usado', false)
      .like('token', 'reset_%');

    // Salvar token de recuperação na tabela email_verification_tokens
    // Reutilizamos a tabela existente com um prefixo para distinguir
    await supabase.from('email_verification_tokens').insert({
      user_id: user.id,
      token: `reset_${codeHash}`,
      // 30 minutos, não as 24 h da verificação de e-mail: este código troca
      // a senha, aquele só confirma um endereço.
      expira_em: getResetTokenExpiry().toISOString(),
      usado: false,
    });

    // ─── Entrega do código ────────────────────────────────────
    //
    // ATENÇÃO: este endpoint devolvia `_dev_code` com o código de
    // redefinição DENTRO DA RESPOSTA, para qualquer um que chamasse. Bastava
    // saber o e-mail de alguém para pedir a recuperação, ler o código na
    // resposta e trocar a senha da conta alheia — tomada de conta completa,
    // sem nenhuma barreira.
    //
    // O código agora só sai da API fora de produção, e mesmo assim apenas
    // quando não há provedor de e-mail configurado. Havendo provedor, ele vai
    // por e-mail e mais nada — o log só recebe o código quando o envio falha,
    // para o administrador conseguir socorrer quem pediu.
    const emProducao = process.env.NODE_ENV === 'production';
    const temProvedor = temProvedorDeEmail();
    let entregue = false;

    if (temProvedor) {
      const modelo = modeloCodigoDeSenha(code, MINUTOS_DO_CODIGO);
      const envio = await enviarEmail({
        para: user.email,
        assunto: modelo.assunto,
        html: modelo.html,
        texto: modelo.texto,
      });
      entregue = envio.ok;

      if (!envio.ok) {
        // Provedor configurado mas o envio falhou (cota, domínio que deixou
        // de estar verificado, rede). O código continua no log para o
        // administrador conseguir socorrer quem pediu, e a tela NÃO avança:
        // mandar a pessoa digitar um código que não saiu daqui é o mesmo
        // beco sem saída de quando não havia provedor nenhum.
        console.log(`[RECUPERAÇÃO] Código para ${email}: ${code}`);
      }
    } else {
      // Sem provedor: o código fica no log do servidor, ao qual só o
      // administrador tem acesso.
      console.log(`[RECUPERAÇÃO] Código para ${email}: ${code}`);
    }

    // `codigo_enviado` diz à tela se existe um código A CAMINHO das mãos de
    // quem pediu: em produção, só se o e-mail saiu; fora dela, sempre, porque
    // o código volta na própria resposta.
    //
    // Sem este campo a tela não tinha como saber, e avançava sempre para o
    // passo do código. Em produção sem provedor, o resultado era o pior tipo
    // de erro: "recuperação por e-mail ainda não está ativa" aparecia com ✓
    // verde de sucesso, logo acima de um formulário pedindo "o código de 6
    // dígitos enviado para seu e-mail". A pessoa ficava presa num campo que
    // nunca ia aceitar nada.
    const codigoEnviado = entregue || !emProducao;

    return NextResponse.json({
      success: true,
      codigo_enviado: codigoEnviado,
      message: codigoEnviado
        ? 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.'
        : temProvedor
          ? 'Não consegui enviar o e-mail agora. Tente de novo em alguns ' +
            'minutos ou fale com a gente pela página de Contato.'
          : 'Recuperação por e-mail ainda não está ativa nesta instalação. ' +
            'Fale com a gente pela página de Contato para redefinir sua senha. ' +
            // /contato, e não /tickets: quem esqueceu a senha não consegue
            // entrar, e a tela de chamados fica atrás do login.
            'A página de contato não exige login.',
      // Só em desenvolvimento, e só quando não há como enviar o e-mail.
      ...(!emProducao && !temProvedor ? { _dev_code: code } : {}),
    });

  } catch (error: any) {
    console.error('Recovery error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// PUT /api/auth/recuperar — Redefinir senha com código
// ═══════════════════════════════════════════════════════════════
export async function PUT(req: NextRequest) {
  try {
    // O codigo tem 6 digitos: sao so 1 milhao de combinacoes. Sem
    // limite, um script acerta em minutos e troca a senha de qualquer
    // conta. 10 tentativas a cada 15 min por IP fecha essa porta.
    const bloqueio = aplicarLimite(req, 'redefinir-senha', 10, 900);
    if (bloqueio) return bloqueio;

    const body = await req.json();
    const { email, code, nova_senha } = body;

    if (!email?.trim() || !code?.trim() || !nova_senha) {
      return NextResponse.json(
        { success: false, error: 'E-mail, código e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar nova senha. A regra sai de `@batcaverna/utils`, a mesma que o
    // cadastro usa — estas quatro condições estavam reescritas aqui à mão, e
    // uma senha aceita no cadastro podia ser recusada na recuperação (ou o
    // contrário) no dia em que alguém mexesse só num dos lados.
    const forca = isStrongPassword(nova_senha);
    if (!forca.valid) {
      return NextResponse.json(
        { success: false, error: `A nova senha precisa de: ${forca.errors.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Buscar usuário
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Código inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar código
    const codeHash = await hashToken(code.trim());
    const { data: token } = await supabase
      .from('email_verification_tokens')
      .select('id, expira_em, usado')
      .eq('user_id', user.id)
      .eq('token', `reset_${codeHash}`)
      .eq('usado', false)
      .single();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Código inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar expiração
    if (new Date(token.expira_em) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Código expirado. Solicite um novo.' },
        { status: 400 }
      );
    }

    // Atualizar senha — sempre no formato novo (PBKDF2 com sal).
    // `hashToken` continua sendo usado neste arquivo para o código de
    // recuperação, que é aleatório e descartável: ali SHA-256 basta.
    const novaSenhaHash = await hashSenha(nova_senha);
    const { error: updateError } = await supabase
      .from('users')
      .update({ senha_hash: novaSenhaHash })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar senha' },
        { status: 500 }
      );
    }

    // Marcar token como usado
    await supabase
      .from('email_verification_tokens')
      .update({ usado: true })
      .eq('id', token.id);

    // Invalidar todos os refresh tokens do usuário (forçar re-login)
    await supabase
      .from('refresh_tokens')
      .delete()
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
