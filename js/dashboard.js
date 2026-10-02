/* Dashboard logic (O1 aggregation + O2 mock-live tracking). */
if (!requireAuth()) throw new Error('Not signed in');

const MAX_POINTS = 24;
const state = {
  data: PLATFORMS.map(p => ({ ...p, startFollowers: p.followers, startEr: p.er, sessionDelta: 0, lastDelta: 0 })),
  labels: [],
  erHist: {},
  selected: new Set(),
  running: true,
  interval: 3000,
  timer: null,
  sortKey: 'followers',
  sortDir: -1,
  search: ''
};

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fmt = n => new Intl.NumberFormat('en-US').format(Math.round(n));
const compact = n => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const clock = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const sign = n => (n > 0 ? '+' : n < 0 ? '' : '');

/* ---------- Seed history so the chart is not empty on load ---------- */
(function seed() {
  const now = Date.now();
  for (let i = MAX_POINTS - 1; i >= 0; i--) state.labels.push(clock(new Date(now - i * 3000)));
  state.data.forEach(p => {
    const series = [p.er];
    for (let i = 1; i < MAX_POINTS; i++) series.unshift(clamp(series[0] + rand(-0.2, 0.2), 0.4, 12));
    state.erHist[p.id] = series;
  });
  topN(5);
})();

function topN(n) {
  state.selected = new Set([...state.data].sort((a, b) => b.followers - a.followers).slice(0, n).map(p => p.id));
}

/* ---------- Charts ---------- */
Chart.defaults.font.family = 'Figtree, system-ui, sans-serif';
const CHART_THEME = {
  light: { text: '#14213D', grid: 'rgba(20,33,61,.08)', panel: '#FFFFFF' },
  dark:  { text: '#E2E8F4', grid: 'rgba(226,232,244,.12)', panel: '#141D32' }
};
const ct = () => CHART_THEME[getTheme()];
const pc = p => (getTheme() === 'dark' && p.colorDark) ? p.colorDark : p.color;
Chart.defaults.color = ct().text;

const erChart = new Chart(document.getElementById('erChart'), {
  type: 'line',
  data: { labels: state.labels, datasets: [] },
  options: {
    responsive: true, maintainAspectRatio: false, animation: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
               tooltip: { callbacks: { label: c => c.dataset.label + ': ' + c.parsed.y.toFixed(2) + '%' } } },
    scales: {
      y: { title: { display: true, text: 'Engagement rate (%)' }, ticks: {}, grid: { color: ct().grid } },
      x: { ticks: { maxTicksLimit: 6 }, grid: { display: false } }
    }
  }
});

const barChart = new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: { labels: state.data.map(p => p.name), datasets: [{ data: state.data.map(p => p.followers), backgroundColor: state.data.map(pc), borderRadius: 4 }] },
  options: {
    responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmt(c.parsed.y) + ' followers' } } },
    scales: { y: { ticks: { callback: v => compact(v) }, grid: { color: ct().grid } }, x: { grid: { display: false }, ticks: { maxRotation: 60, minRotation: 40 } } }
  }
});

const pieChart = new Chart(document.getElementById('pieChart'), {
  type: 'doughnut',
  data: { labels: state.data.map(p => p.name), datasets: [{ data: state.data.map(p => p.followers), backgroundColor: state.data.map(pc), borderWidth: 2, borderColor: ct().panel }] },
  options: {
    responsive: true, maintainAspectRatio: false, cutout: '62%', animation: { duration: 400 },
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
               tooltip: { callbacks: { label: c => c.label + ': ' + fmt(c.parsed) } } }
  }
});

function syncLineDatasets() {
  erChart.data.datasets = state.data.filter(p => state.selected.has(p.id)).map(p => ({
    label: p.name, data: state.erHist[p.id], borderColor: pc(p), backgroundColor: pc(p),
    borderWidth: 2, tension: 0.35, pointRadius: 0, pointHoverRadius: 4
  }));
  erChart.update('none');
}

