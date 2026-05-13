# Spire Sensei Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows Electron desktop client that serves as a Slay the Spire beginner guide, with AI-powered advice via user-provided API keys.

**Architecture:** Electron + React (Vite) desktop app. Main process handles file I/O (MD snapshots, config) and API calls. Renderer process handles UI (dashboard + chat). IPC bridge connects them.

**Tech Stack:** Electron, React 18, TypeScript, Vite, electron-builder (packaging)

---

## File Structure

```
spire-sensei/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts                    # Vite config for renderer
├── electron-builder.json             # Packaging config
├── electron/
│   ├── main.ts                       # Electron main process
│   ├── preload.ts                    # IPC bridge (contextBridge)
│   └── lib/
│       ├── md-parser.ts              # MD → structured data
│       ├── md-writer.ts              # Structured data → MD
│       ├── state-updater.ts          # Apply state JSON to MD
│       ├── context-builder.ts        # Build system prompt
│       ├── image-compressor.ts       # Resize/compress images
│       └── api-client.ts             # DeepSeek/OpenAI API calls
├── src/
│   ├── index.html
│   ├── main.tsx                      # React entry
│   ├── App.tsx                       # Root component
│   ├── App.css                       # Global styles
│   ├── components/
│   │   ├── Layout/
│   │   │   └── AppLayout.tsx         # Two-column layout shell
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx         # Left panel container
│   │   │   ├── StatusCard.tsx        # HP/Gold/Floor/Act
│   │   │   ├── CardList.tsx          # Deck list
│   │   │   ├── RelicList.tsx         # Relic list
│   │   │   └── GameSelector.tsx      # New game / switch game
│   │   ├── Chat/
│   │   │   ├── ChatPanel.tsx         # Right panel container
│   │   │   ├── MessageList.tsx       # Message history
│   │   │   ├── MessageBubble.tsx     # Single message
│   │   │   ├── ChatInput.tsx         # Input + paste/drop zone
│   │   │   └── ChatToolbar.tsx       # Depth toggle + Style selector
│   │   └── Settings/
│   │       ├── SettingsDialog.tsx    # Modal container
│   │       ├── ApiConfig.tsx         # API key / base URL / model
│   │       └── PersonaEditor.tsx     # Custom persona editor
│   ├── hooks/
│   │   ├── useGameState.ts           # Game state React hook
│   │   └── useChat.ts                # Chat messages + send logic
│   ├── types/
│   │   └── index.ts                  # All TypeScript types
│   └── lib/
│       └── ipc.ts                    # Renderer-side IPC wrappers
├── tests/
│   ├── md-parser.test.ts
│   ├── md-writer.test.ts
│   ├── state-updater.test.ts
│   └── context-builder.test.ts
├── resources/
│   ├── personas.json                 # Preset coach personas
│   └── default-config.json           # Default config template
├── games/                            # User game MD files (runtime)
└── config.json                       # User config (runtime, .gitignored)
```

---

## Phase 1: Project Scaffold (3 tasks)

### Task 1.1: Initialize Electron + React + Vite project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `electron/main.ts`
- Create: `electron/preload.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "spire-sensei",
  "version": "0.1.0",
  "description": "Slay the Spire beginner guide client",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "vite build && electron-builder"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "concurrently": "^8.2.0",
    "electron": "^31.0.0",
    "electron-builder": "^24.13.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vite-plugin-electron": "^0.28.0",
    "vite-plugin-electron-renderer": "^0.14.0",
    "wait-on": "^7.2.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*", "electron/**/*"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist-electron"
  },
  "include": ["electron/**/*", "vite.config.ts"]
}
```

- [ ] **Step 5: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      { entry: 'electron/main.ts' },
      { entry: 'electron/preload.ts', onstart(options) { options.reload() } }
    ]),
    renderer()
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
})
```

- [ ] **Step 6: Create electron/main.ts (minimal window)**

```typescript
import { app, BrowserWindow } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'Spire Sensei',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
```

- [ ] **Step 7: Create electron/preload.ts (empty bridge)**

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations - will be filled in Phase 3
  readGameFile: (path: string) => ipcRenderer.invoke('file:readGame', path),
  writeGameFile: (path: string, content: string) => ipcRenderer.invoke('file:writeGame', path, content),
  listGameFiles: () => ipcRenderer.invoke('file:listGames'),
  createGameFile: (character: string) => ipcRenderer.invoke('file:createGame', character),

  // Config operations - will be filled in Phase 6
  getConfig: () => ipcRenderer.invoke('config:get'),
  setConfig: (key: string, value: unknown) => ipcRenderer.invoke('config:set', key, value),

  // API operations - will be filled in Phase 5
  sendMessage: (opts: { text: string; imageBase64?: string }) =>
    ipcRenderer.invoke('api:sendMessage', opts)
})
```

- [ ] **Step 8: Verify — launch the empty window**

```bash
npm run electron:dev
```

Expected: An empty Electron window opens with title "Spire Sensei", 1280x800, white background.

