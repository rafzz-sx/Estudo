#!/usr/bin/env node

/**
 * ==============================================================================
 * 🦇 BatCaverna — Script de Resgate e Break-Glass do Administrador
 * ==============================================================================
 *
 * Este script é a chave mestra de contingência para o DONO da plataforma.
 * Conecta-se diretamente ao Supabase via chave de serviço (Service Role),
 * permitindo recuperar acesso imediato MESMO QUE:
 * - O serviço de e-mail (Gmail/SMTP/Resend) esteja fora do ar ou não configurado.
 * - O administrador tenha esquecido totalmente a sua senha.
 * - A conta esteja bloqueada por excesso de tentativas incorretas.
 * - O site esteja indisponível.
 *
 * USO:
 *   npm run admin:rescue
 * ou:
 *   node scripts/admin-rescue.js
 * ou via argumentos diretos:
 *   node scripts/admin-rescue.js --reset --email admin@gmail.com --password "NovaSenha123!"
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

// ─── 1. Carregar Variáveis de Ambiente ─────────────────────────
function carregarEnv() {
  const envPaths = [
    path.resolve(__dirname, '../apps/web/.env.local'),
    path.resolve(__dirname, '../apps/web/.env'),
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../.env'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const conteudo = fs.readFileSync(envPath, 'utf-8');
      const linhas = conteudo.split('\n');
      for (const linha of linhas) {
        const m = linha.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].trim().replace(/^['"](.*)['"]$/, '$1');
        }
      }
    }
  }
}

carregarEnv();

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://bzrrbbaqzlfmertirbak.supabase.co';

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnJiYmFxemxmbWVydGlyYmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk1OTYzOCwiZXhwIjoyMTAzNTM1NjM4fQ.YfNFyyNHbjF9kYF48uNWchYvQuI_PGaIC-2LNE2UktE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── 2. Funções Criptográficas Compatíveis com Web Crypto ───────
const PBKDF2_ITERACOES = 210000;
const PBKDF2_BYTES = 32;

function hashSenhaNode(senha) {
  const sal = crypto.randomBytes(16);
  const derivado = crypto.pbkdf2Sync(
    senha,
    sal,
    PBKDF2_ITERACOES,
    PBKDF2_BYTES,
    'sha256'
  );
  return `pbkdf2$${PBKDF2_ITERACOES}$${sal.toString('hex')}$${derivado.toString('hex')}`;
}

function hashTokenSha256(texto) {
  return crypto.createHash('sha256').update(texto).digest('hex');
}

function validarForcaSenha(senha) {
  const erros = [];
  if (senha.length < 8) erros.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(senha)) erros.push('Pelo menos 1 letra maiúscula');
  if (!/[a-z]/.test(senha)) erros.push('Pelo menos 1 letra minúscula');
  if (!/[0-9]/.test(senha)) erros.push('Pelo menos 1 número');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) erros.push('Pelo menos 1 caractere especial');
  return { valido: erros.length === 0, erros };
}

function gerarCodigosContingencia(quantidade = 8) {
  const codigos = [];
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  for (let i = 0; i < quantidade; i++) {
    const bytes = crypto.randomBytes(8);
    let p1 = '';
    let p2 = '';
    for (let j = 0; j < 4; j++) p1 += chars[bytes[j] % chars.length];
    for (let j = 4; j < 8; j++) p2 += chars[bytes[j] % chars.length];
    codigos.push(`BAT-${p1}-${p2}`);
  }
  return codigos;
}

// ─── 3. Ações do Sistema ───────────────────────────────────────

async function listarAdmins() {
  console.log('\n🔍 Buscando administradores no banco de dados...');
  const { data: admins, error } = await supabase
    .from('users')
    .select('id, nome, apelido, email, role, bloqueado_ate, tentativas_login_falhas, criado_em')
    .eq('role', 'admin');

  if (error) {
    console.error('❌ Erro ao buscar admins:', error.message);
    return;
  }

  if (!admins || admins.length === 0) {
    console.log('⚠️ NENHUM ADMINISTRADOR ENCONTRADO NO BANCO DE DADOS!');
    return;
  }

  console.log('\n────────────────────────────────────────────────────────────');
  console.log(`📋 Total de administradores encontrados: ${admins.length}`);
  console.log('────────────────────────────────────────────────────────────');
  admins.forEach((admin, i) => {
    const bloqueado = admin.bloqueado_ate && new Date(admin.bloqueado_ate) > new Date();
    console.log(`[${i + 1}] ${admin.nome} (@${admin.apelido})`);
    console.log(`    E-mail:   ${admin.email}`);
    console.log(`    ID:       ${admin.id}`);
    console.log(`    Status:   ${bloqueado ? '🔴 BLOQUEADO TEMPORARIAMENTE' : '🟢 Ativo'}`);
    if (admin.tentativas_login_falhas > 0) {
      console.log(`    Falhas:   ${admin.tentativas_login_falhas} tentativas consecutivas`);
    }
  });
  console.log('────────────────────────────────────────────────────────────\n');
}

async function redefinirSenhaAdmin(email, novaSenha) {
  console.log(`\n⏳ Redefinindo senha para: ${email}...`);

  const forca = validarForcaSenha(novaSenha);
  if (!forca.valido) {
    console.error(`❌ A senha escolhida não atende aos requisitos de segurança:`);
    forca.erros.forEach(e => console.error(`   • ${e}`));
    return false;
  }

  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('id, nome, email, role')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (userErr || !user) {
    console.error(`❌ Usuário com o e-mail "${email}" não foi encontrado no banco.`);
    return false;
  }

  const novoHash = hashSenhaNode(novaSenha);

  const { error: updErr } = await supabase
    .from('users')
    .update({
      senha_hash: novoHash,
      tentativas_login_falhas: 0,
      bloqueado_ate: null,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updErr) {
    console.error(`❌ Erro ao atualizar senha no banco:`, updErr.message);
    return false;
  }

  // Revogar sessões antigas
  await supabase.from('refresh_tokens').delete().eq('user_id', user.id);

  // Registrar auditoria
  try {
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      acao: 'break_glass_redefinicao_senha_terminal',
      entidade_afetada: 'users',
      entidade_id: user.id,
      detalhes: { autor: 'terminal_cli', data: new Date().toISOString() },
    });
  } catch (_) {}

  console.log('\n============================================================');
  console.log('✅ SENHA REDEFINIDA COM SUCESSO!');
  console.log(`👤 Usuário:      ${user.nome} (${user.email})`);
  console.log(`🔑 Nova Senha:    [ATUALIZADA E HASH PBKDF2 REGISTRADO]`);
  console.log(`🛡️  Bloqueios:     Removidos e tentativas zeradas`);
  console.log(`🔄 Sessões:       Todas as sessões antigas foram revogadas`);
  console.log('👉 Você já pode abrir o navegador e fazer login imediatamente!');
  console.log('============================================================\n');
  return true;
}

async function desbloquearConta(email) {
  console.log(`\n⏳ Desbloqueando conta: ${email}...`);
  const { data: user, error } = await supabase
    .from('users')
    .select('id, nome, email')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !user) {
    console.error(`❌ Usuário com o e-mail "${email}" não encontrado.`);
    return;
  }

  await supabase
    .from('users')
    .update({ tentativas_login_falhas: 0, bloqueado_ate: null })
    .eq('id', user.id);

  console.log(`✅ Conta de ${user.nome} (${user.email}) foi DESBLOQUEADA com sucesso!\n`);
}

async function gerarNovosCodigosContingencia(email) {
  console.log(`\n⏳ Gerando códigos de contingência para: ${email}...`);
  const { data: user, error } = await supabase
    .from('users')
    .select('id, nome, email, role')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !user) {
    console.error(`❌ Usuário "${email}" não encontrado.`);
    return;
  }

  if (user.role !== 'admin') {
    console.error(`❌ O usuário "${email}" não possui papel de administrador.`);
    return;
  }

  const codigos = gerarCodigosContingencia(8);

  // Invalidar códigos antigos
  try {
    await supabase
      .from('admin_recovery_codes')
      .update({ usado: true })
      .eq('admin_id', user.id)
      .eq('usado', false);
  } catch (_) {}

  // Inserir novos códigos com hash
  const registros = codigos.map(cod => ({
    admin_id: user.id,
    codigo_hash: hashTokenSha256(cod),
    usado: false,
    criado_em: new Date().toISOString(),
  }));

  try {
    const { error: insErr } = await supabase.from('admin_recovery_codes').insert(registros);
    if (insErr) {
      console.warn('⚠️ Nota: A tabela admin_recovery_codes pode não existir ainda se a migration 034 não foi executada.');
      console.warn(`Detalhe: ${insErr.message}`);
    }
  } catch (e) {
    console.warn('⚠️ Falha ao salvar no banco:', e.message);
  }

  console.log('\n============================================================');
  console.log('🛡️  SEUS 8 CÓDIGOS DE CONTINGÊNCIA (RECOVERY CODES):');
  console.log('Guarde estes códigos em um local seguro (bloco de notas seguro, cofre de senhas):');
  console.log('Cada código é de USO ÚNICO para recuperar acesso à conta de administrador.');
  console.log('============================================================');
  codigos.forEach((cod, i) => {
    console.log(`  [${i + 1}] ${cod}`);
  });
  console.log('============================================================\n');
}

async function criarOuPromoverAdminBackup(email, nomeOpcional, senhaOpcional) {
  console.log(`\n⏳ Verificando status de: ${email}...`);
  const emailNorm = email.toLowerCase().trim();

  const { data: user } = await supabase
    .from('users')
    .select('id, nome, apelido, email, role')
    .eq('email', emailNorm)
    .single();

  if (user) {
    if (user.role === 'admin') {
      console.log(`ℹ️ O usuário ${user.nome} (${user.email}) JÁ É ADMINISTRADOR.`);
      return;
    }
    // Promover
    const { error: updErr } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id);

    if (updErr) {
      console.error('❌ Erro ao promover usuário:', updErr.message);
      return;
    }

    console.log(`\n🎉 SUCESSO! O usuário ${user.nome} (${user.email}) foi PROMOVIDO A ADMINISTRADOR!\n`);
  } else {
    // Criar nova conta
    if (!senhaOpcional) {
      console.error('❌ Para criar um novo administrador, informe também a senha.');
      return;
    }
    const forca = validarForcaSenha(senhaOpcional);
    if (!forca.valido) {
      console.error('❌ A senha não atende aos requisitos de segurança:');
      forca.erros.forEach(e => console.error(`   • ${e}`));
      return;
    }

    const apelido = emailNorm.split('@')[0].replace(/[^a-z0-9]/g, '').slice(0, 15) || 'admin2';
    const hash = hashSenhaNode(senhaOpcional);

    const { error: insErr } = await supabase.from('users').insert({
      nome: nomeOpcional || 'Admin Backup',
      apelido,
      email: emailNorm,
      senha_hash: hash,
      role: 'admin',
      email_verified: true,
    });

    if (insErr) {
      console.error('❌ Erro ao criar novo admin:', insErr.message);
      return;
    }

    console.log(`\n🎉 NOVO ADMINISTRADOR DE BACKUP CRIADO COM SUCESSO!`);
    console.log(`👤 Nome:   ${nomeOpcional || 'Admin Backup'}`);
    console.log(`📧 E-mail: ${emailNorm}`);
    console.log(`🔑 Senha:  [Configurada com sucesso]\n`);
  }
}

// ─── 4. Interface CLI / Menu Interativo ───────────────────────

function perguntar(rl, questao) {
  return new Promise(resolve => rl.question(questao, resolve));
}

async function menuInterativo() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n============================================================');
  console.log('🦇 BatCaverna — Central de Resgate do Administrador (Break-Glass)');
  console.log('============================================================');
  console.log('  [1] 📋 Listar Administradores Cadastrados');
  console.log('  [2] 🔑 Redefinir Senha do Administrador (Direto no Banco)');
  console.log('  [3] 🔓 Desbloquear Conta Travada por Tentativas');
  console.log('  [4] 🛡️  Gerar Códigos de Contingência (Recovery Codes)');
  console.log('  [5] 👥 Promover ou Criar Administrador de Backup');
  console.log('  [0] 🚪 Sair');
  console.log('------------------------------------------------------------');
  console.log('📖 GUIA DIDÁTICO — QUAL OPÇÃO ESCOLHER DE ACORDO COM A SUA NECESSIDADE?');
  console.log('------------------------------------------------------------');
  console.log('  • OPÇÃO 1 (Listar Administradores):');
  console.log('    Use para conferir quais contas possuem cargo de Admin,');
  console.log('    ver seus e-mails, apelidos e se alguma conta está bloqueada.');
  console.log('');
  console.log('  • OPÇÃO 2 (Redefinir Senha de Administrador):');
  console.log('    👉 ESCOLHA ESTA SE VOCÊ ESQUECEU SUA SENHA DE ADMIN!');
  console.log('    Troca a senha direto no banco Supabase em 2 segundos, zera');
  console.log('    bloqueios e NÃO depende de e-mail nenhum para funcionar.');
  console.log('');
  console.log('  • OPÇÃO 3 (Desbloquear Conta Travada):');
  console.log('    Use se você sabe a senha certa, mas errou 5 vezes seguidas e');
  console.log('    o sistema bloqueou seu acesso temporariamente por 15 minutos.');
  console.log('');
  console.log('  • OPÇÃO 4 (Gerar Códigos de Contingência):');
  console.log('    Gera 8 códigos de emergência (ex: BAT-7A9B-4C2D) para você');
  console.log('    anotar em local seguro. Permite recuperar o admin direto pelo');
  console.log('    site mesmo se estiver sem acesso ao terminal ou ao e-mail.');
  console.log('');
  console.log('  • OPÇÃO 5 (Admin de Backup):');
  console.log('    Cria um segundo admin ou promove uma conta de confiança,');
  console.log('    garantindo que o sistema nunca dependa de uma única pessoa.');
  console.log('');
  console.log('  • OPÇÃO 0 (Sair):');
  console.log('    Encerra a ferramenta sem realizar nenhuma alteração.');
  console.log('============================================================');

  const opcao = (await perguntar(rl, 'Escolha uma opção (0-5): ')).trim();

  switch (opcao) {
    case '1':
      await listarAdmins();
      break;

    case '2': {
      await listarAdmins();
      const email = (await perguntar(rl, 'Digite o e-mail do administrador: ')).trim();
      const senha = (await perguntar(rl, 'Digite a nova senha desejada: ')).trim();
      if (email && senha) {
        await redefinirSenhaAdmin(email, senha);
      } else {
        console.log('⚠️ Operação cancelada: e-mail e senha são obrigatórios.');
      }
      break;
    }

    case '3': {
      const email = (await perguntar(rl, 'Digite o e-mail para desbloquear: ')).trim();
      if (email) await desbloquearConta(email);
      break;
    }

    case '4': {
      const email = (await perguntar(rl, 'Digite o e-mail do administrador: ')).trim();
      if (email) await gerarNovosCodigosContingencia(email);
      break;
    }

    case '5': {
      const email = (await perguntar(rl, 'Digite o e-mail a ser promovido ou criado: ')).trim();
      const nome = (await perguntar(rl, 'Nome (caso precise criar conta nova): ')).trim();
      const senha = (await perguntar(rl, 'Senha (caso precise criar conta nova): ')).trim();
      if (email) await criarOuPromoverAdminBackup(email, nome, senha);
      break;
    }

    case '0':
    default:
      console.log('Encerrando.');
      break;
  }

  rl.close();
}

// ─── 5. Ponto de Entrada ───────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    await listarAdmins();
    return;
  }

  if (args.includes('--reset')) {
    const emailIdx = args.indexOf('--email');
    const passIdx = args.indexOf('--password');
    if (emailIdx !== -1 && passIdx !== -1 && args[emailIdx + 1] && args[passIdx + 1]) {
      await redefinirSenhaAdmin(args[emailIdx + 1], args[passIdx + 1]);
      return;
    }
  }

  if (args.includes('--unlock')) {
    const emailIdx = args.indexOf('--email');
    if (emailIdx !== -1 && args[emailIdx + 1]) {
      await desbloquearConta(args[emailIdx + 1]);
      return;
    }
  }

  if (args.includes('--codes')) {
    const emailIdx = args.indexOf('--email');
    if (emailIdx !== -1 && args[emailIdx + 1]) {
      await gerarNovosCodigosContingencia(args[emailIdx + 1]);
      return;
    }
  }

  // Sem argumentos específicos: abre o menu interativo
  await menuInterativo();
}

main().catch(err => {
  console.error('❌ Erro inesperado:', err);
  process.exit(1);
});
