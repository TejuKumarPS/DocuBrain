import pool from "../config/db.js";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

const embeddingModel = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

// a function that takes text chunk and metadata, generates embedding of the chunk and store text chunk, embedding and metadata into the database

export const generateAndStoreEmbedding = async (text, metadata) => {
  try {
    if (!text || typeof text != "string" || text.trim().length === 0) {
      console.log("Skipping empty or invalid text chunk");
      return null;
    }

    const cleanText = text.replace(/\n/g, " ");
    const vector = await embeddingModel.embedQuery(cleanText);
    console.log(`Vector generated! Length: ${vector.length}`);

    const queryText = `INSERT INTO document_embeddings (content, metadata, embedding)
  VALUES ($1, $2, $3)
  RETURNING id`;

    //pg vector expects the vector in string format
    const vectorString = JSON.stringify(vector);

    const res = await pool.query(queryText, [
      cleanText,
      metadata,
      vectorString,
    ]);

    console.log(`Saved chunk ID: ${res.rows[0].id}`);
    return res.rows[0].id;
  } catch (err) {
    console.error("Error in embedding service: ", err);
    throw err;
  }
};

export const deleteSessionDocs = async (sessionId) => {
  try {
    await pool.query(
      `DELETE FROM document_embeddings WHERE metadata->>'sessionId' = $1`,
      [sessionId]
    );
    console.log(`Deleted documents for session ID: ${sessionId}`);
  } catch (err) {
    console.error("Error deleting session documents: ", err);
    throw err;
  }
};

export const searchSimilarDocuments = async (queryText, sessionId) => {
  try {
    const queryVector = await embeddingModel.embedQuery(queryText);

    const vectorString = JSON.stringify(queryVector);

    const sql = `
    SELECT content, metadata
    FROM document_embeddings
    WHERE metadata->>'sessionId' = $1
    ORDER BY embedding <=> $2
    LIMIT 5;
    `;

    const res = await pool.query(sql, [sessionId, vectorString]);
    return res.rows;
  } catch (err) {
    console.error("Error in search service: ", err);
    throw err;
  }
};
