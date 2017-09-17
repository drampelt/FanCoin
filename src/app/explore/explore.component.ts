import { Component, OnInit, HostListener, NgZone } from '@angular/core';
const Web3 = require('web3');
const contract = require('truffle-contract');
const fancoinArtifacts = require('../../../build/contracts/FanCoin.json');

declare var window: any;

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {
  FanCoin = contract(fancoinArtifacts);

  // TODO add proper types these variables
  account: any;
  accounts: any;
  web3: any;
  profiles: any;

  balance: number;
  sendingAmount: number;
  recipientAddress: string;
  status: string;

  constructor(private _ngZone: NgZone) {

  }

  ngOnInit() {
  }

  @HostListener('window:load')
  windowLoaded() {
    this.checkAndInstantiateWeb3();
    this.onReady();
  }

  checkAndInstantiateWeb3 = () => {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.warn(
          'Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask'
        );
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.warn(
          'No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
          );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
          new Web3.providers.HttpProvider('http://localhost:8545')
          );
    }
  };

  onReady = () => {
    // Bootstrap the MetaCoin abstraction for Use.
    this.FanCoin.setProvider(this.web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        alert(
            'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.'
            );
        return;
      }
      this.accounts = accs;
      this.account = this.accounts[0];

      // This is run from window:load and ZoneJS is not aware of it we
      // need to use _ngZone.run() so that the UI updates on promise resolution
      this._ngZone.run(() =>
          // alert('hi')
          // console.log('do stuff', accs)
          this.loadUserList()
      );
    });
  };

  loadUserList = () => {
    let fan;
    this.FanCoin
      .deployed()
      .then(instance => {
        fan = instance;
        return fan.getPublishedProfiles.call({
          from: this.account
        });
      })
    .then(value => {
      return Promise.all(value.map((address) => this.loadProfile(address)));
    })
    .then(profiles => {
      this.profiles = profiles;
    })
    .catch(e => {
      console.log(e);
      // this.setStatus('Error getting balance; see log.');
    });
  };

  loadProfile = (address) => {
    let fan;
    return this.FanCoin
      .deployed()
      .then(instance => {
        fan = instance;
        return fan.getProfile.call(address, {
          from: this.account
        });
      })
    .then(profile => {
      return { address, name: profile[0], description: profile[1], cost: profile[2].toNumber(), numFans: profile[3].toNumber() };
    })
    .catch(e => {
      console.log(e);
      // this.setStatus('Error getting balance; see log.');
    });
  };

}
