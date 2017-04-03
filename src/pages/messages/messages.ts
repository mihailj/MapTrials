import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, ModalController, ItemSliding, AlertController, ToastController } from 'ionic-angular';

import { AuthService } from '../login/authservice';

import { Messages } from '../../providers/messages';
import { Message } from '../../models/message';

import { ModalNewMessagePage } from './message-new';
import { ModalViewMessagePage } from './message-view';

/*
  Generated class for the Messages page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html'
})
export class MessagesPage {

  public messages_received: Message[];
  public messages_sent: Message[];
  public folder: string = "received";

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private messagesProvider: Messages,
            	public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public zone: NgZone,
              public authservice: AuthService) {}

  ionViewCanEnter(): boolean {
      if (!this.authservice.isLoggedin || !this.authservice.AuthToken) {
          return false;
      } else {
          return true;
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MessagesPage');

    this.loadMessages();
  }

  loadMessages() {
  		this.messagesProvider.list().subscribe(messages => {

        let msg_sent = [];
        let msg_received = [];

        for (var i in messages) {

          if (messages[i].user_id == this.authservice.UserId) {
        		msg_sent.push(messages[i]);
          } else {
            msg_received.push(messages[i]);
          }
        }

        this.messages_received = msg_received;
        this.messages_sent = msg_sent;

  		});
  }

  newMessageModal() {
    let modal = this.modalCtrl.create(ModalNewMessagePage);

    modal.onDidDismiss((item) => {

        if (item) {
            console.log(item);

            this.messages_sent.unshift(item);
        }

    });

    modal.present();
  }

  openMessageModal(params, slidingItem: ItemSliding) {

    if (slidingItem) {
      slidingItem.close();
    }

    let modal = this.modalCtrl.create(ModalViewMessagePage, params);

    modal.onDidDismiss((item) => {

        if (item) {
            console.log(item);

            this.messages_sent.unshift(item);
        }

    });

    modal.present();
  }


  deleteMessage(obj, folder, slidingItem: ItemSliding) {

    slidingItem.close();

    let alert = this.alertCtrl.create({
      title: 'Confirm delete message',
      message: 'Are you sure that you want to delete the selected message?',
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
              for (let i = 0; (folder == 'received')?i < this.messages_received.length:i < this.messages_sent.length; i++) {
                if (((folder == 'received') && (this.messages_received[i] == obj)) ||
                    ((folder == 'sent') && (this.messages_sent[i] == obj))) {

                  this.messagesProvider.delete(obj.id).subscribe(messages => {

                      if (folder == 'sent') {
                        this.messages_sent.splice(i, 1);
                      } else {
                        this.messages_received.splice(i, 1)
                      }

                      this.presentToast('Message deleted!');

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
