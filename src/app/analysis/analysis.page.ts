import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ICancer } from '../cancer.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, Observable, throwError, timeout } from 'rxjs';
import { TypeaheadService } from '../services/typeahead.service';
import { SharedDataService } from "../services/SharedDataService.service";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

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

  createForm() {
    this.form = this.formBuilder.group({
      name: [],
      selectedCancer:[]
    });
  }
  
  getGeneName(event:any) {
    let cancerId = this.form.get('selectedCancer')?.value;
    this.genes = this.typeahead.getGene(event.target.value, this.analysis, cancerId);
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

  public analysis:string = "expression";

  constructor(public router: Router, 
			private formBuilder: FormBuilder, 
			private typeahead: TypeaheadService, 
			private sharedservice: SharedDataService, 
			private http: HttpClient) {
    this.createForm();
    this.form.patchValue({'selectedCancer': this.cancers[0].id});
  }


  // cancer input
  cancerChanged(ev) {
      let gene = this.form.get('name')?.value?.name ?? "";
      let cancer = ev.target.value;
      // When the analysis changes query the typeahead service for the current gene if it is set
      this.genes = this.typeahead.getGene(gene, this.analysis, cancer);
      // Clear out the gene if it doesn't exists for the selected analysis
      this.genes.subscribe((genes:string[]) => {
          if(genes.length == 0){
              this.form.patchValue({'name': ""});
          }
      });
  }

  // analysis inputs
  analysisChanged(ev) {
    this.analysis = ev.target.value;
    let gene = this.form.get('name')?.value?.name ?? "";
    let cancer = this.form.get('selectedCancer')?.value ?? "";
    let cancers = this.analysis == "proteomics" ? this.proteomicCancers : this.cancers;
    if(cancer == "" || !cancers.some(x => x.id == cancer)){
        // Preselect the first cancer so that a gene can be selected
        cancer = cancers[0].id;
        this.form.patchValue({'selectedCancer': cancer});
    }
    // When the analysis changes query the typeahead service for the current gene if it is set
    this.genes = this.typeahead.getGene(gene, this.analysis, cancer);
    // Clear out the gene if it doesn't exists for the selected analysis
    this.genes.subscribe((genes:string[]) => {
        if(genes.length == 0){
            this.form.patchValue({'name': ""});
        }
    });
  }

  // search button
  searchClicked(){
    
    let gene = this.form.get('name')?.value.name;
    if(!gene){
      return;
    } 
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

	let apiUrl = `https://ualcan.path.uab.edu/cgi-bin/${api}?genenam=${gene}&ctype=${cancer}`;

    try
    {
		this.http.get(apiUrl, {  })
			.pipe(timeout(10000),
				catchError(err => {
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
				next: (response) => 
				{
					if(response==="{}" || response===null || response===undefined){
						alert(`No data for ${gene} and ${cancer}`);
					}else{
						this.sharedservice.setdata(JSON.stringify(response));
						this.sharedservice.setanalysis(this.analysis);
						this.router.navigate(['PlotComponent']);
					} 
				},
				error: (err) => {
					alert(`UALCAN API Error1: ${err.message}
Please try again.
If the problem persists,
please contact support.`);
          this.sharedservice.setdata(`{
					"yAxis":"TPM",
					"plots":[
						{
							"stats":[
								{
									"value":"1.62447832963153e-12",
									"name":"Normal-vs-Primary tumor"
								}
							],
							"data":[
								{
									"n":"114",
									"median":"1.707",
									"q1":"0.803",
									"high":"13.482",
									"color":"#5669E3",
									"low":"0.133",
									"q3":"3.614",
									"category":"Normal"
								},
								{
									"n":"1097",
									"median":"63.381",
									"q1":"12.834",
									"high":"780.943",
									"color":"#F2370F",
									"low":"0.000",
									"q3":"199.195",
									"category":"Primary Tumor"
								}
							],
							"grouping":"Sample type"
						},
						{
							"stats":[
								{
									"value":"2.90869550667594e-11",
									"name":"Normal-vs-Stage1"
								},
								{
									"value":"1.62414526272414e-12",
									"name":"Normal-vs-Stage2"
								},
								{
									"value":"0",
									"name":"Normal-vs-Stage3"
								},
								{
									"value":"0.0114202999999999",
									"name":"Normal-vs-Stage4"
								},
								{
									"value":"0.175161",
									"name":"Stage1-vs-Stage2"
								},
								{
									"value":"0.31636",
									"name":"Stage1-vs-Stage3"
								},
								{
									"value":"0.94852",
									"name":"Stage1-vs-Stage4"
								},
								{
									"value":"0.7344",
									"name":"Stage2-vs-Stage3"
								},
								{
									"value":"0.45052",
									"name":"Stage2-vs-Stage4"
								},
								{
									"value":"0.62852",
									"name":"Stage3-vs-Stage4"
								}
							],
							"data":[
								{
									"n":"114",
									"median":"1.707",
									"q1":"0.803",
									"high":"13.482",
									"color":"#5669E3",
									"low":"0.133",
									"q3":"3.614",
									"category":"Normal"
								},
								{
									"n":"183",
									"median":"60.184",
									"q1":"13.217",
									"high":"529.475",
									"color":"#EF891D",
									"low":"0.401",
									"q3":"154.735",
									"category":"Stage1"
								},
								{
									"n":"615",
									"median":"63.279",
									"q1":"11.626",
									"high":"913.766",
									"color":"#AF7034",
									"low":"0.143",
									"q3":"226.762",
									"category":"Stage2"
								},
								{
									"n":"247",
									"median":"61.497",
									"q1":"17.034",
									"high":"758.350",
									"color":"#B1D413",
									"low":"0.000",
									"q3":"221.836",
									"category":"Stage3"
								},
								{
									"n":"20",
									"median":"127.877",
									"q1":"49.807",
									"high":"376.654",
									"color":"#F2370F",
									"low":"3.245",
									"q3":"229.543",
									"category":"Stage4"
								}
							],
							"grouping":"Individual Stages"
						},
						{
							"stats":[
								{
									"value":"1.11022302462516e-16",
									"name":"Normal-vs-Caucasian"
								},
								{
									"value":"1.55779833477254e-11",
									"name":"Normal-vs-AfricanAmerican"
								},
								{
									"value":"3.45379999999729e-06",
									"name":"Normal-vs-Asian"
								},
								{
									"value":"0.491",
									"name":"Caucasian-vs-AfricanAmerican"
								},
								{
									"value":"0.23188",
									"name":"Caucasian-vs-Asian"
								},
								{
									"value":"0.45686",
									"name":"AfricanAmerican-vs-Asian"
								}
							],
							"data":[
								{
									"n":"114",
									"median":"1.707",
									"q1":"0.803",
									"high":"13.482",
									"color":"#5669E3",
									"low":"0.133",
									"q3":"3.614",
									"category":"Normal"
								},
								{
									"n":"748",
									"median":"60.184",
									"q1":"10.791",
									"high":"756.727",
									"color":"#EF891D",
									"low":"0.000",
									"q3":"193.037",
									"category":"Caucasian"
								},
								{
									"n":"179",
									"median":"66.811",
									"q1":"13.190",
									"high":"922.434",
									"color":"#AF7034",
									"low":"0.193",
									"q3":"234.666",
									"category":"African American"
								},
								{
									"n":"61",
									"median":"104.025",
									"q1":"23.440",
									"high":"1011.124",
									"color":"#B1D413",
									"low":"0.333",
									"q3":"289.687",
									"category":"Asian"
								}
							],
							"grouping":"Patient race"
						},
						{
							"stats":[
								{
									"value":"0.0394789999999999",
									"name":"Normal-vs-Male"
								},
								{
									"value":"1.62447832963153e-12",
									"name":"Normal-vs-Female"
								},
								{
									"value":"0.53398",
									"name":"Male-vs-Female"
								}
							],
							"data":[
								{
									"n":"114",
									"median":"1.707",
									"q1":"0.803",
									"high":"13.482",
									"color":"#5669E3",
									"low":"0.133",
									"q3":"3.614",
									"category":"Normal"
								},
								{
									"n":"12",
									"median":"20.333",
									"q1":"6.671",
									"high":"727.865",
									"color":"#EF891D",
									"low":"2.405",
									"q3":"186.638",
									"category":"Male"
								},
								{
									"n":"1075",
									"median":"63.381",
									"q1":"12.997",
									"high":"776.891",
									"color":"#AF7034",
									"low":"0.000",
									"q3":"198.971",
									"category":"Female"
								}
							],
							"grouping":"Patient gender"
						},
						{
							"stats":[
								{
									"value":"1.62458935193399e-12",
									"name":"Normal-vs-Luminal"
								},
								{
									"value":"0.031603",
									"name":"Normal-vs-HER2positive"
								},
								{
									"value":"6.6884053850913e-11",
									"name":"Normal-vs-Triple negative"
								},
								{
									"value":"0.148602",
									"name":"Luminal-vs-HER2positive"
								},
								{
									"value":"0.42506",
									"name":"Luminal-vs-Triple-negative"
								},
								{
									"value":"0.12786",
									"name":"HER2positive-vs-Triple-negative"
								}
							],
							"data":[
								{
									"n":"114",
									"median":"1.707",
									"q1":"0.803",
									"high":"13.482",
									"color":"#5669E3",
									"low":"0.133",
									"q3":"3.614",
									"category":"Normal"
								},
								{
									"n":"566",
									"median":"52.275",
									"q1":"12.788",
									"high":"683.297",
									"color":"#EF891D",
									"low":"0.000",
									"q3":"173.725",
									"category":"Luminal"
								},
								{
									"n":"37",
									"median":"261.965",
									"q1":"62.515",
									"high":"1024.388",
									"color":"#AF7034",
									"low":"0.841",
									"q3":"396.738",
									"category":"HER2 positive"
								},
								{
									"n":"116",
									"median":"71.083",
									"q1":"8.654",
									"high":"612.918",
									"color":"#B1D413",
									"low":"0.143",
									"q3":"252.856",
									"category":"Triple negative"
								}
							],
							"grouping":"Major subclasses"
						},
						{
							"stats":[
								{
									"value":"1.11022302462516e-16",
									"name":"Normal-vs-Pre-Menopause"
								},
								{
									"value":"0.000496729999999945",
									"name":"Normal-vs-Peri-Menopause"
								},
								{
									"value":"1.6242562850266e-12",
									"name":"Normal-vs-Post-Menopause"
								},
								{
									"value":"0.28966",
									"name":"Pre-Menopause-vs-Peri-Menopause"
								},
								{
									"value":"0.82794",
									"name":"Pre-Menopause-vs-Post-Menopause"
								},
								{
									"value":"0.32752",
									"name":"Peri-Menopause-vs-Post-Menopause"
								}
							],
							"data":[
								{
									"n":"114",
									"median":"1.707",
									"q1":"0.803",
									"high":"13.482",
									"color":"#5669E3",
									"low":"0.133",
									"q3":"3.614",
									"category":"Normal"
								},
								{
									"n":"230",
									"median":"65.154",
									"q1":"11.925",
									"high":"816.321",
									"color":"#EF891D",
									"low":"0.328",
									"q3":"203.487",
									"category":"Pre-Menopause"
								},
								{
									"n":"37",
									"median":"51.395",
									"q1":"19.436",
									"high":"485.906",
									"color":"#AF7034",
									"low":"0.230",
									"q3":"113.887",
									"category":"Peri-Menopause"
								},
								{
									"n":"700",
									"median":"57.552",
									"q1":"12.834",
									"high":"776.891",
									"color":"#B1D413",
									"low":"0.000",
									"q3":"196.638",
									"category":"Post-Menopause"
								}
							],
							"grouping":"Menopause status"
						},
						{
							"stats":[
								{
									"value":"1.62436730732907e-12",
									"name":"Normal-vs-TP53-Mutant"
								},
								{
									"value":"1.62447832963153e-12",
									"name":"Normal-vs-TP53-NonMutant"
								},
								{
									"value":"0.151602",
									"name":"TP53-Mutant-vs-TP53-NonMutant"
								}
							],
							"data":[
								{
									"n":"114",
									"median":"1.707",
									"q1":"0.803",
									"high":"13.482",
									"color":"#5669E3",
									"low":"0.133",
									"q3":"3.614",
									"category":"Normal"
								},
								{
									"n":"334",
									"median":"99.400",
									"q1":"21.484",
									"high":"1035.928",
									"color":"#EF891D",
									"low":"0.193",
									"q3":"331.671",
									"category":"TP53-Mutant"
								},
								{
									"n":"698",
									"median":"50.043",
									"q1":"11.918",
									"high":"683.297",
									"color":"#AF7034",
									"low":"0.000",
									"q3":"169.822",
									"category":"TP53-NonMutant"
								}
							],
							"grouping":"TP53 mutation status"
						},
						{
							"stats":[
								{
									"value":"1.62458935193399e-12",
									"name":"Normal-vs-N0"
								},
								{
									"value":"0",
									"name":"Normal-vs-N1"
								},
								{
									"value":"8.88579987368132e-10",
									"name":"Normal-vs-N2"
								},
								{
									"value":"3.77400000028949e-07",
									"name":"Normal-vs-N3"
								},
								{
									"value":"0.015083",
									"name":"N0-vs-N1"
								},
								{
									"value":"0.55138",
									"name":"N0-vs-N2"
								},
								{
									"value":"0.071462",
									"name":"N0-vs-N3"
								},
								{
									"value":"0.0164633999999999",
									"name":"N1-vs-N2"
								},
								{
									"value":"0.4879",
									"name":"N1-vs-N3"
								},
								{
									"value":"0.047222",
									"name":"N2-vs-N3"
								}
							],
							"data":[
								{
									"n":"114",
									"median":"1.707",
									"q1":"0.803",
									"high":"13.482",
									"color":"#5669E3",
									"low":"0.133",
									"q3":"3.614",
									"category":"Normal"
								},
								{
									"n":"516",
									"median":"63.897",
									"q1":"10.650",
									"high":"671.055",
									"color":"#EF891D",
									"low":"0.273",
									"q3":"191.250",
									"category":"N0"
								},
								{
									"n":"362",
									"median":"62.789",
									"q1":"11.885",
									"high":"1011.124",
									"color":"#AF7034",
									"low":"0.000",
									"q3":"266.747",
									"category":"N1"
								},
								{
									"n":"120",
									"median":"57.557",
									"q1":"18.234",
									"high":"628.529",
									"color":"#B1D413",
									"low":"0.193",
									"q3":"250.334",
									"category":"N2"
								},
								{
									"n":"77",
									"median":"119.431",
									"q1":"39.540",
									"high":"1085.207",
									"color":"#F2370F",
									"low":"1.027",
									"q3":"293.117",
									"category":"N3"
								}
							],
							"grouping":"Nodal metastasis"
						}
					],
					"cancer":"Breast invasive carcinoma",
					"dataset":"TCGA",
					"gene":"S100P"
				}`);
          this.sharedservice.setanalysis(this.analysis);
          this.router.navigate(['PlotComponent']);
				}
		});
    }
    catch(ex)
    {
      alert(`UALCAN API Error2:
Please try again.
If the problem persists,
please contact support.`);
    }
  } 
}


