# skills-x64dbg-mcp-server

AI Agent Skill สำหรับการทำ Reverse Engineering, วิเคราะห์ PE Binary, แกะ License Key, และ Patch Assembly เพื่อบายพาสการตรวจคีย์บน **x64dbg** ผ่าน **x64dbg-MCP Server**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 การติดตั้งสกิล (Installation)

### วิธีที่ 1: ติดตั้งผ่าน `npx` (แนะนำ)
สามารถรันคำสั่งด้านล่างนี้ได้โดยตรง:

```bash
npx github:phwyverysad/skills-x64dbg-mcp-server
```

หรือหาก clone repository มาไว้ในเครื่อง:

```bash
git clone https://github.com/phwyverysad/skills-x64dbg-mcp-server.git
cd skills-x64dbg-mcp-server
npm run install-skill
```

---

## ⚡ คำสั่ง Slash Commands ที่รองรับ

| คำสั่ง | พารามิเตอร์ | การทำงาน |
|---|---|---|
| `/load` | `<path>` | โหลดไฟล์ Executable เข้าสู่ x64dbg พร้อมหา Module Base Address และ Entry Point |
| `/patch` | `<path>` | โหลดไฟล์เข้า x64dbg และค้นหาคำสั่งกระโดดเงื่อนไข (`je` ➔ `jne` หรือ `nop`) เพื่อ Patch ให้ใส่**คีย์มั่ว**แล้วล็อกอินผ่าน |
| `/extract-key` | `<path>` | ตั้ง Breakpoint ที่จุดเปรียบเทียบสตริง (`strcmp`) แล้วดึงค่าคีย์จริงจาก Memory/Registers |
| `/state` | - | ตรวจสอบสถานะปัจจุบันของ x64dbg (Paused, Running, RIP Address, Registers) |
| `/bp` | `<address>` | ตั้ง Breakpoint ณ ตำแหน่ง Address หรือ Symbol ที่ระบุ |
| `/restore` | - | คืนค่า (Restore) คำสั่ง Assembly ทั้งหมดที่เคย Patch ไว้กลับสู่ค่าเดิม |

---

## 🛠️ การตั้งค่า MCP Client

เชื่อมต่อกับ x64dbg-mcp-server โดยเพิ่มในไฟล์ `mcp_config.json` หรือ `.mcp.json`:

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

> **หมายเหตุ:** นำปลั๊กอิน `x64dbg-MCP-Server.dp64` ไปวางในโฟลเดอร์ `x64\plugins\` ของ x64dbg และเปิด x64dbg ก่อนใช้งาน

---

## 📂 โครงสร้างภายในโปรเจกต์

```
skills-x64dbg-mcp-server/
├── SKILL.md                  # สกิลหลักสำหรับ AI Agent
├── package.json              # npm package metadata
├── bin/
│   └── install.js            # Node.js installer script สำหรับ npx
├── examples/
│   └── keycheck_example.cpp  # ตัวอย่างโปรแกรม C++ CrackMe สำหรับฝึกทดลอง
├── .gitignore
└── README.md
```

---

## 📄 License
MIT License - ดูรายละเอียดในไฟล์ LICENSE
