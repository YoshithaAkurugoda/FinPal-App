import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // First, try standard text extraction
  try {
    const parsed = await pdf(buffer);
    const text = (parsed.text ?? '').trim();

    if (text.length > 100) {
      // If we got reasonable text, return it
      return text;
    }
    console.log('[PDF Extractor] Got limited text from standard extraction, trying OCR');
  } catch (e) {
    console.log('[PDF Extractor] Standard extraction failed, trying OCR');
  }

  // If standard extraction failed or returned too little text, use Tesseract OCR
  try {
    const worker = await Tesseract.createWorker();
    const result = await worker.recognize(buffer);
    await worker.terminate();

    const text = result.data.text.trim();
    if (!text) {
      throw new Error('OCR extracted no text');
    }

    return text;
  } catch (e) {
    throw new Error(
      `Failed to extract text from PDF: ${e instanceof Error ? e.message : 'Unknown error'}. ` +
        'The PDF may be corrupted or contain only images without readable text.',
    );
  }
}
