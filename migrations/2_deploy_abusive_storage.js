const StockageLait = artifacts.require("StockageLait");

module.exports = function (deployer) {
  deployer.deploy(StockageLait);
};
