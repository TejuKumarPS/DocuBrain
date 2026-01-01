import { loadPDFFromBuffer } from "../utils/pdfLoader.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {
  generateAndStoreEmbedding,
  deleteSessionDocs,
  cleanupOldSessions,
} from "../services/embeddingService.js";

export const uploadDocument = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Check if the user uploaded a file
    if (!req.file || !sessionId) {
      return res
        .status(400)
        .json({ error: "No file uploaded or sessionId missing" });
    }

    console.log(
      `Processing file: ${req.file.originalname} for session: ${sessionId}`
    );

    cleanupOldSessions();

    await deleteSessionDocs(sessionId);

    // Load PDF using loadPDFFromBuffer
    const docs = await loadPDFFromBuffer(req.file.buffer);

    console.log(`PDF loaded. Pages: ${docs.length}`);

    // Split the text into chunks for AI
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments(docs);

    console.log(`Split into ${chunks.length} chunks`);

    if(chunks.length === 0) {
      return res.status(400).json({ error: "No content found in the PDF." });
    }

    // Loop throught the chunks and save to DB
    let savedCount = 0;

    for (const chunk of chunks) {
      const metadata = {
        source: req.file.originalname,
        sessionId: sessionId,
        ...chunk.metadata,
      };

      await generateAndStoreEmbedding(chunk.pageContent, metadata);
      savedCount++;
    }

    res.status(200).json({
      message: "Document processed successfully",
      chunks: savedCount,
      filename: req.file.originalname,
    });
  } catch (err) {
    console.error("Error processing doucment: ", err);
    res.status(500).json({ error: "Internal server error processing PDF" });
  }
};
