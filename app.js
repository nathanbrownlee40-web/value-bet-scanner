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

// Filter buttons
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
  if (odds <= CONFIG.SAFE_MAX_ODDS) return { text: '🛡️ SAFE OPTION', class: 'rec-safe' };
  return { text: '🔥 Value Bet', class: 'rec-value' };
}

// Main Scan
async function scanBets() {
  if (CONFIG.API_KEY === "YOUR_API_KEY_HERE") {
    statusText.textContent = "❌ Set API key in config.js";
    return;
  }

  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="btn-icon">⏳</span> Scanning...';
  statusText.textContent = "Fetching odds...";
  allBets = [];

  try {
    const res = await fetch(`${CONFIG.API_URL}/soccer/odds?apiKey=${CONFIG.API_KEY}&regions=${CONFIG.REGIONS}&markets=${CONFIG.MARKETS}&oddsFormat=${CONFIG.ODDS_FORMAT}`);
    
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();

    data.forEach(match => {
      const league = match.sport_title || 'Unknown League';
      const homeTeam = match.home_team;
      const awayTeam = match.away_team;
      const kickoff = new Date(match.commence_time).toLocaleString();

      match.bookmakers?.forEach(bookie => {
        bookie.markets?.forEach(market => {
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
                market: outcome.name,
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

    statusText.textContent = `✅ ${allBets.length} value bets found`;

  } catch (err) {
    console.error(err);
    statusText.textContent = "⚠️ Sample data loaded";
    loadSampleData();
  }

  updateStats();
  renderTable();
  scanBtn.disabled = false;
  scanBtn.innerHTML = '<span class="btn-icon">🔄</span><span class="btn-text">Scan for Bets</span>';
}

// Sample data
function loadSampleData() {
  allBets = [
    { league: 'EFL Championship', match: 'Leeds United vs Sheffield Utd', kickoff: '23 Aug 2026, 15:00', market: 'Leeds Win', bookmaker: 'Bet365', odds: 1.85, trueProb: '54.1%', ev: 5.4, confidence: {level:'High',class:'high',label:'🟢 High'}, recommendation: {text:'🛡️ SAFE OPTION',class:'rec-safe'}, isSafe:true, isStrong:true },
    { league: 'Premier League', match: 'Man Utd vs Liverpool', kickoff: '23 Aug 2026, 16:30', market: 'Draw', bookmaker: 'Ladbrokes', odds: 3.4, trueProb: '29.4%', ev: 3.9, confidence: {level:'Medium',class:'med',label:'🟡 Medium'}, recommendation: {text:'🔥 Value Bet',class:'rec-value'}, isSafe:false, isStrong:false },
    { league: 'La Liga', match: 'Barcelona vs Valencia', kickoff: '23 Aug 2026, 20:00', market: 'Over 2.5 Goals', bookmaker: 'William Hill', odds: 2.1, trueProb: '47.6%', ev: 9.2, confidence: {level:'High',class:'high',label:'🟢 High'}, recommendation: {text:'🛡️ SAFE OPTION',class:'rec-safe'}, isSafe:true, isStrong:true }
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

  if (filtered.length === 0) {
    betsBody.innerHTML = `<tr><td colspan="8" class="empty-state"><span class="empty-icon">🔍</span><p>No bets match this filter</p></td></tr>`;
    return;
  }

  betsBody.innerHTML = filtered.map(bet => `
    <tr class="${bet.isSafe ? 'safe-row' : ''} ${bet.isStrong ? 'strong-row' : ''}">
      <td>${bet.league}</td>
      <td><strong>${bet.match}</strong><br><small style="color:var(--text-secondary)">${bet.kickoff}</small></td>
      <td>${bet.market}</td>
      <td>${bet.bookmaker}<br><strong>${bet.odds}</strong></td>
      <td>${bet.trueProb}</td>
      <td class="${bet.ev >= 0 ? 'ev-positive' : 'ev-negative'}">${bet.ev}%</td>
      <td><span class="conf-badge ${bet.confidence.class}">${bet.confidence.label}</span></td>
      <td><span class="rec-badge ${bet.recommendation.class}">${bet.recommendation.text}</span></td>
    </tr>
  `).join('');
}
