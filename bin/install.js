#!/usr/bin/env node

/**
 * Installer script for skills-x64dbg-mcp-server
 * Installs SKILL.md and automatically detects and installs x64dbg-MCP-Server.dp64 plugin.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('======================================================');
console.log('  x64dbg-MCP Skill & Plugin Auto-Installer');
console.log('======================================================\n');

const home = os.homedir();
const packageRoot = path.resolve(__dirname, '..');
const sourceSkillPath = path.join(packageRoot, 'SKILL.md');
const dp64Source = path.join(packageRoot, 'plugins', 'x64', 'x64dbg-MCP-Server.dp64');
const dp32Source = path.join(packageRoot, 'plugins', 'x32', 'x64dbg-MCP-Server.dp32');

// --- 1. Install SKILL.md to AI Assistant directories ---
if (!fs.existsSync(sourceSkillPath)) {
  console.error('[!] Error: SKILL.md not found in package directory!');
  process.exit(1);
}

const skillContent = fs.readFileSync(sourceSkillPath, 'utf8');
const candidateDirectories = [
  path.join(home, '.gemini', 'antigravity', 'skills', 'x64dbg-mcp'),
  path.join(home, '.gemini', 'config', 'skills', 'x64dbg-mcp'),
  path.join(home, '.claude', 'skills', 'x64dbg-mcp'),
  path.join(home, '.agents', 'skills', 'x64dbg-mcp')
];

let installedSkillsCount = 0;
for (const targetDir of candidateDirectories) {
  try {
    const parentDir = path.dirname(targetDir);
    if (fs.existsSync(parentDir) || parentDir.includes('.gemini') || parentDir.includes('.agents')) {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const destFile = path.join(targetDir, 'SKILL.md');
      fs.writeFileSync(destFile, skillContent, 'utf8');
      console.log(`[+] Installed SKILL.md -> ${destFile}`);
      installedSkillsCount++;
    }
  } catch (err) {
    // Continue if permission or path differs
  }
}

if (installedSkillsCount === 0) {
  const fallbackDir = path.resolve(process.cwd(), '.agents', 'skills', 'x64dbg-mcp');
  fs.mkdirSync(fallbackDir, { recursive: true });
  fs.writeFileSync(path.join(fallbackDir, 'SKILL.md'), skillContent, 'utf8');
  console.log(`[+] Installed SKILL.md locally -> ${path.join(fallbackDir, 'SKILL.md')}`);
}

// --- 2. Auto-detect x64dbg installations and auto-install x64dbg-MCP-Server.dp64 ---
console.log('\n[*] Checking for x64dbg installation and plugin status...');

const candidateX64dbgRoots = new Set();

// 2a. Check running process
if (process.platform === 'win32') {
  try {
    const psOut = execSync('powershell -NoProfile -Command "Get-Process -Name x64dbg -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Path"', { encoding: 'utf8', timeout: 3000 }).trim();
    if (psOut) {
      const runningLines = psOut.split(/\r?\n/).filter(Boolean);
      for (const line of runningLines) {
        if (fs.existsSync(line)) {
          // If in <root>/x64/x64dbg.exe -> root is dirname(dirname(line))
          const x64Dir = path.dirname(line);
          const rootDir = path.dirname(x64Dir);
          candidateX64dbgRoots.add(rootDir);
          candidateX64dbgRoots.add(x64Dir);
        }
      }
    }
  } catch (e) {
    // Ignore process lookup errors
  }
}

// 2b. Check common download / desktop / system directories
const searchBases = [
  path.join(home, 'Downloads'),
  path.join(home, 'Desktop'),
  'C:\\',
  'D:\\',
  'C:\\Program Files',
  'C:\\Program Files (x86)'
];

for (const base of searchBases) {
  if (!fs.existsSync(base)) continue;
  try {
    const entries = fs.readdirSync(base);
    for (const entry of entries) {
      const fullPath = path.join(base, entry);
      if (entry.toLowerCase().includes('x64dbg') || entry.toLowerCase().includes('snapshot_')) {
        candidateX64dbgRoots.add(fullPath);
        if (fs.existsSync(path.join(fullPath, 'release'))) {
          candidateX64dbgRoots.add(path.join(fullPath, 'release'));
        }
      }
    }
  } catch (e) {
    // Ignore access denied on system folders
  }
}

let installedPluginCount = 0;
const defaultAuthToken = "e7b8a1c90f2345d67890abcdef123456";

for (const root of candidateX64dbgRoots) {
  // Check for <root>/x64 or root itself if it's already an x64 folder
  let x64Dir = null;
  let x32Dir = null;

  if (fs.existsSync(path.join(root, 'x64', 'x64dbg.exe'))) {
    x64Dir = path.join(root, 'x64');
    x32Dir = path.join(root, 'x32');
  } else if (fs.existsSync(path.join(root, 'x64dbg.exe'))) {
    x64Dir = root;
    x32Dir = path.join(path.dirname(root), 'x32');
  }

  if (x64Dir && fs.existsSync(x64Dir)) {
    const pluginsDir = path.join(x64Dir, 'plugins');
    const targetDp64 = path.join(pluginsDir, 'x64dbg-MCP-Server.dp64');

    if (!fs.existsSync(targetDp64)) {
      if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir, { recursive: true });
      }
      if (fs.existsSync(dp64Source)) {
        fs.copyFileSync(dp64Source, targetDp64);
        console.log(`[+] Auto-installed x64 plugin -> ${targetDp64}`);
        installedPluginCount++;
      }
    } else {
      console.log(`[+] x64 plugin verified -> ${targetDp64}`);
      installedPluginCount++;
    }

    // Ensure mcp_config.json in x64 dir has pre-configured token
    const mcpConfigPath = path.join(x64Dir, 'mcp_config.json');
    if (!fs.existsSync(mcpConfigPath)) {
      const mcpConfig = {
        IpAddress: "127.0.0.1",
        Port: 9094,
        AutoStart: true,
        AuthToken: defaultAuthToken
      };
      fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2), 'utf8');
      console.log(`[+] Created pre-configured mcp_config.json -> ${mcpConfigPath}`);
    }

    // Also install x32 plugin if x32 directory exists
    if (x32Dir && fs.existsSync(x32Dir)) {
      const plugins32Dir = path.join(x32Dir, 'plugins');
      const targetDp32 = path.join(plugins32Dir, 'x64dbg-MCP-Server.dp32');
      if (!fs.existsSync(targetDp32) && fs.existsSync(dp32Source)) {
        if (!fs.existsSync(plugins32Dir)) {
          fs.mkdirSync(plugins32Dir, { recursive: true });
        }
        fs.copyFileSync(dp32Source, targetDp32);
        console.log(`[+] Auto-installed x32 plugin -> ${targetDp32}`);
      }
    }
  }
}

// 3. Setup global client mcp_config.json for Antigravity
const globalMcpConfigDir = path.join(home, '.gemini', 'config');
const globalMcpConfigFile = path.join(globalMcpConfigDir, 'mcp_config.json');

try {
  let existingConfig = { mcpServers: {} };
  if (fs.existsSync(globalMcpConfigFile)) {
    try {
      const raw = fs.readFileSync(globalMcpConfigFile, 'utf8').trim();
      if (raw) existingConfig = JSON.parse(raw);
    } catch (e) {}
  }
  if (!existingConfig.mcpServers) existingConfig.mcpServers = {};
  if (!existingConfig.mcpServers.x64dbg) {
    existingConfig.mcpServers.x64dbg = {
      type: "http",
      url: "http://127.0.0.1:9094/",
      headers: {
        Authorization: `Bearer ${defaultAuthToken}`
      }
    };
    fs.mkdirSync(globalMcpConfigDir, { recursive: true });
    fs.writeFileSync(globalMcpConfigFile, JSON.stringify(existingConfig, null, 2), 'utf8');
    console.log(`[+] Configured global client MCP config -> ${globalMcpConfigFile}`);
  }
} catch (e) {}

console.log('\n------------------------------------------------------');
if (installedPluginCount > 0) {
  console.log(' [SUCCESS] Plugin & Skill installed and verified!');
} else {
  console.log(' [NOTE] SKILL installed. If x64dbg was not found automatically,');
  console.log(`        copy '${dp64Source}' into your x64dbg/x64/plugins/ folder.`);
}
console.log('------------------------------------------------------\n');
console.log('Ready to use! Available slash commands:');
console.log('  /load <path>        - Load binary into x64dbg');
console.log('  /patch <path>       - Patch conditional jump to bypass key verification');
console.log('  /extract-key <path> - Extract valid serial key from memory');
console.log('  /state              - View debugger state');
console.log('  /bp <address>       - Set breakpoint');
console.log('  /restore            - Revert patched assembly\n');
