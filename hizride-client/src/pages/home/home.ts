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

    }

    public login() {


        this.platform.ready().then(() => {
            this.auth.login('facebook').then(() => {
            console.log(this.user.social.facebook.data.full_name);
            this.navCtrl.push(ModeSelectPage);
            }, (error) => {
            console.log("error: " + error );
            });
        });
    }

  public login2() {

        this.platform.ready().then(() => {
            this.auth.login('linkedin').then(() => {
            console.log(this.user.social.linkedin.uid);
            this.navCtrl.push(ModeSelectPage);
            }, (error) => {
            console.log("error: " + error );
            });
        });
    }

  public login3() {

        this.platform.ready().then(() => {
            this.auth.login('github').then(() => {
            console.log(this.user.social.github.uid);
            this.navCtrl.push(ModeSelectPage);
            }, (error) => {
            console.log("error: " + error );
            });
        });
    }

  public skipLogin(){
    this.actionCable.sendMessage("Skipped login, sending message");
    this.navCtrl.push(ModeSelectPage);
  }




}
