// Firebase Helpers - Latest SDK Patterns
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
  QueryDocumentSnapshot,
  writeBatch,
  runTransaction,
  onSnapshot,
  Unsubscribe,
  setDoc
} from 'firebase/firestore'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User,
  UserCredential,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadString,
  listAll,
  getMetadata
} from 'firebase/storage'
import { db, auth, storage } from '@/firebase'

// Type definitions
export interface FirebaseError {
  code: string
  message: string
}

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Authentication Helpers
export const authHelpers = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      throw new Error(`Sign in failed: ${error.message}`)
    }
  },

  // Create new user account
  signUp: async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      throw new Error(`Sign up failed: ${error.message}`)
    }
  },

  // Sign out current user
  signOut: async (): Promise<void> => {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error(`Sign out failed: ${error.message}`)
    }
  },

  // Send password reset email
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(`Password reset failed: ${error.message}`)
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser
  },

  // Update user profile
  updateProfile: async (displayName?: string, photoURL?: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('No user logged in')
    try {
      await updateProfile(auth.currentUser, { displayName, photoURL })
    } catch (error: any) {
      throw new Error(`Profile update failed: ${error.message}`)
    }
  },

  // Update user email
  updateEmail: async (newEmail: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('No user logged in')
    try {
      await updateEmail(auth.currentUser, newEmail)
    } catch (error: any) {
      throw new Error(`Email update failed: ${error.message}`)
    }
  },

  // Update user password
  updatePassword: async (newPassword: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('No user logged in')
    try {
      await updatePassword(auth.currentUser, newPassword)
    } catch (error: any) {
      throw new Error(`Password update failed: ${error.message}`)
    }
  },

  // Delete user account
  deleteUser: async (): Promise<void> => {
    if (!auth.currentUser) throw new Error('No user logged in')
    try {
      await deleteUser(auth.currentUser)
    } catch (error: any) {
      throw new Error(`Account deletion failed: ${error.message}`)
    }
  },

  // Reauthenticate user (required for sensitive operations)
  reauthenticate: async (email: string, password: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('No user logged in')
    try {
      const credential = EmailAuthProvider.credential(email, password)
      await reauthenticateWithCredential(auth.currentUser, credential)
    } catch (error: any) {
      throw new Error(`Reauthentication failed: ${error.message}`)
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void): Unsubscribe => {
    return onAuthStateChanged(auth, callback)
  }
}

