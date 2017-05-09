import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {WebSocketService} from './web-socket-service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import { EnvConfigurationProvider } from "gl-ionic2-env-configuration";
import { ITestAppEnvConfiguration } from "../env-configuration/ITestAppEnvConfiguration";

//const TRACKING_URL = 'ws://192.168.166.166:3005';
const DATA_URL = 'ws://localhost:3006';

export interface TrackingData {
	/*author: string,
	message: string,
	newDate?: string*/
  user_id: number,
  latitude: number,
  longitude: number
}

/*import { Http } from '@angular/http';
import 'rxjs/add/operator/map';*/

/*
  Generated class for the Real Time Tracking Service provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class RTTService {

	config: ITestAppEnvConfiguration;

  public tracking_data: Subject<TrackingData>  = new Subject<TrackingData>();
	public randomData: Subject<number> = new Subject<number>();

	constructor(private wsService: WebSocketService,
							private envConfiguration: EnvConfigurationProvider<ITestAppEnvConfiguration>) {

    console.log('Hello RTTService Provider');

		this.config = envConfiguration.getConfig();

		// 1. subscribe to chatbox
		this.tracking_data   = <Subject<TrackingData>>this.wsService
			.connect(this.config.TRACKING_URL)
			.map((response: MessageEvent): TrackingData => {
				let data = JSON.parse(response.data);
        console.log('tracking data:');
        console.log(response.data);
				return {
					/*author : data.author,
					message: data.message,
					newDate: data.newDate*/

          user_id: data.user_id,
          latitude: data.latitude,
          longitude: data.longitude
				}
			});


		// 2. subscribe to random data
		/*this.randomData = <Subject<number>>this.wsService
			.connectData(DATA_URL)
			.map((response: any): number => {
				return response.data;
			})*/
	}
}
