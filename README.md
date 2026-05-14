# Spire Sensei — 杀戮尖塔新手导师

Windows 桌面客户端，为《杀戮尖塔》(Slay the Spire 1) 新手玩家提供 AI 攻略指导。

## 功能

- 📸 **截图分析** — 粘贴游戏截图，AI 识别当前状态
- 🎯 **决策建议** — 选牌、路线、商店、战斗策略
- 🎭 **教练风格** — 预设多种人格（卢本伟、东北雨姐、特朗普、自定义）
- 📝 **状态管理** — 基于 Markdown 文件的游戏进度持久化

## 技术栈

Electron + React 18 + Vite 5 + TypeScript 5.5

## 开发

```bash
# 安装依赖
npm install

# 浏览器模式开发
npm run dev

# 测试
npm test

# 类型检查
npm run typecheck

# Electron 开发模式
npm run electron:dev

# 打包 Windows .exe
npm run electron:build
```
