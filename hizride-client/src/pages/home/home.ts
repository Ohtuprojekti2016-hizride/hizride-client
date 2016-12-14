import { Component } from '@angular/core';
import { Auth, User } from '@ionic/cloud-angular';
import { NavController, Platform } from 'ionic-angular';
import { ModeSelectPage } from '../mode-select/mode-select';
import {ActionCableService} from "../../providers/action-cable";


@Component({
    templateUrl: 'home.html',
})
export class HomePage {


    public constructor(public navCtrl: NavController,
                       public platform: Platform,
                       public user: User,
                       public auth: Auth) {
      this.platform = platform;


    }
      //if (this.auth.isAuthenticated()) {
    //this.navCtrl.push(ModeSelectPage);
    //}


    public login() {


        this.platform.ready().then(() => {
            this.auth.login('facebook').then(() => {
            console.log(this.user.social.facebook.data.full_name);
            console.log(this.user.social.facebook.uid);
            this.navCtrl.push(ModeSelectPage);
            }, (error) => {
            console.log("error: " + error );
            });
        });
    }

  public skipLogin(){
    this.navCtrl.push(ModeSelectPage);
  }


}
