import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  console.log("\n🔍 TESTANDO CONEXÃO RPC COM POLYGON AMOY\n");
  console.log("=".repeat(60));

  try {
    const rpcUrl = process.env.ALCHEMY_API_KEY
      ? `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const maskedUrl = process.env.ALCHEMY_API_KEY
      ? `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY.substring(0, 10)}...`
      : rpcUrl;

    console.log("\n📡 Provider RPC:");
    console.log(`   ${process.env.ALCHEMY_API_KEY ? '✅ Alchemy' : '⚠️  RPC Público'}`);
    console.log(`   URL: ${maskedUrl}`);

    console.log("\n🌐 Informações da Rede:");
    const network = await provider.getNetwork();
    console.log(`   Nome: ${network.name}`);
    console.log(`   Chain ID: ${network.chainId}`);

    if (Number(network.chainId) !== 80002) {
      console.log("   ⚠️  AVISO: Chain ID esperado é 80002 (Polygon Amoy)");
    } else {
      console.log("   ✅ Chain ID correto (Polygon Amoy)");
    }

    console.log("\n⛓️  Conectividade:");
    const blockNumber = await provider.getBlockNumber();
    console.log(`   Último bloco: #${blockNumber}`);
    console.log("   ✅ Conexão estabelecida com sucesso!");

    const block = await provider.getBlock(blockNumber);
    if (block) {
      const blockDate = new Date(block.timestamp * 1000);
      console.log(`   Timestamp do bloco: ${blockDate.toISOString()}`);
      console.log(`   Transações no bloco: ${block.transactions.length}`);
    }

    if (process.env.PRIVATE_KEY) {
      console.log("\n👤 Informações do Deployer:");

      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const address = await wallet.getAddress();
      const balance = await provider.getBalance(address);
      const balancePOL = ethers.formatEther(balance);

      console.log(`   Endereço: ${address}`);
      console.log(`   Saldo: ${balancePOL} POL`);

      if (parseFloat(balancePOL) < 0.01) {
        console.log("   ⚠️  AVISO: Saldo baixo! Obtenha POL de teste em:");
        console.log("   https://faucet.polygon.technology/");
      } else {
        console.log("   ✅ Saldo suficiente para testes");
      }
    } else {
      console.log("\n⚠️  PRIVATE_KEY não configurada no .env");
      console.log("   Configure para ver informações do deployer");
    }

    console.log("\n⛽ Gas Price:");
    const feeData = await provider.getFeeData();
    if (feeData.gasPrice) {
      const gasPriceGwei = ethers.formatUnits(feeData.gasPrice, "gwei");
      console.log(`   Gas Price atual: ${gasPriceGwei} Gwei`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ TESTE CONCLUÍDO COM SUCESSO!");
    console.log("=".repeat(60) + "\n");

    console.log("📚 Recursos Úteis:");
    console.log("   • Explorer: https://amoy.polygonscan.com/");
    console.log("   • Faucet: https://faucet.polygon.technology/");
    if (!process.env.ALCHEMY_API_KEY) {
      console.log("\n💡 Dica: Configure ALCHEMY_API_KEY para melhor performance!");
      console.log("   Veja instruções em DEPLOY.md");
    }
    console.log("");

  } catch (error: any) {
    console.error("\n❌ ERRO AO CONECTAR COM RPC:");
    console.error(`   ${error.message}\n`);

    console.log("🔧 Possíveis soluções:");
    console.log("   1. Verifique sua conexão com a internet");
    console.log("   2. Confirme que ALCHEMY_API_KEY está correta (se usando Alchemy)");
    console.log("   3. Tente usar o RPC público removendo ALCHEMY_API_KEY do .env");
    console.log("   4. Verifique se o hardhat.config.ts está configurado corretamente\n");

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
