# turtdle.github.io

My website, a static site built with Vite and deployed to GitHub Pages.

| Path | What | Source |
| --- | --- | --- |
| [`/`](https://turtdle.github.io/) | Homepage: project cards, including a live Lovely clan war panel and a Kahoot join box | [`index.html`](index.html), [`home/`](home/) |
| [`/kahoot/`](https://turtdle.github.io/kahoot/) | Temu Kahoot (see below) | [`kahoot/`](kahoot/), [`public/kahoot/`](public/kahoot/) |
| [`/coc/lovely/`](https://turtdle.github.io/coc/lovely/) | Lovely clan stats site | separate repo [Turtdle/coc](https://github.com/Turtdle/coc), published hourly by the clan bot |
| [`/workoutscribe/`](https://turtdle.github.io/workoutscribe/) | Workout Scribe app page | separate repo [Turtdle/workoutscribe](https://github.com/Turtdle/workoutscribe) |
| [`/legacy-website/`](https://turtdle.github.io/legacy-website/) | The old personal site | separate repo [Turtdle/legacy-website](https://github.com/Turtdle/legacy-website) |

The homepage reads `/coc/lovely/data.json` (the clan bot's export) for its
live war panel, and falls back to static text if that fetch fails.

### The clan site lives in its own repo

The clan bot publishes `/coc/lovely/` to [Turtdle/coc](https://github.com/Turtdle/coc);
GitHub Pages serves a repo named `coc` at `/coc/`, ahead of this site. That way the
bot's deploy key can only write to that repo, not to this one. So:

- Don't put anything under `/coc/` in this repo; it would be shadowed.
- Don't add a service worker that could swallow `/coc/lovely/`.

## Temu Kahoot — a tiny Kahoot clone

A Kahoot-style quiz game for game night. No accounts and no game server: the
host's browser **is** the game server, and phones connect to it over WebRTC
(via [PeerJS](https://peerjs.com/)).

Live at **https://turtdle.github.io/kahoot/**. (It used to be at the site root;
old `turtdle.github.io/#/host` and `#/play/CODE` links still redirect.)

### How a game works

1. Open **Host a game** (`/kahoot/#/host`) and either upload a quiz CSV or
   unlock the saved quizzes with the host password. **Keep this tab open:
   the game runs in it.** Closing or refreshing it asks first.
2. Players open `/kahoot/`, scan the QR code, or use the copied link, then
   enter the 4-letter code and a name.
3. Hit **Start game**. Everyone sees the question and 2–4 answers. There's no
   time limit, but faster correct answers earn more points (1000 for instant,
   halving every 30 s, floor of 100; wrong = 0). **Show answer now** ends a
   question early.
4. The answer, answer counts and leaderboard follow each question, then a
   podium at the end. **Play again** restarts the same quiz with the same
   players; **New quiz** goes back to the picker.

If a player refreshes or their phone locks, they're put straight back in with
their score (their tab keeps a private rejoin token). In the lobby the host can
remove players (×) and **lock the lobby** so no one new can join.

### Quiz CSV format

The host screen shows this too, and [`public/kahoot/template.csv`](public/kahoot/template.csv)
is a ready-made example. One question per row, with these column names first:

```csv
question,answer1,answer2,answer3,answer4,correct
What do pandas mainly eat?,Bamboo,Fish,Honey,Grass,1
Is a tomato a fruit?,Yes,No,,,1
"Which city is the capital of France?","Paris, France",Lyon,Marseille,,1
```

- 2 to 4 answers: `answer3` and `answer4` can be empty. Old three-answer files
  (without an `answer4` column) still work.
- `correct` is the number of the right answer.
- Wrap text that contains a comma in double quotes; for a quote inside, double
  it: `"He said ""hi"""`. (Google Sheets / Excel "Download as CSV" does this.)
- Limits: 256 KB, 200 questions, 280-character questions, 200-character
  answers. Bad rows are skipped and listed on the host screen.

An uploaded quiz never leaves the host's device, except each question as it's
played (the right answer is only sent once the question closes).

### Saved quizzes (encrypted presets)

Sam's own quiz sets are published only as
[`public/kahoot/presets.enc.json`](public/kahoot/presets.enc.json): AES-256-GCM
with a key derived from the host password (PBKDF2-SHA256, 600,000 rounds). The
password is the only way in; it isn't stored anywhere in the repo, and a wrong
one simply fails to decrypt. The plain CSVs live in `kahoot/presets/`, which
is git-ignored.

```
npm run presets:unlock   # public/kahoot/presets.enc.json -> kahoot/presets/*.csv + presets.json
# edit kahoot/presets/*.csv; presets.json lists them in menu order
npm run presets:lock     # -> public/kahoot/presets.enc.json, then commit and push
```

Both ask for the password (or read `KAHOOT_PRESET_PASSWORD`, or a git-ignored
`kahoot/presets/.password`). `lock` insists on at least 12 characters, because
the encrypted file is public and a short password could be guessed offline.
**Changing the password** = `unlock` with the old one, `lock` with the new one.

(Before October 2026 the presets were plain files and the password was in the
source, so older commits in this public repo still contain them.)

### Connections, and the TURN relay

PeerJS's free cloud server (`0.peerjs.com`) matches players to the host by
code; after that, traffic goes device to device. When a network blocks that
(mobile data, routers that can't loop traffic back when everyone is on the same
Wi-Fi, privacy settings or extensions that hide local IPs), it goes through a
**TURN relay**: coturn on the Lightsail box `coc-clan-bot-1gb`
(`184.32.58.214`, UDP/TCP 3478, relay ports UDP 49160–49359 open in the
Lightsail firewall). WebRTC encrypts end to end, so the relay only sees
ciphertext.

- Config: `/etc/turnserver.conf` on the box (service `coturn`). Single user
  `kahoot`.
- Browsers need the relay login, so it's in the published page by necessity.
  It comes from `VITE_TURN_CREDENTIAL`: the repository secret
  `KAHOOT_TURN_CREDENTIAL` for deploys, `.env.local` (git-ignored) locally.
  What protects the relay is coturn's limits: 32 KB/s per session, 2 MB/s
  total, 100 sessions, UDP only, 3-hour sessions, and no relaying to private,
  loopback or AWS metadata addresses.
- If the box's IP changes, update `TURN_HOST` in
  [`kahoot/src/config.js`](kahoot/src/config.js) and `external-ip` in the
  coturn config.
- To check the relay works, add `?relay` to the URL on both the host and a
  player (`/kahoot/?relay#/host`): that forces every connection through it.

If a player sees "This browser has WebRTC turned off", their browser or an
extension disabled it; nothing on our side can fix that.

### Security model (it's public now)

- Every player message is untrusted: per-connection rate limit, `hello`
  first (within 10 s), strict type/range checks, JSON-only connections, a
  protocol version check, and at most 60 players.
- Names are normalised and stripped of control/bidi/zero-width tricks.
  React escapes all rendered text.
- Rejoining needs the player's private token, so typing someone else's name
  gets you "Name (2)", not their score. Removed players can't come back with
  the same token.
- While a question is open, nothing in the broadcast reveals who's right.
- The page ships a Content Security Policy (own scripts only, Google Fonts,
  PeerJS signalling) and `no-referrer`; see [`vite.config.js`](vite.config.js).
- Game codes are 4 characters (~900k combinations) so they're easy to read
  aloud; the host can lock the lobby once everyone's in.

## Deployment

Pages is set to **Source = "GitHub Actions"**. Every push to `main`
triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which
runs `npm run build` (with the `KAHOOT_TURN_CREDENTIAL` secret) and goes live
in about a minute. Each page is a separate Vite entry, listed in
[`vite.config.js`](vite.config.js). Add a new top-level page there.

## Local development

```
npm install
npm run dev
```

Put `VITE_TURN_CREDENTIAL=…` in `.env.local` to use the relay locally (without
it, only direct connections work). Open `http://localhost:5173/` for the
homepage and `http://localhost:5173/kahoot/#/host` to host a game; join from
another tab or your phone. Signalling goes through the PeerJS cloud, so you
need internet either way. Locally the homepage's live clan panel falls back to
static text (the clan data lives in Turtdle/coc).

`npm run build && npm run preview` serves the production build at
`http://localhost:4173/` to sanity-check before deploying.
