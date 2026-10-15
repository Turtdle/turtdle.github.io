// Lock or unlock Temu Kahoot's saved quiz sets.
//
//   npm run presets:lock     kahoot/presets/ (plain CSVs, git-ignored) -> public/kahoot/presets.enc.json
//   npm run presets:unlock   the reverse, to edit them
//
// kahoot/presets/presets.json lists the sets in menu order: [{ "name": "...", "file": "x.csv" }].
// The password comes from KAHOOT_PRESET_PASSWORD, kahoot/presets/.password (git-ignored),
// or a prompt. It never goes in the repo; hosts type it on the Host screen.
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import { lockPresets, unlockPresets } from '../kahoot/src/lib/presetCrypto.js'
import { parseQuizCsv } from '../kahoot/src/lib/quiz.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const DIR = path.join(root, 'kahoot', 'presets')
const MENU = path.join(DIR, 'presets.json')
const OUT = path.join(root, 'public', 'kahoot', 'presets.enc.json')
const rel = (p) => path.relative(root, p).replace(/\\/g, '/')

async function getPassword() {
  if (process.env.KAHOOT_PRESET_PASSWORD) return process.env.KAHOOT_PRESET_PASSWORD
  const file = path.join(DIR, '.password')
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim()
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = await new Promise((resolve) => rl.question('Host password: ', resolve))
  rl.close()
  return answer.trim()
}

async function lock() {
  const menu = JSON.parse(fs.readFileSync(MENU, 'utf8'))
  const quizzes = []
  for (const { name, file } of menu) {
    const csv = fs.readFileSync(path.join(DIR, file), 'utf8')
    const { questions, problems } = parseQuizCsv(csv)
    console.log(`${name}: ${questions.length} questions${problems.length ? `, ${problems.length} skipped:` : ''}`)
    for (const p of problems) console.log(`  ${p}`)
    if (!questions.length) throw new Error(`${file} has no usable questions`)
    quizzes.push({ name, csv })
  }
  const password = await getPassword()
  // The encrypted file is public, so a short password could be guessed offline.
  if (password.length < 12) throw new Error('Use a password of at least 12 characters.')
  fs.writeFileSync(OUT, JSON.stringify(await lockPresets({ quizzes }, password)) + '\n')
  console.log(`Wrote ${rel(OUT)} (${quizzes.length} quiz sets)`)
}

async function unlock() {
  const { quizzes } = await unlockPresets(JSON.parse(fs.readFileSync(OUT, 'utf8')), await getPassword())
  fs.mkdirSync(DIR, { recursive: true })
  const menu = quizzes.map((q, i) => {
    const slug = q.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const file = `${String(i + 1).padStart(2, '0')}-${slug || 'quiz'}.csv`
    fs.writeFileSync(path.join(DIR, file), q.csv)
    return { name: q.name, file }
  })
  fs.writeFileSync(MENU, JSON.stringify(menu, null, 2) + '\n')
  console.log(`Unlocked ${menu.length} quiz sets into ${rel(DIR)}/`)
}

const command = process.argv[2]
if (command === 'lock') await lock()
else if (command === 'unlock') await unlock()
else {
  console.error('usage: node scripts/presets.mjs lock|unlock')
  process.exit(1)
}
