/**
 * @jest-environment node
 */

const mockSelectAll = jest.fn();

function mockFrom(_table: string) {
    return {
        select: mockSelectAll,
    };
}

jest.mock('../lib/supabase', () => ({
    supabaseAdmin: {
        from: (table: string) => mockFrom(table),
    },
}));

import { getRecipes } from '../app/recipe/actions';

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

        expect(result).toMatchObject({
            success: true,
            recipes: [expect.objectContaining({ total_calories: 500 })],
        });
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

        expect(result).toMatchObject({
            success: true,
            recipes: [
                expect.objectContaining({ total_calories: 0 }),
                expect.objectContaining({ total_calories: 0 }),
            ],
        });
    });
});