#!/usr/bin/env node
/**
 * Scan codebase for Firebase optimization opportunities
 * Run with: node scripts/find-optimization-opportunities.js
 */

const fs = require('fs')
const path = require('path')

// File extensions to scan
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']

// Patterns that indicate inefficient Firebase usage
const INEFFICIENT_PATTERNS = [
  {
    pattern: /fetch\s*\(\s*['"`]\/api\/orders['"`]\s*\)/g,
    issue: 'Standard fetch without parameters',
    suggestion: 'Add ?recent=true or ?limit=X for efficiency',
    severity: 'medium'
  },
  {
    pattern: /\.get\(\)\s*$/gm,
    issue: 'Firestore .get() without limit',
    suggestion: 'Add .limit(50) to reduce reads',
    severity: 'high'
  },
  {
    pattern: /collection\s*\(\s*['"`]orders['"`]\s*\)\s*\.orderBy/g,
    issue: 'Direct Firebase collection query',
    suggestion: 'Use API endpoint with parameters instead',
    severity: 'high'
  },
  {
    pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*{[^}]*fetch[^}]*\/api\/orders/gs,
    issue: 'useEffect fetching all orders',
    suggestion: 'Consider using ?recent=true for dashboards',
    severity: 'medium'
  }
]

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const issues = []
    
    INEFFICIENT_PATTERNS.forEach(({ pattern, issue, suggestion, severity }) => {
      const matches = [...content.matchAll(pattern)]
      matches.forEach(match => {
        const lines = content.substring(0, match.index).split('\\n')
        const lineNumber = lines.length
        const lineContent = lines[lines.length - 1] + content.substring(match.index, match.index + 50)
        
        issues.push({
          file: filePath,
          line: lineNumber,
          issue,
          suggestion,
          severity,
          code: lineContent.trim(),
          match: match[0]
        })
      })
    })
    
    return issues
  } catch (error) {
    console.warn(`Could not read ${filePath}: ${error.message}`)
    return []
  }
}

function scanDirectory(dir, issues = []) {
  try {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)\n      const stat = fs.statSync(fullPath)\n      \n      if (stat.isDirectory()) {\n        // Skip node_modules and .git\n        if (!['node_modules', '.git', '.next', 'dist'].includes(item)) {\n          scanDirectory(fullPath, issues)\n        }\n      } else if (stat.isFile() && FILE_EXTENSIONS.some(ext => fullPath.endsWith(ext))) {\n        const fileIssues = scanFile(fullPath)\n        issues.push(...fileIssues)\n      }\n    }\n  } catch (error) {\n    console.warn(`Could not scan directory ${dir}: ${error.message}`)\n  }\n  \n  return issues\n}\n\nfunction printReport(issues) {\n  console.log('🔍 Firebase Optimization Opportunities')\n  console.log('=' .repeat(60))\n  \n  if (issues.length === 0) {\n    console.log('✅ No optimization opportunities found!')\n    console.log('   Your codebase appears to be using efficient patterns.')\n    return\n  }\n  \n  // Group by severity\n  const bySeverity = {\n    high: issues.filter(i => i.severity === 'high'),\n    medium: issues.filter(i => i.severity === 'medium'),\n    low: issues.filter(i => i.severity === 'low')\n  }\n  \n  const severityEmoji = {\n    high: '🔴',\n    medium: '🟡',\n    low: '🟢'\n  }\n  \n  Object.entries(bySeverity).forEach(([severity, severeIssues]) => {\n    if (severeIssues.length === 0) return\n    \n    console.log(`\\n${severityEmoji[severity]} ${severity.toUpperCase()} PRIORITY (${severeIssues.length} issues)`)\n    console.log('-' .repeat(40))\n    \n    severeIssues.forEach((issue, index) => {\n      console.log(`\\n${index + 1}. ${issue.issue}`)\n      console.log(`   📁 File: ${issue.file}:${issue.line}`)\n      console.log(`   📝 Code: ${issue.code}`)\n      console.log(`   💡 Suggestion: ${issue.suggestion}`)\n    })\n  })\n  \n  // Summary and recommendations\n  console.log('\\n' + '=' .repeat(60))\n  console.log('📊 SUMMARY & RECOMMENDATIONS')\n  console.log('=' .repeat(60))\n  \n  console.log(`\\nTotal issues found: ${issues.length}`)\n  console.log(`  🔴 High priority: ${bySeverity.high.length}`)\n  console.log(`  🟡 Medium priority: ${bySeverity.medium.length}`)\n  console.log(`  🟢 Low priority: ${bySeverity.low.length}`)\n  \n  console.log('\\n🚀 QUICK WINS:')\n  console.log('   1. Replace fetch(\"/api/orders\") with fetch(\"/api/orders?recent=true\")')\n  console.log('   2. Add limit parameters: ?limit=20')\n  console.log('   3. Use recent data for dashboards: ?recent=true&hours=6')\n  console.log('   4. Remove direct Firebase collection queries from components')\n  \n  console.log('\\n📖 DETAILED GUIDE:')\n  console.log('   See FIREBASE_OPTIMIZATION.md for complete implementation guide')\n  \n  console.log('\\n🧪 TESTING:')\n  console.log('   Run: node scripts/test-firebase-optimization.js')\n}\n\nfunction main() {\n  const startDir = process.argv[2] || '.'\n  \n  console.log(`📁 Scanning ${path.resolve(startDir)} for optimization opportunities...`)\n  console.log()\n  \n  const issues = scanDirectory(startDir)\n  printReport(issues)\n  \n  console.log('\\n✨ Scan completed!')\n}\n\n// Check if we're running directly\nif (require.main === module) {\n  main()\n}\n\nmodule.exports = { scanFile, scanDirectory, INEFFICIENT_PATTERNS }"
