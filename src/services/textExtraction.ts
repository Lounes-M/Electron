import fs from 'fs/promises';
import path from 'path';

export class TextExtractionService {
  private supportedExtensions = new Map<string, (content: string, filePath?: string) => Promise<string>>([
    ['.txt', this.extractPlainText],
    ['.md', this.extractPlainText],
    ['.rtf', this.extractRTF],
    ['.log', this.extractPlainText],
    ['.js', this.extractPlainText],
    ['.ts', this.extractPlainText],
    ['.jsx', this.extractPlainText],
    ['.tsx', this.extractPlainText],
    ['.py', this.extractPlainText],
    ['.java', this.extractPlainText],
    ['.cpp', this.extractPlainText],
    ['.c', this.extractPlainText],
    ['.h', this.extractPlainText],
    ['.css', this.extractPlainText],
    ['.scss', this.extractPlainText],
    ['.html', this.extractHTML],
    ['.xml', this.extractXML],
    ['.json', this.extractJSON],
    ['.yaml', this.extractPlainText],
    ['.yml', this.extractPlainText],
    ['.php', this.extractPlainText],
    ['.rb', this.extractPlainText],
    ['.go', this.extractPlainText],
    ['.rs', this.extractPlainText],
    ['.swift', this.extractPlainText],
    ['.kt', this.extractPlainText],
    ['.dart', this.extractPlainText],
    ['.ini', this.extractINI],
    ['.conf', this.extractPlainText],
    ['.config', this.extractPlainText],
    ['.env', this.extractPlainText]
  ]);

  async extractText(filePath: string): Promise<string> {
    try {
      const extension = path.extname(filePath).toLowerCase();
      const extractor = this.supportedExtensions.get(extension);
      
      if (!extractor) {
        return '';
      }

      const content = await fs.readFile(filePath, 'utf-8');
      return await extractor.call(this, content, filePath);
    } catch (error) {
      console.error(`Text extraction error for ${filePath}:`, error);
      return '';
    }
  }

  private async extractPlainText(content: string, filePath?: string): Promise<string> {
    // Nettoyer le contenu en gardant la structure
    return content
      .replace(/\r\n/g, '\n')  // Normaliser les fins de ligne
      .replace(/\t/g, '  ')    // Remplacer les tabs par des espaces
      .trim();
  }

  private async extractHTML(content: string, filePath?: string): Promise<string> {
    // Extraction basique du HTML - retirer les balises
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Retirer scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Retirer styles
      .replace(/<[^>]*>/g, ' ')        // Retirer toutes les balises HTML
      .replace(/&nbsp;/g, ' ')         // Convertir &nbsp;
      .replace(/&amp;/g, '&')          // Convertir &amp;
      .replace(/&lt;/g, '<')           // Convertir &lt;
      .replace(/&gt;/g, '>')           // Convertir &gt;
      .replace(/&quot;/g, '"')         // Convertir &quot;
      .replace(/&#39;/g, "'")          // Convertir &#39;
      .replace(/\s+/g, ' ')            // Normaliser les espaces
      .trim();
  }

  private async extractXML(content: string, filePath?: string): Promise<string> {
    // Extraction basique du XML - retirer les balises mais garder le contenu
    return content
      .replace(/<\?xml[^>]*\?>/g, '')  // Retirer déclaration XML
      .replace(/<!--[\s\S]*?-->/g, '') // Retirer commentaires
      .replace(/<[^>]*>/g, ' ')        // Retirer balises
      .replace(/\s+/g, ' ')            // Normaliser espaces
      .trim();
  }

  private async extractJSON(content: string, filePath?: string): Promise<string> {
    try {
      // Parser le JSON et extraire les valeurs textuelles
      const parsed = JSON.parse(content);
      return this.extractTextFromObject(parsed);
    } catch (error) {
      // Si le parsing échoue, retourner le contenu brut
      return content;
    }
  }

  private extractTextFromObject(obj: any): string {
    const texts: string[] = [];
    
    const extractRecursive = (value: any) => {
      if (typeof value === 'string') {
        texts.push(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        texts.push(String(value));
      } else if (Array.isArray(value)) {
        value.forEach(extractRecursive);
      } else if (value && typeof value === 'object') {
        Object.values(value).forEach(extractRecursive);
      }
    };

    extractRecursive(obj);
    return texts.join(' ').trim();
  }

  private async extractRTF(content: string, filePath?: string): Promise<string> {
    // Extraction basique RTF - retirer les codes de contrôle
    return content
      .replace(/\{\\[^}]*\}/g, '')     // Retirer groupes de contrôle
      .replace(/\\[a-zA-Z]+\d*/g, '')  // Retirer commandes de contrôle
      .replace(/\\[^a-zA-Z]/g, '')     // Retirer caractères de contrôle
      .replace(/\s+/g, ' ')            // Normaliser espaces
      .trim();
  }

  private async extractINI(content: string, filePath?: string): Promise<string> {
    // Extraire les valeurs des fichiers INI/config
    const lines = content.split('\n');
    const texts: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Ignorer commentaires et sections
      if (trimmed.startsWith('#') || trimmed.startsWith(';') || 
          trimmed.startsWith('[') || trimmed === '') {
        continue;
      }
      
      // Extraire la valeur après le =
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > -1) {
        const value = trimmed.substring(equalIndex + 1).trim();
        if (value) {
          texts.push(value);
        }
      }
    }
    
    return texts.join(' ').trim();
  }

  getSupportedExtensions(): string[] {
    return Array.from(this.supportedExtensions.keys());
  }

  isSupported(filePath: string): boolean {
    const extension = path.extname(filePath).toLowerCase();
    return this.supportedExtensions.has(extension);
  }

  // Méthode pour ajouter de nouveaux extracteurs
  addExtractor(extension: string, extractor: (content: string, filePath?: string) => Promise<string>): void {
    this.supportedExtensions.set(extension.toLowerCase(), extractor);
  }
}
