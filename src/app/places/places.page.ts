import { Component } from '@angular/core';
import { LocationInfo } from 'src/models/response/location.model';
import { GlobalService } from 'src/services/global.service';
import { LocationService } from 'src/services/location.service';
import { PlacesService } from 'src/services/places.service';

@Component({
  selector: 'app-places',
  templateUrl: 'places.page.html',
  styleUrls: ['places.page.scss']
})
export class PlacesPage {

  locationList: Array<LocationInfo>;

  public isDarkMode: boolean = true;

  constructor(public _locationService: LocationService,
              public _globalService: GlobalService,
              public _placesService: PlacesService) {
    this._placesService.placesItem$.subscribe(locations =>{
      this.locationList = locations;
    });
    this._globalService.isDarkModeItem$.subscribe(value =>{
      this.isDarkMode = value;
    });
  }

}
