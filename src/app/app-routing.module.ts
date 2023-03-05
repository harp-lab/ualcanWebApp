import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)

  },
  // Test plot page routing
  {
    path: 'PlotComponent',
    loadChildren:() => import('./plot/plot.module').then(m=>m.PlotComponentModule)
  }
  //
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    //RouterModule.forRoot(routes, { useHash: true }) // refresh changes
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
