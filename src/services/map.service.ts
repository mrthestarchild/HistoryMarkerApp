import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor() { }

  public calculateDistance(lat1:number, lon1:number, lat2:number, lon2:number): number{
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d < 0 ? -d : d;
  }

  private deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  public async SetMap(map: google.maps.Map) {
    await Storage.set({
      key: 'map',
      value: JSON.stringify(map),
    });
  };

  public async GetMap(): Promise<google.maps.Map> {
    let storageResult = await Storage.get({
      key: 'map'
    });
    let map: google.maps.Map = JSON.parse(storageResult.value);
    return map;
  }
}
