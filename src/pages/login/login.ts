import { Component } from '@angular/core';

import { AuthService } from './authservice';

import { NavController, AlertController, Events, LoadingController } from 'ionic-angular';

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

  loading: any;

	constructor(public navCtrl: NavController,
              public authservice: AuthService,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              private events: Events) {
  }

  login(user) {
    this.presentLoading();

		this.authservice.authenticate(user).then(data => {
      this.loading.dismiss().catch(() => {});
			console.log('user authenticate ionic data:');
			console.log(data);

      if (data.ok) {

        this.events.publish('user:login');

        this.navCtrl.setRoot(Page1);
      } else {
				console.log('user authservice authenticate data = false');

        let msg = 'Connection error, please try again later.';

        if (data._body) {

          console.log('data._body:');
          console.log(data._body);

          if (data._body.type && data._body.type == 'error') {
            msg = 'Connection error, please try again later.';
          } else {
            // decode JSON
            let dcd = JSON.parse(data._body);

            console.log('JSON.parse(data._body):');
            console.log(JSON.parse(data._body));

            if (dcd.message) {
              msg = 'Login incorrect, please try again!';
            }
          }
        }

				var alert = this.alertCtrl.create({
					title: 'Login Error',
					message: msg, //'Login incorrect, please try again!',
					buttons: ['ok']
				});

				alert.present();
			}
		}).catch(error => {
      this.loading.dismiss().catch(() => {});

			console.log('user authservice authenticate catch error');
			console.log(error)
		});

  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    this.loading.present();

    setTimeout(() => {
      if (this.loading) {
        this.loading.dismiss();
      }
    }, 10000);
  }
}
