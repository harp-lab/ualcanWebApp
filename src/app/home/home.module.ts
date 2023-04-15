import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { FooterComponentModule } from '../footer/footer.module';
import { HeaderComponentModule } from '../header/header.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderComponentModule,
    FooterComponentModule,
    RouterModule.forChild([{ path: '', component: HomePage }])
  ],
  declarations: [
    HomePage
  ]
})
export class HomePageModule {}
