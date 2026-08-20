const { PDFParse } = require("pdf-parse");

const extractTextFromPdfUrl = async (pdfUrl) => {
  const response = await fetch(pdfUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch PDF");
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  const parser = new PDFParse({ data: buffer });

  const result = await parser.getText();

  await parser.destroy();

  return result.text;
};

module.exports = { extractTextFromPdfUrl };