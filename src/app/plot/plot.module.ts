import { PlotComponent } from './plot.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';


@NgModule({
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      RouterModule.forChild([{ path: '', component: PlotComponent }])
    ],
    declarations: [PlotComponent],
    providers: [
      ScreenOrientation
    ],
  })
  export class PlotComponentModule {}
  