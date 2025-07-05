#!/usr/bin/env node

const fs = require('fs')
const { execSync } = require('child_process')

// 读取 package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const version = packageJson.version
const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

console.log(`📝 Updating HISTORY.md for version ${version}`)

// 读取现有的 HISTORY.md
let historyContent = ''
try {
  historyContent = fs.readFileSync('HISTORY.md', 'utf8')
} catch (error) {
  // 如果文件不存在，创建新的
  historyContent = '# History\n\n'
}

// 检查是否已经包含当前版本
const versionPattern = new RegExp(`## ${version.replace(/\./g, '\\.')}`, 'i')
if (versionPattern.test(historyContent)) {
  console.log(`✅ HISTORY.md already contains version ${version}`)
  process.exit(0)
}

// 获取最近的 git commits（从上一个 tag 开始）
let commits = []
try {
  const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim()
  commits = execSync(`git log ${lastTag}..HEAD --oneline --no-merges`, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(line => line.trim())
} catch (error) {
  // 如果没有 tag，获取所有 commits
  commits = execSync('git log --oneline --no-merges', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(line => line.trim())
    .slice(0, 10) // 只取最近10个
}

// 生成 changelog 内容
const changelogEntry = `## ${version} (${today})

${commits.map(commit => `- ${commit}`).join('\n')}

`

// 在文件开头插入新版本
const lines = historyContent.split('\n')
const insertIndex = lines.findIndex(line => line.startsWith('## '))
if (insertIndex !== -1) {
  lines.splice(insertIndex, 0, changelogEntry.trim())
} else {
  lines.unshift(changelogEntry.trim())
}

// 写回文件
fs.writeFileSync('HISTORY.md', lines.join('\n'))

console.log(`✅ Updated HISTORY.md with version ${version}`)
console.log(`📋 Added ${commits.length} commits to changelog`)
