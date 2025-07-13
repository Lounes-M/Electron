import React, { useState, useRef, useEffect } from 'react';
import { SearchQuery } from '../../shared/types';
import { useSearch } from '../hooks/useSearch';

interface SearchBarProps {
  onSearch: (query: SearchQuery) => void;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, disabled = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fileTypes: [] as string[],
    semantic: false,
    fuzzy: false
  });
  
  const searchRef = useRef<HTMLInputElement>(null);
  const { getSuggestions } = useSearch();

  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.length > 1) {
        const suggestions = await getSuggestions(query);
        setSuggestions(suggestions);
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, getSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || disabled) return;

    const searchQuery: SearchQuery = {
      text: query.trim(),
      semantic: filters.semantic,
      fuzzy: filters.fuzzy,
      filters: {
        fileTypes: filters.fileTypes.length > 0 ? filters.fileTypes : undefined
      }
    };

    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  const toggleFileType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      fileTypes: prev.fileTypes.includes(type)
        ? prev.fileTypes.filter(t => t !== type)
        : [...prev.fileTypes, type]
    }));
  };

  const commonFileTypes = [
    { ext: '.txt', label: 'Texte' },
    { ext: '.pdf', label: 'PDF' },
    { ext: '.docx', label: 'Word' },
    { ext: '.md', label: 'Markdown' },
    { ext: '.js', label: 'JavaScript' },
    { ext: '.ts', label: 'TypeScript' },
    { ext: '.py', label: 'Python' },
    { ext: '.jpg', label: 'Images' },
  ];

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        {/* Barre de recherche principale */}
        <div className="relative flex-1">
          <div className="relative">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Rechercher dans les fichiers..."
              disabled={disabled}
              className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bouton de filtres */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-lg border transition-colors ${
            showFilters || filters.fileTypes.length > 0 || filters.semantic || filters.fuzzy
              ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
          disabled={disabled}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
        </button>

        {/* Bouton de recherche */}
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Rechercher
        </button>
      </form>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="absolute z-10 top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="space-y-4">
            {/* Types de fichiers */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Types de fichiers</h3>
              <div className="flex flex-wrap gap-2">
                {commonFileTypes.map(({ ext, label }) => (
                  <button
                    key={ext}
                    type="button"
                    onClick={() => toggleFileType(ext)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.fileTypes.includes(ext)
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options de recherche */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Options</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.semantic}
                    onChange={(e) => setFilters(prev => ({ ...prev, semantic: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Recherche sémantique</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.fuzzy}
                    onChange={(e) => setFilters(prev => ({ ...prev, fuzzy: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Recherche floue</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
