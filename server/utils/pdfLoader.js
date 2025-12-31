import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export const loadPDFFromBuffer = async (buffer) => {
  // Convert Node.js Buffer to Uint8Array (what pdf.js expects)
  const uint8Array = new Uint8Array(buffer);

  // Load the document
  const loadingTask = getDocument({ data: uint8Array });
  const pdfDocument = await loadingTask.promise;

  const documents = [];

  // Loop through all pages
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const content = await page.getTextContent();

    // Extract text strings and join them
    const text = content.items.map((item) => item.str).join(" ");

    // Create a "Document" object similar to what LangChain expects
    documents.push({
      pageContent: text,
      metadata: {
        loc: { pageNumber: i },
        // Add total pages if needed
        pdf: { totalPages: pdfDocument.numPages },
      },
    });
  }

  return documents;
};
