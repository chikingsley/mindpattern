import { HumeConfig, HumeError } from '@/types/hume'
import baseTemplate from '@/utils/base-config.json'

// Ensure environment variables exist at startup
const HUME_API_KEY = process.env.HUME_API_KEY

if (!HUME_API_KEY) {
  throw new Error('HUME_API_KEY is not defined in environment variables')
}

class HumeApiError extends Error implements HumeError {
  status?: number
  code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'HumeApiError'
    this.status = status
    this.code = code
  }
}

async function fetchHume<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Use the validated API key from above
  const url = `https://api.hume.ai/v0/evi${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Hume-Api-Key': HUME_API_KEY,  // TypeScript now knows this is not undefined
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new HumeApiError(
      data.message || 'Hume API request failed',
      response.status,
      data.code
    )
  }

  return data as T
}

function createConfigPayload(username: string, email: string) {
  return {
    evi_version: baseTemplate.evi_version,
    name: `mindpattern_${username.toLowerCase()}`,
    version_description: `MindPattern config for @${username} (${email}) - Created ${new Date().toLocaleDateString()}`,
    prompt: {
      id: baseTemplate.prompt.id,
      version: baseTemplate.prompt.version,
      version_type: baseTemplate.prompt.version_type,
    },
    voice: baseTemplate.voice,
    language_model: baseTemplate.language_model,
    ellm_model: baseTemplate.ellm_model,
    tools: baseTemplate.tools,
    builtin_tools: baseTemplate.builtin_tools,
    event_messages: baseTemplate.event_messages,
    timeouts: baseTemplate.timeouts,
  }
}

export async function createHumeConfig(
  username: string,
  email: string
): Promise<HumeConfig> {
  console.log('Creating new Hume config for:', { username, email })
  
  const payload = createConfigPayload(username, email)
  console.log('Config payload:', JSON.stringify(payload, null, 2))

  const newConfig = await fetchHume<HumeConfig>('/configs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  console.log('Created new config:', {
    id: newConfig.id,
    name: newConfig.name,
    version: newConfig.version
  })

  return newConfig
}
