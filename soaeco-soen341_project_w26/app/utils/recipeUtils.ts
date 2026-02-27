

export function toggleItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

export function filterRecipesBySearch<T extends { title: string }>(
    recipes: T[],
    searchTerm: string
): T[] {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(q)
    );
}