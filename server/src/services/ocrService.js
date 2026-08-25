import { createWorker } from 'tesseract.js';
import { pdf } from 'pdf-to-img';

const extractTextFromImage = async (imageBuffer) => {
  const worker = await createWorker('eng+mar');

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: '4',
    });
    const result = await worker.recognize(imageBuffer);
    await worker.terminate();
    return result.data.text;
  } catch (error) {
    await worker.terminate();
    throw error;
  }
};

const convertPdfFirstPageToImageBuffer = async (pdfBuffer) => {
  const document = await pdf(pdfBuffer, { scale: 2 });

  for await (const page of document) {
    return page;
  }

  throw new Error('PDF has no pages');
};

const runOcr = async (fileBuffer, mimeType) => {
  let imageBuffer = fileBuffer;

  if (mimeType === 'application/pdf') {
    imageBuffer = await convertPdfFirstPageToImageBuffer(fileBuffer);
  }

  return extractTextFromImage(imageBuffer);
};

export { runOcr };