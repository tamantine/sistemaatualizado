import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatarMoeda, formatarDataHora } from './formatters';
import type { Caixa, Venda, MovimentacaoCaixa } from '../types';

export const gerarRelatorioFechamentoPDF = (caixa: Caixa, vendas: Venda[], movimentacoes: MovimentacaoCaixa[]) => {
  const doc = new jsPDF();
  
  // Cores institucionais
  const colors = {
    primary: [46, 204, 113], // Verde Brand
    secondary: [52, 73, 94],
    dark: [44, 62, 80]
  };

  // 1. Cabeçalho
  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('Hortifruti Master', 14, 22);
  
  doc.setFontSize(14);
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.text('Relatório de Fechamento de Caixa', 14, 30);

  // 2. Informações Gerais
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Caixa Número: #${caixa.numero || 1}`, 14, 40);
  doc.text(`Operador(a): ${caixa.operador_nome || 'N/A'}`, 14, 46);
  doc.text(`Abertura: ${formatarDataHora(caixa.aberto_em || new Date().toISOString())}`, 14, 52);
  doc.text(`Fechamento: ${formatarDataHora(caixa.fechado_em || new Date().toISOString())}`, 14, 58);

  // 3. Resumo Financeiro
  doc.setFontSize(12);
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.text('Resumo Financeiro (Por Forma de Pagamento)', 14, 70);

  autoTable(doc, {
    startY: 74,
    theme: 'grid',
    headStyles: { fillColor: colors.secondary, textColor: 255 },
    head: [['Forma de Pagamento', 'Valor Arrecadado']],
    body: [
      ['Dinheiro', formatarMoeda(caixa.valor_dinheiro || 0)],
      ['PIX', formatarMoeda(caixa.valor_pix || 0)],
      ['Cartão de Crédito', formatarMoeda(caixa.valor_cartao_credito || 0)],
      ['Cartão de Débito', formatarMoeda(caixa.valor_cartao_debito || 0)],
      [{ content: 'Total Vendas no Sistema', styles: { fontStyle: 'bold' } }, { content: formatarMoeda((caixa.total_vendas || 0)), styles: { fontStyle: 'bold' } }],
    ]
  });

  // 4. Movimentações de Caixa
  let finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.text('Movimentações (Sangrias e Suprimentos)', 14, finalY);

  if (movimentacoes.length > 0) {
    const movData = movimentacoes.map(m => [
      m.tipo.toUpperCase(),
      formatarDataHora(m.created_at).split(' ')[1],
      formatarMoeda(m.valor),
      m.motivo || '-'
    ]);

    autoTable(doc, {
      startY: finalY + 4,
      theme: 'striped',
      headStyles: { fillColor: [189, 195, 199], textColor: 0 },
      head: [['Tipo', 'Hora', 'Valor', 'Motivo']],
      body: movData
    });
    finalY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Nenhuma movimentação registrada nesta sessão.', 14, finalY + 6);
    finalY += 15;
  }

  // 5. Histórico de Vendas Realizadas
  if (finalY > 260) {
    doc.addPage();
    finalY = 20;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.text('Histórico de Vendas Concluídas', 14, finalY);

  if (vendas.length > 0) {
    const vendasValidas = vendas.filter(v => v.status === 'finalizada' || !v.status);
    
    if (vendasValidas.length > 0) {
        const vendasData = vendasValidas.map((v, i) => [
          String((v.numero_venda || i + 1)).padStart(3, '0'),
          formatarDataHora(v.created_at).split(' ')[1],
          (v.forma_pagamento || 'N/A').toUpperCase(),
          formatarMoeda(v.total)
        ]);

        autoTable(doc, {
          startY: finalY + 4,
          theme: 'striped',
          headStyles: { fillColor: colors.secondary, textColor: 255 },
          head: [['Recibo', 'Hora', 'Pagamento', 'Total']],
          body: vendasData,
          foot: [['', '', 'TOTAL GERAL', formatarMoeda(caixa.total_vendas || 0)]],
          footStyles: { fillColor: colors.primary, textColor: 255, fontStyle: 'bold' }
        });
    } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Apenas vendas canceladas/abertas nesta sessão.', 14, finalY + 6);
    }
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Nenhuma venda computada nesta janela de caixa.', 14, finalY + 6);
  }

  // 6. Rodapé Final
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const paginaY = doc.internal.pageSize.getHeight() - 10;
  doc.text(`Gerado pelo Sistema em: ${formatarDataHora(new Date().toISOString())}`, 14, paginaY);

  doc.save(`Relatorio_FechamentoCX_Caixa${caixa.numero}_${formatarDataHora(new Date().toISOString()).replace(/[\/\s:]/g, '')}.pdf`);
};
