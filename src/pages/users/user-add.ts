import { Component, NgZone } from '@angular/core';
import { ViewController, AlertController, ToastController } from 'ionic-angular';

import { Users } from '../../providers/users';

@Component({
  templateUrl: './user-add.html'
})
export class ModalAddUserPage {

  public user_props: { username: string, password: string, type: string };

  constructor(
    public viewCtrl: ViewController,
    public zone: NgZone,
    public toastCtrl: ToastController,
    private usersProvider: Users,
    public alertCtrl: AlertController
  ) {
    this.user_props = { username: '', password: '', type: '' };
  }

	private presentToast(text) {
	  let toast = this.toastCtrl.create({
		message: text,
		duration: 3000,
		position: 'top'
	  });
	  toast.present();
	}

  saveUser() {

    this.zone.run(() => {

    			this.usersProvider.save(this.user_props).subscribe(users => {

              console.log(users);

              this.presentToast('User saved!');
              this.dismissAddUser(users);
    			},
          err => {
            //console.log(err);
            if (err.status == 422) {
              var alert = this.alertCtrl.create({
      					title: 'Add User Error',
      					message: 'Username already in use.',
      					buttons: ['ok']
      				});

      				alert.present();
            }
          });
    });

  }

  dismissAddUser(users) {
    this.viewCtrl.dismiss(users);
  }
}
