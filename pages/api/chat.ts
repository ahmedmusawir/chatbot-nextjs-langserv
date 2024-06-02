import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

interface OpenAIResponse {
  output?: {
    content?: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt } = req.body;

  // const response = await fetch("http://127.0.0.1:8000/openai/invoke", {
  const response = await fetch("http://127.0.0.1:8000/openai/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: { topic: prompt } }),
  });

  if (!response.ok) {
    res
      .status(response.status)
      .json({ error: "Failed to fetch from LangServe" });
    return;
  }

  const data: OpenAIResponse = (await response.json()) as OpenAIResponse;

  if (data && data.output && data.output.content) {
    const content = data.output.content;
    res.status(200).json({ content });
  } else if (data && data.error) {
    res.status(500).json({ error: data.error });
  } else {
    res.status(500).json({ error: "No content found in response" });
  }
}
