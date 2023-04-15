import { IonicModule } from '@ionic/angular';
import { FooterComponent } from './footer.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';

@NgModule({
  imports: [
    IonicModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    FooterComponent
  ],
  exports: [
    FooterComponent
  ],
  providers: [
  ],
  
})
export class FooterComponentModule {}
