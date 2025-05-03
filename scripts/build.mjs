#!/usr/bin/env node

/**
 * Minimalistic builder for trycatch-lib
 * Provides detailed output for the build process with file statistics
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

// Configuration
const CONFIG = {
  // Package information
  packageName: 'trycatch-lib',
  
  // Build steps
  buildSteps: [
    { 
      name: 'clean', 
      command: 'rimraf dist', 
      description: 'Cleaning output directory',
      icon: '🧹'
    },
    { 
      name: 'esm', 
      command: 'tsc -p tsconfig.esm.json', 
      description: 'Building ESM modules',
      icon: '📦',
      outputDir: './dist/esm'
    },
    { 
      name: 'cjs', 
      command: 'tsc -p tsconfig.cjs.json', 
      description: 'Building CommonJS modules',
      icon: '📦',
      outputDir: './dist/cjs'
    }
  ],
  
  // File categorization regexes for reporting
  fileCategories: {
    javascript: /\.js$/i,
    declaration: /\.d\.ts$/i,
    sourceMap: /\.map$/i,
    other: /\.(json|txt|md)$/i
  }
};

// Stats tracking
const stats = {
  startTime: null,
  endTime: null,
  steps: {},
  files: {
    total: 0,
    byType: {},
    byOutput: {}
  }
};

// Visual elements
const buildTitle = chalk.bold.cyan(`${CONFIG.packageName} builder`);
const tick = chalk.green('✓');
const info = chalk.blue('ℹ');
const warn = chalk.yellow('⚠');
const error = chalk.red('✖');

/**
 * Initialize stats tracking
 */
function initStats() {
  stats.startTime = Date.now();
  stats.steps = {};
  stats.files = {
    total: 0,
    byType: {},
    byOutput: {}
  };
  
  // Initialize categories
  Object.keys(CONFIG.fileCategories).forEach(category => {
    stats.files.byType[category] = 0;
  });
  
  // Initialize step stats
  CONFIG.buildSteps.forEach(step => {
    stats.steps[step.name] = {
      duration: 0,
      success: false
    };
    
    if (step.outputDir) {
      stats.files.byOutput[step.name] = 0;
    }
  });
}

/**
 * Count and categorize output files
 */
async function countOutputFiles() {
  // Count files by type across all directories
  const countAllFiles = async (dir) => {
    try {
      let count = 0;
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          const dirCount = await countAllFiles(itemPath);
          count += dirCount;
        } else if (item.isFile()) {
          count++;
          
          // Categorize the file by type
          let categorized = false;
          for (const [category, regex] of Object.entries(CONFIG.fileCategories)) {
            if (regex.test(item.name)) {
              stats.files.byType[category] = (stats.files.byType[category] || 0) + 1;
              categorized = true;
              break;
            }
          }
          
          // If no category matched, count as "other"
          if (!categorized) {
            stats.files.byType.other = (stats.files.byType.other || 0) + 1;
          }
          
          // Count by output directory
          for (const step of CONFIG.buildSteps) {
            if (step.outputDir && itemPath.includes(step.outputDir)) {
              stats.files.byOutput[step.name] = (stats.files.byOutput[step.name] || 0) + 1;
              break;
            }
          }
        }
      }
      
      return count;
    } catch (error) {
      return 0; // Directory might not exist
    }
  };
  
  // Count all files
  stats.files.total = await countAllFiles('./dist');
}

/**
 * Format TypeScript error messages for better readability
 * @param {string} stderr The standard error output from the compiler
 * @returns {string[]} Array of formatted error lines
 */