/* ---------- Theme switching ---------- */
function applyChartTheme() {
  const t = ct();
  Chart.defaults.color = t.text;
  erChart.options.scales.x.ticks.color = t.text;
  erChart.options.scales.y.ticks.color = t.text;
  erChart.options.scales.y.title.color = t.text;
  erChart.options.scales.y.grid.color = t.grid;
  erChart.options.plugins.legend.labels.color = t.text;
  barChart.options.scales.x.ticks.color = t.text;
  barChart.options.scales.y.ticks.color = t.text;
  barChart.options.scales.y.grid.color = t.grid;
  barChart.data.datasets[0].backgroundColor = state.data.map(pc);
  pieChart.options.plugins.legend.labels.color = t.text;
  pieChart.data.datasets[0].backgroundColor = state.data.map(pc);
  pieChart.data.datasets[0].borderColor = t.panel;
  syncLineDatasets();
  barChart.update('none');
  pieChart.update('none');
}
document.addEventListener('themechange', () => { applyChartTheme(); renderChips(); renderTable(); });

/* ---------- Platform chips ---------- */
function renderChips() {
  const box = document.getElementById('chips');
  box.innerHTML = state.data.map(p => {
    const on = state.selected.has(p.id);
    return `<button type="button" data-id="${p.id}" aria-pressed="${on}" class="chip ${on ? 'chip-on' : ''}">
      <span class="chip-dot" style="background:${pc(p)}"></span>${p.name}</button>`;
  }).join('');
}
document.getElementById('chips').addEventListener('click', e => {
  const b = e.target.closest('button[data-id]');
  if (!b) return;
  const id = b.dataset.id;
  state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
  renderChips(); syncLineDatasets();
});
document.getElementById('selTop').onclick = () => { topN(5); renderChips(); syncLineDatasets(); };
document.getElementById('selAll').onclick = () => { state.selected = new Set(state.data.map(p => p.id)); renderChips(); syncLineDatasets(); };
document.getElementById('selNone').onclick = () => { state.selected.clear(); renderChips(); syncLineDatasets(); };

/* ---------- KPIs ---------- */
function deltaHtml(v, suffix, digits) {
  const cls = v > 0 ? 'text-teal' : v < 0 ? 'text-coral' : 'text-ink/60';
  const arrow = v > 0 ? '▲' : v < 0 ? '▼' : '•';
  return `<span class="${cls} font-semibold">${arrow} ${sign(v)}${digits ? v.toFixed(digits) : fmt(v)}${suffix}</span> <span class="text-ink/60">since you opened this page</span>`;
}

function renderKpis() {
  const d = state.data;
  const total = d.reduce((s, p) => s + p.followers, 0);
  const startTotal = d.reduce((s, p) => s + p.startFollowers, 0);
  const avg = d.reduce((s, p) => s + p.er, 0) / d.length;
  const startAvg = d.reduce((s, p) => s + p.startEr, 0) / d.length;
  const best = [...d].sort((a, b) => b.er - a.er)[0];
  const fast = [...d].sort((a, b) => (b.sessionDelta / b.startFollowers) - (a.sessionDelta / a.startFollowers))[0];

  document.getElementById('kpiFollowers').textContent = fmt(total);
  document.getElementById('kpiFollowersDelta').innerHTML = deltaHtml(total - startTotal, '', 0);
  document.getElementById('kpiEr').textContent = avg.toFixed(2) + '%';
  document.getElementById('kpiErDelta').innerHTML = deltaHtml(avg - startAvg, ' pts', 2);
  document.getElementById('kpiBest').textContent = best.name;
  document.getElementById('kpiBestSub').textContent = best.er.toFixed(2) + '% engagement';
  document.getElementById('kpiFast').textContent = fast.name;
  document.getElementById('kpiFastSub').textContent = '+' + ((fast.sessionDelta / fast.startFollowers) * 100).toFixed(2) + '% followers';
}

