# Diretrizes do Projeto BatCaverna

## Versionamento Automático (Obrigatório)
Sempre que fizer alterações, correções de bugs ou novas funcionalidades no projeto:
1. **Incrementar a versão**:
   - `batcaverna/apps/mobile/android/app/build.gradle`: incrementar `versionCode` (+1) e atualizar `versionName` (ex: 3.1.5 -> 3.1.6).
   - `batcaverna/apps/mobile/app.json`: sincronizar o campo `"version"`.
   - `batcaverna/apps/mobile/package.json`: sincronizar o campo `"version"`.
2. **Geração do APK**:
   - O APK de debug é gerado com a nomenclatura `batcaverna_<versao>.apk` (configurado via `applicationVariants.all` no `build.gradle`).

## Padrões de Interface e UX
- Todos os campos de senha (Login, Cadastro, Recuperar Senha, etc.) devem obrigatoriamente possuir botão de alternância com ícone de olho para visualização/ocultação da senha digitada.

## Comunicação de Atualizações e Reinstalação de APK (Obrigatório)
Sempre que concluir uma atualização, informe expressamente ao usuário se ele precisa ou não reinstalar o APK:
- **Atualização apenas Web/Frontend (`apps/web`):** Avisar com destaque: *"Não é necessário reinstalar o APK! Como o app mobile carrega a plataforma em tempo real da Vercel, quem já tem o aplicativo instalado já recebe a atualização automaticamente ao abrir o app."*
- **Atualização Nativa (`apps/mobile` / `android`):** Avisar que a reinstalação do APK é necessária (quando mudar permissões nativas, ícones, splash screen, wrapper WebView ou dependências nativas).

