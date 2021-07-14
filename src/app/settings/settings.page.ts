import { Component } from '@angular/core';
import { TextToSpeech, TTSOptions } from '@capacitor-community/text-to-speech';
import { GlobalService } from 'src/services/global.service';
import { MapService } from 'src/services/map.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss']
})
export class SettingsPage {

  voices: Array<SpeechSynthesisVoice>;
  selectedVoice: SpeechSynthesisVoice;
  selectedThemeSetting: boolean = document.body.classList.contains('dark') ? true : false;

  public isDarkMode: boolean = this.selectedThemeSetting;

  constructor(private _globalService: GlobalService) {
    this.GetTTSVoices();
    this._globalService.isDarkModeItem$.subscribe(value =>{
      this.isDarkMode = value;
    });
  }

  async GetTTSVoices(){
    this.voices = (await TextToSpeech.getSupportedVoices()).voices;
  }

  SetVoice(item: Event){
    if(item){
      let event = item as CustomEvent;
      console.log("Selected Voice", item);
      console.log("Selected Voice Model", this.selectedVoice);
      let index = this.voices.findIndex(x => x.name == this.selectedVoice.name);
      // this._globalService.SetVoice(event.detail.value, index);
      this._globalService.SetVoice(index);
    }
    
  }

  CheckSelectedTheme(value: boolean){
    if(value == true){
      if(!document.body.classList.contains('dark')){
        document.body.classList.add('dark');
        this._globalService.SetIsDarkMode(true);
      }
    }
    else{
      if(document.body.classList.contains('dark')){
        document.body.classList.remove('dark');
        this._globalService.SetIsDarkMode(false);
      }
    }
  }

}
