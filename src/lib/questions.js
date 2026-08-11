import Papa from 'papaparse'

// Fetches public/questions.csv at runtime (not bundled), so editing the CSV
// on github.com redeploys new questions without touching any code.
// Returns { questions: [{ text, answers: [a,b,c], correctIndex }], skipped }.
export async function loadQuestions() {
  // 'no-cache' forces revalidation: GitHub Pages caches assets for 10 minutes,
  // which would otherwise serve stale questions right after an edit.
  const res = await fetch(import.meta.env.BASE_URL + 'questions.csv', { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Could not load questions.csv (HTTP ${res.status})`)
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
