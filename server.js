import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/gerar-mensagem", async (req, res) => {
  try {
    const { whatsappID, pergunta } = req.body;

    if (!whatsappID || !pergunta) {
      return res.status(400).json({ error: "Faltam parâmetros obrigatórios." });
    }

    // Chamada para API do ChatGPT
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "system", content: pergunta }],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const respostaChatGPT = openaiResponse.data.choices[0].message.content;

    // Enviar resposta para WhatsApp via Gupshup
    await axios.post(
      "https://api.gupshup.io/sm/api/v1/msg",
      {
        channel: "whatsapp",
        source: process.env.GUPSHUP_SOURCE,
        destination: whatsappID,
        message: respostaChatGPT,
        "msg_type": "text",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GUPSHUP_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.json({ status: "Mensagem enviada!", resposta: respostaChatGPT });
  } catch (error) {
    console.error("Erro no servidor:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
