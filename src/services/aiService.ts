import { OpenRouter } from "@openrouter/sdk";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// A chave exposta no .env.local não sobe para o GitHub e é embutida na requisição pelo Vite
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

let openrouter: any;
if (apiKey) {
    try {
        openrouter = new OpenRouter({ apiKey });
    } catch (e: any) {
        console.warn("OpenRouter SDK error info: ", e.message);
    }
}

export interface DadosEncarte {
  produto: string;
  unidade: string;
  preco: string;
}

export async function gerarEncarteIA(imageBase64: string, dados: DadosEncarte): Promise<string> {
  if (!apiKey || !openrouter) {
    throw new Error("A chave da API OpenRouter não está configurada no .env.local.");
  }

  // Montando a narrativa para a IA baseada nas intenções do lojista
  const systemPrompt = `Você é um Designer Gráfico Sênior de Supermercados.
Tarefa: Inpainting/Image-to-Image. Vou anexar um Encarte de Oferta base.
Ação: Analise o layout base, REMOVA o produto e o preço originais, MANTENHA o fundo e o design da marca.
INCLUA o novo produto: '${dados.produto}'.
INCLUA o novo preço: 'R$ ${dados.preco} / ${dados.unidade}'.
A proporção final DEVE ser 9:16 (vertical para stories). Garanta estética de alta qualidade publicitária.`;

  try {
    // Comunicação com o OpenRouter usando o modelo flux.2-flex
    const result = await openrouter.chat.send({
      model: "black-forest-labs/flux.2-flex",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image_url", image_url: { url: imageBase64 } } // A API deve interpretar isso como referência gráfica
          ]
        }
      ],
      modalities: ["image"]
    });

    const message = result.choices[0].message;
    if (message && message.images && message.images.length > 0) {
      const generatedImageUrl = message.images[0].image_url.url;
      
      // Salva log da transação no Firestore (histórico de encartes)
      await addDoc(collection(db, 'encartes_ia'), {
          produto: dados.produto,
          preco: dados.preco,
          unidade: dados.unidade,
          data_geracao: new Date().toISOString(),
          imagem_original_usada: true,
          url_resultado: generatedImageUrl
      });

      return generatedImageUrl;
    } else {
      throw new Error("A IA não retornou nenhuma imagem para este encarte.");
    }
  } catch (error: any) {
    console.error("[aiService] Erro ao comunicar com OpenRouter:", error);
    throw new Error(error.message || "Falha na geração pela IA.");
  }
}
