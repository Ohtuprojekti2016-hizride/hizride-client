import {Component} from '@angular/core';
import {NavController} from "ionic-angular";
import {DriverHome} from "../driver-home/driver-home";
import {HikerHome} from "../hiker-home/hiker-home";

@Component({
  templateUrl: 'build/pages/mode-select/mode-select.html'
})
export class ModeSelectPage {
  constructor(private navCtrl: NavController) {
  }

  chooseDriver() {
    //this.navCtrl.push(DriverHome);
    this.navCtrl.setRoot(DriverHome);
  }

  chooseHiker(){
    this.navCtrl.setRoot(HikerHome);
  }
}
