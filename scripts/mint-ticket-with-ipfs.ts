import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { uploadTicketToIPFS } from '../utils/pinata';
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

const CONTRACT_ABI = [
  'function mintTicket(address recipient, uint256 eventId, string memory seat, string memory sector, uint256 eventDate, string memory tokenURI) public returns (uint256)',
  'function getCompleteTicketInfo(uint256 tokenId) public view returns (tuple(uint256 eventId, string seat, string sector, uint256 eventDate, bool checkedIn) ticket, string uri, address owner)',
  'event TicketMinted(uint256 indexed tokenId, address indexed owner, uint256 indexed eventId, string seat, uint256 eventDate)'
];

function getContractAddress(): string {
  const deploymentsPath = path.join(__dirname, '../deployments/amoy-latest.json');

  if (!fs.existsSync(deploymentsPath)) {
    throw new Error(
      'Contract deployment not found. Please deploy the contract first:\n' +
      'npm run deploy:amoy'
    );
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentsPath, 'utf-8'));
  return deployment.address;
}

async function getContract() {
  const rpcUrl = process.env.POLYGON_AMOY_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error('POLYGON_AMOY_RPC_URL and PRIVATE_KEY must be set in .env');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contractAddress = getContractAddress();

  console.log(`${colors.blue}🔗 Connecting to contract...${colors.reset}`);
  console.log(`   Address: ${contractAddress}`);
  console.log(`   Network: Polygon Amoy Testnet`);
  console.log(`   Wallet: ${wallet.address}\n`);

  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);

  return { contract, wallet, provider };
}

