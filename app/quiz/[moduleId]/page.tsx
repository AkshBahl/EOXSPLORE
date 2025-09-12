"use client"

import { useEffect, useMemo, useState, use as usePromise } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { collection, getDocs, query, where, addDoc } from "firebase/firestore"
import { auth, db } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface QuizQuestion {
  id?: string
  moduleId: string
  question: string
  options: string[]
  correctIndex: number
}

export default function ModuleQuizPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const router = useRouter()
  const { moduleId } = usePromise(params)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ scorePct: number; passed: boolean } | null>(null)

  const prettyModuleName = useMemo(() => moduleId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), [moduleId])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        // Primary: exact slug
        let qz = query(collection(db, "quizzes"), where("moduleId", "==", moduleId))
        let snap = await getDocs(qz)
        let list: QuizQuestion[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        // Fallback: legacy with "-module" suffix
        if (list.length === 0) {
          const fallbackId = moduleId.endsWith('-module') ? moduleId : `${moduleId}-module`
          qz = query(collection(db, "quizzes"), where("moduleId", "==", fallbackId))
          snap = await getDocs(qz)
          list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        }
        setQuestions(list)
      } catch (e) {
        console.error("Failed to load quiz questions", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [moduleId])

  const allAnswered = questions.length > 0 && questions.every((q) => Number.isInteger(answers[q.id || q.question]))

  const submit = async () => {
    if (!auth.currentUser) {
      router.push("/login")
      return
    }
    try {
      setSubmitting(true)
      let correct = 0
      questions.forEach((q) => {
        const key = q.id || q.question
        if (answers[key] === q.correctIndex) correct += 1
      })
      const score = questions.length > 0 ? correct / questions.length : 0
      const passed = score >= 0.75
      await addDoc(collection(db, "quizResults"), {
        userId: auth.currentUser.uid,
        moduleId,
        score,
        passed,
        submittedAt: new Date().toISOString(),
      })
      setResult({ scorePct: Math.round(score * 100), passed })
    } catch (e) {
      console.error("Failed to submit quiz", e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Quiz: {prettyModuleName}</h1>
        <Link href="/dashboard?view=classic"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
      <Separator className="mb-6" />

      {loading && <div>Loading questions...</div>}
      {!loading && questions.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Questions</CardTitle>
          </CardHeader>
          <CardContent>
            No quiz questions are available for this module yet.
          </CardContent>
        </Card>
      )}

      {!loading && questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id || q.question}>
              <CardHeader>
                <CardTitle className="text-base">{idx + 1}. {q.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((opt, i) => {
                  const key = q.id || q.question
                  const selected = answers[key] === i
                  const showFeedback = !!result
                  const isCorrect = i === q.correctIndex
                  const isWrongSelected = selected && !isCorrect
                  const base = 'w-full text-left border rounded px-3 py-2 transition-colors'
                  const preSubmitStyle = selected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
                  // After submit: only show red for wrong selected; show green ONLY if the selected option is correct
                  const postSubmitStyle = (selected && isCorrect)
                    ? 'border-green-600 bg-green-50 text-green-800'
                    : isWrongSelected
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-slate-200'
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (result) return
                        setAnswers((prev) => ({ ...prev, [key]: i }))
                      }}
                      disabled={!!result}
                      className={`${base} ${showFeedback ? postSubmitStyle : preSubmitStyle}`}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                      {showFeedback && (
                        <span className={`ml-2 text-xs ${isWrongSelected ? 'text-red-700' : (selected && isCorrect) ? 'text-green-700' : 'text-slate-400'}`}>
                          {isWrongSelected ? '(Your answer)' : (selected && isCorrect) ? '(Correct)' : ''}
                        </span>
                      )}
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center gap-3">
            {!result && (
              <Button onClick={submit} disabled={!allAnswered || submitting} className="bg-indigo-600 hover:bg-indigo-700">
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            )}
            {result && (
              <Button
                onClick={() => { setResult(null); setAnswers({}); }}
                className="bg-slate-700 hover:bg-slate-800"
              >
                Retry Quiz
              </Button>
            )}
            {!allAnswered && !result && <span className="text-sm text-slate-500">Answer all questions to submit</span>}
          </div>

          {result && (
            <div className="mt-2 text-sm">
              Score: <span className={result.passed ? 'text-green-600' : 'text-red-600'}>{result.scorePct}%</span> • {result.passed ? 'Passed' : 'Not Passed (need ≥75%)'}
            </div>
          )}
        </div>
      )}

      {/* Success Popup */}
      {result?.passed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="text-2xl font-semibold text-green-700">Quiz Passed!</div>
            <div className="mt-2 text-slate-600">You have passed the quiz. Continue to the next module.</div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button onClick={() => router.push('/dashboard')} className="bg-green-600 hover:bg-green-700">Continue to Next Module</Button>
              <Button variant="outline" onClick={() => setResult(null)}>Stay</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

 
