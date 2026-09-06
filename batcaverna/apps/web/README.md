# 🦇 BatCaverna — Web Application (`@batcaverna/web`)

Aplicação Web principal da plataforma BatCaverna, construída com **Next.js 16 (App Router)**, **React 19** e **Tailwind CSS v4**.

---

## ⚡ Tecnologias Utilizadas

- **Next.js 16.3+** com Turbopack
- **React 19**
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Zustand 5** (gerenciamento de estado de autenticação e sessões de estudo com persistência)
- **Recharts** (gráficos de desempenho e estatísticas de questões)
- **Lucide React** (iconografia moderna)
- **jose** (validação e geração de tokens JWT seguros)
- **@supabase/supabase-js** (cliente de banco de dados PostgreSQL)

---

## 📁 Estrutura de Pastas

```
apps/web/src/
├── app/
│   ├── api/                     # API Routes (Backend Next.js com service_role Supabase)
│   ├── auth/                    # Login, Cadastro, Recuperação de Senha
│   ├── dashboard/               # Painel principal do aluno (XP, streak, progresso)
│   ├── concursos/               # Catálogo de concursos e matérias
│   ├── questoes/                # Resolução interativa de questões
│   ├── simulado/                # Simulados cronometrados
│   ├── ranking/                 # Hall da Fama e líderes
│   ├── bizus/                   # Anotações táticas e resumos
│   ├── chat/                    # Chat privado entre soldados
│   ├── tickets/                 # Suporte ao usuário
│   ├── perfil/                  # Estatísticas, badges e edição de perfil
│   ├── admin/                   # Painel Administrativo e Armazém de questões
│   ├── layout.tsx               # Layout raiz com fontes e viewport
│   └── page.tsx                 # Landing page pública
├── components/
│   ├── AppShell.tsx             # Layout lateral padrão (Sidebar, Header, Notificações)
│   ├── StudySessionWidget.tsx   # Widget de tempo real da sessão de estudo e heartbeat
│   ├── NotificationCenter.tsx   # Sino e dropdown de notificações em tempo real
│   ├── MiniPerfilModal.tsx      # Modal com cartão de perfil público do soldado
│   └── AdicionarAmigoModal.tsx  # Busca e envio de solicitação de amizade
├── lib/
│   ├── auth.ts                  # Utilitários de JWT (`jose`), hash SHA-256 e validação de tokens
│   ├── supabase.ts              # Clientes Supabase (Server com Service Role e Browser com Anon)
│   └── validators.ts            # Esquemas de validação de dados
├── middleware.ts                # Interceptor de autenticação de rotas protegidas e admin
└── stores/
    ├── auth-store.ts            # Zustand store do usuário, tokens e helper `fetchWithAuth`
    └── study-session-store.ts   # Zustand store do timer de estudo ativo e heartbeats
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

Consulte a tabela completa de variáveis de ambiente no [Manual Geral do Monorepo](../../README.md#-variáveis-de-ambiente).

---

## ⚠️ Regras Cruciais para Desenvolvedores
1. **Autenticação**: O projeto usa autenticação customizada em `/api/auth/*`. Não use `supabase.auth.*`.
2. **Next.js 16 Dynamic Params**: Sempre resolva `params` com `await params` em rotas dinâmicas.
3. **API Routes**: Sempre utilize `createServerSupabaseClient()` para bypass de RLS seguro.
4. **Client Requests**: Sempre utilize o helper `fetchWithAuth()` para chamadas a rotas privadas.

Para a documentação completa da plataforma, veja o [README Principal da BatCaverna](../../README.md).
