# Cloudflare Workers Deployment Guide — VitaNova Health

## 1. Overview
VitaNova Health (`DEMO-05`) is engineered for sub-second global edge delivery via **Cloudflare Workers** with Static Assets.

- **Primary Custom Domain**: `https://demo5.scalenovasys.com`
- **Fallback URL**: `https://scalenova-demo-05-vitanova-health.<account>.workers.dev`
- **Origin Architecture**: Serverless static asset edge cache + edge security headers

## 2. Connecting from GitHub to Cloudflare Workers
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages > Create Application > Pages / Workers**.
3. Select **Connect to Git** and choose the repository:
   `ScaleNova-Pvt-Ltd/scalenova-demo-05-vitanova-health`
4. Configure the Build & Deployment Settings:
   - **Framework Preset**: None / Static HTML
   - **Build Command**: `npm run build` (or leave empty)
   - **Output Directory**: `./`
5. In **Environment Variables**, add:
   - `APPS_SCRIPT_WEBHOOK_URL`: Your deployed Google Apps Script Web App URL.
   - `ENVIRONMENT`: `production`
6. Click **Save and Deploy**.

## 3. Custom Domain Setup
1. In Cloudflare Workers settings, select **Triggers > Custom Domains**.
2. Add custom domain: `demo5.scalenovasys.com`.
3. Cloudflare will automatically provision SSL/TLS certificates and configure DNS CNAME/A records.

## 4. Local Deployment via Wrangler CLI
```bash
npm install -g wrangler
wrangler login
wrangler deploy
```
