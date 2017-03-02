import { Component, NgZone } from '@angular/core';
import { ViewController, AlertController, ToastController } from 'ionic-angular';

import { AuthService } from '../login/authservice';

import { Messages } from '../../providers/messages';
import { Users } from '../../providers/users';

import { User } from '../../models/user';


@Component({
  templateUrl: './message-new.html'
})
export class ModalNewMessagePage {

  public message: { to: string[], subject: string, body: string };
  public users: User[];

  constructor(
    public viewCtrl: ViewController,
    public zone: NgZone,
    public toastCtrl: ToastController,
    private messagesProvider: Messages,
    private usersProvider: Users,
    public alertCtrl: AlertController,
    public authservice: AuthService
  ) {
    this.loadUsers();
    this.message = { to: [], subject: '', body: '' };
  }


  loadUsers() {
		this.usersProvider.list().subscribe(users => {

      for (let i = 0; i < users.length; i++) {
        if (users[i].id == this.authservice.UserId) {
          users.splice(i, 1);
          break;
        }
      }

			this.users = users;
      //console.log(users);
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

  sendMessage() {

    this.zone.run(() => {
          console.log('new message:');
          console.log(this.message);

          // select all users as recipients
          if (this.message.to.indexOf('0') > -1) {
            let arr = [];
            for (let i = 0; i < this.users.length; i++) {
              arr.push(this.users[i].id.toString());
            }

            this.message.to = arr;
          }

    			this.messagesProvider.save(this.message).subscribe(messages => {

              console.log(messages);

              this.presentToast('Message sent!');
              this.dismissNewMessage(messages);
    			},
          err => {
            //console.log(err);
          });
    });

  }

  onChange(to) {
    console.log(to);

    if (to.indexOf('0') > -1) {
      let arr = [];
      for (let i = 0; i < this.users.length; i++) {
        arr.push(this.users[i].id.toString());
      }

      this.message.to = arr;
    }

  }

  dismissNewMessage(messages) {
    this.viewCtrl.dismiss(messages);
  }
}
