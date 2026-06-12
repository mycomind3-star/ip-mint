import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying IPMint with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const IPMint = await ethers.getContractFactory("IPMint");
  const ipMint = await IPMint.deploy();
  await ipMint.waitForDeployment();

  const address = await ipMint.getAddress();
  console.log("✅ IPMint deployed to:", address);
  console.log("Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local with:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
