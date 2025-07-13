import { contextBridge, ipcRenderer } from 'electron';
import { IPCEvents, SearchQuery, SearchResult, AppConfig, AIResponse } from '../shared/types';

// Define the API that will be exposed to the renderer process
const electronAPI = {
  // Folder operations
  selectFolder: (): Promise<string | null> => 
    ipcRenderer.invoke('folder:select'),
  
  indexFolder: (folderPath: string): Promise<void> => 
    ipcRenderer.invoke('folder:index', folderPath),

  removeIndexedFolder: (folderPath: string): Promise<void> => 
    ipcRenderer.invoke('folder:remove', folderPath),

  // Search operations
  search: (query: SearchQuery): Promise<SearchResult[]> => 
    ipcRenderer.invoke('search:query', query),
  
  searchWithAI: (query: string, context: SearchResult[]): Promise<AIResponse> => 
    ipcRenderer.invoke('search:ai', query, context),

  // Configuration
  getConfig: (): Promise<AppConfig> => 
    ipcRenderer.invoke('config:get'),
  
  setConfig: (config: Partial<AppConfig>): Promise<void> => 
    ipcRenderer.invoke('config:set', config),

  // File operations
  openFile: (filePath: string): Promise<void> => 
    ipcRenderer.invoke('file:open', filePath),
  
  revealFile: (filePath: string): Promise<void> => 
    ipcRenderer.invoke('file:reveal', filePath),

  // App operations
  getVersion: (): Promise<string> => 
    ipcRenderer.invoke('app:getVersion'),
  
  quit: (): Promise<void> => 
    ipcRenderer.invoke('app:quit'),
  
  minimize: (): Promise<void> => 
    ipcRenderer.invoke('app:minimize'),
  
  toggleMaximize: (): Promise<void> => 
    ipcRenderer.invoke('app:toggleMaximize'),

  // Event listeners
  onIndexingProgress: (callback: (progress: any) => void) => 
    ipcRenderer.on('indexing:progress', (_, progress) => callback(progress)),
  
  onIndexingComplete: (callback: (stats: any) => void) => 
    ipcRenderer.on('indexing:complete', (_, stats) => callback(stats)),
  
  onIndexingError: (callback: (error: any) => void) => 
    ipcRenderer.on('indexing:error', (_, error) => callback(error)),
  
  onFileUpdated: (callback: (file: any) => void) => 
    ipcRenderer.on('file:updated', (_, file) => callback(file)),

  // Remove listeners
  removeAllListeners: (channel: string) => 
    ipcRenderer.removeAllListeners(channel)
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the renderer process
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
