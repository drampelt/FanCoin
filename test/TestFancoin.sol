pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/FanCoin.sol";

contract TestFanCoin {
  function testInitialBalanceUsingDeployedContract() {
    FanCoin fan = FanCoin(DeployedAddresses.FanCoin());

    uint expected = 1000;

    Assert.equal(fan.balanceOf(tx.origin), expected, "Owner should have 10000 FanCoin initially");
  }

  function testInitialBalanceWithNewFanCoin() {
    FanCoin fan = new FanCoin();

    uint expected = 1000;

    Assert.equal(fan.balanceOf(tx.origin), expected, "Owner should have 10000 FanCoin initially");
  }
}
