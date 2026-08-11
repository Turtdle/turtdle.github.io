# Temu Kahoot — a tiny Kahoot clone

A Kahoot-style quiz game for family and friends. No backend, no accounts: the
host's browser **is** the game server (via [PeerJS](https://peerjs.com/) /
WebRTC), and the whole thing is a static site on GitHub Pages.

Live at **https://turtdle.github.io/** (the old personal site now lives at
[github.com/Turtdle/legacy-website](https://github.com/Turtdle/legacy-website),
published at https://turtdle.github.io/legacy-website/).

## How a game works

1. Open `https://turtdle.github.io/#/host`, enter the host
   password, and you get a game code + join link. **Keep this tab open — the
   game runs in it. Don't refresh.**
2. Send the link (or read the 4-letter code aloud). Players open it on their
   phones and enter a name.
3. Hit **Start game**. Everyone sees the question and three answer buttons.
   There's no time limit, but faster correct answers earn more points
   (1000 for instant, halving every 30 s, floor of 100; wrong = 0).
4. When everyone has answered, the correct answer + leaderboard appear.
   The host clicks **Next question** to move on. Podium at the end.

If a player's phone locks or they refresh, they can rejoin with the **same
name** and keep their score.

## Editing the questions

All questions live in [`public/questions.csv`](public/questions.csv). Easiest
workflow: open the file on github.com → click the pencil → edit → commit.
The site rebuilds and redeploys automatically in about a minute.

Format — one row per question, `correct` is `1`, `2`, or `3`:

```csv
question,answer1,answer2,answer3,correct
What do pandas mainly eat?,Bamboo,Fish,Honey,1
"Which is bigger, a whale or an elephant?",Whale,Elephant,Same,1
```

- If a question or answer contains a **comma**, wrap the field in double
  quotes (like the second row above).
- For a quote character inside a quoted field, double it: `"He said ""hi"""`.
- Invalid rows are skipped; the host lobby shows how many loaded.

## Changing the host password

Edit `HOST_PASSWORD` in [`src/config.js`](src/config.js). **This is not real
security** — anything in a static site is visible to anyone who looks at the
source. It only keeps guests from wandering into the host screen.

## Deployment

This repo is `Turtdle/turtdle.github.io` with Pages set to **Source =
"GitHub Actions"**. Every push to `main` (including CSV edits made on
github.com) triggers
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) and goes
live at `https://turtdle.github.io/` in about a minute.

(If this ever moves to a regular project repo, set `base` in
[`vite.config.js`](vite.config.js) to `'/<repo-name>/'`.)

## Local development

```
npm install
npm run dev
```

Open `http://localhost:5173/#/host` in one tab and join from
another tab (or your phone). Multiplayer works from localhost — signaling
goes through the free PeerJS cloud, so you need internet either way.

`npm run build && npm run preview` serves the production build at
`http://localhost:4173/` to sanity-check before deploying.

## Limits (by design — it's a family game)

- The game lives in the host's tab: refresh/close it and the game ends.
- The free PeerJS cloud handles matchmaking; typical home/phone networks
  connect fine, but there's no TURN relay for exotic corporate NATs.
