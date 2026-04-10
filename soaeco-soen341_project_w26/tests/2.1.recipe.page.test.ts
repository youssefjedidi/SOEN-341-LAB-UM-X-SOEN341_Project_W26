import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RecipePage from '../src/app/recipe/page';
import { IngredientCatalogItem, Recipe } from '../src/lib/types';

const mockUseAuth = jest.fn();
const mockCreateRecipe = jest.fn();
const mockGetRecipes = jest.fn();
const mockDeleteRecipe = jest.fn();
const mockUpdateRecipe = jest.fn();
const mockFetch = jest.fn();

jest.mock('../src/lib/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../src/app/recipe/actions', () => ({
  createRecipe: (...args: unknown[]) => mockCreateRecipe(...args),
  getRecipes: (...args: unknown[]) => mockGetRecipes(...args),
  deleteRecipe: (...args: unknown[]) => mockDeleteRecipe(...args),
  updateRecipe: (...args: unknown[]) => mockUpdateRecipe(...args),
}));

describe('2.1 Recipe management page user story', () => {
  const userId = 'user-123';
  const pastaIngredient: IngredientCatalogItem = {
    id: 'ingredient-pasta',
    name: 'Pasta, cooked',
    calories_per_100g: 131,
    source: 'CNF 2015',
    source_food_id: 1234,
  };

  function getFieldContainer(label: RegExp) {
    const labelElement = screen.getByText(label);
    const container = labelElement.closest('div');
    expect(container).not.toBeNull();
    return container as HTMLDivElement;
  }

  function getInputBySectionLabel(label: RegExp) {
    const container = getFieldContainer(label);
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    return input as HTMLInputElement;
  }

  function getTextareaBySectionLabel(label: RegExp) {
    const container = getFieldContainer(label);
    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();
    return textarea as HTMLTextAreaElement;
  }

  function fillValidRecipeForm() {
    fireEvent.change(getInputBySectionLabel(/recipe title/i), { target: { value: 'Pasta Primavera' } });
    fireEvent.change(getInputBySectionLabel(/prep time/i), { target: { value: '25' } });
    fireEvent.change(getInputBySectionLabel(/cost/i), { target: { value: '12' } });
    fireEvent.change(getTextareaBySectionLabel(/prep steps/i), {
      target: { value: 'Boil pasta, sauté vegetables, then combine.' },
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;

    mockUseAuth.mockReturnValue({
      user: { id: userId },
      loading: false,
    });

    mockGetRecipes.mockResolvedValue({ success: true, recipes: [] });
    mockCreateRecipe.mockResolvedValue({
      success: true,
      recipe: { id: 'created-1' },
    });
    mockUpdateRecipe.mockResolvedValue({
      success: true,
      recipe: { id: 'updated-1' },
    });
    mockDeleteRecipe.mockResolvedValue({ success: true, data: [] });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [pastaIngredient],
    });
  });

  it('renders create recipe form, required controls, and recipe list section', async () => {
    render(React.createElement(RecipePage));

    expect(screen.getByRole('heading', { name: /create recipe/i })).toBeInTheDocument();
    expect(screen.getByText(/recipe title/i)).toBeInTheDocument();
    expect(screen.getByText(/prep time \(minutes\)/i)).toBeInTheDocument();
    expect(screen.getByText(/^ingredients$/i)).toBeInTheDocument();
    expect(screen.getByText(/cost \(per portion\)/i)).toBeInTheDocument();
    expect(screen.getByText(/prep steps/i)).toBeInTheDocument();
    expect(screen.getByText(/difficulty \(\/5\)/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /save recipe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();

    expect(await screen.findByText(/my recipes/i)).toBeInTheDocument();
    expect(screen.getByText(/no recipes found\. create one above/i)).toBeInTheDocument();
  });

  it('validates title, ingredients, and instructions before allowing submit', async () => {
    render(React.createElement(RecipePage));

    fireEvent.click(screen.getByRole('button', { name: /save recipe/i }));

    expect(await screen.findByText(/title cannot be empty/i)).toBeInTheDocument();
    expect(screen.getByText(/ingredients cannot be empty/i)).toBeInTheDocument();
    expect(screen.getByText(/instructions cannot be empty/i)).toBeInTheDocument();

    expect(mockCreateRecipe).not.toHaveBeenCalled();
    expect(mockUpdateRecipe).not.toHaveBeenCalled();
  });

  it('creates a recipe and signals success by calling backend create', async () => {
    render(React.createElement(RecipePage));

    fillValidRecipeForm();
    const ingredientInput = screen.getByPlaceholderText(/search ingredients/i);
    fireEvent.change(ingredientInput, { target: { value: 'Pasta' } });

    const ingredientResult = await screen.findByRole('button', { name: /pasta, cooked/i });
    fireEvent.click(ingredientResult);

    const gramsSection = getFieldContainer(/grams/i);
    const gramsInput = gramsSection.querySelector('input') as HTMLInputElement;
    fireEvent.change(gramsInput, { target: { value: '150' } });
    fireEvent.click(screen.getByRole('button', { name: /save recipe/i }));

    await waitFor(() => {
      expect(mockCreateRecipe).toHaveBeenCalledWith({
        title: 'Pasta Primavera',
        prep_time: 25,
        ingredients: [{
          ingredient_id: 'ingredient-pasta',
          name: 'Pasta, cooked',
          grams: 150,
          calories_per_100g: 131,
          calories: 196.5,
        }],
        restrictions: [],
        cost: 12,
        preparation_steps: 'Boil pasta, sauté vegetables, then combine.',
        difficulty: 3,
        user_id: userId,
      });
    });

    await waitFor(() => {
      // Called initially by effect, then called again after successful save.
      expect(mockGetRecipes).toHaveBeenCalledTimes(2);
    });
  });

  it('loads an existing recipe, updates it, and calls backend update', async () => {
    const existingRecipe: Recipe = {
      id: 'recipe-42',
      title: 'Original Soup',
      prep_time: 10,
      ingredients: [{
        ingredient_id: 'ingredient-water',
        name: 'Water',
        grams: 100,
        calories_per_100g: 0,
        calories: 0,
      }],
      restrictions: ['Vegan'],
      cost: 4,
      preparation_steps: 'Heat water.',
      difficulty: 2,
      user_id: userId,
      tags: [],
    };

    mockGetRecipes.mockResolvedValue({ success: true, recipes: [existingRecipe] });

    render(React.createElement(RecipePage));

    expect(await screen.findByText(/original soup/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

    expect(screen.getByRole('heading', { name: /edit recipe/i })).toBeInTheDocument();

    fireEvent.change(getInputBySectionLabel(/recipe title/i), { target: { value: 'Updated Soup' } });
    fireEvent.click(screen.getByRole('button', { name: /update recipe/i }));

    await waitFor(() => {
      expect(mockUpdateRecipe).toHaveBeenCalledWith(
        'recipe-42',
        expect.objectContaining({
          title: 'Updated Soup',
          prep_time: 10,
          ingredients: [{
            ingredient_id: 'ingredient-water',
            name: 'Water',
            grams: 100,
            calories_per_100g: 0,
            calories: 0,
          }],
          restrictions: ['Vegan'],
          cost: 4,
          prep_steps: 'Heat water.',
          difficulty: 2,
        }),
      );
    });
  });

  it('cancel exits edit mode and returns to create recipe view', async () => {
    const existingRecipe: Recipe = {
      id: 'recipe-cancel',
      title: 'Cancel Me',
      prep_time: 15,
      ingredients: [{
        ingredient_id: 'ingredient-tomato',
        name: 'Tomato',
        grams: 100,
        calories_per_100g: 18,
        calories: 18,
      }],
      restrictions: [],
      cost: 7,
      preparation_steps: 'Mix ingredients.',
      difficulty: 3,
      user_id: userId,
      tags: [],
    };

    mockGetRecipes.mockResolvedValue({ success: true, recipes: [existingRecipe] });

    render(React.createElement(RecipePage));

    expect(await screen.findByText(/cancel me/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
    expect(screen.getByRole('heading', { name: /edit recipe/i })).toBeInTheDocument();

    fireEvent.change(getInputBySectionLabel(/recipe title/i), { target: { value: 'Unsaved Change' } });
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.getByRole('heading', { name: /create recipe/i })).toBeInTheDocument();
    expect((getInputBySectionLabel(/recipe title/i) as HTMLInputElement).value).toBe('');
    expect(screen.getByText(/my recipes/i)).toBeInTheDocument();
    expect(mockUpdateRecipe).not.toHaveBeenCalled();
  });

  it('deletes an existing recipe through backend delete', async () => {
    const existingRecipe: Recipe = {
      id: 'recipe-delete',
      title: 'Delete Me',
      prep_time: 30,
      ingredients: [{
        ingredient_id: 'ingredient-rice',
        name: 'Rice',
        grams: 100,
        calories_per_100g: 130,
        calories: 130,
      }],
      restrictions: [],
      cost: 5,
      preparation_steps: 'Cook rice.',
      difficulty: 1,
      user_id: userId,
      tags: [],
    };

    mockGetRecipes.mockResolvedValue({ success: true, recipes: [existingRecipe] });

    render(React.createElement(RecipePage));

    expect(await screen.findByText(/delete me/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(mockDeleteRecipe).toHaveBeenCalledWith('recipe-delete');
    });

    await waitFor(() => {
      // Initial fetch + refetch after delete success.
      expect(mockGetRecipes).toHaveBeenCalledTimes(2);
    });
  });
});
