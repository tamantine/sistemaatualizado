const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/database.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Insert new services into import
content = content.replace(
  '    pedidosCompraService,',
  '    pedidosCompraService,\r\n    cotacoesService,'
).replace(
  '    promocoesService,',
  '    promocoesService,\r\n    tabelasPrecoService,'
);

// Do the same for the first export block
content = content.replace(
  /export \{\r?\n([^}]+)pedidosCompraService,\r?\n([^}]+)\};/g,
  (match, p1, p2) => \`export {\\n\${p1}pedidosCompraService,\\n    cotacoesService,\\n\${p2}}\;\`
).replace(
  /export \{\r?\n([^}]+)promocoesService,\r?\n([^}]+)\};/g,
  (match, p1, p2) => \`export {\\n\${p1}promocoesService,\\n    tabelasPrecoService,\\n\${p2}}\;\`
);

// Do the same for the default export block
content = content.replace(
  /export default \{\r?\n([^}]+)pedidosCompraService,\r?\n([^}]+)\};/g,
  (match, p1, p2) => \`export default {\\n\${p1}pedidosCompraService,\\n    cotacoesService,\\n\${p2}}\;\`
).replace(
  /export default \{\r?\n([^}]+)promocoesService,\r?\n([^}]+)\};/g,
  (match, p1, p2) => \`export default {\\n\${p1}promocoesService,\\n    tabelasPrecoService,\\n\${p2}}\;\`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('database.ts updated successfully!');
