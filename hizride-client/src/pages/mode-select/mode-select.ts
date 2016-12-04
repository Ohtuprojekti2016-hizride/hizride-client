import {Component} from '@angular/core';
import {NavController} from "ionic-angular";
import {TabsPage} from "../tabs/tabs";
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'mode-select.html'
})
export class ModeSelectPage {
  constructor(public navCtrl: NavController) {
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
