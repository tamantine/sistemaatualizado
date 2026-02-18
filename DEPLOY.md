# 🚀 Guia de Deploy para Produção - Hortifruti Master

Este guia detalha os passos para colocar o sistema em produção com segurança e confiabilidade.

## 1. Configuração do Supabase (Banco de Dados & Auth)

### Autenticação
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **Authentication** > **Providers** e certifique-se que "Email" está habilitado.
3. Vá em **Authentication** > **Users** e crie seu primeiro usuário (login administrativo).
   - Clique em "Add User" -> "Create New User".
   - Digite seu e-mail e uma senha forte.
   - Clique em "Auto Confirm User" para pular a verificação de e-mail por enquanto.

### Segurança (RLS - Row Level Security)
Para garantir que apenas usuários logados acessem os dados:
1. Vá em **SQL Editor** no Supabase.
2. Execute o script abaixo para atualizar as permissões de todas as tabelas (substitua `[tabela]` pelo nome de cada tabela ou use o script de migração fornecido):
   ```sql
   -- Exemplo para tabela 'produtos'
   alter table produtos enable row level security;
   create policy "Acesso restrito" on produtos for all using (auth.role() = 'authenticated');
   ```

## 2. Configuração do Deploy (Vercel)

A plataforma recomendada é a **Vercel** pela facilidade de uso com React/Vite.

### Passos:
1. Crie uma conta na [Vercel](https://vercel.com) se não tiver.
2. Conecte sua conta do GitHub/GitLab onde este código está hospedado.
3. Clique em **"Add New..."** > **"Project"** e selecione este repositório.
4. Na configuração do projeto:
   - **Framework Preset:** Vite (deve detectar automaticamente).
   - **Root Directory:** `./` (padrão).
   - **Environment Variables:** Adicione as variáveis do seu arquivo `.env`:
     - `VITE_SUPABASE_URL`: (Sua URL do Supabase)
     - `VITE_SUPABASE_ANON_KEY`: (Sua chave anon do Supabase)
5. Clique em **Deploy**.

## 3. Pós-Deploy

Após o deploy, acesse a URL fornecida pela Vercel (ex: `https://sistema-hortifruti.vercel.app`).
1. Você será redirecionado para a tela de Login.
2. Use o e-mail e senha que criou no passo 1.
3. Teste o sistema!

## 4. Dicas Importantes

- **Logs:** Se algo der errado, verifique os logs na aba "Deployments" da Vercel.
- **Cache:** Se atualizar o código e não ver mudanças, limpe o cache do navegador ou teste em aba anônima.
- **Banco de Dados:** Lembre-se que em produção você deve fazer backups regulares do seu banco Supabase (eles têm backups automáticos nos planos pagos, mas exportar SQL periodicamente é uma boa prática).

---
**Suporte:** Em caso de dúvidas, consulte a documentação do [Vite](https://vitejs.dev) ou [Supabase](https://supabase.com/docs).
