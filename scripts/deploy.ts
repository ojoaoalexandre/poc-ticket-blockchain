import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { ethers } from "ethers";
import "dotenv/config";

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const EventTicketArtifact = require("../artifacts/contracts/EventTicket.sol/EventTicket.json");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const networkArg = process.argv.find(arg => arg.includes('--network'));
  const networkName = networkArg ? networkArg.split('=')[1] || process.argv[process.argv.indexOf(networkArg) + 1] : "localhost";
  
  let rpcUrl: string;
  if (networkName === "hardhat" || networkName === "localhost") {
    rpcUrl = "http://127.0.0.1:8545";
  } else if (networkName === "amoy") {
    rpcUrl = process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
  } else {
    rpcUrl = process.env.POLYGON_AMOY_RPC_URL || "http://localhost:8545";
  }
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  const chainId = network.chainId;
  
  console.log("\n🚀 Starting deployment...");
  console.log("📍 Network:", networkName);
  console.log("🔗 Chain ID:", chainId);
  
  let deployer;
  let deployerAddress: string;
  
  if (process.env.PRIVATE_KEY) {
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    deployerAddress = deployer.address;
  } else {
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts available");
    }
    deployerAddress = accounts[0].address;
    deployer = await provider.getSigner(deployerAddress);
  }
  
  const balance = await provider.getBalance(deployerAddress);
  
  console.log("👤 Deployer:", deployerAddress);
  console.log("💰 Balance:", ethers.formatEther(balance), "POL");
  
  if (balance === 0n) {
    throw new Error("❌ Deployer has no POL! Get test POL from: https://faucet.polygon.technology/");
  }

  console.log("\n📝 Deploying EventTicket contract...");
  
  const EventTicketFactory = new ethers.ContractFactory(
    EventTicketArtifact.abi,
    EventTicketArtifact.bytecode,
    deployer
  );
  const eventTicket = await EventTicketFactory.deploy();
  
  console.log("⏳ Waiting for deployment transaction...");
  
  await eventTicket.waitForDeployment();
  
  const contractAddress = await eventTicket.getAddress();
  
  console.log("✅ EventTicket deployed to:", contractAddress);
  console.log("🔍 View on Polygonscan:", `https://amoy.polygonscan.com/address/${contractAddress}`);

  console.log("\n📋 Verifying contract details...");
  const name = await eventTicket.name();
  const symbol = await eventTicket.symbol();
  const owner = await eventTicket.owner();
  
  console.log("📛 Name:", name);
  console.log("🏷️  Symbol:", symbol);
  console.log("👑 Owner:", owner);

  console.log("\n💾 Saving deployment information...");
  
  const deploymentTransaction = eventTicket.deploymentTransaction();
  
  const deploymentInfo = {
    network: networkName,
    chainId: Number(chainId),
    contract: "EventTicket",
    address: contractAddress,
    deployer: deployerAddress,
    deployedAt: new Date().toISOString(),
    transactionHash: deploymentTransaction?.hash,
    blockNumber: await provider.getBlockNumber(),
    gasPrice: (await provider.getFeeData()).gasPrice?.toString(),
    compiler: {
      version: "0.8.20",
      optimizer: true,
      runs: 200
    },
    contractDetails: {
      name: name,
      symbol: symbol,
      owner: owner
    }
  };
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  
  let allDeployments: Record<string, any> = {};
  if (fs.existsSync(deploymentFile)) {
    allDeployments = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  }
  
  allDeployments.EventTicket = deploymentInfo;
  
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(allDeployments, null, 2)
  );
  
  console.log("✅ Deployment info saved to:", deploymentFile);

  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("\n🔎 Verifying contract on Polygonscan...");
    console.log("⏳ Waiting 30 seconds for Polygonscan to index the contract...");
    
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log("ℹ️  Skipping automatic verification.");
    console.log("💡 To verify contract on Polygonscan, run:");
    console.log(`   npx hardhat verify --network amoy ${contractAddress}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("📍 Network:", networkName);
  console.log("📄 Contract:", contractAddress);
  console.log("🔍 Explorer:", `https://amoy.polygonscan.com/address/${contractAddress}`);
  console.log("💾 Details saved to:", deploymentFile);
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });

