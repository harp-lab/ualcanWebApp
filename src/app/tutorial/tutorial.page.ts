import { Component } from '@angular/core';


import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { File } from '@ionic-native/file';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';

@Component({
  selector: 'app-tutorial',
  templateUrl: 'tutorial.page.html',
  styleUrls: ['tutorial.page.scss']
})
export class TutorialPage {

  //content: string;

  constructor(private pdfGenerator: PDFGenerator) {}

  /*downloadInvoice() {
    this.content = document.getElementById('PrintInvoice').innerHTML;
    let options = {
      documentSize: 'A4',
      type: 'share',
      // landscape: 'portrait',
      fileName: 'Order-Invoice.pdf'
    };
    this.pdfGenerator.fromData(this.content, options)
      .then((base64) => {
        console.log('OK', base64);
      }).catch((error) => {
        console.log('error', error);
      });

  }*/

            

}
