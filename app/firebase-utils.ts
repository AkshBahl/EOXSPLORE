import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User,
  UserCredential
} from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, auth, storage } from '@/firebase'

// Type definitions
export interface FirebaseError {
  code: string
  message: string
}

// Authentication helpers
export const authHelpers = {
  signIn: async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw new Error(`Sign in failed: ${error}`)
    }
  },

  signUp: async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw new Error(`Sign up failed: ${error}`)
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await signOut(auth)
    } catch (error) {
      throw new Error(`Sign out failed: ${error}`)
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw new Error(`Password reset failed: ${error}`)
    }
  },

  getCurrentUser: (): User | null => {
    return auth.currentUser
  }
}

// Firestore helpers
export const firestoreHelpers = {
  // Generic CRUD operations
  create: async <T extends DocumentData>(
    collectionName: string, 
    data: T
  ): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      throw new Error(`Failed to create document: ${error}`)
    }
  },

  read: async <T>(
    collectionName: string, 
    docId: string
  ): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T
      }
      return null
    } catch (error) {
      throw new Error(`Failed to read document: ${error}`)
    }
  },

  update: async <T extends DocumentData>(
    collectionName: string, 
    docId: string, 
    data: Partial<T>
  ): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      throw new Error(`Failed to update document: ${error}`)
    }
  },

  delete: async (
    collectionName: string, 
    docId: string
  ): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId)
      await deleteDoc(docRef)
    } catch (error) {
      throw new Error(`Failed to delete document: ${error}`)
    }
  },

  // Query helpers
  query: async <T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> => {
    try {
      const q = query(collection(db, collectionName), ...constraints)
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[]
    } catch (error) {
      throw new Error(`Failed to query documents: ${error}`)
    }
  },

  // Common query patterns
  whereField: (field: string, operator: any, value: any) => where(field, operator, value),
  orderByField: (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction),
  limitResults: (count: number) => limit(count),

  // Batch operations
  batchCreate: async <T extends DocumentData>(
    collectionName: string, 
    dataArray: T[]
  ): Promise<string[]> => {
    try {
      const promises = dataArray.map(data => 
        addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      )
      const docRefs = await Promise.all(promises)
      return docRefs.map(ref => ref.id)
    } catch (error) {
      throw new Error(`Failed to batch create documents: ${error}`)
    }
  }
}

// Storage helpers
export const storageHelpers = {
  uploadFile: async (
    path: string, 
    file: File
  ): Promise<string> => {
    try {
      const storageRef = ref(storage, path)
      const snapshot = await uploadBytes(storageRef, file)
      return await getDownloadURL(snapshot.ref)
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`)
    }
  },

  deleteFile: async (path: string): Promise<void> => {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`)
    }
  },

  getDownloadURL: async (path: string): Promise<string> => {
    try {
      const storageRef = ref(storage, path)
      return await getDownloadURL(storageRef)
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error}`)
    }
  }
}

// Utility functions
export const utils = {
  // Convert Firestore timestamp to Date
  timestampToDate: (timestamp: Timestamp): Date => {
    return timestamp.toDate()
  },

  // Convert Date to Firestore timestamp
  dateToTimestamp: (date: Date): Timestamp => {
    return Timestamp.fromDate(date)
  },

  // Check if user has specific role
  hasRole: (user: User | null, role: string): boolean => {
    return user?.email?.includes(role) || false
  },

  // Generate unique ID
  generateId: (): string => {
    return Math.random().toString(36).substr(2, 9)
  }
}

export default {
  auth: authHelpers,
  firestore: firestoreHelpers,
  storage: storageHelpers,
  utils
}
