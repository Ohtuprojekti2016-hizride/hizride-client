import {Component, ViewChild, ElementRef} from '@angular/core';
import {Platform} from 'ionic-angular';
import {Geolocation} from 'ionic-native';

declare var google;



@Component({
  templateUrl: 'hiker-home.html'
})

export class HikerHomePage{

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  toValue:string;
  constructor(public platform:Platform) {
 	this.toValue = "";
    this.platform = platform;
  }

  ionViewDidLoad(){
    this.loadMap();
  }

  loadMap(){
    this.platform.ready().then(() => {


      Geolocation.getCurrentPosition({timeout: 30000, enableHighAccuracy: false}).then((position) => {

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

          var service = new google.maps.places.PlacesService(self.map);

          var request = {
            query: "bus station",
            location: latLng,
            radius: 2500,
            //types: ['restaurant']
          };

          service.textSearch(request, callback);
        });

        function callback(results, status) {
          console.log("Results length: " + results.length);
          console.log("Results[0]: " + results[0].name);
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
              createMarker(results[i]);
            }
          }
        }

        function createMarker(place) {

          new google.maps.Marker({
            map: self.map,
            position: place.geometry.location
          });
        }

        // add the second listener
        /*
         google.maps.event.addListener(autocomplete, 'place_changed', function() {
         let place = autocomplete.getPlace();
         let geometry = place.geometry;
         self.map.setCenter({ lat: -33.8688, lng: 151.2195 })

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

         if (place.geometry.viewport) {
         bounds.union(place.geometry.viewport);
         } else {
         bounds.extend(place.geometry.location);
         }
         self.map.fitBounds(bounds);
         }

         });
         */

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
}
