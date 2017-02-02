import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Objective } from '../models/objective';
import { Completion } from '../models/completion';

import { AuthService } from '../pages/login/authservice';

// Import the config module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../env-configuration/ITestAppEnvConfiguration";

/*
  Generated class for the Objectives provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Objectives {

  config: ITestAppEnvConfiguration;

  constructor(public http: Http,
              public authservice: AuthService,
              private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>) {
    console.log('Hello Objectives Provider');

	  this.config = envConfiguration.getConfig();
  }

  list(): Observable<Objective[]> {

  	var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.get(this.config.WS_ENDPOINT + 'objectives', {headers: headers}).map(res => <Objective[]>res.json());
  }

  get(objective_id): Observable<Objective> {

  	var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.get(this.config.WS_ENDPOINT + 'objectives/' + objective_id, {headers: headers}).map(res => <Objective>res.json());
  }

  save(data) {
  	var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.post(this.config.WS_ENDPOINT + 'objectives', data, {headers: headers}).map(res => <Objective[]>res.json());

  }

  delete(id) {
    var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.delete(this.config.WS_ENDPOINT + 'objectives/' + id, {headers: headers}).map(res => <Objective>res.json());

  }

  complete(data) {
  	var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.post(this.config.WS_ENDPOINT + 'completion', data, {headers: headers}).map(res => <Objective>res.json());

  }

  deleteCompletion(id) {
    var headers = new Headers();
  	this.authservice.loadUserCredentials();
  	console.log(this.authservice.AuthToken);
  	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

  	return this.http.delete(this.config.WS_ENDPOINT + 'completion/' + id, {headers: headers}).map(res => <Completion>res.json());

  }
}
