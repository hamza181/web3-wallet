const { ethers } = require("ethers");
const { PROVIDER_URL } = require("../constants");

async function walletInfo(address) {
  try {
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const balance = await provider.getBalance(address);
    const ethBalance = ethers.formatEther(balance);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    let transactionCount = await provider.getTransactionCount(address);
    let blockNumber = await provider.getBlockNumber();
    return { balance, ethBalance, blockNumber, transactionCount };
  } catch (error) {
    console.log(error);
  }
}

const createWallet = async () => {
  try {
    const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
    console.log(`Mnemonic: ${mnemonic}`);

    const derivationPath = "m/44'/60'/0'/0/0";
    const wallet = ethers.Wallet.fromPhrase(mnemonic, derivationPath);

    const privateKey = wallet.privateKey;
    console.log("Private Key:", privateKey);

    const publicKey = wallet.address;
    console.log("Public Key (Address):", publicKey);

    return { publicKey, privateKey, mnemonic };

    // Encrypt the wallet with a password
    const password = "Hello123"; // Replace with your password
    wallet
      .encrypt(password)
      .then((encryptedJson) => {
        console.log(`Encrypted JSON: ${encryptedJson}`);
      })
      .catch((error) => {
        console.error(`Error encrypting wallet: ${error}`);
      });
  } catch (error) {
    console.log(error);
  }
};

const importWallet = async (mnemonic, password) => {
  try {
    // Validate the mnemonic
    if (!ethers.Mnemonic.isValidMnemonic) {
      throw new Error('Invalid mnemonic');
    }

    // Create a wallet instance from the mnemonic
    const wallet = ethers.Wallet.fromPhrase(mnemonic);

    // // Store the password and mnemonic securely
    // await Keychain.setGenericPassword(mnemonic, password);

    // console.log('Wallet imported and credentials stored successfully');
    return wallet;
  } catch (error) {
    console.error('Error importing wallet:', error);
  }
};

module.exports = {
  walletInfo,
  createWallet,
  importWallet,
};
