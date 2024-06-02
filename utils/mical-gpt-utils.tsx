import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import * as cheerio from "cheerio";
import * as puppeteer from "puppeteer";
import { Document } from "langchain/document";

export async function processURLToFaissVectorStore(url: string) {
  const logs: string[] = []; // Array to store log messages

  const customLog = (message: string) => {
    console.log(message); // Log to console
    logs.push(message); // Store in the logs array
  };

  customLog("Making the call to:" + url);

  // WEB SCRAPING PUPPETEER BLOCK
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: "new",
    },
    async evaluate(page: puppeteer.Page, browser: puppeteer.Browser) {
      try {
        await page.goto(url, { waitUntil: "networkidle0" });
        const textContent = await page.evaluate(() => {
          // Clean up the HTML content and extract the text
          const bodyElement = document.querySelector("body");
          return bodyElement ? bodyElement.textContent : "";
        });
        await browser.close();
        return textContent || "";
      } catch (error) {
        console.error("Error occurred while loading the page: ", error);
        await browser.close();
        return ""; // return empty string in case of an error
      }
    },
  });

  customLog("Loading URL to Docs...");

  const urlDocs = await loader.load();
  const pageContent = urlDocs[0].pageContent; // Access the extracted text content

  customLog("Loading the Page Content from Puppeteer...");

  // CHEERIO BASED CLEAN UP BLOCK
  // Load the HTML content into cheerio
  const $ = cheerio.load(pageContent);

  $("script, style").remove(); // Remove unnecessary elements

  // Further clean-up using regular expressions (example)
  const cleanedText = $("body")
    .html()
    ?.replace(/<style[^>]*>.*<\/style>/gms, "");

  // Load the cleaned HTML again to extract text
  const cleaned$ = cheerio.load(cleanedText!);

  // Extract the text from the HTML content
  const textContent = cleaned$("body").text();

  console.log("Cleaned up the Text Content with Cheerio...", textContent);

  const docs = textContent.replace(/[^\x20-\x7E]+/g, ""); // Remove non-ASCII characters

  customLog("Splitting up the Documents in smaller chunks...");

  // Create Document instances
  const documents = [new Document({ pageContent: docs })];

  // TEXT SPLITTING BLOCK
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 50,
  });

  const splitDocuments = await splitter.splitDocuments(documents);

  customLog("Creating Vector Embeddings in smaller batches...");

  // VECTOR EMBEDDING BLOCK
  // Initialize OpenAI embeddings
  const embeddings = new OpenAIEmbeddings();
  // Process and store embeddings in batches
  const batchSize = 10; // Adjust based on your needs
  let allDocs = [];

  for (let i = 0; i < splitDocuments.length; i += batchSize) {
    const batch = splitDocuments.slice(i, i + batchSize);

    // Add batch documents to allDocs array
    allDocs.push(...batch);
  }

  customLog("Creating the Faiss Vector Store...");

  // VECTO STORE CREATION BLOCK
  // Load the docs into the vector store
  const vectorStore = await FaissStore.fromDocuments(allDocs, embeddings);

  // Creating the Faiss Vector Store
  await vectorStore.save("./store/faiss-vector-store/");

  customLog("Faiss Vector store created successfully!");

  return logs;
}
