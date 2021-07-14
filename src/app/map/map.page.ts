import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { LocationInfo } from 'src/models/response/location.model';
import { GlobalService } from 'src/services/global.service';
import { LocationService } from 'src/services/location.service';
import { MapService } from 'src/services/map.service';
import { TextToSpeechService } from 'src/services/text-to-speech.service';
import { GoogleMapComponent } from '../google-map/google-map.component';

@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss']
})
export class MapPage implements AfterViewInit{

  @ViewChild("googleMap") googleMap: GoogleMapComponent;
  public locationList: Array<LocationInfo>;

  public isTTSSpeaking: boolean = false;
  public localReadingInfo: LocationInfo;

  public speakingToast: HTMLIonToastElement;

  public isDarkMode: boolean = true;

  constructor(public _mapService: MapService,
              public _locationService: LocationService,
              public _textToSpeechService: TextToSpeechService,
              public _globalService: GlobalService,
              public toastController: ToastController) {
    this._textToSpeechService.isSpeakingItem$.subscribe(value =>{
      this.isTTSSpeaking = value;
      if(this.isTTSSpeaking == true){
        this.OpenCancelSpeakingToast();
      }
      if(this.isTTSSpeaking == false){
        if(this.speakingToast){
          this.speakingToast.dismiss();
        }
      }
    });
    this._textToSpeechService.currentSpeakingInfoItem$.subscribe(value =>{
      this.localReadingInfo = value;
    });
    this._globalService.isDarkModeItem$.subscribe(value =>{
      this.isDarkMode = value;
    });
  }

  ngAfterViewInit(){
    // this._locationService.GetAllLocations().subscribe(result => {
    //   let locations = result.filter(item => item.City == "Amarillo" || item.State == "OK")
    //   this.locationList = locations;
    //   setTimeout(() => {
    //     this.AddMarkers();
    //   }, 2000);
    // });
  }

  public AddMarkers(){
    this.locationList.forEach(info => {
      this.googleMap.AddMarker(info);
    });
  }

  public CenterMap(){
    this.googleMap.CenterMap();
  } 

  public async OpenCancelSpeakingToast(){
    this.speakingToast = await this.toastController.create({
      message: `Currently Reading: ${this.localReadingInfo.Name}`,
      buttons: [
        {
          side: "end",
          text: "cancel",
          handler: () =>{
            this.CancelSpeaking();
          }
        }
      ]
    });
    await this.speakingToast.present();
  }

  public CancelSpeaking(){
    this._textToSpeechService.StopReadLocation();
  }

  public RotateIcon(){
    let symbol = this.googleMap.markers.find(item => item.MarkerInfo.Id == -1);
  }

}
