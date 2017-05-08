import { Component, NgZone } from '@angular/core';
import { NavParams, NavController, ViewController, ToastController, AlertController, ModalController, Events } from 'ionic-angular';

import { User } from '../../models/user';

import { Users } from '../../providers/users';
import { Objectives } from '../../providers/objectives';
import { Tracking } from '../../providers/tracking';

import { ModalTrackingSessionPage } from './tracking-session';

// Import the config module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../../env-configuration/ITestAppEnvConfiguration";

@Component({
  templateUrl: './user-view.html'
})
export class ModalViewUserPage {
  user: User;
  config: ITestAppEnvConfiguration;
  public category: string = "objectives";

  constructor(public params: NavParams,
              /*public objectivesProvider: Objectives,*/
              public viewCtrl: ViewController,
              private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>,
              public toastCtrl: ToastController,
              public alertCtrl: AlertController,
              private navCtrl: NavController,
              public zone: NgZone,
              public events: Events,
              public objectivesProvider: Objectives,
              private usersProvider: Users,
              public modalCtrl: ModalController,
              private trackingProvider: Tracking) {

    this.config = envConfiguration.getConfig();

    this.user = this.params.get('obj');

    this.loadUser(this.params.get('obj').id);
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

  loadUser(id) {
		this.usersProvider.get(id).subscribe(user => {

        if (user.mt_completions.length > 0) {
          for (var i in this.user.mt_completions) {
            var objective_photo = './assets/images/no_image.png';

            if (user.mt_completions[i].objective_photo) {
              objective_photo =  this.config.WS_ENDPOINT + 'uploads/' + user.mt_completions[i].objective_photo;
            }

            user.mt_completions[i].objective_photo = objective_photo;
          }
        }

        console.log(user);
        this.user = user;
		});
  }

  deleteCompletion(obj) {
    //console.log('delete ojective');
    //console.log(obj);

    let alert = this.alertCtrl.create({
      title: 'Confirm delete objective completion',
      message: 'Are you sure that you want to delete the selected objective completion?',
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
              for (let i = 0; i < this.user.mt_completions.length; i++) {
                if (this.user.mt_completions[i] == obj){

                  let score = this.user.mt_completions[i].score;

                  this.objectivesProvider.deleteCompletion(obj.id).subscribe(completion => {

                      console.log(completion);

                      this.events.publish("completion:deleted", obj.objective_id);

                      console.log('EVENT completion:deleted PUBLISHED IN user-view, objective id: ' + obj.objective_id);

                      this.events.publish("map:reload");

                      this.user.mt_completions.splice(i, 1);
                      this.user.objectives_completed--;
                      this.user.score = this.user.score - score;

                      this.presentToast('Objective completion deleted!');

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

  stopTrackingSession(obj, i) {
    this.trackingProvider.end_session(obj.id).subscribe(sess => {

        console.log('tracking session stopped data:');
        console.log(sess);

        this.user.mt_tracking_sessions[i] = sess;

        this.events.publish('users:reload');
        console.log('EVENT users:reload send from user-view page');
        
        //this.users[i].isTracking = false;
        //this.users[i].mt_tracking_sessions = [];

        this.presentToast('User tracking stopped!');

    });
  }

  deleteTrackingSession(obj, i) {
    let alert = this.alertCtrl.create({
        title: 'Confirm delete tracking session',
        message: 'Are you sure that you want to delete the selected tracking session?',
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

                        this.trackingProvider.delete(obj.id).subscribe(tracking_sessions => {

                            console.log('tracking sessions delete data:');
                            console.log(tracking_sessions);

                            this.user.mt_tracking_sessions.splice(i, 1);

                            this.presentToast('Tracking session deleted!');

                        });

                    });


                }
            }
        ]
    });

    alert.present();
  }

  openTrackingSessionModal(obj) {
    let modal = this.modalCtrl.create(ModalTrackingSessionPage, obj);
    modal.present();
    //this.navCtrl.push(ModalTrackingSessionPage, obj)
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
