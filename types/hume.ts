export interface HumePrompt {
  id: string
  version: number
  version_type: 'FIXED' | 'LATEST'
  version_description: string
  name: string
  created_on: number
  modified_on: number
  text: string
}

export interface HumeVoice {
  provider: 'HUME_AI'
  name: 'KORA'
  custom_voice: null
}

export interface HumeLanguageModel {
  model_provider: 'OPEN_AI'
  model_resource: string
  temperature: number
}

export interface HumeConfig {
  id: string
  version: number
  evi_version: '1' | '2'
  version_description: string
  name: string
  created_on: number
  modified_on: number
  prompt: HumePrompt
  voice: HumeVoice
  language_model: HumeLanguageModel
  ellm_model: {
    allow_short_responses: boolean
  }
  tools: any[]
  builtin_tools: Array<{
    tool_type: 'BUILTIN'
    name: string
    fallback_content: null
  }>
  event_messages: {
    on_new_chat: { enabled: boolean; text: string | null }
    on_resume_chat: { enabled: boolean; text: string | null }
    on_disconnect_resume_chat: { enabled: boolean; text: string | null }
    on_inactivity_timeout: { enabled: boolean; text: string | null }
    on_max_duration_timeout: { enabled: boolean; text: string | null }
  }
  timeouts: {
    inactivity: { enabled: boolean; duration_secs: number }
    max_duration: { enabled: boolean; duration_secs: number }
  }
}

export interface HumeError extends Error {
  status?: number
  code?: string
}
