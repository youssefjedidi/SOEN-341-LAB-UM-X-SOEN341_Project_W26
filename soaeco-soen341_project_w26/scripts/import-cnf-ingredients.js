#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const CNF_ZIP_URL =
  "https://www.canada.ca/content/dam/hc-sc/migration/hc-sc/fn-an/alt_formats/zip/nutrition/fiche-nutri-data/cnf-fcen-csv.zip";
const ENERGY_NUTRIENT_ID = "208";
const BATCH_SIZE = 500;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(`${colors.red}Missing Supabase environment variables.${colors.reset}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

const readCsvRows = (filePath) => {
  const fileContents = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = fileContents.split(/\r?\n/).filter((line) => line.trim() !== "");
  const [headerLine, ...dataLines] = lines;
  const headers = parseCsvLine(headerLine);

  return dataLines.map((line) => {
    const columns = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = columns[index] ?? "";
      return row;
    }, {});
  });
};

const downloadFile = async (url, targetPath) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download CNF archive: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));
};

const ensureArchive = async (providedPath) => {
  if (providedPath) {
    if (!fs.existsSync(providedPath)) {
      throw new Error(`CNF archive not found at ${providedPath}`);
    }
    return providedPath;
  }

  const targetPath = path.join(os.tmpdir(), "cnf-fcen-csv.zip");
  console.log(`${colors.cyan}Downloading CNF archive...${colors.reset}`);
  await downloadFile(CNF_ZIP_URL, targetPath);
  return targetPath;
};

const extractArchive = (archivePath) => {
  const targetDir = fs.mkdtempSync(path.join(os.tmpdir(), "cnf-import-"));
  execFileSync("unzip", ["-o", archivePath, "-d", targetDir], { stdio: "ignore" });
  return targetDir;
};

const buildIngredientRows = (directory) => {
  const foodRows = readCsvRows(path.join(directory, "FOOD NAME.csv"));
  const nutrientRows = readCsvRows(path.join(directory, "NUTRIENT AMOUNT.csv"));

  const caloriesByFoodId = new Map();
  for (const row of nutrientRows) {
    if (row.NutrientID !== ENERGY_NUTRIENT_ID) {
      continue;
    }

    const calories = Number(row.NutrientValue);
    if (!Number.isFinite(calories) || calories < 0) {
      continue;
    }

    caloriesByFoodId.set(Number(row.FoodID), calories);
  }

  return foodRows
    .map((row) => {
      const sourceFoodId = Number(row.FoodID);
      const calories = caloriesByFoodId.get(sourceFoodId);
      const name = (row.FoodDescription || "").trim();

      if (!name || !Number.isFinite(sourceFoodId) || calories === undefined) {
        return null;
      }

      return {
        name,
        calories_per_100g: Number(calories.toFixed(2)),
        source: "CNF 2015",
        source_food_id: sourceFoodId,
      };
    })
    .filter(Boolean);
};

const upsertBatch = async (rows) => {
  const { error } = await supabase
    .from("ingredients")
    .upsert(rows, { onConflict: "source,source_food_id" });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
};

async function main() {
  const providedArchive = process.argv[2];
  const archivePath = await ensureArchive(providedArchive);
  const extractedDir = extractArchive(archivePath);

  console.log(`${colors.cyan}Parsing CNF food and nutrient files...${colors.reset}`);
  const ingredientRows = buildIngredientRows(extractedDir);

  console.log(
    `${colors.cyan}Importing ${ingredientRows.length} ingredients into Supabase...${colors.reset}`,
  );

  for (let index = 0; index < ingredientRows.length; index += BATCH_SIZE) {
    const batch = ingredientRows.slice(index, index + BATCH_SIZE);
    await upsertBatch(batch);
  }

  console.log(
    `${colors.green}Imported ${ingredientRows.length} CNF ingredient rows successfully.${colors.reset}`,
  );
}

main().catch((error) => {
  console.error(`${colors.red}${error.message}${colors.reset}`);
  process.exit(1);
});
