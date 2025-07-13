import Tesseract from 'tesseract.js';
import fs from 'fs/promises';

export class OCRService {
  private worker?: Tesseract.Worker;
  private languages: string[] = ['eng', 'fra'];

  constructor(languages: string[] = ['eng', 'fra']) {
    this.languages = languages;
  }

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker(this.languages as any, undefined, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
    }
  }

  async extractText(imagePath: string): Promise<string> {
    try {
      await this.initialize();
      
      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      // Vérifier que le fichier existe
      await fs.access(imagePath);
      
      const { data: { text } } = await this.worker.recognize(imagePath);
      
      // Nettoyer et formater le texte
      return this.cleanText(text);
    } catch (error) {
      console.error(`OCR error for ${imagePath}:`, error);
      return '';
    }
  }

  async extractTextFromBuffer(imageBuffer: Buffer, filename: string): Promise<string> {
    try {
      await this.initialize();
      
      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      const { data: { text } } = await this.worker.recognize(imageBuffer);
      
      return this.cleanText(text);
    } catch (error) {
      console.error(`OCR error for buffer ${filename}:`, error);
      return '';
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/\n+/g, ' ')  // Remplacer les retours à la ligne multiples
      .replace(/\s+/g, ' ')  // Remplacer les espaces multiples
      .trim();               // Supprimer les espaces en début/fin
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = undefined;
    }
  }

  setLanguages(languages: string[]): void {
    this.languages = languages;
    // Réinitialiser le worker avec les nouvelles langues
    if (this.worker) {
      this.terminate().then(() => this.initialize());
    }
  }

  getLanguages(): string[] {
    return [...this.languages];
  }

  getSupportedLanguages(): string[] {
    return [
      'afr', 'amh', 'ara', 'asm', 'aze', 'aze_cyrl', 'bel', 'ben', 'bod', 
      'bos', 'bre', 'bul', 'cat', 'ceb', 'ces', 'chi_sim', 'chi_tra', 
      'chr', 'cos', 'cym', 'dan', 'deu', 'div', 'dzo', 'ell', 'eng', 
      'enm', 'epo', 'est', 'eus', 'fao', 'fas', 'fil', 'fin', 'fra', 
      'frk', 'frm', 'fry', 'gla', 'gle', 'glg', 'grc', 'guj', 'hat', 
      'heb', 'hin', 'hrv', 'hun', 'hye', 'iku', 'ind', 'isl', 'ita', 
      'ita_old', 'jav', 'jpn', 'kan', 'kat', 'kat_old', 'kaz', 'khm', 
      'kir', 'kmr', 'kor', 'lao', 'lat', 'lav', 'lit', 'ltz', 'mal', 
      'mar', 'mkd', 'mlt', 'mon', 'mri', 'msa', 'mya', 'nep', 'nld', 
      'nor', 'oci', 'ori', 'pan', 'pol', 'por', 'pus', 'que', 'ron', 
      'rus', 'san', 'sin', 'slk', 'slv', 'snd', 'spa', 'spa_old', 
      'sqi', 'srp', 'srp_latn', 'sun', 'swa', 'swe', 'syr', 'tam', 
      'tat', 'tel', 'tgk', 'tha', 'tir', 'ton', 'tur', 'uig', 'ukr', 
      'urd', 'uzb', 'uzb_cyrl', 'vie', 'yid', 'yor'
    ];
  }
}
