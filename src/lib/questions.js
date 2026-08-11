import Papa from 'papaparse'

// Quiz sets live in public/quizzes/ with public/quizzes.json as the menu —
// all fetched at runtime (not bundled), so editing them on github.com
// redeploys new questions without touching any code.
// 'no-cache' forces revalidation: GitHub Pages caches assets for 10 minutes,
// which would otherwise serve stale questions right after an edit.

// Returns [{ name, file }] from quizzes.json.
export async function loadQuizList() {
  const res = await fetch(import.meta.env.BASE_URL + 'quizzes.json', { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Could not load quizzes.json (HTTP ${res.status})`)
  const list = await res.json()
  if (!Array.isArray(list)) throw new Error('quizzes.json must be a JSON array')
  return list.filter((q) => q && typeof q.name === 'string' && typeof q.file === 'string')
}

// Returns { questions: [{ text, answers: [a,b,c], correctIndex }], skipped }.
export async function loadQuestions(file) {
  const res = await fetch(import.meta.env.BASE_URL + 'quizzes/' + file, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Could not load quizzes/${file} (HTTP ${res.status})`)
  const text = await res.text()
  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  })

  const questions = []
  let skipped = 0
  for (const row of data) {
    const questionText = (row.question || '').trim()
    const answers = [row.answer1, row.answer2, row.answer3].map((a) => (a || '').trim())
    const correct = parseInt(row.correct, 10)
    if (!questionText || answers.some((a) => !a) || !(correct >= 1 && correct <= 3)) {
      skipped++
      continue
    }
    questions.push({ text: questionText, answers, correctIndex: correct - 1 })
  }
  return { questions, skipped }
}
