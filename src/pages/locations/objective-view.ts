import { Component } from '@angular/core';
import { NavParams, Platform, ViewController, ToastController, LoadingController, Loading, Events, AlertController } from 'ionic-angular';
import { Geolocation, Camera, File, Transfer, FilePath } from 'ionic-native';

/*import { LocationTracker } from '../../providers/location-tracker';*/

import { Headers } from '@angular/http';

import { AuthService } from '../login/authservice';

import { Objectives } from '../../providers/objectives';

import { NgZone } from '@angular/core';

// Import the config module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../../env-configuration/ITestAppEnvConfiguration";

declare var google;

declare var cordova: any;

import { Settings } from '../../providers/settings';

interface Dictionary {
    [index: string]: any;
}

@Component({
    templateUrl: './objective-view.html'
})
export class ModalObjPage {
    objective;
    location;

    public base64Image: string;

    lastImage: string = null;
    pathForLastImage: string = '';
    loading: Loading;

    public coordinates: string;
    public latitude: number;
    public longitude: number;
    comment: string = '';

    config: ITestAppEnvConfiguration;

    settings: Dictionary = { 'completion_range_check': 0, 'new_objectives_message': false };

    outOfRange: boolean = false;

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        public zone: NgZone,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public objectivesProvider: Objectives,
        private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>,
        public authservice: AuthService,
        public events: Events,
        private settingsProvider: Settings,
        public alertCtrl: AlertController
    ) {
        //console.log('objective id: ' + this.params.get('obj').id);
        this.objective = this.params.get('obj');
        this.location = this.params.get('location');

        //console.log(this.location);

        this.config = envConfiguration.getConfig();

        this.loadSettings();
    }

    loadSettings() {
        this.settingsProvider.list().subscribe(settings => {
            for (var i in settings) {
                if (settings[i].key == 'new_objectives_message') {
                    this.settings[settings[i].key] = !!settings[i].value;
                } else {
                    this.settings[settings[i].key] = settings[i].value;
                }
            }
        });
    }

    geolocateObjective() {

        this.zone.run(() => {
            Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }).then((position) => {

                console.log(position);

                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;

                this.coordinates = position.coords.latitude.toFixed(2) + ', ' + position.coords.longitude.toFixed(2);

                // calculate distance
                console.log('your coordinates:');
                console.log(this.latitude + ', ' + this.longitude);

                if (this.settings['completion_range_check'] > 0) {
                    var distance = this.calcCrow(this.latitude, this.longitude, this.location.latitude, this.location.longitude);

                    console.log('distance: ' + distance);

                    console.log('settings completion distance: ' + (this.settings['completion_range_check'] / 1000));

                    if (distance > this.settings['completion_range_check'] / 1000) {
                        this.outOfRange = true;

                        let range: string = '';

                        if (this.settings['completion_range_check'] < 1000) {
                            range = this.settings['completion_range_check'] + ' m';
                        } else {
                            range = (this.settings['completion_range_check'] / 1000).toFixed(1) + ' km';
                        }

                        var alert = this.alertCtrl.create({
                            title: 'Out of range',
                            message: 'The admin has set a maximum distance of ' + range + ' to complete this objective.<br>Please geolocalize closer, you are out of range.',
                            buttons: ['ok']
                        });

                        alert.present();
                    } else {
                        this.outOfRange = false;
                    }
                }

                //this.storeUserGeolocation(position);
            }).catch((error) => {
                console.log('Error getting location', error);
            });
        });
    }

    takePicture(sourceType) {
        let srcType: number;
        if (sourceType == 'camera') {
            srcType = Camera.PictureSourceType.CAMERA;
        } else {
            srcType = Camera.PictureSourceType.PHOTOLIBRARY;
        }

        this.zone.run(() => {

            Camera.getPicture({
                destinationType: Camera.DestinationType.FILE_URI,
                correctOrientation: true,
                sourceType: srcType,
                saveToPhotoAlbum: false
                /*,
              targetWidth: 1000,
              targetHeight: 1000*/
            }).then((imagePath) => {
                // imageData is a base64 encoded string
                //this.base64Image = "data:image/jpeg;base64," + imageData;
                console.log('imagePath:');
                console.log(imagePath);
                if (this.platform.is('android') && srcType === Camera.PictureSourceType.PHOTOLIBRARY) {
                    FilePath.resolveNativePath(imagePath)
                        .then(filePath => {

                            console.log('photolibrary filePath:' + filePath);

                            var currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
                            var correctPath = filePath.substr(0, imagePath.lastIndexOf('/') + 1);

                            console.log('currentName:' + currentName);
                            console.log('correctPath:' + correctPath);

                            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
                        });
                } else {
                    var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
                    var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);

                    console.log('currentName:' + currentName);
                    console.log('correctPath:' + correctPath);

                    this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
                }
            }, (err) => {
                console.log(err);
            });
        });
    }

    // Create a new name for the image
    private createFileName() {
        var d = new Date(),
            n = d.getTime(),
            newFileName = n + ".jpg";
        return newFileName;
    }

    // Copy the image to a local folder
    private copyFileToLocalDir(namePath, currentName, newFileName) {

        this.zone.run(() => {

            File.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
                console.log('newFilename: ' + newFileName);
                this.lastImage = newFileName;
                this.pathForLastImage = this.pathForImage(newFileName);
            }, error => {
                this.presentToast('Error while storing file.');
            });

        });

    }

    private presentToast(text) {
        let toast = this.toastCtrl.create({
            message: text,
            duration: 3500,
            position: 'top'
        });
        toast.present();
    }

    // Always get the accurate path to your apps folder
    public pathForImage(img) {
        if (img === null) {
            return '';
        } else {
            console.log('pathForImage: ' + cordova.file.dataDirectory + img);
            return cordova.file.dataDirectory + img;
        }
    }

    completeObjective() {

        let datt = {
            objective_id: this.params.get('obj').id,
            latitude: this.latitude,
            longitude: this.longitude,
            comment: this.comment,
            objective_photo: this.lastImage,
            score: this.objective.score
        };

        //console.log('datt');
        //console.log(datt);

        this.zone.run(() => {

            this.objectivesProvider.complete(datt).subscribe(objective_completion => {

                console.log(objective_completion);

                this.events.publish('objective:completed', objective_completion);
                this.events.publish('map:reload');

                this.presentToast('Objective completed! You have been awarded ' + this.objective.score + ' score points.');

                if (!this.config.DEBUG) {
                    this.uploadImage(objective_completion);
                }
                else {
                    this.dismissObjective();
                }

            });
        });

    }

    public uploadImage(objective_completion) {
        // Destination URL
        var url = this.config.WS_ENDPOINT + 'upload';

        // File for Upload
        var targetPath = this.pathForImage(this.lastImage);

        // File name only
        var filename = this.lastImage;

        var headers = new Headers();
        this.authservice.loadUserCredentials();
        //console.log(this.authservice.AuthToken);
        headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

        var options = {
            fileKey: "file",
            fileName: filename,
            chunkedMode: false,
            mimeType: "multipart/form-data",
            params: { 'fileName': filename },
            headers: headers
        };

        console.log('file upload options:');
        console.log(options);

        console.log('targetPath: ' + targetPath);

        const fileTransfer = new Transfer();

        this.loading = this.loadingCtrl.create({
            content: 'Uploading...',
        });
        this.loading.present();

        // Use the FileTransfer to upload the image
        fileTransfer.upload(targetPath, url, options).then(data => {

            this.events.publish('objective:completed', objective_completion);

            this.loading.dismissAll()
            this.dismissObjective();

            setTimeout(() => {
                this.presentToast('Image succesful uploaded.');
            }, 3500);
        }, err => {
            console.log('upload image error:');
            console.log(err);
            this.loading.dismissAll()
            setTimeout(() => {
                this.presentToast('Error while uploading file.');
            }, 3500);
        });
    }

    //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
    calcCrow(lat1: number, lon1: number, lat2: number, lon2: number) {
        var R = 6371; // km
        var dLat = this.toRad(lat2 - lat1);
        var dLon = this.toRad(lon2 - lon1);
        var lat1 = this.toRad(lat1);
        var lat2 = this.toRad(lat2);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }

    // Converts numeric degrees to radians
    toRad(Value) {
        return Value * Math.PI / 180;
    }

    dismissObjective() {
        this.viewCtrl.dismiss();
    }
}
