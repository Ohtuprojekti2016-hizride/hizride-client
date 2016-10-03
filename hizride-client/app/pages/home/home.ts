import { Component } from '@angular/core';
import { Auth, User } from '@ionic/cloud-angular';
import { NavController, Platform } from 'ionic-angular';
import {AboutPage} from '../about/about';
import {ContactPage} from '../contact/contact';
import {ModeSelectPage} from '../mode-select/mode-select';


@Component({
    templateUrl: 'build/pages/home/home.html',
})
export class HomePage {


    public constructor(public navCtrl: NavController, private platform: Platform, public user: User, public auth: Auth) {

    }

    public login() {
    this.platform.ready().then(() => {
        this.auth.login('facebook').then((success) => {
        console.log(this.user.social.facebook.data.full_name);
        this.navCtrl.push(ModeSelectPage);
        }, (error) => {
        console.log("error: " + error );
        });
    });
  }

  public login2() {
    this.platform.ready().then(() => {
        this.auth.login('linkedin').then((success) => {
        console.log(this.user.social.linkedin.uid);
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
