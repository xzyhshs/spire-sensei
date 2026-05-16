# 改动记录

## v0.2.8 — 2026-05-16

**回复深度控制 + 上下文记忆**

| 改动 | 涉及文件 |
|------|------|
| 角色 prompt 新增「回复深度控制」：极简/简洁/完整/截图 4 级策略，取消强制三维度拆解 | `data/character-prompts.ts` |
| DEFAULT_PERSONA 同步 4 级回复深度控制 | `electron/lib/context-builder.ts` |
| 新增「上下文记忆」规则：追问时先回顾上文已有信息，严禁要求重复提供 | `data/character-prompts.ts`, `electron/lib/context-builder.ts` |
| 修复 3 个历史遗留测试（英文→中文断言） | `tests/context-builder.test.ts` |

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

## v0.2.4 — 2026-05-16

**角色初始数据**

| 改动 | 涉及文件 |
|------|------|
| 4 角色初始卡组/遗物/生命值准确数据 | `data/characters.json` |
| game-manager 基于角色数据生成模板 | `electron/lib/game-manager.ts` |

---

> 早期版本（v0.2.0 → v0.2.3）的改动记录省略，详见 `git log 4ffd626..dba8e03`
