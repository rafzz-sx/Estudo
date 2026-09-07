import AppShell from "@/components/AppShell";

/**
 * Layout ÚNICO de toda a área logada.
 *
 * Antes, cada rota privada (dashboard, questoes, perfil, ...) tinha o próprio
 * `layout.tsx` fazendo `<AppShell>{children}</AppShell>`. Eram 14 segmentos
 * irmãos — e, no App Router, navegar de `/questoes` para `/dashboard`
 * desmonta o layout de um e monta o do outro. O AppShell inteiro era
 * destruído e recriado a cada clique no menu, e com ele tudo que ele
 * carrega:
 *
 *   • o acumulador de tempo de uso do ConviteFeedback (um useRef) voltava a
 *     zero — quem navegava a cada menos de 5 minutos nunca tinha o tempo
 *     contabilizado, e os convites de feedback de 1h/3h nunca disparavam;
 *   • /api/usuarios/me e /api/revisoes eram refeitos a cada navegação;
 *   • o Dynamic Island recalculava as cores da capa (canvas + imagem);
 *   • e é a causa raiz do bug original de "responder questões e, ao sair
 *     da área, tudo voltar ao estado inicial" — o XP foi salvo movendo o
 *     cálculo para o servidor, mas a arquitetura que perdia o estado
 *     continuou aqui.
 *
 * O route group `(privado)` não aparece na URL: `/dashboard` continua sendo
 * `/dashboard`. O que muda é que agora existe UM AppShell, montado uma vez,
 * e as páginas trocam dentro dele.
 *
 * As páginas públicas (/, /auth, /contato, /privacidade, /termos) ficam fora
 * do grupo de propósito: não têm sidebar nem exigem login.
 */
export default function PrivadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
