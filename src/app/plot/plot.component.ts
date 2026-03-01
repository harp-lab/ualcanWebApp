import { Component, OnInit, AfterViewInit, Signal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';

import { TypeaheadService } from '../services/typeahead.service';
import { SharedDataService } from "../services/SharedDataService.service";
import { PDFGenerator } from '@awesome-cordova-plugins/pdf-generator/ngx';
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/exporting';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'svg2pdf.js';

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
  title = signal<string>("");

  constructor(private route: ActivatedRoute, private typeahead: TypeaheadService, 
    private sharedservice: SharedDataService, private so: ScreenOrientation, private pdfGenerator: PDFGenerator) { 
    
    // find out changes in orientation
    this.so.onChange().subscribe(
      () => {
        this.resizeBoxPlot();
      }
    );
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
  
  // pdf generator //
  async downloadHighchart() {
    const chart = this.getChartInstance();

    if (chart) {
      const doc = new jsPDF('l', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // 1. Get High-Res SVG from Highcharts
      const svgString = (chart as any).exporting.getSVG({
        chart: {
          width: 1200,
          height: 800,
          marginTop: 50,    
          marginBottom: 100, 
          marginLeft: 100,  
          marginRight: 50,
          style: {
            fontFamily: 'Arial, Helvetica, sans-serif'
          }
        },
        xAxis: {
          title: {
            enabled: true,
            useHTML: false, // MANDATORY
            style: { fontSize: '16px', color: '#000000' }
          },
          labels: {
            enabled: true,
            useHTML: false, // MANDATORY
            style: { fontSize: '12px', color: '#000000' }
          }
        },
        yAxis: {
          title: {
            enabled: true,
            useHTML: false, // MANDATORY
            style: { fontSize: '16px', color: '#000000' }
          },
          labels: {
            enabled: true,
            useHTML: false, // MANDATORY
            style: { fontSize: '12px', color: '#000000' }
          }
        }
      });

      // 2. Create a temporary virtual element for svg2pdf to read
      const parser = new DOMParser();
      const svgElement = parser.parseFromString(svgString, 'image/svg+xml').documentElement;

      // 3. Draw SVG directly to Page 1
      // No PNGs, no signatures, no canvas!
      await doc.svg(svgElement, {
        x: 40,
        y: 40,
        width: pageWidth - 80,
        height: pageHeight - 80
      });

      // 4. Add Page 2 for the Table
      doc.addPage();
      doc.text('Plot Statistics', 40, 40);

      autoTable(doc, {
        html: '#plotStatistics', // Your HTML table ID
        startY: 60,
        theme: 'grid',
        useCss: true
      });

      // 5. Save on Mobile
      doc.save('Analytics_Report.pdf');
    }
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  ionViewWillEnter(){
    this.loadCharts(this.sharedservice.getdata(), this.sharedservice.getanalysis());
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
      this.title.set(`${gene} ${title} in ${cancer} profile based on ${dataset}`)
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
      this.statistics.set(stats);
    
    // Get the quartile 3 max so that the y-axis extreme can be dynamically set in landscape mode
    let q3Max, highMax;
    q3Max = (plotData).map(e => +e.q3).reduce((prev,curr) => curr>prev?curr:prev);
    highMax = (plotData).map(e => +e.high).reduce((prev,curr) => curr>prev?curr:prev);
    
    let config: Highcharts.Options = {
      credits: {
        enabled: false
      },
      chart: {
        type: 'boxplot',
        zooming: { singleTouch: false, type: 'xy' },
        panning: {
          enabled: true,
          type: 'xy'
        },
      },
      // title above the box plot
      title: {
        text: ""
      },	
      legend: {
        enabled: false
      },
      xAxis: {
        categories: (plotData).map(e => `${e.category}<br>(n=${e.n})`),
        lineWidth: 1,
        lineColor: 'black',
        labels: {
          style: { fontSize: (plotData).length > 6 ? '0.7em' :'0.8em'},
        },
        title: {
          text: `${dataset} samples`,style: {color:'black', fontSize: '0.9em',fontWeight: 'bold'},
          useHTML: true
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
          text: yAxis, style: {color:'black', fontSize: '1.2em',fontWeight: 'bold'}
        },
        labels: {
          style: {fontSize:'14px', fontFamily: 'arial'},
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
          whiskerWidth: 1.5,
          }
        },
      series: [{
        data: (plotData).map(e => ({
            low : +e.low,
            q1 : +e.q1,
            median : +e.median,
            q3 : +e.q3,
            high : +e.high,
            fillColor : e.color,
            color : e.color,
          })),
        tooltip: {
          headerFormat: `<em>${dataset} samples: {point.key}</em><br/>`
        },
        animation: false
      }],
      responsive: {
        rules: [{
          condition: {
            maxHeight: 400
          },
          // Make the labels less space demanding on mobile
          chartOptions: {
            xAxis: {
              labels: {
                formatter: function () {
                  return this.value.toString().split('<br>')[0]
                  //this.value.toString().split('<br>')[1].replace('(','').replace(')','');
                }
              }
            },
            yAxis: {
              max: q3Max + ((highMax - q3Max) / 10)
            }
          },
        }]
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