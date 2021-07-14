import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocationInfo } from 'src/models/response/location.model';
import { GlobalService } from 'src/services/global.service';
import { TextToSpeechService } from 'src/services/text-to-speech.service';

@Component({
  selector: 'app-marker-info-modal',
  templateUrl: './marker-info-modal.component.html',
  styleUrls: ['./marker-info-modal.component.scss'],
})
export class MarkerInfoModalComponent implements OnInit {

  @Input() locationInfo: LocationInfo;

  mapVoice: number;

  constructor(public modalController: ModalController,
              public _globalService: GlobalService,
              public _textToSpeechService: TextToSpeechService) { 
    this._globalService.selectedVoiceItem$.subscribe(voice => {
      this.mapVoice = voice;
    });
  }

  ngOnInit() {

    // setTimeout(async () => {
    //   this._textToSpeechService.ReadLocation(this.locationInfo);
    // }, 1000);
  }

  async dismissModal(){
    this.modalController.dismiss();
    // this._textToSpeechService.StopReadLocation();
  }

}
