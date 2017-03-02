import { Injectable, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';
import { /*Geolocation, Geoposition,*/ BackgroundGeolocation } from 'ionic-native';
import 'rxjs/add/operator/filter';
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

  constructor(public zone: NgZone, public platform: Platform) {

  }

  startTracking() {
    // Background Tracking

    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: false,
      interval: 2000
    };

    BackgroundGeolocation.configure((location) => {

      console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
      });

     }, (err) => {

      console.log(err);

    }, config);

    // Turn ON the background-geolocation system.
    BackgroundGeolocation.start();


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

    BackgroundGeolocation.stop();

    if (this.platform.is('ios')) {
      BackgroundGeolocation.finish();
    }

  }

}
