# 🦇 BatCaverna — Web Application (`@batcaverna/web`)

Aplicação Web principal da plataforma BatCaverna, construída com **Next.js 16 (App Router)**, **React 19** e **Tailwind CSS v4**.

---

## ⚡ Tecnologias Utilizadas

- **Next.js 16.3+** com Turbopack
- **React 19**
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Zustand 5** — gerenciamento de estado global (autenticação, sessão de estudo e player de música)
- **jose** — validação e geração de tokens JWT seguros
- **@supabase/supabase-js** — cliente de banco de dados PostgreSQL
- **KaTeX** — renderização de expressões matemáticas em questões e gabaritos

---

## 📁 Estrutura de Pastas

```
apps/web/src/
├── app/
│   ├── api/                     # API Routes (Backend Next.js com service_role Supabase)
│   ├── auth/                    # Login, Cadastro, Recuperação de Senha (público)
│   ├── contato/                 # Formulário público → POST /api/contato
│   ├── novidades/               # Diário público de lançamentos da plataforma
│   ├── (privado)/               # ROUTE GROUP — um único layout.tsx com o AppShell
│   │   ├── dashboard/           #   "Plano de Hoje" e radar de fraquezas
│   │   ├── progresso/           #   histórico, evolução e simulados
│   │   ├── concursos/           #   catálogo de concursos + trilha por matérias e TAF
│   │   ├── questoes/            #   resolução interativa com filtros por assunto
│   │   ├── simulado/            #   prova cronometrada no peso da banca
│   │   ├── redacao/             #   temas militares, estrutura e guia de conectivos
│   │   ├── revisoes/ caderno/   #   repetição espaçada · caderno de erros
│   │   ├── cronograma/ musica/  #   plano de estudo · acervo de música clássica
│   │   ├── ranking/ chat/       #   hall da fama · conversas privadas
│   │   ├── tickets/ perfil/     #   suporte · perfil do estudante
│   │   └── admin/               #   painel administrativo confidencial
│   ├── layout.tsx               # Layout raiz com fontes e metadados
│   └── page.tsx                 # Landing page pública
├── components/
│   ├── AppShell.tsx             # Layout lateral padrão (Sidebar, Header, Notificações)
│   ├── DynamicIsland.tsx        # Player flutuante de música no topo da tela
│   ├── StudySessionWidget.tsx   # Widget e rastreador de tempo real da sessão de estudo
│   ├── NotificationCenter.tsx   # Dropdown de notificações em tempo real
│   ├── MiniPerfilModal.tsx      # Modal com cartão de perfil público do soldado
│   ├── GaleriaBadges.tsx        # Insígnias conquistadas e próximas metas
│   ├── estudo/                  # Componentes de métricas, radar e treino TAF
│   ├── questoes/                # Resolução interativa, gabaritos e KaTeX
│   ├── admin/                   # Módulos administrativos (moderação, saude, armazém)
│   └── novidades/               # Modal de atualizações recentes
├── lib/
│   ├── auth.ts                  # Autenticação JWT (`jose`) e hash PBKDF2 com sal
│   ├── supabase.ts              # Clientes Supabase (Server Service Role e Browser Anon)
│   ├── sessao-estudo.ts         # Regras de negócio da sessão e cálculo de continuidade
│   ├── gamificacao.ts           # XP, combos de acerto, patentes e badges
│   ├── distribuicao-prova.ts    # Pesos das matérias e metas oficiais de corte dos concursos
│   ├── moderacao.ts             # Filtros de moderação de conteúdo
│   └── seguranca.ts             # Sanitização e limites de tentativas
├── proxy.ts                     # Interceptor de rotas protegidas (Next.js proxy)
└── stores/
    ├── auth-store.ts            # Usuário, tokens e helper `fetchWithAuth`
    ├── study-session-store.ts   # Timer de estudo ativo e heartbeats
    └── player-store.ts          # Player singleton de áudio nativo
```

---

## 🚀 Como Rodar Localmente

Na pasta raiz do monorepo (`batcaverna/`):
```bash
npm run dev:web
```
Ou dentro desta pasta (`apps/web/`):
```bash
npm run dev
```

Acesse em: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Variáveis de Ambiente

Copie o `.env.example` para `.env.local` nesta pasta:
```bash
cp .env.example .env.local
```

Preencha as credenciais `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e `JWT_SECRET`.

---

## ⚠️ Regras Cruciais para Desenvolvedores Web

1. **Autenticação Customizada**: Não utilize `supabase.auth.*`. Toda autenticação passa pelas rotas `/api/auth/*`.
2. **Next.js 16 Dynamic Params**: Em rotas dinâmicas, sempre resolva `params` com `await params`:
   ```typescript
   export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
   }
   ```
3. **API Routes com Service Role**: Endpoints no servidor devem utilizar `createServerSupabaseClient()` para garantir execução com a chave de serviço.
4. **Chamadas Autenticadas no Frontend**: Use sempre `fetchWithAuth()` para rotas privadas — ele renova o token automaticamente sem deslogar o usuário.
5. **Route Group `app/(privado)/`**: Toda tela acessível após login deve pertencer a `(privado)/`. Não crie `layout.tsx` adicionais em subpastas privadas para preservar o estado do `AppShell` e da `DynamicIsland`.
6. **Segurança de Senhas**: As senhas são gravadas com PBKDF2-HMAC-SHA256 (210.000 iterações com sal exclusivo). Utilize sempre `hashSenha()` e `verificarSenha()`.
7. **Validação de Duração no Servidor**: O tempo reportado pelos heartbeats da sessão de estudo é estritamente validado e limitado no backend por `duracaoAceita()`, evitando injeção indevida de XP.
8. **Contagens Exatas no Banco**: Utilize contagens persistidas ou consultas com `count: 'exact'` para evitar o corte padrão de 1.000 linhas do PostgREST.

---

Para a documentação completa de toda a plataforma, consulte o [Manual Principal da BatCaverna](../../README.md).
