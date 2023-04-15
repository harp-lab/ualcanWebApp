import { Component } from '@angular/core';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';

@Component({
  selector: 'app-tutorial',
  templateUrl: 'tutorial.page.html',
  styleUrls: ['tutorial.page.scss', '../shared.scss']
})
export class TutorialPage {
  constructor(private pdfGenerator: PDFGenerator) {}
}
