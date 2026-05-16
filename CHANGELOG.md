# 改动记录

## v0.3.1 — 2026-05-16

**移除深度教学切换功能**

| 改动 | 涉及文件 |
|------|------|
| 删除 ChatToolbar "深度教学"/"学一点点" 按钮 | `src/components/Chat/ChatToolbar.tsx` |
| 删除 `AppConfig.depth` 字段 | `src/types/index.ts` |
| 删除 `DEFAULT_CONFIG.depth` | `src/App.tsx` |
| 删除 `DEPTH_DEEP`/`DEPTH_SHALLOW` 常量和注入逻辑 | `electron/lib/context-builder.ts` |
| 删除 config 构建中的 `depth` 字段 | `electron/main.ts`, `electron/lib/api-client.ts` |
| 删除 2 个深度模式测试用例 | `tests/context-builder.test.ts` |

## v0.3.0 — 2026-05-16

**修复 4 个 Prompt 冲突/瑕疵**

| 改动 | 涉及文件 |
|------|------|
| 三维痛点诊断从"每次必须诊断"改为"完整分析模式下诊断"（消除与回复深度控制的冲突） | `data/character-prompts.ts` |
| 三维诊断加引导："先检查下方牌组卡牌数据，再对照维度诊断" | `data/character-prompts.ts` |
| DEFAULT_PERSONA "指出最缺方向" 加条件限定（消除与极简回复的冲突） | `electron/lib/context-builder.ts` |
| 修复卡牌数据显示双句号 `。。` → `。` | `electron/lib/card-db.ts` |

## v0.2.9 — 2026-05-16

**强化游戏状态感知**

| 改动 | 涉及文件 |
|------|------|
| 游戏状态前加固化指令：必须先基于实际数据回答，而非通用理论 | `electron/lib/context-builder.ts` |
| 观者、铁甲战士、DEFAULT_PERSONA 加点：回答策略问题前必须先检查当前游戏状态 | `data/character-prompts.ts`, `electron/lib/context-builder.ts` |

## v0.2.8 — 2026-05-16

**回复深度控制 + 上下文记忆**

| 改动 | 涉及文件 |
|------|------|
| 角色 prompt 新增「回复深度控制」：极简/简洁/完整/截图 4 级策略，取消强制三维度拆解 | `data/character-prompts.ts` |
| DEFAULT_PERSONA 同步 4 级回复深度控制 | `electron/lib/context-builder.ts` |
| 新增「上下文记忆」规则：追问时先回顾上文已有信息，严禁要求重复提供 | `data/character-prompts.ts`, `electron/lib/context-builder.ts` |
| 修复 3 个历史遗留测试（英文→中文断言） | `tests/context-builder.test.ts` |
| 创建 CHANGELOG.md 改动记录文档 | `CHANGELOG.md` |

## v0.2.7 — 2026-05-16

**铁甲战士角色 Prompt**

| 改动 | 涉及文件 |
|------|------|
| 铁甲战士专属 prompt（人设、特化算法、三维诊断、流派评估表、实战模板） | `data/character-prompts.ts` |

## v0.2.6 — 2026-05-16

**角色专属 Prompt 系统**

| 改动 | 涉及文件 |
|------|------|
| 两层 prompt 架构：角色策略层 + 通用底层规则 | `electron/lib/context-builder.ts` |
| 观者专属 prompt（完整策略+流派评估） | `data/character-prompts.ts` |
| 拆分 GAME_KNOWLEDGE → DEFAULT_PERSONA + BASE_RULES | `electron/lib/context-builder.ts` |

## v0.2.5 — 2026-05-16

**移除药水系统**

| 改动 | 涉及文件 |
|------|------|
| 删除药水 UI（按钮 + 状态徽章） | `Dashboard.tsx`, `ChatInput.tsx` |
| 删除药水数据结构 | `types/index.ts`, `md-parser.ts`, `md-writer.ts`, `state-updater.ts` |
| 删除 API 工具参数中的药水字段 | `api-client.ts` |
| 测试文件同步移除药水引用 | `tests/md-parser.test.ts`, `tests/md-writer.test.ts`, `tests/state-updater.test.ts` |

## v0.2.4 — 2026-05-16

**角色初始数据**

