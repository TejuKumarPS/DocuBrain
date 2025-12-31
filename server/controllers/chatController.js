import { ChatGroq } from "@langchain/groq";
import { searchSimilarDocuments } from "../services/embeddingService.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const chatModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
  streaming: true,
});

export const chatWithDocument = async (req, res) => {
  try {
    const { query, history, sessionId } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!query) {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    let searchSocket = query;

    const hasUserHistory = history.some((m) => m.role === "user");

    if (hasUserHistory) {
      console.log("Rewriting the query based on chat history");

      const rephrasePrompt = `
        Given the following converstatioin history and follow-up question to be a standalone question.
        Do NOT answer the question, just rewrite it to include necessary context from the history (like names, places, etc.).

        Chat History:
        ${history.map((m) => `${m.role}: ${m.content}`).join("\n")}

        Follow-up Input: ${query}

        Standalone question:`;

      const rephrasedResponse = await chatModel.invoke([
        [
          "system",
          "You are a helpful assistant that rewrites user queries to be standalone questions.",
        ],
        ["human", rephrasePrompt],
      ]);

      if (rephrasedResponse.content) searchSocket = rephrasedResponse.content;
      console.log(`Original: "${query}" -> Rephrased: "${searchSocket}"`);
    }

    // Find relevant text chunks from DB
    const similarDocs = await searchSimilarDocuments(searchSocket, sessionId);

    console.log("Found similar docs ", similarDocs.length);

    // Create the context text by combining top chunks
    const contextText =
      similarDocs.map((doc) => doc.content).join("\n\n---\n\n") ||
      "No relevant context found in the document.";

    const sourcesData = JSON.stringify({
      type: "sources",
      sources: similarDocs.map((d) => d.metadata),
    });
    res.write(`data: ${sourcesData}\n\n`);

    // Prompt to send to the llm
    const systemPrompt = `
      You are an intelligent AI assistant for a system called DocuBrain.
      You are given a specific Context extracted from a PDF document.
      
      Rules:
      1. Answer the user's question based only on the Context provided below.
      2. If the context doesn't contain the answer, say "I can't find that in the document."
      3. Keep the answer professional.
      4. Be conversational but professional.
      
      CONTEXT:
      ${contextText}`;

    const chatHistory = (history || []).map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
    );

    // Send API call
    const stream = await chatModel.stream([
      ["system", systemPrompt],
      ["human", searchSocket],
    ]);

    for await (const chunk of stream) {
      if (chunk.content) {
        const tokenData = JSON.stringify({
          type: "content",
          content: chunk.content,
        });
        res.write(`data: ${tokenData}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Stream Error:", error);
    res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    res.end();
  }
};
