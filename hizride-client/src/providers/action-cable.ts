import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { User } from '@ionic/cloud-angular';

import 'actioncable';
//import {UUID} from "angular2-uuid";

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
  hikersDriver;

  constructor(
    //let uuid = Device.device.uuid
    //if(!uuid) {
      //uuid = UUID.UUID()
    //}
    public user: User
  ) {
	var self = this;
    // topin serveri:
    // this.app.cable = ActionCable.createConsumer("ws://88.192.45.214:80/cable");
    this.app.cable = ActionCable.createConsumer("ws://localhost:3000/cable");
    this.app.messagesChannel = this.app.cable.subscriptions.create({channel: "MessageChannel", user: "uuid"}, {

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
        console.log("message received")
        if (data['method'] = "driver to hiker") {
          self.hikersDriver = data['body']
        } else {
          self.hikerlist = data['body']
        }
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
      login: function(user) {
        this.perform("login", {user: user})
      },
      sendUid: function(data) {
        this.perform("set_facebook_id", {data: data})
      },
      sendRole: function(data) {
        this.perform("set_role", {data: data})
	    },
      sendDestination: function(data) {
        this.perform("set_destination", {data: data})
      },
      sendName: function(data) {
        this.perform("set_name", {data: data})
      },
      setHikerId: function(data) {
        this.perform("set_hiker_id", {data: data})
      },
	    sendHikersToDriver: function() {
		    console.log("hikers to driver")
        this.perform("send_hikers_to_driver")
      }
    });

  }

  login(user) {
    this.app.messagesChannel.login(user)
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

    let data = {lat: coordinates['lat'], lng: coordinates['lng']};
    this.app.messagesChannel.sendCurrentLocation(data)
  }

  sendUid(uid) {
    /*this.broadcaster.broadcast("uid", uid)*/
    this.app.messagesChannel.sendUid(uid)
  }

  sendRole(role) {
    /*this.broadcaster.broadcast("role", role)*/
    this.app.messagesChannel.sendRole(role)
  }

  sendName(name) {
    /*this.broadcaster.broadcast("name", name)*/
    this.app.messagesChannel.sendName(name)
  }

  sendDestination(place) {
    let data = {name: place['name'], lat: place['lat'], lng: place['lng']}
    this.app.messagesChannel.sendDestination(data)
  }

  setHikerId(fb_id) {
    this.app.messagesChannel.setHikerId(fb_id)
  }

  sendHikers() {
    this.app.messagesChannel.sendHikersToDriver()
  }



  getHikerlist(callback) {
	console.log("getHikerlist");
    callback(this.hikerlist);
  }
}
