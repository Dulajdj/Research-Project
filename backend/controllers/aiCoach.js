import axios from "axios";

export const askCoach = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "Messages required" });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert interview coach with 15+ years experience coaching candidates at top companies. Give practical, specific, actionable advice. Keep responses focused and under 200 words. Use bullet points when listing multiple tips. Be encouraging but honest."
          },
          ...messages
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("AI Coach error:", error.response?.data || error.message);
    res.status(500).json({ message: "Error getting AI response" });
  }
};