import { HumeConfig, HumeError } from '@/types/hume'
import { BASE_PROMPT } from '@/utils/prompts/base-prompt'

// Ensure environment variables exist at startup
const _HUME_API_KEY = process.env.HUME_API_KEY 

if (!_HUME_API_KEY) {
  throw new Error('HUME_API_KEY is not defined in environment variables')
}

const HUME_API_KEY = _HUME_API_KEY

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
      'X-Hume-Api-Key': HUME_API_KEY,  
      ...options.headers,
    },
  })

  // For DELETE requests or other requests that might return empty body
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  try {
    const data = await response.json()

    if (!response.ok) {
      throw new HumeApiError(
        data.message || 'Hume API request failed',
        response.status,
        data.code
      )
    }

    return data as T
  } catch (error) {
    if (!response.ok) {
      throw new HumeApiError(
        'Hume API request failed',
        response.status
      )
    }
    throw error;
  }
}

function createConfigPayload(username: string, email: string) {
  return {
    evi_version: "2",
    name: `mindpattern_${username.toLowerCase()}`,
    version_description: `MindPattern config for @${username} (${email}) - Created ${new Date().toLocaleDateString()}`,
    prompt: {
      text: BASE_PROMPT
    },
    voice: {
      provider: "CUSTOM_VOICE",
      custom_voice: {
        name: "SIMON",
        base_voice: "WHIMSY",
        parameter_model: "20241004-11parameter",
        parameters: {
          gender: -100,
          assertiveness: 100,
          buoyancy: 100,
          confidence: 100,
          enthusiasm: 100,
          nasality: -100,
          relaxedness: -100,
          smoothness: -100,
          tepidity: 100,
          tightness: 100
        }   
      }
    },
    language_model: {
      model_provider: "OPEN_AI",
      model_resource: "https://tolerant-bengal-hideously.ngrok-free.app/api/chat/completions",
      temperature: 0.7
    },
    ellm_model: {
      allow_short_responses: false
    },
    tools: [],
    builtin_tools: [
      {
        tool_type: "BUILTIN" as const,
        name: "web_search",
        fallback_content: null
      },
      {
        tool_type: "BUILTIN" as const,
        name: "hang_up",
        fallback_content: null
      }
    ],
    event_messages: {
      on_new_chat: { enabled: false, text: null },
      on_resume_chat: { enabled: false, text: null },
      on_disconnect_resume_chat: { enabled: false, text: null },
      on_inactivity_timeout: { enabled: false, text: null },
      on_max_duration_timeout: { enabled: false, text: null }
    },
    timeouts: {
      inactivity: {
        enabled: true,
        duration_secs: 120
      },
      max_duration: {
        enabled: true,
        duration_secs: 1800
      }
    }
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

  // Validate the ID is a UUID
  if (!isValidUUID(newConfig.id)) {
    throw new HumeApiError(
      `Invalid UUID format returned from Hume API: ${newConfig.id}`,
      400,
      'INVALID_UUID'
    )
  }

  console.log('Created new config:', {
    id: newConfig.id,
    name: newConfig.name,
    version: newConfig.version
  })

  return newConfig
}

export async function deleteHumeConfig(configId: string): Promise<void> {
  console.log('Deleting Hume config:', configId)
  
  // Validate UUID format
  if (!isValidUUID(configId)) {
    throw new HumeApiError(
      `Invalid UUID format: ${configId}`,
      400,
      'INVALID_UUID'
    )
  }
  
  await fetchHume(`/configs/${configId}`, {
    method: 'DELETE',
  })

  console.log('Successfully deleted Hume config:', configId)
}

// UUID validation helper
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}
