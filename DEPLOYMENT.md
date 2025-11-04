# CleverCost Deployment Guide

## GitHub Pages Deployment

CleverCost can be deployed to GitHub Pages for free hosting. Follow these steps:

### Option 1: Deploy from Branch (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git push origin claude/brainstorm-cost-calculator-011CUoVc7meyKL5D2Y3uF9Nj
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select your branch: `claude/brainstorm-cost-calculator-011CUoVc7meyKL5D2Y3uF9Nj`
   - Click **Save**

3. **Access your site:**
   - Your site will be available at: `https://jhaladik.github.io/clevercost/`
   - It may take a few minutes to deploy

### Option 2: Deploy from Main Branch

If you want to deploy from the main branch:

1. **Merge to main:**
   ```bash
   git checkout main
   git merge claude/brainstorm-cost-calculator-011CUoVc7meyKL5D2Y3uF9Nj
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Select branch: `main`
   - Select folder: `/ (root)`
   - Click Save

### Option 3: Using GitHub Actions (Advanced)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Pages
        uses: actions/configure-pages@v3
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

## Alternative Deployment Options

### Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts

### Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy
   ```

3. For production:
   ```bash
   netlify deploy --prod
   ```

### Cloudflare Pages

1. Go to Cloudflare Pages dashboard
2. Connect your GitHub repository
3. Set build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
4. Deploy

## Testing Locally

Before deploying, test locally:

### Option 1: Python HTTP Server
```bash
python -m http.server 8000
# Or with Python 3:
python3 -m http.server 8000
```

Then visit: http://localhost:8000

### Option 2: Node.js HTTP Server
```bash
npx http-server -p 8000
```

Then visit: http://localhost:8000

### Option 3: VS Code Live Server

1. Install "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Custom Domain (Optional)

To use a custom domain with GitHub Pages:

1. Add a `CNAME` file to your repository:
   ```bash
   echo "clevercost.yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. Configure DNS:
   - Add a CNAME record pointing to: `jhaladik.github.io`
   - Or use A records pointing to GitHub's IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153

3. Enable HTTPS in GitHub Pages settings

## Troubleshooting

### Site not loading
- Wait 5-10 minutes after enabling Pages
- Check that index.html is in the repository root
- Verify branch and folder settings

### JavaScript not working
- Check browser console for errors
- Ensure all file paths are relative
- Test locally first

### 404 errors
- Ensure all files are committed and pushed
- Check file paths and capitalization
- Verify GitHub Pages is enabled

### HTTPS issues
- GitHub Pages provides free HTTPS
- Allow 24 hours for certificate provisioning
- Ensure "Enforce HTTPS" is checked in settings

## File Structure for Deployment

```
clevercost/
├── index.html          # Main entry point (required in root)
├── styles.css          # Styles
├── app.js             # Main application logic
├── lib/
│   ├── autocomplete.js # Autocomplete library
│   └── calculator.js   # Calculator library
├── CNAME              # (Optional) Custom domain
└── README.md          # Documentation
```

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Autocomplete works when typing
- [ ] Form validation works
- [ ] Calculator produces results
- [ ] Results display properly
- [ ] Responsive design works on mobile
- [ ] All buttons function correctly
- [ ] No console errors

## Performance Optimization

For production deployment, consider:

1. **Minify files:**
   ```bash
   npx terser app.js -o app.min.js
   npx clean-css-cli styles.css -o styles.min.css
   ```

2. **Enable caching:** Add `.htaccess` or configure headers

3. **Use CDN:** Consider Cloudflare for static assets

4. **Compress assets:** Enable gzip/brotli compression

## Monitoring

After deployment, monitor:
- Page load times
- Error rates (use browser console)
- User analytics (Google Analytics, Plausible, etc.)

## Updates

To update the deployed site:

1. Make changes locally
2. Test locally
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update: description"
   git push origin your-branch
   ```
4. GitHub Pages will automatically redeploy

---

**Need Help?**
- GitHub Pages Docs: https://docs.github.com/en/pages
- Issues: https://github.com/jhaladik/clevercost/issues
