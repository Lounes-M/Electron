import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  XMarkIcon, 
  FolderOpenIcon,
  FolderIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface FolderSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FolderSelectModal: React.FC<FolderSelectModalProps> = ({ isOpen, onClose }) => {
  const { 
    selectedFolders, 
    addSelectedFolder, 
    removeSelectedFolder,
    theme,
    addNotification
  } = useAppStore();
  
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectFolder = async () => {
    setIsSelecting(true);
    
    try {
      if (window.electronAPI) {
        const folderPath = await window.electronAPI.selectFolder();
        
        if (folderPath && !selectedFolders.includes(folderPath)) {
          addSelectedFolder(folderPath);
          
          // Démarrer l'indexation du nouveau dossier
          await window.electronAPI.indexFolder(folderPath);
          
          addNotification({
            type: 'success',
            title: 'Dossier ajouté',
            message: `Le dossier "${folderPath.split('/').pop()}" a été ajouté et l'indexation a commencé.`
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du dossier:', error);
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sélectionner le dossier.'
      });
    } finally {
      setIsSelecting(false);
    }
  };

  const handleRemoveFolder = async (folderPath: string) => {
    try {
      removeSelectedFolder(folderPath);
      
      // Supprimer les fichiers indexés de ce dossier
      if (window.electronAPI) {
        await window.electronAPI.removeIndexedFolder(folderPath);
      }
      
      addNotification({
        type: 'info',
        title: 'Dossier supprimé',
        message: `Le dossier "${folderPath.split('/').pop()}" a été retiré de l'indexation.`
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier:', error);
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer le dossier de l\'indexation.'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <FolderOpenIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gestion des dossiers
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add folder button */}
          <div className="mb-6">
            <button
              onClick={handleSelectFolder}
              disabled={isSelecting}
              className={`w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed rounded-lg transition-colors ${
                isSelecting
                  ? 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400'
                    : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <PlusIcon className="w-5 h-5" />
              <span className="font-medium">
                {isSelecting ? 'Sélection en cours...' : 'Ajouter un dossier'}
              </span>
            </button>
          </div>

          {/* Folders list */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Dossiers indexés ({selectedFolders.length})
            </h3>

            {selectedFolders.length === 0 ? (
              <div className="text-center py-8">
                <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Aucun dossier sélectionné
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Cliquez sur "Ajouter un dossier" pour commencer l'indexation.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedFolders.map((folder, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FolderIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {folder.split('/').pop() || folder}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={folder}>
                          {folder}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveFolder(folder)}
                      className="ml-3 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Supprimer ce dossier"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info section */}
          {selectedFolders.length > 0 && (
            <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Indexation automatique
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Les fichiers dans ces dossiers sont automatiquement indexés et surveillés pour les changements.
                    L'indexation peut prendre quelques minutes selon la taille des dossiers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
