import { NextRequest, NextResponse } from 'next/server'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { initializeApp } from 'firebase/app'

// Firebase configuration (using the same config as your main app)
const firebaseConfig = {
  apiKey: "AIzaSyAWqqER23AD3MQULm3jXrzsV4gmAZtyZ64",
  authDomain: "eoxsplore.firebaseapp.com",
  projectId: "eoxsplore",
  storageBucket: "eoxsplore.firebasestorage.app",
  messagingSenderId: "96095788161",
  appId: "1:96095788161:web:b4d6832ef6b7e0a53c4180",
  measurementId: "G-8K9G7MG19S"
}

// Initialize Firebase for this API route
const app = initializeApp(firebaseConfig, 'upload-api')
const storage = getStorage(app)

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Testing Firebase Storage upload...")
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 })
    }
    
    console.log("📁 File:", file.name, "Size:", file.size, "Type:", file.type)
    
    // Create a unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const storageRef = ref(storage, `videos/${fileName}`)
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    console.log("📤 Uploading to Firebase Storage...")
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type
    })
    
    console.log("✅ Upload successful, getting download URL...")
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    console.log("🔗 Download URL:", downloadURL)
    
    return NextResponse.json({ 
      success: true, 
      message: "Firebase Storage upload successful",
      data: {
        secure_url: downloadURL,
        public_id: fileName,
        original_filename: file.name
      }
    })
    
  } catch (error) {
    console.error("❌ Firebase Storage upload error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
