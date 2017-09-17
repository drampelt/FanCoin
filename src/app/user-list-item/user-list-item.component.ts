import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
const blockies = require('ethereum-blockies');

@Component({
  selector: 'user-list-item',
  templateUrl: './user-list-item.component.html',
  styleUrls: ['./user-list-item.component.css']
})
export class UserListItemComponent implements OnInit, AfterViewInit {
  @Input() profile: any;
  avatar: string;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // For some reason the first time doesn't always work
    let derp = blockies.create({seed: this.profile.address, size: 8, scale: 6});
    let icon = blockies.create({seed: this.profile.address, size: 8, scale: 6});
    // console.log('derp', this.profile.address, icon.toDataURL());
    let id = `profile-image-${this.profile.address}`
    document.getElementById(id).appendChild(icon);
  }
}
