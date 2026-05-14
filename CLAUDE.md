# Spire Sensei — 杀戮尖塔新手导师客户端

Windows 客户端应用，为杀戮尖塔（Slay the Spire 1）新手提供 AI 攻略指导。

---

## 核心规则

1. **分阶段开发**：每完成一个 Phase 必须停下来，等待用户检查确认后才能进入下一 Phase
2. **一阶段一推送**：每个 Phase 完成后推送到 GitHub (`git push origin master`)
3. **TDD 开发**：先写测试，再看测试失败，写最少代码让测试通过，提交
4. **验证后完成**：确认功能正常（测试通过、可运行）再宣布任务完成
5. **优先联网搜索**：遇到无法自行解决的问题，优先使用 WebSearch 搜索解决方案，禁止闷头长时间自行排查
6. **每轮回复弹窗**：每次完成对话回复，末尾必须触发 PowerShell 弹窗提醒用户

---

## 技术栈

Electron + React 18 + Vite 5 + TypeScript 5.5

---

## 开发进度

| Phase | 内容 | 状态 |
|-------|------|------|
| Phase 1 | 项目脚手架（Electron + React + Vite + TS） | ✅ 完成 |
| Phase 2 | UI 设计（Dark Card Tavern 主题 + 全部组件） | ✅ 完成 |
| Phase 3 | 数据层（MD Parser/Writer/State Updater/Context Builder/Game Manager） | ✅ 完成 |
| Phase 4 | Dashboard 数据接入（IPC wrappers, useGameState hook, GameSelector） | ✅ 完成 |
| Phase 5 | Chat 面板数据接入（useChat hook, config 状态, image compressor） | ✅ 完成 |
| Phase 6 | AI 集成（API Client + IPC handlers + Settings dialog） | ✅ 完成 |
| Phase 7 | 打磨与打包（default-config, personas, electron-builder, scripts） | ✅ 完成 |
| Phase 8 | 供应商/模型下拉 + 多厂商 API + 配置持久化 + DeepSeek V4 图片修复 | ✅ 完成 |

**关键修复记录：**
- DeepSeek V4 API 端点是 `https://api.deepseek.com/chat/completions`（无 `/v1`），`/v1` 前缀会导致视觉功能不可用
- `api-client.ts` 的 URL 拼接逻辑：含版本路径（`/v\d+$` 或 `/api/paas/v\d+$`）时追加 `/chat/completions`，否则直接追加 `/chat/completions`
- 配置持久化通过 `handleConfigChange` 实时写入 disk + `useEffect` 启动加载

**GitHub:** https://github.com/xzyhshs/spire-sensei
