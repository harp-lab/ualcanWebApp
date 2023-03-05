import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { analysisPage } from './analysis.page';
import { NgSelectModule } from '@ng-select/ng-select';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

//Auto complete //

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    
    RouterModule.forChild([{ path: '', component: analysisPage }])
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [analysisPage],

  // screen rotate ///
  providers: [
    ScreenOrientation
  ],
  ///////////////////
  
})
export class analysisPageModule {}
