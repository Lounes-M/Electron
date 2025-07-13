import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { DatabaseService } from '../database/database';
import { IndexingService } from '../services/indexing';
import { SearchService } from '../services/search';
import { ConfigService } from '../services/config';
import { IPCEvents, SearchQuery, AppConfig } from '../shared/types';

// Declare Vite variables
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

export class MainProcess {
  private mainWindow: BrowserWindow | null = null;
  private db: DatabaseService;
  private indexingService: IndexingService;
  private searchService: SearchService;
  private configService: ConfigService;

  constructor() {
    this.db = DatabaseService.getInstance();
    this.indexingService = new IndexingService();
    this.searchService = new SearchService();
    this.configService = new ConfigService();
    
    this.setupEventHandlers();
    this.setupIPCHandlers();
  }

  private setupEventHandlers(): void {
    // App event handlers
    app.on('ready', this.createWindow.bind(this));
    app.on('window-all-closed', this.onWindowAllClosed.bind(this));
    app.on('activate', this.onActivate.bind(this));

    // Indexing event handlers
    this.indexingService.on('indexing:progress', (progress) => {
      this.sendToRenderer('indexing:progress', progress);
    });

    this.indexingService.on('indexing:completed', (stats) => {
      this.sendToRenderer('indexing:complete', stats);
    });

    this.indexingService.on('indexing:error', (error) => {
      this.sendToRenderer('indexing:error', error);
    });

    this.indexingService.on('file:updated', (file) => {
      this.sendToRenderer('file:updated', file);
    });
  }

  private setupIPCHandlers(): void {
    // Folder selection and indexing
    ipcMain.handle('folder:select', async (): Promise<string | null> => {
      if (!this.mainWindow) return null;
      
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
        title: 'Sélectionner un dossier à indexer'
      });

      return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.handle('folder:index', async (_, folderPath: string): Promise<void> => {
      await this.indexingService.indexFolder(folderPath);
      await this.configService.setConfig('lastIndexedFolder', folderPath);
    });

    ipcMain.handle('folder:remove', async (_, folderPath: string): Promise<void> => {
      // Remove indexed files for this folder from database
      const deletedCount = await this.db.removeFilesByFolderPath(folderPath);
      console.log(`Removed ${deletedCount} indexed files from folder: ${folderPath}`);
      
      // Stop watching this folder if it's being watched
      if (this.indexingService) {
        // Implementation will depend on the indexing service structure
        console.log(`Stopping watch for folder: ${folderPath}`);
      }
    });

    // Search handlers
    ipcMain.handle('search:query', async (_, query: SearchQuery) => {
      return await this.searchService.search(query);
    });

    ipcMain.handle('search:ai', async (_, queryText: string, context: any[]) => {
      return await this.searchService.searchWithAI(queryText, context);
    });

    // Configuration handlers
    ipcMain.handle('config:get', async (): Promise<AppConfig> => {
      return await this.configService.getConfig();
    });

    ipcMain.handle('config:set', async (_, config: Partial<AppConfig>): Promise<void> => {
      await this.configService.updateConfig(config);
    });

    // File operations
    ipcMain.handle('file:open', async (_, filePath: string): Promise<void> => {
      await shell.openPath(filePath);
    });

    ipcMain.handle('file:reveal', async (_, filePath: string): Promise<void> => {
      shell.showItemInFolder(filePath);
    });

    // App control
    ipcMain.handle('app:getVersion', () => app.getVersion());
    ipcMain.handle('app:quit', () => app.quit());
    ipcMain.handle('app:minimize', () => this.mainWindow?.minimize());
    ipcMain.handle('app:toggleMaximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });
  }

  private createWindow(): void {
    // Create the browser window.
    this.mainWindow = new BrowserWindow({
      height: 800,
      width: 1200,
      minHeight: 600,
      minWidth: 800,
      title: 'Electron',
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        preload: path.join(__dirname, '../../preload.js'),
        nodeIntegration: false,
        contextIsolation: true
      },
      icon: this.getAppIcon()
    });

    // Load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      this.mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }

    // Save window position and size
    this.mainWindow.on('close', () => {
      if (this.mainWindow) {
        const bounds = this.mainWindow.getBounds();
        this.configService.setConfig('windowBounds', JSON.stringify(bounds));
      }
    });

    // Restore window position and size
    this.restoreWindowBounds();
  }

  private async restoreWindowBounds(): Promise<void> {
    try {
      const boundsStr = await this.configService.getConfig('windowBounds');
      if (boundsStr && this.mainWindow) {
        const bounds = JSON.parse(boundsStr);
        this.mainWindow.setBounds(bounds);
      }
    } catch (error) {
      console.error('Error restoring window bounds:', error);
    }
  }

  private getAppIcon(): string | undefined {
    const platform = process.platform;
    if (platform === 'darwin') {
      return path.join(__dirname, '../assets/icon.icns');
    } else if (platform === 'win32') {
      return path.join(__dirname, '../assets/icon.ico');
    } else {
      return path.join(__dirname, '../assets/icon.png');
    }
  }

  private sendToRenderer(channel: string, data: any): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  private onWindowAllClosed(): void {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  private onActivate(): void {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      this.createWindow();
    }
  }

  async shutdown(): Promise<void> {
    await this.indexingService.stopWatching();
    await this.db.close();
  }
}

// Initialize the main process
const mainProcess = new MainProcess();

// Handle app shutdown
app.on('before-quit', async () => {
  await mainProcess.shutdown();
});
