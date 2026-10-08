// Homepage behaviour: the live Lovely clan panel and the Kahoot join box.

// --- Temu Kahoot: jump straight into a game from the homepage ---
const joinForm = document.getElementById('kahoot-join')
const codeInput = document.getElementById('kahoot-code')
joinForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const code = codeInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (code) location.href = '/kahoot/#/play/' + code
  else codeInput.focus()
})

// --- Lovely clan bot: the bot publishes data.json to /coc/lovely/ hourly ---
const $ = (id) => document.getElementById(id)
const num = (n) => Number(n || 0).toLocaleString('en-US')
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function span(seconds) {
  const m = Math.max(1, Math.round(Math.abs(seconds) / 60))
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 48) return `${h}h ${m % 60}m`
  return `${Math.round(h / 24)}d`
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function warHtml(w, now) {
  const label = w.kind === 'cwl' ? `CWL round ${w.round}` : `${w.us.size} v ${w.them.size} war`
  let status
  if (w.state === 'preparation') status = `<span class="pill prep">PREP</span> battle starts in ${span(w.start - now)}`
  else if (w.state === 'inWar') status = `<span class="pill live">LIVE</span> ends in ${span(w.end - now)}`
  else {
    const cmp = w.us.stars - w.them.stars || w.us.pct - w.them.pct
    const r = cmp > 0 ? 'win' : cmp < 0 ? 'loss' : 'tie'
    status = `<span class="pill ${r}">${r.toUpperCase()}</span> ended ${span(now - w.end)} ago`
  }
  const side = (s, cls) => `
    <div class="side ${cls}">
      ${s.badge ? `<img src="${esc(s.badge)}" alt="" width="40" height="40" loading="lazy" />` : ''}
      <div class="side-name">${esc(s.name)}</div>
      <div class="stars">${num(s.stars)}<span>★</span></div>
      <div class="pct">${Number(s.pct || 0).toFixed(1)}% · ${s.used}/${s.total} attacks</div>
    </div>`
  return `
    <div class="war-top"><span>${label}</span><span>${status}</span></div>
    <div class="war-sides">${side(w.us, 'us')}<div class="vs">vs</div>${side(w.them, 'them')}</div>`
}

async function loadClan() {
  try {
    const res = await fetch('/coc/lovely/data.json', { cache: 'no-cache' })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const d = await res.json()
    const c = d.clan
    const now = Date.now() / 1000

    if (c.badge) $('coc-badge').src = c.badge
    $('coc-sub').textContent = `Level ${c.level} · ${c.members}/50 members · ${c.war_league}`

    if (d.war && ['preparation', 'inWar', 'warEnded'].includes(d.war.state)) {
      $('coc-war').innerHTML = warHtml(d.war, now)
      $('coc-war').hidden = false
    }

    const chips = [
      [num(c.win_streak), 'war win streak'],
      [`${num(c.record[0])}–${num(c.record[2])}`, 'wars won–lost'],
    ]
    if (d.cwl?.position) chips.push([ordinal(d.cwl.position), `of ${d.cwl.clans} in CWL`])
    $('coc-chips').innerHTML = chips
      .map(([v, k]) => `<div class="chip"><b>${esc(v)}</b><span>${esc(k)}</span></div>`)
      .join('')

    $('coc-foot').textContent = `Live from the bot · updated ${span(now - d.generated_at)} ago`
  } catch (err) {
    $('coc-foot').textContent = "Couldn't load live clan data right now."
    console.warn('clan data:', err)
  }
}

loadClan()
