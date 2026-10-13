---
name: x64dbg-mcp
description: "Use when debugging, analyzing PE binaries, inspecting memory, setting breakpoints, or inverting branch instructions using x64dbg via x64dbg-mcp-server over MCP. Trigger with /load <path>, /override-branch <path>, /extract-key <path>, /state, or /bp <address>."
---

# x64dbg MCP Dynamic Debugging & Branch Analysis Skill

Comprehensive guide and automation workflows for controlling **x64dbg** programmatically through the **x64dbg-MCP Server**.

Exposes specialized slash commands and automated workflows to load binaries, analyze routines, inspect memory, and invert conditional branch instructions (`je` -> `jne` / `nop`) to test alternative execution paths during dynamic debugging.

---

## Slash Commands Reference

| Slash Command | Argument | Purpose |
|---|---|---|
| `/load <path>` | Full executable path | Loads binary into x64dbg, runs to entry point, and analyzes PE module |
| `/patch <path>` | Full executable path | Inverts conditional jump (`je` -> `jne`) and saves patched executable `<name>_patched.exe` in the same directory |
| `/override-branch <path>` | Full executable path | Alias for `/patch` (inverts `je` -> `jne` or `nop` in memory and exports patched binary) |
| `/invert-jump <path>` | Full executable path | Alias for `/override-branch` |
| `/extract-key <path>` | Full executable path | Breaks at string comparison (`strcmp`) and reads runtime key from registers/memory |
| `/state` | None | Inspects current debugger state, RIP/EIP address, current instruction, and registers |
| `/bp <target>` | Address or symbol name | Sets software breakpoint and previews surrounding disassembly |
| `/restore` | None | Restores all applied memory edits back to original executable bytes |

---

## Automatic Plugin Verification & Installation (Auto-Setup)

If `x64dbg-MCP-Server.dp64` is not yet installed or x64dbg port 9094 is not responding:

1. **Auto-Install via npx:**
   ```bash
   npx github:phwyverysad/skills-x64dbg-mcp-server
   ```
   This command automatically:
   - Locates x64dbg installations across standard directories and running processes.
   - Copies `x64dbg-MCP-Server.dp64` into `<x64dbg>\x64\plugins\` and `.dp32` into `<x64dbg>\x32\plugins\`.
   - Writes `mcp_config.json` with pre-configured Bearer token.
   - Installs `SKILL.md` into Antigravity, Claude Code, and agent directories.

2. **Agent Pre-Flight Workflow:**
   Before executing `/load` or any debugger command, if `GetDebugState` fails to connect:
   - Verify `<x64dbg>\x64\plugins\x64dbg-MCP-Server.dp64` exists.
   - If missing, auto-install the plugin directly from the bundled `plugins/` directory.
   - Launch or restart `x64dbg.exe` to initialize the server.

---

## Workflows

### 1. `/load <path>` — Automated Binary Loading & Analysis

When the user enters `/load <path>`:

```text
Step 1: Check Debugger State
  ➔ Call MCP tool: GetDebugState
  ➔ Verify x64dbg is responsive and not locked.

Step 2: Load Target Binary
  ➔ Call MCP tool: LoadBinary with {"filePath": "<path>"}
  ➔ Wait for initial system breakpoint.

Step 3: Enumerate & Analyze PE Module
  ➔ Call MCP tool: ListModules to find the main module base address.
  ➔ Call MCP tool: AnalyzeModule with {"module": "<module_filename>"}
  ➔ Extract Entry Point RVA, Section Headers (.text, .rdata, .data).

Step 4: Report to User
  ➔ Display Base Address, Entry Point Address, and confirmation that the binary is PAUSED and ready.
```

---

### 2. `/patch <path>` (or `/override-branch <path>`) — Invert Branch and Export Patched Binary

When the user enters `/patch <path>` or `/override-branch <path>`:

**Objective:** Invert conditional branching logic to test the alternate execution branch, and automatically save the modified binary into the **same directory** as the target file.

```text
Step 1: Ensure Target is Loaded
  -> Check GetDebugState; if NO_TARGET, invoke LoadBinary(filePath: "<path>").

