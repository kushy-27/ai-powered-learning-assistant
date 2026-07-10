import fs from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

export const extractTextFromPDF = async (filePath) => {
  let parser = null;

  try {
    if (
      typeof filePath !== 'string' ||
      filePath.trim().length === 0
    ) {
      const error = new Error('A valid PDF file path is required');
      error.statusCode = 400;
      throw error;
    }

    const dataBuffer = await fs.readFile(filePath);

    if (dataBuffer.length === 0) {
      const error = new Error('The PDF file is empty');
      error.statusCode = 422;
      throw error;
    }

    const header = dataBuffer
      .subarray(0, Math.min(dataBuffer.length, 1024))
      .toString('latin1');

    if (!header.includes('%PDF-')) {
      const error = new Error('The provided file is not a valid PDF');
      error.statusCode = 415;
      throw error;
    }


    parser = new PDFParse({
      data: dataBuffer
    });

    const textData = await parser.getText();

    let metadata = {};
    let metadataPageCount = 0;

    try {
      const infoData = await parser.getInfo();

      metadata = infoData.infoData ?? {};
      metadataPageCount = infoData.total ?? 0;
    } catch (metadataError) {
      console.warn('Unable to extract PDF metadata:', {
        filePath,
        message: metadataError.message
      });
    }

    return {
      text:
        typeof textData.text === 'string'
          ? textData.text
          : '',

      numPages:
        Number.isInteger(textData.total) &&
        textData.total >= 0
          ? textData.total
          : metadataPageCount,

      info: metadata
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', {
      filePath,
      name: error.name,
      code: error.code,
      message: error.message,
      stack:
        process.env.NODE_ENV === 'production'
          ? undefined
          : error.stack
    });

    if (error.statusCode) {
      throw error;
    }

    const extractionError = new Error(
      error.code === 'ENOENT'
        ? 'PDF file not found'
        : 'Failed to extract text from PDF'
    );

    extractionError.statusCode =
      error.code === 'ENOENT' ? 404 : 422;

    extractionError.code = 'PDF_EXTRACTION_FAILED';
    extractionError.cause = error;

    throw extractionError;
  } finally {

    if (parser) {
      try {
        await parser.destroy();
      } catch (cleanupError) {
        console.error('Error releasing PDF parser resources:', {
          filePath,
          message: cleanupError.message
        });
      }
    }
  }
};
