import { Component, OnInit, AfterViewInit, Signal, signal } from '@angular/core';
import { SharedDataService } from "../services/SharedDataService.service";
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/exporting';

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

  constructor(private sharedservice: SharedDataService) { 
  }

  // 1. Create a reference to the handler so we can remove it later
  private orientationHandler = () => {
    // Optional: Add a small timeout if the chart resizes before layout is ready
    setTimeout(() => this.resizeBoxPlot(), 200);
  };

  ionViewDidEnter() {
    // 2. Start listening when the view is active
    // Standard W3C API supported by modern Android WebViews
    if (screen.orientation) {
      screen.orientation.addEventListener('change', this.orientationHandler);
    }
  }

  ionViewWillLeave() {
    // 3. Stop listening the moment the user clicks 'Back'
    if (screen.orientation) {
      screen.orientation.removeEventListener('change', this.orientationHandler);
    }
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
  downloadHighchart() {
    const chart = this.getChartInstance();

    if (chart) {
      alert('Generating PDF... This may take a moment.');
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

    const root = document.documentElement;
    const safeAreaBottomValueString = getComputedStyle(root).getPropertyValue('--ion-safe-area-bottom');
    const safeAreaBottomValue = parseFloat(safeAreaBottomValueString.replace('px', ''));

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
        zooming: { 
          singleTouch: false, 
          type: 'x' },
        panning: {
          enabled: true,
          type: 'x'
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
        categories: (plotData).map(e => `${e.category}<br>(n=${e.n})`),
        lineWidth: 1,
        lineColor: 'black',
        labels: {
          style: { fontSize: (plotData).length > 5 ? '0.5em' :'0.6em'},
        },
        title: {
          text: `${dataset} samples`,
          style: {color:'black', fontSize: '0.9em',fontWeight: 'bold'},
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
          headerFormat: `<em>${dataset} samples: {point.key}</em><br/>`,
          followTouchMove: false,
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
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: ['back', 'separator', 'viewFullscreen', 'separator', 'export', 'separator', 'downloadPNG', 'downloadJPEG', 'downloadSVG']
          }
        },
        menuItemDefinitions: {
            // Custom definition
            export: {
                onclick: () => {
                    this.downloadHighchart();
                },
                text: 'Export PDF'
            },
            back: {
                onclick: () => {
                    window.history.back();
                },
                text: 'Go back to search'
            },
            viewFullscreen: {
              text: 'View in full screen'
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