import openAiService from "@/services/openAiService";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { prompt } = req.body;
  // Create a new instance of the OpenAI model
  const model = openAiService(res, 0.5, "gpt-4-1106-preview");

  // Creating the Embedding Object
  const embeddings = new OpenAIEmbeddings();

  // Loading the Faiss Vector Store
  const vectorStore = await FaissStore.load(
    "../../store/faiss-vector-store",
    embeddings
  );

  // Creating the Retrieval Chain (RAG Part 2)
  const chain = new RetrievalQAChain({
    combineDocumentsChain: loadQAStuffChain(model),
    retriever: vectorStore.asRetriever(),
    returnSourceDocuments: true,
  });

  await chain.invoke({
    query: prompt,
  });

  res.end();
}
