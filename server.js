require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY;
const GUPSHUP_NUMBER = process.env.GUPSHUP_NUMBER;

// Rota para receber os dados do ManyChat
app.post("/gerar-mensagem", async (req, res) => {
    const { tipo_de_conteudo, nicho, subnicho, nivel_de_comunicacao, estilo_de_conteudo, formulas_narrativas, tipo_de_tema, gancho, tipo_de_cta, numero_usuario } = req.body;

    const prompt = `Crie um ${tipo_de_conteudo} para o nicho ${nicho} - ${subnicho}, direcionado para ${nivel_de_comunicacao}. O tom deve ser ${estilo_de_conteudo}, seguindo ${formulas_narrativas}. O conteúdo deve começar com ${gancho}, abordar ${tipo_de_tema} e finalizar com ${tipo_de_cta}.`;

    try {
        // Chamada para a API do ChatGPT
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300
        }, {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
        });

        const respostaChatGPT = response.data.choices[0].message.content;

        // Enviar resposta para o WhatsApp via Gupshup
        await axios.post("https://api.gupshup.io/sm/api/v1/msg", null, {
            headers: { "apikey": GUPSHUP_API_KEY },
            params: {
                channel: "whatsapp",
                source: GUPSHUP_NUMBER,
                destination: numero_usuario,
                message: respostaChatGPT,
                msg_type: "text"
            }
        });

        res.json({ status: "Mensagem enviada para WhatsApp!", resposta: respostaChatGPT });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
