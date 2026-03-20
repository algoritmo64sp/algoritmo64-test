import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!client) return res.status(503).json({ error: "OPENAI_API_KEY is not configured" });

  try {
    const { audioBase64, mimeType = "audio/webm", fileName = "student-audio.webm" } = req.body || {};
    if (!audioBase64) return res.status(400).json({ error: "Missing audioBase64" });

    const bytes = Buffer.from(audioBase64, "base64");
    const file = new File([bytes], fileName, { type: mimeType });

    const transcript = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    res.status(200).json({ text: transcript.text });
  } catch (error) {
    res.status(500).json({ error: error.message || "Transcription failed" });
  }
}
