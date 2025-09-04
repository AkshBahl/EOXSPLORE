#!/bin/bash

# Clear Firebase cache and restart development server
echo "🧹 Clearing Firebase cache and restarting development server..."

# Stop any running development server
echo "Stopping development server..."
pkill -f "next dev" || true

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Clear node_modules (optional - uncomment if needed)
# echo "Clearing node_modules..."
# rm -rf node_modules
# npm install

# Clear browser cache instructions
echo ""
echo "🌐 Please also clear your browser cache:"
echo "   - Chrome: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "   - Firefox: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "   - Safari: Cmd+Option+E"
echo ""
echo "   Make sure to clear:"
echo "   - Cached images and files"
echo "   - Application data"
echo "   - Local storage"
echo ""

# Start development server
echo "🚀 Starting development server with new Firebase configuration..."
npm run dev
