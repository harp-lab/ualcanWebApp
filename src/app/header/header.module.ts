import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';

@NgModule({
  imports: [
    IonicModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    HeaderComponent
  ],
  exports: [
    HeaderComponent
  ],
  providers: [
  ],
  
})
export class HeaderComponentModule {}
