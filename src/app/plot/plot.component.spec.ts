import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotComponent } from './plot.component';

describe('PlotComponent', () => {
  let component: PlotComponent;
  let fixture: ComponentFixture<PlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlotComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
