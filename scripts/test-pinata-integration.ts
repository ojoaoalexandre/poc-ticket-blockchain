import dotenv from 'dotenv';
import { uploadTicketToIPFS, verifyPinataKey } from '../utils/pinata';
import { generateMetadata } from '../utils/metadata/generator';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

async function validateGatewayAccess(url: string, type: 'image' | 'metadata'): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.log(`   ${colors.red}✗${colors.reset} Failed: HTTP ${response.status}`);
      return false;
    }

    const contentType = response.headers.get('content-type');
    console.log(`   ${colors.green}✓${colors.reset} Accessible (${contentType})`);

    return true;
  } catch (error) {
    console.log(`   ${colors.red}✗${colors.reset} Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    return false;
  }
}

async function validateMetadataContent(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.log(`   ${colors.red}✗${colors.reset} Failed to fetch: HTTP ${response.status}`);
      return false;
    }

    const json = await response.json();
    const requiredFields = ['name', 'description', 'image', 'attributes'];
    const missingFields = requiredFields.filter(field => !(field in json));

    if (missingFields.length > 0) {
      console.log(`   ${colors.red}✗${colors.reset} Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (!json.image.startsWith('ipfs://')) {
      console.log(`   ${colors.yellow}⚠${colors.reset} Image URI doesn't use ipfs:// protocol: ${json.image}`);
    }

    if (!Array.isArray(json.attributes)) {
      console.log(`   ${colors.red}✗${colors.reset} Attributes is not an array`);
      return false;
    }

    console.log(`   ${colors.green}✓${colors.reset} Valid ERC-721 metadata`);
    console.log(`   ${colors.blue}→${colors.reset} Name: ${json.name}`);
    console.log(`   ${colors.blue}→${colors.reset} Attributes: ${json.attributes.length}`);
    console.log(`   ${colors.blue}→${colors.reset} Image: ${json.image}`);

    return true;
  } catch (error) {
    console.log(`   ${colors.red}✗${colors.reset} Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.magenta}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║     Pinata Integration Test - IPFS Upload            ║${colors.reset}`);
  console.log(`${colors.magenta}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  console.log(`${colors.blue}[Test 1/5]${colors.reset} Verifying Pinata JWT...`);
  try {
    await verifyPinataKey();
    console.log(`${colors.green}✓${colors.reset} JWT is valid and authenticated\n`);
    testsPassed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} JWT verification failed: ${error instanceof Error ? error.message : 'Unknown'}\n`);
    console.log(`${colors.yellow}💡 Get your JWT at: https://app.pinata.cloud/developers/api-keys${colors.reset}\n`);
    testsFailed++;
    process.exit(1);
  }

  console.log(`${colors.blue}[Test 2/5]${colors.reset} Locating test ticket image...`);
  const possiblePaths = [
    path.resolve(__dirname, '../assets/tickets/examples/ticket-rock-festival.svg'),
    path.resolve(__dirname, '../assets/sample-ticket.svg'),
    path.resolve(__dirname, '../assets/tickets/examples/ticket-tech-conference.svg')
  ];

  let imagePath: string | null = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      imagePath = testPath;
      console.log(`${colors.green}✓${colors.reset} Found: ${path.basename(testPath)}\n`);
      break;
    }
  }

  if (!imagePath) {
    console.log(`${colors.red}✗${colors.reset} No test images found\n`);
    testsFailed++;
    process.exit(1);
  }
  testsPassed++;

  console.log(`${colors.blue}[Test 3/5]${colors.reset} Uploading complete ticket to Pinata...\n`);

  const ticketData = {
    eventName: "Rock in Rio 2025",
    description: "Ingresso NFT para o maior festival de rock do mundo",
    eventId: "RIR2025",
    seat: "Pista Premium - A42",
    section: "Pista Premium",
    date: new Date("2025-09-15T20:00:00Z").toISOString(),
    venue: "Cidade do Rock, Rio de Janeiro",
    category: "Premium",
    imageUrl: "ipfs://placeholder"
  };

  const metadata = generateMetadata(ticketData);

  let uploadResult;
  try {
    uploadResult = await uploadTicketToIPFS(imagePath, metadata, 'test-ticket');
    console.log(`${colors.green}✓${colors.reset} Upload completed successfully!\n`);
    testsPassed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Upload failed: ${error instanceof Error ? error.message : 'Unknown'}\n`);
    testsFailed++;
    process.exit(1);
  }

  console.log(`${colors.blue}[Test 4/5]${colors.reset} Verifying image gateway access...`);
  console.log(`   Testing: ${uploadResult.imageGatewayURL}`);
  const imageAccessible = await validateGatewayAccess(uploadResult.imageGatewayURL, 'image');
  if (imageAccessible) {
    testsPassed++;
  } else {
    testsFailed++;
  }
  console.log('');

  console.log(`${colors.blue}[Test 5/5]${colors.reset} Verifying metadata gateway access and content...`);
  console.log(`   Testing: ${uploadResult.metadataGatewayURL}`);
  const metadataValid = await validateMetadataContent(uploadResult.metadataGatewayURL);
  if (metadataValid) {
    testsPassed++;
  } else {
    testsFailed++;
  }
  console.log('');

  console.log(`${colors.magenta}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                    Test Summary                       ║${colors.reset}`);
  console.log(`${colors.magenta}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`Total tests: 5`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}✅ ALL TESTS PASSED!${colors.reset}\n`);
    console.log(`${colors.blue}📋 Use this tokenURI in your smart contract:${colors.reset}`);
    console.log(`${colors.yellow}${uploadResult.tokenURI}${colors.reset}\n`);
    console.log(`${colors.blue}🌐 View metadata:${colors.reset} ${uploadResult.metadataGatewayURL}`);
    console.log(`${colors.blue}🖼️  View image:${colors.reset} ${uploadResult.imageGatewayURL}\n`);
  } else {
    console.log(`${colors.red}❌ SOME TESTS FAILED${colors.reset}\n`);
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
