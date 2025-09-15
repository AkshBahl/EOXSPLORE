"use client"

import { useEffect, useMemo, useState, use as reactUse } from "react"
import { useRouter, useParams } from "next/navigation"
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

export default function ModuleQuizPage() {
  const router = useRouter()
  // Handle both Next.js versions: unwrap if it's a promise, else use directly
  const maybeParams = useParams() as any
  const params = (maybeParams && typeof maybeParams.then === 'function') ? (reactUse(maybeParams) as any) : maybeParams
  const moduleId: string = params.moduleId
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-20 border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard?view=classic" className="flex items-center gap-2">
            <img src="/Black logo.png" alt="EOXS Logo" className="h-8 w-auto" />
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">Module:</span>
            <span className="font-medium text-slate-900">{prettyModuleName}</span>
          </div>
          <Link href="/dashboard?view=classic"><Button variant="outline" size="sm">Back to Dashboard</Button></Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>Answered {Object.keys(answers).length} / {questions.length}</span>
            {result && (
              <span className={result.passed ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                Score: {result.scorePct}% {result.passed ? "(Passed)" : "(Need ≥75%)"}
              </span>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${questions.length ? (Object.keys(answers).length / questions.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Quiz: {prettyModuleName}</h1>
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
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const key = q.id || q.question
            const selectedIndex = answers[key]
            const showFeedback = !!result
            return (
              <Card key={key} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-start gap-4">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{q.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {q.options.map((opt, i) => {
                    const isSelected = selectedIndex === i
                    const isCorrect = i === q.correctIndex
                    const isWrongSelected = isSelected && !isCorrect
                    const base = "w-full text-left rounded-lg border px-4 py-3 transition-all hover:shadow-sm"
                    const pre = isSelected 
                      ? "border-indigo-600 bg-indigo-50 shadow-sm" 
                      : "border-slate-200 hover:bg-slate-50"
                    const post = isSelected && isCorrect
                      ? "border-green-600 bg-green-50 text-green-800"
                      : isWrongSelected
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-slate-200"
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (result) return
                          setAnswers((prev) => ({ ...prev, [key]: i }))
                        }}
                        disabled={!!result}
                        className={`${base} ${showFeedback ? post : pre}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                            isSelected 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 text-left">{opt}</span>
                          {showFeedback && (
                            <span className={`text-sm font-medium ${
                              isWrongSelected 
                                ? 'text-red-700' 
                                : (isSelected && isCorrect) 
                                  ? 'text-green-700' 
                                  : 'text-slate-400'
                            }`}>
                              {isWrongSelected ? 'Your answer' : (isSelected && isCorrect) ? 'Correct' : ''}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}

          {/* Sticky Submit Bar */}
          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t border-slate-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!result && (
                <Button 
                  onClick={submit} 
                  disabled={!allAnswered || submitting} 
                  className="bg-indigo-600 hover:bg-indigo-700 px-6"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              )}
              {result && (
                <Button 
                  onClick={() => { setResult(null); setAnswers({}); }} 
                  className="bg-slate-700 hover:bg-slate-800 px-6"
                >
                  Retry Quiz
                </Button>
              )}
              {!allAnswered && !result && (
                <span className="text-sm text-slate-500">
                  Answer all {questions.length} questions to submit
                </span>
              )}
            </div>
            {result && (
              <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                result.passed 
                  ? 'border-green-200 bg-green-50 text-green-800' 
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}>
                {result.scorePct}% • {result.passed ? 'Passed' : 'Not Passed (need ≥75%)'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Popup */}
      {result?.passed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="text-2xl font-semibold text-green-700">Quiz Passed!</div>
            <div className="mt-2 text-slate-600">You have passed the quiz. Continue to the next module.</div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button onClick={() => router.push('/dashboard?view=classic')} className="bg-green-600 hover:bg-green-700">Continue to Next Module</Button>
              <Button variant="outline" onClick={() => setResult(null)}>Stay</Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

 
