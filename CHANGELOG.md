# 改动记录

## v0.5.5 — 2026-05-17

**铁甲战士/静默猎手/故障机器人角色 Prompt 重构**

| 改动 | 涉及文件 |
|------|------|
| 铁甲战士 prompt 重写：对齐观者结构，砍掉优先判断表（~90行），禁止事项从 14→9 条 | `data/prompts/ironclad.ts` |
| 静默猎手 prompt 新增（对标 ChatGPT 5.5 教学版） | `data/prompts/silent.ts` |
| 故障机器人 prompt 新增（对标 ChatGPT 5.5 教学版） | `data/prompts/defect.ts` |
| 注册静默猎手/故障机器人 prompt | `data/character-prompts.ts` |
| 四个角色统一结构：角色设定→核心原则→决策流程→构筑方向→实战格式→阶段优先级→升级/删除→遗物配合→禁止事项 | — |

## v0.5.4 — 2026-05-17

**截图铁律：不管用户问什么，识别出血量/层数/金币就自动更新**

| 改动 | 涉及文件 |
|------|------|
| BASE_RULES 新增"截图铁律"首段（最高优先级），无条件先更新再回答 | `electron/lib/context-builder.ts` |
| 观者 prompt 截图规则提前到实战输出格式最前，强化措辞 | `data/prompts/watcher.ts` |
| 铁甲战士 prompt 补充截图自动更新规则（之前缺失） | `data/prompts/ironclad.ts` |

## v0.5.3 — 2026-05-17

**切换存档时对话框显示加载指示器（防止用户以为卡死）**

| 改动 | 涉及文件 |
|------|------|
| `useGameState` 暴露 `setLoading`，移除 `switchGame`/`createGame` 内部 loading 控制 | `src/hooks/useGameState.ts` |
| `handleCreateGame`/`handleSwitchGame` 用 `setLoading` 包裹全流程（含 saveChatHistory + loadChatHistory） | `src/App.tsx` |
| `ChatPanel` 接收 `loading` prop，loading 时显示旋转加载圈 + "正在切换存档..." | `src/components/Chat/ChatPanel.tsx` |
| `AppLayout` 传递 `loading` 给 `ChatPanel` | `src/components/Layout/AppLayout.tsx` |
| `ChatInput` 接收 `loading` prop，loading 时禁用输入 + placeholder 显示 "正在切换存档..." | `src/components/Chat/ChatInput.tsx` |
| 添加 `@keyframes spin` 动画 | `src/styles/design-system.css` |

## v0.5.2 — 2026-05-17

**修复快速通道更新指令将卡牌误判为遗物（"+1不惧妖邪"→addRelics 而非 addCards）**

| 改动 | 涉及文件 |
|------|------|
| `buildMinimalUpdatePrompt` 加 `userText` 参数，注入提及的卡牌数据 + 卡牌/遗物判别规则（+N XX 先查卡牌数据，命中则用 addCards，默认按卡牌处理） | `electron/lib/context-builder.ts` |
| `sendUpdateCommand` 传入 `opts.text` 给 `buildMinimalUpdatePrompt` | `electron/lib/api-client.ts` |

## v0.5.1 — 2026-05-17

**修复图片在 Round 2 被重复发送（"截图+选哪张" 从 110s 降到 ~50s）**

| 改动 | 涉及文件 |
|------|------|
| Round 2 前删掉用户消息中的图片内容，只保留文本，避免 DeepSeek 二次视觉编码 | `electron/lib/api-client.ts` |

## v0.5.0 — 2026-05-17

**更新指令快速通道（"+1 停顿" 从 ~60s 降到 ~5s）**

| 改动 | 涉及文件 |
|------|------|
| 新增 `buildMinimalUpdatePrompt()` — 仅 BASE_RULES + 游戏状态，不含角色 prompt | `electron/lib/context-builder.ts` |
| 新增 `sendUpdateCommand()` — 非流式、单次 API、强制 tool_choice、客户端合成回复 | `electron/lib/api-client.ts` |
| 新增 `summarizeUpdate()` — 解析 tool call 参数生成中文确认文本 | `electron/lib/api-client.ts` |
| 新增 `api:sendUpdate` IPC handler | `electron/main.ts` |
| 新增 `isUpdateCommand()` — 正则匹配 +N/-N/加/删/升级/降级等 11 种更新指令模式 | `src/hooks/useChat.ts` |
| sendMessage 检测更新指令后走快速通道，跳过流式、跳过第二次 API | `src/hooks/useChat.ts` |
| preload + 类型声明 | `electron/preload.ts`, `src/types/electron.d.ts` |

