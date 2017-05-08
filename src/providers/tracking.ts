import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { AuthService } from '../pages/login/authservice';

// Import the config module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../env-configuration/ITestAppEnvConfiguration";

/*
  Generated class for the Tracking provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Tracking {

    config: ITestAppEnvConfiguration;

    constructor(public http: Http,
                public authservice: AuthService,
                private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>) {
        console.log('Hello Tracking Provider');

        this.config = envConfiguration.getConfig();
    }


    start_session(user) {

      var data = { user_id: user.id };

    	var headers = new Headers();
    	this.authservice.loadUserCredentials();
    	//console.log(this.authservice.AuthToken);
    	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

    	return this.http.post(this.config.WS_ENDPOINT + 'tracking_sessions', data, {headers: headers}).map(res => <any[]>res.json());

    }

    end_session(session_id) {

      //var session_id = user.mt_tracking_sessions[0].id;
      var data = {};

    	var headers = new Headers();
    	this.authservice.loadUserCredentials();
    	//console.log(this.authservice.AuthToken);
    	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

    	return this.http.put(this.config.WS_ENDPOINT + 'tracking_sessions/' + session_id, data, {headers: headers}).map(res => <any[]>res.json());

    }

    track(session_id, latitude, longitude) {
      var data = {
        session_id: session_id,
        latitude: latitude,
        longitude: longitude
      };

      console.log('position tracking data in Tracking provider:');
      console.log(data);

    	var headers = new Headers();
    	this.authservice.loadUserCredentials();
    	//console.log(this.authservice.AuthToken);
    	headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

    	return this.http.post(this.config.WS_ENDPOINT + 'tracking', data, {headers: headers}).map(res => <any[]>res.json()).catch(this.handleError);

    }

    get(session_id): Observable<any> {
      var headers = new Headers();
      this.authservice.loadUserCredentials();
      //console.log(this.authservice.AuthToken);
      headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

      return this.http.get(this.config.WS_ENDPOINT + 'tracking_sessions/' + session_id, {headers: headers}).map(res => <any>res.json());

    }

    delete(session_id) {
      var headers = new Headers();
      this.authservice.loadUserCredentials();
      //console.log(this.authservice.AuthToken);
      headers.append('Authorization', 'Bearer ' + this.authservice.AuthToken);

      return this.http.delete(this.config.WS_ENDPOINT + 'tracking_sessions/' + session_id, {headers: headers}).map(res => <any>res.json());

    }

    private handleError (error: Response | any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
          const body = error.json() || '';
          const err = body.error || JSON.stringify(body);
          errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
          errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
      }
}
