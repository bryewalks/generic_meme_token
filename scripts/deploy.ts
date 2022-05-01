import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("Token");
  const genericMemeToken = await Token.deploy("Hello, Hardhat!");

  await genericMemeToken.deployed();

  console.log("Generic Meme deployed to:", genericMemeToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
