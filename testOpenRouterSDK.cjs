const fs = require('fs');

async function testar() {
  const envFile = fs.readFileSync('c:\\Users\\bruno\\Downloads\\sistema\\sistema_github\\.env.local', 'utf-8');
  const apiKey = envFile.split('=')[1].trim();

  // Pixel 1x1 base64
  const b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  // Importar o pacote instalado pelo Vite/NPM
  const { OpenRouter } = await import('@openrouter/sdk');
  
  const openrouter = new OpenRouter({ apiKey });

  try {
    const result = await openrouter.chat.send({
      model: "black-forest-labs/flux.2-flex",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Turn this into a big red block" },
            { type: "image_url", image_url: { url: b64 } }
          ]
        }
      ],
      modalities: ["image"]
    });
    console.log(result);
  } catch(e) {
    console.error("ERRO OPEN ROUTER SDK:", e.message || e);
  }
}

testar();
