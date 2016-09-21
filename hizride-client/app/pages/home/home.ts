import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { CordovaOauth, Facebook } from "ng2-cordova-oauth/core";
import {AboutPage} from '../about/about';
import {ContactPage} from '../contact/contact';
import {ModeSelectPage} from '../mode-select/mode-select';
 
@Component({
    templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
 
    public oauth: CordovaOauth;
    private provider: Facebook;
 
    public constructor(public navCtrl: NavController, private platform: Platform) {
        this.oauth = new CordovaOauth();
        this.provider = new Facebook({
            clientId: "643028122527227",
            appScope: ["email"]
        });
    }
 
    public login() {
        this.platform.ready().then(() => {
            this.oauth.logInVia(this.provider).then((success) => {
                this.navCtrl.push(ModeSelectPage);
                alert("jee jäbä on inesä");
            }, (error) => {
                console.log(JSON.stringify(error));
            });
        });
    }



 
}