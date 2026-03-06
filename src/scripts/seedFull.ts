// =============================================
// Script completo para popular o Firebase
// Executar: npx tsx src/scripts/seedFull.ts
// =============================================
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC1Phtow8msMe02ujOEkF2wMAZHuI-z1UU",
  authDomain: "hortifruti-pdv.firebaseapp.com",
  projectId: "hortifruti-pdv",
  storageBucket: "hortifruti-pdv.firebasestorage.app",
  messagingSenderId: "511530261155",
  appId: "1:511530261155:web:f10d578c52cfa0507d3d16"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getCurrentTimestamp() {
  return new Date().toISOString();
}

async function adicionarDados() {
  console.log("🌱 Criando dados completos no Firebase...\n");

  // =============================================
  // CATEGORIAS
  // =============================================
  const categorias = [
    { nome: "Frutas", descricao: "Frutas frescas", cor: "#FF6B6B" },
    { nome: "Legumes", descricao: "Legumes frescos", cor: "#4ECDC4" },
    { nome: "Verduras", descricao: "Verduras frescas", cor: "#45B7D1" },
    { nome: "Bebidas", descricao: "Bebidas em geral", cor: "#96CEB4" },
    { nome: "Laticínios", descricao: "Laticínios e derivados", cor: "#FFEAA7" },
  ];

  console.log("📁 Criando categorias...");
  for (const cat of categorias) {
    await addDoc(collection(db, 'categorias'), {
      ...cat,
      ativo: true,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    });
    console.log(`  ✅ ${cat.nome}`);
  }

  // =============================================
  // FORNECEDORES (corretos conforme tipo)
  // =============================================
  const fornecedores = [
    { nome_fantasia: "Hortifruti Fresh", razao_social: "Hortifruti Fresh LTDA", cnpj_cpf: "12.345.678/0001-90", telefone: "(11) 99999-9999", email: "contato@hortifresh.com.br", endereco: "Rua das Frutas, 100", cidade: "São Paulo", estado: "SP", ativo: true },
    { nome_fantasia: "Sítio Boa Vista", razao_social: "Sítio Boa Vista ME", cnpj_cpf: "98.765.432/0001-10", telefone: "(11) 88888-8888", email: "vendas@sitioboavista.com.br", endereco: "Estrada do Sitio, 500", cidade: "Atibaia", estado: "SP", ativo: true },
    { nome_fantasia: "Ceagesp", razao_social: "Centrais de Abastecimento", cnpj_cpf: "55.555.555/0001-50", telefone: "(11) 77777-7777", email: "comercial@ceagesp.com.br", endereco: "Av. das Nações Unidas, 12551", cidade: "São Paulo", estado: "SP", ativo: true },
  ];

  console.log("\n🚚 Criando fornecedores...");
  for (const forn of fornecedores) {
    await addDoc(collection(db, 'fornecedores'), {
      ...forn,
      tipo: "juridica",
      ativo: true,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    });
    console.log(`  ✅ ${forn.nome_fantasia}`);
  }

  // =============================================
  // CLIENTES (corretos conforme tipo)
  // =============================================
  const clientes = [
    { nome: "João Silva", cpf_cnpj: "123.456.789-00", telefone: "(11) 99999-0001", email: "joao@email.com", endereco: "Rua A, 10", cidade: "São Paulo", estado: "SP", limite_credito: 1000, saldo_credito: 0, pontos_fidelidade: 150, ativo: true },
    { nome: "Maria Santos", cpf_cnpj: "987.654.321-00", telefone: "(11) 99999-0002", email: "maria@email.com", endereco: "Rua B, 20", cidade: "São Paulo", estado: "SP", limite_credito: 2000, saldo_credito: 0, pontos_fidelidade: 320, ativo: true },
    { nome: "Pedro Oliveira", cpf_cnpj: "456.789.123-00", telefone: "(11) 99999-0003", email: "pedro@email.com", endereco: "Rua C, 30", cidade: "Campinas", estado: "SP", limite_credito: 500, saldo_credito: 0, pontos_fidelidade: 75, ativo: true },
  ];

  console.log("\n👥 Criando clientes...");
  for (const cli of clientes) {
    await addDoc(collection(db, 'clientes'), {
      ...cli,
      ativo: true,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    });
    console.log(`  ✅ ${cli.nome}`);
  }

  // =============================================
  // CONTAS A PAGAR
  // =============================================
  const contasPagar = [
    { descricao: "Aluguel do armazém", fornecedor_nome: "Imobiliária XYZ", valor: 2500, data_vencimento: "2026-03-10", status: "pendente", categoria: "aluguel" },
    { descricao: "Conta de luz", fornecedor_nome: "Companhia Elétrica", valor: 450, data_vencimento: "2026-03-05", status: "pendente", categoria: "utilidades" },
    { descricao: "Conta de água", fornecedor_nome: "Sabesp", valor: 180, data_vencimento: "2026-03-08", status: "pendente", categoria: "utilidades" },
  ];

  console.log("\n💰 Criando contas a pagar...");
  for (const conta of contasPagar) {
    await addDoc(collection(db, 'contas_pagar'), {
      ...conta,
      valor_pago: 0,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    });
    console.log(`  ✅ ${conta.descricao}`);
  }

  // =============================================
  // CONTAS A RECEBER
  // =============================================
  const contasReceber = [
    { descricao: "Venda para Restaurante Bello", cliente_nome: "Restaurante Bello", valor: 890, data_vencimento: "2026-03-15", status: "pendente", parcela_atual: 1, total_parcelas: 1 },
    { descricao: "Venda para Lanchonete Fast", cliente_nome: "Lanchonete Fast", valor: 340, data_vencimento: "2026-03-12", status: "pendente", parcela_atual: 1, total_parcelas: 1 },
  ];

  console.log("\n💵 Criando contas a receber...");
  for (const conta of contasReceber) {
    await addDoc(collection(db, 'contas_receber'), {
      ...conta,
      valor_recebido: 0,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    });
    console.log(`  ✅ ${conta.descricao}`);
  }

  // =============================================
  // PROMOÇÕES
  // =============================================
  const promocoes = [
    { nome: "Promoção de Verão", descricao: "20% off em todas as frutas", tipo: "percentual", valor_desconto: 20, quantidade_minima: 1, data_inicio: "2026-01-01", data_fim: "2026-03-31", ativo: true },
    { nome: "Combo Família", descricao: "Leve 3 pagar 2 em selecionados", tipo: "quantidade", valor_desconto: 0, quantidade_minima: 3, data_inicio: "2026-02-01", data_fim: "2026-02-28", ativo: true },
  ];

  console.log("\n🏷️ Criando promoções...");
  for (const prom of promocoes) {
    await addDoc(collection(db, 'promocoes'), {
      ...prom,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    });
    console.log(`  ✅ ${prom.nome}`);
  }

  // =============================================
  // CAIXA (aberto)
  // =============================================
  console.log("\n💼 Criando caixa...");
  await addDoc(collection(db, 'caixas'), {
    numero: 1,
    operador_nome: "Gerente",
    status: "aberto",
    valor_abertura: 500,
    valor_dinheiro: 300,
    valor_cartao_debito: 100,
    valor_cartao_credito: 50,
    valor_pix: 50,
    valor_sangria: 0,
    valor_suprimento: 0,
    total_vendas: 0,
    aberto_em: getCurrentTimestamp(),
    created_at: getCurrentTimestamp(),
  });
  console.log("  ✅ Caixa aberto com R$ 500,00");

  // =============================================
  // TABELAS DE PREÇO
  // =============================================
  const tabelasPreco = [
    { nome: "Varejo", tipo: "varejo", descricao: "Preços para venda no varejo", margem_padrao: 30, ativo: true },
    { nome: "Atacado", tipo: "atacado", descricao: "Preços para venda atacada", margem_padrao: 15, ativo: true },
    { nome: "Fidelidade", tipo: "fidelidade", descricao: "Preços para clientes fidelity", margem_padrao: 20, ativo: true },
  ];

  console.log("\n🏷️ Criando tabelas de preço...");
  for (const tabela of tabelasPreco) {
    await addDoc(collection(db, 'tabelas_preco'), {
      ...tabela,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    });
    console.log(`  ✅ ${tabela.nome}`);
  }

  console.log("\n🎉 Dados completos criados com sucesso!");
  console.log("\n📊 Collections criadas/atualizadas:");
  console.log("  ✅ categorias (5)");
  console.log("  ✅ fornecedores (3)");
  console.log("  ✅ clientes (3)");
  console.log("  ✅ contas_pagar (3)");
  console.log("  ✅ contas_receber (2)");
  console.log("  ✅ promocoes (2)");
  console.log("  ✅ caixas (1)");
  console.log("  ✅ tabelas_preco (3)");
}

adicionarDados().catch(console.error);
