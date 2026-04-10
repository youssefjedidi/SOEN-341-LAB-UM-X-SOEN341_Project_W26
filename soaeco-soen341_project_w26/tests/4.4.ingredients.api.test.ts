/**
 * @jest-environment node
 */
import { GET } from "../app/api/ingredients/route";
import { supabase } from "../lib/supabase";

jest.mock("../lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

describe("Ingredients API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when keyword is missing", async () => {
    const req = new Request("http://localhost:3000/api/ingredients");
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Keyword is required" });
  });

  it("returns matching ingredient results", async () => {
    const mockIngredients = [
      { id: "1", name: "Apple", calories_per_100g: 52, source: "CNF 2015", source_food_id: 900 },
    ];

    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: mockIngredients,
      error: null,
    });

    const req = new Request("http://localhost:3000/api/ingredients?keyword=apple&limit=10");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith("search_ingredients", {
      search_term: "apple",
      result_limit: 10,
    });
    expect(await res.json()).toEqual(mockIngredients);
  });

  it("returns 500 on rpc failure", async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    const req = new Request("http://localhost:3000/api/ingredients?keyword=apple");
    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Database error" });
  });
});
