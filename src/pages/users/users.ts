import { Component, NgZone } from '@angular/core';
import { AlertController, ModalController, NavController, NavParams, ToastController } from 'ionic-angular';

import { AuthService } from '../login/authservice';

import { Users } from '../../providers/users';

import { User } from '../../models/user';

import { ModalAddUserPage } from './user-add';
/*
  Generated class for the Users page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-users',
  templateUrl: 'users.html'
})
export class UsersPage {

  users: User[];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public authservice: AuthService,
              private usersProvider: Users,
            	public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public zone: NgZone,
              public toastCtrl: ToastController
            ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad UsersPage');

    this.loadUsers();
  }

  ionViewCanEnter(): boolean {
      // here we can either return true or false
      // depending on if we want to leave this view
      if (!this.authservice.isLoggedin || !this.authservice.AuthToken || (this.authservice.AuthScope != 'admin')) {
        return false;
      } else {
        return true;
      }
  }

  loadUsers() {

    		this.usersProvider.list().subscribe(users => {

    			this.users = users;

          console.log(users);

    		});
  }


  addUserModal() {
    let modal = this.modalCtrl.create(ModalAddUserPage);

    modal.onDidDismiss((item) => {

        if (item) {
            //this.saveItem(item);
            console.log(item);

            this.users.push(item);
        }

    });

    modal.present();
  }

  deleteUser(obj) {
    //console.log('delete ojective');
    //console.log(obj);

    let alert = this.alertCtrl.create({
      title: 'Confirm delete user',
      message: 'Are you sure that you want to delete the selected user?',
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
              for (let i = 0; i < this.users.length; i++) {
                if (this.users[i] == obj){


                  this.usersProvider.delete(obj.id).subscribe(users => {

                      console.log(users);

                      this.users.splice(i, 1);

                      this.presentToast('User deleted!');

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
}
