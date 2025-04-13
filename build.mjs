#!/usr/bin/env node

/**
 * Enhanced build script for trycatch-lib
 * Provides beautiful text-focused logs and step tracking
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';

// Promisify exec
const execAsync = promisify(exec);

// Config
const packageName = 'trycatch-lib';
const buildSteps = [
  { name: 'clean', command: 'rimraf dist', description: 'Cleaning output directory' },
  { name: 'esm', command: 'tsc -p tsconfig.esm.json', description: 'Building ESM modules' },
  { name: 'cjs', command: 'tsc -p tsconfig.cjs.json', description: 'Building CommonJS modules' }
];

// Stats tracking
const stats = {
  startTime: null,
  endTime: null,
  fileCount: 0,
};

// Text decorations
const line = chalk.dim('─'.repeat(60));
const doubleLine = chalk.dim('═'.repeat(60));
const bullet = chalk.cyan('•');
const arrow = chalk.cyan('→');
const check = chalk.green('✓');
const cross = chalk.red('✗');

// Helper functions
async function countFilesInDir(dir) {
  try {
    let count = 0;
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        count += await countFilesInDir(itemPath);
      } else if (item.isFile() && item.name.endsWith('.js')) {
        count++;
      }
    }
    
    return count;
  } catch (error) {
    return 0; // Directory might not exist yet
  }
}

// Execute a build step with pretty output
async function executeStep(step, index, total) {
  const stepNumber = `${index + 1}/${total}`;
  const spinner = createSpinner(`${chalk.dim(stepNumber)} ${chalk.cyan(step.description)}`);
  
  try {
    spinner.start();
    const startTime = Date.now();
    
    const { stdout, stderr } = await execAsync(step.command);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (stderr && !stderr.includes('Warning')) {
      spinner.error({ text: `${chalk.dim(stepNumber)} ${chalk.red(step.description)} ${chalk.dim(`(${duration}s)`)}` });
      console.error(chalk.dim(stderr));
    } else {
      spinner.success({ text: `${chalk.dim(stepNumber)} ${chalk.green(step.description)} ${chalk.dim(`(${duration}s)`)}` });
      if (stdout.trim()) {
        console.log(chalk.dim(stdout));
      }
    }
    
    return { success: true, duration };
  } catch (error) {
    spinner.error({ text: `${chalk.dim(stepNumber)} ${chalk.red(step.description)}` });
    
    // Display full error details
    console.error('\n' + line);
    console.error(`${cross} ${chalk.red('Build Command Failed:')} ${chalk.white(step.command)}`);
    console.error(line);
    
    // Show the error message with simple formatting
    if (error.stderr) {
      console.error('');
      console.error(chalk.yellow('COMPILER ERROR:'));
      console.error(chalk.yellow(error.stderr));
      console.error('');
    } else {
      console.error('');
      console.error(chalk.yellow('ERROR:'));
      console.error(chalk.yellow(error.message));
      console.error('');
    }
    
    return { success: false, error };
  }
}

// Main build function
async function build() {
  console.log('');
  console.log(doubleLine);
  console.log(chalk.bold.cyan(`  ${packageName.toUpperCase()} BUILD`));
  console.log(doubleLine);
  console.log('');
  
  stats.startTime = Date.now();
  
  // Run all build steps
  let allSuccess = true;
  for (let i = 0; i < buildSteps.length; i++) {
    const result = await executeStep(buildSteps[i], i, buildSteps.length);
    if (!result.success) {
      allSuccess = false;
      break;
    }
  }
  
  stats.endTime = Date.now();
  
  // Calculate and display stats
  if (allSuccess) {
    await displayBuildSummary();
  } else {
    console.log('');
    console.log(line);
    console.log(chalk.bold.red('  Build failed'));
    console.log(line);
    console.log('');
  }
}

// Display build summary with stats
async function displayBuildSummary() {
  const totalTime = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  stats.fileCount = await countFilesInDir('./dist');
  
  const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8'));
  const version = packageJson.version;
  
  console.log('');
  console.log(doubleLine);
  console.log(chalk.bold.green('  BUILD COMPLETE'));
  console.log(doubleLine);
  console.log('');
  console.log(`  ${bullet} ${chalk.bold(`${packageName}@${version}`)}`);
  console.log(`  ${check} Built in ${chalk.cyan(totalTime)}s`);
  console.log(`  ${check} ${chalk.cyan(stats.fileCount)} files generated`);
  console.log(`  ${check} ESM + CJS formats`);
  console.log('');
}

// Run the build
build().catch(error => {
  console.error(chalk.red('Fatal build error:'), error);
  process.exit(1);
});
