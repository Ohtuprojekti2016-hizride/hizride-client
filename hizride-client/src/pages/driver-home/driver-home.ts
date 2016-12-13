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
    //Viite itseensä
    var self = this;

    //varmistaa, että alusta on valmis ennen googlen toiminnallisuuksien käyttämistä. Edellytetään kartan toimintaan.
		this.platform.ready().then(() => {
			self.actionCable.sendHikers();

			var directionsService = new google.maps.DirectionsService();
			var directionsDisplay = new google.maps.DirectionsRenderer();

			Geolocation.getCurrentPosition({timeout: 30000, enableHighAccuracy: false}).then((position) => {

			  //Käyttäjän nykyinen sijainti
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



				// Automaattisen tekstinsyötön kuuntelija.
				google.maps.event.addListener(autocomplete, 'place_changed', function() {
					let place = autocomplete.getPlace();
					let geometry = place.geometry;
					self.map.setCenter({ lat: -33.8688, lng: 151.2195 })

					var bounds = new google.maps.LatLngBounds();

          //Karttaan sijoitettavat markerit tallenetaan tähän
          let markersArray = [];
          //Jos automaattisen tekstinsyötön laittama paikka on olemassa
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


            //Tyhjentää kartan vanhat markerit
            self.clearOverlays(markersArray);

            //Directions Servicelle lähetettävä reittipyyntö. Omasta sijainnista haettavaan paikkaan autolla.
						var request = {
							origin: latLng,
							destination: place.geometry.location,
							travelMode: 'DRIVING'
						};
            //Reittipyyntö
						directionsService.route(request, function(result, status) {
							if (status == 'OK') {
							  //Piirretään reitti kartalle
								directionsDisplay.setDirections(result);
                //Tehdään reitistä backendiin lähetettävä polyline-muoto.
								let polyline = result.routes["0"].overview_polyline;
								let newPolyline = new google.maps.Polyline({
									path:google.maps.geometry.encoding.decodePath(polyline)
								});
              //Lähetetään reitti backendiin.
              self.actionCable.sendRoute(polyline);

              //Haetaan nykyiset liftarit
              self.actionCable.getHikerlist(function(hikerlist){
                console.log(hikerlist);
				        var obj = JSON.parse(hikerlist);

				        for (let i in obj) {
					        console.log(obj[i]);
                  //Parsetaan liftarin positio
				          let hikerPos = new google.maps.LatLng(obj[i].current_location_lat, obj[i].current_location_lng);
                  //Jos liftari on reitin varrella...
				          if (google.maps.geometry.poly.isLocationOnEdge(hikerPos, newPolyline, 0.0002)) {
				            //..Otetaan ID ylös..
				    	      var fb_id = obj[i].facebook_id;
                    //.. Lisätään merkki sijainnista..
                    self.addMarker(hikerPos,markersArray);
                    let hikerDest = new google.maps.LatLng(obj[i].destination_lat, obj[i].destination_lng);
                    //..ja kulkukohteesta kartalle
                    self.addMarker(hikerDest,markersArray);
                    //Kysytään haluaako ajaja ottaa kyytiin
				    	      self.showConfirm(fb_id, obj[i].destination_name);
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

clearOverlays(markersArray) {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}
  addMarker(pos, markersArray){

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: pos,
      title: "HitchHiker!"
    });

    markersArray.push(marker);

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


  showConfirm(fb_id, destination_name) {
    var pic = "https://graph.facebook.com/"+fb_id+"/picture?type=square";
    console.log(pic);
      let confirm = this.alertCtrl.create({
        title: 'Liftari lähellä!',
        message: 'Haluatko ottaa tämän henkilön kyytiin? Hän on matkalla kohteeseen ' + destination_name + '<br><img src="' + pic + '" alt="profiilikuva">',
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

  goBack() {
    this.navCtrl.push(ModeSelectPage);
  }

}
