import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança.
 *
 * O arquivo estava vazio: a plataforma respondia sem nenhum header de
 * proteção. Cada um abaixo fecha um buraco concreto.
 */
const headersSeguranca = [
  {
    // Impede que o site seja carregado dentro de um <iframe> em outro
    // domínio. Sem isso, alguém monta uma página invisível por cima da
    // BatCaverna e captura os cliques do aluno (clickjacking).
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // O navegador para de "adivinhar" o tipo do arquivo. Sem isso, um
    // upload que finge ser imagem mas contém HTML pode ser executado.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Só permite HTTPS por 2 anos, inclusive em subdomínios. Elimina a
    // janela em que a primeira visita ainda vai por HTTP e pode ser
    // interceptada.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Ao clicar num link externo, o outro site não recebe o caminho da
    // página de origem — que pode conter identificadores.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Nenhuma página precisa de câmera, microfone, localização ou
    // pagamento. Negar por padrão evita que um script de terceiro peça.
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    // Impede que outro site abra a BatCaverna numa janela e mantenha
    // referência ao objeto `window` dela.
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    // A defesa principal contra XSS: diz de onde o navegador pode carregar
    // cada tipo de recurso. Qualquer script injetado por um atacante em
    // domínio não listado simplesmente não roda.
    //
    // 'unsafe-inline' e 'unsafe-eval' em script-src são exigência do
    // Next.js com Turbopack — sem eles a hidratação quebra. É o
    // compromisso conhecido de CSP em Next sem nonce por requisição.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      // i.ytimg.com = thumbnail das vídeo-aulas
      // data: e blob: = avatar e banner, que são gravados como data URL
      "img-src 'self' data: blob: https://i.ytimg.com https://*.supabase.co",
      "font-src 'self' data:",
      // archive.org = acervo de música em domínio público
      "media-src 'self' data: blob: https://archive.org https://*.archive.org",
      // youtube-nocookie = player das vídeo-aulas
      "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
      "connect-src 'self' https://*.supabase.co https://archive.org https://*.archive.org",
      // Ninguém pode embutir a BatCaverna; reforça o X-Frame-Options
      "frame-ancestors 'self'",
      // Bloqueia <base href> injetado, que sequestraria links relativos
      "base-uri 'self'",
      // Formulário só pode postar para o próprio site
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Não anuncia "X-Powered-By: Next.js" — não entrega a stack de graça.
  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  async headers() {
    return [
      {
        // Vale para tudo, inclusive as rotas de API.
        source: "/:path*",
        headers: headersSeguranca,
      },
      {
        // Resposta de API nunca deve ficar em cache de proxy: o conteúdo
        // é por usuário e vazaria para o próximo visitante.
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, private",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
