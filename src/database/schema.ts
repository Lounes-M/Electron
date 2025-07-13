export const DATABASE_SCHEMA = `
-- Table des fichiers indexés
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    extension TEXT,
    size INTEGER,
    modified_date INTEGER,
    content_hash TEXT,
    content TEXT,
    ocr_content TEXT,
    embedding BLOB,
    index_date INTEGER
);

-- Index full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
    name, 
    content, 
    ocr_content, 
    content='files', 
    content_rowid='id'
);

-- Triggers pour maintenir la cohérence entre files et files_fts
CREATE TRIGGER IF NOT EXISTS files_ai AFTER INSERT ON files BEGIN
  INSERT INTO files_fts(rowid, name, content, ocr_content) 
  VALUES (new.id, new.name, new.content, new.ocr_content);
END;

CREATE TRIGGER IF NOT EXISTS files_ad AFTER DELETE ON files BEGIN
  INSERT INTO files_fts(files_fts, rowid, name, content, ocr_content) 
  VALUES('delete', old.id, old.name, old.content, old.ocr_content);
END;

CREATE TRIGGER IF NOT EXISTS files_au AFTER UPDATE ON files BEGIN
  INSERT INTO files_fts(files_fts, rowid, name, content, ocr_content) 
  VALUES('delete', old.id, old.name, old.content, old.ocr_content);
  INSERT INTO files_fts(rowid, name, content, ocr_content) 
  VALUES (new.id, new.name, new.content, new.ocr_content);
END;

-- Table de configuration
CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s','now'))
);

-- Table des logs
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    details TEXT,
    timestamp INTEGER DEFAULT (strftime('%s','now'))
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
CREATE INDEX IF NOT EXISTS idx_files_extension ON files(extension);
CREATE INDEX IF NOT EXISTS idx_files_modified_date ON files(modified_date);
CREATE INDEX IF NOT EXISTS idx_files_size ON files(size);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
`;
