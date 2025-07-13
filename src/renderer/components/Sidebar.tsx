import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { FolderIcon, DocumentIcon, CogIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  onSettingsClick: () => void;
  onFolderSelectClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick, onFolderSelectClick }) => {
  const { 
    selectedFolders, 
    indexedFilesCount, 
    isIndexing, 
    indexingProgress,
    theme 
  } = useAppStore();

  return (
    <div className={`w-64 h-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <MagnifyingGlassIcon className="w-6 h-6 text-blue-500" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Electron
          </h1>
        </div>
      </div>

      {/* Folders Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Dossiers indexés
            </h2>
            <button
              onClick={onFolderSelectClick}
              className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
              title="Ajouter un dossier"
            >
              <FolderIcon className="w-4 h-4" />
            </button>
          </div>

          {selectedFolders.length === 0 ? (
            <div className="text-center py-8">
              <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucun dossier sélectionné
              </p>
              <button
                onClick={onFolderSelectClick}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
              >
                Sélectionner un dossier
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedFolders.map((folder, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                >
                  <div className="flex items-center space-x-2">
                    <FolderIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-white truncate" title={folder}>
                      {folder.split('/').pop() || folder}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {folder}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        {selectedFolders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Statistiques
            </h3>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <DocumentIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {indexedFilesCount.toLocaleString()} fichiers indexés
                </span>
              </div>
              
              {isIndexing && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Indexation en cours...
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(indexingProgress?.percentage || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${indexingProgress?.percentage || 0}%` }}
                    />
                  </div>
                  {indexingProgress?.currentFile && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {indexingProgress.currentFile.split('/').pop()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings Button */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700">
        <button
          onClick={onSettingsClick}
          className={`w-full flex items-center space-x-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} transition-colors`}
        >
          <CogIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Paramètres
          </span>
        </button>
      </div>
    </div>
  );
};
