import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private selectedVoiceIndex: number = 0;

  private selectedVoiceElement: BehaviorSubject<number> = new BehaviorSubject<number>(this.selectedVoiceIndex);
  selectedVoiceItem$: Observable<number> = this.selectedVoiceElement.asObservable();

  private isDarkModeElement: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  isDarkModeItem$: Observable<boolean> = this.isDarkModeElement.asObservable();

  constructor() { }

  public async SetVoice(index: number) {
    this.selectedVoiceElement.next(index);
  };

  public SetIsDarkMode(value: boolean){
    this.isDarkModeElement.next(value);
  }

}
