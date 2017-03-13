import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, ToastController, Events  } from 'ionic-angular';
import { Geolocation, Geoposition } from 'ionic-native';

import { LocationTracker } from '../../providers/location-tracker';

import { AuthService } from '../login/authservice';

import { Login } from '../login/login';

import { Location } from '../../models/location';

import { Locations } from '../../providers/locations';

import { ModalContentPage }  from './location-view';

import 'rxjs/add/operator/filter';

declare var google;

declare var cordova: any;

// Import the config module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../../env-configuration/ITestAppEnvConfiguration";

/*
  Generated class for the Locations page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-locations',
  templateUrl: 'locations.html'
})
export class LocationsPage {

	locations: Location[];

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  geolocation: any;

  scope: string;

  addMarkerEnabled: boolean = false;

  config: ITestAppEnvConfiguration;

  myMarker: any;

  public watch: any;

  constructor(public navCtrl: NavController,
              public authservice: AuthService,
              public navParams: NavParams,
              public locationsProvider: Locations,
              public locationTracker: LocationTracker,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public events: Events,
              private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>
            ) {
		if (!this.authservice.isLoggedin && !this.authservice.AuthToken) {
			this.navCtrl.setRoot(Login);
		}
    this.scope = this.authservice.AuthScope;

    this.config = envConfiguration.getConfig();

    this.listenToMapReloadEvent();
  }

  ionViewCanEnter(): boolean{
    console.log('ionViewCanEnter locations authservice:');
    console.log(this.authservice);
     // here we can either return true or false
     // depending on if we want to leave this view
     if (!this.authservice.isLoggedin || !this.authservice.AuthToken) {
        return false;
      } else {
        return true;
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocationsPage');
    this.loadMap();

  }

  ionViewDidEnter() {
    //this.locationTracker.startTracking();
  }

  ionViewWillLeave() {
    this.watch.unsubscribe();
    this.locationTracker.stopTracking();
  }

  openLocationModal(characterNum) {
    let modal = this.modalCtrl.create(ModalContentPage, characterNum);
    modal.present();
  }

  loadMap(reloadMyLocation: boolean = false) {
    this.locationTracker.startTracking();

	  var bounds = new google.maps.LatLngBounds();

    let mapOptions = {
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    //this.geolocateMe();

		this.locationsProvider.list().subscribe(locations => {

			for (var i in locations) {

        if (locations[i]['mt_objectives'].length > 0) {
          for (var j in locations[i]['mt_objectives']) {
            locations[i]['mt_objectives'][j].objective_photo = './assets/images/no_image.png';

            if (locations[i]['mt_objectives'][j]['mt_completions'].length > 0) {

              for (var k in locations[i]['mt_objectives'][j]['mt_completions']) {
                if (locations[i]['mt_objectives'][j]['mt_completions'][k].user_id == this.authservice.UserId) {
                  locations[i]['mt_objectives'][j].completed = 'y';
                  locations[i]['mt_objectives'][j].objective_photo = this.config.WS_ENDPOINT + 'uploads/' + locations[i]['mt_objectives'][j]['mt_completions'][k].objective_photo;
                }
              }

            }
          }
        }

        this.locations = locations;

				this.addMarkerForLocation(locations[i]);

				let myLatLng = new google.maps.LatLng(locations[i].latitude, locations[i].longitude);

				bounds.extend(myLatLng);
				this.map.fitBounds(bounds);
			}

      //this.geolocateMe();

      //console.log('geolocateMe position:');
      //console.log(this.locationTracker.lat + ', ' + this.locationTracker.lng);

      //var bounds = new google.maps.LatLngBounds();

      //this.zone.run(() => {
    		/*Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
                    .filter((p) => p.coords !== undefined) //Filter Out Errors
                    .subscribe((position) => {

          console.log('my geolocation position:');
    			console.log(position.coords.latitude + ', ' + position.coords.longitude);

          //this.latitude = position.coords.latitude;
          //this.longitude = position.coords.longitude;

    			//this.coordinates = position.coords.latitude.toFixed(2) + ', ' + position.coords.longitude.toFixed(2);
    			//this.storeUserGeolocation(position);*/
          let options = {
            frequency: 3000,
            enableHighAccuracy: true
          };

          this.watch = Geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

            console.log('location tracker position:')
            console.log(position.coords.latitude + ', ' + position.coords.longitude);

            // Run update inside of Angular's zone
            /*this.zone.run(() => {
              this.lat = position.coords.latitude;
              this.lng = position.coords.longitude;
            });*/

            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            if (this.myMarker && !reloadMyLocation) {
              this.myMarker.setPosition(latLng);
            } else {
              let markerIcon = 'http://maps.google.com/mapfiles/ms/micons/horsebackriding.png';

          	  this.myMarker = new google.maps.Marker({
            		map: this.map,
            		animation: google.maps.Animation.DROP,
            		position: latLng,
                icon: markerIcon,
          	  });

              bounds.extend(latLng);
      				this.map.fitBounds(bounds);
            }


          });


    		/*}).catch((error) => {
          console.log('Error getting location', error);*/ /*
        });*/


		});
  }

  enableAddMarker() {
    this.addMarkerEnabled = true;

    console.log(this.map);

    this.map.setOptions({ draggableCursor: 'crosshair' });

    this.presentToast('Add location enabled, double tap on map in the desired place.');

	  this.map.addListener('dblclick', (event) => {
        this.addMarker(event.latLng);
    });

  }

  disableAddMarker() {
    this.addMarkerEnabled = false;
    this.map.setOptions({ draggableCursor: undefined });

    this.presentToast('Add location disabled.');

    google.maps.event.clearListeners(this.map, 'dblclick');
  }

  addMarker (latLng) {
		this.presentConfirm(latLng);
  }

  addMarkerForLocation (location) {
    console.log(location);
    let latLng = new google.maps.LatLng(location.latitude, location.longitude);

    let markerIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

    let objectivesCompleted = 0;

    if (location.mt_objectives.length == 0) {
      markerIcon = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    } else {
      for (var i in location.mt_objectives) {
        if (location.mt_objectives[i].completed == 'y') {
          objectivesCompleted++;
        }
      }

      if (objectivesCompleted == location.mt_objectives.length) {
        markerIcon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      }
    }

	  let marker = new google.maps.Marker({
  		map: this.map,
  		animation: google.maps.Animation.DROP,
  		position: latLng,
      icon: markerIcon,
      /*label: String(location.mt_objectives.length - objectivesCompleted)*/
	  });

	  marker.addListener('click', () => {
			console.log('marker_click');

			this.openLocationModal({loc: location});
	  });
  }

  presentConfirm(position) {

  	console.log(position.lat());
  	console.log(position.lng());

    let alert = this.alertCtrl.create({
      title: 'Confirm new location',
      message: 'Do you want to add a new location at ' + position.lat() + ', ' + position.lng() + '?',
      inputs: [
        {
          name: 'location_name',
          placeholder: 'Location name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save location',
          handler: data => {
            console.log('Save clicked, location name: ' + data.location_name);

      		  let datt = {
        			name: data.location_name,
        			latitude: position.lat(),
        			longitude: position.lng()
      		  };

      			this.locationsProvider.save(datt).subscribe(location => {

              let marker = new google.maps.Marker({
          		map: this.map,
          		animation: google.maps.Animation.DROP,
          		position: position,
              icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
      	     });


          	  marker.addListener('click', () => {
          			console.log('new_marker_click');
      				  this.openLocationModal({loc: location});
          	  });

              location['mt_objectives'] = [];

              this.locations.push(location);

              this.disableAddMarker();

              this.presentToast('Location saved!');

  			    });
          }
        }
      ]
    });

    alert.present();
  }


	private presentToast(text) {
	  let toast = this.toastCtrl.create({
		message: text,
		duration: 3000,
		position: 'top'
	  });
	  toast.present();
	}

  listenToMapReloadEvent() {
    this.events.subscribe('map:reload', () => {
      this.loadMap(true);
    });
  }

}
