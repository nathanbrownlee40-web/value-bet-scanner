// ==============================================
// 🔑 YOUR SETTINGS — EDIT API KEY BEFORE UPLOAD
// ==============================================
const CONFIG = {
  // 👇 PUT YOUR REAL API KEY FROM the-odds-api.com HERE
  API_KEY: "5942b5937bf0ad38f48ce9f3904797e0",

  // API Settings — using OFFICIAL market names
  API_URL: "https://api.the-odds-api.com/v4/sports",
  REGIONS: "uk,eu",
  // ✅ ONLY official market names — no typos, no extras
  MARKETS: "h2h,spreads,totals,btts",
  ODDS_FORMAT: "decimal",

  // 🔒 ONLY UPCOMING MATCHES
  ONLY_UPCOMING: true,

  // Value Bet Rules
  MIN_EV_PERCENT: 2.0,
  SAFE_MAX_ODDS: 3.0,
  HIGH_CONFIDENCE_EV: 5.0,
  MED_CONFIDENCE_EV: 2.0,

  SPORTS: ["soccer"]
};
