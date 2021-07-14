import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { LocationInfo } from 'src/models/response/location.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private _http: HttpClient) { }

  GetAllLocations(): Observable<Array<LocationInfo>> {
    return this._http.get<Array<LocationInfo>>("assets/temp_data/locations.json");
  }
}
