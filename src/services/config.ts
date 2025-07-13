import { DatabaseService } from '../database/database';
import { AppConfig } from '../shared/types';

export class ConfigService {
  private db: DatabaseService;
  private defaultConfig: AppConfig = {
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

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async getConfig(key?: string): Promise<any> {
    if (key) {
      const value = await this.db.getConfig(key);
      return value ? JSON.parse(value) : null;
    }

    // Retourner la configuration complète
    const configKeys = [
      'indexing', 'ai', 'ui'
    ];

    const config = { ...this.defaultConfig };

    for (const configKey of configKeys) {
      const value = await this.db.getConfig(configKey);
      if (value) {
        try {
          config[configKey as keyof AppConfig] = JSON.parse(value);
        } catch (error) {
          console.error(`Error parsing config for ${configKey}:`, error);
        }
      }
    }

    return config;
  }

  async setConfig(key: string, value: any): Promise<void> {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.db.setConfig(key, serializedValue);
  }

  async updateConfig(partialConfig: Partial<AppConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    const updatedConfig = this.mergeConfig(currentConfig, partialConfig);

    // Sauvegarder chaque section
    for (const [key, value] of Object.entries(updatedConfig)) {
      await this.setConfig(key, value);
    }
  }

  private mergeConfig(current: AppConfig, partial: Partial<AppConfig>): AppConfig {
    return {
      indexing: { ...current.indexing, ...partial.indexing },
      ai: { ...current.ai, ...partial.ai },
      ui: { ...current.ui, ...partial.ui }
    };
  }

  async resetToDefaults(): Promise<void> {
    for (const [key, value] of Object.entries(this.defaultConfig)) {
      await this.setConfig(key, value);
    }
  }

  async exportConfig(): Promise<AppConfig> {
    return await this.getConfig();
  }

  async importConfig(config: AppConfig): Promise<void> {
    await this.updateConfig(config);
  }

  // Méthodes spécifiques pour certaines configurations
  async getLastIndexedFolder(): Promise<string | null> {
    return await this.db.getConfig('lastIndexedFolder');
  }

  async setLastIndexedFolder(folderPath: string): Promise<void> {
    await this.db.setConfig('lastIndexedFolder', folderPath);
  }

  async getWindowBounds(): Promise<any> {
    const bounds = await this.db.getConfig('windowBounds');
    return bounds ? JSON.parse(bounds) : null;
  }

  async setWindowBounds(bounds: any): Promise<void> {
    await this.db.setConfig('windowBounds', JSON.stringify(bounds));
  }
}
