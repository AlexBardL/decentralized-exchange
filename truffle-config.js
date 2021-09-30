require('dotenv').config()

const HDWalletProvider = require('@truffle/hdwallet-provider')


module.exports = {
   networks: {
      development: {
         host: "127.0.0.1",     // Localhost
         port: 7545,            // Ganache GUI
         network_id: "*",       // Any network
      },

      ropsten: {
         provider: () => new HDWalletProvider({
            privateKeys: process.env.PRIVATE_KEYS.split(','), 
            providerOrUrl: process.env.NODE_URL
          }),
         network_id: 3,       
         gas: 5500000,        
         confirmations: 2,
      }
   },

   contracts_directory: './src/contracts/',
   contracts_build_directory: './src/abis/',

   compilers: {
      solc: {
         version: "0.8.7",
         optimizer: {
            enabled: true,
            runs: 200
         }
      }
   }
}
