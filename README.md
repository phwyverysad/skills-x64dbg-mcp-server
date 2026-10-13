# skills-x64dbg-mcp-server

AI Agent Skill for reverse engineering, PE binary analysis, license key extraction, and assembly patching to bypass key verification on x64dbg via x64dbg-MCP Server.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## Automatic Installation

When you run the installation command, the installer will automatically:
1. Install `SKILL.md` into supported AI agent directories (Antigravity, Claude Code, Universal Agents).
2. Auto-detect x64dbg installations across your system and active processes.
3. Automatically install `x64dbg-MCP-Server.dp64` and `.dp32` into your x64dbg plugins directory (`x64\plugins\`) if not already present.
4. Generate `mcp_config.json` with a pre-configured Bearer token for seamless connection.

### Install via npx:
```bash
npx github:phwyverysad/skills-x64dbg-mcp-server
```

Or by cloning the repository locally:
```bash
git clone https://github.com/phwyverysad/skills-x64dbg-mcp-server.git
cd skills-x64dbg-mcp-server
npm run install-skill
```

---

## Supported Slash Commands

| Command | Parameter | Description |
|---|---|---|
| `/load` | `<path>` | Loads executable into x64dbg, runs to entry point, and retrieves PE module metadata |
| `/patch` | `<path>` | Loads binary, locates conditional jump (`je` -> `jne` or `nop`), and patches it to bypass login with invalid/random keys |
| `/extract-key` | `<path>` | Sets breakpoint at string comparison (`strcmp`) and extracts valid license key from registers/memory |
| `/state` | None | Displays current x64dbg status (Paused, Running, RIP address, registers) |
| `/bp` | `<address>` | Sets breakpoint at target address or function symbol |
| `/restore` | None | Reverts all patched assembly instructions back to original bytes |

---

## MCP Client Configuration

Connect to x64dbg-mcp-server by adding the following to your `mcp_config.json` or `.mcp.json`:

```json
{
  "mcpServers": {
    "x64dbg": {
      "type": "http",
      "url": "http://127.0.0.1:9094/",
      "headers": {
        "Authorization": "Bearer <YOUR_BEARER_TOKEN>"
      }
    }
  }
}
```

> Note: The installer configures this automatically. If configuring manually, copy the plugin `x64dbg-MCP-Server.dp64` to `<x64dbg>\x64\plugins\` and launch x64dbg before connecting.

---

## Project Structure

```
skills-x64dbg-mcp-server/
├── SKILL.md                  # Main AI agent skill definition
├── package.json              # npm package metadata
├── bin/
│   └── install.js            # Node.js installer script for npx
├── plugins/
│   ├── x64/                  # x64dbg-MCP-Server.dp64 binary
│   └── x32/                  # x64dbg-MCP-Server.dp32 binary
├── examples/
│   └── keycheck_example.cpp  # Sample C++ CrackMe source code
├── .gitignore
├── LICENSE                   # MIT License
└── README.md
```

---

## License
MIT License - See LICENSE file for details.
