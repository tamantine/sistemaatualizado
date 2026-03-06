# Como configurar as Regras de Segurança do Firebase Firestore

Siga estes passos para permitir que o sistemagrave dados:

## Passo 1: Acesse o Console do Firebase

1. Vá para https://console.firebase.google.com/
2. Selecione seu projeto: **hortifruti-pdv**

## Passo 2: Acesse o Firestore

1. No menu lateral, clique em **"Firestore Database"**
2. Clique na aba **"Regras"** (Rules)

## Passo 3: Atualize as regras

Apague tudo que estiver lá e cole estas regras mais permissivas para desenvolvimento:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite todas as operações para desenvolvimento
    // ATENÇÃO: Em produção, você deve restringuir isso!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Passo 4: Publique as regras

1. Clique no botão **"Publicar"** (Publish)
2. Confirme a publicação

## Pronto! 🎉

Agora você pode voltar ao sistema e usar normalmente. Os dados serão salvos no Firebase.

---

**Nota de segurança:** 
Estas regras são permissivas (permitem tudo). Para um sistema em produção, você deveria:
- Configurar Firebase Authentication
- Criar regras mais restritivas baseadas no usuário logado
- Restringir leitura/escrita por tipo de dados
