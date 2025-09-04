// Cloudinary Configuration
export const cloudinaryConfig = {
  cloudName: '696641831439771',
  uploadPreset: 'eoxsDemoTool',
  apiKey: '696641831439771'
}

export const getCloudinaryUrl = (publicId: string, resourceType: 'image' | 'video' = 'video') => {
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/${resourceType}/upload/${publicId}.jpg`
}

export const getUploadUrl = (resourceType: 'image' | 'video' = 'video') => {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`
}
