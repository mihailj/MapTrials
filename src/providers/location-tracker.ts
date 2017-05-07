import { Injectable, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import 'rxjs/add/operator/filter';

import { AuthService } from '../pages/login/authservice';
import { Tracking } from './tracking';

//import 'rxjs/add/operator/map';

/*
  Generated class for the LocationTracker provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class LocationTracker {

  public lat: number = 0;
  public lng: number = 0;
  public watch: any;

  constructor(public zone: NgZone,
              public platform: Platform,
              private backgroundGeolocation: BackgroundGeolocation,
              private authservice: AuthService,
              private tracking: Tracking) {

  }

  startTracking(log: boolean = false) {
    // Background Tracking

    let config: BackgroundGeolocationConfig = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: false,
      interval: 2000
    };

    this.backgroundGeolocation.configure(/*(location) => {

      console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
      });

     }, (err) => {

      console.log(err);

    },*/ config).subscribe((location: BackgroundGeolocationResponse) => {

      console.log('BackgroundGeolocation in LocationTracker provider:  ' + location.latitude + ',' + location.longitude);

      if (log) {
          this.tracking.track(this.authservice.UserInfo.mt_tracking_sessions[0].id, location.latitude, location.longitude).subscribe(track => {
          });
      }

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
      });
    });

    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();


    // Foreground Tracking

    /*

    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };
    this.watch = Geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

      console.log('location tracker position:')
      console.log(position.coords.latitude + ', ' + position.coords.longitude);

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    });*/

  }

  stopTracking() {

    console.log('stopTracking');

    this.backgroundGeolocation.stop();

    if (this.platform.is('ios')) {
      this.backgroundGeolocation.finish();
    }

  }

}
