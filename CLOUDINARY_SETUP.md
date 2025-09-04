# Cloudinary Setup Guide

## 🔧 **Cloudinary Configuration Required**

To fix the video upload issue, you need to set up Cloudinary properly. Here's how:

### **Step 1: Create a Cloudinary Account**
1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email

### **Step 2: Get Your Cloudinary Credentials**
1. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Note down your **Cloud Name** (shown at the top)
3. Go to **Settings > Access Keys** to get your **API Key** and **API Secret**

### **Step 3: Create an Upload Preset**
1. In your Cloudinary dashboard, go to **Settings > Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set **Signing Mode** to **Unsigned** (for client-side uploads)
5. Set **Folder** to `videos` (optional)
6. Save the preset and note down the **Preset name**

### **Step 4: Create Environment File**
Create a file called `.env.local` in your project root with:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### **Step 5: Restart Development Server**
```bash
npm run dev
```

## 🚀 **Alternative: Use Firebase Storage**

If you prefer to use Firebase Storage instead of Cloudinary:

1. Update `app/cloudinary-config.ts` to use Firebase Storage
2. Update the upload logic in `app/admin-dashboard/upload/page.tsx`
3. Use Firebase Storage SDK for uploads

## 🔍 **Current Issue**
The current error is: `"Unknown API key"` which means the Cloudinary credentials are not properly configured.

## 📝 **Next Steps**
1. Set up Cloudinary account and get credentials
2. Create `.env.local` file with proper credentials
3. Restart the development server
4. Test video upload functionality

## 🆘 **Need Help?**
- Cloudinary Documentation: https://cloudinary.com/documentation
- Firebase Storage Alternative: https://firebase.google.com/docs/storage
