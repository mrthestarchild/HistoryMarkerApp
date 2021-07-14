import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocationInfo } from 'src/models/response/location.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private places: Array<LocationInfo> = new Array<LocationInfo>();
  placesItem$ = new BehaviorSubject<Array<LocationInfo>>(this.places);

  constructor() {}

  addPlace(place: LocationInfo){
    this.places.push(place);
    this.placesItem$.next(this.places);
  }

  removePlace(place: LocationInfo){
    this.places = this.places.filter(item => item != place);
    this.placesItem$.next(this.places);
  }
}
