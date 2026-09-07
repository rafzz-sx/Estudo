# 🦇 BatCaverna — Web Application (`@batcaverna/web`)

Aplicação Web principal da plataforma BatCaverna, construída com **Next.js 16 (App Router)**, **React 19** e **Tailwind CSS v4**.

---

## ⚡ Tecnologias Utilizadas

- **Next.js 16.3+** com Turbopack
- **React 19**
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Zustand 5** — três stores: autenticação, sessão de estudo e player de música
- **jose** (validação e geração de tokens JWT seguros)
- **@supabase/supabase-js** (cliente de banco de dados PostgreSQL)

> [!NOTE]
> `recharts`, `lucide-react` e `framer-motion` constam no `package.json` e
> **não são importadas em nenhum arquivo** (verificado em 07/09/2026). Os
> gráficos da plataforma são SVG escrito à mão. Os ícones são emoji.

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
│   ├── estudo/                  # RadarFraqueza, GraficoEvolucao, HistoricoSimulados, TreinoTaf
│   ├── questoes/                # ComboBadge, Distratores, QuadroFigura, ResolucaoGabarito
│   ├── admin/                   # Painéis do admin (moderação, saúde, importação, avisos…)
│   ├── DynamicIsland.tsx        # Player flutuante de música, presente em toda a plataforma
│   ├── StudySessionWidget.tsx   # Widget de tempo real da sessão de estudo e heartbeat
│   ├── NotificationCenter.tsx   # Sino e dropdown de notificações em tempo real
│   ├── MiniPerfilModal.tsx      # Modal com cartão de perfil público do soldado
│   └── AdicionarAmigoModal.tsx  # Busca e envio de solicitação de amizade
├── lib/
│   ├── auth.ts                  # JWT (`jose`), hash SHA-256 e validação de tokens
│   ├── supabase.ts              # Clientes Supabase (Server com Service Role e Browser com Anon)
│   ├── gamificacao.ts           # XP, combo, streak com escudo e badges — fonte da verdade
│   ├── diagnostico.ts           # Radar de fraqueza, evolução semanal e erros em aberto
│   ├── moderacao.ts             # Classificador das mensagens do chat (8 categorias)
│   ├── seguranca.ts             # Sanitização, limite de tentativas e validação de upload
│   ├── revisao-espacada.ts      # Agendamento da repetição espaçada
│   ├── contagens.ts             # Contagens com `count: 'exact'` (teto de 1.000 do PostgREST)
│   ├── importador-questoes.ts   # Porte TS do parser, usado pelo painel de importação
│   └── validators.ts            # Esquemas de validação de dados
├── proxy.ts                     # Interceptor de rotas protegidas (era `middleware.ts`;
│                                #  o Next.js 16 renomeou arquivo e função)
└── stores/
    ├── auth-store.ts            # Usuário, tokens e helper `fetchWithAuth`
    ├── study-session-store.ts   # Timer de estudo ativo e heartbeats
    └── player-store.ts          # Player de música, com <audio> singleton fora do React
```

> [!WARNING]
> **`components/StudySessionWidget.tsx` exporta `StudySessionTracker` — o
> componente que dispara `initSession`, o tick de 1 segundo e o heartbeat de
> 30 segundos — e ele não é montado em lugar nenhum** (verificado em
> 07/09/2026). Só `StudySessionBadge` (o visor) é usado, pelo `AppShell`.
> Enquanto isso não for corrigido, o cronômetro não corre, o tempo de estudo
> não é gravado e o ranking por tempo de estudo fica vazio.

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
5. **Cada rota privada tem o próprio `layout.tsx` montando um `AppShell`.**
   São segmentos irmãos: navegar de `/questoes` para `/dashboard` **desmonta
   e remonta o AppShell inteiro**, junto com tudo que ele carrega. Qualquer
   estado que precise sobreviver à navegação tem de morar num store Zustand
   ou no servidor — nunca num `useState`/`useRef` de componente montado pelo
   AppShell.
6. **Sem Node instalado?** Rode as checagens em `scripts/checar_*.py`. Elas
   pegam import quebrado, coluna inexistente no schema, classe de Tailwind
   sem token e identificador não declarado — a classe de erro que o
   TypeScript veria mas que só aparece no deploy.

Para a documentação completa da plataforma, veja o [README Principal da BatCaverna](../../README.md).
