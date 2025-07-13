// Types pour les fichiers indexés
export interface IndexedFile {
  id: number;
  path: string;
  name: string;
  extension: string;
  size: number;
  modifiedDate: number;
  contentHash: string;
  content?: string;
  ocrContent?: string;
  embedding?: ArrayBuffer;
  indexDate: number;
}

// Types pour l'indexation
export interface IndexingProgress {
  current: number;
  total: number;
  currentFile: string;
  percentage: number;
}

// Types pour les résultats de recherche
export interface SearchResult {
  file: IndexedFile;
  score: number;
  snippet: string;
  highlights: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

// Types pour les requêtes de recherche
export interface SearchQuery {
  text: string;
  filters?: {
    fileTypes?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    sizeRange?: {
      min: number;
      max: number;
    };
    folders?: string[];
  };
  semantic?: boolean;
  fuzzy?: boolean;
}

// Types pour la configuration
export interface AppConfig {
  indexing: {
    watchFolder: string;
    excludePatterns: string[];
    maxFileSize: string;
    ocrLanguages: string[];
  };
  ai: {
    provider: 'local' | 'openai' | 'anthropic' | 'ollama';
    model: string;
    apiKey?: string;
    maxTokens: number;
  };
  ui: {
    theme: 'dark' | 'light' | 'auto';
    alwaysOnTop: boolean;
    showThumbnails: boolean;
  };
}

// Types pour les réponses IA
export interface AIResponse {
  text: string;
  sources: Array<{
    file: IndexedFile;
    relevance: number;
    snippet: string;
  }>;
  processingTime: number;
}

// Types pour les événements IPC
export interface IPCEvents {
  // Indexation
  'folder:select': () => Promise<string | null>;
  'folder:index': (folderPath: string) => Promise<void>;
  'indexing:progress': (data: { current: number; total: number; file: string }) => void;
  'indexing:complete': () => void;
  
  // Recherche
  'search:query': (query: SearchQuery) => Promise<SearchResult[]>;
  'search:ai': (query: string, context: SearchResult[]) => Promise<AIResponse>;
  
  // Configuration
  'config:get': () => Promise<AppConfig>;
  'config:set': (config: Partial<AppConfig>) => Promise<void>;
  
  // Fichiers
  'file:open': (filePath: string) => Promise<void>;
  'file:reveal': (filePath: string) => Promise<void>;
}

// Types pour l'état de l'application
export interface AppState {
  isIndexing: boolean;
  indexingProgress: {
    current: number;
    total: number;
    currentFile: string;
  };
  searchResults: SearchResult[];
  selectedFolder: string | null;
  config: AppConfig;
  theme: 'dark' | 'light';
}

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}