| 改动 | 涉及文件 |
|------|------|
| 4 角色初始卡组/遗物/生命值准确数据 | `data/characters.json` |
| game-manager 基于角色数据生成模板 | `electron/lib/game-manager.ts` |

## v0.2.3 — 2026-05-15

**卡牌数据库 + 系统提示词强化**

| 改动 | 涉及文件 |
|------|------|
| 5 套卡牌数据（铁甲/静默/观者/故障/无色） | `data/cards/*.json` |
| card-db.ts 查询引擎 + lookup_cards 工具 | `electron/lib/card-db.ts`, `electron/lib/api-client.ts` |
| 强制 lookup_cards 查询：禁止凭记忆回答卡牌效果 | `electron/lib/context-builder.ts` |
| 自动注入对话中提及的卡牌数据 | `electron/lib/context-builder.ts`, `electron/lib/card-db.ts` |
| 卡牌 JSON 打包进 JS（消除运行时 fs 依赖） | `electron/lib/card-db.ts` |
| 观者卡牌数据修正 | `data/cards/观者.json` |
| 版本标题回退兜底 | `electron/main.ts` |
| 移除冲突的 HTML title 标签 | `src/index.html` |
| 聊天自动滚动修复 | `src/components/Chat/ChatPanel.tsx` |

## v0.2.2 — 2026-05-15

**版本号显示 + 系统提示词上线**

| 改动 | 涉及文件 |
|------|------|
| 窗口标题栏显示版本号 | `src/App.tsx`, `electron/main.ts` |
| "高塔顶级教练"系统提示词 | `electron/lib/context-builder.ts` |
| 存档聊天记录持久化 + 删除存档按钮 | `electron/lib/game-manager.ts`, `electron/main.ts` |
| Dashboard 动画效果 | `src/components/Dashboard/Dashboard.tsx` |
| 视觉自动更新层数/金币/血量（截图识别） | `electron/lib/context-builder.ts` |
| 严格状态更新门禁：禁止从疑问句提取指令 | `electron/lib/context-builder.ts` |
| 取消按钮 + 模式自动清除 + 纯中文 + 模型名称显示 + 滚动修复 | `src/components/Chat/ChatInput.tsx`, `src/hooks/useChat.ts` |

## v0.2.0 — 2026-05-14

**Function Calling 架构 + 首次打包**

| 改动 | 涉及文件 |
|------|------|
| Function Calling 替代 Markdown 状态更新 | `electron/lib/api-client.ts` |
| SSE 流式响应 + tool call 处理 | `electron/lib/api-client.ts`, `electron/main.ts` |
| update_game_state 工具（卡牌/遗物/血量/金币增删改） | `electron/lib/state-updater.ts` |
| Dashboard 中文化 + 分页 | `src/components/Dashboard/Dashboard.tsx`, `GameSelector.tsx` |
| 多供应商/模型下拉 + 多厂商 API + DeepSeek V4 修复 | `src/components/Settings/ApiConfig.tsx`, `electron/lib/api-client.ts` |
| 配置持久化（实时写入 + 启动加载） | `electron/main.ts` |
| Personas 预设语气风格 | `src/components/Settings/SettingsDialog.tsx` |
| electron-builder NSIS 打包 + 中文镜像 | `electron-builder.json`, `package.json` |

---

## v0.1.x — 2026-05-12 ~ 2026-05-14

**项目开发阶段（Phase 1 → Phase 8）**

| Phase | 内容 |
|-------|------|
| Phase 1 | 项目脚手架：Electron + React 18 + Vite 5 + TypeScript 5.5 |
| Phase 2 | UI 设计：Dark Card Tavern 主题、AppLayout、Dashboard、ChatPanel |
| Phase 3 | 数据层：MD Parser/Writer、State Updater、Context Builder、Game Manager |
| Phase 4 | Dashboard 数据接入：IPC wrappers、useGameState hook、GameSelector |
| Phase 5 | Chat 面板数据接入：useChat hook、config 状态、图片压缩 |
| Phase 6 | AI 集成：API Client、IPC handlers、Settings dialog |
| Phase 7 | 打磨与打包：default-config、personas、electron-builder、scripts |
| Phase 8 | 多厂商 API：供应商/模型下拉、配置持久化、DeepSeek V4 图片修复 |
