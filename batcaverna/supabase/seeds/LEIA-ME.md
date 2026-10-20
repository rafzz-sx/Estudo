# 🗄️ Guia de Carga de Dados e Seeds — BatCaverna

Todos os scripts deste diretório são **idempotentes** (`ON CONFLICT DO NOTHING`), ou seja, executá-los novamente não duplica nenhum registro existente no banco.

---

## 1. Estrutura Inicial do Banco (Setup Mestre)

Se você está configurando um banco Supabase do zero:
1. Acesse o **SQL Editor** no painel do Supabase.
2. Abra e execute o arquivo mestre:
   ```
   supabase/migrations/000_setup_completo_batcaverna.sql
   ```
3. Esse script cria todo o schema relacional, as 25+ tabelas, enums, índices, triggers de auditoria, políticas de RLS e os dados base essenciais (concursos, matérias e níveis de patente).

---

## 2. Carga do Banco de Questões

As questões oficiais estão divididas em arquivos SQL para facilitar a execução sem estourar o limite de tempo do SQL Editor:

```
cn_01.sql      cn_02.sql        (Colégio Naval / CPACN)
eear_01.sql                     (EEAR - Especialistas da Aeronáutica)
efomm_01.sql                    (EFOMM - Marinha Mercante)
enem_01.sql .. enem_05.sql      (ENEM - Todas as áreas)
epcar_01.sql   epcar_02.sql     (EPCAR - Cadetes do Ar)
esa_01.sql                      (ESA - Sargentos das Armas)
```

Cada script cria os vínculos entre matérias, assuntos e concursos correspondentes e insere as questões com validação de unicidade por hash de conteúdo (`hash_conteudo`).

---

## 3. Conteúdo Didático e Mídias

Após carregar a estrutura e as questões, execute os arquivos de conteúdo na ordem abaixo:

| Arquivo | Conteúdo |
| :--- | :--- |
| `teoria_01_matematica.sql` | Temas táticos de Matemática |
| `teoria_02_linguagens.sql` | Português e Interpretação de Texto |
| `teoria_03_natureza.sql` | Física, Química e Biologia |
| `teoria_04_humanas.sql` | História, Geografia, Filosofia e Sociologia |
| `teoria_05_redacao_literatura.sql` | Redação e Literatura |
| `teoria_06_gramatica.sql` | Crase, concordância e regência |
| `teoria_07_sociologia_filosofia.sql` | Sociologia e Filosofia aplicadas |
| `teoria_08_ingles.sql` | Língua Inglesa para concursos |
| `teoria_09_historia_artes_edfisica.sql` | História, Artes e Educação Física (TAF) |
| `bizus_01.sql` | Bizus táticos com macetes de memorização rápida |
| `videoaulas_01.sql` | Vídeo-aulas selecionadas conectadas à trilha de assuntos |
| `musicas_01.sql` | Faixas clássicas em domínio público para foco profundo |
| `redacao_01_temas_militares.sql` | Temas oficiais de redação militar (ESA, EsPCEx, AFA, EPCAR, CN) |

---

## 4. Como Adicionar Novas Provas

### Opção A: Pelo Painel de Admin (Recomendado)
A plataforma possui um importador visual integrado que dispensa o terminal:
1. Acesse **/admin → 📥 Importar Questões** com uma conta de administrador.
2. Selecione o concurso desejado e faça o upload do arquivo `.txt` da prova formatada.
3. Clique em **Conferir antes de importar** para visualizar a prévia, taxa de acerto do parser e amostras renderizadas.
4. Clique em **Importar** para salvar as questões diretamente no banco.

### Opção B: Pelo Terminal (Pipeline de Scripts)
1. Coloque o `.txt` da prova formatada no diretório de extração local.
2. Execute o pipeline de extração e validação:
   ```bash
   python scripts/parse_questoes.py            # Lê os .txt e gera scripts/out/questoes.json
   python scripts/auditar_gabaritos.py         # Audita consistência dos gabaritos
   python scripts/gerar_seed_sql.py            # Gera os arquivos SQL correspondentes
   ```
3. Execute os arquivos `.sql` gerados no SQL Editor do Supabase.

---

## 5. Consultas de Verificação (Health Check SQL)

Para auditar o volume de dados carregados no Supabase, execute as consultas abaixo no SQL Editor:

```sql
-- Total de questões por concurso
SELECT c.sigla, COUNT(*) AS total_questoes
FROM questoes q
JOIN concursos c ON c.id = q.concurso_id
GROUP BY c.sigla
ORDER BY total_questoes DESC;

-- Resumo de teoria e vídeo-aulas por matéria
SELECT m.nome,
       COUNT(DISTINCT t.id) AS temas_teoria,
       COUNT(DISTINCT v.id) AS videoaulas
FROM materias m
LEFT JOIN teoria_conteudo t ON t.materia_id = m.id
LEFT JOIN videoaulas v ON v.materia_id = m.id
GROUP BY m.nome
HAVING COUNT(DISTINCT t.id) + COUNT(DISTINCT v.id) > 0
ORDER BY m.nome;
```
