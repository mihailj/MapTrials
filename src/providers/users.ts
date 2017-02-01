import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { User } from '../models/user';

import { AuthService } from '../pages/login/authservice';

// Import the config module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../env-configuration/ITestAppEnvConfiguration";

/*
  Generated class for the Users provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Users {

  config: ITestAppEnvConfiguration;

  constructor(public http: Http, public authservice: AuthService, private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>) {
    console.log('Hello Users Provider');

	  this.config = envConfiguration.getConfig();
  }

  list(): Observable<User[]> {

  	var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.get(this.config.WS_ENDPOINT + 'users', {headers: headers}).map(res => <User[]>res.json());
  }

  save(data) {
  	var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.post(this.config.WS_ENDPOINT + 'users', data, {headers: headers}).map(res => <User[]>res.json());

  }

  delete(id) {
    var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.delete(this.config.WS_ENDPOINT + 'users/' + id, {headers: headers}).map(res => <User>res.json());

  }

  /*complete(data) {
  	var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.post(this.config.WS_ENDPOINT + 'completion', data, {headers: headers}).map(res => <Objective>res.json());

  }*/
}
