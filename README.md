# Exam-Manager – Diário de bordo do projeto
> **Objetivo** Site pessoal (tipo EvalBee) para gerenciar turmas, alunos, gabaritos, redações e relatórios.

---

## 1. Infraestrutura

| Item | Status | Observações |
|------|--------|-------------|
| **Repositório GitHub** | ✅ `profyagosales/exam-manager` | Commits frequentes → sem risco de perda de código. |
| **Next .js 15 + Typescript** | ✅ `create-next-app` com Tailwind + Shadcn-UI | Rodando local com `npm run dev`. |
| **Supabase** | ✅ Projeto **Site prof Yago Sales – Teste**<br>  • Tabelas **classes**, **students**<br>  • Bucket **student-photos** (`public upload`) | Dados persistem on-line. |
| **Alias TypeScript `@/`** | ✅ em `tsconfig.json` (`baseUrl: "."`, `paths`) | Facilita imports. |

---

## 2. Funcionalidades concluídas (30 jul 2025)

| Módulo | Entregas | Observações |
|--------|----------|-------------|
| **CRUD Turmas** | • Listagem `/classes`<br>• **Criar turma** (modal `AddClassDialog` salvando no Supabase)<br>• **Editar / Excluir** via `ClassActions`<br>• UI atualiza com `router.refresh()` | Removido `nanoid()` → Supabase gera UUID. |
| **CRUD Alunos** | • Listagem dentro da turma `/classes/[id]`<br>• Foto (upload → `student-photos/…`)<br>• Criar, editar, excluir (botões em `StudentActions`) | |
| **Navegação** | • Link **← Turmas** em `/classes/[id]/page.tsx` | Retorno rápido à lista. |
| **Configuração DX** | • `baseUrl` ajustado em `tsconfig.json`<br>• Separação Server ↔ Client Components aplicada | Erros de import e onClick resolvidos. |

---

## 3. Backlog priorizado

| Prioridade | Próximo passo | Tarefas atômicas |
|------------|---------------|------------------|
| **P1** | **Correção automática de gabaritos** | 1. Criar tabelas `answer_keys` e `student_answers` (trigger de nota).<br>2. UI para upload de gabarito PDF.<br>3. OCR (Tesseract) ou sheet-bubble para ler respostas. |
| **P2** | **Correção de redações** | 1. Endpoint que recebe PDF + anotações.<br>2. Gera PDF marcado (pdf-lib).<br>3. Salva em Supabase Storage. |
| **P3** | **Envio de e-mails** | 1. Integrar Resend (ou SMTP SEEDF).<br>2. Template React Email com notas + link do PDF. |
| **P4** | **Deploy** | 1. Vercel → set `SUPABASE_URL`, `SUPABASE_ANON_KEY`.<br>2. Testar preview deploy. |

---

## 4. Procedimento de backup

1. **Código**  
   ```bash
   git add .
   git commit -m "feat: CRUD turmas/alunos funcionando"
   git push
