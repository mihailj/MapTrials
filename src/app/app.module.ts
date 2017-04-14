import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject } from '@ionic-native/push';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';

import { MyApp } from './app.component';
import { Page1 } from '../pages/page1/page1';
import { Login } from '../pages/login/login';

import { MessagesPage } from '../pages/messages/messages';
import { ModalNewMessagePage } from '../pages/messages/message-new';
import { ModalViewMessagePage } from '../pages/messages/message-view';

import { UsersPage } from '../pages/users/users';
import { ModalAddUserPage } from '../pages/users/user-add';
import { ModalViewUserPage } from '../pages/users/user-view';

import { SettingsPage } from '../pages/settings/settings';

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
import { Settings } from '../providers/settings';

import { LocationTracker } from '../providers/location-tracker';

import { TruncatePipe } from '../pipes/truncate';

import { CustomButton } from '../components/custom-button/custom-button';

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
    SettingsPage,
    TruncatePipe,
    CustomButton
  ],
  imports: [
    BrowserModule,
    HttpModule,
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
    ModalViewUserPage,
    SettingsPage
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AuthService,
    BackgroundGeolocation,
    StatusBar,
    SplashScreen,
    Geolocation,
    Push,
    Camera,
    File,
    Transfer,
    FilePath,
    LocationTracker,
    Locations,
    Objectives,
    Users,
    Messages,
    Settings
  ]
})
export class AppModule {}
