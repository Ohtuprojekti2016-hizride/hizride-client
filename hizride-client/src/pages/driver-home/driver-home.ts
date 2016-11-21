import {Component, ViewChild, ElementRef} from '@angular/core';
import { User } from '@ionic/cloud-angular';
import { Platform } from 'ionic-angular';
import {Geolocation} from 'ionic-native';
import { AlertController } from 'ionic-angular';
import {ActionCableService} from "../../providers/action-cable";

declare var google;



@Component({
  templateUrl: 'driver-home.html'
})

export class DriverHomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  toValue:string;


  public constructor(public platform: Platform,
                     public alertCtrl: AlertController,
                     public user: User,
                     public actionCable: ActionCableService) {
    this.toValue = "";
    this.platform = platform;
  }

  ionViewDidLoad() {
    this.loadMap();
  }

  loadMap() {
    var self = this;
    console.log("0");

    this.platform.ready().then(() => {
      var directionsService = new google.maps.DirectionsService();
      var directionsDisplay = new google.maps.DirectionsRenderer();

      Geolocation.getCurrentPosition({timeout: 30000, enableHighAccuracy: false}).then((position) => {

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      // current location lähetetään backendiin
      var coordinates = {"lat":position.coords.latitude, "lng":position.coords.longitude};
      this.actionCable.sendCurrentLocation(coordinates);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

        // create the map itself
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        directionsDisplay.setMap(this.map);

        // get he two fields
        let input_to = (<HTMLInputElement>document.getElementById("journey_to"));

        // set the autocomplete options
        let autocompleteOptions = {
          types: [],
          componentRestrictions: {country: "fi"}
        };

        // create the two autocompletes on the from and to fields
        let autocomplete = new google.maps.places.Autocomplete(input_to, autocompleteOptions);

        // we need to save a reference to this as we lose it in the callbacks
        let self = this;

        // add the first listener
        // TODO

        // add the second listener
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          let place = autocomplete.getPlace();
          let geometry = place.geometry;
          self.map.setCenter({ lat: -33.8688, lng: 151.2195 });

          var bounds = new google.maps.LatLngBounds();

          if ((geometry) !== undefined) {

            console.log(place.name);
            console.log(geometry.location.lng());
            console.log(geometry.location.lat());

            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };


            let marker = new google.maps.Marker({
              map: self.map,
              icon: icon,
              title: place.name,
              animation: google.maps.Animation.DROP,
              position: place.geometry.location,
            });

            /*if (place.geometry.viewport) {
             bounds.union(place.geometry.viewport);
             } else {
             bounds.extend(place.geometry.location);
             }
             */

            var request = {
              origin: latLng,
              destination: place.geometry.location,
              travelMode: 'DRIVING'
            };

            directionsService.route(request, function(result, status) {
              if (status == 'OK') {
                directionsDisplay.setDirections(result);

                let polyline = result.routes["0"].overview_polyline;
                let newPolyline = new google.maps.Polyline({
                  path:google.maps.geometry.encoding.decodePath(polyline)
                });

                // lähetetään polyline serverille:
                self.actionCable.sendRoute(polyline);

                let ghost = new google.maps.LatLng(60.203952, 24.972553); // Lontoonkadun haamu

                if (google.maps.geometry.poly.isLocationOnEdge(ghost, newPolyline, 0.0001)) {
                  alert("Huu!");
                }

              }
            });

            //self.map.fitBounds(bounds);
          }
        });

      }, (err) => {
        console.log(err);
      });
    });
  }

  addMarker(){

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<h4>Information!</h4>";

    this.addInfoWindow(marker, content);

  }

  addInfoWindow(marker, content){

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }


  showConfirm() {
    var name = this.user.social.facebook.data.full_name;
    var pic = this.user.social.facebook.data.profile_picture;
    console.log(pic);
    let confirm = this.alertCtrl.create({
      title: 'Liftari lähellä!',
      message: 'Haluatko ottaa tämän henkilön kyytiin? ' + name + '<br><img src="' + pic + '" alt="profiilikuva">',
      buttons: [
        {
          text: 'Ei',
          handler: () => {
            console.log('"Ei" painettu');
          }
        },
        {
          text: 'Kyllä',
          handler: () => {
            console.log('"Kyllä" painettu');
          }
        }
      ]
    });
    confirm.present();
  }

}
