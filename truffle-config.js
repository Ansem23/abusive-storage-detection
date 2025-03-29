module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost
      port: 7545,            // Port par défaut de Ganache
      network_id: "*",       // N'importe quel network id
    },
  },

  compilers: {
    solc: {
      version: "0.8.17",     // Version Solidity stable
    },
  },
};
