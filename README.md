# MealMajor - Team SOAECO

SOEN 341: Software Process - Winter 2026

## Project Description

MealMajor is a web app for students to plan meals, track groceries, and propose easy recipes. Our goal is ...

## Team Members

- **Youssef Jedidi** (ID: [40234176]) - [Role]
- **[Member Name]** (ID: [ID]) - [Role]
- **[Member Name]** (ID: [ID]) - [Role]
- **[Member Name]** (ID: [ID]) - [Role]
- **[Member Name]** (ID: [ID]) - [Role]

## Sprint 1 Deliverables

All deliverables for Sprint 1 can be found in the [sprint1_deliverables](./sprint1_deliverables) folder.

- Sprint Plan
- Meeting Minutes
- Activity Logs

## Tech Stack

- **Frontend:** React (Next.js App Router)
- **Backend:** Next.js API Routes (Node.js)
- **Database:** TBD

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

### 3. Useful Commands

- `npm run dev` - Starts the server (keeps running while you code).
- `Ctrl + C` - Stops the server.
