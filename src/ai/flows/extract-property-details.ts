'use server';

/**
 * @fileOverview AI flow to perform OCR on a document and extract raw text.
 * - extractTextFromDocument - A function that handles the OCR process.
 */

import {ai} from '@/ai/genkit';
import { OcrInputSchema, OcrOutputSchema, type OcrInput, type OcrOutput } from '@/types';


export async function extractTextFromDocument(input: OcrInput): Promise<OcrOutput> {
  return ocrFlow(input);
}

const ocrFlow = ai.defineFlow(
  {
    name: 'ocrFlow',
    inputSchema: OcrInputSchema,
    outputSchema: OcrOutputSchema,
  },
  async (input) => {
    // We use a multi-part prompt and a powerful model to handle complex documents.
    const llmResponse = await ai.generate({
      // Use Gemini 1.5 Pro for its advanced multimodal and large context capabilities,
      // which is ideal for handling various document formats (PDF, DOCX, images) up to large sizes.
      model: 'googleai/gemini-1.5-pro-latest',
      prompt: [
        {
            text: `
                **Task: High-Fidelity Document Text Extraction**

                You are an AI assistant specialized in Optical Character Recognition (OCR) and document analysis. Your task is to extract *all* textual content from the provided document (which could be a PDF, DOCX, or an image file) with the highest possible accuracy.

                **Instructions:**
                1.  **Be Meticulous:** Process the entire document from start to finish. Do not skip any pages, sections, or text fragments, no matter how small or where they are located (headers, footers, sidebars).
                2.  **Preserve Structure:** Maintain the original structure of the text as much as possible. Preserve line breaks, paragraphs, and spacing between sections. If you encounter tables, represent their structure accurately, using spacing or tabs to keep columns aligned.
                3.  **Handle Complex Layouts:** The document may contain complex layouts with multiple columns, text boxes overlaid on images, headers, footers, and tables. You must extract text from all these elements.
                4.  **No Summarization or Alteration:** Do not summarize, interpret, or change the content. The goal is to get a raw, complete, and accurate text dump of everything in the document.
                5.  **Unreadable Content:** If a section of the document is genuinely unreadable or contains no text (e.g., a blank image), simply ignore it and proceed. Do not invent text or add placeholders like "[unreadable text]".

                Begin the extraction process now. The provided document could be of any type, including PDF, DOCX, or various image formats.
            `,
        },
        {media: {url: input.documentDataUri}},
      ],
      config: {
        // A lower temperature ensures the model is more factual and less likely to hallucinate,
        // which is critical for accurate text extraction.
        temperature: 0.1,
      }
    });

    const extractedText = llmResponse.text;

    if (!extractedText || extractedText.trim() === "") {
        throw new Error("A extração de texto não produziu nenhum resultado. O documento pode estar vazio, corrompido ou em um formato não suportado.");
    }

    return { text: extractedText };
  }
);
