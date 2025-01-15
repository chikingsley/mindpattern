/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Set up environment variables before importing the module
process.env.HUME_API_KEY = 'test-api-key'

// Mock Headers class for fetch responses
class MockHeaders {
  private headers: Record<string, string> = {}
  
  constructor(init?: Record<string, string>) {
    if (init) {
      this.headers = { ...init }
    }
  }
  
  get(name: string): string | null {
    return this.headers[name.toLowerCase()] || null
  }
}

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock the types import
vi.mock('../types/hume', () => ({
  HumeConfig: class {},
  HumeError: class {}
}))

// Mock the base prompt import
vi.mock('./prompts/base-prompt', () => ({
  BASE_PROMPT: '<role>You are an AI assistant focused on helping users understand and process their thoughts and emotions.</role>'
}))

// Import after mocks are set up
import { createConfigPayload, isValidUUID, createHumeConfig, deleteHumeConfig } from './hume'

describe('Hume Utilities', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('createConfigPayload', () => {
    it('creates a valid config payload with correct user info', () => {
      const username = 'testuser'
      const email = 'test@example.com'
      
      const payload = createConfigPayload(username, email)
      
      expect(payload).toMatchObject({
        evi_version: "2",
        name: `mindpattern_${username}`,
        version_description: expect.stringContaining(username),
        prompt: expect.any(Object),
        voice: expect.any(Object),
        language_model: expect.any(Object),
        ellm_model: expect.any(Object),
        tools: expect.any(Array),
        builtin_tools: expect.any(Array),
        event_messages: expect.any(Object),
        timeouts: expect.any(Object)
      })
    })
  })

  describe('isValidUUID', () => {
    it('returns true for valid UUIDs', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987fcdeb-51a2-3e4b-9876-543210987654'
      ]
      
      validUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(true)
      })
    })

    it('returns false for invalid UUIDs', () => {
      const invalidUUIDs = [
        '',
        'not-a-uuid',
        '123e4567-e89b-12d3-a456', // incomplete
        '123e4567-e89b-12d3-a456-42661417400g' // invalid character
      ]
      
      invalidUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(false)
      })
    })
  })

  describe('createHumeConfig', () => {
    it('creates a config successfully', async () => {
      const mockResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'mindpattern_testuser',
        version: '1'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new MockHeaders({ 'content-length': '100' }),
        json: () => Promise.resolve(mockResponse)
      })

      const result = await createHumeConfig('testuser', 'test@example.com')
      
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.hume.ai/v0/evi/configs',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Hume-Api-Key': 'test-api-key'
          })
        })
      )
    })

    it('throws error when API returns non-UUID', async () => {
      const mockResponse = {
        id: 'not-a-uuid',
        name: 'mindpattern_testuser',
        version: '1'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new MockHeaders({ 'content-length': '100' }),
        json: () => Promise.resolve(mockResponse)
      })

      await expect(
        createHumeConfig('testuser', 'test@example.com')
      ).rejects.toThrow('Invalid UUID format')
    })

    it('throws error when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new MockHeaders({ 'content-length': '100' }),
        json: () => Promise.resolve({ message: 'API Error' })
      })

      await expect(
        createHumeConfig('testuser', 'test@example.com')
      ).rejects.toThrow('Hume API request failed')
    })
  })

  describe('deleteHumeConfig', () => {
    it('deletes a config successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new MockHeaders()
      })

      await expect(
        deleteHumeConfig('123e4567-e89b-12d3-a456-426614174000')
      ).resolves.not.toThrow()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.hume.ai/v0/evi/configs/123e4567-e89b-12d3-a456-426614174000',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Hume-Api-Key': 'test-api-key'
          })
        })
      )
    })

    it('throws error when deleting non-existent config', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new MockHeaders({ 'content-length': '100' }),
        json: () => Promise.resolve({ message: 'Config not found' })
      })

      await expect(
        deleteHumeConfig('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow('Hume API request failed')
    })

    it('throws error for invalid UUID format', async () => {
      await expect(
        deleteHumeConfig('not-a-uuid')
      ).rejects.toThrow('Invalid UUID format')

      expect(mockFetch).not.toHaveBeenCalled()
    })
  })
})