## v0.4.4 — 2026-05-17

**移除"当前选项"功能**

| 改动 | 涉及文件 |
|------|------|
| GameState 删除 `options` 字段 | `src/types/index.ts` |
| 删除 Dashboard "当前选项" 面板 | `src/components/Dashboard/Dashboard.tsx` |
| 删除 `parseOptions` 函数及调用 | `electron/lib/md-parser.ts` |
| 删除 `# 当前选项` 写入段落 | `electron/lib/md-writer.ts` |
| 删除 `options`/`clearOptions` 接口字段和更新逻辑 | `electron/lib/state-updater.ts` |
| STATE_UPDATE_TOOL 删除 `options`/`clearOptions` 参数 | `electron/lib/api-client.ts` |
| 初始模板删除 `# 当前选项` | `electron/lib/game-manager.ts` |
| 测试文件同步清理 options 引用 | `tests/md-parser.test.ts`, `tests/md-writer.test.ts`, `tests/state-updater.test.ts`, `tests/context-builder.test.ts` |

## v0.4.3 — 2026-05-17

**修复输入框一段时间后卡死（sendingPhase 永不恢复 idle）**

| 改动 | 涉及文件 |
|------|------|
| `api:sendMessageStream` handler 加 try/catch，同步操作异常时发送 `api:error` 事件 | `electron/main.ts` |
| `onToolExecuting` 重置 `firstChunkRef`，避免 Round 2 流式阶段卡在 tool-executing | `src/hooks/useChat.ts` |
| `sendMessageStream` invoke 加 `.catch()` 安全网，用 `streamResolverRef` resolve Promise 防永久挂起 | `src/hooks/useChat.ts` |

## v0.4.2 — 2026-05-17

**消息发送进度指示器**

| 改动 | 涉及文件 |
|------|------|
| 新增 `SendingPhase` 类型（idle/sending/waiting/receiving/tool-executing） | `src/types/index.ts` |
| useChat 用 `sendingPhase` 替代 `sending`，加计时器 + 字数统计 | `src/hooks/useChat.ts` |
| 新增 ProgressIndicator 组件：进度条 + 阶段标签 + 计时/字数 | `src/components/Chat/ProgressIndicator.tsx` |
| ChatPanel 三点跳动替换为 ProgressIndicator | `src/components/Chat/ChatPanel.tsx` |
| StreamCallbacks 加 `onToolExecuting` 回调，工具调用时通知渲染进程 | `electron/lib/api-client.ts` |
| 转发 `api:tool-executing` 事件 | `electron/main.ts`, `electron/preload.ts` |
| ElectronAPI 类型声明 + 组件 props 链路更新 | `src/types/electron.d.ts`, `src/App.tsx`, `src/components/Layout/AppLayout.tsx` |

## v0.4.1 — 2026-05-17

**修复更新指令时 AI 输出废话分析**

| 改动 | 涉及文件 |
|------|------|
| 更新指令规则从"简短确认即可"改为"只更新不分析，禁止展开"，明确覆盖截图 + "【更新卡组】"场景 | `data/prompts/watcher.ts` |

## v0.4.0 — 2026-05-17

**观者 Prompt 补回复深度控制 + 截图自动更新提醒**

| 改动 | 涉及文件 |
|------|------|
| 实战输出格式加触发条件：完整分析 vs 简短回复的场景区分 | `data/prompts/watcher.ts` |
| 截图场景加 update_game_state 自动更新血量/层数/金币提醒 | `data/prompts/watcher.ts` |

## v0.3.9 — 2026-05-17

**替换观者 Prompt 为 ChatGPT 5.5 教学版**

