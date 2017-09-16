pragma solidity ^0.4.4;
import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract FanCoin is MintableToken {
  string public name = 'FanCoin';
  string public symbol = 'FAN';
  uint public decimals = 0;
  uint public INITIAL_SUPPLY = 1000;

  uint64 numPosts;

  struct Profile {
    string name;
    string description;
  }

  struct Post {
    uint64 id;
    address owner;
    uint cost;
    string content;
  }

  mapping (uint64 => Post) allPosts;
  mapping (address => uint64[]) ownedPosts;
  mapping (address => uint64[]) supportedPosts;
  mapping (address => address[]) fans;
  mapping (address => address[]) supporting;
  mapping (address => Profile) profiles;

  function FanCoin() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

  function updateProfile(string _name, string _description) returns (address) {
    require(bytes(_name).length <= 128 && bytes(_description).length <= 4096);

    profiles[msg.sender] = Profile(_name, _description);

    return msg.sender;
  }
}
