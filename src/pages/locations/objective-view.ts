import { Component } from '@angular/core';
import { NavParams, Platform, ViewController, ToastController, LoadingController, Loading, Events  } from 'ionic-angular';
import { Geolocation, Camera, File, Transfer, FilePath } from 'ionic-native';

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

@Component({
  templateUrl: './objective-view.html'
})
export class ModalObjPage {
  objective;

  public base64Image: string;

  lastImage: string = null;
  pathForLastImage: string = '';
  loading: Loading;

  public coordinates: string;
  public latitude: number;
  public longitude: number;
  comment: string = '';

  config: ITestAppEnvConfiguration;

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
    public events: Events
  ) {
	   console.log('objective id: ' + this.params.get('obj').id);
     this.objective = this.params.get('obj');

     this.config = envConfiguration.getConfig();
  }

  geolocateObjective() {

    this.zone.run(() => {
  		Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }).then((position) => {

  			console.log(position);

        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

  			this.coordinates = position.coords.latitude.toFixed(2) + ', ' + position.coords.longitude.toFixed(2);
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
	  newFileName =  n + ".jpg";
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
      params : {'fileName': filename},
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

  dismissObjective() {
    this.viewCtrl.dismiss();
  }
}
