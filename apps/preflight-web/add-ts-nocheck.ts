#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";

const TS_NOCHECK = "// @ts-nocheck\n";
const UI_COMPONENTS_DIR = path.join(__dirname, "components", "ui");

function addTsNocheck(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // Check if @ts-nocheck already exists
    if (content.startsWith("// @ts-nocheck")) {
      console.log(
        `⏭️  Skipping ${path.basename(filePath)} - already has @ts-nocheck`,
      );
      return;
    }

    // Check if it has @ts-expect-error or other ts comments at the top
    if (content.startsWith("// @ts-")) {
      console.log(
        `⚠️  Skipping ${path.basename(filePath)} - has other @ts- directive`,
      );
      return;
    }

    // Add @ts-nocheck to the beginning of the file
    const newContent = TS_NOCHECK + content;
    fs.writeFileSync(filePath, newContent, "utf-8");
    console.log(`✅ Added @ts-nocheck to ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

function processDirectory(dirPath: string): void {
  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        processDirectory(filePath);
      } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        // Process TypeScript files
        addTsNocheck(filePath);
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}:`, error);
  }
}

// Main execution
console.log("🚀 Starting to add @ts-nocheck to UI components...\n");

if (!fs.existsSync(UI_COMPONENTS_DIR)) {
  console.error(`❌ Directory not found: ${UI_COMPONENTS_DIR}`);
  process.exit(1);
}

processDirectory(UI_COMPONENTS_DIR);

console.log("\n✨ Done!");
