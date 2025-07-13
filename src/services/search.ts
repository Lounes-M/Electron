import { DatabaseService } from '../database/database';
import { SearchQuery, SearchResult, AIResponse } from '../shared/types';

export class SearchService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    try {
      return await this.db.searchFiles(query);
    } catch (error) {
      console.error('Search error:', error);
      await this.db.addLog('error', 'Search failed', { query, error });
      return [];
    }
  }

  async searchWithAI(queryText: string, context: SearchResult[]): Promise<AIResponse> {
    // Pour l'instant, retourner une réponse simple
    // L'intégration IA sera implémentée dans une version ultérieure
    return {
      text: `Recherche pour: "${queryText}". ${context.length} résultats trouvés.`,
      sources: context.map(result => ({
        file: result.file,
        relevance: result.score,
        snippet: result.snippet
      })),
      processingTime: Date.now()
    };
  }

  async getSuggestions(partial: string): Promise<string[]> {
    // Implémentation basique des suggestions
    // À améliorer avec l'historique de recherche et l'IA
    const suggestions: string[] = [];
    
    if (partial.length > 2) {
      // Rechercher dans les noms de fichiers
      const files = await this.db.getAllFiles();
      const matches = files
        .filter(file => file.name.toLowerCase().includes(partial.toLowerCase()))
        .slice(0, 5)
        .map(file => file.name);
      
      suggestions.push(...matches);
    }

    return [...new Set(suggestions)]; // Retirer les doublons
  }

  async getSearchHistory(): Promise<string[]> {
    // À implémenter avec une table de stockage de l'historique
    return [];
  }

  async addToSearchHistory(query: string): Promise<void> {
    // À implémenter
    await this.db.addLog('info', 'Search query', { query });
  }
}
