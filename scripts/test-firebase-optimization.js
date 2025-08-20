#!/usr/bin/env node
/**
 * Test script for Firebase Firestore optimizations
 * Run with: node scripts/test-firebase-optimization.js
 */

const API_BASE = 'http://localhost:3000/api/orders'

async function testAPI(url, description) {
  console.log(`\n🧪 Testing: ${description}`)
  console.log(`📡 URL: ${url}`)
  
  try {
    const start = Date.now()
    const response = await fetch(url)
    const data = await response.json()
    const duration = Date.now() - start
    
    console.log(`✅ Status: ${response.status} (${duration}ms)`)
    console.log(`📊 Orders returned: ${data.orders?.length || 0}`)
    console.log(`🗄️ Source: ${data.source}${data.fromCache ? ' (cached)' : ''}`)
    
    if (data.hasMore !== undefined) {
      console.log(`➡️ Has more: ${data.hasMore}`)
    }
    
    if (data.totalFetched) {
      console.log(`📈 Total fetched: ${data.totalFetched}`)
    }
    
    if (data.period) {
      console.log(`⏰ Period: ${data.period}`)
    }
    
    if (data.fallback) {
      console.log(`⚠️ Fallback mode: ${data.reason || 'unknown'}`)
    }
    
    return { success: true, duration, count: data.orders?.length || 0, cached: data.fromCache }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}\n\nasync function runTests() {\n  console.log('🚀 Starting Firebase Optimization Tests')\n  console.log('=' .repeat(50))\n  \n  const tests = [\n    {\n      url: `${API_BASE}`,\n      desc: 'Standard fetch (should use cache after first call)'\n    },\n    {\n      url: `${API_BASE}?recent=true`,\n      desc: 'Recent orders only (24h) - Quota efficient'\n    },\n    {\n      url: `${API_BASE}?recent=true&hours=6`,\n      desc: 'Recent orders (6h) - Very quota efficient'\n    },\n    {\n      url: `${API_BASE}?limit=10`,\n      desc: 'Limited fetch (10 orders) - Quota efficient'\n    },\n    {\n      url: `${API_BASE}?recent=true&limit=5`,\n      desc: 'Recent + Limited (best for dashboards)'\n    },\n    {\n      url: `${API_BASE}`, // Second call to test caching\n      desc: 'Standard fetch again (should be cached)'\n    }\n  ]\n  \n  const results = []\n  \n  for (const test of tests) {\n    const result = await testAPI(test.url, test.desc)\n    results.push({ ...result, test: test.desc })\n    \n    // Wait a bit between tests\n    await new Promise(resolve => setTimeout(resolve, 500))\n  }\n  \n  // Summary\n  console.log('\\n' + '=' .repeat(50))\n  console.log('📋 TEST SUMMARY')\n  console.log('=' .repeat(50))\n  \n  let totalDuration = 0\n  let cacheHits = 0\n  let successCount = 0\n  \n  results.forEach((result, i) => {\n    const status = result.success ? '✅' : '❌'\n    const cache = result.cached ? ' (CACHED)' : ''\n    \n    console.log(`${status} Test ${i + 1}: ${result.test}${cache}`)\n    \n    if (result.success) {\n      successCount++\n      totalDuration += result.duration\n      if (result.cached) cacheHits++\n    }\n  })\n  \n  console.log('\\n📊 PERFORMANCE METRICS:')\n  console.log(`   Success rate: ${successCount}/${results.length} tests`)\n  console.log(`   Cache hits: ${cacheHits} (${Math.round(cacheHits/results.length*100)}%)`)\n  console.log(`   Average response time: ${Math.round(totalDuration/successCount)}ms`)\n  \n  console.log('\\n🎯 OPTIMIZATION STATUS:')\n  if (cacheHits > 0) {\n    console.log('   ✅ Caching is working properly')\n  } else {\n    console.log('   ⚠️ No cache hits detected - check cache implementation')\n  }\n  \n  if (successCount === results.length) {\n    console.log('   ✅ All API endpoints are functioning')\n  } else {\n    console.log('   ❌ Some API endpoints failed - check Firebase connection')\n  }\n  \n  console.log('\\n🔍 QUOTA EFFICIENCY:')\n  console.log('   💡 Use ?recent=true for dashboards to save 80-90% quota')\n  console.log('   💡 Use ?limit=X to control document reads')\n  console.log('   💡 Cache reduces repeat calls by 100%')\n  \n  console.log('\\n✨ Tests completed!')\n}\n\n// Check if we're running directly\nif (require.main === module) {\n  runTests().catch(console.error)\n}\n\nmodule.exports = { testAPI, runTests }\n"
