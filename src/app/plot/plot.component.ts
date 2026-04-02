import { Component, OnInit, AfterViewInit, signal, ElementRef, ViewChild } from '@angular/core';
import { SharedDataService } from "../services/shareddata.service";
import { PDFGenerator } from '@awesome-cordova-plugins/pdf-generator/ngx';
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/exporting';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss', '../shared.scss'],
  standalone: false
})

export class PlotComponent implements OnInit, AfterViewInit {
  content: string;
  data:any;
  statistics = signal<{
    name: string; 
    value: string;
    style: {color: string; fontWeight: string};
  }[]>([]);
  groupings = signal<string[]>([]);
  analysis: string = "";
  @ViewChild('plotStatistics') tableRef: ElementRef<HTMLElement>;
  // Use SafeHtml type for the variable
  public SafeSharedCss: SafeHtml;
  private readonly sharedCss: string = `
                      .plotStatisticsTable {
                        width:100%;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 0.9em;
                        border: 1px solid black;
                      }
                      .plotStatistics{
                        border: 2.5px solid grey;
                        vertical-align:middle;
                        text-align: center;
                      }
                      .plotStatisticsHeader{
                        background-color:#C8F6FE;
                        font-weight:bold;
                      }
                      .plotStatisticsCell{
                        background-color:#DFFEFC;
                      }`

  constructor(private sharedservice: SharedDataService, private pdfGenerator: PDFGenerator, private sanitizer: DomSanitizer) { 
    // Tell Angular this string is safe to render as a style tag
    this.SafeSharedCss = this.sanitizer.bypassSecurityTrustHtml(
      `<style>${this.sharedCss}</style>`
    );
  }
  
  // 1. Create a reference to the handler so we can remove it later
  private orientationHandler = () => {
    // Optional: Add a small timeout if the chart resizes before layout is ready
    setTimeout(() => this.resizeBoxPlot(), 200);
  };

  private mediaQuery = window.matchMedia("(orientation: portrait)");

  ionViewDidEnter() {
    // Start listening when the view is active
    this.mediaQuery.addEventListener("change", this.orientationHandler);
  }

  ionViewWillLeave() {
    // Stop listening the moment the user clicks 'Back'
    this.mediaQuery.removeEventListener('change', this.orientationHandler);
  }

  getChartInstance(): Highcharts.Chart {
    const container = document.getElementById('box-plot');
    const chartIndex = container?.getAttribute('data-highcharts-chart');
    return Highcharts.charts[chartIndex];
  }

  resizeBoxPlot()
  {
    const chart = this.getChartInstance();

    if (chart) {
      chart.reflow();
    }
  }

  getChartSVG(): string{
    let chartSVG = "";
    const chart = this.getChartInstance();

    if (chart) {

      let height = chart.chartHeight;
      let width = chart.chartWidth;
      
      // Get the screen orientation so we can match the export to the screen
      const orientation = this.mediaQuery.matches ? 'portrait' : 'landscape';
      if(orientation === 'landscape'){
        let multiplier = Math.min(1000 / width, 700 / height);
        width = width * multiplier;
        height = height * multiplier;
      }else{
        let multiplier = Math.min(700 / width, 1000 / height);
        width = width * multiplier;
        height = height * multiplier;
      }
      
      // Get the Chart SVG with fixed dimensions for the PDF
      // Setting sourceWidth/Height to standard Letter proportions (~11:8.5)
      chartSVG = chart.exporting.getSVG({
        chart: {
          height: height,
          width: width,  
          events: {
          load: function(){
            }
          }
        }
      });
    }
    return chartSVG;
  }

  getFilename(): string{
    // Generate Timestamp (e.g., 2026-02-23T14-30-00)
      const timestamp = new Date().toISOString()
        .replace(/T/, '-')    // Replace T with a hyphen
        .replace(/\..+/, '')  // Remove milliseconds
        .replace(/:/g, '');  // Replace colons
      let g = this.sharedservice.gene.toLowerCase();
      let c = this.sharedservice.cancer.toLowerCase();
      let a = this.sharedservice.analysis.toLowerCase();

      return `${g}-${a}-${c}-${timestamp}`;
  }

