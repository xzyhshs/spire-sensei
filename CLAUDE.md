# Spire Sensei — 杀戮尖塔新手导师客户端

Windows 客户端应用，为杀戮尖塔（Slay the Spire 1）新手提供游戏攻略、卡牌推荐和决策指导。

---

## 全局 Skills（Superpowers）

以下 skills 来自 `C:\ai\.claude\skills`（Superpowers 插件），全局可用：

### 工作流核心

| Skill | 触发时机 | 说明 |
|-------|----------|------|
| **brainstorming** | 写代码前 | Socratic 式需求澄清，生成设计文档 |
| **using-git-worktrees** | 设计确认后 | 创建隔离 git worktree，验证干净基线 |
| **writing-plans** | 设计确认后 | 将工作拆分为 2-5 分钟的 bite-sized 任务 |
| **subagent-driven-development** | 有计划后 | 每个任务分派独立 subagent，两阶段审查（规范合规 → 代码质量） |
| **executing-plans** | 有计划后 | 批量执行任务，含人工检查点 |
| **finishing-a-development-branch** | 任务完成时 | 验证测试，提供 merge/PR/keep/discard 选项 |

### 代码质量

| Skill | 说明 |
|-------|------|
| **test-driven-development** | RED-GREEN-REFACTOR 循环：先写失败测试，看它失败，写最少代码，看它通过，提交 |
| **requesting-code-review** | 按计划审查代码，按严重性分级报告，严重问题阻塞进度 |
| **receiving-code-review** | 处理审查反馈 |
| **verification-before-completion** | 确保问题真的修复了再宣布完成 |

### 调试

| Skill | 说明 |
|-------|------|
| **systematic-debugging** | 4 阶段根因分析（根因追踪、纵深防御、条件等待） |

### 并行与协作

| Skill | 说明 |
|-------|------|
| **dispatching-parallel-agents** | 并行分派 subagent 处理独立任务 |

### 元技能

| Skill | 说明 |
|-------|------|
| **writing-skills** | 创建新 skill 的最佳实践 |
| **using-superpowers** | Superpowers 系统介绍 |

---

## 项目约定

- 所有代码开发遵循 Superpowers 工作流：先 brainstorm → 写计划 → subagent 执行 → 审查
- 使用 TDD：先写测试，再写代码
- 任务完成后必须走 verification-before-completion 验证
