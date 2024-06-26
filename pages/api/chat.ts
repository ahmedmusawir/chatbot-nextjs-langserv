import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt } = req.body;

  const response = await fetch("http://127.0.0.1:8000/openai/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: { topic: prompt } }),
  });

  if (!response.body) {
    res.status(500).send("No response body");
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  response.body.on("data", (chunk) => {
    res.write(chunk);
  });

  response.body.on("end", () => {
    res.end();
  });

  response.body.on("error", (err) => {
    res.status(500).send(`Error: ${err.message}`);
  });
}
