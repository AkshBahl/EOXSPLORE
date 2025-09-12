"use client"

import { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { getApps } from 'firebase/app'

export default function FirebaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const gatherDebugInfo = async () => {
      const info: any = {}

      // Get Firebase apps
      const apps = getApps()
      info.apps = apps.map(app => ({
        name: app.name,
        options: app.options
      }))

      // Get auth info
      if (auth) {
        info.auth = {
          currentUser: auth.currentUser?.email,
          authDomain: auth.config?.authDomain,
          apiKey: auth.config?.apiKey
        }
      }

      // Get Firestore info (avoid using private internals)
      if (db) {
        try {
          const app = (db as any).app
          const options = app?.options || {}
          info.firestore = {
            app: app?.name,
            projectId: options.projectId,
            apiKey: options.apiKey,
          }
        } catch (e) {
          info.firestore = { error: 'Unable to read Firestore metadata safely' }
        }
      }

      // Get browser storage info
      if (typeof window !== 'undefined') {
        info.browserStorage = {
          localStorage: Object.keys(localStorage).filter(key => key.includes('firebase')),
          sessionStorage: Object.keys(sessionStorage).filter(key => key.includes('firebase')),
          indexedDB: await getIndexedDBInfo()
        }
      }

      setDebugInfo(info)
    }

    gatherDebugInfo()
  }, [])

  const getIndexedDBInfo = async () => {
    if (typeof window !== 'undefined' && 'indexedDB' in window && (indexedDB as any).databases) {
      try {
        const databases = await (indexedDB as any).databases()
        return databases.map((db: any) => db?.name).filter((name: string) => name?.includes('firebase'))
      } catch (error) {
        return ['Error getting IndexedDB info']
      }
    }
    return []
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg max-w-md text-xs z-50">
      <h3 className="font-bold mb-2">Firebase Debug Info</h3>
      <pre className="whitespace-pre-wrap overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}
