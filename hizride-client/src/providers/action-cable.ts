import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import 'actioncable-js';

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
        this.perform("message", {message:data})
      },
      updateLocation(location) {
        this.perform("setUserLocation", {location: location})
      }
    });

  }

  updateLocation(location) {
    this.app.messagesChannel.updateLocation(location)
  }

  sendMessage(message) {
    this.app.messagesChannel.sendMessage(message)
  }

}
