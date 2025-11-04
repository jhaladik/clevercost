/**
 * Intelligent Autocomplete for Browser
 * Simplified version for web use
 */

class IntelligentAutocomplete {
  constructor() {
    this.categories = [];
    this.flatList = [];
  }

  /**
   * Load categories data
   */
  loadCategories(categories) {
    this.categories = categories;
    // Create flat list for searching
    this.flatList = categories.map(cat => ({
      ...cat,
      searchText: cat.name.toLowerCase()
    }));
  }

  /**
   * Search for categories by prefix
   */
  search(query, limit = 10) {
    if (!query || query.length === 0) {
      return this._getPopularCategories(limit);
    }

    const queryLower = query.toLowerCase();

    // Exact prefix matches
    const prefixMatches = this.flatList
      .filter(cat => cat.searchText.startsWith(queryLower))
      .slice(0, limit);

    if (prefixMatches.length >= limit) {
      return prefixMatches.map(this._enrichWithData.bind(this));
    }

    // Contains matches
    const containsMatches = this.flatList
      .filter(cat =>
        cat.searchText.includes(queryLower) &&
        !cat.searchText.startsWith(queryLower)
      )
      .slice(0, limit - prefixMatches.length);

    // Fuzzy matches
    const fuzzyMatches = this._fuzzySearch(query, limit - prefixMatches.length - containsMatches.length);

    return [...prefixMatches, ...containsMatches, ...fuzzyMatches]
      .slice(0, limit)
      .map(this._enrichWithData.bind(this));
  }

  /**
   * Fuzzy search using simple distance
   */
  _fuzzySearch(query, limit = 5) {
    const matches = this.flatList
      .map(category => ({
        ...category,
        distance: this._levenshteinDistance(
          query.toLowerCase(),
          category.searchText.substring(0, query.length + 2)
        )
      }))
      .filter(item => item.distance <= 2)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return matches;
  }

  /**
   * Calculate Levenshtein distance
   */
  _levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get popular categories
   */
  _getPopularCategories(limit = 10) {
    return this.categories
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit)
      .map(this._enrichWithData.bind(this));
  }

  /**
   * Enrich category with display data
   */
  _enrichWithData(category) {
    return {
      id: category.id,
      name: category.name,
      displayText: this._formatDisplayText(category),
      priceRange: category.priceRange,
      averagePrice: this._calculateAveragePrice(category.priceRange),
      lifespan: category.lifespan,
      monthlyCost: this._calculateMonthlyCost(category),
      icon: category.icon || '📦',
      tags: category.tags || [],
      rentalPriceEstimate: category.rentalPriceEstimate
    };
  }

  _formatDisplayText(category) {
    const { priceRange } = category;
    const priceText = priceRange
      ? `$${priceRange.min.toLocaleString()}-$${priceRange.max.toLocaleString()}`
      : 'Price varies';

    return `${category.name} - Avg: ${priceText}`;
  }

  _calculateAveragePrice(priceRange) {
    if (!priceRange) return null;
    return Math.round((priceRange.min + priceRange.max) / 2);
  }

  _calculateMonthlyCost(category) {
    if (!category.priceRange || !category.lifespan) return null;

    const avgPrice = this._calculateAveragePrice(category.priceRange);
    const lifespanMonths = category.lifespan.value *
      (category.lifespan.unit === 'years' ? 12 : 1);

    return Math.round(avgPrice / lifespanMonths);
  }
}

