import { Component, NgZone } from '@angular/core';
import { AlertController, ModalController, NavController, NavParams, ItemSliding, ToastController, Events } from 'ionic-angular';

import { AuthService } from '../login/authservice';

import { Users } from '../../providers/users';
import { Tracking } from '../../providers/tracking';

import { User } from '../../models/user';

import { ModalAddUserPage } from './user-add';
import { ModalViewUserPage } from './user-view';
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
        private trackingProvider: Tracking,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        public zone: NgZone,
        public toastCtrl: ToastController,
        public events: Events
    ) { }

    ionViewDidLoad() {
        console.log('ionViewDidLoad UsersPage');

        this.loadUsers();
        this.listenToDeletedCompletionEventUsers();
        this.listenToReloadUsersEvent();
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

            for (let i in users) {
                if (users[i].mt_tracking_sessions && (users[i].mt_tracking_sessions.length > 0) && (users[i].mt_tracking_sessions[0].date_end == null)) {
                    users[i].isTracking = true;
                } else {
                    users[i].isTracking = false;
                }
            }

            this.users = users;

            console.log(users);

        });
    }

    listenToDeletedCompletionEventUsers() {
        this.events.subscribe('completion:deleted', (objective_id) => {

            //console.log('EVENT completion:deleted RECEIVED IN users, objective id: ' + objective_id);

            this.zone.run(() => {
                this.loadUsers();
            });

        });
    }

    listenToReloadUsersEvent() {
      this.events.subscribe('users:reload', () => {
          console.log('EVENT users:reload received in users page');
          this.zone.run(() => {
              this.loadUsers();
          });
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

    deleteUser(obj, i) {

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

                            this.usersProvider.delete(obj.id).subscribe(users => {

                                console.log(users);

                                this.users.splice(i, 1);

                                this.presentToast('User deleted!');

                            });

                        });


                    }
                }
            ]
        });

        alert.present();
    }

    openUserModal(obj) {
        let modal = this.modalCtrl.create(ModalViewUserPage, obj);
        modal.present();
    }

    startTrackUser(user, i, slidingItem: ItemSliding) {

      if (slidingItem) {
        slidingItem.close();
      }

        this.trackingProvider.start_session(user).subscribe(sess => {

            console.log(sess);

            this.users[i].isTracking = true;
            this.users[i].mt_tracking_sessions = [sess];

            this.presentToast('User tracking started!');

        });
    }

    stopTrackUser(user, i, slidingItem: ItemSliding) {

      if (slidingItem) {
        slidingItem.close();
      }

        console.log(user);

        this.trackingProvider.end_session(user.mt_tracking_sessions[0].id).subscribe(sess => {

            console.log(sess);

            this.users[i].isTracking = false;
            this.users[i].mt_tracking_sessions = [];

            this.presentToast('User tracking stopped!');

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
