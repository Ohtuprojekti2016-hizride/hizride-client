import {Component, ViewChild, ElementRef} from '@angular/core';
import {Platform} from 'ionic-angular';
import {Geolocation} from 'ionic-native';
import {ActionCableService} from "../../providers/action-cable";

declare var google;



@Component({
  templateUrl: 'hiker-home.html'
})

export class HikerHomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  toValue:string;

  busStops = [];
 constructor(public platform:Platform, public actionCable: ActionCableService) {
    console.log("constructor");
 	this.toValue = "";
    this.platform = platform;
    this.loadMap();
  }

  ionViewLoaded(){
    console.log("sioadgjri");
}

  loadMap() {
    console.log("ladataan platform");
    this.platform.ready().then(() => {
      console.log("platform ready.");
      var directionsService = new google.maps.DirectionsService();
      var directionsDisplay = new google.maps.DirectionsRenderer();

      Geolocation.getCurrentPosition({timeout: 30000, enableHighAccuracy: false}).then((position) => {

        console.log("lets go");
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

          var service = new google.maps.places.PlacesService(self.map);
          directionsDisplay.setMap(self.map);

          var request = {
            query: "bus station",
            location: latLng,
            radius: 50000,
            //types: ['restaurant']
          };
          var routerequest = {
            origin: latLng,
            destination: place.geometry.location,
            travelMode: 'DRIVING'
          };

          directionsService.route(routerequest, function(result, status) {
            if (status == 'OK') {
              directionsDisplay.setDirections(result);
              let polyline = result.routes["0"].overview_polyline;
              let newPolyline = new google.maps.Polyline({
                path:google.maps.geometry.encoding.decodePath(polyline)
              });

              let ghost = new google.maps.LatLng(60.203952, 24.972553); // Lontoonkadun haamu
              service.textSearch(request, function(results,status){
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                  for (var i = 0; i < results.length; i++) {
                    console.log(results[i]);
                    self.busStops.push(results[i]);
                  }

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
  sendPosition(){
    Geolocation.getCurrentPosition({timeout: 30000, enableHighAccuracy: false}).then((position) => {
      //this.actionCable.updateLocation(position);
      // current location lähetetään backendiin
      var coordinates = {"lat":position.coords.latitude, "lng":position.coords.longitude};
      this.actionCable.sendCurrentLocation(coordinates);
      });
    }

  addInfoWindow(marker, content){

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }
}
