/**
 * @jest-environment node
 */

const mockSelectAll = jest.fn();

const mockFrom = jest.fn(() => ({
    select: mockSelectAll,
}));

jest.mock('../lib/supabase', () => ({
    supabaseAdmin: {
        from: (...args: unknown[]) => mockFrom(...args),
    },
}));

import { getRecipes } from '../app/recipe/actions';

type SuccessResult = {
    success: true;
    recipes: { total_calories: number }[];
};

describe('3.5 Calorie backend user story', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calculates total calories correctly for each recipe', async () => {
        mockSelectAll.mockResolvedValue({
            data: [
                {
                    id: '1',
                    ingredients: [
                        { name: 'Chicken', calories: 200 },
                        { name: 'Rice', calories: 300 },
                    ],
                },
            ],
            error: null,
        });

        const result = await getRecipes();

        expect(result.success).toBe(true);

        const recipes = (result as SuccessResult).recipes;

        expect(recipes[0].total_calories).toBe(500);
    });

    it('returns 0 total calories when ingredients are missing or empty', async () => {
        mockSelectAll.mockResolvedValue({
            data: [
                {
                    id: '2',
                    ingredients: [],
                },
                {
                    id: '3',
                    ingredients: null,
                },
            ],
            error: null,
        });

        const result = await getRecipes();

        expect(result.success).toBe(true);

        const recipes = (result as SuccessResult).recipes;

        expect(recipes[0].total_calories).toBe(0);
        expect(recipes[1].total_calories).toBe(0);
    });
});