import { Component, NgZone } from '@angular/core';
import { NavParams, ViewController, ToastController, AlertController, Events } from 'ionic-angular';

import { Objective } from '../../models/objective';

import { Objectives } from '../../providers/objectives';

// Import the config module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../../env-configuration/ITestAppEnvConfiguration";

@Component({
  templateUrl: './objective-details.html'
})
export class ModalObjDetailsPage {
  objective: Objective;
  config: ITestAppEnvConfiguration;

  constructor(public params: NavParams,
              public objectivesProvider: Objectives,
              public viewCtrl: ViewController,
              private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>,
              public toastCtrl: ToastController,
              public alertCtrl: AlertController,
              public zone: NgZone,
              public events: Events) {

    this.config = envConfiguration.getConfig();
    this.loadObjective(this.params.get('obj'));
    this.objective = {id: null, title:'', score: 0, distance: 0, completed:'', objective_photo:'', mt_completions: [], mt_user: { id: null, username: '', score: 0, objectives_completed: 0, mt_completions: [] }};
  }

  loadObjective(obj) {
		this.objectivesProvider.get(obj.id).subscribe(objective => {

        if (objective.mt_completions.length > 0) {
          for (var i in objective.mt_completions) {
            var objective_photo = './assets/images/no_image.png';

            if (objective.mt_completions[i].objective_photo) {
              objective_photo =  this.config.WS_ENDPOINT + 'uploads/' + objective.mt_completions[i].objective_photo;
            }

            objective.mt_completions[i].objective_photo = objective_photo;
          }
        }

        console.log(objective);
        this.objective = objective;
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
              for (let i = 0; i < this.objective.mt_completions.length; i++) {
                if (this.objective.mt_completions[i] == obj){

                  this.objectivesProvider.deleteCompletion(obj.id).subscribe(completion => {

                      console.log(completion);

                      this.events.publish("completion:deleted", obj.objective_id);

                      console.log('EVENT completion:deleted PUBLISHED IN objective-details, objective id: ' + obj.objective_id);

                      this.events.publish("map:reload");

                      this.objective.mt_completions.splice(i, 1);

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
