# Cloudinary Credentials Verification

## 🔍 **Current Issue**
The error "Unknown API key" suggests that the Cloudinary credentials are not in the correct format.

## 📋 **What You Need to Check**

### **1. Cloud Name Format**
- Cloudinary cloud names are typically strings like: `"my-cloud-name"`, `"demo123"`, `"eoxsplore"`
- They are NOT just numbers like `"696641831439771"`

### **2. API Key**
- API keys are different from cloud names
- They are usually longer alphanumeric strings

### **3. Upload Preset**
- Upload presets are created in your Cloudinary dashboard
- They should be strings like: `"my_upload_preset"`, `"eoxsDemoTool"`

## 🔧 **How to Get Correct Credentials**

1. **Go to your Cloudinary Dashboard**: https://cloudinary.com/console
2. **Check the top of the dashboard** - your Cloud Name is displayed there
3. **Go to Settings > Access Keys** - get your API Key and API Secret
4. **Go to Settings > Upload** - create or check your Upload Preset

## 📝 **Example of Correct Format**

```javascript
export const cloudinaryConfig = {
  cloudName: 'your-actual-cloud-name', // e.g., 'eoxsplore', 'demo123'
  uploadPreset: 'your-upload-preset', // e.g., 'eoxsDemoTool', 'my_preset'
  apiKey: 'your-api-key' // e.g., '123456789012345'
}
```

## 🚨 **Current Configuration Issue**

Your current config:
```javascript
cloudName: '696641831439771', // This looks like an API key, not a cloud name
uploadPreset: 'dm61hxcfp', // This might be correct
apiKey: '696641831439771' // This is the same as cloud name
```

## ✅ **Next Steps**

1. **Verify your Cloudinary credentials** in your dashboard
2. **Update the configuration** with the correct values
3. **Test the upload** again

## 🆘 **Need Help?**

- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Documentation**: https://cloudinary.com/documentation
- **Support**: https://support.cloudinary.com/
