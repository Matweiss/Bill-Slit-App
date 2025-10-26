# Deployment Guide

This guide covers how to deploy the AI Bill Splitter app to various platforms.

## Prerequisites

Before deploying, you'll need:
- A Google Gemini API key (get one at https://aistudio.google.com/app/apikey)
- A GitHub account (for most deployment platforms)
- Your code pushed to a GitHub repository

## Quick Deploy Options

### Option 1: Deploy to Vercel (Recommended)

Vercel is optimized for React/Vite apps and offers the easiest deployment experience.

#### Steps:

1. **Install Vercel CLI** (optional, for command-line deployment):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Web Interface** (easier):
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variable:
     - Name: `GEMINI_API_KEY`
     - Value: Your Gemini API key
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts and add your `GEMINI_API_KEY` when asked.

4. **Set Environment Variable** (if not done during setup):
   - Go to your project settings on Vercel
   - Navigate to "Environment Variables"
   - Add `GEMINI_API_KEY` with your API key value
   - Redeploy for changes to take effect

Your app will be live at: `https://your-project-name.vercel.app`

---

### Option 2: Deploy to Netlify

Netlify is another excellent option with great free tier.

#### Steps:

1. **Deploy via Web Interface**:
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

2. **Set Environment Variable**:
   - Go to Site settings → Environment variables
   - Add variable:
     - Key: `GEMINI_API_KEY`
     - Value: Your Gemini API key
   - Click "Save"
   - Trigger a new deploy

3. **Deploy via CLI** (alternative):
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

Your app will be live at: `https://your-site-name.netlify.app`

---

### Option 3: Deploy to GitHub Pages

GitHub Pages is free but requires some additional configuration for SPAs.

#### Steps:

1. **Install gh-pages package**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   Add these scripts:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/Bill-Slit-App"
   }
   ```

3. **Update vite.config.ts**:
   Add base path:
   ```typescript
   export default defineConfig({
     base: '/Bill-Slit-App/',
     // ... rest of config
   });
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Set Environment Variable**:
   - Note: GitHub Pages doesn't support server-side environment variables
   - You'll need to use GitHub Secrets and Actions for build-time injection
   - See: https://docs.github.com/en/actions/security-guides/encrypted-secrets

Your app will be at: `https://yourusername.github.io/Bill-Slit-App`

---

### Option 4: Deploy to Render

Render offers free static site hosting with environment variables.

#### Steps:

1. Go to https://render.com
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Add environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your API key
6. Click "Create Static Site"

Your app will be live at: `https://your-app-name.onrender.com`

---

## Environment Variables

All deployment platforms need this environment variable:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

### Getting Your Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the generated key
4. Add it to your deployment platform's environment variables

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] App loads without errors
- [ ] Receipt upload works
- [ ] AI parsing functionality works
- [ ] Chat interface responds
- [ ] Local storage persists bills across refreshes
- [ ] All features work as expected

---

## Troubleshooting

### Build Fails

- Check that `GEMINI_API_KEY` is set in environment variables
- Ensure Node.js version is 18 or higher
- Clear cache and rebuild: `npm clean-install && npm run build`

### API Key Not Working

- Verify the API key is correctly copied (no extra spaces)
- Ensure the key is active at https://aistudio.google.com/app/apikey
- Check API quota/usage limits

### App Loads But Features Don't Work

- Open browser console (F12) to check for errors
- Verify environment variables are set correctly
- Ensure you've triggered a redeploy after adding environment variables

### Blank Page After Deployment

- Check build logs for errors
- Verify the output directory is set to `dist`
- Ensure base path is configured correctly (especially for GitHub Pages)

---

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Site Settings → Domain management
2. Add custom domain
3. Follow DNS configuration steps

---

## CI/CD (Continuous Deployment)

Both Vercel and Netlify automatically deploy when you push to your main branch.

To deploy from a different branch:
- **Vercel**: Project Settings → Git → Production Branch
- **Netlify**: Site Settings → Build & deploy → Deploy contexts

---

## Cost Considerations

- **Vercel Free Tier**: 100GB bandwidth/month, unlimited personal projects
- **Netlify Free Tier**: 100GB bandwidth/month, 300 build minutes/month
- **GitHub Pages**: Free, unlimited bandwidth for public repos
- **Render Free Tier**: 100GB bandwidth/month

The main cost will be Google Gemini API usage:
- Check pricing at: https://ai.google.dev/pricing
- Monitor usage at: https://aistudio.google.com/app/apikey

---

## Security Notes

- Never commit `.env` files to git (already in `.gitignore`)
- Use environment variables for all sensitive data
- API key is exposed in client-side code - consider rate limiting or backend proxy for production
- All user data is stored locally in browser (no backend database)

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- Open an issue on GitHub if you encounter problems
