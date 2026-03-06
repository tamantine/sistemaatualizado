const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/firebaseService.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('export const sanitizeData')) {
    const helperParams = \`
// =============================================
// SANITIZAÇÃO GLOBAL CONTRA UNDEFINED
// O Firestore lança erro silencisoso se receber propriedades 'undefined'.
// Esta barreira limpa as impurezas antes de entrarem nas funções nativas.
// =============================================
export const sanitizeData = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeData);
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, sanitizeData(v)])
  );
};

const addDoc = (ref: any, data: any) => firestoreAddDoc(ref, sanitizeData(data));
const updateDoc = (ref: any, data: any) => firestoreUpdateDoc(ref, sanitizeData(data));
\`;
    const regexFindImports = /import\s*\{\s*collection,\s*doc,\s*getDocs,\s*getDoc,\s*addDoc,\s*updateDoc,\s*deleteDoc,\s*query,\s*where,\s*orderBy,\s*limit\s*\}\s*from\s*'firebase\/firestore';/;
    
    let novaImportacao = "import { \\n  collection, doc, getDocs, getDoc, addDoc as firestoreAddDoc, updateDoc as firestoreUpdateDoc, deleteDoc, query, where, orderBy, limit\\n} from 'firebase/firestore';";

    content = content.replace(regexFindImports, novaImportacao);
    
    const regexToInsert = /function getCurrentTimestamp\(\) \{/;
    content = content.replace(regexToInsert, helperParams + '\\nfunction getCurrentTimestamp() {');

    // Extra: We need to remove the previous manual 'removeUndefined' implemented inside criarCompleta
    content = content.replace(/const removeUndefined = \(obj: any\) => \r?\n?\s*Object\.fromEntries\(Object\.entries\(obj\)\.filter\(\(\[_, v\]\) => v !== undefined\)\);/g, '');
    // Replace calls in criarCompleta
    content = content.replace(/\.\.\.removeUndefined\(([^)]+)\),/g, '...$1,');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('firebaseService.ts atualizado com sucesso e wrapper injetado!');
} else {
    console.log('sanitizeData já existe no arquivo!');
}
