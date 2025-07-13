import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  WifiIcon 
} from '@heroicons/react/24/outline';

export const StatusBar: React.FC = () => {
  const { 
    isIndexing, 
    indexingProgress, 
    indexedFilesCount, 
    selectedFolders,
    theme 
  } = useAppStore();

  const getStatusInfo = () => {
    if (isIndexing) {
      return {
        icon: <ClockIcon className="w-4 h-4 text-blue-500 animate-spin" />,
        text: `Indexation en cours... ${Math.round(indexingProgress?.percentage || 0)}%`,
        color: 'text-blue-600 dark:text-blue-400'
      };
    }

    if (selectedFolders.length === 0) {
      return {
        icon: <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />,
        text: 'Aucun dossier sélectionné',
        color: 'text-yellow-600 dark:text-yellow-400'
      };
    }

    return {
      icon: <CheckCircleIcon className="w-4 h-4 text-green-500" />,
      text: `${indexedFilesCount.toLocaleString()} fichiers indexés`,
      color: 'text-green-600 dark:text-green-400'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`h-8 px-4 flex items-center justify-between ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} text-xs`}>
      {/* Status principal */}
      <div className="flex items-center space-x-2">
        {statusInfo.icon}
        <span className={statusInfo.color}>
          {statusInfo.text}
        </span>
      </div>

      {/* Informations additionnelles */}
      <div className="flex items-center space-x-4">
        {/* Dossiers sélectionnés */}
        {selectedFolders.length > 0 && (
          <span className="text-gray-500 dark:text-gray-400">
            {selectedFolders.length} dossier{selectedFolders.length > 1 ? 's' : ''}
          </span>
        )}

        {/* Indicateur de connexion (pour les futures intégrations IA) */}
        <div className="flex items-center space-x-1">
          <WifiIcon className="w-3 h-3 text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400">
            Local
          </span>
        </div>

        {/* Progress détaillé pendant l'indexation */}
        {isIndexing && indexingProgress && (
          <span className="text-gray-500 dark:text-gray-400">
            {indexingProgress.current}/{indexingProgress.total}
            {indexingProgress.currentFile && (
              <span className="ml-2 truncate max-w-xs">
                - {indexingProgress.currentFile.split('/').pop()}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
};
