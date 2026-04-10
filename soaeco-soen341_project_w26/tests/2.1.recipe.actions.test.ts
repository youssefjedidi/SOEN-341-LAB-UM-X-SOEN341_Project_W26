/**
 * @jest-environment node
 */

const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockEq = jest.fn(() => ({ select: mockSelect }));
const mockInsert = jest.fn(() => ({ select: mockSelect }));
const mockUpdate = jest.fn(() => ({ eq: mockEq }));
const mockDeleteEq = jest.fn();
const mockDelete = jest.fn(() => ({ eq: mockDeleteEq }));
const mockFrom = jest.fn((..._args: unknown[]) => ({
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

jest.mock('../src/lib/supabase', () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { createRecipe, updateRecipe, deleteRecipe } from '../src/app/recipe/actions';

describe('2.1 Recipe backend actions user story', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockDeleteEq.mockResolvedValue({ data: [{ id: 'deleted-id' }], error: null });
    mockSingle.mockResolvedValue({ data: { id: 'recipe-1' }, error: null });
  });

  it('creates a new recipe record in database and returns success signal', async () => {
    const result = await createRecipe({
      title: 'Stir Fry',
      prep_time: 20,
      ingredients: [
        { name: 'Noodles', calories: 0 },
        { name: 'Vegetables', calories: 0 },
      ],
      restrictions: ['Vegan'],
      cost: 9,
      preparation_steps: 'Cook noodles then stir fry vegetables.',
      difficulty: 3,
      user_id: 'user-123',
    });

    expect(mockFrom).toHaveBeenCalledWith('recipes');
    expect(mockInsert).toHaveBeenCalledWith({
      title: 'Stir Fry',
      prep_time: 20,
      ingredients: [
        {
          ingredient_id: null,
          name: 'Noodles',
          grams: null,
          calories_per_100g: null,
          calories: 0,
        },
        {
          ingredient_id: null,
          name: 'Vegetables',
          grams: null,
          calories_per_100g: null,
          calories: 0,
        },
      ],
      restrictions: ['Vegan'],
      tags: [],
      cost: 9,
      preparation_steps: 'Cook noodles then stir fry vegetables.',
      difficulty: 3,
      user_id: 'user-123',
    });

    expect(result).toEqual({
      success: true,
      recipe: {
        id: 'recipe-1',
        ingredients: [],
        total_calories: 0,
      },
    });
  });

  it('updates existing recipe in database with mapped prep steps field', async () => {
    const result = await updateRecipe('recipe-77', {
      title: 'Updated Stir Fry',
      prep_steps: 'New instructions',
      ingredients: [{ name: 'Noodles', calories: 0 }],
      restrictions: [],
      prep_time: 25,
      cost: 11,
      difficulty: 4,
    });

    expect(mockFrom).toHaveBeenCalledWith('recipes');
    expect(mockUpdate).toHaveBeenCalledWith({
      title: 'Updated Stir Fry',
      preparation_steps: 'New instructions',
      ingredients: [
        {
          ingredient_id: null,
          name: 'Noodles',
          grams: null,
          calories_per_100g: null,
          calories: 0,
        },
      ],
      restrictions: [],
      prep_time: 25,
      cost: 11,
      difficulty: 4,
      tags: [],
    });
    expect(mockEq).toHaveBeenCalledWith('id', 'recipe-77');

    expect(result).toEqual({
      success: true,
      recipe: {
        id: 'recipe-1',
        ingredients: [],
        total_calories: 0,
      },
    });
  });

  it('removes an existing recipe from database and returns success signal', async () => {
    const result = await deleteRecipe('recipe-delete');

    expect(mockFrom).toHaveBeenCalledWith('recipes');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'recipe-delete');

    expect(result).toEqual({
      success: true,
      data: [{ id: 'deleted-id' }],
    });
  });

  it('signals failure when create returns a database error', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Insert failed' },
    });

    const result = await createRecipe({
      title: 'Bad Recipe',
      prep_time: 1,
      ingredients: [{ name: 'X', calories: 0 }],
      restrictions: [],
      cost: 1,
      preparation_steps: 'X',
      difficulty: 1,
      user_id: 'user-123',
    });

    expect(result).toEqual({ success: false, error: 'Insert failed' });
  });
});
