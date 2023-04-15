import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutorialPage } from './tutorial.page';
import { HeaderComponentModule } from '../header/header.module';
import { FooterComponentModule } from '../footer/footer.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderComponentModule,
    FooterComponentModule,
    RouterModule.forChild([{ path: '', component: TutorialPage }])
  ],
  declarations: [
    TutorialPage
  ]
})
export class TutorialPageModule {}
