import {async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { analysisPage } from './analysis.page';

describe('analysisPage', () => {
  let component: analysisPage;
  let fixture: ComponentFixture<analysisPage>;

    beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [analysisPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    /*beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [analysisPage],
        imports: [IonicModule.forRoot()]
      }).compileComponents();*/

    fixture = TestBed.createComponent(analysisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
