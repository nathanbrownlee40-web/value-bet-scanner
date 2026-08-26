# 📊 Value Bet Scanner — FIXED VERSION
✅ PWA installable • ✅ Only upcoming matches • ✅ Correct leagues • ✅ Real API data

## What Was Fixed
- ✅ **PWA Install** — manifest corrected, shows "Install App" in browser menu
- ✅ **Past matches filtered out** — only upcoming games show up
- ✅ **Leagues updated** — Leeds in Premier League (2026/27)
- ✅ **Better error messages** — tells you if API key wrong / limit hit
- ✅ **Sample data updated** — no more outdated leagues

## How To Install As PWA
- Open site in Chrome / Edge / Brave on phone or desktop
- Tap 3 dots → "Install App" OR an install button appears in address bar
- Adds to home screen like a native app

## Setup
1. Get API key → https://the-odds-api.com/ (free tier works)
2. Open `config.js` → replace `YOUR_API_KEY_HERE`
3. Upload all 6 files → GitHub → Netlify

## Why You Saw Wrong Data Before
- **Sample data was outdated** — Leeds in EFL was old example data
- **API returns ALL matches** by default — app now filters out past games automatically
- **Free tier works fine** — just limited requests per month
