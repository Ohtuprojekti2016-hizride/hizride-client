import {Component} from '@angular/core';
import {NavController} from "ionic-angular";
import {TabsPage} from "../tabs/tabs";
import { HomePage } from '../home/home';
import {ActionCableService} from "../../providers/action-cable";
import {User} from "@ionic/cloud-angular";

@Component({
  templateUrl: 'mode-select.html'
})
export class ModeSelectPage {
  constructor(public navCtrl: NavController, public actionCable: ActionCableService, public user:User) {

    if(typeof this.user.social.facebook !== "undefined") {
      this.actionCable.sendUid(this.user.social.facebook.uid);
      this.actionCable.sendName(this.user.social.facebook.data.full_name);
    } else {
      this.actionCable.sendMessage("Skipped login, sending message");
      this.actionCable.sendUid("kirjautumaton");
    }
  }

  chooseDriver() {
    this.navCtrl.setRoot(TabsPage, {rootPage:"driver-home"})
  }

  chooseHiker(){
    this.navCtrl.setRoot(TabsPage, {rootPage:"hiker-home"})
  }

  goBack() {
  this.navCtrl.push(HomePage);
  }
}
