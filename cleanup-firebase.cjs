// Script para limpar todas as coleções do Firebase Firestore
// Execute com: node cleanup-firebase.js

const admin = require('firebase-admin');

// Usa as credenciais padrão do ADC (Application Default Credentials)
// que são configuradas automaticamente pelo firebase login
const PROJECT_ID = 'hortifruti-pdv';

// Lista de coleções para limpar
const COLECTIONS = [
  'produtos',
  'categorias',
  'fornecedores',
  'clientes',
  'vendas',
  'caixas',
  'contas_pagar',
  'contas_receber',
  'pedidos_compra',
  'promocoes',
  'registros_qualidade',
  'perdas',
  'rastreios',
  'sazonalidade',
  'caixa_movimentacoes',
  'venda_itens',
  'venda_pagamentos'
];

async function deleteCollection(db, collectionName) {
  console.log(`🗑️  Limpando coleção: ${collectionName}...`);
  
  try {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.limit(100).get();
    
    if (snapshot.empty) {
      console.log(`   ✓ ${collectionName} já está vazia`);
      return;
    }
    
    // Deleta todos os documentos em batches
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`   ✓ ${snapshot.size} documento(s) deletado(s) em ${collectionName}`);
    
    // Verifica se ainda há documentos
    const count = await collectionRef.count().get();
    if (count.data().count > 0) {
      // Chama novamente para deletar o resto
      await deleteCollection(db, collectionName);
    }
  } catch (error) {
    console.error(`   ✗ Erro ao limpar ${collectionName}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Tentando conectar ao Firebase...\n');
  
  try {
    // Tenta obter credenciais padrão do ADC
    const { getDefaultDatabase } = await import('firebase-admin/database');
    
    // Inicializa o Firebase Admin com credenciais padrão
    admin.initializeApp({
      projectId: PROJECT_ID
    });
    
    const db = admin.firestore();
    
    console.log('✅ Conectado ao Firebase Firestore!\n');
    
    for (const collection of COLECTIONS) {
      await deleteCollection(db, collection);
    }
    
    console.log('\n✅ Limpeza concluída!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao conectar ao Firebase:', error.message);
    console.log('\nPara resolver, você precisa:');
    console.log('1. Baixar a chave de serviço do Firebase Console');
    console.log('2. Definir a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS');
    console.log('\nOu faça a limpeza manualmente no console do Firebase.');
    process.exit(1);
  }
}

main();
