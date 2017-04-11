import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from './authservice';

import { NavController, AlertController, Events, LoadingController } from 'ionic-angular';

import { Page1 } from '../page1/page1';

@Component({
    templateUrl: 'login.html'
})
export class Login {

  loginForm: FormGroup;

	usercreds = {
     name: '',
     password: '',
	   user_type: ''
	};

  loading: any;

	constructor(public navCtrl: NavController,
              public authservice: AuthService,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              private events: Events,
              public formBuilder: FormBuilder) {
      this.loginForm = formBuilder.group({
          usertype: ['', Validators.required],
          username: ['', Validators.required],
          password: ['', Validators.required]
      });
  }

  login(userForm) {

    //console.log(user);

    if (this.loginForm.dirty && this.loginForm.valid) {

      this.usercreds.name = this.loginForm.value.username;
      this.usercreds.password = this.loginForm.value.password;
      this.usercreds.user_type = this.loginForm.value.usertype;

      this.presentLoading();

  		this.authservice.authenticate(this.usercreds).then(data => {
        this.loading.dismiss().catch(() => {});
  			console.log('user authenticate ionic data:');
  			console.log(data);

        if (data.ok) {

          this.events.publish('user:login');

          // save device id to logged in user
  	       this.authservice.setdevice_id(data.user, this.authservice.deviceId).then(data => {

           });
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
    else {
				var alert = this.alertCtrl.create({
					title: 'Login Error',
					message: 'Please complete all login fields!', //'Login incorrect, please try again!',
					buttons: ['ok']
				});

				alert.present();
    }
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
