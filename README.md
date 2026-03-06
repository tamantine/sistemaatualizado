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

## 🔧 Configuração do Firebase

Consulte os arquivos `CRIAR-FIRESTORE.md` e `FIREBASE-REGRAS.md` para instrucões de configuração do seu banco de dados.

## 📦 Modo Demo

O sistema funciona sem banco de dados remoto! Quando configurado dessa forma:

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
├── services/      # Serviços (Firebase, dispositivos)
├── lib/          # Configurações (Firebase)
├── hooks/         # Hooks personalizados
├── types/         # Tipos TypeScript
└── utils/         # Utilitários
```

## 🔨 Build Otimizado

O projeto já está configurado com code-splitting:

- React + Router em chunk separado
- Lucide Icons em chunk separado
- Recharts (gráficos) em chunk separado
- Firebase em chunk separado

Isso melhora significativamente o tempo de carregamento inicial.

## 📄 Licença

MIT
