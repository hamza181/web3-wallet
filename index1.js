const express = require("express");
const CryptoJS = require("crypto-js");
// var AES = require("crypto-js/aes");
const { ethers } = require("ethers");
const walletFn = require("./Functions");
// import * as Keychain from "react-native-keychain";
// const Keychain = require("react-native-keychain")
const app = express();
const port = 3005;

// async function saveMnemonicToKeychain(encryptedMnemonic) {
//   await Keychain.setGenericPassword("mnemonic", encryptedMnemonic);
//   console.log("Mnemonic saved to Keychain");
// }

// app.get("/", async (req, res) => {
//   let wallet1 = await walletFn.createWallet()
//   let walletInfo1 = await walletFn.walletInfo(wallet1.publicKey)
//   console.log("🚀 ~ app.get ~ walletInfo1:", walletInfo1)

//   let mnemonic = "turkey improve card blur again change raven flat table rose echo exchange"
//   let wallet = await walletFn.importWallet(mnemonic)
//   let walletInfo = await walletFn.walletInfo(wallet.address)
//   console.log("🚀 ~ app.get ~ walletInfo:", walletInfo)

//   res.json({ wallet });
// });

// app.listen(port, () => {
//   console.log(`App listening at http://localhost:${port}`);
// });

// Step 1: Generate a Mnemonic (for demonstration purposes)
// const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
// console.log("Mnemonic:", mnemonic);

// Step 2: Derive Private Key and Public Key with a Derivation Path
const derivationPath = "m/44'/60'/0'/0/0"; // Standard Ethereum derivation path
// const wallet = ethers.Wallet.fromPhrase(mnemonic, derivationPath);
const provider = new ethers.JsonRpcProvider("https://sepolia.blast.io");
// const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/9bab890942c64f3b82818076c3fd4ff4");
const privateKey =
  "6adb09ba81cc5c923a52134c96b5fb500622120a4a6be4589abec9d187ef95bf";
const wallet = new ethers.Wallet(privateKey, provider);
console.log("Private Key:", wallet.privateKey);
console.log("Public Key (Address):", wallet.address);

// Step 3: Get Ethereum Balance

async function getBalance(address) {
  const balance = await provider.getBalance(address);
  console.log("Balance:", ethers.formatEther(balance), "BLAST");
}

getBalance(wallet.address);

// Step 4: Define the ERC-20 Token Contract ABI and Address
// const erc20Abi = [
//   "function transfer(address to, uint amount) returns (bool)",
// ];

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
];

const tokenAddress = "0x4200000000000000000000000000000000000022"; // Replace with your token's contract address
const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, wallet);

async function getBalancesOfErc20Token(address) {
  try {
    // Get native token (ETH) balance
    const ethBalance = await provider.getBalance(address);
    console.log("ETH Balance:", ethers.formatEther(ethBalance), "ETH");

    // Get ERC-20 token balance
    const tokenBalance = await tokenContract.balanceOf(address);
    console.log(
      "Token Balance:",
      ethers.formatUnits(tokenBalance, 18),
      "Tokens"
    );
  } catch (error) {
    console.error("Error fetching balances:", error);
  }
}

getBalancesOfErc20Token(wallet.address);

async function transferTokens(recipientAddress, amountInTokens) {
  try {
    const amount = ethers.parseUnits(amountInTokens, 18);
    const transaction = await tokenContract.transfer(recipientAddress, amount);
    await transaction.wait();
    console.log(`Transferred ${amountInTokens} tokens to ${recipientAddress}`);
    return transaction;
  } catch (error) {
    console.error("Error sending tokens:", error);
    throw error;
  }
}

(async () => {
  const transaction = await transferTokens(
    "0x2516a2Fe15122adad36046d78b354ED63f21B86B",
    "1"
  );
  console.log("🚀 ~ transaction:", transaction);
})();
