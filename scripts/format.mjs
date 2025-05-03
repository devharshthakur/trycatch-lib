#!/usr/bin/env node

/**
 * Enhanced formatter for trycatch-lib
 * Formats TS, JS, MD, JSON, YAML, and other supported file types
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Promisify exec
const execAsync = promisify(exec);

// Format configuration
const CONFIG = {
  // Format command with explicit extensions to format
  formatCmd: 'prettier --write "**/*.{ts,tsx,js,jsx,mjs,cjs,json,md,mdx,yaml,yml,html,css}"',
  
  // Check command with same extensions
  checkCmd: 'prettier --check "**/*.{ts,tsx,js,jsx,mjs,cjs,json,md,mdx,yaml,yml,html,css}"',
  
  // Files to exclude from stats calculation (to avoid counting them multiple times)
  fileRegex: /\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|ya?ml|html|css)$/i,
  
  // Categorize files by extension for reporting
  fileCategories: {
    typescript: /\.(ts|tsx)$/i,
    javascript: /\.(js|jsx|mjs|cjs)$/i,
    json: /\.json$/i,
    markdown: /\.(md|mdx)$/i,
    yaml: /\.ya?ml$/i,
    web: /\.(html|css)$/i
  }
};

// Format stats
const stats = {
  startTime: null,
  endTime: null,
  filesFormatted: 0,
  totalFiles: 0,
  categories: {},
  // For detailed file tracking (optional)
  files: []
};

// Visual elements
const formatTitle = chalk.bold.cyan(`trycatch-lib formatter`);
const tick = chalk.green('✓');
const info = chalk.blue('ℹ');
const warning = chalk.yellow('⚠');

/**
 * Initializes the stats categories
 */
function initStats() {
  stats.startTime = Date.now();
  stats.filesFormatted = 0;
  stats.totalFiles = 0;
  stats.categories = {};
  stats.files = [];
  
  // Initialize categories with zero counts
  Object.keys(CONFIG.fileCategories).forEach(category => {
    stats.categories[category] = 0;
  });
}

/**
 * Run the Prettier check to analyze files that need formatting
 */
async function analyzeFiles() {
  const spinner = createSpinner('Analyzing codebase');
  
  try {
    spinner.start();
    
    // Run the check command
    const { stdout, stderr } = await execAsync(CONFIG.checkCmd);
    
    // No files need formatting - success case
    const filesMatched = stdout.match(/All matched files use Prettier code style/i);
    if (filesMatched) {
      const filesCount = parseFileCount(stdout);
      stats.totalFiles = filesCount;
      stats.filesFormatted = 0;
      spinner.success({ text: `Analysis complete - ${chalk.green('All files formatted')}` });
      await updateCategoryStats();
      return true;
    }
    
    // This shouldn't happen, but just in case
    spinner.success({ text: 'Analysis complete' });
    await updateCategoryStats();
    return true;
    
  } catch (error) {
    // This is expected if files need formatting
    const warnings = error.stdout?.match(/\[warn\] (.*?)(?=\n|$)/g) || [];
    const filesToFormat = warnings.map(warn => warn.replace('[warn] ', ''));
    
    stats.filesFormatted = filesToFormat.length;
    stats.files = filesToFormat;
    
    // Update category stats
    await updateCategoryStats();
    
    spinner.success({ text: `Analysis complete - ${chalk.yellow(`${stats.filesFormatted} files need formatting`)}` });
    return true;
  }
}

/**
 * Parse the total file count from Prettier output
 */