  getSharingMessage(): string{
    let g = this.sharedservice.gene.toLowerCase();
    let c = this.sharedservice.cancer.toLowerCase();
    let a = this.sharedservice.analysis.toLowerCase();

      return `${g} ${a} ${c}`;
  }
  
  // pdf generator //
  downloadHighchart() {
    let chartSVG = this.getChartSVG();

    if (chartSVG) {

      // 3. Get the table HTML if it exists
      const tableHTML = this.tableRef ? this.tableRef.nativeElement.outerHTML : "";

      // 4. Assemble Content with Page Break CSS
      const finalHTML = `
        <html>
          <head>
            <style>
              .chart-page {
                display: flex;
                flex-direction: column;
                justify-content: center; 
                align-items: center;     
                height: 100%;           
                width: 100%;
              }
              .table-page { 
                break-before: page;       /* Modern CSS3 */
                page-break-before: always; /* Legacy for older PDF engines */
                display: block;   
                padding: 20px; 
              }
              ${this.sharedCss}
            </style>
          </head>
          <body>
            <!-- PAGE 1: The Chart -->
            <div class="chart-page">
              ${chartSVG}
            </div>
            ${tableHTML ?
            `<!-- PAGE 2: The Statistics -->
            <div class="table-page">
              ${tableHTML}
            </div>` : ""}
          </body>
        </html>
      `;

      // Get the screen orientation so we can match the export to the screen
      const orientation = this.mediaQuery.matches ? 'portrait' : 'landscape';
      
      let filename = this.getFilename();

      let options = {
        documentSize: 'letter',
        type: 'share', 
        fileName: `${filename}.pdf`,
        landscape: orientation === 'landscape' ? 'landscape' as const : 'portrait' as const
      };

      // Generate the PDF
      this.pdfGenerator.fromData(finalHTML, options)
        .then(base64 => console.log('PDF Created'))
        .catch(err => console.error(err));
    }   
  }