function formatTsErrors(stderr) {
  if (!stderr) return [];
  
  const lines = stderr.split('\n').filter(line => line.trim());
  const formattedLines = [];
  
  // Group error information together
  let currentError = null;
  
  for (const line of lines) {
    // New error starts
    if (line.match(/\.(ts|tsx|js|jsx)(\(\d+,\d+\))?: error TS\d+:/)) {
      // Add spacing between errors
      if (currentError) {
        formattedLines.push('');
      }
      
      // Format the error line with file path, line and column
      const match = line.match(/(.*?)(\(\d+,\d+\))?: (error TS\d+: .*)/);
      if (match) {
        const [_, filePath, position, errorMessage] = match;
        
        // Extract the file, line, and column
        formattedLines.push(chalk.bold.red(errorMessage));
        formattedLines.push(
          chalk.cyan(`   at ${chalk.yellow(filePath.trim())}${position || ''}`)
        );
      } else {
        formattedLines.push(chalk.red(line));
      }
      
      currentError = line;
    } 
    // Error details or suggestions 
    else if (currentError) {
      // Code snippets with error indicators (often shown with ~~~~ under the error)
      if (line.includes('~')) {
        const parts = line.split('~');
        if (parts[0]) {
          formattedLines.push(chalk.dim(parts[0]) + chalk.red('~'.repeat(parts[1]?.length || 0)));
        } else {
          formattedLines.push(chalk.red(line));
        }
      } 
      // Type information
      else if (line.includes('Type ') && (line.includes(' is ') || line.includes(' has '))) {
        formattedLines.push(chalk.yellow(`   ${line.trim()}`));
      }
      // Suggestions and hints
      else if (line.includes('Did you mean') || line.includes('Did you forget') || line.includes('Consider')) {
        formattedLines.push(chalk.green(`   💡 ${line.trim()}`));
      }
      // Everything else
      else {
        formattedLines.push(chalk.dim(`   ${line.trim()}`));
      }
    } 
    // General information
    else {
      formattedLines.push(chalk.dim(line));
    }
  }
  
  // Add error count summary if we can find it
  const errorCountMatch = stderr.match(/Found (\d+) error/);
  if (errorCountMatch) {
    formattedLines.push('');
    formattedLines.push(chalk.bold.red(`Found ${errorCountMatch[1]} error(s)`));
  }
  
  return formattedLines;
}

/**
 * Execute a single build step
 */
async function executeStep(step) {
  const spinner = createSpinner(`${step.icon || '•'} ${step.description}`);
  const startTime = Date.now();
  
  try {
    spinner.start();
    await execAsync(step.command);
    
    // Record stats
    const duration = (Date.now() - startTime) / 1000;
    stats.steps[step.name] = {
      duration,
      success: true
    };
    
    spinner.success({ text: `${step.icon || '•'} ${step.description} ${chalk.dim(`(${duration.toFixed(2)}s)`)}` });
    return true;
  } catch (buildError) {
    // Record failure
    stats.steps[step.name] = {
      duration: (Date.now() - startTime) / 1000,
      success: false,
      error: buildError.message
    };
    
    spinner.error({ text: `${step.icon || '•'} ${step.description}` });
    
    // Show error details in a structured way
    console.log('');
    console.log(chalk.bold.red('▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄'));
    console.log(chalk.bold.white.bgRed(' TypeScript Compilation Errors '));
    console.log(chalk.bold.red('▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀'));
    console.log('');
    
    // Display compiler errors with nice formatting
    if (buildError.stderr) {
      const formattedErrors = formatTsErrors(buildError.stderr);
      formattedErrors.forEach(line => console.log(line));
    } else {
      console.log(chalk.red(buildError.message));
    }
    
    console.log('');
    console.log(chalk.dim('─'.repeat(50)));
    console.log(chalk.yellow('💡 Fix the above TypeScript errors to continue.'));
    console.log(chalk.dim('─'.repeat(50)));
    console.log('');
    
    return false;
  }
}

/**
 * Run all build steps sequentially
 */
