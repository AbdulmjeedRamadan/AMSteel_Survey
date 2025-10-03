#!/usr/bin/env node

/**
 * CodeRabbit Test Script
 * This script simulates CodeRabbit review locally
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CodeRabbitTester {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      frontend: {},
      backend: {},
      security: {},
      performance: {},
      accessibility: {},
      i18n: {}
    };
  }

  async runTests() {
    console.log('🔍 Starting CodeRabbit simulation...\n');
    
    try {
      await this.checkTypeScript();
      await this.checkESLint();
      await this.checkSecurity();
      await this.checkPerformance();
      await this.checkAccessibility();
      await this.checkInternationalization();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Error running CodeRabbit tests:', error.message);
      process.exit(1);
    }
  }

  async checkTypeScript() {
    console.log('📝 Checking TypeScript...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.results.frontend.typescript = { status: '✅ Passed', issues: 0 };
      console.log('✅ TypeScript: No errors found');
    } catch (error) {
      const issues = error.stdout.toString().split('\n').filter(line => line.includes('error'));
      this.results.frontend.typescript = { status: '❌ Failed', issues: issues.length };
      console.log(`❌ TypeScript: ${issues.length} errors found`);
    }
  }

  async checkESLint() {
    console.log('🔧 Checking ESLint...');
    try {
      // Check if ESLint config exists
      const eslintConfig = ['eslint.config.js', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yaml'];
      const hasConfig = eslintConfig.some(config => 
        fs.existsSync(path.join(this.projectRoot, config))
      );
      
      if (!hasConfig) {
        this.results.frontend.eslint = { status: '❌ No config', issues: 0 };
        console.log('❌ ESLint: No configuration file found');
        return;
      }
      
      execSync('npm run lint', { stdio: 'pipe' });
      this.results.frontend.eslint = { status: '✅ Passed', issues: 0 };
      console.log('✅ ESLint: No issues found');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const issues = output.split('\n').filter(line => 
        line.includes('error') || line.includes('warning')
      );
      this.results.frontend.eslint = { 
        status: issues.length > 0 ? '⚠️ Issues found' : '❌ Config error', 
        issues: issues.length 
      };
      console.log(`⚠️ ESLint: ${issues.length} issues found`);
    }
  }

  async checkSecurity() {
    console.log('🔒 Checking security...');
    try {
      execSync('npm audit --audit-level moderate', { stdio: 'pipe' });
      this.results.security.audit = { status: '✅ Passed', issues: 0 };
      console.log('✅ Security audit: No vulnerabilities found');
    } catch (error) {
      const issues = error.stdout.toString().split('\n').filter(line => line.includes('vulnerability'));
      this.results.security.audit = { status: '❌ Vulnerabilities', issues: issues.length };
      console.log(`❌ Security: ${issues.length} vulnerabilities found`);
    }
  }

  async checkPerformance() {
    console.log('⚡ Checking performance...');
    try {
      // Try to build the project
      execSync('npm run build', { stdio: 'pipe' });
      
      // Check bundle size
      const distPath = path.join(this.projectRoot, 'dist');
      if (fs.existsSync(distPath)) {
        const files = this.getFilesRecursively(distPath, ['.js', '.css']);
        let totalSize = 0;
        files.forEach(file => {
          const stats = fs.statSync(file);
          totalSize += stats.size;
        });
        
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        this.results.performance.bundleSize = { 
          status: sizeInMB < 5 ? '✅ Good' : '⚠️ Large', 
          size: `${sizeInMB}MB` 
        };
        console.log(`📦 Bundle size: ${sizeInMB}MB`);
      } else {
        this.results.performance.bundleSize = { status: '❌ No dist folder', size: 'N/A' };
        console.log('❌ No dist folder found');
      }
    } catch (error) {
      this.results.performance.bundleSize = { status: '❌ Build failed', size: 'N/A' };
      console.log('❌ Build failed:', error.message);
    }
  }

  async checkAccessibility() {
    console.log('♿ Checking accessibility...');
    
    // Check for common accessibility issues
    const srcPath = path.join(this.projectRoot, 'src');
    const files = this.getFilesRecursively(srcPath, ['.tsx', '.ts']);
    
    let accessibilityIssues = 0;
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for missing alt attributes
      if (content.includes('<img') && !content.includes('alt=')) {
        accessibilityIssues++;
      }
      
      // Check for missing aria-labels
      if (content.includes('<button') && !content.includes('aria-label') && !content.includes('aria-labelledby')) {
        accessibilityIssues++;
      }
    });
    
    this.results.accessibility.issues = { 
      status: accessibilityIssues === 0 ? '✅ Good' : '⚠️ Issues found', 
      count: accessibilityIssues 
    };
    console.log(`♿ Accessibility: ${accessibilityIssues} issues found`);
  }

  async checkInternationalization() {
    console.log('🌍 Checking internationalization...');
    
    const i18nPath = path.join(this.projectRoot, 'src/i18n');
    if (fs.existsSync(i18nPath)) {
      const translationFiles = fs.readdirSync(i18nPath).filter(file => file.endsWith('.json'));
      this.results.i18n.translations = { 
        status: '✅ Found', 
        files: translationFiles.length 
      };
      console.log(`🌍 i18n: ${translationFiles.length} translation files found`);
    } else {
      this.results.i18n.translations = { status: '❌ Missing', files: 0 };
      console.log('❌ i18n: No translation files found');
    }
  }

  getFilesRecursively(dir, extensions) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(this.getFilesRecursively(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  generateReport() {
    console.log('\n📊 CodeRabbit Review Report');
    console.log('='.repeat(50));
    
    console.log('\n🎨 Frontend:');
    console.log(`  TypeScript: ${this.results.frontend.typescript?.status || '❌ Not checked'}`);
    console.log(`  ESLint: ${this.results.frontend.eslint?.status || '❌ Not checked'}`);
    
    console.log('\n🔒 Security:');
    console.log(`  Audit: ${this.results.security.audit?.status || '❌ Not checked'}`);
    
    console.log('\n⚡ Performance:');
    console.log(`  Bundle Size: ${this.results.performance.bundleSize?.status || '❌ Not checked'} (${this.results.performance.bundleSize?.size || 'N/A'})`);
    
    console.log('\n♿ Accessibility:');
    console.log(`  Issues: ${this.results.accessibility.issues?.status || '❌ Not checked'} (${this.results.accessibility.issues?.count || 0} found)`);
    
    console.log('\n🌍 Internationalization:');
    console.log(`  Translations: ${this.results.i18n.translations?.status || '❌ Not checked'} (${this.results.i18n.translations?.files || 0} files)`);
    
    console.log('\n💡 Recommendations:');
    console.log('  1. Review TypeScript errors and fix type issues');
    console.log('  2. Address ESLint warnings for better code quality');
    console.log('  3. Fix security vulnerabilities immediately');
    console.log('  4. Optimize bundle size if it exceeds 5MB');
    console.log('  5. Add accessibility attributes to improve UX');
    console.log('  6. Ensure all text is properly internationalized');
    
    console.log('\n🚀 Next Steps:');
    console.log('  1. Fix all critical issues (TypeScript errors, security vulnerabilities)');
    console.log('  2. Address warnings and performance issues');
    console.log('  3. Test accessibility with screen readers');
    console.log('  4. Verify internationalization works correctly');
    console.log('  5. Create a Pull Request to see CodeRabbit in action!');
  }
}

// Run the tester
const tester = new CodeRabbitTester();
tester.runTests().catch(console.error);

export default CodeRabbitTester;
