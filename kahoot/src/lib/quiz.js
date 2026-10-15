import Papa from 'papaparse'
import {
  ANSWER_MAX,
  MAX_ANSWERS,
  MIN_ANSWERS,
  QUESTION_MAX,
  QUIZ_MAX_BYTES,
  QUIZ_MAX_QUESTIONS,
} from '../config.js'
import { cleanText } from './text.js'

// The quiz CSV format, shared by uploads and the locked presets. The host
// screen and public/kahoot/template.csv show the same thing to people:
//
//   question,answer1,answer2,answer3,answer4,correct
//   What do pandas mainly eat?,Bamboo,Fish,Honey,Grass,1
//
// answer3 and answer4 are optional (2 to 4 answers); correct is the number of
// the right answer. Old three-answer files still work.
export const CSV_HEADER = 'question,answer1,answer2,answer3,answer4,correct'

// Returns { questions: [{ text, answers, correctIndex }], problems: [string] }.
// Bad rows are skipped and described in problems, using spreadsheet row numbers.
export function parseQuizCsv(text) {
  if (typeof text !== 'string' || !text.trim()) return { questions: [], problems: ['The file is empty.'] }
  if (text.length > QUIZ_MAX_BYTES) {
    return { questions: [], problems: [`The file is too big (the limit is ${QUIZ_MAX_BYTES / 1024} KB).`] }
  }

  const { data, errors, meta } = Papa.parse(text, {
    header: true,
    skipEmptyLines: 'greedy',
    // Excel starts its CSVs with a byte-order mark.
    transformHeader: (h) => (h.charCodeAt(0) === 0xfeff ? h.slice(1) : h).trim().toLowerCase(),
  })
  const fields = meta.fields || []
  if (!['question', 'answer1', 'answer2', 'correct'].every((f) => fields.includes(f))) {
    return {
      questions: [],
      problems: [`The first row must be the column names: ${CSV_HEADER}`],
    }
  }

  const problems = []
  const badQuotes = new Set(errors.filter((e) => e.type === 'Quotes').map((e) => e.row))
  const questions = []
  let ignored = 0

  data.forEach((row, i) => {
    const rowNo = i + 2 // +1 for the header row, +1 because spreadsheets count from 1
    const skip = (why) => problems.push(`Row ${rowNo}: ${why}`)
    if (badQuotes.has(i)) return skip('a quote mark isn’t closed')
    if (questions.length >= QUIZ_MAX_QUESTIONS) return ignored++

    const question = cleanText(row.question)
    const answers = []
    for (let n = 1; n <= MAX_ANSWERS; n++) answers.push(cleanText(row[`answer${n}`]))
    while (answers.length && !answers[answers.length - 1]) answers.pop()

    if (!question) return skip('the question is empty')
    if (question.length > QUESTION_MAX) return skip(`the question is over ${QUESTION_MAX} characters`)
    if (answers.length < MIN_ANSWERS) return skip(`it needs at least ${MIN_ANSWERS} answers`)
    if (answers.some((a) => !a)) return skip('fill in the answers in order (answer1, answer2, …) with no gaps')
    if (answers.some((a) => a.length > ANSWER_MAX)) return skip(`an answer is over ${ANSWER_MAX} characters`)
    const correct = Number(String(row.correct ?? '').trim())
    if (!Number.isInteger(correct) || correct < 1 || correct > answers.length) {
      return skip(`correct must be a number from 1 to ${answers.length}`)
    }
    questions.push({ text: question, answers, correctIndex: correct - 1 })
  })

  if (ignored) problems.push(`Only the first ${QUIZ_MAX_QUESTIONS} questions are used (${ignored} more ignored).`)
  return { questions, problems }
}
