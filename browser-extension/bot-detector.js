/**
 * StockTwits Bot Detector - Core Algorithm
 * Analyzes user posts to identify automated accounts and spam bots
 */

class BotDetector {
  constructor() {
    this.suspiciousPatterns = {
      // Common promotional domains
      promotionalDomains: [
        'moneygroup.us',
        '1ightning.com',
        'liquidtheta.com',
        '.io/join',
        'premium-alerts',
        'discord.gg',
        't.me/'
      ],

      // Repetitive emoji signatures
      emojiSignatures: ['🍀', '💎', '🔥', '🚀', '💰'],

      // Promotional keywords
      promotionalKeywords: [
        'join here',
        'premium alerts',
        'subscribe',
        'profit potential',
        'roi blended',
        'want profitable',
        'scale in',
        'scale out',
        'join 💎 here',
        'enter:',
        'exit:',
        'strike price:'
      ],

      // Generic phrases that bots repeat
      genericPhrases: [
        'good luck',
        'good luck 🍀',
        'mark this',
        'mark it',
        'bullish',
        'bearish',
        'to the moon',
        'lfg',
        'gla'
      ]
    };

    this.userPostHistory = new Map(); // Track posts per user
  }

  /**
   * Analyze a single post for bot characteristics
   * @param {Object} post - Post object with username, content, timestamp
   * @returns {Object} Analysis result with botScore and reasons
   */
  analyzePost(post) {
    const { username, content, timestamp } = post;

    let botScore = 0;
    const reasons = [];

    // Track user's posting history
    if (!this.userPostHistory.has(username)) {
      this.userPostHistory.set(username, []);
    }
    this.userPostHistory.get(username).push({ content, timestamp });

    // 1. Check for promotional links
    const linkScore = this.checkPromotionalLinks(content);
    if (linkScore > 0) {
      botScore += linkScore;
      reasons.push(`Contains promotional links (${linkScore} points)`);
    }

    // 2. Check for repetitive formatting
    const formatScore = this.checkRepetitiveFormatting(username);
    if (formatScore > 0) {
      botScore += formatScore;
      reasons.push(`Repetitive formatting detected (${formatScore} points)`);
    }

    // 3. Check for emoji signatures
    const emojiScore = this.checkEmojiSignature(content);
    if (emojiScore > 0) {
      botScore += emojiScore;
      reasons.push(`Consistent emoji signature (${emojiScore} points)`);
    }

    // 4. Check for promotional keywords
    const keywordScore = this.checkPromotionalKeywords(content);
    if (keywordScore > 0) {
      botScore += keywordScore;
      reasons.push(`Promotional keywords (${keywordScore} points)`);
    }

    // 5. Check for ALL CAPS spam
    const capsScore = this.checkExcessiveCaps(content);
    if (capsScore > 0) {
      botScore += capsScore;
      reasons.push(`Excessive ALL CAPS (${capsScore} points)`);
    }

    // 6. Check posting frequency
    const frequencyScore = this.checkPostingFrequency(username);
    if (frequencyScore > 0) {
      botScore += frequencyScore;
      reasons.push(`Suspiciously high posting frequency (${frequencyScore} points)`);
    }

    // 7. Check for identical posts
    const duplicateScore = this.checkDuplicatePosts(username);
    if (duplicateScore > 0) {
      botScore += duplicateScore;
      reasons.push(`Posting identical/near-identical content (${duplicateScore} points)`);
    }

    // 8. Check for structured trading alerts format
    const alertScore = this.checkTradingAlertFormat(content);
    if (alertScore > 0) {
      botScore += alertScore;
      reasons.push(`Automated trading alert format (${alertScore} points)`);
    }

    return {
      username,
      botScore,
      reasons,
      classification: this.classifyBot(botScore),
      timestamp: Date.now()
    };
  }

  /**
   * Check for promotional links
   */
  checkPromotionalLinks(content) {
    let score = 0;
    const lowerContent = content.toLowerCase();

    for (const domain of this.suspiciousPatterns.promotionalDomains) {
      if (lowerContent.includes(domain.toLowerCase())) {
        score += 30; // High confidence bot indicator
        break;
      }
    }

    // Check for generic promotional patterns
    if (lowerContent.match(/https?:\/\/[^\s]+\.(us|io|com)\/?(join|premium|vip|alerts)/i)) {
      score += 25;
    }

    return score;
  }

  /**
   * Check for repetitive formatting across user's posts
   */
  checkRepetitiveFormatting(username) {
    const posts = this.userPostHistory.get(username) || [];
    if (posts.length < 3) return 0;

    // Get last 5 posts
    const recentPosts = posts.slice(-5);

    // Check for identical structure
    const structures = recentPosts.map(p => this.getPostStructure(p.content));
    const uniqueStructures = new Set(structures);

    // If 80%+ of posts have identical structure, likely bot
    if (uniqueStructures.size === 1 && recentPosts.length >= 3) {
      return 25;
    }

    if (uniqueStructures.size <= 2 && recentPosts.length >= 5) {
      return 15;
    }

    return 0;
  }

