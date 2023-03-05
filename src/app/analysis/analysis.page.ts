import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery'
import { ICancer } from '../cancer.interface';
//
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { TypeaheadService } from '../services/typeahead.service';
import { SharedDataService } from "../services/SharedDataService.service";
import { NavController } from '@ionic/angular';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { File } from '@ionic-native/file';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
//

@Component({
  selector: 'app-analysis',
  templateUrl: 'analysis.page.html',
  styleUrls: ['analysis.page.scss']
})
export class analysisPage{

  //service to send the response
  // auto complete
  form: FormGroup;
  genes: Observable<string[]>;

  createForm() {
    this.form = this.formBuilder.group({
      name: [],
      selectedCancer:[]
    });
  }
  getGeneName(event:any) {
    this.genes = this.typeahead.getGene(event.target.value);
  }


  //

  // dropdown list
    public cancers: Array<ICancer> = [

      {id:"ACC", name:"Adrenocortical carcinoma"},
      {id:"LAML", name:"Acute myeloid leukemia"},
      {id:"BLCA", name:"Bladder urothelial carcinoma"},
      {id:"LGG", name:"Brain lower grade glioma"},
      {id:"BRCA", name:"Breast invasive carcinoma"},
      {id:"mets500BRCA", name:"Metastatic Breast cancer[MET500 dataset]"},
      {id:"CESC", name:"Cervical squamous cell carcinoma"},
      {id:"CHOL", name:"Cholangiocarcinoma"},
      {id:"COAD", name:"Colon adenocarcinoma"},
      {id:"ESCA", name:"Esophageal carcinoma"},
      {id:"GBM", name:"Glioblastoma multiforme"},
      {id:"HNSC", name:"Head and Neck squamous cell carcinoma"},
      {id:"KICH", name:"Kidney chromophobe"},
      {id:"KIRC", name:"Kidney renal clear cell carcinoma"},
      {id:"KIRP", name:"Kidney renal papillary cell carcinoma"},
      {id:"LIHC", name:"Liver hepatocellular carcinoma"},
      {id:"LUAD", name:"Lung adenocarcinoma"},
      {id:"LUSC", name:"Lung squamous cell carcinoma"},
      {id:"DLBC", name:"Lymphiod neoplasm diffuse large B-cell lymphoma"},
      {id:"MESO", name:"Mesothelioma"},
      {id:"OV", name:"Ovarian serous cystadenocarcinoma"},
      {id:"PAAD", name:"Pancreatic adenocarcinoma"},
      {id:"PCPG", name:"Pheochromocytoma and Paraganglioma"},
      {id:"PRAD", name:"Prostate adenocarcinoma" },
      {id:"mets500PRAD", name:"Metastatic Prostate cancer[MET500 dataset]" },
      {id:"READ", name:"Rectum adenocacinoma" },
      {id:"SARC", name:"Sarcoma"},
      {id:"SKCM", name:"Skin cutaneous melanoma"},
      {id:"STAD", name:"Stomach adenocarcinomna"},
      {id:"TGCT", name:"Testis germ cell tumors"},
      {id:"THYM", name:"Thymoma"},
      {id:"THCA", name:"Thyroid carcinoma"},
      {id:"UVM", name:"Uveal Melanoma"},
      {id:"UCEC", name:"Uterine corpus endometrial carcinoma"},
      {id:"UCS", name:"Uterine carcinosarcoma"}
    ];

    public cancerID:string;

  //

  constructor(public router: Router, private formBuilder: FormBuilder, private typeahead: TypeaheadService, private navCtrl: NavController,
    private sharedservice: SharedDataService, private so: ScreenOrientation) {
    this.createForm();


  }
  // search button
  goforward(){
    
    //console.log(this.form.get('name')?.value.name);
    //console.log(this.form.get('selectedCancer')?.value);

    // test api call
    var gene = this.form.get('name')?.value.name;
    var cancer = this.form.get('selectedCancer')?.value;

    //this.typeahead.setdatad(gene);

    $.ajax({
      type: 'GET',
      url: `https://ualcan.path.uab.edu/cgi-bin/ualcan-gene-json.pl?genenam=${gene}&ctype=${cancer}`,
      dataType: 'text',
      success: (response) => {
        if(response==="{}"){
          console.log("no response");
          alert(`No data for ${gene} and ${cancer}`);
        }else{
          console.log("yes response");
          this.sharedservice.setdata(response);
          /*html2canvas(document.body).then(function(canvas) {
            var doc = new jsPDF("p","mm","a4");
            //Converting canvas to Image
            let imgData = canvas.toDataURL("image/PNG");
            //Add image Canvas to PDF
            doc.addImage(imgData, 'PNG', 20,20,1,1);
            
            let pdfOutput = doc.output();
            // using ArrayBuffer will allow you to put image inside PDF
            let buffer = new ArrayBuffer(pdfOutput.length);
            let array = new Uint8Array(buffer);
            for (var i = 0; i < pdfOutput.length; i++) {
                array[i] = pdfOutput.charCodeAt(i);
            }


            //This is where the PDF file will stored , you can change it as you like
            // for more information please visit https://ionicframework.com/docs/native/file/
            const directory = File.externalApplicationStorageDirectory ;

            //Name of pdf
            const fileName = "example.pdf";
            
            //Writing File to Device
            File.writeFile(directory,fileName,buffer)
            .then((success)=> console.log("File created Succesfully" + JSON.stringify(success)))
            .catch((error)=> console.log("Cannot Create File " +JSON.stringify(error)));
          });*/
          //this.typeahead.setdata(response);
          this.router.navigate(['PlotComponent']);
        }
          
      },
      error: function (response, error) {
          alert(error);
      }
  }); 
  } 
}


