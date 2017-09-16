pragma solidity ^0.4.4;
import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract FanCoin is MintableToken {
  string public name = 'FanCoin';
  string public symbol = 'FAN';
  uint public decimals = 0;
  uint public INITIAL_SUPPLY = 1000;

  uint64 nextPostId = 1;

  struct Profile {
    string username;
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

  function getFans(address _creator) constant returns (address[]) {
    return fans[_creator];
  }

  function getSupporting(address _fan) constant returns (address[]) {
    return supporting[_fan];
  }

  function getPost(uint64 _id) constant returns (uint64 id, address owner, uint cost, string content) {
    require(allPosts[_id].id > 0);
    id = _id;
    owner = allPosts[_id].owner;
    cost = allPosts[_id].cost;
    content = allPosts[_id].content;
  }

  function getOwnedPosts(address _creator) constant returns (uint64[]) {
    return ownedPosts[_creator];
  }

  function getSupportedPosts(address _fan) constant returns (uint64[]) {
    return supportedPosts[_fan];
  }

  function getProfile(address _user) constant returns (string username, string description) {
    username = profiles[_user].username;
    description = profiles[_user].description;
  }

  function updateProfile(string _username, string _description) returns (address) {
    require(bytes(_username).length <= 128 && bytes(_description).length <= 4096);

    profiles[msg.sender] = Profile(_username, _description);

    return msg.sender;
  }

  function isFanOf(address _creator) constant returns (bool) {
    for (uint i = 0; i < supporting[msg.sender].length; i++) {
      if (supporting[msg.sender][i] == _creator) {
        return true;
      }
    }
    return false;
  }

  function becomeFan(address _creator) returns (address) {
    bool found = false;
    for (uint i = 0; i < supporting[msg.sender].length; i++) {
      if (supporting[msg.sender][i] == _creator) {
        found = true;
        break;
      }
    }
    require(!found);

    supporting[msg.sender].push(_creator);
    fans[_creator].push(msg.sender);
    return _creator;
  }

  function stopSupporting(address _creator) returns (address) {
    uint index;
    bool found = false;
    uint256 length = supporting[msg.sender].length;
    for (uint i = 0; i < length; i++) {
      if (supporting[msg.sender][i] == _creator) {
        index = i;
        found = true;
        break;
      }
    }
    require(found && length > 0);
    supporting[msg.sender][index] = supporting[msg.sender][length - 1];
    delete supporting[msg.sender][length - 1];

    found = false;
    length = fans[_creator].length;
    for (i = 0; i < length; i++) {
      if (fans[_creator][i] == msg.sender) {
        index = i;
        found = true;
        break;
      }
    }
    require(found && fans[_creator].length > 0);
    fans[_creator][index] = fans[_creator][length - 1];
    delete fans[_creator][length - 1];

    return _creator;
  }
}
