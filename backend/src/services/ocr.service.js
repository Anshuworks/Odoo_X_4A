const Tesseract = require('tesseract.js');

/**
 * ocrService.js — OCR Service
 * Extracts Merchant, Total Amount, and Date from receipt images.
 */
class OCRService {
  /**
   * Scans a receipt image and extracts key billing information.
   * @param {string} imagePath — Path to the image file.
   * @returns {Object} — Extracted data: title, amount, date, and raw scannedData.
   */
  static async scanReceipt(imagePath) {
    try {
      console.log('🔍 Starting OCR scan on:', imagePath);
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng',
        { logger: m => console.log(m) }
      );

      console.log('✅ OCR extraction complete.');
      // Extract data using regex (Merchant, Amount, Date)
      const amountRegex = /(\d{1,5}\.\d{2})/; // simple regex for xx.xx amount
      const dateRegex = /(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/;
      
      const amountMatch = text.match(amountRegex);
      const dateMatch = text.match(dateRegex);

      // Guess Merchant: First non-empty line usually
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const guessedTitle = lines[0] || 'Unrecognized Merchant';

      return {
        success: true,
        title: guessedTitle,
        amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
        date: dateMatch ? dateMatch[0] : null,
        scannedData: {
          raw: text,
          lines: lines.slice(0, 10) // store first 10 lines for reference
        }
      };
    } catch (error) {
      console.error('❌ OCR Scan error:', error.message);
      throw new Error('Failed to process image OCR');
    }
  }
}

module.exports = OCRService;
