import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController, Events } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { Push } from 'ionic-native';

import { Page1 } from '../pages/page1/page1';
import { Login } from '../pages/login/login';
import { UsersPage } from '../pages/users/users';
import { LocationsPage } from '../pages/locations/locations';
import { MessagesPage } from '../pages/messages/messages';
import { SettingsPage } from '../pages/settings/settings';

import { AuthService } from '../pages/login/authservice';


interface defPage {
  title: string,
  component: any,
  icon: string
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = Login;

  pages: Array<defPage>;

  loginPage: defPage;
  logoutPage: defPage;
  usersPage: defPage;
  settingsPage: defPage;

  loggedIn = false;

  constructor(public platform: Platform,
              public authservice: AuthService,
              public alertCtrl: AlertController,
              private events: Events) {
    this.initializeApp();
    this.listenToLoginEvents();

    this.loginPage = {title: 'Login', component: Login, icon: 'log-in'};
    this.logoutPage = {title: 'Logout', component: null, icon: 'log-out'};

    this.pages = [
/*      { title: 'Login', component: Login, icon: 'log-in' },*/
      { title: 'Profile', component: Page1, icon: 'person' },
	    { title: 'Map', component: LocationsPage, icon: 'globe' },
      { title: 'Messages', component: MessagesPage, icon: 'mail' }
    ];

    this.usersPage = {title: 'Users', component: UsersPage, icon: 'people'};
    this.settingsPage = {title: 'Settings', component: SettingsPage, icon: 'settings'};
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (!this.platform.is('cordova')) {
        this.authservice.deviceId = 'run_in_browser';
      }
      else {
        // setup push notifications
        this.authservice.pushService = Push.init({
           android: {
               senderID: '773099066790'
           },
           ios: {
               alert: 'true',
               badge: true,
               sound: 'false'
           },
           windows: {}
        });

        this.authservice.pushService.on('registration', (data) => {
          console.log("device token ->", data.registrationId);
          //TODO - send device token to server

          this.authservice.deviceId = data.registrationId;

        });

        this.authservice.pushService.on('notification', (data) => {
          console.log('push notification data:');
          console.log(data);

          //if user using app and push notification comes
          if (data.additionalData.foreground) {
            // if application open, show popup
            let confirmAlert = this.alertCtrl.create({
              title: 'New Message',
              message: data.message,
              buttons: [{
                text: 'Ignore',
                role: 'cancel'
              }, {
                text: 'View',
                handler: () => {

                  if (this.loggedIn) {
                    this.nav.setRoot(MessagesPage).catch(()=> console.log('should I stay or should I go now'));
                  } else {
                    this.nav.setRoot(Login).catch(()=> console.log('should I stay or should I go now'));
                  }

                }
              }]
            });
            confirmAlert.present();
          } else {
            //if user NOT using app and push notification comes

            console.log("Push notification clicked");

            if (this.loggedIn) {
              this.nav.setRoot(MessagesPage).catch(()=> console.log('should I stay or should I go now'));
            } else {
              this.nav.setRoot(Login).catch(()=> console.log('should I stay or should I go now'));
            }

          }
        });
        this.authservice.pushService.on('error', (e) => {
          console.log(e.message);
        });
      }

      StatusBar.styleDefault();
      Splashscreen.show();
      setTimeout(() => {
        Splashscreen.hide();
      }, 2500);
    });
  }

  listenToLoginEvents() {
      this.events.subscribe('user:login', () => {
        this.loggedIn = true;
      });

      this.events.subscribe('user:logout', () => {
        this.loggedIn = false;
      });
  }


	menuLogout() {
		this.authservice.logout();

    this.events.publish('user:logout');

		this.nav.setRoot(Login);
	}

  exitApp() {

    let alert = this.alertCtrl.create({
      title: 'Exit application',
      message: 'Are you sure you want to exit MapTrials application?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Exit',
          handler: () => {
            this.platform.exitApp();
          }
        }
      ]
    });
    alert.present();

  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component).catch(()=> console.log('should I stay or should I go now'));
  }
}
