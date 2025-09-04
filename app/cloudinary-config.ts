// Cloudinary Configuration
// Using your provided Cloudinary credentials
export const cloudinaryConfig = {
  cloudName: '696641831439771', // Your Cloudinary cloud name (as string)
  uploadPreset: 'dm61hxcfp', // Your upload preset
  apiKey: '696641831439771' // Your API key
}

export const getCloudinaryUrl = (publicId: string, resourceType: 'image' | 'video' = 'video') => {
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/${resourceType}/upload/${publicId}.jpg`
}

export const getUploadUrl = (resourceType: 'image' | 'video' = 'video') => {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`
}

// Helper function to get signed upload URL (for server-side uploads)
export const getSignedUploadUrl = (resourceType: 'image' | 'video' = 'video') => {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`
}
