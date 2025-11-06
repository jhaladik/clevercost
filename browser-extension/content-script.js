/**
 * StockTwits Bot Detector - Content Script
 * Runs on StockTwits pages to analyze posts in real-time
 */

(function() {
  'use strict';

  // Initialize bot detector
  const detector = new BotDetector();
  const analyzedPosts = new Set(); // Track which posts we've already analyzed
  let settings = {
    enabled: true,
    sensitivity: 'medium', // low, medium, high
    showLabels: true,
    highlightBots: true,
    autoHide: false
  };

  // Sensitivity thresholds
  const sensitivityThresholds = {
    low: { confirmed: 80, likely: 50, suspicious: 35 },
    medium: { confirmed: 60, likely: 35, suspicious: 20 },
    high: { confirmed: 40, likely: 25, suspicious: 15 }
  };

  // Load settings from storage
  chrome.storage.sync.get('settings', (data) => {
    if (data.settings) {
      settings = { ...settings, ...data.settings };
    }
    console.log('StockTwits Bot Detector loaded', settings);
  });

  /**
   * Extract post information from StockTwits DOM element
   */
  function extractPostInfo(postElement) {
    try {
      // StockTwits post structure (may need adjustment based on actual DOM)
      const usernameElement = postElement.querySelector('[class*="username"], [class*="UserName"], a[href*="/"]');
      const contentElement = postElement.querySelector('[class*="body"], [class*="content"], [class*="message"]');
      const timeElement = postElement.querySelector('[class*="time"], time, [datetime]');

      if (!usernameElement || !contentElement) {
        return null;
      }

      const username = usernameElement.textContent.trim().replace('@', '');
      const content = contentElement.textContent.trim();
      const timeStr = timeElement ? timeElement.getAttribute('datetime') || timeElement.textContent : null;

      // Parse timestamp
      let timestamp = Date.now();
      if (timeStr) {
        const parsed = new Date(timeStr);
        if (!isNaN(parsed)) {
          timestamp = parsed.getTime();
        }
      }

      return {
        username,
        content,
        timestamp,
        element: postElement
      };
    } catch (error) {
      console.error('Error extracting post info:', error);
      return null;
    }
  }

  /**
   * Analyze and mark a post
   */
  function analyzePost(postElement) {
    // Skip if already analyzed
    const postId = postElement.getAttribute('data-bot-analyzed');
    if (postId) {
      return;
    }

    const postInfo = extractPostInfo(postElement);
    if (!postInfo) {
      return;
    }

    // Mark as analyzed
    postElement.setAttribute('data-bot-analyzed', 'true');

    // Analyze with bot detector
    const analysis = detector.analyzePost(postInfo);

    // Apply thresholds based on sensitivity
    const thresholds = sensitivityThresholds[settings.sensitivity];
    let classification = analysis.classification;

    if (analysis.botScore >= thresholds.confirmed) {
      classification = 'CONFIRMED_BOT';
    } else if (analysis.botScore >= thresholds.likely) {
      classification = 'LIKELY_BOT';
    } else if (analysis.botScore >= thresholds.suspicious) {
      classification = 'SUSPICIOUS';
    } else {
      classification = 'HUMAN';
    }

    // Store analysis result
    postElement.setAttribute('data-bot-score', analysis.botScore);
    postElement.setAttribute('data-bot-classification', classification);

    // Apply visual indicators
    if (settings.enabled && classification !== 'HUMAN') {
      markBotPost(postElement, classification, analysis);
    }

    // Update stats
    updateStats();
  }

  /**
   * Mark a post as bot-generated
   */
  function markBotPost(postElement, classification, analysis) {
    // Add CSS class for styling
    postElement.classList.add('bot-detected');
    postElement.classList.add(`bot-${classification.toLowerCase()}`);

    // Add warning label
    if (settings.showLabels) {
      addWarningLabel(postElement, classification, analysis);
    }

    // Highlight background
    if (settings.highlightBots) {
      highlightPost(postElement, classification);
    }

    // Auto-hide if enabled
    if (settings.autoHide && classification === 'CONFIRMED_BOT') {
      hidePost(postElement);
    }
  }

  /**
   * Add visual warning label to post
   */
  function addWarningLabel(postElement, classification, analysis) {
    // Check if label already exists
    if (postElement.querySelector('.bot-warning-label')) {
      return;
    }

    const label = document.createElement('div');
    label.className = `bot-warning-label bot-warning-${classification.toLowerCase()}`;

    const emoji = {
      'CONFIRMED_BOT': '🤖',
      'LIKELY_BOT': '⚠️',
      'SUSPICIOUS': '⚡'
    };

    const text = {
      'CONFIRMED_BOT': 'BOT DETECTED',
      'LIKELY_BOT': 'LIKELY BOT',
      'SUSPICIOUS': 'SUSPICIOUS'
    };

    label.innerHTML = `
      <div class="bot-warning-content">
        <span class="bot-warning-emoji">${emoji[classification]}</span>
        <span class="bot-warning-text">${text[classification]}</span>
        <span class="bot-warning-score">${analysis.botScore} pts</span>
      </div>
      <div class="bot-warning-details" style="display: none;">
        <div class="bot-warning-reasons">
          ${analysis.reasons.map(r => `<div>• ${r}</div>`).join('')}
        </div>
      </div>
    `;

    // Toggle details on click
    label.querySelector('.bot-warning-content').addEventListener('click', (e) => {
      e.stopPropagation();
      const details = label.querySelector('.bot-warning-details');
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    });

    // Insert at top of post
    postElement.insertBefore(label, postElement.firstChild);
  }

  /**
   * Highlight post background
   */
  function highlightPost(postElement, classification) {
    const colors = {
      'CONFIRMED_BOT': 'rgba(255, 0, 0, 0.1)',
      'LIKELY_BOT': 'rgba(255, 165, 0, 0.1)',
      'SUSPICIOUS': 'rgba(255, 255, 0, 0.08)'
    };

    postElement.style.backgroundColor = colors[classification];
  }

  /**
   * Hide post (collapse it)
   */
  function hidePost(postElement) {
    postElement.classList.add('bot-hidden');

    // Add "Show" button
    const showBtn = document.createElement('div');
    showBtn.className = 'bot-show-button';
    showBtn.textContent = '🤖 Hidden bot post (click to show)';
    showBtn.addEventListener('click', () => {
      postElement.classList.remove('bot-hidden');
      showBtn.remove();
    });

    postElement.parentNode.insertBefore(showBtn, postElement);
  }

  /**
   * Find and analyze all posts on the page
   */
  function scanPage() {
    if (!settings.enabled) {
      return;
    }

    // Find all post elements (adjust selectors based on actual StockTwits DOM)
    const postSelectors = [
      '[class*="Message"]',
      '[class*="Post"]',
      '[class*="StreamMessage"]',
      'article',
      '[data-testid*="message"]',
      '[data-testid*="post"]'
    ];

    let posts = [];
    for (const selector of postSelectors) {
      const found = document.querySelectorAll(selector);
      if (found.length > 0) {
        posts = Array.from(found);
        break;
      }
    }

    // Analyze each post
    posts.forEach(post => analyzePost(post));
  }

  /**
   * Update statistics and send to popup
   */
  function updateStats() {
    const stats = detector.getStatistics();
    chrome.storage.local.set({ stats });
  }

  /**
   * Set up mutation observer to detect new posts
   */
  function observeNewPosts() {
    const observer = new MutationObserver((mutations) => {
      // Debounce scanning
      clearTimeout(observer.scanTimeout);
      observer.scanTimeout = setTimeout(() => {
        scanPage();
      }, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Listen for messages from popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'toggleEnabled':
        settings.enabled = message.enabled;
        chrome.storage.sync.set({ settings });

        if (settings.enabled) {
          scanPage();
        } else {
          // Remove all bot indicators
          document.querySelectorAll('.bot-detected').forEach(post => {
            post.classList.remove('bot-detected', 'bot-confirmed_bot', 'bot-likely_bot', 'bot-suspicious');
            post.style.backgroundColor = '';
            post.querySelector('.bot-warning-label')?.remove();
          });
        }
        sendResponse({ success: true });
        break;

      case 'updateSettings':
        settings = { ...settings, ...message.settings };
        chrome.storage.sync.set({ settings });
        scanPage(); // Re-scan with new settings
        sendResponse({ success: true });
        break;

      case 'getStats':
        const stats = detector.getStatistics();
        sendResponse({ stats });
        break;

      case 'rescan':
        // Clear analysis and re-scan
        document.querySelectorAll('[data-bot-analyzed]').forEach(post => {
          post.removeAttribute('data-bot-analyzed');
          post.querySelector('.bot-warning-label')?.remove();
        });
        scanPage();
        sendResponse({ success: true });
        break;
    }
    return true; // Keep message channel open for async response
  });

  /**
   * Initialize
   */
  function init() {
    console.log('StockTwits Bot Detector: Initializing...');

    // Initial scan
    setTimeout(() => {
      scanPage();
    }, 1000);

    // Set up observer for new posts
    observeNewPosts();

    // Periodic re-scan (every 10 seconds)
    setInterval(() => {
      scanPage();
    }, 10000);

    console.log('StockTwits Bot Detector: Ready!');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
