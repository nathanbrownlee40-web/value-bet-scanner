// ==============================================
// 🔑 YOUR SETTINGS — EDIT API KEY BEFORE UPLOAD
// ==============================================
const CONFIG = {
  // 👇 PASTE YOUR API KEY HERE
  API_KEY: "YOUR_API_KEY_HERE",

  // API Settings
  API_URL: "https://api.the-odds-api.com/v4/sports",
  REGIONS: "uk,eu",
  MARKETS: "h2h,draw_no_both,over_under,btts,corners,shots_on_target",
  ODDS_FORMAT: "decimal",

  // 🔒 ONLY UPCOMING MATCHES — filter out past games
  ONLY_UPCOMING: true,

  // Value Bet Rules
  MIN_EV_PERCENT: 2.0,
  SAFE_MAX_ODDS: 3.0,
  HIGH_CONFIDENCE_EV: 5.0,
  MED_CONFIDENCE_EV: 2.0,

  // Sports to scan
  SPORTS: ["soccer"]
};
