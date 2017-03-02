import { Component, NgZone } from '@angular/core';
import { NavParams, ViewController, AlertController, ToastController } from 'ionic-angular';

import { AuthService } from '../login/authservice';

import { Messages } from '../../providers/messages';
//import { Users } from '../../providers/users';

import { Message } from '../../models/message';


@Component({
  templateUrl: './message-view.html'
})
export class ModalViewMessagePage {

  //public message: { to: string[], subject: string, body: string };
  //public users: User[];
  message: Message;
  isReply: boolean = false;
  reply: Message = {};

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public zone: NgZone,
    public toastCtrl: ToastController,
    private messagesProvider: Messages,
    //private usersProvider: Users,
    public alertCtrl: AlertController,
    public authservice: AuthService
  ) {
    this.message = this.params.get('msg');
    console.log(this.message);
    this.isReply = this.params.get('reply');
    console.log(this.isReply);

    this.reply.subject = 'Re: ' + this.message.subject;
    this.reply.body = '';

    //this.loadUsers();
    //this.message = { to: [], subject: '', body: '' };
  }


  /*loadUsers() {
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
  }*/

	private presentToast(text) {
	  let toast = this.toastCtrl.create({
		message: text,
		duration: 3000,
		position: 'top'
	  });
	  toast.present();
	}

  replyMessage() {
    this.zone.run(() => {

          this.reply.type = 'single';
          this.reply.user_id = this.authservice.UserId;
          this.reply.to = [ this.message.user_id.toString() ];
          this.reply.reply_to = this.message.id;

          console.log('reply message:');
          console.log(this.reply);

    			this.messagesProvider.save(this.reply).subscribe(messages => {

              console.log(messages);

              this.presentToast('Message sent!');
              this.dismissViewMessage(messages);
    			},
          err => {
            //console.log(err);
            /*if (err.status == 422) {
              var alert = this.alertCtrl.create({
      					title: 'Add User Error',
      					message: 'Username already in use.',
      					buttons: ['ok']
      				});

      				alert.present();
            }*/
          });
    });

  }

  dismissViewMessage(message) {
    this.viewCtrl.dismiss(message);
  }
}
