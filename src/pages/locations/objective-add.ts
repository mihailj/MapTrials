import { Component } from '@angular/core';
import { NavParams, Platform, ViewController, ToastController, LoadingController, Loading, Events } from 'ionic-angular';

import { Objectives } from '../../providers/objectives';

import { NgZone } from '@angular/core';

declare var google;

declare var cordova: any;

@Component({
  templateUrl: './objective-add.html'
})
export class ModalAddObjPage {
  objective;

  location_id: number;

  loading: Loading;

  public title: string;
  public score: number;
  public multiple: string;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public zone: NgZone,
  	public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public objectivesProvider: Objectives,
    public events: Events
  ) {
	console.log('location id: ' + this.params.get('location').id);
    this.location_id = this.params.get('location').id;
  }

	private presentToast(text) {
	  let toast = this.toastCtrl.create({
		message: text,
		duration: 3000,
		position: 'top'
	  });
	  toast.present();
	}

  saveObjective() {

    let datt = {
    			location_id: this.location_id,
          title: this.title,
          score: this.score,
          multiple: this.multiple
    };

    console.log('datt');
    console.log(datt);

    this.zone.run(() => {

    			this.objectivesProvider.save(datt).subscribe(objectives => {

              console.log('modal add obj on provider save:');
              console.log(objectives);

              this.events.publish('map:reload');

              this.presentToast('Objective saved!');
              this.dismissAddObjective(objectives);
    			});
    });

  }

  dismissAddObjective(objectives) {
    this.viewCtrl.dismiss(objectives);
  }
}
