import { PlotComponent } from './plot.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { FooterComponentModule } from '../footer/footer.module';

@NgModule({
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      FooterComponentModule,
      RouterModule.forChild([{ path: '', component: PlotComponent }])
    ],
    declarations: [
      PlotComponent
    ],
    providers: [
      ScreenOrientation
    ],
  })
  export class PlotComponentModule {}
  