- [ ] **Step 9: Commit**

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts electron/main.ts electron/preload.ts
git commit -m "feat: initialize Electron + React + Vite project scaffold"
```

---

### Task 1.2: Create React entry + App shell

**Files:**
- Create: `src/index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.css`

- [ ] **Step 1: Create src/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Spire Sensei</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Create src/main.tsx**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 3: Create src/App.tsx**

```typescript
import { useState } from 'react'
import AppLayout from './components/Layout/AppLayout'
import type { GameState } from './types'

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant'
    text: string
    imageBase64?: string
  }>>([])

  return (
    <AppLayout
      gameState={gameState}
      onGameStateChange={setGameState}
      messages={messages}
      onSendMessage={(msg) => {
        setMessages(prev => [...prev, msg])
        // API call will be wired in Phase 5
      }}
    />
  )
}

export default App
```

- [ ] **Step 4: Create src/App.css (CSS reset + layout basics)**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #root { height: 100%; width: 100%; overflow: hidden; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a2e; color: #e0e0e0; }
```

- [ ] **Step 5: Verify — window shows dark background**

```bash
npm run electron:dev
```

Expected: Window with dark blue-grey background (#1a1a2e), no errors in console.

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: add React entry point and App shell"
```

---

### Task 1.3: Create two-column layout shell

**Files:**
- Create: `src/components/Layout/AppLayout.tsx`
- Create: `src/types/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/layout.test.tsx — skip for now, UI tests need Playwright setup in Phase 2
// Manual verification: render check in browser
```

- [ ] **Step 2: Create src/types/index.ts**

```typescript
export interface GameState {
  character: string
  floor: number
  hp: string
  gold: number
  act: number
  created: string
  updated: string
  cards: Card[]
  relics: string[]
  potions: string[]
  options: string
}

export interface Card {
  name: string
  upgraded: boolean
  count: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  imageBase64?: string
  timestamp: number
}

export interface Persona {
  id: string
  name: string
  description: string
  preset: boolean
}

export interface AppConfig {
  apiProvider: 'deepseek' | 'custom'
  apiKey: string
  baseUrl: string
  model: string
  depth: 'deep' | 'shallow'
  persona: string
  customPersonaPrompt: string
}
```

- [ ] **Step 3: Create src/components/Layout/AppLayout.tsx**

```typescript
import { Dashboard } from '../Dashboard/Dashboard'
import { ChatPanel } from '../Chat/ChatPanel'
import type { GameState, ChatMessage } from '../../types'

interface Props {
  gameState: GameState | null
  onGameStateChange: (state: GameState) => void
  messages: ChatMessage[]
  onSendMessage: (msg: ChatMessage) => void
}

export function AppLayout({ gameState, onGameStateChange, messages, onSendMessage }: Props) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw'
    }}>
      <div style={{
        width: '35%',
        minWidth: '300px',
        borderRight: '1px solid #2a2a4a',
        overflow: 'auto'
      }}>
        <Dashboard gameState={gameState} onGameStateChange={onGameStateChange} />
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <ChatPanel messages={messages} onSendMessage={onSendMessage} />
      </div>
    </div>
  )
}
```

Placeholder components for Dashboard and ChatPanel:

```typescript
// src/components/Dashboard/Dashboard.tsx
import type { GameState } from '../../types'

interface Props {
  gameState: GameState | null
  onGameStateChange: (state: GameState) => void
}

export function Dashboard({ gameState }: Props) {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#fff' }}>Spire Sensei</h2>
      {!gameState ? (
        <div style={{ color: '#888' }}>No active game. Click "New Game" to start.</div>
      ) : (
        <div>{/* Will be built in Phase 4 */}</div>
      )}
    </div>
  )
}
```

```typescript
// src/components/Chat/ChatPanel.tsx
import type { ChatMessage } from '../../types'

interface Props {
  messages: ChatMessage[]
  onSendMessage: (msg: ChatMessage) => void
}

export function ChatPanel({ messages }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{
        flex: 1,
        padding: '16px',
        overflow: 'auto'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#666',
            marginTop: '40vh'
          }}>
            Start a new game or send a screenshot to begin.
          </div>
        )}
      </div>
      <div style={{
        padding: '12px',
        borderTop: '1px solid #2a2a4a'
      }}>
        <input
          type="text"
          placeholder="Describe your situation or paste a screenshot..."
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#16213e',
            border: '1px solid #2a2a4a',
            borderRadius: '8px',
            color: '#e0e0e0',
            fontSize: '14px'
          }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify — two-column layout renders**

```bash
npm run electron:dev
```

Expected: Window with left dark panel (~35%) showing "Spire Sensei" header, right panel showing empty state text and an input box at bottom.

- [ ] **Step 5: Commit**

```bash
git add src/components/ src/types/
git commit -m "feat: add two-column layout shell with placeholder components"
```

---

## Phase 2: UI Design (5 tasks)

### Task 2.1: Design overall visual style with frontend-design skill

- Invoke `frontend-design` skill to design the visual language
- Colors: dark theme (gaming aesthetic) — deep blue-grey background, gold accents for game elements
- Typography: system font stack, clear hierarchy
- Output: CSS variables file + visual style guide

### Task 2.2: Design Dashboard components

