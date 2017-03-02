import { Component } from '@angular/core';
import { NavParams, ModalController, Platform, ViewController, AlertController, ToastController, Events, ItemSliding } from 'ionic-angular';

import { AuthService } from '../login/authservice';

import { Locations } from '../../providers/locations';
import { Objectives } from '../../providers/objectives';

import { ModalObjPage } from './objective-view';
import { ModalAddObjPage } from './objective-add';
import { ModalObjDetailsPage } from './objective-details';

import { NgZone } from '@angular/core';

// Import the config module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../../env-configuration/ITestAppEnvConfiguration";

declare var google;

declare var cordova: any;

@Component({
  templateUrl: './location-view.html'
})
export class ModalContentPage {
  location;
  scope: string;
  config: ITestAppEnvConfiguration;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
  	public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public authservice: AuthService,
    public zone: NgZone,
    public locationsProvider: Locations,
    public objectivesProvider: Objectives,
    private events: Events,
    private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>
  ) {
    this.location = this.params.get('loc');

    console.log('location view');
    console.log(this.location);

    this.scope = this.authservice.AuthScope;

    this.config = envConfiguration.getConfig();
    this.listenToCompletedEvent();
    this.listenToDeletedCompletionEvent();
  }

  openObjectiveModal(obj) {

    let modal = this.modalCtrl.create(ModalObjPage, obj);
    modal.present();
  }

  viewObjectiveModal(obj, slidingItem: ItemSliding) {

    slidingItem.close();

    let modal = this.modalCtrl.create(ModalObjDetailsPage, obj);
    modal.present();
  }

  addObjectiveModal(location) {

    let modal = this.modalCtrl.create(ModalAddObjPage, location);

    modal.onDidDismiss((item) => {

        if (item) {
            //this.saveItem(item);

            item.objective_photo = './assets/images/no_image.png';

            console.log('modal add obj on did dismiss:');
            console.log(item);

            item['mt_completions'] = [];

            this.location['mt_objectives'].push(item);
        }

    });

    modal.present();
  }

  deleteLocation(location_id) {
    //console.log('delete ojective');
    //console.log(obj);

    let alert = this.alertCtrl.create({
      title: 'Confirm delete location',
      message: 'Are you sure that you want to delete the selected location?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {

            this.zone.run(() => {
              /*for (let i = 0; i < this.location['mt_objectives'].length; i++) {
                if (this.location['mt_objectives'][i] == obj){

              */
                  this.locationsProvider.delete(location_id).subscribe(location => {

                      console.log(location);

                      //this.location['mt_objectives'].splice(i, 1);
                      this.events.publish('map:reload');

                      this.presentToast('Location deleted!');

                      this.dismiss();

                  });

            /*    }
          }*/
            });


          }
        }
      ]
    });

    alert.present();

  }

  deleteObjective(obj, slidingItem: ItemSliding) {

    slidingItem.close();

    let alert = this.alertCtrl.create({
      title: 'Confirm delete objective',
      message: 'Are you sure that you want to delete the selected objective?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {

            this.zone.run(() => {
              for (let i = 0; i < this.location['mt_objectives'].length; i++) {
                if (this.location['mt_objectives'][i] == obj) {

                  this.objectivesProvider.delete(obj.id).subscribe(objectives => {

                      console.log(objectives);

                      this.location['mt_objectives'].splice(i, 1);

                      this.events.publish('map:reload');

                      this.presentToast('Objective deleted!');

                  });

                }
              }
            });


          }
        }
      ]
    });

    alert.present();

  }

  listenToCompletedEvent() {
      this.events.subscribe('objective:completed', (objective_completion) => {
        for (var i in this.location['mt_objectives']) {
          if (this.location['mt_objectives'][i].id == objective_completion.objective_id) {
            this.location['mt_objectives'][i].completed = 'y';
            this.location['mt_objectives'][i].objective_photo = this.config.WS_ENDPOINT + 'uploads/' + objective_completion.objective_photo;
          }
        }
      });
  }

  listenToDeletedCompletionEvent() {
    //this.zone.run(() => {

    this.events.subscribe('completion:deleted', (objective_id) => {

      //console.log('EVENT completion:deleted RECEIVED IN location-view, objective id: ' + objective_id);

      for (var i in this.location['mt_objectives']) {
        if (this.location['mt_objectives'][i].id == objective_id) {
          this.location['mt_objectives'][i].completed = 'n';
          this.location['mt_objectives'][i].objective_photo = './assets/images/no_image.png';
          this.location['mt_objectives'][i].mt_completions = [];
        }
      }
    });
    //});
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
