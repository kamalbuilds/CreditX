require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    creditcoinTestnet: {
      url: "https://rpc.cc3-testnet.creditcoin.network",
      chainId: 102031,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    uscTestnet: {
      url: "https://rpc.usc-testnet2.creditcoin.network",
      chainId: 102036,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      creditcoinTestnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "creditcoinTestnet",
        chainId: 102031,
        urls: {
          apiURL: "https://creditcoin-testnet.blockscout.com/api",
          browserURL: "https://creditcoin-testnet.blockscout.com",
        },
      },
    ],
  },
};
