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
│   ├── auth/                    # Login, Cadastro, Recuperação de Senha (público)
│   ├── contato/                 # Formulário público → POST /api/contato
│   ├── (privado)/               # ROUTE GROUP — um único layout.tsx com o AppShell
│   │   ├── dashboard/           #   "Plano de Hoje"
│   │   ├── progresso/           #   histórico, evolução, simulados
│   │   ├── concursos/           #   catálogo + [sigla]/trilha·assuntos·estatisticas·taf
│   │   ├── questoes/            #   resolução interativa
│   │   ├── simulado/            #   prova cronometrada (persiste no aparelho)
│   │   ├── revisoes/ caderno/   #   repetição espaçada · caderno de erros
│   │   ├── cronograma/ musica/  #   plano de estudo · acervo de música
│   │   ├── ranking/ chat/       #   hall da fama · conversas
│   │   ├── tickets/ perfil/     #   suporte · perfil
│   │   └── admin/               #   painel administrativo
│   ├── layout.tsx               # Layout raiz com fontes e viewport
│   └── page.tsx                 # Landing page pública
├── components/
│   ├── AppShell.tsx             # Layout lateral padrão (Sidebar, Header, Notificações)
│   ├── GaleriaBadges.tsx        # Insígnias conquistadas e o que falta para as demais
│   ├── estudo/                  # RadarFraqueza, GraficoEvolucao, HistoricoSimulados, TreinoTaf
│   ├── questoes/                # ComboBadge, Distratores, QuadroFigura, ResolucaoGabarito
│   ├── admin/                   # Painéis do admin (moderação, saúde, importação, avisos, contatos…)
│   ├── DynamicIsland.tsx        # Player flutuante de música, presente em toda a plataforma
│   ├── StudySessionWidget.tsx   # Widget de tempo real da sessão de estudo e heartbeat
│   ├── NotificationCenter.tsx   # Sino e dropdown de notificações em tempo real
│   ├── MiniPerfilModal.tsx      # Modal com cartão de perfil público do soldado
│   └── AdicionarAmigoModal.tsx  # Busca e envio de solicitação de amizade
├── lib/
│   ├── auth.ts                  # JWT (`jose`), senha em PBKDF2 com sal e validação de tokens
│   ├── sessao-estudo.ts         # Ciclo de vida da sessão: virada de 8 h/dia e teto anti-fraude
│   ├── prova-em-andamento.ts    # Simulado guardado no aparelho, amarrado ao dono
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

> [!NOTE]
> **Ciclo da sessão de estudo (corrigido em 07/09/2026).** `stopSession()`
> existia no store e nenhum componente o chamava, então `finalizada_em` nunca
> era preenchido e o aluno tinha **uma única linha em `study_sessions` para
> sempre**. Com isso, "tempo de estudo hoje" dava 0 da segunda visita em
> diante, o limite de 8 h virava teto de vida e o multiplicador de
> continuidade travava em 1,5× para todo mundo. A regra de virada agora é do
> **servidor** (`lib/sessao-estudo.ts`), usada por `start`, `status` e
> `heartbeat` — não depende de o navegador avisar nada.

> [!NOTE]
> `components/StudySessionWidget.tsx` exporta dois componentes: o
> **`StudySessionBadge`** (o visor, na sidebar e na topbar) e o
> **`StudySessionTracker`** (o motor: inicia a sessão, faz o tick de 1 s com
> a aba visível e manda o heartbeat de 30 s). O Tracker é montado **uma vez**
> pelo `AppShell`. Até 07/09/2026 ele existia e não era montado — o
> cronômetro ficava em 00:00:00 e o ranking por tempo de estudo vinha vazio.

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
5. **Toda rota logada vai dentro de `app/(privado)/`.** É o único lugar com
   `layout.tsx` montando o `AppShell`. **Não crie `layout.tsx` por rota**:
   antes havia 14, eram segmentos irmãos, e navegar entre seções desmontava
   e remontava o AppShell inteiro — o acumulador de tempo de uso, o
   cronômetro de estudo e as requisições de perfil recomeçavam a cada
   clique no menu. Página nova = pasta nova dentro de `(privado)`, sem
   layout próprio.
6. **Sem Node instalado?** Rode as checagens em `scripts/checar_*.py`. Elas
   pegam import quebrado, coluna inexistente no schema, classe de Tailwind
   sem token e identificador não declarado — a classe de erro que o
   TypeScript veria mas que só aparece no deploy.
7. **Senha nunca passa por `hashToken`.** Essa função é SHA-256 de uma volta
   e serve para o refresh token, que já é aleatório. Para senha use
   `hashSenha()` ao gravar e `verificarSenha()` ao conferir — o segundo
   aceita o formato antigo e devolve `precisaRehash` para a migração
   transparente acontecer no login.
8. **Não confie na duração que o cliente manda.** O heartbeat de estudo
   aceitava `duracao_segundos` sem teto, e uma requisição forjada virava
   milhões de XP. Qualquer valor vindo do navegador passa por
   `duracaoAceita()` em `lib/sessao-estudo.ts`, que corta no tempo real de
   relógio.

Para a documentação completa da plataforma, veja o [README Principal da BatCaverna](../../README.md).
