import { Component, HostListener, OnInit, NgZone } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
const Web3 = require('web3');
const contract = require('truffle-contract');
const fancoinArtifacts = require('../../../build/contracts/FanCoin.json');

declare var window: any;

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	FanCoin = contract(fancoinArtifacts);

	// TODO add proper types these variables
	account: any;
	accounts: any;
	web3: any;
	address: any;
	name: any;
	description: any;
	cost: any;
	ownProfile: boolean;
	allPosts: any;
	isFanOf: boolean;

	constructor(private route: ActivatedRoute, private _ngZone: NgZone) {
		this.route.params.subscribe( params => {this.address = params["address"]})
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
	}

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
			let profileAddress;
			this._ngZone.run(() => {
				if (!this.address || this.address === this.account) {
					this.ownProfile = true;
				}
				if (!this.address)
					profileAddress = this.account
				else
					profileAddress = this.address

				this.loadProfile(profileAddress)
				this.loadOwnedPosts(profileAddress)
			});

			// This is run from window:load and ZoneJS is not aware of it we
			// need to use _ngZone.run() so that the UI updates on promise resolution
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
			this.name = profile[0];
			this.description = profile[1];
			this.cost = profile[2];
			return { address, name: profile[0], description: profile[1], cost: profile[2].toNumber() };
		})
		.catch(e => {
			console.log(e);
			// this.setStatus('Error getting balance; see log.');
		});
	};

	loadOwnedPosts = (address) => {
		let fan;
		return this.FanCoin
		.deployed()
		.then(instance => {
			fan = instance;
			return fan.getOwnedPosts.call(address, {
				from: this.account
			});
		})
		.then(ownedPosts => {
			Promise.all(ownedPosts.map((id) => this.loadPost(id.toNumber()))).then( allPosts => { 
				this.allPosts = allPosts;
				for (let i = 0; i < allPosts.length; i++){
					allPosts[i][3] = new Date(allPosts[i][3].toNumber() * 1000)
				}
			});
		})
		.catch(e => {
			console.log(e);
		})
	}

	loadPost = (id) => {
		let fan;
		return this.FanCoin
		.deployed()
		.then(instance => {
			fan= instance;
			return fan.getPost.call(id, { from: this.account});
		})
		.then(post => {return post})
		.catch(e => {console.log(e)})
	}

	isFan = () => {
		let fan;
		return this.FanCoin
		.deployed()
		.then(instance => {
			fan= instance;
			return fan.isFanOf.call(this.address, {from: this.account});
		})
		.then(isFanOf => {this.isFanOf = isFanOf; debugger;})
		.catch(e => {console.log(e)})
	}

	becomeFan = (event) => {
		let fan;
		return this.FanCoin
		.deployed()
		.then(instance => {
			fan= instance;
			return fan.becomeFan(this.address, {from: this.account});
		})
		.then()
		.catch(e => {console.log(e)})
	}


};