// =============================================
// Script para adicionar produtos de exemplo ao Firebase
// Execute este script para popular o banco com frutas
// =============================================
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Configuração do Firebase (mesma do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyC1Phtow8msMe02ujOEkF2wMAZHuI-z1UU",
  authDomain: "hortifruti-pdv.firebaseapp.com",
  projectId: "hortifruti-pdv",
  storageBucket: "hortifruti-pdv.firebasestorage.app",
  messagingSenderId: "511530261155",
  appId: "1:511530261155:web:f10d578c52cfa0507d3d16"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Lista de 10 frutas com preços
const frutas = [
  { nome: "Maçã Fuji", unidade: "KG", preco_custo: 5.00, preco_venda: 8.90, estoque_atual: 50, estoque_minimo: 10 },
  { nome: "Banana Prata", unidade: "KG", preco_custo: 2.50, preco_venda: 4.50, estoque_atual: 80, estoque_minimo: 20 },
  { nome: "Laranja Pera", unidade: "KG", preco_custo: 1.80, preco_venda: 3.50, estoque_atual: 100, estoque_minimo: 25 },
  { nome: "Uva Rubi", unidade: "KG", preco_custo: 8.00, preco_venda: 14.90, estoque_atual: 20, estoque_minimo: 5 },
  { nome: "Morango", unidade: "KG", preco_custo: 12.00, preco_venda: 19.90, estoque_atual: 15, estoque_minimo: 8 },
  { nome: "Abacate", unidade: "UN", preco_custo: 3.00, preco_venda: 5.90, estoque_atual: 30, estoque_minimo: 10 },
  { nome: "Manga Palmer", unidade: "KG", preco_custo: 3.50, preco_venda: 6.50, estoque_atual: 40, estoque_minimo: 15 },
  { nome: "Melancia", unidade: "KG", preco_custo: 1.50, preco_venda: 2.90, estoque_atual: 25, estoque_minimo: 10 },
  { nome: "Abacaxi", unidade: "UN", preco_custo: 4.00, preco_venda: 7.90, estoque_atual: 20, estoque_minimo: 8 },
  { nome: "Kiwi", unidade: "UN", preco_custo: 1.50, preco_venda: 3.50, estoque_atual: 35, estoque_minimo: 10 },
];

async function adicionarProdutos() {
  console.log("🌱 Adicionando frutas ao Firebase...");
  
  for (const fruta of frutas) {
    try {
      await addDoc(collection(db, 'produtos'), {
        nome: fruta.nome,
        codigo: `FR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        unidade: fruta.unidade,
        preco_custo: fruta.preco_custo,
        preco_venda: fruta.preco_venda,
        estoque_atual: fruta.estoque_atual,
        estoque_minimo: fruta.estoque_minimo,
        ativo: true,
        em_promocao: false,
        icms_aliquota: 0,
        pis_aliquota: 0,
        cofins_aliquota: 0,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      });
      console.log(`✅ ${fruta.nome} adicionado!`);
    } catch (error) {
      console.error(`❌ Erro ao adicionar ${fruta.nome}:`, error);
    }
  }
  
  console.log("🎉 Concluído! 10 frutas adicionadas ao Firebase.");
}

adicionarProdutos();
