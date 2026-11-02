# Krea AI

A simple AI chat website. `index.html` is the page, `api/chat.js` is the server function that talks to Claude.

## Deploy (free)
1. Create a GitHub repository and upload everything in this folder (keep the `api` folder).
2. Go to vercel.com, sign in with GitHub, click **Add New → Project**, pick the repository, and deploy.
3. In the Vercel project: **Settings → Environment Variables**, add `ANTHROPIC_API_KEY` with your key from console.anthropic.com. Then **Deployments → Redeploy**.
4. Optional: add your domain under **Settings → Domains**.

## For Google
- Replace `YOURDOMAIN.com` in `robots.txt` and `sitemap.xml` with your real address.
- Add the site in Google Search Console, submit `sitemap.xml`, and request indexing.

## Important
- NEVER put your API key in any file or commit it to GitHub.
- You pay for every message visitors send. The function limits each visitor to 30 messages per hour; lower `LIMIT` in `api/chat.js` to cap costs further, and set a spending limit in the Anthropic console.
- Optional: set a `CLAUDE_MODEL` environment variable to use a different model.
