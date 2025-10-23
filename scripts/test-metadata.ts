import {
  generateMetadata,
  generateAttributes,
  validateMetadata,
  metadataToJSON,
  parseMetadata,
  TicketData
} from "../utils/metadata";

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  testsRun++;
  if (condition) {
    testsPassed++;
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  } else {
    testsFailed++;
    console.log(`${colors.red}✗${colors.reset} ${message}`);
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
}

function assertExists(value: any, message: string) {
  assert(value !== undefined && value !== null, message);
}

console.log(`${colors.blue}=== Testing Metadata Generator ===${colors.reset}\n`);

console.log("Test 1: Generate basic metadata");
const ticketData1: TicketData = {
  eventName: "Rock Festival 2025",
  description: "Ingresso para Rock Festival 2025",
  eventId: "RF2025",
  seat: "A-42",
  section: "Pista Premium",
  date: Math.floor(new Date("2025-12-31").getTime() / 1000)
};

const metadata1 = generateMetadata(ticketData1, "ipfs://QmTest123");
assertExists(metadata1, "Metadata should be generated");
assertExists(metadata1.name, "Name should exist");
assertExists(metadata1.description, "Description should exist");
assertEqual(metadata1.image, "ipfs://QmTest123", "Image URL should match");
assert(Array.isArray(metadata1.attributes), "Attributes should be an array");
assert(metadata1.attributes.length > 0, "Should have attributes");

console.log("\nTest 2: Generate metadata with all optional fields");
const ticketData2: TicketData = {
  eventName: "Tech Conference",
  description: "Conferência de Tecnologia 2026",
  eventId: "TC2026",
  seat: "B-10",
  section: "VIP",
  date: Math.floor(new Date("2026-06-15").getTime() / 1000),
  ticketNumber: 999,
  category: "Premium",
  venue: "Centro de Convenções",
  status: "Válido",
  externalUrl: "https://techconf.com"
};

const metadata2 = generateMetadata(ticketData2, "ipfs://QmComplete");
assert(metadata2.attributes.length > 0, "Should have attributes with optional fields");
assertEqual(metadata2.external_url, "https://techconf.com", "External URL should be included");

console.log("\nTest 3: Generate attributes");
const attributes = generateAttributes(ticketData1);
assert(Array.isArray(attributes), "Attributes should be an array");
const eventAttr = attributes.find(a => a.trait_type === "Evento");
assertExists(eventAttr, "Event attribute should exist");
assertEqual(eventAttr?.value, "Rock Festival 2025", "Event name should match");

console.log("\nTest 4: Validate correct metadata");
const validationResult1 = validateMetadata(metadata1);
assertEqual(validationResult1.valid, true, "Valid metadata should pass validation");
assertEqual(validationResult1.errors.length, 0, "Should have no errors");

console.log("\nTest 5: Validate metadata missing required field");
const invalidMetadata = {
  name: "Test",
  attributes: []
};
const validationResult2 = validateMetadata(invalidMetadata);
assertEqual(validationResult2.valid, false, "Invalid metadata should fail validation");
assert(validationResult2.errors.length > 0, "Should have validation errors");

console.log("\nTest 6: JSON conversion");
const jsonString = metadataToJSON(metadata1, true);
assert(jsonString.length > 0, "JSON string should not be empty");
assert(jsonString.includes('"name"'), "JSON should include name field");
assert(jsonString.includes('"attributes"'), "JSON should include attributes field");

console.log("\nTest 7: JSON parsing");
const parsedMetadata = parseMetadata(jsonString);
assertEqual(parsedMetadata.name, metadata1.name, "Parsed name should match original");
assertEqual(parsedMetadata.image, metadata1.image, "Parsed image should match original");

console.log("\nTest 8: Validate image URLs");
const metadataIPFS = { ...metadata1, image: "ipfs://QmValid" };
const validationIPFS = validateMetadata(metadataIPFS);
assertEqual(validationIPFS.valid, true, "IPFS URL should be valid");

const metadataHTTPS = { ...metadata1, image: "https://example.com/image.png" };
const validationHTTPS = validateMetadata(metadataHTTPS);
assertEqual(validationHTTPS.valid, true, "HTTPS URL should be valid");

const metadataHTTP = { ...metadata1, image: "http://example.com/image.png" };
const validationHTTP = validateMetadata(metadataHTTP);
assertEqual(validationHTTP.valid, true, "HTTP URL should be valid (with warning)");
assert(validationHTTP.warnings.length > 0, "HTTP should have warnings");

console.log("\nTest 9: Validate attributes structure");
const dateAttr = metadata1.attributes.find(a => a.trait_type === "Data");
assertExists(dateAttr, "Date attribute should exist");
assertEqual(dateAttr?.display_type, "date", "Date should have display_type");

console.log("\nTest 10: Error handling for missing required fields");
try {
  const invalidData = {
    eventName: "Test",
    seat: "A-1",
  } as TicketData;
  generateMetadata(invalidData, "ipfs://test");
  assert(false, "Should throw error for missing required fields");
} catch (error) {
  assert(true, "Should throw error for missing required fields");
}

console.log(`\n${colors.blue}=== Test Summary ===${colors.reset}`);
console.log(`Total tests run: ${testsRun}`);
console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);

if (testsFailed === 0) {
  console.log(`\n${colors.green}All tests passed! ✓${colors.reset}`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}Some tests failed! ✗${colors.reset}`);
  process.exit(1);
}
