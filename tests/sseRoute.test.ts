import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/sse/route';

vi.mock('@/utils/deep-research', () => {
  return {
    default: vi.fn().mockImplementation(({ onMessage }) => {
      return {
        start: vi.fn(async () => {
          onMessage('progress', { step: 'final-report', status: 'end' });
        })
      };
    })
  };
});

vi.mock('@/utils/model', () => ({
  multiApiKeyPolling: (key: string) => key
}));

vi.mock('@/app/api/utils', () => ({
  getAIProviderBaseURL: () => '',
  getAIProviderApiKey: () => '',
  getSearchProviderBaseURL: () => '',
  getSearchProviderApiKey: () => ''
}));

describe('SSE route', () => {
  it('returns SSE stream with progress event', async () => {
    const payload = {
      query: 'test',
      provider: 'openai',
      thinkingModel: 'gpt-3',
      taskModel: 'gpt-3',
      searchProvider: 'model',
      language: 'en',
      maxResult: 1
    };
    const req = new NextRequest(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    );
    const res = await POST(req);
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) text += decoder.decode(value);
    }
    const events = text.trim().split('\n\n');
    expect(events[0].startsWith('event: infor')).toBe(true);
    const last = events[events.length - 1];
    expect(last.includes('event: progress')).toBe(true);
  });
});
