/**
 * Intelligent Category Autocomplete System
 *
 * Features:
 * - Fast prefix matching using Trie data structure
 * - Fuzzy search with Levenshtein distance
 * - Automatic price fill-in
 * - Context-aware suggestions
 */

// Trie Node for fast prefix matching
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.data = null; // Store category data here
  }
}

class IntelligentAutocomplete {
  constructor() {
    this.root = new TrieNode();
    this.categories = [];
  }

  /**
   * Insert a category into the Trie
   */
  insert(category) {
    const words = category.name.toLowerCase().split(' ');

    // Insert full name
    this._insertWord(category.name.toLowerCase(), category);

    // Insert each word separately for partial matching
    words.forEach(word => {
      if (word.length >= 2) {
        this._insertWord(word, category);
      }
    });

    this.categories.push(category);
  }

  _insertWord(word, data) {
    let node = this.root;

    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }

    node.isEndOfWord = true;
    node.data = data;
  }

  /**
   * Search for categories by prefix
   * @param {string} prefix - The search term
   * @param {number} limit - Maximum results to return
   * @returns {Array} Matching categories with scores
   */
  search(prefix, limit = 10) {
    if (!prefix || prefix.length === 0) {
      return this._getPopularCategories(limit);
    }

    prefix = prefix.toLowerCase();

    // Try exact prefix match first
    const exactMatches = this._prefixSearch(prefix);

    // If we don't have enough results, try fuzzy search
    if (exactMatches.length < limit) {
      const fuzzyMatches = this._fuzzySearch(prefix, limit - exactMatches.length);
      return [...exactMatches, ...fuzzyMatches]
        .slice(0, limit)
        .map(this._enrichWithData.bind(this));
    }

    return exactMatches.slice(0, limit).map(this._enrichWithData.bind(this));
  }

  /**
   * Prefix search using Trie
   */
  _prefixSearch(prefix) {
    let node = this.root;

    // Navigate to the prefix
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char);
    }

    // Collect all words with this prefix
    const results = [];
    this._collectWords(node, prefix, results);
    return results;
  }

  _collectWords(node, prefix, results, maxResults = 20) {
    if (results.length >= maxResults) return;

    if (node.isEndOfWord && node.data) {
      results.push(node.data);
    }

    for (const [char, childNode] of node.children) {
      this._collectWords(childNode, prefix + char, results, maxResults);
    }
  }

  /**
   * Fuzzy search using Levenshtein distance
   */
  _fuzzySearch(query, limit = 5) {
    const matches = this.categories
      .map(category => ({
        ...category,
        distance: this._levenshteinDistance(
          query.toLowerCase(),
          category.name.toLowerCase().substring(0, query.length + 2)
        )
      }))
      .filter(item => item.distance <= 2) // Allow max 2 character difference
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return matches;
  }

  /**
   * Calculate Levenshtein distance between two strings
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
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
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
   * Enrich category data with helpful information
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
      tags: category.tags || []
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

// ============================================
// SAMPLE DATA & USAGE EXAMPLE
// ============================================

// Sample category database
const sampleCategories = [
  {
    id: 1,
    name: "Laptops (Business)",
    priceRange: { min: 1200, max: 2500, currency: "USD" },
    lifespan: { value: 3.5, unit: "years" },
    icon: "💻",
    popularity: 95,
    tags: ["technology", "hardware", "computer"]
  },
  {
    id: 2,
    name: "Laptops (Personal)",
    priceRange: { min: 600, max: 1200, currency: "USD" },
    lifespan: { value: 3, unit: "years" },
    icon: "💻",
    popularity: 88,
    tags: ["technology", "hardware", "computer"]
  },
  {
    id: 3,
    name: "Laptop Accessories",
    priceRange: { min: 50, max: 200, currency: "USD" },
    lifespan: { value: 2, unit: "years" },
    icon: "🖱️",
    popularity: 65,
    tags: ["technology", "accessories"]
  },
  {
    id: 4,
    name: "Professional Camera",
    priceRange: { min: 1500, max: 4000, currency: "USD" },
    lifespan: { value: 5, unit: "years" },
    icon: "📷",
    popularity: 45,
    tags: ["photography", "equipment"]
  },
  {
    id: 5,
    name: "Office Chair",
    priceRange: { min: 300, max: 1200, currency: "USD" },
    lifespan: { value: 7, unit: "years" },
    icon: "🪑",
    popularity: 70,
    tags: ["furniture", "office"]
  },
  {
    id: 6,
    name: "Standing Desk",
    priceRange: { min: 400, max: 1500, currency: "USD" },
    lifespan: { value: 10, unit: "years" },
    icon: "🖥️",
    popularity: 60,
    tags: ["furniture", "office", "ergonomic"]
  },
  {
    id: 7,
    name: "Professional Microphone",
    priceRange: { min: 200, max: 800, currency: "USD" },
    lifespan: { value: 8, unit: "years" },
    icon: "🎤",
    popularity: 40,
    tags: ["audio", "equipment", "recording"]
  },
  {
    id: 8,
    name: "Cloud Storage Subscription",
    priceRange: { min: 60, max: 240, currency: "USD" },
    lifespan: { value: 1, unit: "years" },
    icon: "☁️",
    popularity: 85,
    tags: ["software", "subscription", "cloud"]
  }
];

// Usage example
function demonstrateAutocomplete() {
  console.log("=== Intelligent Autocomplete Demo ===\n");

  const autocomplete = new IntelligentAutocomplete();

  // Load categories
  sampleCategories.forEach(cat => autocomplete.insert(cat));

  // Test 1: Search with "lap"
  console.log("1. User types: 'lap'");
  console.log("-".repeat(60));
  const results1 = autocomplete.search("lap", 5);
  results1.forEach(result => {
    console.log(`   ${result.icon} ${result.displayText}`);
    console.log(`      → Monthly equivalent: $${result.monthlyCost}/month`);
    console.log(`      → Typical lifespan: ${result.lifespan.value} ${result.lifespan.unit}`);
  });

  console.log("\n2. User types: 'pro'");
  console.log("-".repeat(60));
  const results2 = autocomplete.search("pro", 5);
  results2.forEach(result => {
    console.log(`   ${result.icon} ${result.displayText}`);
  });

  console.log("\n3. User types: 'desk' (partial match)");
  console.log("-".repeat(60));
  const results3 = autocomplete.search("desk", 5);
  results3.forEach(result => {
    console.log(`   ${result.icon} ${result.displayText}`);
  });

  console.log("\n4. User types: 'cmera' (typo - fuzzy search)");
  console.log("-".repeat(60));
  const results4 = autocomplete.search("cmera", 5);
  results4.forEach(result => {
    console.log(`   ${result.icon} ${result.displayText}`);
  });

  console.log("\n5. Empty query (popular categories)");
  console.log("-".repeat(60));
  const results5 = autocomplete.search("", 5);
  results5.forEach(result => {
    console.log(`   ${result.icon} ${result.displayText}`);
  });
}

// Run the demo
if (require.main === module) {
  demonstrateAutocomplete();
}

module.exports = { IntelligentAutocomplete, sampleCategories };
