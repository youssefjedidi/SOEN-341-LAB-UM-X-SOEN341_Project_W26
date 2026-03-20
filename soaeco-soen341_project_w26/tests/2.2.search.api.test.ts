/**
 * @jest-environment node
 */

import { GET } from '../app/api/search/route';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

describe('2.2 Search backend API user story', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns recipes matching partial title keyword via backend query', async () => {
    const titleMatches = [{ id: '1', title: 'Tomato Soup', ingredients: ['Tomato', 'Stock'] }];
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: titleMatches, error: null });

    const req = new Request('http://localhost:3000/api/search?keyword=tom');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith('search_recipes', { search_term: 'tom' });
    expect(await res.json()).toEqual(titleMatches);
  });

  it('returns recipes matching ingredient keyword via backend query', async () => {
    const ingredientMatches = [{ id: '2', title: 'Garlic Noodles', ingredients: ['Garlic', 'Noodles'] }];
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: ingredientMatches, error: null });

    const req = new Request('http://localhost:3000/api/search?keyword=garlic');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith('search_recipes', { search_term: 'garlic' });
    expect(await res.json()).toEqual(ingredientMatches);
  });

  it('handles no matching results gracefully', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: [], error: null });

    const req = new Request('http://localhost:3000/api/search?keyword=does-not-exist');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});
