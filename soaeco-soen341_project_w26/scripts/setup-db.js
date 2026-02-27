#!/usr/bin/env node

/**
 * Fully Automated Database Setup Script
 *
 * This script:
 * 1. Creates a PostgreSQL function that can execute raw SQL
 * 2. Uses that function to run your migration files
 * 3. Team members just run: npm run setup-db
 *
 * No manual SQL needed!
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

console.log(`\n${colors.cyan}🚀 MealMajor Database Setup${colors.reset}\n`);

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    `${colors.red}❌ Error: Missing environment variables${colors.reset}`,
  );
  console.log(`\nAdd to .env.local:`);
  console.log(`  NEXT_PUBLIC_SUPABASE_URL=your-url`);
  console.log(`  SUPABASE_SECRET_KEY=your-secret-key\n`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get all migration files
const migrationsDir = path.join(__dirname, "../supabase/migrations/");
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort(); // Run in order

async function setupDatabase() {
  try {
    console.log(
      `${colors.blue}Step 1:${colors.reset} Creating SQL executor function...`,
    );

    // Create a function that can execute arbitrary SQL
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_text TEXT)
      RETURNS TEXT
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_text;
        RETURN 'SQL executed successfully';
      EXCEPTION WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
      END;
      $$;
    `;

    // Try to create the function
    const { error: funcError } = await supabase.rpc("execute_sql", {
      sql_text: createFunctionSQL,
    });

    if (
      funcError &&
      funcError.message.includes(
        "function execute_sql(sql_text text) does not exist",
      )
    ) {
      // Function doesn't exist, we need to create it via a different method
      console.log(
        `${colors.yellow}   Creating executor function for the first time...${colors.reset}`,
      );

      // Use the Management API to create the function
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ query: createFunctionSQL }),
      });

      if (!response.ok) {
        throw new Error(
          "Could not create executor function. Please run the initial setup SQL manually.",
        );
      }
    }

    console.log(`${colors.green}✓${colors.reset} SQL executor ready\n`);

    console.log(`${colors.blue}Step 2:${colors.reset} Running migrations...`);

    for (const file of migrationFiles) {
      console.log(`${colors.cyan}  Running ${file}...${colors.reset}`);
      const sqlText = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      const { data, error } = await supabase.rpc("execute_sql", {
        sql_text: sqlText,
      });

      if (error) {
        throw new Error(`Migration ${file} failed: ${error.message}`);
      }

      if (data && data.startsWith("Error:")) {
        if (!data.includes("already exists") && !data.includes("already a relation") && !data.includes("duplicate key")) {
          throw new Error(`Migration ${file} SQL Error: ${data}`);
        } else {
          console.log(`${colors.yellow}    Note: skipping already applied items in ${file}${colors.reset}`);
        }
      }
    }

    console.log(`${colors.green}✓${colors.reset} All migrations complete\n`);
    console.log(
      `${colors.green}✅ Success! Database is ready!${colors.reset}\n`,
    );
    console.log(
      `${colors.cyan}Verify:${colors.reset} Check Supabase Dashboard → Table Editor\n`,
    );
  } catch (error) {
    console.error(
      `\n${colors.red}❌ Setup failed: ${error.message}${colors.reset}\n`,
    );

    console.log(
      `${colors.yellow}📋 Manual Setup Required (One-Time):${colors.reset}\n`,
    );
    console.log(`Run this SQL in Supabase SQL Editor:\n`);
    console.log(
      `${colors.cyan}CREATE OR REPLACE FUNCTION execute_sql(sql_text TEXT)`,
    );
    console.log(`RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$`);
    console.log(`BEGIN`);
    console.log(`  EXECUTE sql_text;`);
    console.log(`  RETURN 'SQL executed successfully';`);
    console.log(`EXCEPTION WHEN OTHERS THEN`);
    console.log(`  RETURN 'Error: ' || SQLERRM;`);
    console.log(`END;`);
    console.log(`$$;${colors.reset}\n`);
    console.log(
      `Then run: ${colors.cyan}npm run setup-db${colors.reset} again\n`,
    );

    process.exit(1);
  }
}

setupDatabase();
