import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Ng2Cable, Broadcaster } from 'ng2-cable/js/index';

import 'actioncable-js';
import {map} from "rxjs/operator/map";

declare let ActionCable:any;

/*
  Generated class for the ActionCable provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ActionCableService {


  app:any = {};
  constructor(
    /*public ng2cable: Ng2Cable,
    public broadcaster: Broadcaster*/
  ) {

    this.app.cable = ActionCable.createConsumer("ws://localhost:3000/cable");
    this.app.messagesChannel = this.app.cable.subscriptions.create({channel: "MessageChannel", user: "user123"}, {
      connected: function() {
        console.log("connected", this.identifier)
      },
      disconnected: function() {
        console.log("disconnected", this.identifier)
      },
      rejected: function() {
        console.log("rejected")
      },
      received: function(data) {
        console.log(data)
      },
      sendMessage: function(data) {
        this.perform("message", {data: data})
      },
      sendRoute: function(data) {
        this.perform("set_route", {data: data})
      },
      sendCurrentLocation: function(data) {
        this.perform("set_current_location", {data: data})
      },
      sendUserInfo: function(data) {
        this.perform("set_user", {data: data})
      }
    });

    /*this.ng2cable.subscribe('http://localhost:3000/cable', 'MessageChannel');

    this.broadcaster.on<string>('MessageChannel').subscribe(
      message => {
        console.log(message);
      }
    );*/

  }

  updateLocation(location) {
    /*this.broadcaster.broadcast("location", location)*/
  }

  sendMessage(message) {
    /*this.broadcaster.broadcast("message", message)*/
    this.app.messagesChannel.sendMessage(message)
  }

  sendUserInfo(data) {
    /*this.broadcaster.broadcast("data", data)*/
    this.app.messagesChannel.sendUserInfo(data)
  }

  sendRoute(route) {
    /*this.broadcaster.broadcast("route", route)*/
    this.app.messagesChannel.sendRoute(route)
  }

  sendCurrentLocation(coordinates) {
    /*this.broadcaster.broadcast("lat", lat)*/

    var data = {lat:coordinates['lat'], lng:coordinates['lng']};
    this.app.messagesChannel.sendCurrentLocation(data)
  }
}
