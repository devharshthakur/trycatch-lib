#!/usr/bin/env node

/**
 * Minimalistic formatter for trycatch-lib
 * Provides clean, elegant output for code formatting
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Promisify exec
const execAsync = promisify(exec);

// Config
const formatCommand = 'prettier --write .';
const formatCheckCommand = 'prettier --check .';

// Format stats
const stats = {
  startTime: null,
  endTime: null,
  filesFormatted: 0,
  totalFiles: 0,
};

// Visual elements
const formatTitle = chalk.bold.cyan(`trycatch-lib formatter`);
const tick = chalk.green('✓');
const info = chalk.blue('ℹ');

/**
 * Count files that need formatting
 */
async function checkFormat() {
  const spinner = createSpinner('Analyzing codebase');
  
  try {
    spinner.start();
    stats.startTime = Date.now();
    
    // Run check command silently
    const { stdout, stderr } = await execAsync(formatCheckCommand);
    
    // Count files needing formatting
    const filesChecked = (stdout.match(/\.(?:ts|js|json|md)/g) || []).length;
    stats.totalFiles = filesChecked;
    stats.filesFormatted = 0;
    
    spinner.success({ text: 'Analysis complete' });
    return true;
  } catch (error) {
    // This is expected if files need formatting
    const filesChecked = (error.stdout.match(/\.(?:ts|js|json|md)/g) || []).length;
    stats.totalFiles = filesChecked;
    
    // Count files needing formatting from error output
    const fileLines = error.stdout.split('\n').filter(line => line.includes('would be formatted'));
    stats.filesFormatted = fileLines.length;
    
    spinner.success({ text: 'Analysis complete' });
    return true;
  }
}

/**
 * Format the codebase
 */
async function runFormat() {
  // If no files need formatting, skip
  if (stats.filesFormatted === 0) {
    return true;
  }
  
  const spinner = createSpinner(`Formatting ${stats.filesFormatted} files`);
  
  try {
    spinner.start();
    
    // Run format command silently
    await execAsync(formatCommand);
    
    spinner.success({ text: 'Formatting complete' });
    return true;
  } catch (error) {
    spinner.error({ text: 'Formatting failed' });
    console.log(`${chalk.red('Error:')} ${error.message}`);
    return false;
  }
}

/**
 * Format the codebase with a clean UI
 */
async function format() {
  // Clear terminal and show header
  console.clear();
  console.log(`\n${formatTitle}\n`);
  
  // Check format first
  await checkFormat();
  
  // Format if needed
  const success = await runFormat();
  
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
  
  console.log(chalk.dim('─'.repeat(30)));
  
  // Show statistics
  console.log(`${info} Time: ${chalk.cyan(timestamp)}`);
  console.log(`${info} Duration: ${chalk.cyan(duration)}s`);
  console.log(`${info} Files scanned: ${chalk.cyan(stats.totalFiles)}`);
  
  if (stats.filesFormatted === 0) {
    console.log(`${tick} ${chalk.green('No files needed formatting')}`);
  } else {
    console.log(`${info} Files formatted: ${chalk.cyan(stats.filesFormatted)}`);
  }
  
  if (success) {
    console.log(`${tick} ${chalk.green('Code style is consistent')}`);
  }
  
  console.log('\n');
}

// Run the formatter
format().catch(error => {
  console.error(chalk.red('Fatal error:'), error.message);
  process.exit(1);
}); 