- StatusCard: HP bar, gold counter, floor indicator with icons
- CardList: scrollable card list with upgrade badges
- RelicList: compact relic grid
- GameSelector: new/switch game buttons

### Task 2.3: Design Chat components

- MessageBubble: user vs AI styling, image thumbnails
- ChatInput: paste zone, drag-drop highlight, send button
- ChatToolbar: depth toggle switch + persona dropdown

### Task 2.4: Design Settings components

- SettingsDialog: modal overlay
- ApiConfig: provider selector, key input with show/hide, test button
- PersonaEditor: persona card list + custom textarea

### Task 2.5: Export styled React components

- Apply the approved visual design to all placeholder components
- Ensure consistent spacing, colors, hover states
- All components responsive within their container

---

## Phase 3: Data Layer (5 tasks)

### Task 3.1: Define MD template and GameState types

**Files:**
- Create: `electron/lib/md-parser.ts`
- Test: `tests/md-parser.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/md-parser.test.ts
import { describe, it, expect } from 'vitest'
import { parseGameMd } from '../electron/lib/md-parser'

const sampleMd = `---
character: 铁甲战士
floor: 12
hp: 45/72
gold: 188
act: 2
created: 2026-05-13T20:30:00+08:00
updated: 2026-05-13T21:15:00+08:00
---

# 卡组 (15)
- [ ] 打击 x4
- [ ] 防御 x4
- [x] 痛击+ x1
- [ ] 旋风斩 x1

# 遗物 (4)
- 痛楚印记
- 皇家枕套

# 药水 (2)
- 格挡药水

# 当前选项
- 抓牌: 燃烧 / 双发 / 震波
`

describe('parseGameMd', () => {
  it('parses YAML front matter', () => {
    const result = parseGameMd(sampleMd)
    expect(result.character).toBe('铁甲战士')
    expect(result.floor).toBe(12)
    expect(result.hp).toBe('45/72')
    expect(result.gold).toBe(188)
    expect(result.act).toBe(2)
  })

  it('parses cards with upgrade status and count', () => {
    const result = parseGameMd(sampleMd)
    expect(result.cards).toHaveLength(4)
    expect(result.cards[0]).toEqual({ name: '打击', upgraded: false, count: 4 })
    expect(result.cards[2]).toEqual({ name: '痛击', upgraded: true, count: 1 })
  })

  it('parses relics', () => {
    const result = parseGameMd(sampleMd)
    expect(result.relics).toEqual(['痛楚印记', '皇家枕套'])
  })

  it('parses potions', () => {
    const result = parseGameMd(sampleMd)
    expect(result.potions).toEqual(['格挡药水'])
  })

  it('parses current options', () => {
    const result = parseGameMd(sampleMd)
    expect(result.options).toBe('抓牌: 燃烧 / 双发 / 震波')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest tests/md-parser.test.ts
```

Expected: FAIL — `parseGameMd is not defined`

- [ ] **Step 3: Implement parseGameMd**

```typescript
// electron/lib/md-parser.ts
import type { GameState, Card } from '../../src/types'

export function parseGameMd(content: string): GameState {
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!yamlMatch) throw new Error('Missing YAML front matter')

  const yaml = parseYaml(yamlMatch[1])
  const body = content.slice(yamlMatch[0].length).trim()

  return {
    character: yaml.character || '',
    floor: Number(yaml.floor) || 0,
    hp: yaml.hp || '0/0',
    gold: Number(yaml.gold) || 0,
    act: Number(yaml.act) || 1,
    created: yaml.created || '',
    updated: yaml.updated || '',
    cards: parseCards(body),
    relics: parseSection(body, '遗物'),
    potions: parseSection(body, '药水'),
    options: parseOptions(body)
  }
}

function parseYaml(yaml: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of yaml.split('\n')) {
    const [key, ...rest] = line.split(':')
    if (key) result[key.trim()] = rest.join(':').trim()
  }
  return result
}

function parseCards(body: string): Card[] {
  const section = extractSection(body, '卡组')
  if (!section) return []
  return section.split('\n')
    .filter(line => line.startsWith('- ['))
    .map(line => {
      const upgraded = line.startsWith('- [x]')
      const content = line.slice(upgraded ? 6 : 5)
      const match = content.match(/^(.+?) x(\d+)$/)
      if (match) {
        return { name: match[1].trim(), upgraded, count: Number(match[2]) }
      }
      return { name: content.trim(), upgraded, count: 1 }
    })
}

function parseSection(body: string, heading: string): string[] {
  const section = extractSection(body, heading)
  if (!section) return []
  return section.split('\n')
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim())
}

function parseOptions(body: string): string {
  const section = extractSection(body, '当前选项')
  if (!section) return ''
  return section.split('\n')
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim())
    .join('\n')
}

function extractSection(body: string, heading: string): string | null {
  const regex = new RegExp(`# ${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n# |$)`)
  const match = body.match(regex)
  return match ? match[1].trim() : null
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest tests/md-parser.test.ts
```

Expected: 5/5 PASS

- [ ] **Step 5: Commit**

```bash
git add electron/lib/md-parser.ts tests/md-parser.test.ts
git commit -m "feat: add MD parser with YAML front matter and section parsing"
```

---

### Task 3.2: Implement MD writer

**Files:**
- Create: `electron/lib/md-writer.ts`
- Test: `tests/md-writer.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/md-writer.test.ts
import { describe, it, expect } from 'vitest'
import { writeGameMd } from '../electron/lib/md-writer'

