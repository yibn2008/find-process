#!/usr/bin/env node

const fs = require('fs')
const { execSync } = require('child_process')

// 读取 package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const version = packageJson.version

console.log(`🔍 Checking version: ${version}`)

// 检查 git tag
try {
  const gitTags = execSync('git tag --list', { encoding: 'utf8' }).trim().split('\n')
  const versionTag = `${version}`

  if (gitTags.includes(versionTag)) {
    console.log(`✅ Git tag ${versionTag} exists`)
  } else {
    console.error(`❌ Git tag ${versionTag} not found!`)
    console.error('Please create the tag with: git tag ' + versionTag)
    process.exit(1)
  }
} catch (error) {
  console.error('❌ Failed to check git tags:', error.message)
  process.exit(1)
}

// 检查 HISTORY.md 是否包含当前版本
try {
  const historyContent = fs.readFileSync('HISTORY.md', 'utf8')
  const versionPattern = new RegExp(`## ${version.replace(/\./g, '\\.')}`, 'i')

  if (versionPattern.test(historyContent)) {
    console.log(`✅ HISTORY.md contains version ${version}`)
  } else {
    console.error(`❌ HISTORY.md does not contain version ${version}!`)
    console.error('Please add a changelog entry for this version')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ Failed to read HISTORY.md:', error.message)
  process.exit(1)
}

// 检查是否有未提交的更改
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim()
  if (gitStatus) {
    console.error('❌ There are uncommitted changes!')
    console.error('Please commit all changes before publishing')
    process.exit(1)
  } else {
    console.log('✅ No uncommitted changes')
  }
} catch (error) {
  console.error('❌ Failed to check git status:', error.message)
  process.exit(1)
}

console.log('🎉 All version checks passed!')
