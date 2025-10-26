<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Bill Splitter

A smart bill-splitting app powered by Google Gemini AI. Upload receipts, chat naturally to split items, and settle up in seconds.

View your app in AI Studio: https://ai.studio/apps/drive/19cH5v1n9t53xwPgiE4ipTlHQwMaM5w2z

## Features

- Upload receipt images and parse them automatically with AI
- Split bills using natural language chat
- Manage multiple bills and diners
- Track settlements and tips
- Export and share summaries
- No login required - all data stored locally in your browser

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd Bill-Slit-App
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   Get your API key from: https://aistudio.google.com/app/apikey

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## Build for Production

```bash
npm run build
npm run preview
```

## Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for Vercel, Netlify, and other platforms.

## Tech Stack

- React 19
- TypeScript
- Vite
- Google Gemini AI
- Tailwind CSS (via inline styles)

## License

MIT
