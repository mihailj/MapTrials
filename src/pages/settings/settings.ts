import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { Settings } from '../../providers/settings';

/*
  Generated class for the Settings page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
interface Dictionary {
    [index: string]: any;
}

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage {

    settings: Dictionary = { 'completion_range_check': 0, 'new_objectives_message': false };

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public toastCtrl: ToastController,
        private zone: NgZone,
        private settingsProvider: Settings) {

        this.loadSettings();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SettingsPage');
    }

    loadSettings() {
        this.zone.run(() => {
            this.settingsProvider.list().subscribe(settings => {
                for (var i in settings) {
                    if (settings[i].key == 'new_objectives_message') {
                        this.settings[settings[i].key] = !!settings[i].value;
                    } else {
                        this.settings[settings[i].key] = settings[i].value;
                    }
                }
            });
        });
    }

    saveSettings() {
        this.settingsProvider.save(this.settings).subscribe(settings => {
            this.presentToast('Settings saved!');
        },
            err => {
                //console.log(err);
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
}
