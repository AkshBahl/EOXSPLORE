#!/bin/bash

# Aggressive Firebase cache clearing script
echo "🧹 AGGRESSIVE Firebase cache clearing..."

# Stop any running development server
echo "Stopping development server..."
pkill -f "next dev" || true
pkill -f "npm run dev" || true

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Clear node_modules and reinstall (optional but recommended)
echo "Clearing node_modules and reinstalling..."
rm -rf node_modules
rm -rf package-lock.json
npm install

# Clear any potential Firebase cache files
echo "Clearing potential Firebase cache files..."
find . -name "*.firebase*" -delete 2>/dev/null || true
find . -name "firebase-debug.log" -delete 2>/dev/null || true

# Clear browser data instructions
echo ""
echo "🌐 CRITICAL: Clear your browser data completely:"
echo ""
echo "Chrome:"
echo "  1. Open DevTools (F12)"
echo "  2. Right-click refresh button → 'Empty Cache and Hard Reload'"
echo "  3. Go to Application tab → Storage → Clear storage"
echo "  4. Or: Settings → Privacy → Clear browsing data"
echo ""
echo "Firefox:"
echo "  1. Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "  2. Select 'Everything' and 'All time'"
echo "  3. Check all boxes and clear"
echo ""
echo "Safari:"
echo "  1. Cmd+Option+E"
echo "  2. Select 'All history' and clear"
echo "  3. Safari → Preferences → Privacy → Manage Website Data → Remove All"
echo ""

# Wait for user confirmation
read -p "Press Enter after clearing browser cache..."

# Start development server
echo "🚀 Starting development server with fresh Firebase configuration..."
npm run dev
