import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const reportSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string" },
    overallScore: { type: "number" },
    estimatedLevel: { type: "string" },
    grammarScore: { type: "number" },
    grammarStrength: { type: "string" },
    grammarGrowth: { type: "string" },
    readingScore: { type: "number" },
    readingStrength: { type: "string" },
    readingGrowth: { type: "string" },
    listeningScore: { type: "number" },
    listeningStrength: { type: "string" },
    listeningGrowth: { type: "string" },
    writingScore: { type: "number" },
    writingStrength: { type: "string" },
    writingGrowth: { type: "string" },
    speakingScore: { type: "number" },
    speakingStrength: { type: "string" },
    speakingGrowth: { type: "string" },
    summary: { type: "string" },
    recommendations: { type: "array", items: { type: "string" } },
    studentMessage: { type: "string" },
    methodology: { type: "string" },
  },
  required: ["verdict","overallScore","estimatedLevel","grammarScore","grammarStrength","grammarGrowth","readingScore","readingStrength","readingGrowth","listeningScore","listeningStrength","listeningGrowth","writingScore","writingStrength","writingGrowth","speakingScore","speakingStrength","speakingGrowth","summary","recommendations","studentMessage","methodology"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!client) return res.status(503).json({ error: "OPENAI_API_KEY is not configured" });

  try {
    const payload = req.body || {};
    const response = await client.responses.create({
      model: "gpt-5.2",
      input: [
        {
          role: "system",
          content: [{
            type: "input_text",
            text: "Eres un evaluador CEFR/MCER. Trabajas con scoring objetivo + rúbricas analíticas. Debes devolver solo JSON válido y mantener un tono claro, profesional, cálido y específico para padres/escuela en español."
          }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: JSON.stringify(payload) }]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "cefr_report",
          schema: reportSchema,
        },
      },
    });

    res.status(200).json(JSON.parse(response.output_text));
  } catch (error) {
    res.status(500).json({ error: error.message || "Evaluation failed" });
  }
}
