import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ViewController, ToastController, AlertController, ModalController, Events } from 'ionic-angular';

import { User } from '../../models/user';

import { Users } from '../../providers/users';
import { Tracking } from '../../providers/tracking';

// Import the config module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../../env-configuration/ITestAppEnvConfiguration";

declare var google;

@Component({
  selector: 'page-tracking-session',
  templateUrl: './tracking-session.html'
})
export class ModalTrackingSessionPage {
  user: User;
  config: ITestAppEnvConfiguration;

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  constructor(public params: NavParams,
              /*public objectivesProvider: Objectives,*/
              public viewCtrl: ViewController,
              private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>,
              public toastCtrl: ToastController,
              public alertCtrl: AlertController,
              public zone: NgZone,
              public events: Events,
              public modalCtrl: ModalController,
              private trackingProvider: Tracking) {

    this.config = envConfiguration.getConfig();

    /*this.user = this.params.get('obj');

    this.loadUser(this.params.get('obj').id);*/

    console.log('tracking session:');
    console.log(this.params.get('obj'));

/*
    if (this.user.mt_completions.length > 0) {
      for (var i in this.user.mt_completions) {
        var objective_photo = './assets/images/no_image.png';

        if (this.user.mt_completions[i].objective_photo) {
          objective_photo =  this.config.WS_ENDPOINT + 'uploads/' + this.user.mt_completions[i].objective_photo;
        }

        this.user.mt_completions[i].objective_photo = objective_photo;
      }
    }*/
    //this.loadObjective(this.params.get('obj'));
    //this.objective = {id: null, title:'', score: 0, distance: 0, completed:'', objective_photo:'', mt_completions: [], mt_user: { id: null, username: '', score: 0, objectives_completed: 0, mt_completions: [] }};
  }

  ionViewDidLoad() {
    console.log('tracking session ionViewDidLoad');
    this.loadMap();
  }

  loadMap() {
    console.log('tracking session loadMap');

    this.trackingProvider.get(this.params.get('obj').id).subscribe(trackingSession => {

      console.log('tracking session data:');
      console.log(trackingSession);

      if (trackingSession.mt_trackings && trackingSession.mt_trackings.length > 0)
      {

        var bounds = new google.maps.LatLngBounds();

        let mapOptions = {
            /*center: latLng,*/
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            fullscreenControl: false
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        var flightPlanCoordinates = [];

        for (var i in trackingSession.mt_trackings)
        {
            flightPlanCoordinates.push({ lat: trackingSession.mt_trackings[i].latitude, lng: trackingSession.mt_trackings[i].longitude });

            let myLatLng = new google.maps.LatLng(trackingSession.mt_trackings[i].latitude, trackingSession.mt_trackings[i].longitude);

            bounds.extend(myLatLng);
            this.map.fitBounds(bounds);
        }
        //let latLng = new google.maps.LatLng(-34.9290, 138.6010);

        var flightPath = new google.maps.Polyline({
            path: flightPlanCoordinates,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        flightPath.setMap(this.map);

      }
    });
  }

	private presentToast(text) {
	  let toast = this.toastCtrl.create({
		message: text,
		duration: 3000,
		position: 'top'
	  });
	  toast.present();
	}

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
