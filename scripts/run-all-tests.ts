import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m'
};

console.log(`${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.blue}║   NFT Metadata Module - Complete Test Suite           ║${colors.reset}`);
console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

const tests = [
  {
    name: "Unit Tests",
    script: "npx tsx scripts/test-metadata.ts"
  },
  {
    name: "Example Validation",
    script: "npx tsx scripts/validate-examples.ts"
  },
  {
    name: "Edge Cases",
    script: "npx tsx scripts/test-edge-cases.ts"
  },
  {
    name: "Validation Tests",
    script: "npx tsx scripts/test-validation.ts"
  },
  {
    name: "TypeScript Compilation",
    script: "npx tsc --noEmit utils/metadata/*.ts"
  }
];

let totalPassed = 0;
let totalFailed = 0;

for (const test of tests) {
  console.log(`${colors.blue}▶ Running: ${test.name}${colors.reset}`);

  try {
    execSync(test.script, { stdio: 'inherit' });
    console.log(`${colors.green}✓ ${test.name} passed${colors.reset}\n`);
    totalPassed++;
  } catch (error) {
    console.log(`${colors.red}✗ ${test.name} failed${colors.reset}\n`);
    totalFailed++;
  }
}

console.log(`${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.blue}║   Final Test Summary                                   ║${colors.reset}`);
console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

console.log(`Total test suites: ${tests.length}`);
console.log(`${colors.green}Passed: ${totalPassed}${colors.reset}`);
console.log(`${colors.red}Failed: ${totalFailed}${colors.reset}\n`);

if (totalFailed === 0) {
  console.log(`${colors.green}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.green}║   ALL TESTS PASSED! ✓                                  ║${colors.reset}`);
  console.log(`${colors.green}║   Metadata module is production-ready!                 ║${colors.reset}`);
  console.log(`${colors.green}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.red}║   SOME TESTS FAILED! ✗                                 ║${colors.reset}`);
  console.log(`${colors.red}║   Please review errors above                           ║${colors.reset}`);
  console.log(`${colors.red}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
  process.exit(1);
}
