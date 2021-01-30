
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from "@angular/forms";
//import { NavController, LoadingController, Loading } from 'ionic-angular';

import { AppEventService } from "../../services/events/events.service";
import { AppEvents } from '../../models/app-event-enums/app-events';
import { ProfileManager } from "../../services/profile.manager";
import { LoginDetails } from "../../models/account/LoginDetails";
import { AccountManager } from "../../services/account-manager/account-manager";
import { EventManager } from "../../services/event.manager";
//import { CreateProfilePage } from "../create-profile/create-profile";
//import { SignupPage } from '../signup/signup';
//import { UiPopupProvider } from "../../services/ui-popup";
//import { VerifyAccountPage } from "../verify-account/verify-account";
//import { ForgetPasswordPage } from "../forget-password/forget-password";
//import { VirtualPage } from "../virtual/virtual";


@Component({
  selector: 'app-login',
  templateUrl: 'login.html',
  styleUrls: ['login.scss']
})
export class LoginPage implements OnInit {

  // @ts-ignore
  public loginDetails: LoginDetails;
  private _isLoggedIn:boolean;
  private _loadHomepage: () => void;
  private _loginResultHandler: (data:any) => void;

  public usernameInvalid = false;
  public passwordInvalid = false;
  public formSubmission = false;
  public errorMessage: string;

  constructor(private _ionicEvents: AppEventService,
              private _eventManager: EventManager,
              private _accountManager: AccountManager,
              private _profileManager: ProfileManager,
              private router: Router,
              private route: ActivatedRoute) {
    console.log('-------------------------------');

    console.log('login loading......')
  }

  ngOnInit(): void {
    this.setup();
    this.bind();
  }

  ionViewDidLeave() {
    this.unbind();
  }

  setup() {
    let that = this;
    this._loadHomepage = () => {
      this.formSubmission = false;
      if (that._profileManager.ready && that._eventManager.ready && !that._isLoggedIn) {
        that._isLoggedIn = true;
        this.formSubmission = false;
        console.log('..... logged in ......');
        //Todo (iamjonatan) route to home
        //that.navCtrl.setRoot(VirtualPage);
        that.router.navigate(['/#']);
      }
    };

    this._loginResultHandler = (
      data:{ isLoggedIn: boolean, user: { id: string; email: string; username: string; hasProfile: boolean; }, error:any }) =>{
      this.formSubmission = false;
      if(data.isLoggedIn === true) {
        if(data.user && data.user.hasProfile === false) {
          //this.navCtrl.push(CreateProfilePage, data.user);
        } else {
          this._loadHomepage();
        }
      } else  {
        let err = data.error;

        switch (err.code) {
          case 'UserNotConfirmedException':
            //if(err.userId) this.navCtrl.push(VerifyAccountPage, { userId: err.userId, nextpage: 'login' });
            break;
          case 'InvalidInputDataException':
          case 'InvalidLoginDetailsException':
            if(err.message) this.errorMessage = err.message;
            break;
        }
      }
    };
  }

  login(loginForm: NgForm) {
    console.log('..... about to login ......');
    if(this.isValidInput(loginForm)) {
      console.log('..... passed input check, logging in ......');
      this.formSubmission = true;
      this._accountManager.login({
        username: loginForm.value.username.trim().toLocaleLowerCase(),
        password: loginForm.value.password
      }, true);
    }
  }

  isValidInput(loginForm: NgForm):boolean {
    this.usernameInvalid = loginForm.value.username.trim() == ''
    this.passwordInvalid = loginForm.value.password.length == 0;
    return !this.usernameInvalid && !this.passwordInvalid;
  }

  private bind() {
    this._ionicEvents.subscribe(AppEvents.USER_LOGIN_RESULT, this._loginResultHandler);
    this._ionicEvents.subscribe(AppEvents.CURRENT_PROFILE_UPDATED, this._loadHomepage);
    this._ionicEvents.subscribe(AppEvents.EVENTS_UPDATED, this._loadHomepage);
  }

  private unbind() {
    this._ionicEvents.unsubscribe(AppEvents.USER_LOGIN_RESULT, this._loginResultHandler);
    this._ionicEvents.unsubscribe(AppEvents.CURRENT_PROFILE_UPDATED, this._loadHomepage);
  }

}
