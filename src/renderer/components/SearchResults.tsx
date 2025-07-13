import React, { useState } from 'react';
import { SearchResult } from '../../shared/types';

interface SearchResultsProps {
  results: SearchResult[];
  onOpenFile: (filePath: string) => void;
  onRevealFile: (filePath: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onOpenFile,
  onRevealFile
}) => {
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'date' | 'size'>('relevance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'relevance':
        comparison = a.score - b.score;
        break;
      case 'name':
        comparison = a.file.name.localeCompare(b.file.name);
        break;
      case 'date':
        comparison = a.file.modifiedDate - b.file.modifiedDate;
        break;
      case 'size':
        comparison = a.file.size - b.file.size;
        break;
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (extension: string): string => {
    const iconMap: { [key: string]: string } = {
      '.txt': '📄',
      '.md': '📝',
      '.pdf': '📕',
      '.docx': '📘',
      '.xlsx': '📊',
      '.pptx': '📽️',
      '.jpg': '🖼️',
      '.jpeg': '🖼️',
      '.png': '🖼️',
      '.gif': '🖼️',
      '.mp4': '🎬',
      '.mp3': '🎵',
      '.js': '⚡',
      '.ts': '🔷',
      '.py': '🐍',
      '.html': '🌐',
      '.css': '🎨',
      '.json': '📋',
    };
    
    return iconMap[extension] || '📄';
  };

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Aucun résultat trouvé
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Essayez des mots-clés différents ou ajustez vos filtres.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec options de tri */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
        </h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Trier par:</span>
          
          {[
            { key: 'relevance' as const, label: 'Pertinence' },
            { key: 'name' as const, label: 'Nom' },
            { key: 'date' as const, label: 'Date' },
            { key: 'size' as const, label: 'Taille' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                sortBy === key
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {label}
              {sortBy === key && (
                <span className="ml-1">
                  {sortDirection === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des résultats */}
      <div className="space-y-3">
        {sortedResults.map((result, index) => (
          <div
            key={`${result.file.path}-${index}`}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Nom du fichier avec icône */}
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getFileIcon(result.file.extension)}</span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                    {result.file.name}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {result.file.extension}
                  </span>
                </div>

                {/* Chemin du fichier */}
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                  {result.file.path}
                </p>

                {/* Extrait du contenu */}
                {result.snippet && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span 
                        dangerouslySetInnerHTML={{ 
                          __html: result.snippet.replace(/<mark>/g, '<mark class="bg-yellow-200 dark:bg-yellow-800">') 
                        }} 
                      />
                    </p>
                  </div>
                )}

                {/* Métadonnées */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Taille: {formatFileSize(result.file.size)}</span>
                  <span>Modifié: {formatDate(result.file.modifiedDate)}</span>
                  <span>Score: {Math.round(result.score * 100)}%</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onOpenFile(result.file.path)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Ouvrir le fichier"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
                
                <button
                  onClick={() => onRevealFile(result.file.path)}
                  className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  title="Afficher dans le dossier"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
