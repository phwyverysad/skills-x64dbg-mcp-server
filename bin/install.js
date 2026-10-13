#!/usr/bin/env node

/**
 * Installer script for skills-x64dbg-mcp-server
 * Installs SKILL.md into Antigravity, Claude Code, and agent skill directories.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('======================================================');
console.log('  x64dbg-MCP Skill Installer (Antigravity & Agents)');
console.log('======================================================\n');

const home = os.homedir();
const sourceSkillPath = path.resolve(__dirname, '..', 'SKILL.md');

if (!fs.existsSync(sourceSkillPath)) {
  console.error('[!] Error: SKILL.md not found in package directory!');
  process.exit(1);
}

const skillContent = fs.readFileSync(sourceSkillPath, 'utf8');

// Target directories across supported agent platforms
const candidateDirectories = [
  path.join(home, '.gemini', 'antigravity', 'skills', 'x64dbg-mcp'),
  path.join(home, '.gemini', 'config', 'skills', 'x64dbg-mcp'),
  path.join(home, '.claude', 'skills', 'x64dbg-mcp'),
  path.join(home, '.agents', 'skills', 'x64dbg-mcp')
];

let installedCount = 0;

for (const targetDir of candidateDirectories) {
  try {
    const parentDir = path.dirname(targetDir);
    // If runtime directory exists or can be created, install skill
    if (fs.existsSync(parentDir) || parentDir.includes('.gemini') || parentDir.includes('.agents')) {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const destFile = path.join(targetDir, 'SKILL.md');
      fs.writeFileSync(destFile, skillContent, 'utf8');
      console.log(`[+] Installed SKILL.md to: ${destFile}`);
      installedCount++;
    }
  } catch (err) {
    // Continue to next directory if permissions or path differs
  }
}

if (installedCount === 0) {
  // Fallback to current working directory .agents/skills/x64dbg-mcp
  const fallbackDir = path.resolve(process.cwd(), '.agents', 'skills', 'x64dbg-mcp');
  fs.mkdirSync(fallbackDir, { recursive: true });
  fs.writeFileSync(path.join(fallbackDir, 'SKILL.md'), skillContent, 'utf8');
  console.log(`[+] Installed locally to: ${path.join(fallbackDir, 'SKILL.md')}`);
}

console.log('\n------------------------------------------------------');
console.log(' [SUCCESS] x64dbg-MCP Skill installed successfully!');
console.log('------------------------------------------------------\n');
console.log('Available Slash Commands in your AI assistant:');
console.log('  - /load <path>        : Load executable into x64dbg');
console.log('  - /patch <path>       : Patch conditional jump (je -> jne) to bypass key check');
console.log('  - /extract-key <path> : Break at strcmp and extract legitimate key');
console.log('  - /state              : View current debugger state and registers');
console.log('  - /bp <address>       : Set breakpoint at address or symbol');
console.log('  - /restore            : Restore patched assembly back to original\n');
console.log('Make sure x64dbg-mcp-server is running on http://127.0.0.1:9094/');
