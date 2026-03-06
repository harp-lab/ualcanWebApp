import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ICancer } from '../cancer.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, Observable, throwError, timeout } from 'rxjs';
import { TypeaheadService } from '../services/typeahead.service';
import { SharedDataService } from "../services/SharedDataService.service";
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var window:any;

@Component({
  selector: 'app-analysis',
  templateUrl: 'analysis.page.html',
  styleUrls: ['analysis.page.scss', '../shared.scss'],
  standalone: false
})
export class analysisPage{

  //service to send the response
  // auto complete
  form: FormGroup;
  genes: Observable<string[]>;
  isTesting: boolean = false;

  createForm() {
    this.form = this.formBuilder.group({
      selectedGene: [],
      selectedCancer:[],
      selectedAnalysis: ['expression']
    });
  }
  
  getGeneName(event:any) {
    let analysis = this.form.get('selectedAnalysis').value;
    let cancer = this.form.get('selectedCancer').value;
    this.genes = this.typeahead.getGene(event.target.value, analysis, cancer);
  }

  // dropdown list
  public expressionCancers: Array<ICancer> = [
    {id:"PAN-CANCER", name:"Pan-cancer"},
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

  public methylationCancers: Array<ICancer> = [
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
    {id:"PAN-CANCER", name:"Pan-cancer"},
    {id:"BRCA", name:"Breast cancer"},
    {id:"KIRC", name:"Clear cell RCC"},
    {id:"CCRCCex", name:"Clear cell RCC - Extended"},
    {id:"COAD", name:"Colon cancer"},
    {id:"UCEC", name:"Endpometrial cancer"},
    {id:"STAD", name:"Gastric cancer"},
    {id:"GBM", name:"Glioblastoma"},
    {id:"Glioma", name:"Glioma"},
    {id:"HNSC", name:"Head and Neck Cancer"},
    {id:"LIHC", name:"Liver cancer"},
    {id:"LUAD", name:"Lung adenocarcinoma"},
    {id:"LUADAP", name:"Lung adenocarcinoma Apollo"},
    {id:"LUSC", name:"Lung squamous carcinoma"},
    {id:"OV", name:"Ovarian cancer"},
    {id:"PAAD", name:"Pancreatic cancer"},
    {id:"PRAD", name:"Prostate cancer"}
  ];

  constructor(public router: Router, 
			private formBuilder: FormBuilder, 
			private typeahead: TypeaheadService, 
			private sharedservice: SharedDataService, 
			private http: HttpClient) {
    this.createForm();
    this.form.patchValue({'selectedCancer': this.expressionCancers[0].id});
  }

  // cancer input
  cancerChanged(ev) {
    let analysis = this.form.get('selectedAnalysis').value;
    let gene = this.form.get('selectedGene')?.value?.name;
    let cancer = ev.target.value;
    // When the analysis changes query the typeahead service for the current gene if it is set
    this.genes = this.typeahead.getGene(gene, analysis, cancer);
    // Clear out the gene if it doesn't exists for the selected analysis
    this.genes.subscribe((genes:string[]) => {
        if(genes.length == 0){
            this.form.patchValue({'selectedGene': ""});
        }
    });
  }

  // analysis inputs
  analysisChanged(ev) {
    let analysis = ev.target.value;
    let gene = this.form.get('selectedGene')?.value?.name;
    let cancer = this.form.get('selectedCancer').value;
    let cancers = analysis == "proteomics" 
                  ? this.proteomicCancers 
                  : analysis == "methylation" 
                    ? this.methylationCancers 
                    : this.expressionCancers;
    if(cancer == "" || !cancers.some(x => x.id == cancer)){
        // Preselect the first cancer so that a gene can be selected
        cancer = cancers[0].id;
        this.form.patchValue({'selectedCancer': cancer});
    }
    // When the analysis changes query the typeahead service for the current gene if it is set
    this.genes = this.typeahead.getGene(gene, analysis, cancer);
    // Clear out the gene if it doesn't exists for the selected analysis
    this.genes.subscribe((genes:string[]) => {
        if(genes.length == 0){
            this.form.patchValue({'selectedGene': ""});
        }
    });
  }

  // search button
  searchClicked(){
    let gene = this.form.get('selectedGene')?.value?.name;
    if(!gene){
      return;
    } 
    let analysis = this.form.get('selectedAnalysis').value;
    let cancer = this.form.get('selectedCancer').value;
    let api = ''
    switch (analysis) {
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

	  let apiUrl = `https://ualcan.path.uab.edu/cgi-bin/${api}?genenam=${gene}&ctype=${cancer}`;

    if (window.plugins?.spinnerDialog) {
      window.plugins.spinnerDialog.show(null, "Loading...", true);
    }

    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0' // Legacy header for older proxies
    });
    
    try
    {
		  this.http.get(apiUrl, { headers })
        .pipe(timeout(20000),
          catchError(err => {
            if (window.plugins?.spinnerDialog) {
              window.plugins.spinnerDialog.hide();
            }
            
            // LOGIC: Translate the error type
            let finalMessage = 'An unknown error occurred';
            
            if (err.name === 'TimeoutError') {
              finalMessage = 'Connection timed out';
            } else if (err.status === 404) {
              finalMessage = 'Resource not found';
            }

            // PASS DOWN: Send the message to the subscribe block
            return throwError(() => new Error(finalMessage));
          }))
        .subscribe({
          next: (response) => {
            if (window.plugins?.spinnerDialog) {
              window.plugins.spinnerDialog.hide();
            }
            if(response===null || response===undefined || JSON.stringify(response)=="{}"){
              alert(`No data for ${gene} and ${cancer}`);
            }else{
              this.sharedservice.data = JSON.stringify(response);
              this.sharedservice.analysis = analysis;
              this.sharedservice.gene = gene;
              this.sharedservice.cancer = cancer;
              this.router.navigate(['PlotComponent']);
            } 
          },
          error: (err) => {
            if (window.plugins?.spinnerDialog) {
              window.plugins.spinnerDialog.hide();
            }

            alert(`UALCAN API Error1: ${err.message}
  Please try again.
  If the problem persists,
  please contact support.`);
          this.isTesting = false;
          if (this.isTesting) { 
              // we are testing, so set some test data
              this.sharedservice.data = cancer === 'PAN-CANCER' 
                                        ? this.sharedservice.panCancerTestData
                                        : this.sharedservice.testData;
              this.sharedservice.analysis = analysis;
              this.sharedservice.gene = gene;
              this.sharedservice.cancer = cancer;
              this.router.navigate(['PlotComponent']);
            }
          }
		  });
    }
    catch(ex)
    {
      if (window.plugins?.spinnerDialog) {
        window.plugins.spinnerDialog.hide();
      }

      alert(`UALCAN API Error2:
Please try again.
If the problem persists,
please contact support.`);
    }
  } 
}


