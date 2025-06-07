import { describe, it, beforeEach, expect, vi } from 'vitest';
import { useKnowledgeStore } from '@/store/knowledge';

// mock localforage used by the persist middleware
vi.mock('localforage', () => {
  return {
    default: {
      createInstance: vi.fn(() => {
        const store = new Map<string, any>();
        return {
          getItem: vi.fn(async (key: string) => store.get(key)),
          setItem: vi.fn(async (key: string, value: any) => { store.set(key, value); }),
          removeItem: vi.fn(async (key: string) => { store.delete(key); })
        };
      })
    }
  };
});

interface Knowledge {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

describe('useKnowledgeStore', () => {
  beforeEach(() => {
    useKnowledgeStore.setState({ knowledges: [] });
  });

  it('saves and gets knowledge', () => {
    const { save, get, exist } = useKnowledgeStore.getState();
    const item: Knowledge = { id: '1', content: 'foo', createdAt: Date.now(), updatedAt: Date.now() };
    save(item);
    expect(useKnowledgeStore.getState().knowledges.length).toBe(1);
    expect(exist('1')).toBe(true);
    const found = get('1');
    expect(found).toEqual(item);
    expect(found).not.toBe(item); // should return clone
  });

  it('updates knowledge', () => {
    const { save, update, get } = useKnowledgeStore.getState();
    const item: Knowledge = { id: '1', content: 'foo', createdAt: Date.now(), updatedAt: Date.now() };
    save(item);
    update('1', { content: 'bar' });
    expect(get('1')?.content).toBe('bar');
  });

  it('removes knowledge', () => {
    const { save, remove, exist } = useKnowledgeStore.getState();
    const item: Knowledge = { id: '1', content: 'foo', createdAt: Date.now(), updatedAt: Date.now() };
    save(item);
    remove('1');
    expect(exist('1')).toBe(false);
  });
});
