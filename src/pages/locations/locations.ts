import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, NavController, NavParams, ModalController, AlertController, ToastController, Events } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { LocationTracker } from '../../providers/location-tracker';

import { AuthService } from '../login/authservice';

import { Login } from '../login/login';

import { Location } from '../../models/location';

import { Locations } from '../../providers/locations';

import { ModalContentPage } from './location-view';

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
    finishMarkerEnabled: boolean = false;

    config: ITestAppEnvConfiguration;

    myMarker: any;
    newMarker: any;
    newMarkerData: any;

    public watch: any;

    reloadMyLoc: boolean = false;

    constructor(public navCtrl: NavController,
        public authservice: AuthService,
        public navParams: NavParams,
        public locationsProvider: Locations,
        public locationTracker: LocationTracker,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public events: Events,
        private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>,
        private geolocationProvider: Geolocation,
        private platform: Platform
    ) {
        if (!this.authservice.isLoggedin && !this.authservice.AuthToken) {
            this.navCtrl.setRoot(Login);
        }
        this.scope = this.authservice.AuthScope;

        this.config = envConfiguration.getConfig();

        // test location services
        /*Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }).then((position) => {
          console.log(position);
        }, (err) => {
          console.log(err);
        });*/

        this.listenToMapReloadEvent();
    }

    ionViewCanEnter(): boolean {
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

        var me = this;

        if (this.platform.is('android')) {

          var permissions = cordova.plugins.permissions;

          permissions.hasPermission(permissions.ACCESS_FINE_LOCATION, function(status) {
            console.log(status);
            if (!status.hasPermission) {
              permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, function() {
                me.enableLocation();
              }, function(error){
                console.log(error);
                var alert = me.alertCtrl.create({
                    title: 'Location Error',
                    message: 'You must enable Location Services (GPS) to use Map.',
                    buttons: ['ok']
                });

                alert.present();
              });
            } else {
              me.enableLocation();
            }

          }, null);
        }
        else {
          me.enableLocation();
        }
        /*this.loadMap();*/

    }

    enableLocation() {
      console.log('enableLocation');

      var me = this;
      // use cordova plugin

      if (this.platform.is('android')) {

        cordova.plugins.locationAccuracy.canRequest(function(canRequest) {
            if (canRequest) {
                cordova.plugins.locationAccuracy.request(function() {
                    console.log("Request successful");
                    me.loadMap();
                }, function(error) {
                    console.error("Request failed");
                    console.log(error);

                    var alert = me.alertCtrl.create({
                        title: 'Location Error',
                        message: 'You must enable Location Services (GPS) to use Map.',
                        buttons: ['ok']
                    });

                    alert.present();
                    /*if(error){
                        // Android only
                        console.error("error code="+error.code+"; error message="+error.message);
                        if(error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED){
                            if(window.confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")){
                                cordova.plugins.diagnostic.switchToLocationSettings();
                            }
                        }
                    }*/
                }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
                );
            }
          });
        } else {
          me.loadMap();
        }
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

        console.log('loadMap');
        console.log('reloadMyLocation: ' + reloadMyLocation);

        if (!this.platform.is('core')) {
          this.locationTracker.startTracking();
        }

        var bounds = new google.maps.LatLngBounds();

        let mapOptions = {
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            fullscreenControl: false
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

            let options = {
                frequency: 3000,
                enableHighAccuracy: true
            };

            if (reloadMyLocation) {
                this.reloadMyLoc = true;
            } else {
                this.reloadMyLoc = false;
            }

            this.watch = this.geolocationProvider.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

                console.log('location tracker position:')
                console.log(position.coords.latitude + ', ' + position.coords.longitude);

                let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                if (this.myMarker && !this.reloadMyLoc) {
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

                    this.reloadMyLoc = false;
                }


            }, (error) => {
                console.log('watchPosition error:');
                console.log(error);
            });

        });
    }

    enableAddMarker() {
        this.addMarkerEnabled = true;

        console.log(this.map);

        this.map.setOptions({ draggableCursor: 'crosshair', disableDoubleClickZoom: true });

        this.presentToast('Add location enabled, double tap on map in the desired place.');

        this.map.addListener('dblclick', (event) => {
            this.addMarker(event.latLng);
        });

    }

    disableAddMarker(finish: boolean = false) {
        this.addMarkerEnabled = false;
        this.map.setOptions({ draggableCursor: undefined, disableDoubleClickZoom: false });

        if (finish) {
          this.presentToast('Add location disabled. Drag the marker to its final position and tap confirm.');
        } else {
          this.presentToast('Add location disabled.');
        }

        google.maps.event.clearListeners(this.map, 'dblclick');
    }

    addMarker(latLng) {
        this.presentConfirm(latLng);
    }

    addMarkerForLocation(location) {
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

            this.openLocationModal({ loc: location });
        });
    }

    goToMyPosition() {
        this.map.panTo(this.myMarker.position);
    }

    finishAddMarker() {
      this.locationsProvider.save(this.newMarkerData).subscribe(location => {

        console.log(location);

        this.newMarker.setDraggable(false);

        this.addMarkerEnabled = false;
        this.finishMarkerEnabled = false;

        location['mt_objectives'] = [];

        this.locations.push(location);

        this.newMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');

        this.newMarker.addListener('click', () => {
            console.log('new_marker_click');
            this.openLocationModal({ loc: location });
        });

        //this.disableAddMarker();

        this.presentToast('Location saved!');
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

                        this.newMarkerData = datt;

                        console.log(this.newMarkerData);

                        //this.locationsProvider.save(datt).subscribe(location => {

                            let marker = new google.maps.Marker({
                                map: this.map,
                                animation: google.maps.Animation.DROP,
                                position: position,
                                draggable: true,
                                icon: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
                            });

                            var me = this;

                            google.maps.event.addListener(marker, 'dragend', function(marker){
                                var latLng = marker.latLng;

                                let currentLatitude = latLng.lat();
                                let currentLongitude = latLng.lng();

                                me.newMarkerData.latitude = currentLatitude;
                                me.newMarkerData.longitude = currentLongitude;

                                /*jQ("#latitude").val(currentLatitude);
                                jQ("#longitude").val(currentLongitude);*/
                                console.log(currentLatitude + ', ' + currentLongitude);
                            });

                            this.newMarker = marker;

                            this.addMarkerEnabled = false;
                            this.finishMarkerEnabled = true;

                            //location['mt_objectives'] = [];

                            //this.locations.push(location);

                            this.disableAddMarker(true);

                            //this.presentToast('Location saved!');

                        //});
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
