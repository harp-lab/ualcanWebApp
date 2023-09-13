import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SharedDataService } from "./services/SharedDataService.service"
declare var window:any;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html', providers: [SharedDataService],
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private sharedservice: SharedDataService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString("#00000000");
      this.splashScreen.hide();
      const style = document.documentElement.style;
      if (window.AndroidNotch) {
          const style = document.documentElement.style;
          // Apply insets as css variables
          window.AndroidNotch.getInsetTop(px => {
              px=(px==0?25:px);
              style.setProperty("--ion-safe-area-top", px + "px");
          }, (err) => console.error("Failed to get insets top:", err));
          window.AndroidNotch.getInsetRight(px => {
              style.setProperty("--ion-safe-area-right", px + "px");
          }, (err) => console.error("Failed to get insets right:", err));
          window.AndroidNotch.getInsetBottom(px => {
              px=(px==0?25:px);
              style.setProperty("--ion-safe-area-bottom", px + "px");
          }, (err) => console.error("Failed to get insets bottom:", err));
          window.AndroidNotch.getInsetLeft(px => {
              style.setProperty("--ion-safe-area-left", px + "px");
          }, (err) => console.error("Failed to get insets left:", err));
      }
    });
  }
}
