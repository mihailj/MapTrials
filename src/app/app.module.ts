import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Page1 } from '../pages/page1/page1';
import { Login } from '../pages/login/login';

import { MessagesPage } from '../pages/messages/messages';
import { ModalNewMessagePage } from '../pages/messages/message-new';
import { ModalViewMessagePage } from '../pages/messages/message-view';

import { UsersPage } from '../pages/users/users';
import { ModalAddUserPage } from '../pages/users/user-add';
import { ModalViewUserPage } from '../pages/users/user-view';

import { LocationsPage } from '../pages/locations/locations';
import { ModalContentPage } from '../pages/locations/location-view';
import { ModalObjPage }  from '../pages/locations/objective-view';
import { ModalAddObjPage } from '../pages/locations/objective-add';
import { ModalObjDetailsPage } from '../pages/locations/objective-details';

import { AuthService } from '../pages/login/authservice';
import { Locations } from '../providers/locations';
import { Objectives } from '../providers/objectives';
import { Users } from '../providers/users';
import { Messages } from '../providers/messages';

import { LocationTracker } from '../providers/location-tracker';

import { TruncatePipe } from '../pipes/truncate';

// Import the config module
import { GLIonic2EnvConfigurationModule } from 'gl-ionic2-env-configuration';

@NgModule({
  declarations: [
    MyApp,
    Page1,
  	Login,
  	LocationsPage,
    MessagesPage,
    ModalNewMessagePage,
    ModalViewMessagePage,
  	ModalContentPage,
  	ModalObjPage,
    ModalAddObjPage,
    ModalObjDetailsPage,
    UsersPage,
    ModalAddUserPage,
    ModalViewUserPage,
    TruncatePipe
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    GLIonic2EnvConfigurationModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Page1,
  	Login,
  	LocationsPage,
    MessagesPage,
    ModalNewMessagePage,
    ModalViewMessagePage,
  	ModalContentPage,
  	ModalObjPage,
    ModalAddObjPage,
    ModalObjDetailsPage,
    UsersPage,
    ModalAddUserPage,
    ModalViewUserPage
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AuthService,
    LocationTracker,
    Locations,
    Objectives,
    Users,
    Messages
  ]
})
export class AppModule {}