  createChartPNG(){
    let chartSVG = this.getChartSVG();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const base64Data = canvas.toDataURL('image/png');
        this.shareChart(base64Data);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(chartSVG)));
  }

  shareChart(imgData) {
    (window as any).plugins?.socialsharing.share(
        this.getSharingMessage(),
        this.getFilename(),
        imgData,
        null
    );
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  ionViewWillEnter(){
    this.loadCharts(this.sharedservice.data, this.sharedservice.analysis);
    this.showPlot(0);
  }

  show(event: any){
    const selectedValue = event.target.value;
    this.showPlot(this.data.plots.findIndex(plot => plot.grouping === selectedValue));
  }

  showPlot(index:number){

    let gene = this.data.gene;
    let cancer = this.data.cancer;
    let dataset = this.data.dataset;
    let yAxis = this.data.yAxis;
    let statsData = this.data.plots[index].stats;
    let plotData = this.data.plots[index].data;
    let grouping = this.data.plots[index].grouping;

    let title = ''
      switch (this.analysis) {
        case 'expression':
          title = 'expression';
          break;
        case 'methylation':
          title = 'promoter methylation';
          break;
        case 'proteomics':
          title = 'proteomic expression';
          break;
        default:
      }
      
      let stats = statsData?.map((stat:any) => {
            var statNumber = Number(stat.value);
            var statString = '';
            if(isNaN(statNumber)){
              statString = stat.value;
            }else if(statNumber === 0){
              statString = '<1.00e-12';
            }else{
              statString = statNumber.toExponential(2);
            }
            var statStyle = statNumber < 0.05 ? {color:'#D55C24', fontWeight:'bold'} : {color:'#131110'};
            return { name: stat.name, value: statString, style: statStyle };
          });
      this.statistics.set(stats ?? []);
    
    // Get the quartile 3 max so that the y-axis extreme can be dynamically set in landscape mode
    let q3Max, highMax;
    q3Max = plotData.map(e => +e.q3).reduce((prev,curr) => curr>prev?curr:prev);
    highMax = plotData.map(e => +e.high).reduce((prev,curr) => curr>prev?curr:prev);
    
    let config: Highcharts.Options = {
      credits: {
        enabled: false
      },
      chart: {
        type: 'boxplot',
        zooming: { 
          singleTouch: false, 
          pinchType: 'x',
          type: 'x',
          resetButton: {
            position: {
              align: 'right',
              verticalAlign: 'top'
            }
          },
        },
        panning: {
          enabled: true,
          type: 'x'
        },
        events: {
          load: function(){
						if(this.xAxis[0].max > 10){
							this.xAxis[0].setExtremes(0, 10); 
						}
					}
        }
      },
      // title above the box plot
      title: {
        text: `${gene} ${title} in ${cancer} profile based on ${dataset} ${grouping}`,
        style: {color:'black', fontSize: '1.2em',fontWeight: 'bold'},
        align: 'center',
        useHTML: true
      },	
      legend: {
        enabled: false
      },
      xAxis: {
        categories: plotData.map(e => `${e.category}<br>(n=${e.n})`),
        lineWidth: 1,
        lineColor: 'black',
        labels: {
          style: { fontSize: plotData.length > 5 ? '0.5em' :'0.6em'},
          formatter: function () {
            // Hide (n=xxx) on x-axis labels 
            return this.value.toString().split('<br>')[0]
          }
        },
        title: {
          text: `${dataset} samples`,
          style: {color:'black', fontSize: '0.9em',fontWeight: 'bold'},
          useHTML: true
        },
        events: {
          afterSetExtremes: function(e) {
            // Check if we are zoomed in: Does the current view (min/max) 
            // match the total data range (dataMin/dataMax)?
            let isZoomed = (e.min > e.dataMin || e.max < e.dataMax);
            const chart = this.chart as any;
            if (isZoomed && !chart.resetZoomButton) {
                chart.showResetZoom();
            }
          }
        }
      },
      yAxis: {
        lineWidth: 1,
        lineColor: 'black',
        gridLineWidth: 0,
        tickWidth: 1,
        tickLength: 10,
        tickColor: 'black',
        title: {
          text: yAxis, 
          style: {color:'black', fontSize: '0.9em',fontWeight: 'bold'},
          useHTML: true
        },
        labels: {
          style: {fontSize:'0.6em', fontFamily: 'arial'},
        }
      },
      plotOptions : {
        boxplot: {
          lineWidth: 1.5,
          stemWidth: 1.5,
          medianColor: '#000000',
          medianWidth: plotData.medianWidth,
          stemColor: 'black',
          whiskerColor: 'black',
          whiskerWidth: 1.5
        }
      },
      series: [{
        data: plotData.map(e => ({
            low : +e.low,
            q1 : +e.q1,
            median : +e.median,
            q3 : +e.q3,
            high : +e.high,
            fillColor : e.color,
            color : e.color,
          })),
        animation: false
      }],
      tooltip: {
        headerFormat: `<em>${dataset} samples: {point.key}</em><br/>`,
        followTouchMove: false
      },
      responsive: {
        rules: [{
          condition: {
            maxHeight: 400
          },
          // Don't show y-axis extremes on mobile 
          chartOptions: {
            yAxis: {
              max: q3Max + ((highMax - q3Max) / 10)
            }
          },
        }]
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: ['back', 'separator', 'export', 'separator', 'share', ]
          }
        },
        menuItemDefinitions: {
            // Custom definition
            export: {
              onclick: () => {
                  this.downloadHighchart();
              },
              text: 'Save PDF'
            },
            back: {
              onclick: () => {
                  window.history.back();
              },
              text: 'Go Back'
            },
            share: {
              onclick: () => {
                this.createChartPNG();
              },
              text: 'Share PNG'
            }
        },
      },
      navigation: {
        buttonOptions: {
            verticalAlign: 'top', align: 'right'
        }
      }
    };

    Highcharts.chart("box-plot", config);
}

  loadCharts(data:string, analysis:string){
    this.data = JSON.parse(data);
    this.analysis = analysis;
    this.groupings.set(this.data.plots.map(p => p.grouping));
  } 
}