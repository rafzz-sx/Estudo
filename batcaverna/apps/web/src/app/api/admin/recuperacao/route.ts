import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest, gerarCodigosRecuperacaoAdmin, hashToken } from '@/lib/auth';
import { aplicarLimite } from '@/lib/seguranca';

async function verificarAdmin(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user || user.role !== 'admin') return null;
  return user;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/admin/recuperacao — Status dos códigos de contingência
// ═══════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    const admin = await verificarAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });
    }

    const supabase = createServerSupabaseClient();
    const { data: codigos, error } = await supabase
      .from('admin_recovery_codes')
      .select('id, usado, criado_em, usado_em')
      .eq('admin_id', admin.id);

    if (error) {
      // Se a tabela ainda não existir no Supabase, responde graciosamente
      return NextResponse.json({
        success: true,
        data: { total: 0, disponiveis: 0, usados: 0, aviso: 'Tabela de códigos ainda não inicializada.' },
      });
    }

    const total = codigos?.length || 0;
    const usados = codigos?.filter((c: any) => c.usado)?.length || 0;
    const disponiveis = total - usados;

    return NextResponse.json({
      success: true,
      data: {
        total,
        disponiveis,
        usados,
        ultimo_gerado_em: codigos?.[0]?.criado_em || null,
      },
    });
  } catch (error: any) {
    console.error('GET /api/admin/recuperacao error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// POST /api/admin/recuperacao — Gerar novos códigos de contingência
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const bloqueio = aplicarLimite(req, 'admin-gerar-rec-codes', 5, 300);
    if (bloqueio) return bloqueio;

    const admin = await verificarAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Invalida códigos anteriores
    try {
      await supabase
        .from('admin_recovery_codes')
        .update({ usado: true })
        .eq('admin_id', admin.id)
        .eq('usado', false);
    } catch (_) {}

    // 2. Gera novo lote de 8 códigos
    const codigosNovos = gerarCodigosRecuperacaoAdmin(8);
    const registrosParaSalvar = [];

    for (const cod of codigosNovos) {
      const hash = await hashToken(cod);
      registrosParaSalvar.push({
        admin_id: admin.id,
        codigo_hash: hash,
        usado: false,
      });
    }

    const { error: insErr } = await supabase
      .from('admin_recovery_codes')
      .insert(registrosParaSalvar);

    if (insErr) {
      console.error('Erro ao salvar códigos de contingência:', insErr);
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao registrar códigos no banco de dados. Verifique se a migration 034 foi aplicada.',
        },
        { status: 500 }
      );
    }

    // 3. Registrar na auditoria
    try {
      await supabase.from('admin_audit_log').insert({
        admin_id: admin.id,
        acao: 'gerou_novos_codigos_contingencia',
        entidade_afetada: 'admin_recovery_codes',
        entidade_id: admin.id,
        detalhes: { quantidade: 8, data: new Date().toISOString() },
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      data: {
        codigos: codigosNovos,
      },
      message: '✅ 8 novos códigos de contingência gerados! Guarde-os em local seguro agora, eles não serão exibidos novamente.',
    });
  } catch (error: any) {
    console.error('POST /api/admin/recuperacao error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}
