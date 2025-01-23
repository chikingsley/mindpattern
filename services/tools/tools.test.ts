import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { handleWeather, handleUserProfile, ToolCall } from './types';
import fs from 'fs/promises';
import path from 'path';

describe('Weather Tool', () => {
  it('should return correct temperature for Tokyo', async () => {
    const toolCall: ToolCall = {
      id: 'test-id',
      index: 0,
      function: {
        name: 'get_current_weather',
        arguments: '{"location": "Tokyo, Japan", "unit": "celsius"}'
      }
    };

    const result = await handleWeather(toolCall);
    const parsed = JSON.parse(result.output);
    
    expect(parsed.temperature).toBe("10");
    expect(parsed.unit).toBe("celsius");
    expect(parsed.location).toBe("tokyo, japan");
  });

  it('should return correct temperature for San Francisco', async () => {
    const toolCall: ToolCall = {
      id: 'test-id',
      index: 0,
      function: {
        name: 'get_current_weather',
        arguments: '{"location": "San Francisco, CA", "unit": "fahrenheit"}'
      }
    };

    const result = await handleWeather(toolCall);
    const parsed = JSON.parse(result.output);
    
    expect(parsed.temperature).toBe("72");
    expect(parsed.unit).toBe("fahrenheit");
    expect(parsed.location).toBe("san francisco, ca");
  });

  it('should default to celsius for unknown locations', async () => {
    const toolCall: ToolCall = {
      id: 'test-id',
      index: 0,
      function: {
        name: 'get_current_weather',
        arguments: '{"location": "Unknown City"}'
      }
    };

    const result = await handleWeather(toolCall);
    const parsed = JSON.parse(result.output);
    
    expect(parsed.temperature).toBe("22");
    expect(parsed.unit).toBe("celsius");
  });
});

describe('User Profile Tool', () => {
  const TEST_PROFILE_PATH = path.join(process.cwd(), 'data', 'user_profile.test.json');
  
  beforeEach(async () => {
    // Ensure test directory exists
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    // Start with empty profile
    await fs.writeFile(TEST_PROFILE_PATH, '{}');
  });

  afterEach(async () => {
    // Clean up test file
    try {
      await fs.unlink(TEST_PROFILE_PATH);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  it('should store new user information', async () => {
    const toolCall: ToolCall = {
      id: 'test-id',
      index: 0,
      function: {
        name: 'update_user_profile',
        arguments: JSON.stringify({
          key: 'name',
          value: 'John Doe',
          confidence: 1.0,
          context: 'User directly stated'
        })
      }
    };

    const result = await handleUserProfile(toolCall, TEST_PROFILE_PATH);
    const parsed = JSON.parse(result.output);
    
    expect(parsed.success).toBe(true);
    expect(parsed.key).toBe('name');
    expect(parsed.value).toBe('John Doe');

    // Verify file contents
    const fileContent = await fs.readFile(TEST_PROFILE_PATH, 'utf-8');
    const profile = JSON.parse(fileContent);
    expect(profile.name).toBe('John Doe');
  });

  it('should update existing user information', async () => {
    // First update
    await handleUserProfile({
      id: 'test-id-1',
      index: 0,
      function: {
        name: 'update_user_profile',
        arguments: JSON.stringify({
          key: 'location',
          value: 'New York'
        })
      }
    }, TEST_PROFILE_PATH);

    // Second update
    const toolCall: ToolCall = {
      id: 'test-id-2',
      index: 1,
      function: {
        name: 'update_user_profile',
        arguments: JSON.stringify({
          key: 'location',
          value: 'San Francisco'
        })
      }
    };

    const result = await handleUserProfile(toolCall, TEST_PROFILE_PATH);
    const parsed = JSON.parse(result.output);
    
    expect(parsed.success).toBe(true);
    expect(parsed.value).toBe('San Francisco');

    // Verify file contents
    const fileContent = await fs.readFile(TEST_PROFILE_PATH, 'utf-8');
    const profile = JSON.parse(fileContent);
    expect(profile.location).toBe('San Francisco');
  });

  it('should handle multiple profile attributes', async () => {
    const updates = [
      { key: 'name', value: 'Jane Doe' },
      { key: 'occupation', value: 'Software Engineer' },
      { key: 'favorite_color', value: 'blue' }
    ];

    for (const update of updates) {
      await handleUserProfile({
        id: `test-id-${update.key}`,
        index: 0,
        function: {
          name: 'update_user_profile',
          arguments: JSON.stringify(update)
        }
      }, TEST_PROFILE_PATH);
    }

    // Verify file contents
    const fileContent = await fs.readFile(TEST_PROFILE_PATH, 'utf-8');
    const profile = JSON.parse(fileContent);
    
    expect(profile.name).toBe('Jane Doe');
    expect(profile.occupation).toBe('Software Engineer');
    expect(profile.favorite_color).toBe('blue');
  });
}); 