| 改动 | 涉及文件 |
|------|------|
| 观者 prompt 完全替换：五问决策框架 + 四步选牌流程 + 固定输出格式 + 10 条禁止事项 | `data/prompts/watcher.ts` |
| 删除"当前玩家状态记录模板"（依赖 context-builder.ts 注入 JSON） | `data/prompts/watcher.ts` |

## v0.3.8 — 2026-05-16

**图片发送前自动压缩 + 角色 Prompt 拆分为独立文件**

| 改动 | 涉及文件 |
|------|------|
| 新增 Canvas 缩放工具：宽度 >1280px 等比缩至 1280，JPEG 质量 70%，3MB→~150KB | `src/lib/image-compress.ts` |
| ChatInput 粘贴/拖放/选文件三处发送前先压缩 | `src/components/Chat/ChatInput.tsx` |
| 观者/铁甲战士 prompt 拆分为独立文件，便于维护 | `data/prompts/watcher.ts`, `data/prompts/ironclad.ts`, `data/character-prompts.ts` |

## v0.3.7 — 2026-05-16

**修复 AI 截图后不自动更新左侧状态（血量/金币/层数）**

| 改动 | 涉及文件 |
|------|------|
| BASE_RULES 截图规则从许可性语言（"可以""请"）改为有条件强制（"有则必须更新，禁止跳过"） | `electron/lib/context-builder.ts` |

## v0.3.6 — 2026-05-16

**修复 AI 频繁使用侮辱性词汇（如"狗命"）**

| 改动 | 涉及文件 |
|------|------|
| 观者/铁甲战士 prompt 语气指令从"严厉纠正绝不委婉"改为"直接指正，禁止侮辱性词汇" | `data/character-prompts.ts` |
| 清理 prompt 自身攻击性示范词（垃圾→负担、废纸→负担、拿命赌→赌、当爹供→无脑抓、莽夫→暴力输出） | `data/character-prompts.ts` |
| DEFAULT_PERSONA 新增红线：禁止侮辱性、粗鄙或贬低性词汇 | `electron/lib/context-builder.ts` |

## v0.3.5 — 2026-05-16

**修复 AI 选牌推荐不自检跳过（一边说别拿牌一边又推荐拿牌）**

| 改动 | 涉及文件 |
|------|------|
| 删除"简洁回复"死规则（深度教学切换按钮已删，该规则却持续压制跳过建议） | `data/character-prompts.ts`, `electron/lib/context-builder.ts` |
| 选牌结论逻辑改为「跳过优先」：先判断是否跳过，确定该拿才指名具体卡牌 | `data/character-prompts.ts` |
| DEFAULT_PERSONA 新增「选牌决策铁律」：卡组臃肿或候选非核心引擎时建议跳过 | `electron/lib/context-builder.ts` |

## v0.3.4 — 2026-05-16

**修复发图片后输入框卡死（~1分钟无响应）**

| 改动 | 涉及文件 |
|------|------|
| 聊天记录不再保存 base64 图片数据（减少 IPC 序列化体积，消除主线程阻塞） | `src/hooks/useChat.ts` |
| MessageBubble 加 `React.memo`（避免未变化消息的无效重渲染） | `src/components/Chat/MessageBubble.tsx` |
| 流式 chunk 更新节流（`requestAnimationFrame` 合并渲染，减少 setMessages 频率） | `src/hooks/useChat.ts` |

## v0.3.3 — 2026-05-16

**修复卡牌升级状态未显示（AI 搞错升级版本）**

| 改动 | 涉及文件 |
|------|------|
| `formatCardsForPrompt` 支持显示升级状态：未升级显示两种效果，已升级标注 `[已升级]` 且只显示升级后效果 | `electron/lib/card-db.ts` |
| context-builder 构建 upgradeMap 传入卡牌数据 | `electron/lib/context-builder.ts` |

## v0.3.2 — 2026-05-16

**修复卡牌数量显示（AI 数错牌）**

| 改动 | 涉及文件 |
|------|------|
| `formatCardsForPrompt` 支持显示数量：`打击 ×4 (1费 攻击): ...` | `electron/lib/card-db.ts` |
| 牌组卡牌数据标题显示总张数：`牌组卡牌数据（共16张）` | `electron/lib/context-builder.ts` |

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
