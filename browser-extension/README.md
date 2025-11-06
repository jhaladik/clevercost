# StockTwits Bot Detector - Browser Extension

An intelligent browser extension that detects and flags automated bot accounts and promotional spam on StockTwits in real-time.

## Features

- **Real-time Bot Detection** - Analyzes posts as you browse StockTwits
- **Multi-level Classification** - Identifies confirmed bots, likely bots, and suspicious accounts
- **Visual Indicators** - Color-coded warnings and badges on bot posts
- **Configurable Sensitivity** - Low, Medium, and High detection modes
- **Detailed Analysis** - Click any warning to see detection reasons
- **Auto-hide Option** - Automatically hide confirmed bot posts
- **Statistics Dashboard** - Track detected bots in real-time
- **Privacy-focused** - All processing happens locally in your browser

## Detection Criteria

The extension uses advanced heuristics to identify bots:

### Confirmed Bot Indicators (High Confidence)
- Promotional links to paid services (moneygroup.us, 1ightning.com, etc.)
- Structured trading alert formats (Enter/Exit/Strike Price/ROI)
- Identical post formatting across multiple messages
- Excessive posting frequency (20+ posts/hour)

### Suspicious Patterns
- Repetitive emoji signatures (🍀, 💎, 🔥)
- Promotional keywords (join here, premium alerts, subscribe)
- ALL CAPS spam
- Near-identical duplicate posts
- Generic phrases repeated

## Installation

### Chrome / Edge / Brave

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `browser-extension` folder
6. The extension icon should appear in your toolbar

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Navigate to the `browser-extension` folder and select `manifest.json`
6. The extension will be active until you restart Firefox

For permanent installation in Firefox, you'll need to sign the extension through Mozilla's Add-on Developer Hub.

## Usage

1. **Install the Extension** - Follow installation steps above
2. **Visit StockTwits** - Navigate to any StockTwits page (e.g., https://stocktwits.com/symbol/AKBA)
3. **Automatic Detection** - The extension automatically scans and flags bot posts
4. **View Warnings** - Bot posts will have colored warning labels
5. **Click for Details** - Click any warning label to see detection reasons
6. **Adjust Settings** - Click the extension icon to customize detection settings

## Settings

### Sensitivity Levels

- **Low** - Only flags obvious bots (promotional services, structured alerts)
- **Medium** (Recommended) - Balanced detection with reasonable false positive rate
- **High** - Aggressive detection, may flag some legitimate users

### Display Options

- **Show Warning Labels** - Display bot warning badges on posts
- **Highlight Bot Posts** - Add colored backgrounds to bot posts
- **Auto-Hide Confirmed Bots** - Automatically collapse confirmed bot posts

## Examples of Detected Bots

### Confirmed Bots
- **MoneyGroupLLC** - Promotional options alerts with links
- **1ightningOptionsAlerts** - Structured trading signals
- **LiquidThetaOptions** - Automated premium service promotions

### Suspicious Patterns
- Users posting "Good luck 🍀" on every message
- Excessive ALL CAPS posts
- Identical message formatting across posts
- High-frequency posting (10+ posts/hour)

## Privacy & Security

- **No Data Collection** - The extension doesn't collect or transmit any data
- **Local Processing** - All analysis happens in your browser
- **No Network Requests** - Works entirely offline (except loading StockTwits)
- **Open Source** - Review the code yourself

## Technical Details

### Architecture

- **bot-detector.js** - Core detection algorithm with scoring system
- **content-script.js** - DOM analysis and real-time scanning
- **popup.html/js** - Settings interface and statistics
- **styles.css** - Visual indicators and UI styling

### Detection Algorithm

The bot detector uses a point-based scoring system:

- Each suspicious pattern adds points
- Total score determines classification:
  - 60+ points = Confirmed Bot
  - 35-59 points = Likely Bot
  - 20-34 points = Suspicious
  - < 20 points = Human

### Performance

- Minimal performance impact
- Uses MutationObserver for efficient DOM monitoring
- Debounced scanning (500ms)
- Periodic re-scan every 10 seconds

## Development

### File Structure

```
browser-extension/
├── manifest.json          # Extension configuration
├── bot-detector.js        # Core detection algorithm
├── content-script.js      # StockTwits page integration
├── popup.html            # Settings popup UI
├── popup.js              # Settings popup logic
├── styles.css            # Visual styling
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Testing

1. Load the extension in Chrome
2. Navigate to StockTwits
3. Open DevTools Console
4. Look for "StockTwits Bot Detector" logs
5. Check for any errors

### Contributing

Contributions welcome! Areas for improvement:

- Machine learning-based detection
- User reporting system
- Whitelist/blacklist functionality
- Export statistics feature
- Multi-language support

## Known Issues

- StockTwits DOM structure may change, requiring selector updates
- Some legitimate users may be flagged if using repetitive patterns
- Initial scan may take a few seconds on pages with many posts

## Changelog

### Version 1.0.0 (2025-11-06)
- Initial release
- Real-time bot detection
- Configurable sensitivity levels
- Statistics dashboard
- Visual warning indicators

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@example.com

## Disclaimer

This extension is provided as-is for educational and informational purposes. Detection accuracy is not guaranteed. Use at your own discretion.

---

**Made with ❤️ for smarter trading**
