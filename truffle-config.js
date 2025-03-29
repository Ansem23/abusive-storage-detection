let localConfig = {};
try {
  localConfig = require("./truffle-config.local");
} catch (err) {
  console.log("No local config found, using default settings.");
}

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: localConfig.port || 7545, // Default: 7545
      network_id: localConfig.network_id || "*", // Default: any network
    }
  }
};
