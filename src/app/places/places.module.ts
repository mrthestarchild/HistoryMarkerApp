import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlacesPage } from './places.page';

import { PlacesPageRoutingModule } from './places-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PlacesPageRoutingModule
  ],
  declarations: [PlacesPage]
})
export class PlacesPageModule {}
