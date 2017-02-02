import { Component } from '@angular/core';

import { NavController, AlertController, Events } from 'ionic-angular';

import { AuthService } from '../login/authservice';

import { Login } from '../login/login';

import { User } from '../../models/user';

import { NgZone } from '@angular/core';

@Component({
  selector: 'page-page1',
  templateUrl: 'page1.html'
})
export class Page1 {

  public UserInfo: User;

	constructor(public navCtrl: NavController,
              public authservice: AuthService,
              public alertCtrl: AlertController,
              private events: Events,
              public zone: NgZone) {
		//if (!this.authservice.isLoggedin || !this.authservice.AuthToken) {
			//this.navCtrl.setRoot(Login);
		//} else {
      this.UserInfo = {id: null, username: null, score: 0, objectives_completed: 0, mt_completions: []};
      this.getinfo();
    //}
	}

  ionViewCanEnter(): boolean{
     // here we can either return true or false
     // depending on if we want to leave this view
     if (!this.authservice.isLoggedin || !this.authservice.AuthToken) {
        return false;
      } else {
        return true;
      }
  }

	ionViewDidLoad() {
		console.log('Hello Userpage Page');
	}

	logout() {
		this.authservice.logout();

    this.events.publish('user:logout');

		this.navCtrl.setRoot(Login);
	}

	getinfo() {

    this.zone.run(() => {

		  this.authservice.getinfo().then(data => {
        console.log('page 1 getinfo:')
			  console.log(this.authservice.UserInfo);

        this.UserInfo = this.authservice.UserInfo;

        console.log('page 1 this UserInfo:')
        console.log(this.UserInfo);

			/*	var alert = this.alertCtrl.create({
					title: 'ok',
					subTitle: data.message,
					buttons: ['ok']
				});
				alert.present();*/

        //this.UserInfo = data;

			/*if (data.message) {
				var alert = this.alertCtrl.create({
					title: data.message,
					subTitle: data.message,
					buttons: ['ok']
				});
				alert.present();
			}*/
		  });

    });
	}

}
