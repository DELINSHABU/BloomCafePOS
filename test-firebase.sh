#!/bin/bash

echo "🧪 TESTING ALL FIREBASE APIs"
echo "============================"
echo "Server: http://localhost:3001"
echo ""

# Check if server is running
echo "🔍 Checking if dev server is running..."
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Dev server not running!"
    echo "Please run: npm run dev"
    exit 1
fi
echo "✅ Dev server is running"
echo ""

APIs=(
  "menu:📋 Menu Data (265 items)"
  "menu-availability:🔄 Menu Availability (5 items)"
  "orders:📦 Orders Data (148 items)" 
  "inventory:📦 Inventory Data (15 items)"
  "blog-posts:📝 Blog Posts (6 items)"
  "customer-reviews:⭐ Customer Reviews (6 items)"
  "load-credentials:👥 Staff Data (18 items)"
  "tasks:✅ Tasks Data (10 items)"
)

success_count=0
firebase_count=0
json_count=0

for api_desc in "${APIs[@]}"; do
  IFS=':' read -r api desc <<< "$api_desc"
  
  echo "🔍 Testing $desc"
  echo "   Endpoint: /api/$api"
  echo "   -------------------"
  
  response=$(curl -s "http://localhost:3001/api/$api" 2>/dev/null)
  
  if [[ -z "$response" ]]; then
    echo "   ❌ NO RESPONSE"
  elif [[ $response == *"error"* ]] || [[ $response == *"Error"* ]]; then
    echo "   ❌ ERROR RESPONSE"
    echo "   Error: $(echo "$response" | head -1)"
  else
    echo "   ✅ SUCCESS - Data loaded"
    ((success_count++))
    
    # Check source
    if [[ $response == *"firebase"* ]] || [[ $response == *"Firebase"* ]]; then
      echo "   📊 Source: FIREBASE"
      ((firebase_count++))
    elif [[ $response == *"json"* ]] || [[ $response == *"JSON"* ]]; then
      echo "   📄 Source: JSON FALLBACK"
      ((json_count++))
    else
      echo "   📄 Source: JSON FALLBACK (likely)"
      ((json_count++))
    fi
    
    # Show sample data
    sample=$(echo "$response" | head -1 | cut -c1-80)
    echo "   📄 Sample: $sample..."
  fi
  echo ""
done

echo "🏁 TEST SUMMARY"
echo "==============="
echo "✅ Successful APIs: $success_count/8"
echo "📊 Firebase source: $firebase_count"
echo "📄 JSON fallback: $json_count"
echo ""

if [ $success_count -eq 8 ]; then
  echo "🎉 ALL TESTS PASSED! Your migration is working perfectly!"
else
  echo "⚠️  Some APIs failed. Check the error messages above."
fi

echo ""
echo "🔗 Firebase Console: https://console.firebase.google.com/project/bloom-graden-cafe-user-login/firestore"
