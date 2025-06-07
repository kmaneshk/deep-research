import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDeepResearch from '@/hooks/useDeepResearch';
import { useTaskStore } from '@/store/task';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@/hooks/useAiProvider', () => {
  return {
    default: () => ({
      createModelProvider: vi.fn(async () => ({})),
      getModel: () => ({ thinkingModel: 'gpt-3', networkingModel: 'gpt-3' })
    })
  };
});

vi.mock('ai', () => ({
  streamText: () => ({
    fullStream: (async function* () {
      yield { type: 'text-delta', textDelta: 'hello' };
    })()
  })
}));

describe('useDeepResearch', () => {
  it('askQuestions updates status', async () => {
    useTaskStore.setState({ question: 'q' });
    const { result } = renderHook(() => useDeepResearch());
    await act(async () => {
      await result.current.askQuestions();
    });
    expect(result.current.status).toBe('research.common.thinking');
    expect(useTaskStore.getState().questions).not.toBe('');
  });
});
