// Example usage of Firebase Helpers
// This file demonstrates how to use the latest Firebase SDK patterns

import { authHelpers, firestoreHelpers, storageHelpers, queryHelpers } from './firebase-helpers'
import { doc } from 'firebase/firestore'
import { db } from '@/firebase'

// Example: User Authentication
export const userAuthExample = async () => {
  try {
    // Sign up a new user
    const userCredential = await authHelpers.signUp('user@example.com', 'password123')
    console.log('User created:', userCredential.user.uid)
    
    // Sign in
    const signInResult = await authHelpers.signIn('user@example.com', 'password123')
    console.log('User signed in:', signInResult.user.email)
    
    // Update profile
    await authHelpers.updateProfile('John Doe', 'https://example.com/avatar.jpg')
    
    // Listen to auth state changes
    const unsubscribe = authHelpers.onAuthStateChange((user) => {
      if (user) {
        console.log('User is signed in:', user.email)
      } else {
        console.log('User is signed out')
      }
    })
    
    // Clean up listener
    unsubscribe()
    
  } catch (error) {
    console.error('Auth error:', error)
  }
}

// Example: Firestore Operations
export const firestoreExample = async () => {
  try {
    // Create a document
    const docId = await firestoreHelpers.create('users', {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    })
    console.log('Document created with ID:', docId)
    
    // Read a document
    const user = await firestoreHelpers.read('users', docId)
    console.log('User data:', user)
    
    // Update a document
    await firestoreHelpers.update('users', docId, { age: 31 })
    
    // Query documents
    const users = await firestoreHelpers.query('users', [
      queryHelpers.whereEqual('age', 30),
      queryHelpers.orderByField('name', 'asc'),
      queryHelpers.limitResults(10)
    ])
    console.log('Users aged 30:', users)
    
    // Listen to real-time updates
    const unsubscribe = firestoreHelpers.onCollection('users', [
      queryHelpers.whereEqual('age', 30)
    ], (users) => {
      console.log('Real-time users update:', users)
    })
    
    // Clean up listener
    unsubscribe()
    
  } catch (error) {
    console.error('Firestore error:', error)
  }
}

// Example: Storage Operations
export const storageExample = async () => {
  try {
    // Upload a file
    const file = new File(['Hello World'], 'test.txt', { type: 'text/plain' })
    const downloadURL = await storageHelpers.uploadFile('uploads/test.txt', file)
    console.log('File uploaded:', downloadURL)
    
    // Get file metadata
    const metadata = await storageHelpers.getMetadata('uploads/test.txt')
    console.log('File metadata:', metadata)
    
    // List files in directory
    const files = await storageHelpers.listFiles('uploads/')
    console.log('Files in uploads:', files)
    
    // Delete file
    await storageHelpers.deleteFile('uploads/test.txt')
    console.log('File deleted')
    
  } catch (error) {
    console.error('Storage error:', error)
  }
}

// Example: Batch Operations
export const batchExample = async () => {
  try {
    await firestoreHelpers.batchWrite([
      {
        type: 'create',
        collection: 'users',
        id: 'user1',
        data: { name: 'Alice', email: 'alice@example.com' }
      },
      {
        type: 'create',
        collection: 'users',
        id: 'user2',
        data: { name: 'Bob', email: 'bob@example.com' }
      },
      {
        type: 'update',
        collection: 'users',
        id: 'user1',
        data: { verified: true }
      }
    ])
    console.log('Batch operations completed')
    
  } catch (error) {
    console.error('Batch error:', error)
  }
}

// Example: Transaction Operations
export const transactionExample = async () => {
  try {
    const result = await firestoreHelpers.runTransaction(async (transaction) => {
      // Read a document
      const userRef = doc(db, 'users', 'user1')
      const userDoc = await transaction.get(userRef)
      
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }
      
      // Update the document
      transaction.update(userRef, { 
        lastTransaction: new Date(),
        balance: (userDoc.data().balance || 0) + 100
      })
      
      return { success: true, newBalance: (userDoc.data().balance || 0) + 100 }
    })
    
    console.log('Transaction result:', result)
    
  } catch (error) {
    console.error('Transaction error:', error)
  }
}
