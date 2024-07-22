const { ethers } = require("ethers");
const { PROVIDER_URL } = require("../constants");
const Keychain = require('react-native-keychain');
const CryptoJS = require('crypto-js');

const SECRET_KEY = 'your-secret-key'; // Use a secure key in a real application

const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

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
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic.phrase;
    console.log(`Mnemonic: ${mnemonic}`);

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
    if (!ethers.utils.isValidMnemonicPhrase(mnemonic)) {
      throw new Error('Invalid mnemonic');
    }

    // Create a wallet instance from the mnemonic
    const wallet = ethers.Wallet.fromPhrase(mnemonic);

    // Store the encrypted password and mnemonic securely
    const encryptedPassword = encrypt(password);
    await Keychain.setGenericPassword(mnemonic, encryptedPassword);

    console.log('Wallet imported and credentials stored successfully');
    return wallet;
  } catch (error) {
    console.error('Error importing wallet:', error);
  }
};

const getWallet = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      const { username: mnemonic, password: encryptedPassword } = credentials;
      const decryptedPassword = decrypt(encryptedPassword);

      const wallet = ethers.Wallet.fromPhrase(mnemonic);

      console.log('Wallet retrieved successfully:', wallet.address);
      return wallet;
    } else {
      console.log('No credentials stored');
    }
  } catch (error) {
    console.error('Error retrieving wallet:', error);
  }
};

const deleteCredentials = async () => {
  try {
    await Keychain.resetGenericPassword();
    console.log('Credentials deleted successfully');
  } catch (error) {
    console.error('Error deleting credentials:', error);
  }
};

module.exports = {
  walletInfo,
  createWallet,
  importWallet,
  getWallet,
  deleteCredentials,
};
