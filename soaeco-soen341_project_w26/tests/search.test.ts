/**
 * @jest-environment node
 */
import { GET } from '../app/api/search/route';
import { supabase } from '../lib/supabase';

// Mock the Supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

describe('Search API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if keyword is missing', async () => {
    // Create a mock Request
    const req = new Request('http://localhost:3000/api/search');
    const res = await GET(req);
    
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Keyword is required');
  });

  it('should successfully search and return matching recipes', async () => {
    const mockRecipes = [
      { id: 1, title: 'Tomato Soup', ingredients: ['Tomato', 'Water'] }
    ];
    
    // Mock the RPC call returning our mock recipes
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: mockRecipes,
      error: null
    });

    const req = new Request('http://localhost:3000/api/search?keyword=tomato');
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith('search_recipes', { search_term: 'tomato' });
    
    const json = await res.json();
    expect(json).toEqual(mockRecipes);
  });

  it('should return empty array when no results match', async () => {
    // Mock the RPC call returning empty
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: [],
      error: null
    });

    const req = new Request('http://localhost:3000/api/search?keyword=asdfgh');
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith('search_recipes', { search_term: 'asdfgh' });
    
    const json = await res.json();
    expect(json).toEqual([]); // gracefully return empty array
  });

  it('should handle database errors gracefully', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    });

    const req = new Request('http://localhost:3000/api/search?keyword=tomato');
    const res = await GET(req);
    
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Database error');
  });
});