  /**
   * Extract post structure (pattern of lines, capitalization, etc.)
   */
  getPostStructure(content) {
    return content
      .split('\n')
      .map(line => {
        if (line.match(/^[A-Z\s]+:/)) return 'CAPS_LABEL:';
        if (line.match(/^\$\d+/)) return '$NUM';
        if (line.match(/https?:/)) return 'LINK';
        if (line.match(/\d+%/)) return 'PERCENT';
        return 'TEXT';
      })
      .join('|');
  }

  /**
   * Check for consistent emoji signatures
   */
  checkEmojiSignature(content) {
    let count = 0;
    for (const emoji of this.suspiciousPatterns.emojiSignatures) {
      if (content.includes(emoji)) {
        count++;
      }
    }

    // Multiple promotional emojis = likely bot
    if (count >= 3) return 20;
    if (count >= 2) return 10;

    // Check for "Good luck 🍀" pattern specifically
    if (content.toLowerCase().includes('good luck') && content.includes('🍀')) {
      return 15;
    }

    return 0;
  }

  /**
   * Check for promotional keywords
   */
  checkPromotionalKeywords(content) {
    const lowerContent = content.toLowerCase();
    let score = 0;
    let matches = 0;

    for (const keyword of this.suspiciousPatterns.promotionalKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        matches++;
      }
    }

    if (matches >= 3) return 20;
    if (matches >= 2) return 15;
    if (matches >= 1) return 5;

    return score;
  }

  /**
   * Check for excessive ALL CAPS
   */
  checkExcessiveCaps(content) {
    const words = content.split(/\s+/);
    const capsWords = words.filter(w => w === w.toUpperCase() && w.length > 2);
    const capsRatio = capsWords.length / words.length;

    if (capsRatio > 0.6) return 20; // 60%+ all caps
    if (capsRatio > 0.4) return 10; // 40%+ all caps

    return 0;
  }

  /**
   * Check posting frequency (posts per hour)
   */
  checkPostingFrequency(username) {
    const posts = this.userPostHistory.get(username) || [];
    if (posts.length < 5) return 0;

    // Get posts from last hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentPosts = posts.filter(p => p.timestamp > oneHourAgo);

    if (recentPosts.length > 20) return 25; // 20+ posts/hour
    if (recentPosts.length > 10) return 15; // 10+ posts/hour
    if (recentPosts.length > 5) return 5;   // 5+ posts/hour

    return 0;
  }

  /**
   * Check for duplicate/near-duplicate posts
   */
  checkDuplicatePosts(username) {
    const posts = this.userPostHistory.get(username) || [];
    if (posts.length < 3) return 0;

    const recentPosts = posts.slice(-10);

    // Compare each post with others
    let duplicateCount = 0;
    for (let i = 0; i < recentPosts.length; i++) {
      for (let j = i + 1; j < recentPosts.length; j++) {
        const similarity = this.calculateSimilarity(
          recentPosts[i].content,
          recentPosts[j].content
        );
        if (similarity > 0.8) {
          duplicateCount++;
        }
      }
    }

    if (duplicateCount > 5) return 30; // Many duplicates
    if (duplicateCount > 2) return 15; // Some duplicates

    return 0;
  }

  /**
   * Calculate text similarity (Jaccard similarity)
   */
  calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Check for structured trading alert format
   */
  checkTradingAlertFormat(content) {
    const alertPatterns = [
      /enter:\s*\$/i,
      /exit:\s*\$/i,
      /strike price:/i,
      /expiry date:/i,
      /buy in price:/i,
      /sell price:/i,
      /profit:/i,
      /\d+% roi/i,
      /turn every \$1 into/i
    ];

    let matches = 0;
    for (const pattern of alertPatterns) {
      if (pattern.test(content)) {
        matches++;
      }
    }

    // Structured options alerts are almost always bots
    if (matches >= 4) return 40;
    if (matches >= 3) return 30;
    if (matches >= 2) return 15;

    return 0;
  }

  /**
   * Classify bot based on total score
   */
  classifyBot(score) {
    if (score >= 60) return 'CONFIRMED_BOT';
    if (score >= 35) return 'LIKELY_BOT';
    if (score >= 20) return 'SUSPICIOUS';
    return 'HUMAN';
  }

  /**
   * Get statistics on detected bots
   */
  getStatistics() {
    const stats = {
      totalUsers: this.userPostHistory.size,
      totalPosts: 0,
      confirmedBots: 0,
      likelyBots: 0,
      suspicious: 0,
      human: 0
    };

    for (const [username, posts] of this.userPostHistory) {
      stats.totalPosts += posts.length;

      // Analyze latest post for this user
      if (posts.length > 0) {
        const latestPost = posts[posts.length - 1];
        const analysis = this.analyzePost({
          username,
          content: latestPost.content,
          timestamp: latestPost.timestamp
        });

        switch (analysis.classification) {
          case 'CONFIRMED_BOT':
            stats.confirmedBots++;
            break;
          case 'LIKELY_BOT':
            stats.likelyBots++;
            break;
          case 'SUSPICIOUS':
            stats.suspicious++;
            break;
          default:
            stats.human++;
        }
      }
    }

    return stats;
  }

  /**
   * Clear history (for memory management)
   */
  clearHistory() {
    this.userPostHistory.clear();
  }
}

// Make available globally
window.BotDetector = BotDetector;
