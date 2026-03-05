import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// pdf generator //
import { PDFGenerator } from '@awesome-cordova-plugins/pdf-generator/ngx'
//

import { HeaderComponentModule } from './header/header.module';
import { FooterComponentModule } from './footer/footer.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HeaderComponentModule, FooterComponentModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    PDFGenerator, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
