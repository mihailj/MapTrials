import { Component } from '@angular/core';

import { AuthService } from './authservice';

import { NavController, AlertController, Events } from 'ionic-angular';

import { Page1 } from '../page1/page1';

@Component({
    templateUrl: 'login.html'
})
export class Login {

	usercreds = {
     name: '',
     password: '',
	   user_type: 'user'
	};

	constructor(public navCtrl: NavController,
              public authservice: AuthService,
              public alertCtrl: AlertController,
              private events: Events) {
  }

  login(user) {
		this.authservice.authenticate(user).then(data => {

			console.log('user authenticate ionic data:');
			console.log(data);

      if (data) {

        this.events.publish('user:login');

        this.navCtrl.setRoot(Page1);
      } else {
				console.log('user authservice authenticate data = false');

				var alert = this.alertCtrl.create({
					title: 'Login Error',
					message: 'Login incorrect, please try again!',
					buttons: ['ok']
				});

				alert.present();
			}
		}).catch(error => {
			console.log('user authservice authenticate catch error');
			console.log(error)
		});

  }
}
