import {Component} from '@angular/core';
import {HomePage} from '../home/home';
import {AboutPage} from '../about/about';
import {ContactPage} from '../contact/contact';
import {NavParams} from "ionic-angular";
import {DriverHomePage} from "../driver-home/driver-home";
import {HikerHomePage} from "../hiker-home/hiker-home";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  public tab1Root: any;
  public tab2Root: any;
  public tab3Root: any;

  constructor(public params: NavParams) {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    console.log('Home page is now: ' + this.params.get('rootPage'));
    if(this.params.get('rootPage') == 'driver-home') {
      this.tab1Root = DriverHomePage;
    } else if(this.params.get('rootPage') == 'hiker-home') {
      this.tab1Root = HikerHomePage;
    } else {
      this.tab1Root = HomePage;
    }
    this.tab2Root = AboutPage;
    this.tab3Root = ContactPage;
  }
}
