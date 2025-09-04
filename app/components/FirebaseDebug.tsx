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

      // Get Firestore info
      if (db) {
        info.firestore = {
          app: db.app.name,
          settings: db._delegate._databaseId
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
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases()
        return databases.map(db => db.name).filter(name => name?.includes('firebase'))
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
