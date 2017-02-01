import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController, Events } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { Page1 } from '../pages/page1/page1';
import { Login } from '../pages/login/login';
import { UsersPage } from '../pages/users/users';
import { LocationsPage } from '../pages/locations/locations';

import { AuthService } from '../pages/login/authservice';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = Login;

  pages: Array<{title: string, component: any, icon: string}>;

  loginPage: {title: string, component: any, icon: string};
  logoutPage: {title: string, icon: string};
  usersPage: {title: string, component: any, icon: string};

  loggedIn = false;

  constructor(public platform: Platform,
              public authservice: AuthService,
              public alertCtrl: AlertController,
              private events: Events) {
    this.initializeApp();
    this.listenToLoginEvents();

    this.loginPage = {title: 'Login', component: Login, icon: 'log-in'};
    this.logoutPage = {title: 'Logout', icon: 'log-out'};

    this.pages = [
/*      { title: 'Login', component: Login, icon: 'log-in' },*/
      { title: 'Profile', component: Page1, icon: 'person' },
	    { title: 'Map', component: LocationsPage, icon: 'globe' }
    ];

    this.usersPage = {title: 'Users', component: UsersPage, icon: 'people'}
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
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
