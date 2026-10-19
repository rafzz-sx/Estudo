# Diretrizes do Projeto BatCaverna

## Versionamento Controlado (Obrigatório)

### Regra de Ouro: Somente sob autorização explícita do usuário
- **NÃO** incrementar a versão automaticamente ao fazer alterações, correções ou funcionalidades.
- Durante a conversa, realizar todas as alterações solicitadas **sem mexer na versão**.
- Ao finalizar o trabalho, **perguntar ao usuário** se deseja atualizar a versão antes de tocar em qualquer arquivo de versão.
- Somente após o usuário autorizar explicitamente (ex: "pode atualizar a versão", "sobe a versão"), proceder com o incremento.

### Classificação Automática de Versão (Taxonomia BatCaverna)
Ao receber autorização do usuário para atualizar a versão, o agente **deve classificar automaticamente** o tipo de incremento com base no trabalho realizado na conversa, seguindo a taxonomia oficial do projeto:
- ⭐ **Maior Atualização** (`vX.0.0`) → Muda o 1º número da esquerda. Salto de geração da plataforma ou mega atualização estrutural.
- 🚀 **Grande Atualização** (`v3.X.0`) → Muda o número do meio. Lançamento de grandes módulos, novos arsenais completos ou sistemas inéditos.
- ⚡ **Atualização** (`v3.5.X`) → Muda o 3º número. Novos recursos notáveis, melhorias expressivas ou expansão de ferramentas.
- 🛠️ **Pequena Atualização** (`v3.5.X`) → Muda o 3º número. Pequenos ajustes rápidos, otimizações de performance, design e hotfixes.

Apresentar ao usuário a versão sugerida, a classificação e a justificativa antes de aplicar. Ex: *"Sugiro versão 3.4.1 (🛠️ Pequena Atualização) porque foram apenas correções visuais e de bug. Confirma?"*

### Arquivos a atualizar (todos de uma vez, junto com o código):
1. `batcaverna/apps/web/src/data/changelog.ts` → `CURRENT_APP_VERSION` e adicionar entrada no `CHANGELOG_HISTORY`.
2. `batcaverna/apps/mobile/android/app/build.gradle` → incrementar `versionCode` (+1) e atualizar `versionName`.
3. `batcaverna/apps/mobile/app.json` → sincronizar o campo `"version"`.
4. `batcaverna/apps/mobile/package.json` → sincronizar o campo `"version"`.

### Proibição de Migrações SQL para Versão
- **NUNCA** criar arquivos de migração SQL (`supabase/migrations/`) apenas para atualizar a versão na tabela `app_info`.
- A API `/api/app-info` já possui **auto-sincronização**: quando o código no `changelog.ts` diverge do banco, a API detecta e atualiza o Supabase automaticamente no próximo acesso.
- Migrações SQL devem ser criadas **somente** quando houver alterações reais de schema (novas tabelas, colunas, índices, RLS, etc.).
- Isso evita acumulação desnecessária de arquivos de migração no projeto.

### Consolidação de Commits com a Versão
- Todas as alterações realizadas durante a conversa devem ser commitadas/subidas **junto** com a atualização de versão, em um único momento.
- **NÃO** subir código parcial antes da versão ser definida.
- O commit final deve conter: código alterado + versão atualizada + changelog atualizado.

### Versionamento Exclusivo do Painel de Admin (Confidencial)
- O **Painel de Admin possui uma versão própria e isolada** (`CURRENT_ADMIN_VERSION` em `batcaverna/apps/web/src/data/admin-changelog.ts`), completamente separada da versão pública dos alunos (`CURRENT_APP_VERSION`).
- **Sigilo Absoluto de Moderação:** Melhorias do painel administrativo, ferramentas de auditoria, novos módulos de moderação, dossiês de alunos e tickets de suporte **NUNCA** devem ser descritos no `changelog.ts` público dos alunos nem exibidos no modal de novidades (`MissedUpdatesModal`). É ideal os alunos não saberem de alterações internas de moderação.
- Quando houver alterações e melhorias **exclusivas** no painel de admin:
  1. Incrementar apenas a versão em `admin-changelog.ts` (`CURRENT_ADMIN_VERSION`) e documentar no `ADMIN_CHANGELOG_HISTORY`.
  2. **NÃO** alterar a versão pública dos alunos (`CURRENT_APP_VERSION`), evitando criar falsos avisos de atualização para os estudantes.

### Geração do APK
- O APK de debug é gerado com a nomenclatura `batcaverna_<versao>.apk` (configurado via `applicationVariants.all` no `build.gradle`).

## Uso de Skills (Quando Relevante)
- Ao executar qualquer atividade, o agente **deve verificar** se existe alguma skill relevante disponível que auxilie na tarefa.
- Utilizar skills que realmente agreguem valor à atividade sendo realizada (ex: `debugger` para debugging, `react-patterns` para componentes React, `security-auditor` para revisão de segurança, etc.).
- **NÃO** carregar skills de forma genérica ou desnecessária — escolher apenas as que se aplicam diretamente ao contexto da tarefa.
- Se **nenhuma skill for relevante** para a atividade em questão, prosseguir normalmente sem carregar nenhuma skill.

## Padrões de Interface e UX
- Todos os campos de senha (Login, Cadastro, Recuperar Senha, etc.) devem obrigatoriamente possuir botão de alternância com ícone de olho para visualização/ocultação da senha digitada.

## Comunicação de Atualizações e Reinstalação de APK (Obrigatório)
Sempre que concluir uma atualização, informe expressamente ao usuário se ele precisa ou não reinstalar o APK:
- **Atualização apenas Web/Frontend (`apps/web`):** Avisar com destaque: *"Não é necessário reinstalar o APK! Como o app mobile carrega a plataforma em tempo real da Vercel, quem já tem o aplicativo instalado já recebe a atualização automaticamente ao abrir o app."*
- **Atualização Nativa (`apps/mobile` / `android`):** Avisar que a reinstalação do APK é necessária (quando mudar permissões nativas, ícones, splash screen, wrapper WebView ou dependências nativas).
