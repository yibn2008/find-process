#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Setting executable permissions for bin files...')

const binDirs = [
  path.join(__dirname, '../dist/cjs/bin'),
  path.join(__dirname, '../dist/esm/bin')
]

binDirs.forEach(binDir => {
  if (fs.existsSync(binDir)) {
    try {
      // Add executable permission to all .js files in bin directory
      execSync(`chmod +x ${binDir}/*.js`, { stdio: 'inherit' })
      console.log(`✅ Executable permissions set for ${binDir}`)
    } catch (error) {
      console.error(`❌ Failed to set executable permissions for ${binDir}:`, error.message)
      process.exit(1)
    }
  }
})

// Add package.json with type: module to dist/esm
const esmDir = path.join(__dirname, '../dist/esm')
if (fs.existsSync(esmDir)) {
  const pkgPath = path.join(esmDir, 'package.json')
  fs.writeFileSync(pkgPath, JSON.stringify({ type: 'module' }, null, 2))
  console.log('✅ Created package.json in dist/esm')

  // Fix ESM imports: add .js extension
  const addExtension = (dir) => {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        addExtension(filePath)
      } else if (file.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8')
        // Replace: import ... from './...' or export ... from './...'
        // But ignore if it already ends with .js
        content = content.replace(/(from\s+['"])([./][^'"]+)(['"])/g, (match, p1, p2, p3) => {
          if (p2.endsWith('.js')) return match
          return `${p1}${p2}.js${p3}`
        })
        fs.writeFileSync(filePath, content)
      }
    })
  }

  try {
    console.log('🔧 Fixing ESM import extensions...')
    addExtension(esmDir)
    console.log('✅ ESM import extensions fixed')
  } catch (error) {
    console.error('❌ Failed to fix ESM extensions:', error.message)
    process.exit(1)
  }

  // Patch bin/find-process.js to look for package.json one level up (due to cjs/esm nesting)
  // src/bin -> ../../package.json
  // dist/cjs/bin -> ../../../package.json
  binDirs.forEach(binDir => {
    const binFile = path.join(binDir, 'find-process.js')
    if (fs.existsSync(binFile)) {
      try {
        let content = fs.readFileSync(binFile, 'utf8')
        // Replace ../../package.json with ../../../package.json
        // Matches require("../../package.json") or import ... from "../../package.json"
        content = content.replace(/(\.\.\/){2}package\.json/g, '../../../package.json')
        fs.writeFileSync(binFile, content)
        console.log(`✅ Patched package.json path in ${binFile}`)
      } catch (error) {
        console.error(`❌ Failed to patch bin file ${binFile}:`, error.message)
      }
    }
  })
}
