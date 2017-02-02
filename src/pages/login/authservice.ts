import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { MenuController } from 'ionic-angular';

import 'rxjs/add/operator/map';

import { User } from '../../models/user';

// Import the module
import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";

// Import your configuration typings
// You can specify a typing for your configuration to get nice and neat autocompletion
import { ITestAppEnvConfiguration } from "../../env-configuration/ITestAppEnvConfiguration";

@Injectable()
export class AuthService {

    isLoggedin: boolean = false;
    AuthToken; AuthScope; UserId;
    UserInfo: User;
    config: ITestAppEnvConfiguration;

    constructor(public http: Http,
                private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>,
                public menuCtrl: MenuController) {
        this.http = http;
        this.isLoggedin = false;
        this.AuthToken = null;
      	this.AuthScope = null;
        this.UserId = null;

      	this.config = envConfiguration.getConfig();

      	console.log(this.config);
    }

    storeUserCredentials(token, scope, user_id) {
        window.localStorage.setItem('user_credentials', token);
        //this.useCredentials(token);
        window.localStorage.setItem('user_scope', scope);

        window.localStorage.setItem('user_id', user_id);

        this.useCredentials(token, scope, user_id);
    }

    useCredentials(token, scope, user_id) {
        this.isLoggedin = true;
        this.AuthToken = token;
		    this.AuthScope = scope;
        this.UserId = user_id;
    }

    loadUserCredentials() {
        var token = window.localStorage.getItem('user_credentials');
        var scope = window.localStorage.getItem('user_scope');
        var user_id = window.localStorage.getItem('user_id');
        this.useCredentials(token, scope, user_id);
    }

    destroyUserCredentials() {
        this.isLoggedin = false;
        this.AuthToken = null;
		    this.AuthScope = null;
        this.UserId = null;
        window.localStorage.clear();
    }

    authenticate(user): any {
        var creds = "grant_type=password&username=" + user.name + "&password=" + user.password + "&scope=" + user.user_type;
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

    		if (user.user_type == 'user') {
    			headers.append('Authorization', 'Basic dXNlcjp1c2Vy');
    		} else {
    			headers.append('Authorization', 'Basic ZGVtb2NsaWVudDpkZW1vY2xpZW50c2VjcmV0');
    		}

        return new Promise(resolve => {
            this.http.post(this.config.WS_ENDPOINT + 'oauth/token', creds, {headers: headers}).subscribe(data => {
				        console.log(data);
                if (data.json().access_token){
                    this.storeUserCredentials(data.json().access_token, data.json().scope, data.json().user.id);

                    resolve(data.json());
                }
                else {
                    console.log('user authenticate promise resolve false:');
							//console.log(data);

                    resolve(data.json());
				        }
            }, err => {

										console.log('user authenticate promise subscribe err:');
										console.log(err);
                    resolve(err);
			      });
        });
    }
    /*adduser(user) {
        var creds = "name=" + user.name + "&password=" + user.password;
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        return new Promise(resolve => {
            this.http.post('http://localhost:3333/adduser', creds, {headers: headers}).subscribe(data => {
                if(data.json().success){
                    resolve(true);
                }
                else
                    resolve(false);
            });
        });
    }*/

    getinfo() {
	    var headers = new Headers();
        this.loadUserCredentials();
        console.log(this.AuthToken);
        headers.append('Authorization', 'Bearer ' + this.AuthToken);

        return new Promise(resolve => {
          this.http.get(this.config.WS_ENDPOINT + 'users/' + this.UserId, {headers: headers}).subscribe(data => {
            console.log('authservice getinfo data:');
            console.log(data);
            if (data.json()) {
              this.setUserInfo(data.json());
              resolve(true);
            } else {
              resolve(false);
            }
          });
        });
    }

    setUserInfo(data) {
      this.UserInfo = data;
    }

    logout() {
        this.destroyUserCredentials();
    }
}
