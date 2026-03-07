import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// A chave exposta no .env.local é embutida na requisição pelo Vite
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

export interface DadosEncarte {
  produto: string;
  unidade: string;
  preco: string;
}

export async function gerarEncarteIA(imageBase64: string, dados: DadosEncarte): Promise<string> {
  if (!apiKey) {
    throw new Error("A chave da API OpenRouter não está configurada.");
  }

  const systemPrompt = `Você é um Designer Gráfico Sênior de Supermercados.
Tarefa: Inpainting/Image-to-Image. Vou anexar um Encarte de Oferta base.
Ação: Analise o layout base, REMOVA o produto e o preço originais, MANTENHA o fundo e o design da marca.
INCLUA o novo produto: '${dados.produto}'.
INCLUA o novo preço: 'R$ ${dados.preco} / ${dados.unidade}'.
A proporção final DEVE ser 9:16 (vertical para stories). Garanta estética de alta qualidade publicitária.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Hortifruti Master"
      },
      body: JSON.stringify({
        model: "black-forest-labs/flux.2-flex",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: systemPrompt },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ]
      })
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(`Erro OpenRouter: ${result.error.message || JSON.stringify(result.error)}`);
    }

    const message = result.choices?.[0]?.message;
    if (message && message.images && message.images.length > 0) {
      const generatedImageUrl = message.images[0].image_url.url;
      
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
