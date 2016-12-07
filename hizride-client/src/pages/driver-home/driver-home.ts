import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController} from "ionic-angular";
import { ModeSelectPage } from '../mode-select/mode-select';
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
  					 public navCtrl: NavController,
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


		this.platform.ready().then(() => {
			self.actionCable.sendHikers();

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
				}

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
                self.actionCable.sendRoute(polyline);

                self.actionCable.getHikerlist(function(hikerlist){
                  console.log(hikerlist);
				  var obj = JSON.parse(hikerlist);

				  for (let i in obj) {
					console.log(obj[i]);

				    let hikerPos = new google.maps.LatLng(obj[i].current_location_lat, obj[i].current_location_lng);
				    if (google.maps.geometry.poly.isLocationOnEdge(hikerPos, newPolyline, 0.0001)) {
				    	var fb_id = obj[i].facebook_id;
              self.addMarker(hikerPos);
              let hikerDest = new google.maps.LatLng(obj[i].destination_lat, obj[i].destination_lng);
              self.addMarker(hikerDest);
				    	self.showConfirm(fb_id);
					}
				  }
                });

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

showHikers(data) {
  let hikers = data;
  console.log("hikers näkyy");
}

  addMarker(pos){

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: pos,
      title: "HitchHiker!"
    });

    let content = "<h4>HitchHiker!</h4>";

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


  showConfirm(fb_id) {
    var pic = "https://graph.facebook.com/"+fb_id+"/picture?type=square";
    console.log(pic);
      let confirm = this.alertCtrl.create({
        title: 'Liftari lähellä!',
        message: 'Haluatko ottaa tämän henkilön kyytiin? ' + '<br><img src="' + pic + '" alt="profiilikuva">',
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
              //kutsutaan actioncable-metodia, joka kutsuu backendia, joka broadcastaa viestin hiker-clientille
            }
          }
        ]
      });
      confirm.present();
  }

  goBack() {
  this.navCtrl.push(ModeSelectPage);
  }

}
