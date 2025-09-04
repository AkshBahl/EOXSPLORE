#!/bin/bash

# Admin Account Setup Script
# This script will create an admin account in Firebase

echo "🔧 Setting up admin account for Firebase..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Create a temporary script to run the admin setup
cat > temp-admin-setup.js << 'EOF'
// Temporary admin setup script
const { createRequire } = require('module');
const require = createRequire(import.meta.url);

// Import the admin setup function
import('./app/admin-setup.ts').then(async (module) => {
  try {
    console.log("🚀 Starting admin account creation...");
    const result = await module.createAdminAccount();
    
    if (result.success) {
      console.log("✅ SUCCESS: Admin account created/updated!");
      console.log(`📧 Email: ${result.email}`);
      console.log(`🆔 User ID: ${result.userId}`);
      console.log(`💬 Message: ${result.message}`);
    } else {
      console.log("❌ FAILED: Admin account creation failed!");
      console.log(`💬 Error: ${result.error}`);
      console.log(`💬 Message: ${result.message}`);
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
  
  // Exit the process
  process.exit(0);
}).catch(error => {
  console.error("❌ Error importing admin setup module:", error);
  process.exit(1);
});
EOF

# Run the admin setup
echo "📝 Running admin account creation..."
node temp-admin-setup.js

# Clean up temporary file
rm -f temp-admin-setup.js

echo "🏁 Admin setup script completed!"
