import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import * as chokidar from 'chokidar';
import { EventEmitter } from 'events';
import { IndexedFile } from '../shared/types';
import { DatabaseService } from '../database/database';
import { OCRService } from './ocr';
import { TextExtractionService } from './textExtraction';

export interface IndexingProgress {
  current: number;
  total: number;
  currentFile: string;
  percentage: number;
}

export class IndexingService extends EventEmitter {
  private db: DatabaseService;
  private ocrService: OCRService;
  private textService: TextExtractionService;
  private watcher?: chokidar.FSWatcher;
  private isIndexing = false;
  private excludePatterns: string[] = [
    '**/node_modules/**',
    '**/.git/**',
    '**/.DS_Store',
    '**/Thumbs.db',
    '**/*.tmp',
    '**/*.temp',
    '**/.*',
    '**/__pycache__/**',
    '**/dist/**',
    '**/build/**',
    '**/out/**'
  ];

  private supportedExtensions = new Set([
    // Documents texte
    '.txt', '.md', '.rtf', '.log',
    // Documents bureautiques
    '.docx', '.xlsx', '.pptx', '.pdf',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp',
    // Code source
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
    '.css', '.scss', '.html', '.xml', '.json', '.yaml', '.yml',
    '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart',
    // Configuration
    '.ini', '.conf', '.config', '.env'
  ]);

  private imageExtensions = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'
  ]);

  constructor() {
    super();
    this.db = DatabaseService.getInstance();
    this.ocrService = new OCRService();
    this.textService = new TextExtractionService();
  }

  async indexFolder(folderPath: string): Promise<void> {
    if (this.isIndexing) {
      throw new Error('Indexing already in progress');
    }

    this.isIndexing = true;
    this.emit('indexing:started', folderPath);

    try {
      // Arrêter le watcher existant
      if (this.watcher) {
        await this.watcher.close();
      }

      // Scanner tous les fichiers
      const files = await this.scanDirectory(folderPath);
      const total = files.length;
      let current = 0;

      this.emit('indexing:progress', {
        current: 0,
        total,
        currentFile: '',
        percentage: 0
      } as IndexingProgress);

      // Indexer chaque fichier
      for (const filePath of files) {
        try {
          await this.indexFile(filePath);
          current++;
          
          this.emit('indexing:progress', {
            current,
            total,
            currentFile: path.basename(filePath),
            percentage: Math.round((current / total) * 100)
          } as IndexingProgress);
        } catch (error) {
          console.error(`Error indexing file ${filePath}:`, error);
          await this.db.addLog('error', `Failed to index file: ${filePath}`, error);
        }
      }

      // Démarrer le watcher pour les modifications futures
      this.startWatching(folderPath);

      this.emit('indexing:completed', { total, indexed: current });
    } catch (error) {
      this.emit('indexing:error', error);
      throw error;
    } finally {
      this.isIndexing = false;
    }
  }

  private async scanDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const scanRecursive = async (currentPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          
          if (this.shouldExclude(fullPath)) {
            continue;
          }
          
          if (entry.isDirectory()) {
            await scanRecursive(fullPath);
          } else if (entry.isFile() && this.isSupportedFile(fullPath)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${currentPath}:`, error);
      }
    };

    await scanRecursive(dirPath);
    return files;
  }

  private async indexFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath);
      const contentHash = crypto.createHash('md5').update(content).digest('hex');
      
      // Vérifier si le fichier a déjà été indexé avec le même hash
      const existingFile = await this.db.getFile(filePath);
      if (existingFile && existingFile.contentHash === contentHash) {
        return; // Fichier déjà à jour
      }

      const extension = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);
      
      let textContent = '';
      let ocrContent = '';

      // Extraction du texte selon le type de fichier
      if (this.imageExtensions.has(extension)) {
        // OCR pour les images
        ocrContent = await this.ocrService.extractText(filePath);
      } else {
        // Extraction de texte pour les autres types
        textContent = await this.textService.extractText(filePath);
      }

      // Créer l'objet fichier indexé
      const indexedFile: Omit<IndexedFile, 'id'> = {
        path: filePath,
        name: fileName,
        extension,
        size: stats.size,
        modifiedDate: Math.floor(stats.mtime.getTime() / 1000),
        contentHash,
        content: textContent,
        ocrContent,
        indexDate: Math.floor(Date.now() / 1000)
      };

      // Sauvegarder en base
      await this.db.insertFile(indexedFile);
      
      this.emit('file:indexed', indexedFile);
    } catch (error) {
      console.error(`Error indexing file ${filePath}:`, error);
      throw error;
    }
  }

  private startWatching(folderPath: string): void {
    this.watcher = chokidar.watch(folderPath, {
      ignored: this.excludePatterns,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', (filePath: string) => this.handleFileChange(filePath, 'add'))
      .on('change', (filePath: string) => this.handleFileChange(filePath, 'change'))
      .on('unlink', (filePath: string) => this.handleFileChange(filePath, 'unlink'))
      .on('error', (error: unknown) => {
        console.error('Watcher error:', error);
        this.emit('watcher:error', error);
      });

    this.emit('watcher:started', folderPath);
  }

  private async handleFileChange(filePath: string, event: string): Promise<void> {
    if (!this.isSupportedFile(filePath)) {
      return;
    }

    try {
      switch (event) {
        case 'add':
        case 'change':
          await this.indexFile(filePath);
          this.emit('file:updated', { path: filePath, event });
          break;
        case 'unlink':
          await this.db.deleteFile(filePath);
          this.emit('file:deleted', { path: filePath });
          break;
      }
    } catch (error) {
      console.error(`Error handling file change ${filePath} (${event}):`, error);
      await this.db.addLog('error', `Failed to handle file change: ${filePath}`, { event, error });
    }
  }

  private shouldExclude(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return this.excludePatterns.some(pattern => {
      // Convertir le pattern glob en regex simple
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.');
      
      const regex = new RegExp(regexPattern);
      return regex.test(normalizedPath);
    });
  }

  private isSupportedFile(filePath: string): boolean {
    const extension = path.extname(filePath).toLowerCase();
    return this.supportedExtensions.has(extension);
  }

  async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = undefined;
      this.emit('watcher:stopped');
    }
  }

  async reindexFile(filePath: string): Promise<void> {
    // Forcer la réindexation d'un fichier spécifique
    await this.indexFile(filePath);
  }

  getIndexingStatus(): { isIndexing: boolean } {
    return { isIndexing: this.isIndexing };
  }

  async getIndexStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    lastIndexed: number;
  }> {
    const totalFiles = await this.db.getFileCount();
    // Ajouter d'autres statistiques si nécessaire
    
    return {
      totalFiles,
      totalSize: 0, // À implémenter
      lastIndexed: Date.now()
    };
  }

  setExcludePatterns(patterns: string[]): void {
    this.excludePatterns = patterns;
  }

  setSupportedExtensions(extensions: string[]): void {
    this.supportedExtensions = new Set(extensions.map(ext => ext.toLowerCase()));
  }
}
