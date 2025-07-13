import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppConfig } from '../../shared/types';
import { 
  XMarkIcon, 
  CogIcon, 
  EyeIcon,
  ComputerDesktopIcon,
  CloudIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, theme, setConfig, setTheme } = useAppStore();
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<'general' | 'indexing' | 'ai' | 'ui'>('general');

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    setConfig(localConfig);
    
    // Sauvegarder via IPC
    if (window.electronAPI) {
      try {
        await window.electronAPI.setConfig(localConfig);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la configuration:', error);
      }
    }
    
    onClose();
  };

  const handleCancel = () => {
    setLocalConfig(config);
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'Général', icon: CogIcon },
    { id: 'indexing', label: 'Indexation', icon: MagnifyingGlassIcon },
    { id: 'ai', label: 'Intelligence Artificielle', icon: ComputerDesktopIcon },
    { id: 'ui', label: 'Interface', icon: EyeIcon },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-4xl h-3/4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Paramètres
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar avec onglets */}
          <div className={`w-64 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border-r ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? theme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-600'
                          : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Paramètres généraux
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Thème
                      </label>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                        className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="light">Clair</option>
                        <option value="dark">Sombre</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="alwaysOnTop"
                        checked={localConfig.ui.alwaysOnTop}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          ui: { ...localConfig.ui, alwaysOnTop: e.target.checked }
                        })}
                        className="mr-3"
                      />
                      <label htmlFor="alwaysOnTop" className="text-sm text-gray-700 dark:text-gray-300">
                        Garder la fenêtre au premier plan
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showThumbnails"
                        checked={localConfig.ui.showThumbnails}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          ui: { ...localConfig.ui, showThumbnails: e.target.checked }
                        })}
                        className="mr-3"
                      />
                      <label htmlFor="showThumbnails" className="text-sm text-gray-700 dark:text-gray-300">
                        Afficher les miniatures des images
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'indexing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Configuration de l'indexation
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Taille maximale des fichiers
                      </label>
                      <select
                        value={localConfig.indexing.maxFileSize}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          indexing: { ...localConfig.indexing, maxFileSize: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="10MB">10 MB</option>
                        <option value="50MB">50 MB</option>
                        <option value="100MB">100 MB</option>
                        <option value="500MB">500 MB</option>
                        <option value="1GB">1 GB</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Langues OCR
                      </label>
                      <div className="space-y-2">
                        {['eng', 'fra', 'deu', 'spa', 'ita'].map((lang) => (
                          <div key={lang} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`lang-${lang}`}
                              checked={localConfig.indexing.ocrLanguages.includes(lang)}
                              onChange={(e) => {
                                const newLangs = e.target.checked
                                  ? [...localConfig.indexing.ocrLanguages, lang]
                                  : localConfig.indexing.ocrLanguages.filter(l => l !== lang);
                                setLocalConfig({
                                  ...localConfig,
                                  indexing: { ...localConfig.indexing, ocrLanguages: newLangs }
                                });
                              }}
                              className="mr-3"
                            />
                            <label htmlFor={`lang-${lang}`} className="text-sm text-gray-700 dark:text-gray-300">
                              {lang === 'eng' ? 'Anglais' : 
                               lang === 'fra' ? 'Français' :
                               lang === 'deu' ? 'Allemand' :
                               lang === 'spa' ? 'Espagnol' :
                               lang === 'ita' ? 'Italien' : lang}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Motifs d'exclusion
                      </label>
                      <textarea
                        value={localConfig.indexing.excludePatterns.join('\n')}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          indexing: { 
                            ...localConfig.indexing, 
                            excludePatterns: e.target.value.split('\n').filter(p => p.trim()) 
                          }
                        })}
                        rows={6}
                        className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="Un motif par ligne&#10;Exemple: **/node_modules/**"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Un motif par ligne. Utilisez ** pour les dossiers récursifs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Configuration de l'IA
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fournisseur IA
                      </label>
                      <select
                        value={localConfig.ai.provider}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          ai: { ...localConfig.ai, provider: e.target.value as any }
                        })}
                        className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="local">Local (Ollama)</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Modèle
                      </label>
                      <input
                        type="text"
                        value={localConfig.ai.model}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          ai: { ...localConfig.ai, model: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="llama3-8b"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tokens maximum
                      </label>
                      <input
                        type="number"
                        value={localConfig.ai.maxTokens}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          ai: { ...localConfig.ai, maxTokens: parseInt(e.target.value) }
                        })}
                        className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        min="100"
                        max="32000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ui' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Interface utilisateur
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Thème automatique
                      </label>
                      <select
                        value={localConfig.ui.theme}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          ui: { ...localConfig.ui, theme: e.target.value as any }
                        })}
                        className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="auto">Automatique (système)</option>
                        <option value="light">Toujours clair</option>
                        <option value="dark">Toujours sombre</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="alwaysOnTopUI"
                          checked={localConfig.ui.alwaysOnTop}
                          onChange={(e) => setLocalConfig({
                            ...localConfig,
                            ui: { ...localConfig.ui, alwaysOnTop: e.target.checked }
                          })}
                          className="mr-3"
                        />
                        <label htmlFor="alwaysOnTopUI" className="text-sm text-gray-700 dark:text-gray-300">
                          Fenêtre toujours au premier plan
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showThumbnailsUI"
                          checked={localConfig.ui.showThumbnails}
                          onChange={(e) => setLocalConfig({
                            ...localConfig,
                            ui: { ...localConfig.ui, showThumbnails: e.target.checked }
                          })}
                          className="mr-3"
                        />
                        <label htmlFor="showThumbnailsUI" className="text-sm text-gray-700 dark:text-gray-300">
                          Afficher les miniatures
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end space-x-3 p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={handleCancel}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${theme === 'dark' ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};
