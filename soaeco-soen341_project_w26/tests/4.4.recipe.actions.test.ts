/**
 * @jest-environment node
 */
import { createRecipe, getRecipes, searchIngredients, updateRecipe } from "../app/recipe/actions";
import { supabaseAdmin } from "../lib/supabase";

jest.mock("../lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe("recipe actions", () => {
  const mockedSupabaseAdmin = supabaseAdmin as NonNullable<typeof supabaseAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("computes structured ingredient calories on create", async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        id: "recipe-1",
        title: "Fruit Bowl",
        ingredients: [
          {
            ingredient_id: "ingredient-1",
            name: "Apple",
            grams: 150,
            calories_per_100g: 52,
            calories: 78,
          },
        ],
      },
      error: null,
    });

    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    (mockedSupabaseAdmin.from as jest.Mock).mockReturnValue({ insert });

    const result = await createRecipe({
      title: "Fruit Bowl",
      prep_time: 5,
      ingredients: [
        {
          ingredient_id: "ingredient-1",
          name: "Apple",
          grams: 150,
          calories_per_100g: 52,
          calories: 0,
        },
      ],
      restrictions: [],
      cost: 3,
      preparation_steps: "Cut fruit",
      difficulty: 1,
      user_id: "user-1",
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ingredients: [
          {
            ingredient_id: "ingredient-1",
            name: "Apple",
            grams: 150,
            calories_per_100g: 52,
            calories: 78,
          },
        ],
      }),
    );
    expect(result.success).toBe(true);
    expect(result.recipe?.total_calories).toBe(78);
  });

  it("normalizes legacy ingredient rows when fetching recipes", async () => {
    const select = jest.fn().mockResolvedValue({
      data: [
        {
          id: "recipe-1",
          title: "Soup",
          ingredients: ["Tomato", { name: "Water", calories: 0 }, null],
          restrictions: [],
          cost: 1,
          preparation_steps: "Boil",
          difficulty: 1,
          prep_time: 10,
          user_id: "user-1",
        },
      ],
      error: null,
    });

    (mockedSupabaseAdmin.from as jest.Mock).mockReturnValue({ select });

    const result = await getRecipes();

    expect(result.success).toBe(true);
    expect(result.recipes?.[0].ingredients).toEqual([
      {
        ingredient_id: null,
        name: "Tomato",
        grams: null,
        calories_per_100g: null,
        calories: 0,
      },
      {
        ingredient_id: null,
        name: "Water",
        grams: null,
        calories_per_100g: null,
        calories: 0,
      },
    ]);
    expect(result.recipes?.[0].total_calories).toBe(0);
  });

  it("recomputes ingredient calories on update", async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        id: "recipe-1",
        title: "Salad",
        ingredients: [
          {
            ingredient_id: "ingredient-2",
            name: "Spinach",
            grams: 40,
            calories_per_100g: 23,
            calories: 9.2,
          },
        ],
      },
      error: null,
    });

    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    (mockedSupabaseAdmin.from as jest.Mock).mockReturnValue({ update });

    const result = await updateRecipe("recipe-1", {
      ingredients: [
        {
          ingredient_id: "ingredient-2",
          name: "Spinach",
          grams: 40,
          calories_per_100g: 23,
          calories: 999,
        },
      ],
    });

    expect(update).toHaveBeenCalledWith({
      ingredients: [
        {
          ingredient_id: "ingredient-2",
          name: "Spinach",
          grams: 40,
          calories_per_100g: 23,
          calories: 9.2,
        },
      ],
      tags: [],
    });
    expect(result.recipe?.total_calories).toBe(9.2);
  });

  it("searches ingredients through the backend rpc", async () => {
    (mockedSupabaseAdmin.rpc as jest.Mock).mockResolvedValue({
      data: [{ id: "ingredient-1", name: "Apple", calories_per_100g: 52 }],
      error: null,
    });

    const result = await searchIngredients("apple", 15);

    expect(mockedSupabaseAdmin.rpc).toHaveBeenCalledWith("search_ingredients", {
      search_term: "apple",
      result_limit: 15,
    });
    expect(result).toEqual({
      success: true,
      ingredients: [{ id: "ingredient-1", name: "Apple", calories_per_100g: 52 }],
    });
  });
});
