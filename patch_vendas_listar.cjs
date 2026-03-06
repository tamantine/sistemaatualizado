const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/services/firebaseService.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('listarPorCaixa')) {
    const searchString = "      console.error('[Firebase] Erro ao listar vendas de hoje:', error);\\r\\n      return [];\\r\\n    }\\r\\n  },\\r\\n};";
    const searchStringLF = "      console.error('[Firebase] Erro ao listar vendas de hoje:', error);\\n      return [];\\n    }\\n  },\\n};";

    const insertString = \`      console.error('[Firebase] Erro ao listar vendas de hoje:', error);
      return [];
    }
  },

  async listarPorCaixa(caixaId: string): Promise<Venda[]> {
    try {
      const q = query(
        collection(db, 'vendas'),
        where('caixa_id', '==', caixaId)
      );
      const snapshot = await getDocs(q);
      const vendas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Venda[];
      return vendas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('[Firebase] Erro ao listar vendas por caixa:', error);
      return [];
    }
  },
};\`;

    if (content.includes(searchString)) {
        content = content.replace(searchString, insertString);
        fs.writeFileSync(file, content, 'utf8');
        console.log("Success CRLF");
    } else if (content.includes(searchStringLF)) {
        content = content.replace(searchStringLF, insertString);
        fs.writeFileSync(file, content, 'utf8');
        console.log("Success LF");
    } else {
        console.log("Not found any");
    }
} else {
    console.log("Already patched");
}
