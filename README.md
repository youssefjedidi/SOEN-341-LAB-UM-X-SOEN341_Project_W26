# MealMajor - Team SOAECO

SOEN 341: Software Process - Winter 2026

## Project Description

MealMajor is a web-based meal planning and healthy living application designed to help students organize their meals and make healthier food choices. The application allows users to plan their weekly meals, manage recipes, and keep track of their dietary preferences in one centralized platform.

The website is available to users who create an account and manage their personal profile. Users can customize their profiles by specifying dietary preferences and allergies. To manage meals, users can browse, create, edit, and delete recipes. Recipes include details such as ingredients, preparation steps, preparation time, cost, and dietary tags. Users can search and filter recipes based on factors such as time, difficulty, cost, and dietary restrictions.

MealMajor also provides a weekly meal planner that allows users to assign recipes to specific days of the week and meal types such as breakfast, lunch, dinner, or snacks. Meals are displayed in a weekly grid, and users can edit or remove meals while preventing duplicate entries within the same week.

## Team Members

- **Youssef Jedidi** (ID: [40234176]) - [Scrum Master]
- **Rami Thabet** (ID: [40236685]) - [Member]
- **Ashley Samerev** (ID: [40273454]) - [Member]
- **Mathias Vecchio** (ID: [40276964]) - [Member]
- **Yana Vassilyev** (ID: [40270779]) - [Member]
- **Nicolas Correa-Vallenas** (ID: [40316184]) - [Member]

## Sprint 1 Deliverables

All deliverables for Sprint 1 can be found in the [sprint1_deliverables](./sprint1_deliverables) folder.

- [Sprint Plan](https://docs.google.com/spreadsheets/d/1gFXMR4HFe72biDcg2fR8ZZdL18Ys39cnYYKRC7U_bZU/edit?usp=sharing)
- Meeting Minutes
- Activity Logs

## Tech Stack

- **Frontend:** React (Next.js App Router)
- **Backend:** Next.js API Routes (Node.js)
- **Database:** TBD
- **Testing:** Jest (Logic Unit Tests)

## How to Run

1.  `cd soaeco-soen341_project_w26`
2.  `npm install`
3.  `npm run dev`
4.  Open http://localhost:3000

---

## 📘 Developer Onboarding & Contribution Guide

- **Documentation:** [Next.js Official Docs](https://nextjs.org/docs) - _Read this if you get stuck on Routing or API handling._
- **File Structure:** Next.js uses a file-based routing system. Files in `src/app` correspond to URLs.
- **API Routes:** Backend functions go in `src/app/api`. Each folder represents an endpoint.

### 1. How to create a new Page

In Next.js, the **folder structure** determines the URL.

- To create `http://localhost:3000/login`:
  1. Create folder: `src/app/login`
  2. Create file: `src/app/login/page.tsx`
  3. Paste this starter code:
  ```tsx
  export default function LoginPage() {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <p>Put your form here...</p>
      </div>
    );
  }
  ```

### 2. How to create a Backend API Route

If you need a "function" to handle data (like checking a password), do this:

- To create an endpoint `POST /api/auth/login`:

1. Create folder: `src/app/api/auth/login`
2. Create file: `src/app/api/auth/login/route.ts`
3. Paste this starter code:

```ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json(); // Like parsing JSON in C++

  // Your logic here (e.g., check DB)
  if (body.email === "test@test.com") {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid login" }, { status: 401 });
}
```

### 3. How to Write Tests (TDD)

We use **Jest** for testing (similar to JUnit in the slides).
**Strategy:** Only test pure logic functions (like validation). Do not test UI components yet.

- Create a file ending in `.test.ts` (e.g., `src/logic.test.ts`):

```ts
import { isValid } from "./logic";

describe("Validation Logic", () => {
  it("checks password length", () => {
    expect(isValid("12345")).toBe(true);
  });
});
```

### 4. Useful Commands

- `npm run dev` - Starts the server (keeps running while you code).
- `npm run test` - Runs all unit tests.
- `Ctrl + C` - Stops the server.
