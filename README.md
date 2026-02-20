# Sistema Hortifruti PDV

Sistema de gestão para hortifruti com PDV, estoque, financeiro e mais.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Criar arquivo .env baseado no exemplo
cp .env.example .env.local

# Iniciar desenvolvimento
npm run dev
```

## 🔧 Configuração do Supabase

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote as credenciais:
   - **Project URL**: Configurações → API → Project URL
   - **anon public key**: Configurações → API → Project API keys → `anon` key

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 3. Executar migrações (SQL)

No painel do Supabase, vá em **SQL Editor** e execute o script de banco de dados disponível em `supabase/schema.sql` (se existir).

## 📦 Modo Demo (sem Supabase)

O sistema funciona sem Supabase! Quando as variáveis de ambiente não estão configuradas:

- Sistema inicia em **modo demo**
- Usuários podem fazer login com conta demo
- Dados são armazenados localmente (em memória)

Para entrar em modo demo, clique em "Entrar com Demo" na tela de login.

## 🛠️ Comandos

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Verificar erros ESLint
npm run lint

# Preview do build
npm run preview
```

## 📁 Estrutura

```
src/
├── components/     # Componentes React
├── pages/         # Páginas principais
├── store/         # Estado global (Zustand)
├── services/      # Serviços (Supabase, dispositivos)
├── lib/          # Configurações (Supabase)
├── hooks/         # Hooks personalizados
├── types/         # Tipos TypeScript
└── utils/         # Utilitários
```

## 🔨 Build Otimizado

O projeto já está configurado com code-splitting:

- React + Router em chunk separado
- Lucide Icons em chunk separado
- Recharts (gráficos) em chunk separado
- Supabase em chunk separado

Isso melhora significativamente o tempo de carregamento inicial.

## 📄 Licença

MIT