// Sample category database
const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name: "Laptops (Business)",
    priceRange: { min: 1200, max: 2500, currency: "USD" },
    lifespan: { value: 3.5, unit: "years" },
    icon: "💻",
    popularity: 95,
    tags: ["technology", "hardware", "computer"],
    rentalPriceEstimate: 150
  },
  {
    id: 2,
    name: "Laptops (Personal)",
    priceRange: { min: 600, max: 1200, currency: "USD" },
    lifespan: { value: 3, unit: "years" },
    icon: "💻",
    popularity: 88,
    tags: ["technology", "hardware", "computer"],
    rentalPriceEstimate: 80
  },
  {
    id: 3,
    name: "Professional Camera",
    priceRange: { min: 1500, max: 4000, currency: "USD" },
    lifespan: { value: 5, unit: "years" },
    icon: "📷",
    popularity: 45,
    tags: ["photography", "equipment"],
    rentalPriceEstimate: 150
  },
  {
    id: 4,
    name: "Office Chair",
    priceRange: { min: 300, max: 1200, currency: "USD" },
    lifespan: { value: 7, unit: "years" },
    icon: "🪑",
    popularity: 70,
    tags: ["furniture", "office"],
    rentalPriceEstimate: 50
  },
  {
    id: 5,
    name: "Standing Desk",
    priceRange: { min: 400, max: 1500, currency: "USD" },
    lifespan: { value: 10, unit: "years" },
    icon: "🖥️",
    popularity: 60,
    tags: ["furniture", "office", "ergonomic"],
    rentalPriceEstimate: 60
  },
  {
    id: 6,
    name: "Professional Microphone",
    priceRange: { min: 200, max: 800, currency: "USD" },
    lifespan: { value: 8, unit: "years" },
    icon: "🎤",
    popularity: 40,
    tags: ["audio", "equipment", "recording"],
    rentalPriceEstimate: 30
  },
  {
    id: 7,
    name: "DSLR Camera Body",
    priceRange: { min: 800, max: 3000, currency: "USD" },
    lifespan: { value: 5, unit: "years" },
    icon: "📸",
    popularity: 50,
    tags: ["photography", "equipment"],
    rentalPriceEstimate: 100
  },
  {
    id: 8,
    name: "Power Tools Set",
    priceRange: { min: 200, max: 800, currency: "USD" },
    lifespan: { value: 10, unit: "years" },
    icon: "🔧",
    popularity: 55,
    tags: ["tools", "construction"],
    rentalPriceEstimate: 50
  },
  {
    id: 9,
    name: "Projector (4K)",
    priceRange: { min: 500, max: 2000, currency: "USD" },
    lifespan: { value: 5, unit: "years" },
    icon: "📽️",
    popularity: 35,
    tags: ["electronics", "presentation"],
    rentalPriceEstimate: 75
  },
  {
    id: 10,
    name: "DJ Equipment",
    priceRange: { min: 1000, max: 4000, currency: "USD" },
    lifespan: { value: 7, unit: "years" },
    icon: "🎧",
    popularity: 30,
    tags: ["audio", "entertainment"],
    rentalPriceEstimate: 200
  },
  {
    id: 11,
    name: "Electric Bike",
    priceRange: { min: 800, max: 3000, currency: "USD" },
    lifespan: { value: 5, unit: "years" },
    icon: "🚴",
    popularity: 65,
    tags: ["transportation", "eco-friendly"],
    rentalPriceEstimate: 100
  },
  {
    id: 12,
    name: "Gaming Console",
    priceRange: { min: 300, max: 600, currency: "USD" },
    lifespan: { value: 6, unit: "years" },
    icon: "🎮",
    popularity: 80,
    tags: ["entertainment", "gaming"],
    rentalPriceEstimate: 40
  },
  {
    id: 13,
    name: "Tablet (Professional)",
    priceRange: { min: 500, max: 1200, currency: "USD" },
    lifespan: { value: 4, unit: "years" },
    icon: "📱",
    popularity: 75,
    tags: ["technology", "mobile"],
    rentalPriceEstimate: 60
  },
  {
    id: 14,
    name: "Monitor (4K)",
    priceRange: { min: 300, max: 800, currency: "USD" },
    lifespan: { value: 7, unit: "years" },
    icon: "🖥️",
    popularity: 85,
    tags: ["technology", "display"],
    rentalPriceEstimate: 40
  },
  {
    id: 15,
    name: "Camping Gear Set",
    priceRange: { min: 200, max: 800, currency: "USD" },
    lifespan: { value: 10, unit: "years" },
    icon: "⛺",
    popularity: 45,
    tags: ["outdoor", "recreation"],
    rentalPriceEstimate: 50
  }
];
