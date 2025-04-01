# 📊 Crypto Research Agent

An AI-powered dashboard for cryptocurrency research. Enter any token symbol (e.g. `BTC`, `ETH`, `BNB`) or name to instantly generate a comprehensive report including price analysis, market cap, trading volume, sentiment, and an AI-generated summary.

![screenshot](./preview.png) <!-- Optional: Add a UI screenshot here -->

---

## 🚀 Features

- ✅ Real-time token data via backend API
- 📈 Price, market cap, 24h change, volume, and circulating supply
- 🧠 AI-generated research summaries
- 🟢 Token sentiment analysis (bullish, bearish, neutral)
- 📊 Interactive charts using ApexCharts
- 🌙 Light & Dark mode toggle
- 🔍 Compare multiple tokens side-by-side
- 🧪 Schema validation with Zod
- ⚡ Fully responsive and mobile-ready UI

---

## 🔧 Tech Stack

- **Frontend:** Next.js 14, TypeScript, TailwindCSS
- **Charts:** ApexCharts (via `react-apexcharts`)
- **Markdown:** `react-markdown`
- **Validation:** Zod
- **UI Helpers:** Toasts, Skeleton loaders, localStorage
- **Backend API:** Custom `/api/research` endpoint (serverless function or backend of your choice)

---

## 📦 Getting Started

```bash
git clone https://github.com/pope001/crypto-research-agent.git
cd crypto-research-agent
npm install
npm run dev

Then open http://localhost:3000 in your browser.

Make sure your /api/research endpoint is configured to return token data in the correct format.


🧑‍💻 Author
Built by Mayowa Adeoni
Twitter: @_maycode

```
