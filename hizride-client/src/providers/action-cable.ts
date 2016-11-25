import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { User } from '@ionic/cloud-angular';

import 'actioncable';

//declare let ActionCable:any;

/*
  Generated class for the ActionCable provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ActionCableService {


  app:any = {};
  hikerlist = {};

  constructor(
    public user: User
  ) {
    this.app.cable = ActionCable.createConsumer("ws://localhost:3000/cable");
    this.app.messagesChannel = this.app.cable.subscriptions.create({channel: "MessageChannel", user: "gdg"}, {
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
      // tää datan edelleenlähettämisjuttu pitää hoitaa
        console.log(data['body'])
        var json = data['body']
        var fb = json.facebook_id
        console.log(fb)
        this.hikerlist = data['body']
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
      sendUid: function(data) {
        this.perform("set_facebook_id", {data: data})
      }
    });

  }

  updateLocation(location) {
    this.app.messagesChannel.updateLocation(location)
  }

  sendMessage(message) {
    this.app.messagesChannel.sendMessage(message)
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

  sendUid(uid) {
    /*this.broadcaster.broadcast("uid", uid)*/
    this.app.messagesChannel.sendUid(uid)
  }

  getHikerlist() {
    console.log("hikerlist");
    return this.hikerlist;
  }
}
