#!/usr/bin/env node

/**
 * Utility Script: Find Hardcoded Arabic Strings
 *
 * This script scans the codebase for hardcoded Arabic strings that should be
 * moved to the translation system.
 *
 * Usage: node scripts/find-hardcoded-strings.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Arabic Unicode range
const ARABIC_REGEX = /[\u0600-\u06FF]+/g;

// Directories to scan
const DIRS_TO_SCAN = [
  'src/pages',
  'src/components'
];

// Files to ignore
const IGNORE_FILES = [
  'translations.ts',
  'i18n'
];

// Store results
const results = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const matches = line.match(ARABIC_REGEX);
    if (matches) {
      // Skip if it's in a comment
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
        return;
      }

      // Skip if it's already using translation function t()
      if (line.includes("t('") || line.includes('t("')) {
        return;
      }

      results.push({
        file: filePath,
        line: index + 1,
        content: line.trim(),
        matches: matches
      });
    }
  });
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Check if file should be ignored
      if (!IGNORE_FILES.some(ignore => fullPath.includes(ignore))) {
        scanFile(fullPath);
      }
    }
  });
}

// Main execution
console.log('🔍 Scanning for hardcoded Arabic strings...\n');

const cwd = path.resolve(__dirname, '..');

DIRS_TO_SCAN.forEach(dir => {
  const fullDir = path.join(cwd, dir);
  if (fs.existsSync(fullDir)) {
    scanDirectory(fullDir);
  }
});

// Group results by file
const groupedResults = results.reduce((acc, result) => {
  if (!acc[result.file]) {
    acc[result.file] = [];
  }
  acc[result.file].push(result);
  return acc;
}, {});

// Print results
console.log(`📊 Found ${results.length} hardcoded strings in ${Object.keys(groupedResults).length} files:\n`);

Object.entries(groupedResults).forEach(([file, items]) => {
  console.log(`📄 ${file} (${items.length} strings):`);
  items.slice(0, 5).forEach(item => {
    console.log(`   Line ${item.line}: ${item.content.substring(0, 80)}...`);
  });
  if (items.length > 5) {
    console.log(`   ... and ${items.length - 5} more`);
  }
  console.log('');
});

// Summary
console.log('\n📈 Summary:');
console.log(`   Total files with hardcoded strings: ${Object.keys(groupedResults).length}`);
console.log(`   Total hardcoded strings found: ${results.length}`);
console.log('\n💡 Recommendation: Update these files to use the useTranslation hook.');

// Export to JSON for further processing
const outputPath = path.join(cwd, 'hardcoded-strings-report.json');
fs.writeFileSync(outputPath, JSON.stringify(groupedResults, null, 2));
console.log(`\n✅ Detailed report saved to: ${outputPath}`);
