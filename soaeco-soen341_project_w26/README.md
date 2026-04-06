# SOAECO

SOAECO is a Next.js and Supabase meal-planning application. The project includes recipe management, search, authentication, profile management, and a weekly planner that stores meal-slot assignments in the database.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure your Supabase environment variables in `.env.local`.

3. Run the database setup script so all required tables and policies exist:

```bash
npm run setup-db
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Weekly Planner Notes

- Weekly planner data is stored in the `weekly_planner` table.
- Planner updates are handled through Next.js server actions in [`app/weekly_planner/actions.ts`](./app/weekly_planner/actions.ts).
- Duplicate recipe assignments are validated across the full week using recipe IDs from the database.
- The planner UI loads available recipes from the `recipes` table and persists add, replace, and remove actions.
- Weekly auto-generation fills all 28 slots (7 days x 4 meals) with non-repeating recipes.
- Generation is enabled only when enough eligible recipes exist for all slots.
- When a daily calorie goal is set, generation tries to keep each day near that goal and applies profile dietary restrictions.
- When no daily calorie goal is set, generation uses all recipes (no restriction filter for auto-generation).
- Minimal coverage for this behavior is in `tests/4.3.weekly_planner.generation.test.ts`.

## Useful Scripts

```bash
npm run dev
npm run lint
npm run test
npm run setup-db
```

## Tech Stack

- Next.js
- React
- Supabase
- TypeScript
- Jest

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
