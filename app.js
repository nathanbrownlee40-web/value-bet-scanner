let allBets = [];
let currentFilter = 'all';

// DOM
const scanBtn = document.getElementById('scanBtn');
const betsBody = document.getElementById('betsBody');
const statusText = document.getElementById('statusText');
const totalBetsEl = document.getElementById('totalBets');
const valueBetsEl = document.getElementById('valueBets');
const safeBetsEl = document.getElementById('safeBets');
const filterBtns = document.querySelectorAll('.filter-btn');

// Market type detection
function getMarketType(marketName) {
  const name = marketName.toLowerCase();
  if (name.includes('corner')) return { type: 'corners', icon: '📐', class: 'tag-corners' };
  if (name.includes('shot') || name.includes('target')) return { type: 'shots', icon: '🎯', class: 'tag-shots' };
  if (name.includes('goal') || name.includes('over') || name.includes('under')) return { type: 'goals', icon: '⚽', class: 'tag-goals' };
  if (name.includes('btts') || name.includes('both')) return { type: 'btts', icon: '✅', class: 'tag-btts' };
  return { type: '1x2', icon: '🏆', class: 'tag-1x2' };
}

// Filters
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTable();
  });
});

scanBtn.addEventListener('click', scanBets);

// EV Calculation
function calculateEV(bookmakerOdds, trueProbability) {
  return ((trueProbability * bookmakerOdds) - 1) * 100;
}

// Confidence
function getConfidence(evPercent) {
  if (evPercent >= CONFIG.HIGH_CONFIDENCE_EV) return { level: 'High', class: 'high', label: '🟢 High' };
  if (evPercent >= CONFIG.MED_CONFIDENCE_EV) return { level: 'Medium', class: 'med', label: '🟡 Medium' };
  return { level: 'Low', class: 'low', label: '🔴 Low' };
}

// Recommendation
function getRecommendation(ev, odds) {
  if (ev < CONFIG.MIN_EV_PERCENT) return { text: '❌ Skip', class: 'rec-skip' };
  if (odds <= CONFIG.SAFE_MAX_ODDS) return { text: '🛡️ Safe', class: 'rec-safe' };
  return { text: '🔥 Value', class: 'rec-value' };
}

// Main Scan — FILTERS OUT PAST MATCHES
async function scanBets() {
  if (CONFIG.API_KEY === "YOUR_API_KEY_HERE") {
    statusText.textContent = "❌ Set API key in config.js first!";
    statusText.style.color = "#ef4444";
    return;
  }

  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="btn-icon">⏳</span> Scanning...';
  statusText.textContent = "Fetching upcoming matches...";
  statusText.style.color = "";
  allBets = [];

  const now = new Date();

  try {
    const res = await fetch(`${CONFIG.API_URL}/soccer/odds?apiKey=${CONFIG.API_KEY}&regions=${CONFIG.REGIONS}&markets=${CONFIG.MARKETS}&oddsFormat=${CONFIG.ODDS_FORMAT}`);

    if (res.status === 401) throw new Error("Invalid API key — check it's correct");
    if (res.status === 429) throw new Error("Too many requests — free tier limit reached, wait a bit");
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (!data || data.length === 0) {
      throw new Error("API returned no matches — try again later");
    }

    let skippedPast = 0;

    data.forEach(match => {
      // 🔒 SKIP MATCHES THAT HAVE ALREADY STARTED
      const kickoffTime = new Date(match.commence_time);
      if (CONFIG.ONLY_UPCOMING && kickoffTime < now) {
        skippedPast++;
        return;
      }

      const league = match.sport_title || 'Unknown League';
      const homeTeam = match.home_team;
      const awayTeam = match.away_team;
      const kickoff = kickoffTime.toLocaleString();

      match.bookmakers?.forEach(bookie => {
        bookie.markets?.forEach(market => {
          const marketInfo = getMarketType(market.key);
          market.outcomes?.forEach(outcome => {
            const odds = outcome.price;
            const trueProb = 1 / odds;
            const ev = parseFloat(calculateEV(odds, trueProb).toFixed(2));

            if (ev >= CONFIG.MIN_EV_PERCENT) {
              const conf = getConfidence(ev);
              const rec = getRecommendation(ev, odds);
              const isSafe = odds <= CONFIG.SAFE_MAX_ODDS;
              const isStrong = ev >= CONFIG.HIGH_CONFIDENCE_EV;

              allBets.push({
                league,
                match: `${homeTeam} vs ${awayTeam}`,
                kickoff,
                marketType: marketInfo,
                selection: outcome.name,
                bookmaker: bookie.title,
                odds,
                trueProb: (trueProb * 100).toFixed(1) + '%',
                ev,
                confidence: conf,
                recommendation: rec,
                isSafe,
                isStrong
              });
            }
          });
        });
      });
    });

    statusText.textContent = `✅ ${allBets.length} bets found — skipped ${skippedPast} past matches`;
    statusText.style.color = "#10b981";

  } catch (err) {
    console.error("API Error:", err);
    statusText.textContent = `⚠️ ${err.message} — using sample data`;
    statusText.style.color = "#f59e0b";
    loadSampleData();
  }

  updateStats();
  renderTable();
  scanBtn.disabled = false;
  scanBtn.innerHTML = '<span class="btn-icon">🔄</span><span class="btn-text">Scan Upcoming Games</span>';
}

