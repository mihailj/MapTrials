import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/map';

import { Setting } from '../models/setting';

import { AuthService } from '../pages/login/authservice';

// Import the config module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../env-configuration/ITestAppEnvConfiguration";

/*
  Generated class for the Settings provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Settings {

  config: ITestAppEnvConfiguration;

  constructor(public http: Http,
              public authservice: AuthService,
              private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>) {
    console.log('Hello Settings Provider');
    this.config = envConfiguration.getConfig();

  }

  list(): Observable<Setting[]> {
	    var headers = new Headers();
      this.authservice.loadUserCredentials();
      //console.log(this.authservice.AuthToken);
      headers.append('Authorization', 'Bearer ' +this.authservice.AuthToken);

      return this.http.get(this.config.WS_ENDPOINT + 'settings', {headers: headers}).map(res => <Setting[]>res.json());
  }

  save(data) {
  	var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.post(this.config.WS_ENDPOINT + 'settings', data, {headers: headers}).map(res => <Setting[]>res.json());

  }
}
