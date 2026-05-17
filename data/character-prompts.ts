import watcherPrompt from './prompts/watcher'
import ironcladPrompt from './prompts/ironclad'
import silentPrompt from './prompts/silent'
import defectPrompt from './prompts/defect'

const prompts: Array<{ character: string; prompt: string }> = [
  { character: '观者', prompt: watcherPrompt },
  { character: '铁甲战士', prompt: ironcladPrompt },
  { character: '静默猎手', prompt: silentPrompt },
  { character: '故障机器人', prompt: defectPrompt }
]

export default prompts
