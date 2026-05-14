export interface VendorModel {
  id: string
  name: string
  note: string
}

export interface Vendor {
  id: string
  name: string
  baseUrl: string
  models: VendorModel[]
}

export const VENDORS: Vendor[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-v4-pro', name: 'V4 Pro', note: '旗舰模型，1M上下文，支持识图，编程/推理强' },
      { id: 'deepseek-v4-flash', name: 'V4 Flash', note: '轻量快速，284B/13B激活，性价比高，支持识图' },
      { id: 'deepseek-chat', name: 'Chat (旧)', note: 'V4-Flash映射，2026年7月退役，不支持识图' },
    ]
  },
  {
    id: 'qwen',
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen3.6-plus', name: 'Qwen3.6 Plus', note: '均衡主力，MoE 72B/18B，1M上下文，支持图/视频' },
      { id: 'qwen3.6-flash', name: 'Qwen3.6 Flash', note: '极速低成本，MoE 35B/3B，1M上下文，高并发' },
      { id: 'qwen3.6-max-preview', name: 'Qwen3.6 Max', note: '编程旗舰，能力最强，262K上下文，价格较高' },
      { id: 'qwen3-max', name: 'Qwen3 Max (稳定)', note: '复杂任务最强稳定版，262K上下文，支持thinking' },
      { id: 'qwen-plus', name: 'Qwen Plus', note: '性能/成本均衡，1M上下文，支持thinking' },
      { id: 'qwen-flash', name: 'Qwen Flash', note: '极低成本快速响应，1M上下文' },
    ]
  },
  {
    id: 'doubao',
    name: '豆包',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    models: [
      { id: 'doubao-seed-2-0-pro-260215', name: 'Seed 2.0 Pro', note: '旗舰Agent模型，深度推理/长链路，对标GPT-5.2' },
      { id: 'doubao-seed-2-0-lite-260215', name: 'Seed 2.0 Lite', note: '均衡型，综合能力超1.8，性价比之选' },
      { id: 'doubao-seed-2-0-mini-260215', name: 'Seed 2.0 Mini', note: '低时延高并发，256K上下文，成本敏感场景' },
      { id: 'doubao-seed-2-0-code-preview-260215', name: 'Seed 2.0 Code', note: '编程专用，集成TRAE，适配Claude Code' },
    ]
  },
  {
    id: 'kimi',
    name: 'Kimi',
    baseUrl: 'https://api.moonshot.ai/v1',
    models: [
      { id: 'kimi-k2.6', name: 'K2.6 (最新)', note: '多模态(图/视频)，256K上下文，Agent执行，自纠错' },
    ]
  },
  {
    id: 'glm',
    name: 'GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'GLM-5.1', name: 'GLM-5.1', note: '最新旗舰，744B MoE/40B激活，200K上下文，Agent编程强' },
      { id: 'GLM-5', name: 'GLM-5', note: 'Agentic Engineering基座，200K上下文' },
      { id: 'GLM-4.7', name: 'GLM-4.7', note: 'Agentic Coding专精，358B MoE，205K上下文' },
      { id: 'GLM-4.6', name: 'GLM-4.6', note: '均衡型，357B MoE，200K上下文，对标Sonnet 4' },
      { id: 'GLM-4.7-Flash', name: 'GLM-4.7 Flash', note: '免费普惠版，30B，128K上下文' },
    ]
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    models: [
      { id: 'MiniMax-M2.7', name: 'M2.7', note: '递归自改进，Agent编程56.2% SWE-Pro，204K上下文' },
      { id: 'MiniMax-M2.5', name: 'M2.5', note: 'SOTA编程80.2% SWE-Bench，1M上下文，性价比极高' },
      { id: 'MiniMax-M2.1', name: 'M2.1', note: '多语言编程增强，204K上下文，接近Sonnet 4.5' },
    ]
  },
]
