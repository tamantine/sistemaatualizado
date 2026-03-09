import { produtosService, clientesService, dashboardService } from './database';

const apiKey = "AIzaSyCLYI6Wjkesevok92WNeVyWxZxWo3mJydA"; // Chave fixa Google AI Studio, mas recomendável mover para .env no futuro
const baseURL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Definição das ferramentas (Functions) que a IA poderá chamar
const tools = [
  {
    type: "function",
    function: {
      name: "listar_produtos",
      description: "Retorna a lista de todos os produtos cadastrados no sistema, incluindo ID, nome, preço e estoque.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "atualizar_produto",
      description: "Atualiza informações de um produto específico com base no seu ID (como preco_venda, estoque_atual, nome).",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "O ID único do produto a atualizar." },
          preco_venda: { type: "number", description: "O novo preço de venda do produto." },
          estoque_atual: { type: "number", description: "A nova quantidade em estoque." }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "listar_clientes",
      description: "Retorna a lista de clientes cadastrados no sistema (nome, telefone, cpf).",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "obter_metricas_dashboard",
      description: "Retorna as métricas gerais de vendas do dia, ticket médio, e alertas de estoque baixo.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  }
];

// O Prompt de Sistema define como a IA deve se comportar
const systemPrompt = `Você é o 'Assistente Bom Preço', o agente LLM oficial do sistema Hortifruti Bom Preço, alimentado pelo modelo oficial Gemini 2.5 Flash do Google AI Studio.
Você está integrado DIRETAMENTE ao banco de dados do sistema, podendo realizar consultas REAIS e buscar dados em TEMPO REAL através das ferramentas fornecidas a você.

Regras Estritas:
1. Responda SEMPRE em Português (PT-BR) de forma amigável, clara e profissional.
2. Em caso de dúvidas sobre produtos, clientes ou status, CHAME as funções (tools) do sistema para ter clareza. NÃO INVENTE NADA.
3. Se o usuário pedir para alterar preço, nome ou estoque de um produto, USE a função 'atualizar_produto'. Importante: Certifique-se de usar a string de ID exata do banco listando os produtos se necessário.
4. Ao consultar e responder sobre listagens, mostre apenas as informações mais relevantes ou formate como uma tabela limpa.
5. Avise cordialmente o usuário as ações que tomou no sistema.`;

// Executa a função local baseada no nome chamado pela IA
async function executeToolCall(functionName: string, args: string): Promise<any> {
  const parsedArgs = JSON.parse(args || '{}');
  
  try {
    switch (functionName) {
      case "listar_produtos":
        return await produtosService.listar();
      case "atualizar_produto": {
        const { id, ...updates } = parsedArgs;
        console.log(`[LLM Tool] Atualizando Produto ${id} com:`, updates);
        return await produtosService.atualizar(id, updates);
      }
      case "listar_clientes":
        return await clientesService.listar();
      case "obter_metricas_dashboard":
        return await dashboardService.obterMetricas();
      default:
        return { error: `Ferramenta '${functionName}' não localizada no sistema.` };
    }
  } catch (err: any) {
    console.error(`[LLM Tool Error] Falha ao executar ${functionName}:`, err);
    return { error: err.message || "Erro desconhecido ao acionar banco de dados." };
  }
}

export async function processChatWithAgent(messages: any[]): Promise<string> {
  if (!apiKey) {
    throw new Error("Chave de API não configurada no código.");
  }

  // Google Generative Language nativo na camada de compatibilidade OpenAI
  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ];

  try {
    const response = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash", // Melhor modelo rápido, atualizado e gratuito da Google listado via REST OpenAI-compat
        messages: apiMessages,
        tools: tools,
        tool_choice: "auto"
      })
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(`Erro API Gemini: ${result.error.message || JSON.stringify(result.error)}`);
    }

    const message = result.choices?.[0]?.message;
    
    // Ferramentas requeridas
    if (message?.tool_calls && message.tool_calls.length > 0) {
      console.log(`[LLM] Google Gemini solicitou chamada(s) de função.`);
      
      const toolCallContext = [...apiMessages, message];
      
      for (const toolCall of message.tool_calls) {
        const execResult = await executeToolCall(toolCall.function.name, toolCall.function.arguments);
        
        // Retorno formatado pro gemini (Role tool)
        toolCallContext.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: toolCall.function.name,
          content: JSON.stringify(execResult).substring(0, 3000)
        });
      }

      // 2ª rodada para Gemini sumarizar
      const finalResponse = await fetch(baseURL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash", 
          messages: toolCallContext
        })
      });

      const finalResult = await finalResponse.json();
      if (finalResult.error) throw new Error(`Google Final Parse Error: ${finalResult.error.message}`);
      
      return finalResult.choices?.[0]?.message?.content || "Desculpe, a IA do Google não enviou a resposta conclusiva.";
    }

    // Direct Return sem Tool
    return message?.content || "Sem resposta.";
    
  } catch (error: any) {
    console.error(`[LLM Agent Error] Error communicating with Google AI Studio:`, error);
    throw new Error(error.message || "Falha generalizada no modelo do Google.");
  }
}
