# turtdle.github.io

My website, a static site built with Vite and deployed to GitHub Pages.

| Path | What | Source |
| --- | --- | --- |
| [`/`](https://turtdle.github.io/) | Homepage: project cards, including a live Lovely clan war panel and a Kahoot join box | [`index.html`](index.html), [`home/`](home/) |
| [`/kahoot/`](https://turtdle.github.io/kahoot/) | Temu Kahoot (see below) | [`kahoot/`](kahoot/), quizzes in [`public/kahoot/`](public/kahoot/) |
| [`/coc/lovely/`](https://turtdle.github.io/coc/lovely/) | Lovely clan stats site | [`public/coc/lovely/`](public/coc/lovely/), **published hourly by the clan bot; don't edit by hand** |
| [`/workoutscribe/`](https://turtdle.github.io/workoutscribe/) | Workout Scribe app page | separate repo [Turtdle/workoutscribe](https://github.com/Turtdle/workoutscribe) |
| [`/legacy-website/`](https://turtdle.github.io/legacy-website/) | The old personal site | separate repo [Turtdle/legacy-website](https://github.com/Turtdle/legacy-website) |

The homepage reads `/coc/lovely/data.json` (the clan bot's export) for its
live war panel, and falls back to static text if that fetch fails.

### Rules that keep the clan bot's publisher working

The bot (`site_publish.py` in the private coc-clan-bot repo) keeps a sparse
clone of only `public/coc/lovely/`, commits as "Lovely clan bot", and pushes
to `main` about once an hour. So:

- Always `git pull --rebase` before pushing. Bot commits land all the time.
- Keep the branch `main`, keep Vite's default `publicDir` and `base: '/'`,
  and don't add a `paths` filter to the deploy workflow. Every bot commit
  needs to redeploy.
- Don't add SPA fallbacks, a service worker or a root `404.html` that could
  swallow `/coc/lovely/`.

## Temu Kahoot — a tiny Kahoot clone

A Kahoot-style quiz game for family and friends. No backend, no accounts: the
host's browser **is** the game server (via [PeerJS](https://peerjs.com/) /
WebRTC).

Live at **https://turtdle.github.io/kahoot/**. It used to be at the site
root. Old `turtdle.github.io/#/host` and `#/play/CODE` links still work,
because the homepage redirects them to `/kahoot/`.

### How a game works

1. Open `https://turtdle.github.io/kahoot/#/host`, enter the host
   password, pick a quiz set, and you get a game code + join link. **Keep
   this tab open — the game runs in it. Don't refresh.**
2. Send the link (or read the 4-letter code aloud). Players open it on their
   phones and enter a name. They can also type the code into the box on
   the homepage.
3. Hit **Start game**. Everyone sees the question and three answer buttons.
   There's no time limit, but faster correct answers earn more points
   (1000 for instant, halving every 30 s, floor of 100; wrong = 0).
4. When everyone has answered, the correct answer + leaderboard appear.
   The host clicks **Next question** to move on. Podium at the end.

If a player's phone locks or they refresh, they can rejoin with the **same
name** and keep their score.

### Editing the questions

Quiz sets are CSV files in [`public/kahoot/quizzes/`](public/kahoot/quizzes/),
and [`public/kahoot/quizzes.json`](public/kahoot/quizzes.json) is the menu the
host picks from:

```json
[
  { "name": "General Trivia", "file": "general.csv" },
  { "name": "Harder Trivia", "file": "harder.csv" }
]
```

To add a set: create a new CSV in `public/kahoot/quizzes/` and add a line to
`quizzes.json`. Easiest workflow: edit the files on github.com → commit.
The site rebuilds and redeploys automatically in about a minute.

CSV format — one row per question, `correct` is `1`, `2`, or `3`:

```csv
question,answer1,answer2,answer3,correct
What do pandas mainly eat?,Bamboo,Fish,Honey,1
"Which is bigger, a whale or an elephant?",Whale,Elephant,Same,1
```

- If a question or answer contains a **comma**, wrap the field in double
  quotes (like the second row above).
- For a quote character inside a quoted field, double it: `"He said ""hi"""`.
- Invalid rows are skipped; the host lobby shows how many loaded.

### Changing the host password

Edit `HOST_PASSWORD` in [`kahoot/src/config.js`](kahoot/src/config.js). **This
is not real security** — anything in a static site is visible to anyone who
looks at the source. It only keeps guests from wandering into the host screen.

### Limits (by design — it's a family game)

- The game lives in the host's tab: refresh/close it and the game ends.
- The free PeerJS cloud handles matchmaking; typical home/phone networks
  connect fine, but there's no TURN relay for exotic corporate NATs.

## Deployment

Pages is set to **Source = "GitHub Actions"**. Every push to `main`
(including CSV edits made on github.com and the clan bot's hourly commits)
triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which
runs `npm run build` and goes live in about a minute. Each page is a separate
Vite entry, listed in [`vite.config.js`](vite.config.js). Add a new top-level
page there.

## Local development

```
npm install
npm run dev
```

Open `http://localhost:5173/` for the homepage and
`http://localhost:5173/kahoot/#/host` to host a game; join from another tab
(or your phone). Multiplayer works from localhost — signaling goes through
the free PeerJS cloud, so you need internet either way. Locally the homepage's
live clan panel shows whatever `public/coc/lovely/data.json` you last pulled.

`npm run build && npm run preview` serves the production build at
`http://localhost:4173/` to sanity-check before deploying.
