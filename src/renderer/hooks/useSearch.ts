import { useState, useCallback } from 'react';
import { SearchQuery, SearchResult, AIResponse } from '../../shared/types';

export const useSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const search = useCallback(async (query: SearchQuery): Promise<SearchResult[]> => {
    setIsSearching(true);
    try {
      const results = await window.electronAPI?.search(query) || [];
      
      // Ajouter à l'historique de recherche
      if (query.text.trim()) {
        setSearchHistory(prev => {
          const newHistory = [query.text, ...prev.filter(h => h !== query.text)];
          return newHistory.slice(0, 10); // Garder seulement les 10 dernières recherches
        });
      }
      
      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const searchWithAI = useCallback(async (
    queryText: string, 
    context: SearchResult[]
  ): Promise<AIResponse> => {
    try {
      return await window.electronAPI?.searchWithAI(queryText, context) || {
        text: 'Erreur lors de la recherche IA',
        sources: [],
        processingTime: 0
      };
    } catch (error) {
      console.error('AI search error:', error);
      return {
        text: 'Erreur lors de la recherche IA',
        sources: [],
        processingTime: 0
      };
    }
  }, []);

  const getSuggestions = useCallback(async (partial: string): Promise<string[]> => {
    if (!partial.trim() || partial.length < 2) {
      return searchHistory.slice(0, 5);
    }

    // Pour l'instant, retourner l'historique filtré
    // À terme, utiliser l'API Electron pour obtenir des suggestions intelligentes
    return searchHistory
      .filter(h => h.toLowerCase().includes(partial.toLowerCase()))
      .slice(0, 5);
  }, [searchHistory]);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    search,
    searchWithAI,
    getSuggestions,
    clearSearchHistory,
    isSearching,
    searchHistory
  };
};
