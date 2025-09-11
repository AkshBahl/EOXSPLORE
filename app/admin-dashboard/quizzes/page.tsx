"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface QuizQuestionDraft {
  question: string
  options: string[]
  correctIndex: number
}

export default function AdminQuizzesPage() {
  // Stores the underlying module category (e.g., "Company Introduction")
  const [moduleId, setModuleId] = useState("")
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState<string[]>(["", "", "", ""]) // 4 options
  const [correctIndex, setCorrectIndex] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [modules, setModules] = useState<Array<{ category: string; displayName: string; slug: string }>>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuestion, setEditQuestion] = useState<string>("")
  const [editOptions, setEditOptions] = useState<string[]>(["", "", "", ""]) 
  const [editCorrectIndex, setEditCorrectIndex] = useState<number>(0)

  // Slug is derived from the raw category to match dashboard links
  const normalizedModuleId = useMemo(() => moduleId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), [moduleId])

  const load = async () => {
    if (!normalizedModuleId) return
    setLoading(true)
    try {
      const qz = query(collection(db, "quizzes"), where("moduleId", "==", normalizedModuleId))
      const snap = await getDocs(qz)
      setQuestions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedModuleId])

  // Load module names from videos (distinct categories) and apply display name overrides
  useEffect(() => {
    const loadModules = async () => {
      try {
        // Fetch distinct categories from videos
        const videosSnap = await getDocs(collection(db, "videos"))
        const categories = new Set<string>()
        videosSnap.docs.forEach((d) => {
          const cat = (d.data() as any)?.category
          if (typeof cat === 'string' && cat.trim()) categories.add(cat.trim())
        })
        // Fetch display name overrides
        const dnSnap = await getDocs(collection(db, "moduleDisplayNames"))
        const displayMap: Record<string, string> = {}
        dnSnap.docs.forEach((d) => {
          const data = d.data() as any
          if (data?.category && data?.displayName) displayMap[data.category] = data.displayName
        })
        // Build options
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        const list = Array.from(categories).map((category) => ({
          category,
          displayName: (displayMap[category] || (category.includes('Module') ? category : `${category} Module`)).trim(),
          slug: normalize(category),
        }))
        // Sort by display name for usability
        list.sort((a, b) => a.displayName.localeCompare(b.displayName))
        setModules(list)
        // If nothing selected yet, preselect first
        if (!moduleId && list.length > 0) setModuleId(list[0].category)
      } catch (e) {
        console.error('Failed to load modules for quizzes admin', e)
      }
    }
    loadModules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addQuestion = async () => {
    if (!normalizedModuleId || !question || options.some((o) => !o)) return
    await addDoc(collection(db, "quizzes"), {
      moduleId: normalizedModuleId,
      question,
      options,
      correctIndex,
      createdAt: new Date().toISOString(),
    })
    setQuestion("")
    setOptions(["", "", "", ""]) 
    setCorrectIndex(0)
    await load()
  }

  const removeQuestion = async (id: string) => {
    await deleteDoc(doc(db, "quizzes", id))
    await load()
  }

  const startEdit = (q: any) => {
    setEditingId(q.id)
    setEditQuestion(q.question || "")
    const opts = Array.isArray(q.options) ? q.options.slice(0, 4) : ["", "", "", ""]
    setEditOptions([opts[0] || "", opts[1] || "", opts[2] || "", opts[3] || ""]) 
    setEditCorrectIndex(typeof q.correctIndex === 'number' ? q.correctIndex : 0)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditQuestion("")
    setEditOptions(["", "", "", ""]) 
    setEditCorrectIndex(0)
  }

  const saveEdit = async () => {
    if (!editingId) return
    if (!editQuestion || editOptions.some((o) => !o)) return
    await updateDoc(doc(db, "quizzes", editingId), {
      question: editQuestion,
      options: editOptions,
      correctIndex: editCorrectIndex,
      updatedAt: new Date().toISOString(),
    })
    cancelEdit()
    await load()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin: Manage Quizzes</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm text-slate-600">Module</label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              {modules.map((m) => (
                <option key={m.slug} value={m.category}>{m.displayName}</option>
              ))}
            </select>
            <div className="text-xs text-slate-500 mt-1">Stored as: {normalizedModuleId || '—'}</div>
          </div>
          <div>
            <label className="text-sm text-slate-600">Question</label>
            <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter question" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} />
                <Input value={opt} onChange={(e) => setOptions((prev) => prev.map((p, idx) => (idx === i ? e.target.value : p)))} placeholder={`Option ${i + 1}`} />
              </div>
            ))}
          </div>
          <Button onClick={addQuestion} className="bg-green-600 hover:bg-green-700">Add Question</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions for: {normalizedModuleId || '—'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <div>Loading...</div>}
          {!loading && questions.length === 0 && <div className="text-sm text-slate-500">No questions yet.</div>}
          {!loading && questions.map((q) => (
            <div key={q.id} className="border rounded p-3">
              {editingId === q.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-600">Question</label>
                    <Textarea value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {editOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="radio" checked={editCorrectIndex === i} onChange={() => setEditCorrectIndex(i)} />
                        <Input value={opt} onChange={(e) => setEditOptions((prev) => prev.map((p, idx) => (idx === i ? e.target.value : p)))} placeholder={`Option ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={saveEdit} className="bg-green-600 hover:bg-green-700">Save</Button>
                    <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-medium">{q.question}</div>
                  <ol className="list-decimal pl-5 text-sm mt-1">
                    {q.options?.map((o: string, i: number) => (
                      <li key={i} className={i === q.correctIndex ? 'text-green-700' : ''}>{o}</li>
                    ))}
                  </ol>
                  <div className="mt-2 flex items-center gap-2">
                    <Button variant="outline" onClick={() => startEdit(q)}>Edit</Button>
                    <Button variant="destructive" onClick={() => removeQuestion(q.id)}>Delete</Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}


