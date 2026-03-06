# 🚀 Guia de Deploy para Produção - Hortifruti Master

Este guia detalha os passos para colocar o sistema em produção com segurança e confiabilidade.

## 1. Configuração do Firebase (Banco de Dados & Auth)

Consulte os arquivos `FIREBASE-REGRAS.md` e `CRIAR-FIRESTORE.md` para configurar regras de segurança e autenticação do Firebase.

## 2. Configuração do Deploy (Vercel)

A plataforma recomendada é a **Vercel** pela facilidade de uso com React/Vite.

### Passos:
1. Crie uma conta na [Vercel](https://vercel.com) se não tiver.
2. Conecte sua conta do GitHub/GitLab onde este código está hospedado.
3. Clique em **"Add New..."** > **"Project"** e selecione este repositório.
4. Na configuração do projeto:
   - **Framework Preset:** Vite (deve detectar automaticamente).
   - **Root Directory:** `./` (padrão).
   - **Environment Variables:** Adicione as propriedades necessárias para o Firebase no seu ambiente de produção da Vercel.
5. Clique em **Deploy**.

## 3. Pós-Deploy

Após o deploy, acesse a URL fornecida pela Vercel (ex: `https://sistema-hortifruti.vercel.app`).
1. Você será redirecionado para a tela de Login.
2. Use o e-mail e senha que criou no passo 1.
3. Teste o sistema!

## 4. Dicas Importantes

- **Logs:** Se algo der errado, verifique os logs na aba "Deployments" da Vercel.
- **Cache:** Se atualizar o código e não ver mudanças, limpe o cache do navegador ou teste em aba anônima.
- **Banco de Dados:** Lembre-se que em produção você deve fazer backups regulares do seu banco de dados Firebase.

---
**Suporte:** Em caso de dúvidas, consulte a documentação do [Vite](https://vitejs.dev) ou [Firebase](https://firebase.google.com/docs).