// Firestore Helpers
export const firestoreHelpers = {
  // Create document with auto-generated ID
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
    } catch (error: any) {
      throw new Error(`Failed to create document: ${error.message}`)
    }
  },

  // Create document with custom ID
  createWithId: async <T extends DocumentData>(
    collectionName: string, 
    docId: string,
    data: T
  ): Promise<void> => {
    try {
      await setDoc(doc(db, collectionName, docId), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Failed to create document with ID: ${error.message}`)
    }
  },

  // Read single document
  read: async <T>(
    collectionName: string, 
    docId: string
  ): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? docSnap.data() as T : null
    } catch (error: any) {
      throw new Error(`Failed to read document: ${error.message}`)
    }
  },

  // Update document
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
    } catch (error: any) {
      throw new Error(`Failed to update document: ${error.message}`)
    }
  },

  // Delete document
  delete: async (collectionName: string, docId: string): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId)
      await deleteDoc(docRef)
    } catch (error: any) {
      throw new Error(`Failed to delete document: ${error.message}`)
    }
  },

  // Query documents
  query: async <T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> => {
    try {
      const q = query(collection(db, collectionName), ...constraints)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[]
    } catch (error: any) {
      throw new Error(`Failed to query documents: ${error.message}`)
    }
  },

  // Listen to document changes
  onDocument: <T>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void
  ): Unsubscribe => {
    const docRef = doc(db, collectionName, docId)
    return onSnapshot(docRef, (doc) => {
      callback(doc.exists() ? doc.data() as T : null)
    })
  },

  // Listen to collection changes
  onCollection: <T>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    callback: (data: T[]) => void
  ): Unsubscribe => {
    const q = query(collection(db, collectionName), ...constraints)
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[]
      callback(data)
    })
  },

  // Batch write operations
  batchWrite: async (operations: Array<{
    type: 'create' | 'update' | 'delete'
    collection: string
    id?: string
    data?: any
  }>): Promise<void> => {
    try {
      const batch = writeBatch(db)
      
      operations.forEach(op => {
        const docRef = doc(db, op.collection, op.id!)
        
        switch (op.type) {
          case 'create':
            batch.set(docRef, { ...op.data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
            break
          case 'update':
            batch.update(docRef, { ...op.data, updatedAt: serverTimestamp() })
            break
          case 'delete':
            batch.delete(docRef)
            break
        }
      })
      
      await batch.commit()
    } catch (error: any) {
      throw new Error(`Batch write failed: ${error.message}`)
    }
  },

  // Transaction operations
  runTransaction: async <T>(
    updateFunction: (transaction: any) => Promise<T>
  ): Promise<T> => {
    try {
      return await runTransaction(db, updateFunction)
    } catch (error: any) {
      throw new Error(`Transaction failed: ${error.message}`)
    }
  }
}

// Storage Helpers
export const storageHelpers = {
  // Upload file
  uploadFile: async (
    path: string,
    file: File | Blob,
    metadata?: any
  ): Promise<string> => {
    try {
      const storageRef = ref(storage, path)
      const snapshot = await uploadBytes(storageRef, file, metadata)
      return await getDownloadURL(snapshot.ref)
    } catch (error: any) {
      throw new Error(`File upload failed: ${error.message}`)
    }
  },

  // Upload string data
  uploadString: async (
    path: string,
    data: string,
    format: 'raw' | 'base64' | 'base64url' | 'data_url' = 'raw'
  ): Promise<string> => {
    try {
      const storageRef = ref(storage, path)
      const snapshot = await uploadString(storageRef, data, format)
      return await getDownloadURL(snapshot.ref)
    } catch (error: any) {
      throw new Error(`String upload failed: ${error.message}`)
    }
  },

  // Get download URL
  getDownloadURL: async (path: string): Promise<string> => {
    try {
      const storageRef = ref(storage, path)
      return await getDownloadURL(storageRef)
    } catch (error: any) {
      throw new Error(`Failed to get download URL: ${error.message}`)
    }
  },

  // Delete file
  deleteFile: async (path: string): Promise<void> => {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (error: any) {
      throw new Error(`File deletion failed: ${error.message}`)
    }
  },

  // List files in directory
  listFiles: async (path: string): Promise<string[]> => {
    try {
      const storageRef = ref(storage, path)
      const result = await listAll(storageRef)
      return result.items.map(item => item.fullPath)
    } catch (error: any) {
      throw new Error(`Failed to list files: ${error.message}`)
    }
  },

  // Get file metadata
  getMetadata: async (path: string): Promise<any> => {
    try {
      const storageRef = ref(storage, path)
      return await getMetadata(storageRef)
    } catch (error: any) {
      throw new Error(`Failed to get metadata: ${error.message}`)
    }
  }
}

// Common query helpers
export const queryHelpers = {
  whereEqual: (field: string, value: any) => where(field, '==', value),
  whereNotEqual: (field: string, value: any) => where(field, '!=', value),
  whereGreaterThan: (field: string, value: any) => where(field, '>', value),
  whereLessThan: (field: string, value: any) => where(field, '<', value),
  whereGreaterThanOrEqual: (field: string, value: any) => where(field, '>=', value),
  whereLessThanOrEqual: (field: string, value: any) => where(field, '<=', value),
  whereIn: (field: string, values: any[]) => where(field, 'in', values),
  whereNotIn: (field: string, values: any[]) => where(field, 'not-in', values),
  whereArrayContains: (field: string, value: any) => where(field, 'array-contains', value),
  whereArrayContainsAny: (field: string, values: any[]) => where(field, 'array-contains-any', values),
  orderByField: (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction),
  limitResults: (count: number) => limit(count)
}

// Export all helpers
export default {
  auth: authHelpers,
  firestore: firestoreHelpers,
  storage: storageHelpers,
  query: queryHelpers
}
