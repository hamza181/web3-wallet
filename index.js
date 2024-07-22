const { ethers } = require("ethers");
const walletFn = require("./Functions");
const axios = require("axios");

// Sepolia testnet URL
const sepoliaProviderUrl = "https://sepolia.blast.io/"; // Replace <your-blast-api-key> with your actual Blast API key

// Connect to the Sepolia testnet
const provider = new ethers.JsonRpcProvider(sepoliaProviderUrl);
// const provider = new ethers.getDefaultProvider(sepoliaProviderUrl);

// ERC-20 Token ABI
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

// Etherscan API key
const etherscanApiKey = "S8J92TVKPAGSA21MA48HCGGQRNTU3GH5BN";
const blastscanApiKey = "8752KV6Y65KFMBNXZUGKZY7FA6R6X9FN6T";

// Function to create a new wallet
async function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  console.log("New Wallet Address:", wallet.address);
  console.log("Mnemonic:", wallet.mnemonic.phrase);
  console.log("Private Key:", wallet.privateKey);
  return wallet;
}

// Function to import a wallet using a mnemonic
async function importWallet(mnemonic) {
  const wallet = ethers.Wallet.fromPhrase(mnemonic, provider);
  console.log("Imported Wallet Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  return wallet;
}

// Function to show wallet info including balance
async function showWalletInfo(wallet) {
  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet Address:", wallet.address);
  console.log("Wallet Balance:", ethers.formatEther(balance), "ETH");
}

// Function to add tokens to a wallet by transferring from another address
async function addTokens(wallet, tokenAddress, recipientAddress, amount) {
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
  const decimals = await tokenContract.decimals();
  const amountInWei = ethers.parseUnits(amount.toString(), decimals);
  const tx = await tokenContract.transfer(recipientAddress, amountInWei);
  await tx.wait();
  console.log(`Transferred ${amount} tokens to ${recipientAddress}`);
}

// Function to get token balance in a wallet
async function getTokenBalance(wallet, tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const balance = await tokenContract.balanceOf(wallet.address);
  const decimals = await tokenContract.decimals();
  const balanceInTokens = ethers.formatUnits(balance, decimals);
  console.log(`Token Balance: ${balanceInTokens} tokens`);
  return balanceInTokens;
}

// Function to get transaction history
async function getTransactionHistory(walletAddress) {
  // for etherscan
  // const apiUrl = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`;
  // for blastscan
  const apiUrl = `https://api-sepolia.blastscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${blastscanApiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const transactions = response.data.result;

    if (transactions.length === 0) {
      console.log("No transactions found for this address.");
      return;
    }

    transactions.forEach((tx, index) => {
      console.log(`Transaction ${index + 1}:`);
      console.log(`  Block Number: ${tx.blockNumber}`);
      console.log(
        `  TimeStamp: ${new Date(tx.timeStamp * 1000).toLocaleString()}`
      );
      console.log(`  From: ${tx.from}`);
      console.log(`  To: ${tx.to}`);
      console.log(`  Value: ${ethers.formatEther(tx.value)} ETH`);
      console.log(`  Gas Used: ${tx.gasUsed}`);
      console.log(`  Confirmations: ${tx.confirmations}`);
      console.log("-----------------------");
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
  }
}

// Function to get transaction history
async function getTokenTransferEventsApi(tokenAddress, walletAddress) {
  const apiUrl = `https://api-sepolia.blastscan.io/api?module=account&action=tokentx&contractaddress=${tokenAddress}&address=${walletAddress}&page=1&offset=2&startblock=0&endblock=27025780&sort=asc&apikey=${blastscanApiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const transactions = response.data.result;
    if (transactions.length === 0) {
      console.log("No transactions found for this address.");
      return;
    }

    transactions.forEach((tx, index) => {
      console.log(`Transaction ${index + 1}:`);
      console.log(`  Block Number: ${tx.blockNumber}`);
      console.log(
        `  TimeStamp: ${new Date(tx.timeStamp * 1000).toLocaleString()}`
      );
      console.log(`  From: ${tx.from}`);
      console.log(`  To: ${tx.to}`);
      console.log(`  Value: ${ethers.formatEther(tx.value)} ETH`);
      console.log(`  Gas Used: ${tx.gasUsed}`);
      console.log(`  Confirmations: ${tx.confirmations}`);
      console.log("-----------------------");
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
  }
}

// Function to get ERC20 token transfer events
async function getTokenTransferEvents(tokenAddress, walletAddress) {
  // ERC-20 Token ABI
  const erc20Abi = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ];

  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

  const filter = {
    address: tokenAddress,
    topics: [
      ethers.id("Transfer(address,address,uint256)"),
      ethers.zeroPadValue(walletAddress, 32),
    ],
  };

  const logs = await provider.getLogs(filter);
  const transferEvents = logs.map((log) =>
    tokenContract.interface.parseLog(log)
  );

  if (transferEvents.length === 0) {
    console.log("No transfer events found for this address.");
    return;
  }

  transferEvents.forEach((event, index) => {
    console.log(`Transfer Event ${index + 1}:`);
    console.log(`  From: ${event.args.from}`);
    console.log(`  To: ${event.args.to}`);
    console.log(
      `  Value: ${ethers.utils.formatUnits(event.args.value, 18)} tokens`
    );
    console.log("-----------------------");
  });
}

async function main() {
  // Create a new wallet
  // const newWallet = await createWallet();

  // Show info of the new wallet
  // await showWalletInfo(newWallet);

  // Import a wallet using the mnemonic of the newly created wallet
  // const importedWallet = await importWallet(newWallet.mnemonic.phrase);
  const mnemonic =
    "swing void stable wrong strong pave fringe wonder appear jacket popular bacon";
  const importedWallet = await importWallet(mnemonic);

  // Show info of the imported wallet
  // await showWalletInfo(importedWallet);

  // Example token address (replace with an actual token address on Sepolia)
  const tokenAddress = "0x4200000000000000000000000000000000000022"; // Replace with an actual token contract address
  const recipientAddress = "0xF86180A0111A80007b8b07A7f800764132474922"; // Replace with recipient address
  const amount = 2; // Amount of tokens to transfer

  // Add tokens to the wallet by transferring from another address
  //   await addTokens(importedWallet, tokenAddress, recipientAddress, amount);

  // Get token balance in the wallet
  //   await getTokenBalance(importedWallet, tokenAddress);

  // Get the transaction history for the wallet
  // await getTransactionHistory(importedWallet.address);

  // Get the ERC20 token transfer events for the wallet
  await getTokenTransferEventsApi(tokenAddress, importedWallet.address);
}

main().catch(console.error);