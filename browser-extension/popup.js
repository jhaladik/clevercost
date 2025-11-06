/**
 * StockTwits Bot Detector - Popup Script
 * Handles settings and statistics display
 */

// DOM Elements
const enabledToggle = document.getElementById('enabledToggle');
const sensitivitySelect = document.getElementById('sensitivitySelect');
const showLabelsToggle = document.getElementById('showLabelsToggle');
const highlightToggle = document.getElementById('highlightToggle');
const autoHideToggle = document.getElementById('autoHideToggle');
const rescanBtn = document.getElementById('rescanBtn');
const clearBtn = document.getElementById('clearBtn');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// Stat counters
const confirmedCount = document.getElementById('confirmedCount');
const likelyCount = document.getElementById('likelyCount');
const suspiciousCount = document.getElementById('suspiciousCount');
const humanCount = document.getElementById('humanCount');

// Load settings and stats on popup open
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadStats();

  // Set up event listeners
  setupEventListeners();

  // Update stats every 2 seconds
  setInterval(loadStats, 2000);
});

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('settings');
    const settings = result.settings || {
      enabled: true,
      sensitivity: 'medium',
      showLabels: true,
      highlightBots: true,
      autoHide: false
    };

    // Update UI
    enabledToggle.checked = settings.enabled;
    sensitivitySelect.value = settings.sensitivity;
    showLabelsToggle.checked = settings.showLabels;
    highlightToggle.checked = settings.highlightBots;
    autoHideToggle.checked = settings.autoHide;

    // Update status indicator
    updateStatusIndicator(settings.enabled);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Load statistics from storage
 */
async function loadStats() {
  try {
    // Get stats from content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url.includes('stocktwits.com')) {
      // Not on StockTwits
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'getStats' }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script not ready yet
        return;
      }

      if (response && response.stats) {
        updateStatsDisplay(response.stats);
      }
    });
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Update statistics display
 */
function updateStatsDisplay(stats) {
  confirmedCount.textContent = stats.confirmedBots || 0;
  likelyCount.textContent = stats.likelyBots || 0;
  suspiciousCount.textContent = stats.suspicious || 0;
  humanCount.textContent = stats.human || 0;

  // Animate counts
  animateValue(confirmedCount);
  animateValue(likelyCount);
  animateValue(suspiciousCount);
  animateValue(humanCount);
}

/**
 * Animate counter value change
 */
function animateValue(element) {
  element.style.transform = 'scale(1.1)';
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 200);
}

/**
 * Update status indicator
 */
function updateStatusIndicator(enabled) {
  if (enabled) {
    statusIndicator.classList.remove('inactive');
    statusIndicator.classList.add('active');
    statusText.textContent = 'Active';
  } else {
    statusIndicator.classList.remove('active');
    statusIndicator.classList.add('inactive');
    statusText.textContent = 'Inactive';
  }
}

/**
 * Save settings to storage and notify content script
 */
async function saveSettings() {
  const settings = {
    enabled: enabledToggle.checked,
    sensitivity: sensitivitySelect.value,
    showLabels: showLabelsToggle.checked,
    highlightBots: highlightToggle.checked,
    autoHide: autoHideToggle.checked
  };

  try {
    await chrome.storage.sync.set({ settings });

    // Update status indicator
    updateStatusIndicator(settings.enabled);

    // Notify content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url.includes('stocktwits.com')) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateSettings',
        settings
      });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Toggle switches
  enabledToggle.addEventListener('change', async () => {
    await saveSettings();

    // Send toggle message to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url.includes('stocktwits.com')) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleEnabled',
        enabled: enabledToggle.checked
      });
    }
  });

  showLabelsToggle.addEventListener('change', saveSettings);
  highlightToggle.addEventListener('change', saveSettings);
  autoHideToggle.addEventListener('change', saveSettings);
  sensitivitySelect.addEventListener('change', saveSettings);

  // Re-scan button
  rescanBtn.addEventListener('click', async () => {
    rescanBtn.textContent = '🔄 Scanning...';
    rescanBtn.disabled = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url.includes('stocktwits.com')) {
        alert('Please navigate to StockTwits first!');
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: 'rescan' }, () => {
        setTimeout(() => {
          rescanBtn.textContent = '🔄 Re-scan';
          rescanBtn.disabled = false;
          loadStats();
        }, 1000);
      });
    } catch (error) {
      console.error('Error rescanning:', error);
      rescanBtn.textContent = '🔄 Re-scan';
      rescanBtn.disabled = false;
    }
  });

  // Clear data button
  clearBtn.addEventListener('click', async () => {
    if (!confirm('Clear all detection data? This will reset all statistics.')) {
      return;
    }

    try {
      await chrome.storage.local.remove('stats');

      // Reset display
      confirmedCount.textContent = '0';
      likelyCount.textContent = '0';
      suspiciousCount.textContent = '0';
      humanCount.textContent = '0';

      // Reload page
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url.includes('stocktwits.com')) {
        chrome.tabs.reload(tab.id);
      }
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  });
}

/**
 * Handle errors gracefully
 */
window.addEventListener('error', (event) => {
  console.error('Popup error:', event.error);
});
