import React, { useState, useEffect } from 'react';
import { SearchQuery, SearchResult, AppConfig, IndexingProgress } from '../shared/types';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { SettingsModal } from './components/SettingsModal';
import { FolderSelectModal } from './components/FolderSelectModal';
import { useAppStore } from './store/useAppStore';
import { useSearch } from './hooks/useSearch';

export const App: React.FC = () => {
  const {
    isIndexing,
    indexingProgress,
    searchResults,
    selectedFolder,
    config,
    theme,
    isSettingsOpen,
    isFolderSelectOpen,
    setIsSettingsOpen,
    setIsFolderSelectOpen,
    setSearchResults,
    setIsIndexing,
    setIndexingProgress
  } = useAppStore();

  const { search, searchWithAI } = useSearch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Initialiser l'application
    initializeApp();
    
    // Configurer les listeners d'événements
    setupEventListeners();
    
    return () => {
      // Nettoyer les listeners
      window.electronAPI?.removeAllListeners('indexing:progress');
      window.electronAPI?.removeAllListeners('indexing:complete');
      window.electronAPI?.removeAllListeners('indexing:error');
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Charger la configuration
      const appConfig = await window.electronAPI?.getConfig();
      if (appConfig) {
        useAppStore.getState().setConfig(appConfig);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const setupEventListeners = () => {
    if (!window.electronAPI) return;

    // Progression de l'indexation
    window.electronAPI.onIndexingProgress((progress: IndexingProgress) => {
      setIndexingProgress(progress);
    });

    // Indexation terminée
    window.electronAPI.onIndexingComplete((stats: any) => {
      setIsIndexing(false);
      console.log('Indexing completed:', stats);
    });

    // Erreur d'indexation
    window.electronAPI.onIndexingError((error: any) => {
      setIsIndexing(false);
      console.error('Indexing error:', error);
    });
  };

  const handleSearch = async (query: SearchQuery) => {
    try {
      const results = await search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleFolderSelect = async (folderPath: string) => {
    try {
      setIsIndexing(true);
      useAppStore.getState().setSelectedFolder(folderPath);
      await window.electronAPI?.indexFolder(folderPath);
    } catch (error) {
      console.error('Error indexing folder:', error);
      setIsIndexing(false);
    }
  };

  const handleOpenFile = async (filePath: string) => {
    try {
      await window.electronAPI?.openFile(filePath);
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleRevealFile = async (filePath: string) => {
    try {
      await window.electronAPI?.revealFile(filePath);
    } catch (error) {
      console.error('Error revealing file:', error);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          selectedFolder={selectedFolder}
          onFolderSelect={() => setIsFolderSelectOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold">Electron</h1>
              </div>

              <div className="flex items-center space-x-2">
                {!selectedFolder && (
                  <button
                    onClick={() => setIsFolderSelectOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sélectionner un dossier
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <SearchBar 
              onSearch={handleSearch}
              disabled={!selectedFolder || isIndexing}
            />
          </div>

          {/* Content Area */}
          <main className="flex-1 p-6">
            {!selectedFolder ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v10a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
                  </svg>
                  <h2 className="text-xl font-medium mb-2">Aucun dossier sélectionné</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Sélectionnez un dossier pour commencer l'indexation et la recherche.
                  </p>
                  <button
                    onClick={() => setIsFolderSelectOpen(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Choisir un dossier
                  </button>
                </div>
              </div>
            ) : isIndexing ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h2 className="text-xl font-medium mb-2">Indexation en cours...</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {indexingProgress.currentFile && `Fichier: ${indexingProgress.currentFile}`}
                  </p>
                  <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${indexingProgress.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {indexingProgress.current} / {indexingProgress.total} fichiers ({indexingProgress.percentage}%)
                  </p>
                </div>
              </div>
            ) : (
              <SearchResults
                results={searchResults}
                onOpenFile={handleOpenFile}
                onRevealFile={handleRevealFile}
              />
            )}
          </main>

          {/* Status Bar */}
          <StatusBar 
            isIndexing={isIndexing}
            selectedFolder={selectedFolder}
            resultCount={searchResults.length}
          />
        </div>

        {/* Modals */}
        {isFolderSelectOpen && (
          <FolderSelectModal
            onSelect={handleFolderSelect}
            onClose={() => setIsFolderSelectOpen(false)}
          />
        )}

        {isSettingsOpen && (
          <SettingsModal
            config={config}
            onSave={async (newConfig) => {
              await window.electronAPI?.setConfig(newConfig);
              useAppStore.getState().setConfig({ ...config, ...newConfig });
              setIsSettingsOpen(false);
            }}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