function parseFileCount(output) {
  // Try to find a message like "123 files checked"
  const match = output.match(/(\d+) files? checked/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
}

/**
 * Update category statistics by scanning the file system
 */
async function updateCategoryStats() {
  // If we have specific files that need formatting, categorize them
  if (stats.files.length > 0) {
    stats.files.forEach(file => {
      for (const [category, regex] of Object.entries(CONFIG.fileCategories)) {
        if (regex.test(file)) {
          stats.categories[category] = (stats.categories[category] || 0) + 1;
          break;
        }
      }
    });
    return;
  }
  
  // Otherwise, scan the entire codebase
  const walkDir = async (dir) => {
    const items = await fs.readdir(dir, { withFileTypes: true });
    let count = 0;
    
    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      
      // Skip node_modules and .git
      if (item.isDirectory() && !['node_modules', '.git', 'dist'].includes(item.name)) {
        const filesInDir = await walkDir(itemPath);
        count += filesInDir;
      } else if (item.isFile() && CONFIG.fileRegex.test(item.name)) {
        count++;
        
        // Categorize the file
        for (const [category, regex] of Object.entries(CONFIG.fileCategories)) {
          if (regex.test(item.name)) {
            stats.categories[category] = (stats.categories[category] || 0) + 1;
            break;
          }
        }
      }
    }
    
    return count;
  };
  
  try {
    const totalCount = await walkDir('.');
    if (stats.totalFiles === 0) {
      stats.totalFiles = totalCount;
    }
  } catch (error) {
    console.error(chalk.red('Error counting files:'), error.message);
  }
}

/**
 * Format the files with Prettier
 */
async function formatFiles() {
  // Skip if no files need formatting
  if (stats.filesFormatted === 0) {
    return true;
  }
  
  const spinner = createSpinner(`Formatting ${stats.filesFormatted} files`);
  
  try {
    spinner.start();
    
    // Run the format command
    await execAsync(CONFIG.formatCmd);
    
    spinner.success({ text: `Formatting complete` });
    return true;
  } catch (error) {
    spinner.error({ text: 'Formatting failed' });
    console.log(`${chalk.red('Error:')} ${error.message}`);
    return false;
  }
}

/**
 * Format the codebase and display a clean UI
 */
async function format() {
  // Clear terminal and show header
  console.clear();
  console.log(`\n${formatTitle}\n`);
  
  // Initialize stats
  initStats();
  
  // Analyze which files need formatting
  await analyzeFiles();
  
  // Format the files
  const success = await formatFiles();
  
  // Record end time
  stats.endTime = Date.now();
  
  // Show summary
  displaySummary(success);
}

/**
 * Display a clean summary of the formatting run
 */
function displaySummary(success) {
  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  const timestamp = new Date().toLocaleTimeString();
  
  console.log('\n');
  
  // Show header
  if (success) {
    console.log(chalk.bold.green('FORMAT SUMMARY'));
  } else {
    console.log(chalk.bold.red('FORMAT FAILED'));
  }
  
  console.log(chalk.dim('─'.repeat(40)));
  
  // Show basic statistics
  console.log(`${info} Time: ${chalk.cyan(timestamp)}`);
  console.log(`${info} Duration: ${chalk.cyan(duration)}s`);
  console.log(`${info} Files scanned: ${chalk.cyan(stats.totalFiles)}`);
  
  // Show category breakdown
  console.log('');
  console.log(chalk.underline('File Types:'));
  Object.entries(stats.categories)
    .filter(([_, count]) => count > 0)
    .forEach(([category, count]) => {
      console.log(`  ${chalk.cyan(count.toString().padStart(3))} ${chalk.gray('×')} ${getCategoryLabel(category)}`);
    });
  console.log('');
  
  // Show formatting status
  if (stats.filesFormatted === 0) {
    console.log(`${tick} ${chalk.green('All files already formatted')}`);
  } else {
    console.log(`${info} ${chalk.cyan(stats.filesFormatted)} files formatted`);
  }
  
  if (success) {
    console.log(`${tick} ${chalk.green('Code style is consistent')}`);
  }
  
  console.log('\n');
}

/**
 * Get a colorized label for each category
 */
function getCategoryLabel(category) {
  const labels = {
    typescript: chalk.hex('#3178C6')('TypeScript'),
    javascript: chalk.hex('#F7DF1E')('JavaScript'),
    json: chalk.hex('#000000')('JSON'),
    markdown: chalk.hex('#083fa1')('Markdown'),
    yaml: chalk.hex('#CB171E')('YAML'),
    web: chalk.hex('#E44D26')('Web')
  };
  
  return labels[category] || chalk.white(category);
}

// Run the formatter
format().catch(error => {
  console.error(chalk.red('Fatal error:'), error.message);
  process.exit(1);
}); 