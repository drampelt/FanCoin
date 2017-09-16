var FanCoin = artifacts.require("./FanCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(FanCoin);
};
