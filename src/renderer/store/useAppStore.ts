import { create } from 'zustand';
import { SearchResult, AppConfig, IndexingProgress } from '../../shared/types';

interface AppState {
  // État de l'indexation
  isIndexing: boolean;
  indexingProgress: IndexingProgress;
  
  // Résultats de recherche
  searchResults: SearchResult[];
  searchQuery: string;
  isSearching: boolean;
  
  // Dossiers sélectionnés
  selectedFolders: string[];
  indexedFilesCount: number;
  
  // Configuration
  config: AppConfig;
  
  // Interface utilisateur
  theme: 'dark' | 'light';
  isSettingsOpen: boolean;
  isFolderSelectOpen: boolean;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
  }>;
  
  // Actions
  setIsIndexing: (isIndexing: boolean) => void;
  setIndexingProgress: (progress: IndexingProgress) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSelectedFolders: (folders: string[]) => void;
  addSelectedFolder: (folder: string) => void;
  removeSelectedFolder: (folder: string) => void;
  setIndexedFilesCount: (count: number) => void;
  setConfig: (config: AppConfig) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsFolderSelectOpen: (isOpen: boolean) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

const defaultConfig: AppConfig = {
  indexing: {
    watchFolder: '',
    excludePatterns: [
      '**/node_modules/**',
      '**/.git/**',
      '**/.DS_Store',
      '**/Thumbs.db',
      '**/*.tmp',
      '**/*.temp',
      '**/.*'
    ],
    maxFileSize: '100MB',
    ocrLanguages: ['eng', 'fra']
  },
  ai: {
    provider: 'local',
    model: 'llama3-8b',
    maxTokens: 4000
  },
  ui: {
    theme: 'auto',
    alwaysOnTop: false,
    showThumbnails: true
  }
};

const defaultIndexingProgress: IndexingProgress = {
  current: 0,
  total: 0,
  currentFile: '',
  percentage: 0
};

export const useAppStore = create<AppState>((set) => ({
  // État initial
  isIndexing: false,
  indexingProgress: defaultIndexingProgress,
  searchResults: [],
  searchQuery: '',
  isSearching: false,
  selectedFolders: [],
  indexedFilesCount: 0,
  config: defaultConfig,
  theme: 'light',
  isSettingsOpen: false,
  isFolderSelectOpen: false,
  notifications: [],

  // Actions
  setIsIndexing: (isIndexing) => set({ isIndexing }),
  
  setIndexingProgress: (progress) => set({ indexingProgress: progress }),
  
  setSearchResults: (results) => set({ searchResults: results }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setIsSearching: (isSearching) => set({ isSearching }),
  
  setSelectedFolders: (folders) => set({ selectedFolders: folders }),
  
  addSelectedFolder: (folder) => set((state) => ({
    selectedFolders: [...state.selectedFolders, folder]
  })),
  
  removeSelectedFolder: (folder) => set((state) => ({
    selectedFolders: state.selectedFolders.filter(f => f !== folder)
  })),
  
  setIndexedFilesCount: (count) => set({ indexedFilesCount: count }),
  
  setConfig: (config) => set({ config }),
  
  setTheme: (theme) => set({ theme }),
  
  setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  
  setIsFolderSelectOpen: (isOpen) => set({ isFolderSelectOpen: isOpen }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));
