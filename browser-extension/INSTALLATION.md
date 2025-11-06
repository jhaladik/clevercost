# Installation Guide - StockTwits Bot Detector

## Quick Start (5 minutes)

### Step 1: Create Extension Icons

Before installing, you need to create icon files. You have two options:

#### Option A: Use Placeholder Icons (Quick)
Run these commands in the browser-extension directory:

```bash
cd browser-extension/icons

# Create simple placeholder icons using ImageMagick (if available)
convert -size 16x16 xc:purple -fill white -pointsize 12 -gravity center -annotate +0+0 "🤖" icon16.png
convert -size 32x32 xc:purple -fill white -pointsize 24 -gravity center -annotate +0+0 "🤖" icon32.png
convert -size 48x48 xc:purple -fill white -pointsize 36 -gravity center -annotate +0+0 "🤖" icon48.png
convert -size 128x128 xc:purple -fill white -pointsize 96 -gravity center -annotate +0+0 "🤖" icon128.png
```

#### Option B: Create Custom Icons (Recommended)
1. Use any image editor (Photoshop, GIMP, Figma, etc.)
2. Create 4 PNG files with these dimensions:
   - icon16.png (16x16 pixels)
   - icon32.png (32x32 pixels)
   - icon48.png (48x48 pixels)
   - icon128.png (128x128 pixels)
3. Design: Use a robot emoji or bot-related icon
4. Save them in `browser-extension/icons/`

**Quick tip:** Use https://favicon.io/ or https://www.canva.com/ to create icons easily.

---

### Step 2: Install in Chrome/Edge/Brave

1. **Open Extensions Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`
   - Brave: Navigate to `brave://extensions/`

2. **Enable Developer Mode**
   - Find the "Developer mode" toggle in the top-right corner
   - Turn it ON

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to your `clevercost/browser-extension` folder
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "StockTwits Bot Detector" in your extensions list
   - The extension icon should appear in your toolbar
   - Status should show "Enabled"

5. **Pin the Extension** (Optional but recommended)
   - Click the puzzle piece icon in your toolbar
   - Find "StockTwits Bot Detector"
   - Click the pin icon to keep it visible

---

### Step 3: Install in Firefox

1. **Open Debugging Page**
   - Navigate to `about:debugging`

2. **This Firefox**
   - Click "This Firefox" in the left sidebar

3. **Load Temporary Add-on**
   - Click "Load Temporary Add-on" button
   - Navigate to `clevercost/browser-extension`
   - Select the `manifest.json` file
   - Click "Open"

4. **Verify Installation**
   - Extension should appear in the list
   - Extension icon should be in your toolbar

**Note:** In Firefox, temporary extensions are removed when you close the browser. For permanent installation, you need to package and sign the extension through Mozilla's Add-on Developer Hub.

---

### Step 4: Test the Extension

1. **Visit StockTwits**
   - Go to https://stocktwits.com/
   - Navigate to any stock page (e.g., https://stocktwits.com/symbol/AKBA)

2. **Check Console**
   - Open DevTools (F12 or Right-click → Inspect)
   - Go to Console tab
   - Look for: `"StockTwits Bot Detector: Initializing..."`
   - Then: `"StockTwits Bot Detector: Ready!"`

3. **See Detection in Action**
   - Posts should be automatically scanned
   - Bot posts will have warning labels
   - Look for colored borders and badges

4. **Open Popup**
   - Click the extension icon in your toolbar
   - You should see statistics and settings
   - Try changing sensitivity levels

5. **Test Settings**
   - Try toggling "Enable Detection" off/on
   - Change sensitivity level
   - Toggle auto-hide feature

---

## Troubleshooting

### Icons Missing Error

**Problem:** "Could not load icon 'icons/icon16.png'"

**Solution:**
- Create the icon files as described in Step 1
- Make sure files are in `browser-extension/icons/` folder
- Check that filenames are exactly: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`

### Extension Not Detecting

**Problem:** No bot warnings appear on StockTwits

**Solutions:**
1. Check that extension is enabled (click icon, verify status is "Active")
2. Refresh the StockTwits page (F5)
3. Open DevTools console and check for JavaScript errors
4. Try clicking "Re-scan" button in the popup
5. Check that you're on stocktwits.com (extension only works there)

### Content Script Not Loading

**Problem:** Console shows no "StockTwits Bot Detector" messages

**Solutions:**
1. Reload the extension:
   - Go to `chrome://extensions/`
   - Click the refresh icon on the extension card
2. Refresh the StockTwits page
3. Check that the extension has permissions for stocktwits.com

### Stats Not Updating

**Problem:** Statistics in popup show all zeros

**Solutions:**
1. Make sure you're on a StockTwits page with posts
2. Wait 10-15 seconds for initial scan to complete
3. Click "Re-scan" button
4. Check console for JavaScript errors

### Popup Won't Open

**Problem:** Clicking extension icon does nothing

**Solutions:**
1. Check for errors in `chrome://extensions/`
2. Look at background errors
3. Reload the extension
4. Try re-installing the extension

---

## Advanced Configuration

### Modify Detection Sensitivity

Edit `bot-detector.js` and adjust these values:

```javascript
const sensitivityThresholds = {
  low: { confirmed: 80, likely: 50, suspicious: 35 },
  medium: { confirmed: 60, likely: 35, suspicious: 20 },
  high: { confirmed: 40, likely: 25, suspicious: 15 }
};
```

### Add Custom Detection Patterns

Edit `bot-detector.js` in the `suspiciousPatterns` object:

```javascript
promotionalDomains: [
  'moneygroup.us',
  'your-domain-here.com',  // Add custom domains
  // ...
],

promotionalKeywords: [
  'join here',
  'your keyword here',  // Add custom keywords
  // ...
]
```

### Change Visual Styling

Edit `styles.css` to customize colors, borders, and animations:

```css
/* Change confirmed bot color */
.bot-warning-confirmed_bot {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
  border-left-color: #your-border-color;
}
```

---

## Updating the Extension

When you make changes to the code:

1. **Chrome/Edge/Brave:**
   - Go to `chrome://extensions/`
   - Find "StockTwits Bot Detector"
   - Click the refresh icon (circular arrow)
   - Reload any open StockTwits tabs

2. **Firefox:**
   - Go to `about:debugging`
   - Find the extension
   - Click "Reload"
   - Reload any open StockTwits tabs

---

## Uninstalling

### Chrome/Edge/Brave
1. Go to `chrome://extensions/`
2. Find "StockTwits Bot Detector"
3. Click "Remove"
4. Confirm removal

### Firefox
1. Go to `about:addons`
2. Find "StockTwits Bot Detector"
3. Click "..." menu
4. Click "Remove"

---

## Privacy & Permissions

The extension requests these permissions:

- **storage** - To save your settings and statistics locally
- **activeTab** - To analyze the current StockTwits tab when you click the icon
- **host_permissions: stocktwits.com** - To run the content script on StockTwits pages

**No data is collected or transmitted.** Everything runs locally in your browser.

---

## Need Help?

- Check the main README.md for more details
- Open DevTools console for error messages
- Make sure you have the latest code
- Try disabling other extensions that might conflict

---

**Happy bot hunting!** 🤖🔍