Step 2: Locate Branch Decision Logic
  -> Call MCP tool: SearchForStrings(searchText: "Invalid") or SearchForStrings(searchText: "Key")
  -> Scan references to locate the conditional decision block.
  -> Read cross-references (xrefs) to find the caller function.

Step 3: Disassemble Decision Block
  -> Call MCP tool: Disassemble at the caller function address (count: 20).
  -> Identify the conditional jump following the comparison:
     - Typical pattern:
       call <VerifyFunction>
       test al, al / test eax, eax
       je   <loc_failure>      ; 0x74 xx (short) or 0x0F 0x84 xx xx xx xx (near)
       call <OnSuccess>

Step 4: Execute Live Memory Modification (x64dbg)
  -> Calculate target instruction address.
  -> Call MCP tool: WriteMemToAddress with inverted bytes (e.g., 0x75 0x07 for jne, or 0x90 0x90 for NOP).
  -> Call MCP tool: GetPatches to verify applied memory edit.

Step 5: Export Patched Binary to Same Directory
  -> Determine target directory and filename from <path>:
     Directory: dirname(<path>)
     Patched Filename: <basename>_patched.exe
     Output File: path.join(dirname(<path>), "<basename>_patched.exe")
  -> Read target file bytes, modify the jump opcode at the corresponding raw file offset, and write to output file.

Step 6: Verify & Report
  -> Show the updated disassembly block from x64dbg.
  -> Report the generated patched file path: `<path_directory>/<filename>_patched.exe`.
  -> Verify that executing `<filename>_patched.exe` with any random input successfully triggers the alternate branch.
```

---

### 3. `/extract-key <path>` — Extract Valid Key from Memory/Registers

When the user enters `/extract-key <path>`:

```text
Step 1: Load Target Binary
  ➔ Invoke LoadBinary(filePath: "<path>").

Step 2: Hook String Comparison
  ➔ Search for symbols: SearchSymbols(pattern: "strcmp") or SearchSymbols(pattern: "memcmp").
  ➔ SetBreakpoint at comparison function or in VerifyKey function prolog.

Step 3: Run Binary to Input Prompt
  ➔ Run until user enters sample key.
  ➔ Breakpoint triggers when comparison routine executes.

Step 4: Read Register Arguments
  ➔ On x64 (Microsoft x64 Calling Convention):
     - RCX: Pointer to Arg 1 (User Input Key)
     - RDX: Pointer to Arg 2 (Expected Target Key)
  ➔ Call MCP tool: ReadMemory(address: RDX, size: 64)
  ➔ Decode ASCII string.
  ➔ Print extracted legitimate key to user.
```

---

### 4. `/restore` — Revert Applied Patches

```text
Step 1: Check Patches
  ➔ Call MCP tool: GetPatches to list all currently modified addresses.

Step 2: Revert Memory
  ➔ Call MCP tool: RestorePatches
  ➔ Verify with Disassemble that original bytes are restored.
```

---

## MCP Tools Quick Reference (x64dbg-mcp-server)

| Category | Key MCP Tools |
|---|---|
| **Lifecycle** | `GetDebugState`, `LoadBinary`, `AttachProcess`, `run`, `PauseDebug`, `StopDebug`, `RestartDebug` |
| **Execution** | `StepInto`, `StepOver`, `StepOut`, `RunToAddress`, `TraceInto`, `TraceOver` |
| **Breakpoints** | `SetBreakpoint`, `DeleteBreakpoint`, `ListBreakpoints`, `SetHardwareBreakpoint`, `SetConditionalBreakpoint` |
| **Inspection** | `Disassemble`, `GetAllRegisters`, `GetCallStack`, `ReadMemory`, `GetEventLog`, `SearchSymbols` |
| **Patching** | `Assemble`, `WriteMemToAddress`, `GetPatches`, `RestorePatches` |
| **Analysis** | `AnalyzeModule`, `DetectOEP`, `ListModules`, `SearchForStrings`, `GetReferences` |

---

## MCP Client Configuration

Add to your MCP configuration (`mcp_config.json` or `.mcp.json`):

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

> **Note:** Token can be retrieved or configured in x64dbg via **Plugins -> x64dbg-MCP Server -> Options**.
