import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { PluginListenerHandle, registerPlugin } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { BackgroundGeolocationPlugin, Location, WatcherOptions } from "@capacitor-community/background-geolocation";
import { ModalController, ToastController } from '@ionic/angular';
import { MarkerIconType } from 'src/models/marker-icon-type';
import { Marker } from 'src/models/marker.model';
import { LocationInfo } from 'src/models/response/location.model';
import { MapService } from 'src/services/map.service';
import { TextToSpeechService } from 'src/services/text-to-speech.service';
import { MarkerInfoModalComponent } from '../marker-info-modal/marker-info-modal.component';
import { PlacesService } from 'src/services/places.service';
import { LocationService } from 'src/services/location.service';
import { wwTwoMap, defaultMap } from '../map-types/map-types';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit {

  @Input('apiKey') apiKey: string;
  @ViewChild('readLocation') readLocation: ElementRef;

  public map: google.maps.Map;
  public markers: Array<Marker> = new Array<Marker>();
  public currentPosition: google.maps.LatLng;
  private mapsLoaded: boolean = false;
  private networkHandler: PluginListenerHandle = null;

  public locationsToRead: Array<LocationInfo> = new Array<LocationInfo>();

  public locationList: Array<LocationInfo> = new Array<LocationInfo>();

  public isTTSSpeaking: boolean;

  public watchId: string;

  public userSymbol: google.maps.Symbol;

  public mapOptions: google.maps.MapOptions;

  constructor(private _mapService: MapService,
              private _textToSpeechService: TextToSpeechService,
              public modalController: ModalController,
              public toastController: ToastController,
              private renderer: Renderer2,
              private element: ElementRef,
              public _placesService: PlacesService,
              public _locationService: LocationService,
              @Inject(DOCUMENT) private _document) {
    this._textToSpeechService.isSpeakingItem$.subscribe(value =>{
      this.isTTSSpeaking = value;
      if(this.isTTSSpeaking == false){
        if(this.locationsToRead.length > 0){
          this.ReadLocation();
        }
      }
      this._locationService.GetAllLocations().subscribe(result => {
        let locations = result.filter(item => item.City == "Amarillo" || item.State == "OK")
        this.locationList = locations;
      });
    }) 
  }

  async ngOnInit() {
    let permission = (await Geolocation.checkPermissions()).location;
    if(permission == "granted"){
      this.AfterPermissionCheckLoad()
    }
    else {
      let permissionCheck = (await Geolocation.requestPermissions()).location;
      if(permissionCheck == "denied"){
        alert("Please allow us to access your location or else we won't know what to provide :(")
      }
      else {
        this.AfterPermissionCheckLoad();
      }
    }
  }

  private AfterPermissionCheckLoad() {
    this.Init().then(async (res) => {
      console.log("Google Maps ready.");
      const options: WatcherOptions = {
        backgroundTitle: "Landmark",
        backgroundMessage: "We are still providing you landmarks. Close the app to prevent excessive battery usage.",
        // distanceFilter: 1
      }
      this.watchId = await BackgroundGeolocation.addWatcher(options, this.MoveMarker.bind(this));
      this.locationList.forEach(location => {
        this.AddMarker(location);
      });
    }, (err) => {
      console.log(err);
    });
  }

  /**
   * Kicks off the LoadSDK method and the InitMap to create the Google Map
   * @returns 
   */
  private Init(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.LoadSDK().then((res) => {
        this.InitMap().then((res) => {
          resolve(true);
        }, (err) => {
          reject(err);
        });
      }, (err) => {
        reject(err);
      });
    });
  }

  /**
   * Handles ensuring network exists prior to injecting sdk. 
   * @returns 
   */
  private LoadSDK(): Promise<any> {
    console.log("Loading Google Maps SDK");
    return new Promise((resolve, reject) => {
      if (!this.mapsLoaded) {
        Network.getStatus().then((status) => {
          if (status.connected) {
            this.InjectSDK().then((res) => {
              resolve(true);
            }, (err) => {
              reject(err);
            });
          }
          else {
            if (this.networkHandler == null) {
              this.networkHandler = Network.addListener('networkStatusChange', (status) => {
                if (status.connected) {
                  this.networkHandler.remove();
                  this.Init().then((res) => {
                    console.log("Google Maps ready.")
                  }, (err) => {
                    console.log(err);
                  });
                }
              });
            }
            reject('Not online');
          }
        }, (err) => {
          // NOTE: navigator.onLine temporarily required until Network plugin has web implementation
          if (navigator.onLine) {
            this.InjectSDK().then((res) => {
              resolve(true);
            }, (err) => {
              reject(err);
            });
          }
          else {
            reject('Not online');
          }
        });
      }
      else {
        reject('SDK already loaded');
      }
    });
  }

  /**
   * Loads the google SDK into the window memory and loads it in via script tag on index
   * @returns 
   */
  private InjectSDK(): Promise<any> {
    return new Promise((resolve, reject) => {
      window['mapInit'] = () => {
        this.mapsLoaded = true;
        resolve(true);
      }
      let script = this.renderer.createElement('script');
      script.id = 'googleMaps';
      if (this.apiKey) {
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
      }
      else {
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';
      }
      this.renderer.appendChild(this._document.body, script);
    });

  }

  /**
   * Initializes the google map
   * @returns 
   */
  private async InitMap(): Promise<any> {
    return new Promise((resolve, reject) => {

      Geolocation.getCurrentPosition().then((position) => {
        let currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // type = Array<google.maps.MapTypeStyle>
        var styleOptions: any = wwTwoMap;


        this.mapOptions = {
          center: currentPosition,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          styles: styleOptions,
          keyboardShortcuts: false,
          rotateControl: true,
        };
        this.map = new google.maps.Map(this.element.nativeElement, this.mapOptions);

        // create user info
        let coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        this.currentPosition = coords;
        let userInfo = this.BuildUserLocation(position);

        // add user marker
        this.AddMarker(userInfo);
        resolve(true);
      }, (err) => {
        reject('Could not initialize map');
      });
    });
  }

  /**
   * Opens a history modal when clicked.
   * @param event 
   */
  public async OpenHistoryInfo(event: any): Promise<void> {
    if(event.latLng){
      let foundMarker = this.FindHistoryMarker(event.latLng);
      if(foundMarker){
        let popover = await this.modalController.create({
          component: MarkerInfoModalComponent,
          cssClass: 'marker-modal',
          showBackdrop: true,
          backdropDismiss: true,
          animated: true,
          componentProps: {
            locationInfo: foundMarker.MarkerInfo
          }
        });
        popover.present();
      }
    }
  }

  /**
   * finds the history marker based on a passed in latitude and longitude
   * @param latLng 
   * @returns 
   */
  private FindHistoryMarker(latLng: google.maps.LatLng): Marker{
    let longitude = latLng.lng();
    let latitude = latLng.lat();
    return this.markers.find(marker => {
      let markerPosition = marker.GoogleMarker.getPosition();
      let markerLatitude = markerPosition.lat();
      let markerLongitude = markerPosition.lng();
      if(latitude == markerLatitude && longitude == markerLongitude){
        return marker;
      }
    });
  }

  /**
   * Adds a GoogleMarker to the map and adds a click listener to allow a user to open th history modal.
   * @param info 
   */
  public AddMarker(info: LocationInfo, isUser: boolean = false): void {
    let latLng: google.maps.LatLng = new google.maps.LatLng(info.Latitude, info.Longitude);
    let markerObject: Marker = new Marker(); 
    markerObject.MarkerInfo = info;
    this.userSymbol = {
      path: info.LocationType
    }
    markerObject.GoogleMarker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      icon: isUser ? this.userSymbol : info.LocationType,
    });
    markerObject.GoogleMarker.addListener('click', this.OpenHistoryInfo.bind(this));
    this.markers.push(markerObject);
  }

  /**
   * Moves an existing marker position.
   * @param position 
   * @param error 
   */
  public async MoveMarker(position: Location, error: any): Promise<void> {
    if(position && google){
      this.currentPosition = new google.maps.LatLng(position.latitude, position.longitude);
      let index = this.markers.findIndex(item => item.MarkerInfo.Id = -1);
      if(index > -1){
        this.AnimateMove(this.markers[index].GoogleMarker, .3, this.currentPosition);
      }
      this.CheckDistanceToRead(position);
    }
    if(error) {
      let toastError = await this.toastController.create({
        message: JSON.stringify(error),
        duration: 5000
      });
      toastError.present();
    }
  }

  public async CenterMap(){
    this.map.panTo(this.currentPosition);
  }
  

  /**
   * Google Map View Utility - animates setting a google map position
   * @param marker 
   * @param timeToChange 
   * @param moveto 
   */
  AnimateMove(marker: google.maps.Marker, timeToChange: number, moveto: google.maps.LatLng): void {
    let current = marker.getPosition();
    var deltalat = (moveto.lat() - current.lat()) / 100;
    var deltalng = (moveto.lng() - current.lng()) / 100;
  
    var delay = 10 * timeToChange;
    for (var i = 0; i < 100; i++) {
      ((ind) => {
        setTimeout(() => {
            let position = marker.getPosition()
            let lat = position.lat();
            let lng = position.lng();
            lat += deltalat;
            lng += deltalng;
            let latlng = new google.maps.LatLng(lat, lng);
            marker.setPosition(latlng);
          }, delay * ind
        );
      })(i)
    }
  }

  /**
   * Check current distance from all existing markers and determine if they should be read to the user.
   * @param currentPosition 
   */
  async CheckDistanceToRead(currentPosition: Location): Promise<void>{
    await this.CheckLocationDistance(currentPosition);
    let checkList = this.markers.filter(item => {
      return item.MarkerInfo.CurrentDistanceMiles <= .2 && item.MarkerInfo.CurrentDistanceMiles > 0 && item.MarkerInfo.Id != -1
    });
    if(checkList.length > 0) {
      checkList.forEach(item => {
        if(!item.MarkerInfo.HasPlayed){
          this.locationsToRead.push(item.MarkerInfo);
          this._placesService.addPlace(item.MarkerInfo);
          this.readLocation.nativeElement.click();
          item.MarkerInfo.AddedToPlacesDate = new Date();
          item.MarkerInfo.HasPlayed = true;
        }
      });
    }  
  }

  /**
   * Component Utility - handles checking current distance from all existing markers.
   * @param currentPosition 
   * @returns 
   */
  CheckLocationDistance(currentPosition: Location): Promise<void>{
    return new Promise((resolve, reject) => {
      this.markers.forEach(item => {
        item.MarkerInfo.CurrentDistanceMiles = this._mapService.calculateDistance(currentPosition.latitude, currentPosition.longitude, item.MarkerInfo.Latitude, item.MarkerInfo.Longitude);
      });
      resolve();
    });
  }

  /**
   * Component Utility - reads location marker from testToSpeechService
   */
  ReadLocation(){
    if(!this.isTTSSpeaking){
      this._textToSpeechService.ReadLocation(this.locationsToRead[0]);
      this.locationsToRead.splice(0, 1);
    }
  }

  /**
   * Component Utility - Builds user location to initialize the starting using location.
   * @param position 
   * @returns 
   */
  public BuildUserLocation(position: Position): LocationInfo{
    let userInfo = new LocationInfo();
    userInfo.Name = "You";
    userInfo.ImagePath = "assets/images/generic-user.png";
    userInfo.DisplayInformation = "This is where you are, we hope you are enjoying the app!";
    userInfo.SpeakingInformation = "This is where you are, we hope you are enjoying the app!";
    userInfo.Id = -1;
    userInfo.Latitude = position.coords.latitude;
    userInfo.Longitude = position.coords.longitude;
    userInfo.LocationType = MarkerIconType.USER_MARKER;
    return userInfo;
  }
}
