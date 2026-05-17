import watcherPrompt from './prompts/watcher'
import ironcladPrompt from './prompts/ironclad'

const prompts: Array<{ character: string; prompt: string }> = [
  { character: '观者', prompt: watcherPrompt },
  { character: '铁甲战士', prompt: ironcladPrompt },
  { character: '静默猎手', prompt: '' },
  { character: '故障机器人', prompt: '' }
]

export default prompts
