import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, AlertController, Events, LoadingController } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { AuthService } from './authservice';

import { Page1 } from '../page1/page1';

import { LocationTracker } from '../../providers/location-tracker';

import { Tracking } from '../../providers/tracking';

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
              public formBuilder: FormBuilder,
              public locationTracker: LocationTracker,
              private geolocationProvider: Geolocation,
              private tracking: Tracking) {
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

           this.authservice.getinfo().then(data => {
             console.log('login getinfo:');
             console.log(this.authservice.UserInfo);

             if (this.authservice.UserInfo.mt_tracking_sessions && (this.authservice.UserInfo.mt_tracking_sessions.length > 0) && (this.authservice.UserInfo.mt_tracking_sessions[0].date_end == null))
             {
               this.locationTracker.startTracking(true);

               let options = {
                   frequency: 3000,
                   enableHighAccuracy: true
               };

               this.locationTracker.watch = this.geolocationProvider.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
                 console.log('location tracker position in LOGIN page:');
                 console.log(position.coords.latitude + ', ' + position.coords.longitude);

                 this.tracking.track(this.authservice.UserInfo.mt_tracking_sessions[0].id, position.coords.latitude, position.coords.longitude).subscribe(track => {

                    //console.log('location tracker subscribe data in LOGIN page:');
                    //console.log(track);

                 });
               });
             }

             // redirect to user profile page
             this.navCtrl.setRoot(Page1);

           });

          // save device id to logged in user
  	       this.authservice.setdevice_id(data.user, this.authservice.deviceId).then(data => {

           });

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
