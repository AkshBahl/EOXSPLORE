// firebase.tsx
import { initializeApp, getApps, deleteApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"
import { getAnalytics, isSupported } from "firebase/analytics"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWqqER23AD3MQULm3jXrzsV4gmAZtyZ64",
  authDomain: "eoxsplore.firebaseapp.com",
  projectId: "eoxsplore",
  storageBucket: "eoxsplore.firebasestorage.app",
  messagingSenderId: "96095788161",
  appId: "1:96095788161:web:b4d6832ef6b7e0a53c4180",
  measurementId: "G-8K9G7MG19S"
};

// Force clear any existing Firebase apps to ensure we use the new configuration
const existingApps = getApps()
if (existingApps.length > 0) {
  existingApps.forEach(app => {
    try {
      deleteApp(app)
    } catch (error) {
      console.log('Error deleting existing Firebase app:', error)
    }
  })
}

// Clear browser storage if in browser environment
if (typeof window !== 'undefined') {
  try {
    // Clear localStorage
    localStorage.clear()
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear IndexedDB
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name && db.name.includes('firebase')) {
            indexedDB.deleteDatabase(db.name)
          }
        })
      })
    }
    
    console.log('🔥 Cleared all browser storage for fresh Firebase start')
  } catch (error) {
    console.log('Error clearing browser storage:', error)
  }
}

// Initialize Firebase with the new configuration
const app = initializeApp(firebaseConfig, 'eoxsplore-app')

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics conditionally (only in browser and if supported)
let analytics = null
if (typeof window !== 'undefined') {
  isSupported().then((yes: boolean) => yes ? analytics = getAnalytics(app) : null)
}
export { analytics }

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines if you want to use Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099')
  // connectFirestoreEmulator(db, 'localhost', 8080)
  // connectStorageEmulator(storage, 'localhost', 9199)
}

// Log the configuration for debugging
console.log('🔥 Firebase initialized with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  appName: app.name
})

export default app

