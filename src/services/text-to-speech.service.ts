import { Injectable } from '@angular/core';
import { TextToSpeech, TTSOptions } from '@capacitor-community/text-to-speech';
import { BehaviorSubject } from 'rxjs';
import { LocationInfo } from 'src/models/response/location.model';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  selectedVoice: number;

  private localIsSpeaking: boolean = false;
  isSpeakingItem$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.localIsSpeaking);

  currentSpeakingInfo: LocationInfo = null;
  currentSpeakingInfoItem$: BehaviorSubject<LocationInfo> = new BehaviorSubject<LocationInfo>(this.currentSpeakingInfo);


  constructor(public _globalService: GlobalService) {
    this._globalService.selectedVoiceItem$.subscribe(value => {
      this.selectedVoice = value;
    });
  }

  async ReadLocation(locationInfo: LocationInfo){
    this.StartReading(locationInfo);
    let options: TTSOptions = {
      text: `${locationInfo.Name}. ${locationInfo.SpeakingInformation}`,
      category: "playback",
      voice: this.selectedVoice
    }
    await TextToSpeech.speak(options);
    this.CancelReading();
  }

  async StopReadLocation(){
    if(this.localIsSpeaking){
      await TextToSpeech.stop();
      this.localIsSpeaking = false;
      this.currentSpeakingInfo = null;
      this.isSpeakingItem$.next(this.localIsSpeaking); 
      this.currentSpeakingInfoItem$.next(this.currentSpeakingInfo); 
    }
  }

  private StartReading(locationInfo: LocationInfo){
    this.currentSpeakingInfo = locationInfo;
    this.localIsSpeaking = true;
    this.currentSpeakingInfoItem$.next(this.currentSpeakingInfo);
    this.isSpeakingItem$.next(this.localIsSpeaking);
  }

  private CancelReading(){
    this.localIsSpeaking = false;
    this.currentSpeakingInfo = null;
    this.isSpeakingItem$.next(this.localIsSpeaking); 
    this.currentSpeakingInfoItem$.next(this.currentSpeakingInfo);
  }
}