// ✅ UPDATED SAMPLE DATA — 2026/27 CORRECT LEAGUES
function loadSampleData() {
  allBets = [
    { league: 'Premier League', match: 'Leeds United vs Everton', kickoff: '23 Aug 2026, 15:00', marketType: {type:'goals',icon:'⚽',class:'tag-goals'}, selection: 'Over 2.5 Goals', bookmaker: 'Bet365', odds: 1.85, trueProb: '54.1%', ev: 5.4, confidence: {level:'High',class:'high',label:'🟢 High'}, recommendation: {text:'🛡️ Safe',class:'rec-safe'}, isSafe:true, isStrong:true },
    { league: 'Premier League', match: 'Man Utd vs Liverpool', kickoff: '23 Aug 2026, 16:30', marketType: {type:'corners',icon:'📐',class:'tag-corners'}, selection: 'Over 9.5 Corners', bookmaker: 'Ladbrokes', odds: 3.4, trueProb: '29.4%', ev: 3.9, confidence: {level:'Medium',class:'med',label:'🟡 Medium'}, recommendation: {text:'🔥 Value',class:'rec-value'}, isSafe:false, isStrong:false },
    { league: 'La Liga', match: 'Barcelona vs Valencia', kickoff: '23 Aug 2026, 20:00', marketType: {type:'shots',icon:'🎯',class:'tag-shots'}, selection: 'Over 4.5 Shots on Target', bookmaker: 'William Hill', odds: 2.1, trueProb: '47.6%', ev: 9.2, confidence: {level:'High',class:'high',label:'🟢 High'}, recommendation: {text:'🛡️ Safe',class:'rec-safe'}, isSafe:true, isStrong:true },
    { league: 'Bundesliga', match: 'Bayern Munich vs RB Leipzig', kickoff: '23 Aug 2026, 18:30', marketType: {type:'btts',icon:'✅',class:'tag-btts'}, selection: 'BTTS — Yes', bookmaker: 'Betfair', odds: 1.90, trueProb: '52.6%', ev: 4.8, confidence: {level:'Medium',class:'med',label:'🟡 Medium'}, recommendation: {text:'🛡️ Safe',class:'rec-safe'}, isSafe:true, isStrong:false },
    { league: 'Serie A', match: 'AC Milan vs Inter Milan', kickoff: '23 Aug 2026, 19:45', marketType: {type:'1x2',icon:'🏆',class:'tag-1x2'}, selection: 'Draw', bookmaker: 'Paddy Power', odds: 3.25, trueProb: '30.8%', ev: 5.2, confidence: {level:'High',class:'high',label:'🟢 High'}, recommendation: {text:'🔥 Value',class:'rec-value'}, isSafe:false, isStrong:true }
  ];
}

function updateStats() {
  totalBetsEl.textContent = allBets.length;
  valueBetsEl.textContent = allBets.filter(b => b.ev >= CONFIG.MIN_EV_PERCENT).length;
  safeBetsEl.textContent = allBets.filter(b => b.isSafe).length;
}

function renderTable() {
  let filtered = allBets;
  if (currentFilter === 'safe') filtered = allBets.filter(b => b.isSafe);
  if (currentFilter === 'strong') filtered = allBets.filter(b => b.isStrong);
  if (currentFilter === 'goals') filtered = allBets.filter(b => b.marketType.type === 'goals');
  if (currentFilter === 'corners') filtered = allBets.filter(b => b.marketType.type === 'corners');
  if (currentFilter === 'shots') filtered = allBets.filter(b => b.marketType.type === 'shots');

  if (filtered.length === 0) {
    betsBody.innerHTML = `<tr><td colspan="9" class="empty-state"><span class="empty-icon">🔍</span><p>No bets match this filter</p></td></tr>`;
    return;
  }

  betsBody.innerHTML = filtered.map(bet => `
    <tr class="${bet.isSafe ? 'safe-row' : ''} ${bet.isStrong ? 'strong-row' : ''}">
      <td>${bet.league}</td>
      <td><strong>${bet.match}</strong><br><small style="color:var(--text-secondary)">${bet.kickoff}</small></td>
      <td><span class="market-tag ${bet.marketType.class}">${bet.marketType.icon} ${bet.marketType.type}</span></td>
      <td>${bet.selection}</td>
      <td>${bet.bookmaker}<br><strong>${bet.odds}</strong></td>
      <td>${bet.trueProb}</td>
      <td class="${bet.ev >= 0 ? 'ev-positive' : 'ev-negative'}">${bet.ev}%</td>
      <td><span class="conf-badge ${bet.confidence.class}">${bet.confidence.label}</span></td>
      <td><span class="rec-badge ${bet.recommendation.class}">${bet.recommendation.text}</span></td>
    </tr>
  `).join('');
}
