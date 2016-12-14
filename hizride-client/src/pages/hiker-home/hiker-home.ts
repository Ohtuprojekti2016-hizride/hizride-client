import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController} from "ionic-angular";
import { ModeSelectPage } from '../mode-select/mode-select';
import {Platform} from 'ionic-angular';
import {Geolocation} from 'ionic-native';
import { AlertController } from 'ionic-angular';
import {ActionCableService} from "../../providers/action-cable";
import { LoadingController } from 'ionic-angular';

declare var google;



@Component({
  templateUrl: 'hiker-home.html'
})

export class HikerHomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  toValue:string;

  busStops = [];
  constructor(public platform:Platform, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public navCtrl: NavController, public actionCable: ActionCableService) {
 	  this.toValue = "";
    this.platform = platform;
    this.loadMap();
  }

  ionViewLoaded(){

  }

  loadMap() {
    console.log("ladataan platform");
    //Varmistetaan alustan valmiustila ennen googlen ominaisuuksien kutsumista.
    this.platform.ready().then(() => {
      var directionsService = new google.maps.DirectionsService();
      var directionsDisplay = new google.maps.DirectionsRenderer();

      this.actionCable.sendRole("hiker");

      Geolocation.getCurrentPosition().then((position) => {
        //Käyttäjän nykyinen positio
        let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // create the map itself
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        // get the two fields
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
        google.maps.event.addListener(autocomplete, 'place_changed', function () {

        let place = autocomplete.getPlace();
        let geometry = place.geometry;

        //Lähetetään kohde backendiin
        self.actionCable.sendDestination({"name":place.name, "lat":geometry.location.lat(), "lng":geometry.location.lng()});

        var service = new google.maps.places.PlacesService(self.map);
        directionsDisplay.setMap(self.map);


        //Googleen lähetettävä bussipysäkkien haku
        var request = {
          query: "bus station",
          location: latLng,
          radius: 50000,
          //types: ['restaurant']
        };

        //Googlelta kysyttävä reittihaku
        var routerequest = {
          origin: latLng,
          destination: place.geometry.location,
          travelMode: 'DRIVING'
        };
        //Reittihaku
        directionsService.route(routerequest, function(result, status) {
          if (status == 'OK') {

            //Piirretään reitti karttaan
            directionsDisplay.setDirections(result);

            //Tehdään reitistä backendiin lähetettävä muoto
            let polyline = result.routes["0"].overview_polyline;
            let newPolyline = new google.maps.Polyline({
              path:google.maps.geometry.encoding.decodePath(polyline)
            });
            //Haetaan lähimmät bussipysäkit
            service.textSearch(request, function(results,status){
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                  console.log(results[i]);
                  self.busStops.push(results[i]);
                }

                //Merkitään karttaan vain reitinvarrella sijaitsevat bussipysäkit
                for(let i =0;i<self.busStops.length;i++) {
                  if (google.maps.geometry.poly.isLocationOnEdge(self.busStops[i].geometry.location, newPolyline, 0.0005)) {
                    console.log("tämä pysäkki käy: " + self.busStops[i].geometry.location);
                    createMarker(self.busStops[i]);
                  }
                }
              }
            });
          }
        });
      });

      function createMarker(place) {
        new google.maps.Marker({
          map: self.map,
          position: place.geometry.location
        });
      }
    }, (err) => {
      console.log(err.message);
      console.log("hohohoho")
    });
  });
}


  addMarker() {
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<h4>Information!</h4>";

    this.addInfoWindow(marker, content);

  }

  sendPosition() {
    Geolocation.getCurrentPosition().then((position) => {
      // current location lähetetään backendiin
      var coordinates = {"lat":position.coords.latitude, "lng":position.coords.longitude};
      this.actionCable.sendCurrentLocation(coordinates);
    });

  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Searching for drivers...",
      duration: 3000
    });
    loader.present();
	
	/*if(1<2) {
      loader.dismiss();
    }*/
	
	/*let confirm = this.alertCtrl.create({
        title: 'Sijainti lähetetty. Odotetaan kyytiä.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              console.log('"OK" painettu');
            }
          }
		]
	});
	confirm.present();*/
  }


  readyForPickup() {
    this.sendPosition();
    this.presentLoading();
  }

  addInfoWindow(marker, content) {
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  goBack() {
    this.navCtrl.push(ModeSelectPage);
  }
}