async function runBuild() {
  // Clear terminal and show header
  console.clear();
  console.log(`\n${buildTitle}\n`);
  
  // Initialize stats
  initStats();
  
  let allSuccess = true;
  
  // Execute each build step
  for (const step of CONFIG.buildSteps) {
    const success = await executeStep(step);
    if (!success) {
      allSuccess = false;
      break;
    }
  }
  
  // Record end time
  stats.endTime = Date.now();
  
  // If build was successful, count output files
  if (allSuccess) {
    await countOutputFiles();
  }
  
  // Display summary
  displayBuildSummary(allSuccess);
  
  return allSuccess;
}

/**
 * Display detailed build summary
 */
async function displayBuildSummary(success) {
  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  const timestamp = new Date().toLocaleTimeString();
  
  // Get package info
  let version = '0.0.0';
  try {
    const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8'));
    version = packageJson.version;
  } catch (err) {
    // Ignore read errors
  }
  
  console.log('\n');
  
  // Show header based on build result
  if (success) {
    console.log(chalk.bold.green('BUILD SUCCESSFUL'));
  } else {
    console.log(chalk.bold.red('BUILD FAILED'));
  }
  
  console.log(chalk.dim('─'.repeat(50)));
  
  // Basic information
  console.log(`${info} Package: ${chalk.cyan(`${CONFIG.packageName}@${version}`)}`);
  console.log(`${info} Time: ${chalk.cyan(timestamp)}`);
  console.log(`${info} Duration: ${chalk.cyan(duration)}s`);
  
  // Step results
  console.log('');
  console.log(chalk.underline('Build Steps:'));
  for (const step of CONFIG.buildSteps) {
    const stepStats = stats.steps[step.name];
    if (!stepStats) continue;
    
    if (stepStats.success) {
      console.log(`  ${tick} ${chalk.bold(step.name.padEnd(8))} ${chalk.dim(`${stepStats.duration.toFixed(2)}s`)}`);
    } else {
      console.log(`  ${error} ${chalk.bold(step.name.padEnd(8))} ${chalk.red('failed')}`);
    }
  }
  
  // File counts (only if successful)
  if (success && stats.files.total > 0) {
    console.log('');
    console.log(chalk.underline('Output Files:'));
    console.log(`  ${chalk.cyan(stats.files.total.toString().padStart(3))} ${chalk.gray('×')} Total files generated`);
    
    // Output by format (ESM/CJS)
    console.log('');
    console.log(chalk.underline('Output by Format:'));
    for (const [format, count] of Object.entries(stats.files.byOutput)) {
      const icon = format === 'esm' ? '📦' : '📑';
      console.log(`  ${chalk.cyan(count.toString().padStart(3))} ${chalk.gray('×')} ${icon} ${formatLabel(format)}`);
    }
    
    // Output by file type
    console.log('');
    console.log(chalk.underline('Output by Type:'));
    for (const [type, count] of Object.entries(stats.files.byType)) {
      if (count > 0) {
        console.log(`  ${chalk.cyan(count.toString().padStart(3))} ${chalk.gray('×')} ${getFileTypeIcon(type)} ${formatLabel(type)}`);
      }
    }
  }
  
  console.log('\n');
}

/**
 * Get an icon for a file type
 */
function getFileTypeIcon(type) {
  const icons = {
    javascript: '📜',
    declaration: '📋',
    sourceMap: '🗺️',
    other: '📄'
  };
  
  return icons[type] || '📄';
}

/**
 * Format a label for display
 */
function formatLabel(key) {
  const labels = {
    // Formats
    esm: chalk.hex('#FFB900')('ES Modules'),
    cjs: chalk.hex('#5FCCFF')('CommonJS'),
    
    // File types
    javascript: chalk.hex('#F7DF1E')('JavaScript Files'),
    declaration: chalk.hex('#3178C6')('TypeScript Declarations'),
    sourceMap: chalk.hex('#CC6699')('Source Maps'),
    other: chalk.hex('#888888')('Other Files')
  };
  
  return labels[key] || chalk.white(key);
}

// Run the build
runBuild().then(success => {
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error(`${error} ${chalk.bold.red('Fatal Error:')} ${err.message}`);
  process.exit(1);
});