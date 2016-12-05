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
                       public auth: Auth,
                       public actionCable:ActionCableService) {
      this.platform = platform;
    }

    public login() {


        this.platform.ready().then(() => {
            this.auth.login('facebook').then(() => {
            console.log(this.user.social.facebook.data.full_name);
            this.actionCable.sendUid(this.user.social.facebook.uid);
        //    this.actionCable.sendName(this.user.social.facebook.data.full_name);
            console.log(this.user.social.facebook.uid);
            this.navCtrl.push(ModeSelectPage);
            }, (error) => {
            console.log("error: " + error );
            });
        });
    }

  public skipLogin(){
    this.actionCable.sendMessage("Skipped login, sending message");
    this.actionCable.sendUid("kirjautumaton");
    this.navCtrl.push(ModeSelectPage);
  }


}
