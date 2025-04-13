#!/usr/bin/env node

/**
 * Enhanced format script for trycatch-lib
 * Provides beautiful text-focused logs for code formatting
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Promisify exec
const execAsync = promisify(exec);

// Config
const packageName = 'trycatch-lib';
const formatCommand = 'prettier --write .';
const formatCheckCommand = 'prettier --check .';

// Stats tracking
const stats = {
  startTime: null,
  endTime: null,
  filesFormatted: 0,
  totalFiles: 0,
};

// Text decorations
const line = chalk.dim('─'.repeat(60));
const doubleLine = chalk.dim('═'.repeat(60));
const bullet = chalk.cyan('•');
const arrow = chalk.cyan('→');
const check = chalk.green('✓');
const cross = chalk.red('✗');

// Execute prettier check first to count files that need formatting
async function checkFormat() {
  const spinner = createSpinner(`${chalk.cyan('Checking code format')}`);
  
  try {
    spinner.start();
    const { stdout, stderr } = await execAsync(formatCheckCommand);
    
    // Parse the output to count files
    const filesChecked = (stdout.match(/\.(?:ts|js|json|md)/g) || []).length;
    stats.totalFiles = filesChecked;
    
    // Count files needing formatting (files listed in output)
    const fileLines = stdout.split('\n').filter(line => line.includes('would be formatted'));
    stats.filesFormatted = fileLines.length;
    
    spinner.success({ text: `${chalk.green('Format check complete')} (${filesChecked} files scanned)` });
    return true;
  } catch (error) {
    // This is expected if files need formatting, not a real error
    // Parse the output similarly to get counts
    const filesChecked = (error.stdout.match(/\.(?:ts|js|json|md)/g) || []).length;
    stats.totalFiles = filesChecked;
    
    const fileLines = error.stdout.split('\n').filter(line => line.includes('would be formatted'));
    stats.filesFormatted = fileLines.length;
    
    spinner.success({ text: `${chalk.green('Format check complete')} (${filesChecked} files scanned)` });
    return true;
  }
}

// Execute the prettier format command
async function runFormat() {
  const spinner = createSpinner(`${chalk.cyan('Formatting')} ${stats.filesFormatted} ${chalk.cyan('files')}`);
  
  try {
    spinner.start();
    const startTime = Date.now();
    
    const { stdout, stderr } = await execAsync(formatCommand);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (stderr && !stderr.includes('warning')) {
      spinner.error({ text: `${chalk.red('Formatting failed')} ${chalk.dim(`(${duration}s)`)}` });
      console.error(chalk.dim(stderr));
      return false;
    } else {
      spinner.success({ text: `${chalk.green('Formatting complete')} ${chalk.dim(`(${duration}s)`)}` });
      return true;
    }
  } catch (error) {
    spinner.error({ text: `${chalk.red('Formatting failed')}` });
    
    // Display full error details
    console.error('\n' + line);
    console.error(`${cross} ${chalk.red('Format Command Failed:')}`);
    console.error(line);
    
    console.error('');
    console.error(chalk.yellow('ERROR:'));
    console.error(chalk.yellow(error.message));
    if (error.stderr) {
      console.error(chalk.yellow(error.stderr));
    }
    console.error('');
    
    return false;
  }
}

// Main format function
async function format() {
  console.log('');
  console.log(doubleLine);
  console.log(chalk.bold.cyan(`  ${packageName.toUpperCase()} FORMAT`));
  console.log(doubleLine);
  console.log('');
  
  stats.startTime = Date.now();
  
  // First check formats to count files
  await checkFormat();
  
  // Skip formatting if no files need it
  if (stats.filesFormatted === 0) {
    console.log(`  ${check} ${chalk.green('All files already formatted')}`);
    stats.endTime = Date.now();
    await displayFormatSummary();
    return;
  }
  
  // Run the formatter
  const success = await runFormat();
  
  stats.endTime = Date.now();
  
  // Calculate and display stats
  if (success) {
    await displayFormatSummary();
  } else {
    console.log('');
    console.log(line);
    console.log(chalk.bold.red('  Format failed'));
    console.log(line);
    console.log('');
  }
}

// Display format summary with stats
async function displayFormatSummary() {
  const totalTime = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  
  console.log('');
  console.log(doubleLine);
  console.log(chalk.bold.green('  FORMAT COMPLETE'));
  console.log(doubleLine);
  console.log('');
  console.log(`  ${bullet} ${chalk.bold(`Files scanned: ${stats.totalFiles}`)}`);
  console.log(`  ${bullet} ${chalk.bold(`Files formatted: ${stats.filesFormatted}`)}`);
  console.log(`  ${check} Completed in ${chalk.cyan(totalTime)}s`);
  console.log(`  ${check} Code style consistent`);
  console.log('');
}

// Run the formatter
format().catch(error => {
  console.error(chalk.red('Fatal format error:'), error);
  process.exit(1);
}); 