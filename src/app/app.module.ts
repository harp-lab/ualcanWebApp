import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';

// pdf generator //
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx'
//

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    //pdf generator //
    PDFGenerator, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    //
    //{provide: LocationStrategy, useClass: HashLocationStrategy}  // refresh page problem
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