/* ---------- Table ---------- */
function renderTable() {
  const q = state.search.trim().toLowerCase();
  const rows = state.data
    .filter(p => p.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const av = a[state.sortKey], bv = b[state.sortKey];
      return typeof av === 'string' ? av.localeCompare(bv) * -state.sortDir : (av - bv) * state.sortDir;
    });
  document.getElementById('tbody').innerHTML = rows.map(p => {
    const up = p.sessionDelta >= 0;
    return `<tr class="border-b border-ink/5">
      <td class="py-3 pr-3"><span class="chip-dot" style="background:${pc(p)}"></span>${p.name}</td>
      <td class="py-3 px-3 text-right tabular-nums">${fmt(p.followers)}</td>
      <td class="py-3 px-3 text-right tabular-nums ${up ? 'text-teal' : 'text-coral'}">${up ? '▲' : '▼'} ${fmt(Math.abs(p.sessionDelta))}</td>
      <td class="py-3 pl-3 text-right tabular-nums font-semibold">${p.er.toFixed(2)}%</td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" class="py-6 text-center text-ink/60">No platform matches your search.</td></tr>';
}
document.querySelectorAll('.sort-btn').forEach(b => b.addEventListener('click', () => {
  const k = b.dataset.sort;
  state.sortDir = state.sortKey === k ? -state.sortDir : -1;
  state.sortKey = k;
  renderTable();
}));
document.getElementById('search').addEventListener('input', e => { state.search = e.target.value; renderTable(); });

/* ---------- Feed ---------- */
function pushFeed(text, good) {
  const ul = document.getElementById('feed');
  const li = document.createElement('li');
  li.className = 'flex gap-2 items-start';
  li.innerHTML = `<span class="${good ? 'text-teal' : 'text-coral'} font-bold">${good ? '▲' : '▼'}</span>
    <span>${text}<br><span class="text-ink/50 text-xs">${clock(new Date())}</span></span>`;
  ul.prepend(li);
  while (ul.children.length > 8) ul.lastChild.remove();
}

/* ---------- Mock-live tick ---------- */
function tick() {
  state.labels.push(clock(new Date()));
  if (state.labels.length > MAX_POINTS) state.labels.shift();

  let biggest = null;
  state.data.forEach(p => {
    const delta = Math.round(p.followers * rand(-0.0005, 0.0018));
    p.followers += delta; p.sessionDelta += delta; p.lastDelta = delta;
    p.er = clamp(p.er + rand(-0.18, 0.18), 0.4, 12);
    const h = state.erHist[p.id];
    h.push(p.er); if (h.length > MAX_POINTS) h.shift();
    if (!biggest || Math.abs(delta) > Math.abs(biggest.lastDelta)) biggest = p;
  });

  if (biggest) {
    const g = biggest.lastDelta >= 0;
    pushFeed(`${biggest.name} ${g ? 'gained' : 'lost'} ${fmt(Math.abs(biggest.lastDelta))} followers`, g);
  }

  erChart.update('none');
  barChart.data.datasets[0].data = state.data.map(p => p.followers); barChart.update();
  pieChart.data.datasets[0].data = state.data.map(p => p.followers); pieChart.update();
  renderKpis(); renderTable();
  document.getElementById('lastUpdate').textContent = clock(new Date());
}

function startTimer() { clearInterval(state.timer); state.timer = setInterval(tick, state.interval); }

/* ---------- Header controls ---------- */
const liveBtn = document.getElementById('liveBtn');
liveBtn.addEventListener('click', () => {
  state.running = !state.running;
  liveBtn.setAttribute('aria-pressed', state.running);
  document.getElementById('liveText').textContent = state.running ? 'Live' : 'Paused';
  document.getElementById('liveDot').classList.toggle('paused', !state.running);
  state.running ? startTimer() : clearInterval(state.timer);
});
document.getElementById('intervalSel').addEventListener('change', e => {
  state.interval = Number(e.target.value);
  if (state.running) startTimer();
});
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('exportBtn').addEventListener('click', () => {
  const lines = ['platform,followers,session_change,engagement_rate_pct'];
  state.data.forEach(p => lines.push([p.name, p.followers, p.sessionDelta, p.er.toFixed(2)].join(',')));
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'platform-metrics.csv' });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

/* ---------- Boot ---------- */
applyChartTheme(); renderChips(); renderKpis(); renderTable();
document.getElementById('lastUpdate').textContent = clock(new Date());
pushFeed('Dashboard connected to 12 simulated platforms', true);
startTimer();
