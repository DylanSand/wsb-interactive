import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io'
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { StorageMap } from '@ngx-pwa/local-storage';

import { AppEventService } from "../events/events.service";
import { AppEvents } from "../../models/app-event-enums/app-events";
import { IAuthToken } from "../../interface/IAuthToken";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketEndpoint extends Socket {

  public API_ENDPOINT = environment.API_ENDPOINT;
  private LOGIN_DETAILS_TOKEN:string = "piriko-auth-token";
  private authToken: IAuthToken | undefined;

  constructor(private httpClient: HttpClient,
              private _storage: StorageMap,
              private _appEvents: AppEventService) {

    super({ url: environment.SOCKET_ENDPOINT, options: {}});

    // FOR DEV MULTI-SERVER:
    //super({ url: 'http://localhost:' + (8082 + Math.floor(Math.random() * Math.floor(2))), options: {}});

    this.bind();
    this.getToken();

    this.connectSocket();
  }

  public connectSocket() {
    this.connect();
  }

  private bind() {
    this._appEvents.subscribe(AppEvents.NEW_AUTH_TOKEN, (authToken: IAuthToken) => this.authToken = authToken);
    this._appEvents.subscribe(AppEvents.REMOVE_AUTH_TOKEN, ()=> this.authToken = undefined);
  }

  public httpPost(url: string, body?: any): Observable<Object>{
    return this.httpClient.post(url, body, {
      headers: this.getHeader()
    });
  }

  public httpGET(url: string, params?: { [param: string]: string | string[] }): Observable<Object>{
    let headers = this.getHeader();
    return this.httpClient.get(url, {
      headers,
      params
    });
  }

  private getHeader(): HttpHeaders {
    if(this.authToken && this.authToken.accessToken) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + this.authToken.accessToken.token
      });
    } else {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
    }
  }

  private async getToken(): Promise<void> {
    this._storage.get(this.LOGIN_DETAILS_TOKEN).subscribe( (token: any) =>{
      if(token) {
        this.authToken = JSON.parse(token);
      }
    });
  }

}
