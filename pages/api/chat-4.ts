import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import { PassThrough } from "stream";

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
    body: JSON.stringify({ user_input: prompt }),
  });

  if (!response.body) {
    res.status(500).send("No response body");
    return;
  }

  const stream = new PassThrough();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  response.body.pipe(stream);
  stream.pipe(res);
}
