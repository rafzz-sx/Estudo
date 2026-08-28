# 🦇 BatCaverna — Plataforma de Estudos para Concursos Militares e ENEM

Central de estudos gamificada e imersiva para concursos militares (**EEAR, ESA, EAM, CN, EPCAR, EsPCEx, EFOMM, IME**) e o **ENEM**.

---

## 🚀 Como Rodar o Projeto

### 1. Instalar as dependências na raiz
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo de exemplo em `apps/web/.env.example` para `apps/web/.env.local`:
```bash
cp apps/web/.env.example apps/web/.env.local
```

### 3. Rodar a aplicação Web (Next.js)
```bash
npm run dev:web
```
Acesse [http://localhost:3000](http://localhost:3000)

### 4. Rodar o aplicativo Mobile (Expo / React Native)
```bash
npm run dev:mobile
```

### 5. Banco de Dados (Supabase / PostgreSQL)
Execute as migrações localizadas na pasta `supabase/migrations/`:
1. `001_initial_schema.sql` (Estrutura com 25+ tabelas, enums, triggers e índices)
2. `002_seed_data.sql` (9 concursos, 15 matérias, assuntos, 15 níveis de gamificação e o usuário Administrador padrão `raf4biel.venafro@gmail.com`).

---

## 📂 Estrutura do Monorepo

- `apps/web`: Plataforma Web completa com Next.js 16 (App Router), Tailwind CSS e PWA.
- `apps/mobile`: Aplicativo mobile nativo com Expo (React Native).
- `packages/types`: Tipos TypeScript compartilhados entre Web e Mobile.
- `packages/ui`: Design Tokens (Paleta BatCaverna, Níveis de XP, Cores por Força Militar).
- `packages/utils`: Utilitários de cálculo de XP, combos, formatação de tempo e validações.
- `packages/config`: Configurações de TypeScript e linter compartilhadas.