const sampleState = {
  character: '铁甲战士',
  floor: 13,
  hp: '38/72',
  gold: 200,
  act: 2,
  created: '2026-05-13T20:30:00+08:00',
  updated: '2026-05-13T21:20:00+08:00',
  cards: [
    { name: '打击', upgraded: false, count: 4 },
    { name: '痛击', upgraded: true, count: 1 },
    { name: '燃烧', upgraded: false, count: 1 }
  ],
  relics: ['痛楚印记', '皇家枕套'],
  potions: ['格挡药水'],
  options: '选择路线: 精英 / 篝火 / 商店'
}

describe('writeGameMd', () => {
  it('writes YAML front matter', () => {
    const md = writeGameMd(sampleState)
    expect(md).toContain('character: 铁甲战士')
    expect(md).toContain('floor: 13')
    expect(md).toContain('hp: 38/72')
    expect(md).toContain('gold: 200')
  })

  it('writes card list with upgrade markers', () => {
    const md = writeGameMd(sampleState)
    expect(md).toContain('- [ ] 打击 x4')
    expect(md).toContain('- [x] 痛击+ x1')
    expect(md).toContain('- [ ] 燃烧 x1')
  })

  it('writes relics and potions sections', () => {
    const md = writeGameMd(sampleState)
    expect(md).toContain('# 遗物 (2)')
    expect(md).toContain('- 痛楚印记')
    expect(md).toContain('# 药水 (1)')
  })

  it('writes current options section', () => {
    const md = writeGameMd(sampleState)
    expect(md).toContain('# 当前选项')
    expect(md).toContain('- 选择路线: 精英 / 篝火 / 商店')
  })

  it('round-trips through parser', () => {
    const { parseGameMd } = require('../electron/lib/md-parser')
    const md = writeGameMd(sampleState)
    const parsed = parseGameMd(md)
    expect(parsed.character).toBe(sampleState.character)
    expect(parsed.cards).toEqual(sampleState.cards)
    expect(parsed.relics).toEqual(sampleState.relics)
    expect(parsed.options).toBe(sampleState.options)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest tests/md-writer.test.ts
```

Expected: FAIL — `writeGameMd is not defined`

- [ ] **Step 3: Implement writeGameMd**

```typescript
// electron/lib/md-writer.ts
import type { GameState } from '../../src/types'

export function writeGameMd(state: GameState): string {
  const lines: string[] = []

  // YAML front matter
  lines.push('---')
  lines.push(`character: ${state.character}`)
  lines.push(`floor: ${state.floor}`)
  lines.push(`hp: ${state.hp}`)
  lines.push(`gold: ${state.gold}`)
  lines.push(`act: ${state.act}`)
  lines.push(`created: ${state.created}`)
  lines.push(`updated: ${state.updated}`)
  lines.push('---')
  lines.push('')

  // Cards
  lines.push(`# 卡组 (${state.cards.reduce((sum, c) => sum + c.count, 0)})`)
  for (const card of state.cards) {
    const marker = card.upgraded ? '[x]' : '[ ]'
    const count = card.count > 1 ? ` x${card.count}` : ''
    lines.push(`- ${marker} ${card.name}${count}`)
  }
  lines.push('')

  // Relics
  lines.push(`# 遗物 (${state.relics.length})`)
  for (const relic of state.relics) {
    lines.push(`- ${relic}`)
  }
  lines.push('')

  // Potions
  lines.push(`# 药水 (${state.potions.length})`)
  for (const potion of state.potions) {
    lines.push(`- ${potion}`)
  }
  lines.push('')

  // Current options
  lines.push('# 当前选项')
  if (state.options) {
    for (const line of state.options.split('\n')) {
      lines.push(`- ${line}`)
    }
  }

  return lines.join('\n') + '\n'
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest tests/md-writer.test.ts
```

Expected: 5/5 PASS

- [ ] **Step 5: Commit**

```bash
git add electron/lib/md-writer.ts tests/md-writer.test.ts
git commit -m "feat: add MD writer with YAML front matter and section output"
```

---

### Task 3.3: Implement state updater (apply AI state JSON to MD)

**Files:**
- Create: `electron/lib/state-updater.ts`
- Test: `tests/state-updater.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/state-updater.test.ts
import { describe, it, expect } from 'vitest'
import { applyStateUpdate } from '../electron/lib/state-updater'
import { parseGameMd } from '../electron/lib/md-parser'
import { writeGameMd } from '../electron/lib/md-writer'

describe('applyStateUpdate', () => {
  const baseState = {
    character: '铁甲战士', floor: 12, hp: '45/72', gold: 188, act: 2,
    created: '2026-05-13T20:30:00+08:00', updated: '2026-05-13T21:15:00+08:00',
    cards: [
      { name: '打击', upgraded: false, count: 4 },
      { name: '防御', upgraded: false, count: 4 }
    ],
    relics: ['痛楚印记'],
    potions: [],
    options: '抓牌: 燃烧 / 双发 / 震波'
  }

  it('updates scalar fields (hp, gold, floor)', () => {
    const md = writeGameMd(baseState)
    const update = { hp: '38/72', gold: 200, floor: 13 }
    const updated = applyStateUpdate(md, update)
    const parsed = parseGameMd(updated)
    expect(parsed.hp).toBe('38/72')
    expect(parsed.gold).toBe(200)
    expect(parsed.floor).toBe(13)
  })

  it('adds new cards', () => {
    const md = writeGameMd(baseState)
    const update = { addCards: ['燃烧'] }
    const updated = applyStateUpdate(md, update)
    const parsed = parseGameMd(updated)
    expect(parsed.cards.find(c => c.name === '燃烧')).toBeDefined()
  })

  it('adds new relics', () => {
    const md = writeGameMd(baseState)
    const update = { addRelics: ['皇家枕套'] }
    const updated = applyStateUpdate(md, update)
    const parsed = parseGameMd(updated)
    expect(parsed.relics).toContain('皇家枕套')
  })

  it('upgrades a card', () => {
    const md = writeGameMd(baseState)
    const update = { upgradeCards: ['打击'] }
    const updated = applyStateUpdate(md, update)
    const parsed = parseGameMd(updated)
    const strike = parsed.cards.find(c => c.name === '打击')!
    expect(strike.upgraded).toBe(true)
    expect(strike.name).toBe('打击+')
  })

  it('clears options after update', () => {
    const md = writeGameMd(baseState)
    const update = { clearOptions: true }
    const updated = applyStateUpdate(md, update)
    const parsed = parseGameMd(updated)
    expect(parsed.options).toBe('')
  })

  it('extracts state JSON from AI response text', () => {
    const { extractStateJson } = require('../electron/lib/state-updater')
    const aiResponse = 'I recommend taking 燃烧.\n\n```json state\n{"addCards":["燃烧"],"clearOptions":true}\n```\n\nGood luck!'
    const json = extractStateJson(aiResponse)
    expect(json).toEqual({ addCards: ['燃烧'], clearOptions: true })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest tests/state-updater.test.ts
```

- [ ] **Step 3: Implement applyStateUpdate and extractStateJson**

```typescript
// electron/lib/state-updater.ts
import { parseGameMd } from './md-parser'
import { writeGameMd } from './md-writer'
import type { GameState } from '../../src/types'

interface StateUpdate {
  hp?: string
  gold?: number
  floor?: number
  act?: number
  addCards?: string[]
  removeCards?: string[]
  upgradeCards?: string[]
  addRelics?: string[]
  removeRelics?: string[]
  addPotions?: string[]
  removePotions?: string[]
  options?: string
  clearOptions?: boolean
}

export function applyStateUpdate(mdContent: string, update: StateUpdate): string {
  const state = parseGameMd(mdContent)

  if (update.hp) state.hp = update.hp
  if (update.gold !== undefined) state.gold = update.gold
  if (update.floor) state.floor = update.floor
  if (update.act) state.act = update.act

  if (update.addCards) {
    for (const name of update.addCards) {
      const existing = state.cards.find(c => c.name === name)
      if (existing) { existing.count++ } else { state.cards.push({ name, upgraded: false, count: 1 }) }
    }
  }

  if (update.upgradeCards) {
    for (const name of update.upgradeCards) {
      const card = state.cards.find(c => c.name === name)
      if (card) { card.name = name + '+'; card.upgraded = true }
    }
  }

  if (update.addRelics) {
    for (const name of update.addRelics) {
      if (!state.relics.includes(name)) state.relics.push(name)
    }
  }

  if (update.addPotions) {
    for (const name of update.addPotions) {
      if (!state.potions.includes(name)) state.potions.push(name)
    }
  }

  if (update.clearOptions) {
    state.options = ''
  } else if (update.options) {
    state.options = update.options
  }

  state.updated = new Date().toISOString()
  return writeGameMd(state)
}

export function extractStateJson(aiResponse: string): StateUpdate | null {
  const match = aiResponse.match(/```json state\n([\s\S]*?)\n```/)
  if (!match) return null
  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest tests/state-updater.test.ts
```

Expected: 6/6 PASS

- [ ] **Step 5: Commit**

```bash
git add electron/lib/state-updater.ts tests/state-updater.test.ts
git commit -m "feat: add state updater with AI response JSON extraction"
```

---

### Task 3.4: Build context builder (system prompt assembly)

**Files:**
- Create: `electron/lib/context-builder.ts`
- Test: `tests/context-builder.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/context-builder.test.ts
import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '../electron/lib/context-builder'

const gameState = {
  character: '铁甲战士', floor: 12, hp: '45/72', gold: 188, act: 2,
  created: '', updated: '',
  cards: [{ name: '打击', upgraded: false, count: 4 }, { name: '痛击', upgraded: true, count: 1 }],
  relics: ['痛楚印记'], potions: [], options: '抓牌: 燃烧 / 双发 / 震波'
}

describe('buildSystemPrompt', () => {
  it('includes game state snapshot', () => {
    const prompt = buildSystemPrompt({
      gameState,
      persona: { id: 'default', name: '默认', description: '', preset: true },
      depth: 'deep',
      customPersonaPrompt: ''
    })
    expect(prompt).toContain('铁甲战士')
    expect(prompt).toContain('12')
    expect(prompt).toContain('45/72')
    expect(prompt).toContain('痛击')
    expect(prompt).toContain('痛楚印记')
  })

  it('includes depth instruction for deep mode', () => {
    const prompt = buildSystemPrompt({
      gameState,
      persona: { id: 'default', name: '默认', description: '', preset: true },
      depth: 'deep',
      customPersonaPrompt: ''
    })
    expect(prompt).toContain('详细')
  })

  it('includes depth instruction for shallow mode', () => {
    const prompt = buildSystemPrompt({
      gameState,
      persona: { id: 'default', name: '默认', description: '', preset: true },
      depth: 'shallow',
      customPersonaPrompt: ''
    })
    expect(prompt).toContain('简短')
  })

  it('includes persona description', () => {
    const prompt = buildSystemPrompt({
      gameState,
      persona: { id: 'lbw', name: '卢本伟', description: '说话像卢本伟', preset: true },
      depth: 'deep',
      customPersonaPrompt: ''
    })
    expect(prompt).toContain('说话像卢本伟')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest tests/context-builder.test.ts
```

- [ ] **Step 3: Implement buildSystemPrompt**

```typescript
// electron/lib/context-builder.ts
import type { GameState, Persona } from '../../src/types'

const GAME_KNOWLEDGE = `
You are Spire Sensei, an expert Slay the Spire coach. You help new players:
- Pick the best card after combat (considering their current deck, relics, and strategy)
- Choose optimal paths on the map (elites vs camps vs shops vs unknowns)
- Make shop decisions (buy, remove, rest)
- Play optimal combat turns (block first? attack now? potion timing?)
- Evaluate relics and their synergies

You always see the player's FULL game state below. Use it for every decision.
If you're unsure what the player wants (recommendation? state update? combat advice?), ask them to clarify.
When updating game state, add a \`\`\`json state\`\`\` block at the end of your response.
`.trim()

const DEPTH_DEEP = `
Teaching depth: DETAILED. Explain your reasoning fully:
- Why this choice over alternatives
- Card evaluation principles at work
- Turn sequencing logic
- Long-term strategy implications
`.trim()

const DEPTH_SHALLOW = `
Teaching depth: SHORT. Give the conclusion only. One or two sentences max. No explanation.
`.trim()

interface PromptOpts {
  gameState: GameState | null
  persona: Persona
  depth: 'deep' | 'shallow'
  customPersonaPrompt: string
}

export function buildSystemPrompt(opts: PromptOpts): string {
  const parts: string[] = [GAME_KNOWLEDGE]

  // Persona
  if (opts.persona.id === 'custom' && opts.customPersonaPrompt) {
    parts.push(`\nSpeaking style: ${opts.customPersonaPrompt}`)
  } else if (opts.persona.id !== 'default' && opts.persona.description) {
    parts.push(`\nSpeaking style: ${opts.persona.description}`)
  }

  // Depth
  parts.push(`\n${opts.depth === 'deep' ? DEPTH_DEEP : DEPTH_SHALLOW}`)

  // Game state
  if (opts.gameState) {
    parts.push(`\n## Current Game State\n\`\`\`json\n${JSON.stringify(opts.gameState, null, 2)}\n\`\`\``)
  } else {
    parts.push('\nNo active game. Ask the player to start a new game first.')
  }

  return parts.join('\n')
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest tests/context-builder.test.ts
```

Expected: 4/4 PASS

- [ ] **Step 5: Commit**

```bash
git add electron/lib/context-builder.ts tests/context-builder.test.ts
git commit -m "feat: add system prompt builder with persona, depth, and game state"
```

---

### Task 3.5: Game file manager (CRUD for MD files)

**Files:**
- Create: `electron/lib/game-manager.ts`
- Test: `tests/game-manager.test.ts`
- Modify: `electron/main.ts` — wire IPC handlers

- [ ] **Step 1: Write failing test**

```typescript
// tests/game-manager.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createGame, listGames, readGame, switchGame } from '../electron/lib/game-manager'
import fs from 'fs'
import path from 'path'
import os from 'os'

const testDir = path.join(os.tmpdir(), 'spire-sensei-test-games')

describe('game-manager', () => {
  beforeEach(() => {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true })
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true })
  })

  it('creates a new game file with template', () => {
    const filePath = createGame('铁甲战士', testDir)
    expect(fs.existsSync(filePath)).toBe(true)
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('character: 铁甲战士')
    expect(content).toContain('# 卡组')
  })

  it('lists all game files', () => {
    createGame('铁甲战士', testDir)
    createGame('静默猎手', testDir)
    const games = listGames(testDir)
    expect(games).toHaveLength(2)
  })

  it('reads a game file', () => {
    const filePath = createGame('观者', testDir)
    const state = readGame(filePath)
    expect(state.character).toBe('观者')
  })
})
```

- [ ] **Step 2-5: Implement, test, commit**

Similar TDD cycle. Complete `game-manager.ts`:

```typescript
// electron/lib/game-manager.ts
import fs from 'fs'
import path from 'path'
import { parseGameMd } from './md-parser'
import { writeGameMd } from './md-writer'
import type { GameState } from '../../src/types'

const GAME_TEMPLATE = `---
character: {CHARACTER}
floor: 1
hp: 72/72
gold: 99
act: 1
created: {CREATED}
updated: {CREATED}
---

# 卡组 (10)
- [ ] 打击 x5
- [ ] 防御 x4
- [x] 痛击+ x1

# 遗物 (1)
- 痛楚印记

# 药水 (0)

# 当前选项
`

export function createGame(character: string, gamesDir: string): string {
  const now = new Date().toISOString()
  const filename = `${character}-${now.replace(/[:.]/g, '-').slice(0, 19)}.md`
  const filePath = path.join(gamesDir, filename)
  const content = GAME_TEMPLATE
    .replace(/{CHARACTER}/g, character)
    .replace(/{CREATED}/g, now)
  fs.writeFileSync(filePath, content, 'utf-8')
  return filePath
}

export function listGames(gamesDir: string): Array<{ path: string; character: string; updated: string }> {
  if (!fs.existsSync(gamesDir)) return []
  return fs.readdirSync(gamesDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const filePath = path.join(gamesDir, f)
      const content = fs.readFileSync(filePath, 'utf-8')
      const state = parseGameMd(content)
      return { path: filePath, character: state.character, updated: state.updated }
    })
    .sort((a, b) => b.updated.localeCompare(a.updated))
}

export function readGame(filePath: string): GameState {
  const content = fs.readFileSync(filePath, 'utf-8')
  return parseGameMd(content)
}

export function writeGame(filePath: string, state: GameState): void {
  const content = writeGameMd(state)
  fs.writeFileSync(filePath, content, 'utf-8')
}
```

---

## Phase 4: Left Dashboard (3 tasks)

### Task 4.1: StatusCard component (HP, Gold, Floor, Act)

**Files:**
- Modify: `src/components/Dashboard/StatusCard.tsx`

Build React component showing:
- Character name with color-coded class icon
- HP bar (red gradient, width proportional to current/max)
- Gold count with coin icon
- Floor indicator with act number

### Task 4.2: CardList and RelicList components

**Files:**
- Modify: `src/components/Dashboard/CardList.tsx`
- Modify: `src/components/Dashboard/RelicList.tsx`

- CardList: scrollable, shows card name + count, upgraded cards with gold border/icon
- RelicList: compact grid, relic name + hover tooltip

### Task 4.3: GameSelector + Dashboard integration

**Files:**
- Modify: `src/components/Dashboard/GameSelector.tsx`
- Modify: `src/components/Dashboard/Dashboard.tsx`
- Modify: `src/hooks/useGameState.ts`

- New Game button → character picker (4 options) → creates MD file
- Switch Game button → file list popup → switches active file
- useGameState hook: reads game state from electronAPI, provides refresh function

---

## Phase 5: Chat Panel (4 tasks)

### Task 5.1: MessageList + MessageBubble components

**Files:**
- Modify: `src/components/Chat/MessageList.tsx`
- Modify: `src/components/Chat/MessageBubble.tsx`

- User bubbles: right-aligned, blue tint, show image thumbnail if present
- AI bubbles: left-aligned, dark tint, markdown rendering for state updates
- Auto-scroll to bottom on new message

### Task 5.2: ChatInput with paste/drop support

**Files:**
- Modify: `src/components/Chat/ChatInput.tsx`

- Text input with auto-grow
- Ctrl+V: detect image in clipboard → show thumbnail → allow remove
- Drag & drop: highlight zone on drag over → capture dropped image
- Send button disabled when no text AND no image

### Task 5.3: Image compressor

**Files:**
- Create: `electron/lib/image-compressor.ts`

- Resize to max 1024px on longest side
- Compress JPEG quality to 70%
- Target: <500KB before API send (reduces Vision API cost)
- Use sharp or canvas for compression

### Task 5.4: ChatToolbar (depth toggle + persona selector)

**Files:**
- Modify: `src/components/Chat/ChatToolbar.tsx`

- Depth toggle: segmented button (深度教学 | 学一点点)
- Persona selector: dropdown with preset + custom option
- Both controlled by App-level state, passed as props

---

## Phase 6: AI Integration (4 tasks)

### Task 6.1: API client (DeepSeek / OpenAI compatible)

**Files:**
- Create: `electron/lib/api-client.ts`

```typescript
// electron/lib/api-client.ts
import { buildSystemPrompt } from './context-builder'
import { extractStateJson, applyStateUpdate } from './state-updater'
import { readGame, writeGame } from './game-manager'
import type { AppConfig, Persona, GameState } from '../../src/types'

interface SendMessageOpts {
  text: string
  imageBase64?: string
  gameFilePath: string | null
  config: AppConfig
  persona: Persona
  gameState: GameState | null
}

export async function sendMessage(opts: SendMessageOpts): Promise<{
  reply: string
  stateUpdated: boolean
}> {
  const systemPrompt = buildSystemPrompt({
    gameState: opts.gameState,
    persona: opts.persona,
    depth: opts.config.depth,
    customPersonaPrompt: opts.config.customPersonaPrompt
  })

  const messages: Array<{ role: string; content: Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
    { role: 'system', content: [{ type: 'text', text: systemPrompt }] }
  ]

  const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = []
  if (opts.imageBase64) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${opts.imageBase64}` }
    })
  }
  if (opts.text) {
    userContent.push({ type: 'text', text: opts.text })
  } else if (opts.imageBase64 && !opts.text) {
    userContent.push({ type: 'text', text: '请分析这张截图。如果不确定我的意图（选牌/更新状态/路线建议等），请先问我。' })
  }
  messages.push({ role: 'user', content: userContent })

  const baseUrl = opts.config.apiProvider === 'deepseek'
    ? 'https://api.deepseek.com'
    : opts.config.baseUrl

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opts.config.apiKey}`
    },
    body: JSON.stringify({
      model: opts.config.model,
      messages,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const reply = data.choices[0].message.content

  // Update game state if AI included state JSON
  let stateUpdated = false
  if (opts.gameFilePath && opts.gameState) {
    const update = extractStateJson(reply)
    if (update) {
      const currentContent = readGame(opts.gameFilePath) // returns md string
      // Actually, we should re-read the raw MD...
      const fs = require('fs')
      const rawMd = fs.readFileSync(opts.gameFilePath, 'utf-8')
      const updatedMd = applyStateUpdate(rawMd, update)
      fs.writeFileSync(opts.gameFilePath, updatedMd, 'utf-8')
      stateUpdated = true
    }
  }

  return { reply, stateUpdated }
}
```

### Task 6.2: Wire IPC handlers in main process

**Files:**
- Modify: `electron/main.ts` — register IPC handlers for all electronAPI methods

### Task 6.3: Wire useChat hook + App.tsx send flow

**Files:**
- Create: `src/hooks/useChat.ts`
- Modify: `src/App.tsx`

### Task 6.4: Settings dialog

**Files:**
- Create: `src/components/Settings/SettingsDialog.tsx`
- Create: `src/components/Settings/ApiConfig.tsx`
- Create: `src/components/Settings/PersonaEditor.tsx`

---

## Phase 7: Polish & Package (3 tasks)

### Task 7.1: Error handling & logging

- API failure → show error toast, don't crash
- JSON parse failure → log, don't corrupt MD
- File not found → graceful message
- Use electron-log for file-based logging

### Task 7.2: Config management + personas preset

**Files:**
- Create: `resources/personas.json`
- Create: `resources/default-config.json`

```json
// resources/personas.json
[
  { "id": "default", "name": "默认", "description": "", "preset": true },
  { "id": "lbw", "name": "卢本伟", "description": "你说话要像卢本伟：口语化，带点东北腔，喜欢说'兄弟''干就完了''这波血赚'，语气豪爽轻松。", "preset": true },
  { "id": "yujie", "name": "东北雨姐", "description": "你说话要像东北雨姐：东北方言，爽朗豪迈，喜欢说'整''妥妥的''那必须的'，语气亲切接地气。", "preset": true },
  { "id": "trump", "name": "特朗普", "description": "You speak like Donald Trump: exaggerated confidence, use superlatives like 'tremendous' and 'the best', short punchy sentences. Make Spire Sensei great again! But always speak in Chinese.", "preset": true },
  { "id": "custom", "name": "✏ 自定义", "description": "", "preset": false }
]
```

### Task 7.3: Electron packaging for Windows

**Files:**
- Create: `electron-builder.json`

```json
{
  "appId": "com.spiresensei.app",
  "productName": "Spire Sensei",
  "directories": { "output": "release" },
  "win": {
    "target": "nsis",
    "icon": "resources/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  },
  "files": [
    "dist/**/*",
    "dist-electron/**/*",
    "resources/**/*"
  ]
}
```

Build command:
```bash
npm run electron:build
```

---

## Verification

### Per-phase verification
- Phase 1: `npm run electron:dev` → window with two-column layout
- Phase 2: Visual review of styled components in window
- Phase 3: `npx vitest` → all data layer tests pass
- Phase 4: Dashboard renders game state from MD file
- Phase 5: Chat input accepts text, images (paste/drop), sends messages
- Phase 6: Full flow — paste screenshot → AI responds → state updates → dashboard refreshes
- Phase 7: `npm run electron:build` → produces Windows .exe

### End-to-end smoke test
1. Launch app
2. Click "New Game" → select "铁甲战士"
3. Paste a screenshot of card reward screen
4. AI responds with recommendation
5. Left panel updates with selected card
6. Toggle depth to "学一点点" → AI responses become terse
7. Switch persona to "卢本伟" → AI style changes
8. Close and reopen → game file persists
