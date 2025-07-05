#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Setting executable permissions for bin files...')

const binDir = path.join(__dirname, '../dist/bin')

if (fs.existsSync(binDir)) {
  try {
    // 给 dist/bin 目录下的所有 .js 文件添加执行权限
    execSync(`chmod +x ${binDir}/*.js`, { stdio: 'inherit' })
    console.log('✅ Executable permissions set for bin files')
  } catch (error) {
    console.error('❌ Failed to set executable permissions:', error.message)
    process.exit(1)
  }
} else {
  console.log('⚠️  No bin directory found, skipping permission setting')
}
