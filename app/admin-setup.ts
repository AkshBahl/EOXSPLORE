// Admin Account Setup Script
// This script will create an admin account in Firebase Authentication and Firestore

import { authHelpers, firestoreHelpers } from './firebase-helpers'
import { db } from '@/firebase'
import { doc, serverTimestamp } from 'firebase/firestore'

export const createAdminAccount = async () => {
  const email = "admin@gmail.com"
  const password = "123456789"
  const name = "Admin User"
  
  try {
    console.log("🔧 Creating admin account...")
    
    // 1. Create user in Firebase Authentication
    const userCredential = await authHelpers.signUp(email, password)
    const userId = userCredential.user.uid
    console.log(`✅ Admin user created in Authentication: ${email} (UID: ${userId})`)

    // 2. Create user document in Firestore with 'admin' role
    const userDocRef = doc(db, "users", userId)
    await firestoreHelpers.createWithId("users", userId, {
      userId: userId,
      email: email,
      name: name,
      phoneCountryCode: "+91",
      phoneNumber: "0000000000",
      createdAt: serverTimestamp(),
      accountCreatedAt: userCredential.user.metadata.creationTime || null,
      role: "admin", // Set the role to admin
    })
    
    console.log(`✅ Admin user document created in Firestore for ${email}`)
    console.log("🎉 Admin account setup complete!")
    
    return { 
      success: true, 
      userId: userId,
      email: email,
      message: "Admin account created successfully" 
    }
    
  } catch (error: any) {
    console.error("❌ Error creating admin account:", error)
    
    // If user already exists, try to update the role
    if (error.message.includes("email-already-in-use")) {
      console.log("⚠️ User already exists, attempting to update role...")
      try {
        // Sign in to get the user
        const signInResult = await authHelpers.signIn(email, password)
        const userId = signInResult.user.uid
        
        // Update the user document to set role as admin
        await firestoreHelpers.update("users", userId, {
          role: "admin",
          updatedAt: serverTimestamp()
        })
        
        console.log("✅ Existing user role updated to admin")
        return { 
          success: true, 
          userId: userId,
          email: email,
          message: "Existing user role updated to admin" 
        }
        
      } catch (updateError: any) {
        console.error("❌ Error updating existing user:", updateError)
        return { 
          success: false, 
          error: updateError.message,
          message: "Failed to update existing user role" 
        }
      }
    }
    
    return { 
      success: false, 
      error: error.message,
      message: "Failed to create admin account" 
    }
  }
}

// Export for use in other files
export default createAdminAccount
