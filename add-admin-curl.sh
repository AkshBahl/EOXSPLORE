#!/bin/bash

# Simple command to add admin account
echo "🔧 Adding admin account to Firebase..."

# Make sure the development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Development server is not running. Please start it with 'npm run dev' first."
    exit 1
fi

# Call the admin setup API
echo "📝 Creating admin account..."
curl -X POST http://localhost:3000/api/admin-setup \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq '.'

echo "🏁 Admin setup completed!"
