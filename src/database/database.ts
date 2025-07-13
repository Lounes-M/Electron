import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { IndexedFile, SearchQuery, SearchResult } from '../shared/types';
import { DATABASE_SCHEMA } from './schema';

export class DatabaseService {
  private db: Database.Database;
  private static instance: DatabaseService;

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'electron.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeDatabase(): void {
    // Activer le mode WAL pour de meilleures performances
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = 1000000');
    this.db.pragma('temp_store = memory');
    this.db.pragma('mmap_size = 268435456');

    // Exécuter le schéma
    this.db.exec(DATABASE_SCHEMA);
  }

  // Méthodes pour les fichiers
  async insertFile(file: Omit<IndexedFile, 'id'>): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO files 
      (path, name, extension, size, modified_date, content_hash, content, ocr_content, embedding, index_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      file.path,
      file.name,
      file.extension,
      file.size,
      file.modifiedDate,
      file.contentHash,
      file.content || null,
      file.ocrContent || null,
      file.embedding || null,
      file.indexDate
    );

    return result.lastInsertRowid as number;
  }

  async getFile(path: string): Promise<IndexedFile | null> {
    const stmt = this.db.prepare('SELECT * FROM files WHERE path = ?');
    const row = stmt.get(path) as any;
    
    if (!row) return null;
    
    return this.mapRowToFile(row);
  }

  async getAllFiles(): Promise<IndexedFile[]> {
    const stmt = this.db.prepare('SELECT * FROM files ORDER BY modified_date DESC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => this.mapRowToFile(row));
  }

  async searchFiles(query: SearchQuery): Promise<SearchResult[]> {
    let sql = '';
    let params: any[] = [];

    if (query.semantic) {
      // Recherche sémantique (à implémenter avec les embeddings)
      sql = `
        SELECT *, bm25(files_fts) as score 
        FROM files_fts 
        WHERE files_fts MATCH ? 
        ORDER BY score
        LIMIT 50
      `;
      params = [query.text];
    } else {
      // Recherche textuelle standard
      const searchTerm = query.fuzzy ? `"${query.text}"~` : `"${query.text}"`;
      sql = `
        SELECT f.*, bm25(fts) as score,
               snippet(files_fts, 1, '<mark>', '</mark>', '...', 10) as snippet
        FROM files f
        JOIN files_fts fts ON f.id = fts.rowid
        WHERE files_fts MATCH ?
      `;
      params = [searchTerm];

      // Ajouter les filtres
      if (query.filters?.fileTypes?.length) {
        sql += ` AND f.extension IN (${query.filters.fileTypes.map(() => '?').join(',')})`;
        params.push(...query.filters.fileTypes);
      }

      if (query.filters?.dateRange) {
        sql += ` AND f.modified_date BETWEEN ? AND ?`;
        params.push(
          Math.floor(query.filters.dateRange.start.getTime() / 1000),
          Math.floor(query.filters.dateRange.end.getTime() / 1000)
        );
      }

      sql += ` ORDER BY score LIMIT 50`;
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      file: this.mapRowToFile(row),
      score: row.score || 0,
      snippet: row.snippet || '',
      highlights: [] // À implémenter
    }));
  }

  async deleteFile(path: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM files WHERE path = ?');
    stmt.run(path);
  }

  async getFileCount(): Promise<number> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM files');
    const result = stmt.get() as any;
    return result.count;
  }

  // Méthodes pour la configuration
  async getConfig(key: string): Promise<string | null> {
    const stmt = this.db.prepare('SELECT value FROM config WHERE key = ?');
    const result = stmt.get(key) as any;
    return result?.value || null;
  }

  async setConfig(key: string, value: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO config (key, value, updated_at) 
      VALUES (?, ?, strftime('%s','now'))
    `);
    stmt.run(key, value);
  }

  // Méthodes pour les logs
  async addLog(level: string, message: string, details?: any): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO logs (level, message, details) 
      VALUES (?, ?, ?)
    `);
    stmt.run(level, message, details ? JSON.stringify(details) : null);
  }

  async getLogs(limit: number = 100): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM logs 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(limit) as any[];
  }

  async removeFilesByFolderPath(folderPath: string): Promise<number> {
    // Supprimer d'abord de la table FTS
    const deleteFtsStmt = this.db.prepare(`
      DELETE FROM files_fts 
      WHERE rowid IN (
        SELECT id FROM files WHERE path LIKE ?
      )
    `);
    deleteFtsStmt.run(`${folderPath}%`);

    // Supprimer de la table principale
    const deleteStmt = this.db.prepare('DELETE FROM files WHERE path LIKE ?');
    const result = deleteStmt.run(`${folderPath}%`);

    return result.changes;
  }

  // Méthodes utilitaires
  private mapRowToFile(row: any): IndexedFile {
    return {
      id: row.id,
      path: row.path,
      name: row.name,
      extension: row.extension,
      size: row.size,
      modifiedDate: row.modified_date,
      contentHash: row.content_hash,
      content: row.content,
      ocrContent: row.ocr_content,
      embedding: row.embedding,
      indexDate: row.index_date
    };
  }

  async close(): Promise<void> {
    this.db.close();
  }

  // Optimisation et maintenance
  async vacuum(): Promise<void> {
    this.db.exec('VACUUM');
  }

  async analyze(): Promise<void> {
    this.db.exec('ANALYZE');
  }
}
