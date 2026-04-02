import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ICancer } from '../cancer.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, Observable, throwError, timeout, of } from 'rxjs';
import { TypeaheadService } from '../services/typeahead.service';
import { SharedDataService } from "../services/shareddata.service";
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { ApiLoadTestService } from '../services/apiloadtest.service';

@Component({
  selector: 'app-analysis',
  templateUrl: 'analysis.page.html',
  styleUrls: ['analysis.page.scss', '../shared.scss'],
  standalone: false
})
export class analysisPage{

  // auto complete
  form: FormGroup;
  genes: Observable<string[]>;
  isTesting: boolean = false;

  public analyses = [
    { id: 'expression', name: 'Expression' },
    { id: 'methylation', name: 'Methylation' },
    { id: 'proteomics', name: 'Proteomics' }
  ];

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
      private apiloadtest: ApiLoadTestService,
			private http: HttpClient,
      private loadingController: LoadingController) {
    this.createForm();
  }

  get cancers() {
    const analysis = this.form.get('selectedAnalysis')?.value;

    if (analysis === 'proteomics') {
      return this.proteomicCancers;
    }

    if (analysis === 'methylation') {
      return this.methylationCancers;
    }

    return this.expressionCancers;
  }

  createForm() {
    this.form = this.formBuilder.group({
      selectedGene: [],
      selectedCancer:[this.expressionCancers[0].id],
      selectedAnalysis: ['expression']
    });
  }
  
  getGenes(event:any) {
    let analysis = this.form.get('selectedAnalysis').value;
    let cancer = this.form.get('selectedCancer').value;
    if(event.target.value == ""){
      this.genes = of<string[]>([]);
    }else{
      this.genes = this.typeahead.getGene(event.target.value, analysis, cancer);
    }
  }

  // cancer input
  cancerChanged(ev) {
    let analysis = this.form.get('selectedAnalysis').value;
    let gene = this.form.get('selectedGene')?.value?.name;
    let cancer = ev.target.value;
    // When the cancer changes query the typeahead service for the current gene if it is set
    if(gene == ""){
      this.genes = of<string[]>([]);
    }else{
      this.genes = this.typeahead.getGene(gene, analysis, cancer);
    }
    // Clear out the gene if it doesn't exists for the selected cancer
    this.genes.subscribe((genes:string[]) => {
        if(genes.length == 0){
            this.form.patchValue({'selectedGene': ""});
        }
    });
  }

  // analysis inputs
  analysisChanged(analysis: string) {
      
    let gene = this.form.get('selectedGene')?.value?.name;
    let cancer = this.form.get('selectedCancer').value;
    if(cancer == "" || !this.cancers.some(x => x.id == cancer)){
        // Preselect the first cancer so that a gene can be selected
        cancer = this.cancers[0].id;
        console.log(cancer)
        this.form.patchValue({'selectedCancer': cancer});
    }
    // When the analysis changes query the typeahead service for the current gene if it is set
    if(gene == ""){
      this.genes = of<string[]>([]);
    }else{
      this.genes = this.typeahead.getGene(gene, analysis, cancer);
    }
    // Clear out the gene if it doesn't exists for the selected analysis
    this.genes.subscribe((genes:string[]) => {
        if(genes.length == 0){
            this.form.patchValue({'selectedGene': ""});
        }
    });
  }

  // search button
  async searchClicked(){
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

    const loading = await this.loadingController.create({
      message: 'Loading...',
      spinner: "lines",
      duration: 30000
    });

    // SHow the spinner
    await loading.present();

    // Allow the UI thread to show the spinner
    await setTimeout(() => {}, 1000)
    
    try
    {
      this.isTesting = false;
      if (this.isTesting) { 
          // we are testing, so set some test data
          this.sharedservice.data = cancer === 'PAN-CANCER' 
                                    ? this.sharedservice.panCancerTestData
                                    : this.sharedservice.testData;
          this.sharedservice.analysis = analysis;
          this.sharedservice.gene = gene;
          this.sharedservice.cancer = cancer;
          await loading.dismiss();
          this.router.navigate(['PlotComponent']);
          return;
      }
		  this.http.get(apiUrl)
        .pipe(timeout(20000),
          catchError(async err => {
            // Don't for get to hide the spinner
            await loading.dismiss();
            
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
          next: async (response) => {
            // Don't for get to hide the spinner
            await loading.dismiss();
            if
            (response===null || response===undefined || JSON.stringify(response)=="{}"){
              alert(`No data for ${gene} and ${cancer}`);
            }else{
              this.sharedservice.data = JSON.stringify(response);
              this.sharedservice.analysis = analysis;
              this.sharedservice.gene = gene;
              this.sharedservice.cancer = cancer;
              this.router.navigate(['PlotComponent']);
            } 
          },
          error: async (err) => {
            // Don't for get to hide the spinner
            await loading.dismiss();

            alert(`UALCAN API Error1: ${err.message}
  Please try again.
  If the problem persists,
  please contact support.`);
          }
		  });
    }
    catch(ex)
    {
      // Don't for get to hide the spinner
      await loading.dismiss();

      alert(`UALCAN API Error2:
Please try again.
If the problem persists,
please contact support.`);
    }
  }
  
  async runApiLoadTest() {
    const totalCalls = 100;

    const loading = await this.loadingController.create({
      message: 'Starting test...',
      spinner: 'lines'
    });

    await loading.present();

    try {
      const result = await this.apiloadtest.runTest({
        totalCalls,
        analyses: this.analyses.map(a => a.id),
        expressionCancers: this.expressionCancers,
        methylationCancers: this.methylationCancers,
        proteomicCancers: this.proteomicCancers,
        timeoutMs: 20000,
        onProgress: (completed, total) => {
          loading.message = `Running API Test...
  ${completed}/${total} complete`;
        }
      });

      await loading.dismiss();

      (window as any).plugins?.socialsharing.share(
        result.csv,
        'UALCAN API Load Test Results',
        null,
        null
      );
    } catch (err: any) {
      await loading.dismiss();

      alert(`API Load Test Error:
  ${err?.message || 'Unknown error'}`);
    }
  }
  
}


