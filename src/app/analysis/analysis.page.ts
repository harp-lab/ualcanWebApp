import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery'
import { ICancer } from '../cancer.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { TypeaheadService } from '../services/typeahead.service';
import { SharedDataService } from "../services/SharedDataService.service";
import { NavController } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({
  selector: 'app-analysis',
  templateUrl: 'analysis.page.html',
  styleUrls: ['analysis.page.scss', '../shared.scss']
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

  public proteomicCancers: Array<ICancer> = [
    {id:"BRCA", name:"Breast cancer"},
    {id:"COAD", name:"Colon cancer"},
    {id:"OV", name:"Ovarian cancer"},
    {id:"PAAD", name:"Pancreatic cancer"},
    {id:"PRAD", name:"Prostate cancer"},
    {id:"STAD", name:"Gastric cancer"},
    {id:"UCEC", name:"Endpometrial cancer"},
    {id:"LUAD", name:"Lung adenocarcinoma"},
    {id:"LIHC", name:"Liver cancer"},
    {id:"LUSC", name:"Lung squamous carcinoma"},
    {id:"LUADAP", name:"Lung adenocarcinoma Apollo"},
    {id:"KIRC", name:"Clear cell RCC"},
    {id:"CCRCCex", name:"Clear cell RCC - Extended"},
    {id:"Glioma", name:"Glioma"},
    {id:"GBM", name:"Glioblastoma"}
  ];

  public cancerID:string;
  public analysis:string = "expression";

  constructor(public router: Router, private formBuilder: FormBuilder, private typeahead: TypeaheadService, private navCtrl: NavController,
    private sharedservice: SharedDataService, private so: ScreenOrientation) {
    this.createForm();
  }

  // analysis inputs
  analysisChange(ev) {
    this.analysis = ev.target.value;
  }

  // search button
  goForward(){
    
    let gene = this.form.get('name')?.value.name;
    let cancer = this.form.get('selectedCancer')?.value;
    let api = ''
    switch (this.analysis) {
      case 'expression':
        api = 'ualcan-gene-json.pl';
        break;
      case 'methylation':
        api = 'ualcan-methyl-json.pl';
        break;
      case 'proteomics':
        api = 'ualcan-CPTAC-json.pl';
        break;
      default:
    }

    try
    {
      $.ajax({
        type: 'GET',
        url: `https://ualcan.path.uab.edu/cgi-bin/${api}?genenam=${gene}&ctype=${cancer}`,
        dataType: 'text',
        cache: false,
        timeout: 10000,
        success: (response) => {
          if(response==="{}"){
            console.log("no response");
            alert(`No data for ${gene} and ${cancer}`);
          }else{
            console.log("yes response");
            this.sharedservice.setdata(response);
            this.sharedservice.setanalysis(this.analysis);
            this.router.navigate(['PlotComponent']);
          } 
        },
        error: function (response, error, errorThrown) {
          alert(`UALCAN API Error1: ${errorThrown}
Please try again.
If the problem persists,
please contact support.`);
        }
      }); 
    }
    catch(ex)
    {
      alert(`UALCAN API Error2: ${ex}
Please try again.
If the problem persists,
please contact support.`);
    }
  } 
}


