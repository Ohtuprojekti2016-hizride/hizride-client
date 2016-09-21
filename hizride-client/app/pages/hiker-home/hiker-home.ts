import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Geolocation} from 'ionic-native';

declare var google;



@Component({
  templateUrl: 'build/pages/hiker-home/hiker-home.html'
})
export class HikerHomePage implements OnInit{

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  toValue:string;
  constructor(public navCtrl: NavController) {
 	this.toValue = "";
  }

  ionViewLoaded(){
    this.loadMap();
  }

  loadMap(){

    Geolocation.getCurrentPosition().then((position) => {

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    }, (err) => {
      console.log(err);
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
ngOnInit(){

  // get the two fields
  let input_to = (<HTMLInputElement>document.getElementById("journey_to"));

// set the options
  let options = {
    types: [],
    componentRestrictions: {country: "fi"}
  };

  // create the two autocompletes on the from and to fields
  let autocomplete = new google.maps.places.Autocomplete(input_to, options);

  // we need to save a reference to this as we lose it in the callbacks
  let self = this;

  // add the first listener


  // add the second listener
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
      let place = autocomplete.getPlace();
      let geometry = place.geometry;
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -33.8688, lng: 151.2195},
      zoom: 13,
      mapTypeId: 'roadmap'
    });
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
          map: map,
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
        map.fitBounds(bounds);



       }});



}



}
