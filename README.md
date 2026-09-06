# 🦇 Estudo — Plataforma BatCaverna

Repositório central de estudos para concursos militares (**EEAR, ESA, EAM, CN, EPCAR, EsPCEx, EFOMM, IME**) e o **ENEM**.

O código-fonte completo da plataforma está localizado no diretório monorepo [`batcaverna/`](./batcaverna).

---

## 🚀 Como Iniciar Rapidamente

1. **Acesse o diretório do projeto:**
   ```bash
   cd batcaverna
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

4. **Inicie o servidor de desenvolvimento Web (Next.js):**
   ```bash
   npm run dev:web
   ```
   Acesse no navegador: [http://localhost:3000](http://localhost:3000)

5. **Inicie o aplicativo Mobile (React Native / Android):**
   ```bash
   npm run dev:mobile
   ```

---

## 📖 Documentação Completa e Manual Técnico

Para conferir o manual completo de arquitetura, funcionamento de Frontend e Backend, banco de dados Supabase, autenticação customizada, aplicativo mobile e regras de desenvolvimento, consulte:

👉 **[Manual Completo da BatCaverna (`batcaverna/README.md`)](./batcaverna/README.md)**