async function estimateMintGas(
  contract: ethers.Contract,
  recipient: string,
  eventId: number,
  seat: string,
  sector: string,
  eventDate: number,
  tokenURI: string
): Promise<bigint> {
  try {
    const gasEstimate = await contract.mintTicket.estimateGas(
      recipient,
      eventId,
      seat,
      sector,
      eventDate,
      tokenURI
    );

    return (gasEstimate * 120n) / 100n;
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Could not estimate gas, using default${colors.reset}`);
    return 500000n;
  }
}

function parseTokenIdFromReceipt(receipt: ethers.TransactionReceipt): number {
  const eventSignature = 'TicketMinted(uint256,address,uint256,string,uint256)';
  const eventTopic = ethers.id(eventSignature);

  const log = receipt.logs.find(log => log.topics[0] === eventTopic);

  if (!log) {
    throw new Error('TicketMinted event not found in transaction receipt');
  }

  const tokenId = ethers.toBigInt(log.topics[1]);
  return Number(tokenId);
}

async function mintTicketWithIPFS(
  recipientAddress: string,
  ticketData: {
    eventName: string;
    description: string;
    eventId: number;
    seat: string;
    section: string;
    date: number;
    ticketNumber?: number;
    category?: string;
    venue?: string;
  },
  imagePath: string
) {
  console.log(`${colors.magenta}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║        Mint NFT Ticket with IPFS Integration         ║${colors.reset}`);
  console.log(`${colors.magenta}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    console.log(`${colors.blue}📤 Step 1/3: Uploading to IPFS...${colors.reset}\n`);

    const ipfsResult = await uploadTicketToIPFS(imagePath, ticketData);

    console.log(`${colors.green}✓ Upload complete!${colors.reset}`);
    console.log(`   Token URI: ${ipfsResult.tokenURI}\n`);

    console.log(`${colors.blue}⛓️  Step 2/3: Connecting to blockchain...${colors.reset}\n`);

    const { contract, wallet, provider } = await getContract();

    const balance = await provider.getBalance(wallet.address);
    const balanceInMatic = ethers.formatEther(balance);

    console.log(`${colors.green}✓ Connected!${colors.reset}`);
    console.log(`   Wallet balance: ${balanceInMatic} MATIC\n`);

    if (parseFloat(balanceInMatic) < 0.01) {
      console.log(`${colors.yellow}⚠️  Warning: Low balance. You may need more MATIC for gas.${colors.reset}\n`);
    }

    console.log(`${colors.blue}⛏️  Step 3/3: Minting NFT...${colors.reset}\n`);

    const gasLimit = await estimateMintGas(
      contract,
      recipientAddress,
      ticketData.eventId,
      ticketData.seat,
      ticketData.section,
      ticketData.date,
      ipfsResult.tokenURI
    );

    console.log(`   Gas limit: ${gasLimit.toString()}`);

    const tx = await contract.mintTicket(
      recipientAddress,
      ticketData.eventId,
      ticketData.seat,
      ticketData.section,
      ticketData.date,
      ipfsResult.tokenURI,
      { gasLimit }
    );

    console.log(`\n${colors.blue}📝 Transaction submitted!${colors.reset}`);
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Waiting for confirmation...\n`);

    const receipt = await tx.wait();

    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction failed');
    }

    const tokenId = parseTokenIdFromReceipt(receipt);

    console.log(`${colors.green}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║              ✓ Ticket Minted Successfully!            ║${colors.reset}`);
    console.log(`${colors.green}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.blue}🎫 NFT Details:${colors.reset}`);
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   Owner: ${recipientAddress}`);
    console.log(`   Event: ${ticketData.eventName}`);
    console.log(`   Seat: ${ticketData.seat}`);
    console.log(`   Section: ${ticketData.section}\n`);

    console.log(`${colors.blue}📦 IPFS Data:${colors.reset}`);
    console.log(`   Metadata CID: ${ipfsResult.metadataCID}`);
    console.log(`   Image CID: ${ipfsResult.imageCID}\n`);

    console.log(`${colors.blue}⛓️  Blockchain:${colors.reset}`);
    console.log(`   Transaction: ${tx.hash}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}\n`);

    console.log(`${colors.blue}🔗 Quick Links:${colors.reset}`);
    console.log(`   PolygonScan: https://amoy.polygonscan.com/tx/${tx.hash}`);
    console.log(`   Metadata: ${ipfsResult.metadataGatewayURL}`);
    console.log(`   Image: ${ipfsResult.imageGatewayURL}\n`);

    return {
      tokenId,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      ipfsResult
    };
  } catch (error: any) {
    console.error(`\n${colors.red}❌ Error during minting process:${colors.reset}`);

    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error(`${colors.red}Insufficient funds for gas.${colors.reset}`);
      console.error(`${colors.yellow}→ Add more MATIC to your wallet: ${error.transaction?.from}${colors.reset}\n`);
    } else if (error.code === 'CALL_EXCEPTION') {
      console.error(`${colors.red}Contract call reverted.${colors.reset}`);
      console.error(`${colors.yellow}→ Possible reasons:${colors.reset}`);
      console.error(`   - Event date must be in the future`);
      console.error(`   - You might not be the contract owner`);
      console.error(`   - Invalid parameters\n`);
    } else if (error.name === 'IPFSUploadError') {
      console.error(`${colors.red}IPFS upload failed.${colors.reset}`);
      console.error(`${colors.yellow}→ Metadata was not created. No blockchain transaction was sent.${colors.reset}\n`);
    } else {
      console.error(error.message || error);
      console.error();
    }

    throw error;
  }
}

const EXAMPLE_TICKET = {
  eventName: 'Rock Festival 2025',
  description: 'VIP Access - Front Row',
  eventId: 1,
  seat: 'A-42',
  section: 'VIP',
  date: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60),
  category: 'VIP',
  venue: 'Estádio Nacional'
};

const EXAMPLE_IMAGE = path.join(__dirname, '../assets/tickets/examples/ticket-rock-festival.svg');

const recipientAddress = process.argv[2] || process.env.PRIVATE_KEY
  ? new ethers.Wallet(process.env.PRIVATE_KEY).address
  : '';

if (!recipientAddress) {
  console.error(`${colors.red}Error: No recipient address provided${colors.reset}`);
  console.log(`\nUsage: npm run mint:ipfs <recipient_address>`);
  console.log(`Example: npm run mint:ipfs 0x1234567890123456789012345678901234567890\n`);
  process.exit(1);
}

mintTicketWithIPFS(recipientAddress, EXAMPLE_TICKET, EXAMPLE_IMAGE)
  .then(() => {
    console.log(`${colors.green}Process completed successfully!${colors.reset}\n`);
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
