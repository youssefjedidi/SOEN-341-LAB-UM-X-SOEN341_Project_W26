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

All deliverables for Sprint 1 can be found in the [sprint1_deliverables](./soaeco-soen341_project_w26/sprint1_deliverables) folder.

- [Sprint Plan](https://docs.google.com/spreadsheets/d/1gFXMR4HFe72biDcg2fR8ZZdL18Ys39cnYYKRC7U_bZU/edit?usp=sharing)
- Meeting Minutes
- Activity Logs

## Tech Stack

- **Frontend:** React (Next.js App Router)
- **Backend:** Next.js API Routes (Node.js) + Supabase
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Testing:** Jest (Logic Unit Tests)

## Prerequisites

Before running the project, ensure you have:
- **Node.js** 18.x or higher
- **npm** or **yarn**
- A **Supabase account** (free tier available at [supabase.com](https://supabase.com))

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/youssefjedidi/SOEN-341-LAB-UM-X-SOEN341_Project_W26.git
cd SOEN-341-LAB-UM-X-SOEN341_Project_W26
cd soaeco-soen341_project_w26
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Project Name:** MealMajor (or any name)
   - **Database Password:** Choose a strong password
   - **Region:** Choose closest to you
4. Click "Create new project" (takes ~2 minutes)

#### Get Your Supabase Credentials
1. Once created, go to **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

#### Configure Email Authentication (Important!)
1. Go to **Authentication** → **Providers** → **Email**
2. **Disable** "Confirm email" (for development/testing)
   - This allows users to register without email verification
   - Re-enable this in production!
3. Click "Save"

#### Set Up Database Tables
1. Follow the instructions in [`soaeco-soen341_project_w26/DATABASE_SETUP.md`](./soaeco-soen341_project_w26/DATABASE_SETUP.md)
2. This creates the `user_profiles` table needed for profile management
3. **Important:** Each team member must do this once in their own Supabase project

### 4. Configure Environment Variables

1. In the `soaeco-soen341_project_w26` folder, copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Example:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ⚠️ **Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Test the Application

1. **Register a new account:**
   - Go to `/register`
   - Fill in email, username, password
   - Click "Register"

2. **Login:**
   - Go to `/login`
   - Enter your credentials
   - Click "Login"

3. **Verify in Supabase:**
   - Go to your Supabase project
   - Click **Authentication** → **Users**
   - You should see your registered user!

## Quick Start (TL;DR)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run the app
npm run dev

# 4. Open http://localhost:3000
```

---

## � Troubleshooting

### Issue: Turbopack Cache Corruption

If you see errors like:
```
Failed to restore task data (corrupted database or bug)
Unable to open static sorted file 00000001.sst
```

**Solution:** Clear the Next.js cache and restart:
```bash
# Stop the dev server (Ctrl+C)
rm -rf .next
npm run dev
```

### Issue: Can't Resolve 'tailwindcss' or Module Not Found

If you see errors about missing modules from the parent directory:

**Solution:** Ensure you're running commands from the correct directory:
```bash
# Always run from the project directory
cd soaeco-soen341_project_w26
npm install
npm run dev
```

The repository root has a `.gitignore` to prevent accidental `package.json` files there.

### Issue: Port Already in Use

If you see `Port 3000 is in use`:
- Next.js will automatically use port 3001 instead
- Or manually kill the process: `lsof -ti:3000 | xargs kill`

### Issue: Environment Variables Not Loading

If authentication isn't working:
1. Ensure `.env.local` exists in `soaeco-soen341_project_w26/`
2. Restart the dev server after changing `.env.local`
3. Check that variables start with `NEXT_PUBLIC_` for client-side access

---

## �📘 Developer Onboarding & Contribution Guide

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
