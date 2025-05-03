#!/usr/bin/env node

/**
 * Minimalistic builder for trycatch-lib
 * Provides clean, elegant output for the build process
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';

// Promisify exec
const execAsync = promisify(exec);

// Build steps configuration
const buildSteps = [
  { name: 'clean', command: 'rimraf dist', description: 'Cleaning output' },
  { name: 'esm', command: 'tsc -p tsconfig.esm.json', description: 'Building ESM modules' },
  { name: 'cjs', command: 'tsc -p tsconfig.cjs.json', description: 'Building CommonJS modules' }
];

// Stats tracking
const stats = {
  startTime: null,
  endTime: null,
  fileCount: 0,
};

// Visual elements
const buildTitle = chalk.bold.cyan(`trycatch-lib builder`);
const tick = chalk.green('✓');
const info = chalk.blue('ℹ');

/**
 * Count JS files in build output
 */
async function countBuildFiles() {
  try {
    let count = 0;
    const scanDir = async (dir) => {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          await scanDir(itemPath);
        } else if (item.isFile() && item.name.endsWith('.js')) {
          count++;
        }
      }
    };
    
    await scanDir('./dist');
    return count;
  } catch (error) {
    return 0; // Directory might not exist yet
  }
}

/**
 * Execute a single build step
 */
async function executeStep(step) {
  const spinner = createSpinner(step.description);
  
  try {
    spinner.start();
    await execAsync(step.command);
    spinner.success({ text: step.description });
    return true;
  } catch (error) {
    spinner.error({ text: step.description });
    console.log(`${chalk.red('Error:')} ${error.message}`);
    return false;
  }
}

/**
 * Run the full build process
 */
async function build() {
  // Clear terminal and show header
  console.clear();
  console.log(`\n${buildTitle}\n`);
  
  // Start timing
  stats.startTime = Date.now();
  
  // Run all build steps in sequence
  let allSuccess = true;
  for (const step of buildSteps) {
    const success = await executeStep(step);
    if (!success) {
      allSuccess = false;
      break;
    }
  }
  
  // Record end time
  stats.endTime = Date.now();
  
  // Count files and show summary
  if (allSuccess) {
    stats.fileCount = await countBuildFiles();
    displaySummary(true);
  } else {
    displaySummary(false);
  }
}

/**
 * Display a clean summary of the build
 */
async function displaySummary(success) {
  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  const timestamp = new Date().toLocaleTimeString();
  
  // Get package version
  let version = '0.0.0';
  try {
    const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8'));
    version = packageJson.version;
  } catch (error) {
    // Ignore error
  }
  
  console.log('\n');
  
  // Show header
  if (success) {
    console.log(chalk.bold.green('BUILD SUMMARY'));
  } else {
    console.log(chalk.bold.red('BUILD FAILED'));
  }
  
  console.log(chalk.dim('─'.repeat(30)));
  
  // Show statistics
  console.log(`${info} Version: ${chalk.cyan(version)}`);
  console.log(`${info} Time: ${chalk.cyan(timestamp)}`);
  console.log(`${info} Duration: ${chalk.cyan(duration)}s`);
  
  if (success) {
    console.log(`${info} Files generated: ${chalk.cyan(stats.fileCount)}`);
    console.log(`${tick} ${chalk.green('ESM modules built')}`);
    console.log(`${tick} ${chalk.green('CommonJS modules built')}`);
  }
  
  console.log('\n');
}

// Run the build
build().catch(error => {
  console.error(chalk.red('Fatal error:'), error.message);
  process.exit(1);
});