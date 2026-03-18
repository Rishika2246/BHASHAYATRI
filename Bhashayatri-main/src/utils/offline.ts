/**
 * Offline Assistant
 * Manages offline data, recent queries, and cached translations
 */

export interface OfflineQuery {
  id: string;
  query: string;
  response: string;
  timestamp: number;
  language: string;
  location?: string;
}

export interface CachedTranslation {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

export interface OfflinePlace {
  id: string;
  name: string;
  description: string;
  type: string;
  languages: string[];
  phrases: { [key: string]: string }; // Common phrases in local language
}

/**
 * Save query to offline storage
 */
export function saveOfflineQuery(
  query: string,
  response: string,
  language: string,
  location?: string
): void {
  try {
    const queries = getOfflineQueries();
    const newQuery: OfflineQuery = {
      id: `query_${Date.now()}`,
      query,
      response,
      timestamp: Date.now(),
      language,
      location,
    };

    queries.unshift(newQuery);
    
    // Keep only last 100 queries
    const trimmed = queries.slice(0, 100);
    
    localStorage.setItem('offline_queries', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving offline query:', error);
  }
}

/**
 * Get all offline queries
 */
export function getOfflineQueries(): OfflineQuery[] {
  try {
    const queries = localStorage.getItem('offline_queries');
    return queries ? JSON.parse(queries) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Search offline queries
 */
export function searchOfflineQueries(searchTerm: string): OfflineQuery[] {
  const queries = getOfflineQueries();
  const lowerSearch = searchTerm.toLowerCase();
  
  return queries.filter(
    (q) =>
      q.query.toLowerCase().includes(lowerSearch) ||
      q.response.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Save translation to cache
 */
export function cacheTranslation(
  originalText: string,
  translatedText: string,
  sourceLanguage: string,
  targetLanguage: string
): void {
  try {
    const cache = getCachedTranslations();
    const newTranslation: CachedTranslation = {
      id: `trans_${Date.now()}`,
      originalText,
      translatedText,
      sourceLanguage,
      targetLanguage,
      timestamp: Date.now(),
    };

    cache.unshift(newTranslation);
    
    // Keep only last 200 translations
    const trimmed = cache.slice(0, 200);
    
    localStorage.setItem('cached_translations', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error caching translation:', error);
  }
}

/**
 * Get cached translations
 */
export function getCachedTranslations(): CachedTranslation[] {
  try {
    const cache = localStorage.getItem('cached_translations');
    return cache ? JSON.parse(cache) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Find cached translation
 */
export function findCachedTranslation(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): string | null {
  const cache = getCachedTranslations();
  const found = cache.find(
    (t) =>
      t.originalText.toLowerCase() === text.toLowerCase() &&
      t.sourceLanguage === sourceLanguage &&
      t.targetLanguage === targetLanguage
  );
  
  return found ? found.translatedText : null;
}

/**
 * Get offline essential places data
 */
export function getOfflinePlaces(): OfflinePlace[] {
  // Essential places with common phrases
  return [
    {
      id: 'hospital',
      name: 'Hospital',
      description: 'Emergency medical facility',
      type: 'emergency',
      languages: ['Hindi', 'English'],
      phrases: {
        english: 'I need medical help',
        hindi: 'मुझे चिकित्सा सहायता चाहिए',
        tamil: 'எனக்கு மருத்துவ உதவி தேவை',
      },
    },
    {
      id: 'police',
      name: 'Police Station',
      description: 'Law enforcement',
      type: 'emergency',
      languages: ['Hindi', 'English'],
      phrases: {
        english: 'I need help',
        hindi: 'मुझे मदद चाहिए',
        tamil: 'எனக்கு உதவி தேவை',
      },
    },
    {
      id: 'restaurant',
      name: 'Restaurant',
      description: 'Dining facility',
      type: 'food',
      languages: ['Hindi', 'English'],
      phrases: {
        english: 'I would like vegetarian food',
        hindi: 'मुझे शाकाहारी खाना चाहिए',
        tamil: 'எனக்கு சைவ உணவு வேண்டும்',
      },
    },
    {
      id: 'hotel',
      name: 'Hotel',
      description: 'Accommodation',
      type: 'accommodation',
      languages: ['Hindi', 'English'],
      phrases: {
        english: 'I need a room',
        hindi: 'मुझे एक कमरा चाहिए',
        tamil: 'எனக்கு ஒரு அறை வேண்டும்',
      },
    },
  ];
}

/**
 * Get offline suggestions based on context
 */
export function getOfflineSuggestions(
  recentLocation?: string,
  recentQueries?: OfflineQuery[]
): string[] {
  const suggestions: string[] = [
    'Where is the nearest hospital?',
    'How do I get to the railway station?',
    'What are popular local dishes?',
    'Emergency contact numbers',
  ];

  // Add context-based suggestions
  if (recentLocation) {
    suggestions.unshift(`Best places to visit in ${recentLocation}`);
  }

  if (recentQueries && recentQueries.length > 0) {
    const lastQuery = recentQueries[0];
    if (lastQuery.query.includes('food')) {
      suggestions.unshift('Nearby restaurants with my dietary preferences');
    }
  }

  return suggestions.slice(0, 6);
}

/**
 * Check if offline mode is available
 */
export function isOfflineDataAvailable(): boolean {
  const queries = getOfflineQueries();
  const translations = getCachedTranslations();
  
  return queries.length > 0 || translations.length > 0;
}

/**
 * Get offline statistics
 */
export function getOfflineStats(): {
  totalQueries: number;
  totalTranslations: number;
  totalLocations: number;
  lastUpdated: number | null;
} {
  const queries = getOfflineQueries();
  const translations = getCachedTranslations();
  
  const lastUpdated =
    queries.length > 0 || translations.length > 0
      ? Math.max(
          queries[0]?.timestamp || 0,
          translations[0]?.timestamp || 0
        )
      : null;

  return {
    totalQueries: queries.length,
    totalTranslations: translations.length,
    totalLocations: 0, // Will be calculated from location history
    lastUpdated,
  };
}

/**
 * Clear all offline data
 */
export function clearOfflineData(): void {
  try {
    localStorage.removeItem('offline_queries');
    localStorage.removeItem('cached_translations');
    localStorage.removeItem('location_history');
  } catch (error) {
    console.error('Error clearing offline data:', error);
  }
}

/**
 * Export offline data for backup
 */
export function exportOfflineData(): string {
  const data = {
    queries: getOfflineQueries(),
    translations: getCachedTranslations(),
    exportedAt: new Date().toISOString(),
  };
  
  return JSON.stringify(data, null, 2);
}
