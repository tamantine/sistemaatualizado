const fs = require('fs');

async function testar() {
  const envFile = fs.readFileSync('c:\\Users\\bruno\\Downloads\\sistema\\sistema_github\\.env.local', 'utf-8');
  const apiKey = envFile.split('=')[1].trim();

  // Pixel 1x1 base64
  const b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const payload = {
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
    // modalities: ["image"] // Let's omit this first
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "Testing"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log("TEST 1 - Content Array without modalities:", JSON.stringify(data, null, 2));

  // Test 2
  payload.modalities = ["image"];
  const res2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  });
  console.log("TEST 2 - Content Array WITH modalities:", JSON.stringify(await res2.json(), null, 2));
}

testar();
