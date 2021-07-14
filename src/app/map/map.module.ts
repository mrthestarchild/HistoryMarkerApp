import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapPage } from './map.page';
import { MapPageRoutingModule } from './map-routing.module';
import { GoogleMapComponent } from '../google-map/google-map.component';
import { MarkerInfoModalComponent } from '../marker-info-modal/marker-info-modal.component';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MapPageRoutingModule
  ],
  declarations: [
    MapPage, 
    GoogleMapComponent, 
    MarkerInfoModalComponent
  ]
})
export class MapPageModule {}
