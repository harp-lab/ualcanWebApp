import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { TypeaheadService } from '../services/typeahead.service';
import { SharedDataService } from "../services/SharedDataService.service";
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';

declare var createBoxPlot:any;
declare var resizeBoxPlot:any;

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss', '../shared.scss'],
})
export class PlotComponent implements OnInit, AfterViewInit {

  content: string;

  constructor(private route: ActivatedRoute, private typeahead: TypeaheadService, 
    private sharedservice: SharedDataService, private so: ScreenOrientation, private pdfGenerator: PDFGenerator) { 
    // find out changes in orientation
    this.so.onChange().subscribe(
      () => {
        resizeBoxPlot($(`#container${$("#plotSelect").prop("selectedIndex")}`));
      }
    );
  }
  
  // pdf generator //
  downloadHighchart() {
    let plotCard = $('#plotCard');
    let containerDiv = plotCard.find(`#containerDiv${$("#plotSelect").prop("selectedIndex")}`);
    let container = plotCard.find(`#container${$("#plotSelect").prop("selectedIndex")}`);
    containerDiv.css("height", "80%");
    plotCard.css("height", "700px");
    plotCard.css("width", "500px");
    resizeBoxPlot(container);
    let clonedTable = $('#plotCard').clone();
    containerDiv.css("height", "95%");
    plotCard.css("height", "");
    plotCard.css("width", "");
    resizeBoxPlot(container);
    this.content = clonedTable.prop('outerHTML');
    console.log(this.content);
    let options = {
      documentSize: 'A4',
      type: 'share', 
      fileName: 'plot.pdf'
    };
    this.pdfGenerator.fromData(this.content, options)
      .then((base64) => {
        console.log('OK', base64);
      }).catch((error) => {
        console.log('error', error); 
      });

  }

  ngOnInit() {}

  ngAfterViewInit() {}

  ionViewWillEnter(){
    loadCharts(this.sharedservice.getdata());
    showPlot();
  }

  show(){
    showPlot();
  }
}

function showPlot(){
    $('.containerx').hide();
    $(`#container${$("#plotSelect").prop("selectedIndex")}x`).show();
    resizeBoxPlot($(`#container${$("#plotSelect").prop("selectedIndex")}`));
  }

function loadCharts(jsonData:any):string{
    let data:any = JSON.parse(jsonData);
    
    data.plots.forEach((plot:any,index:any) => {
      $('#plotTitle').html(`<b>${data.gene} expression in ${data.cancer} profile based on&nbsp;&nbsp;</b>`);
      $('#plotSelect').append(`<option ${plot.selected===true?'selected':''}>${plot.grouping}</option>`);
        $('#plotTable').append(
        `<div align=center id="container${index}x" class="containerx plotDiv" style="height:95%;display:none;">
            <div id="containerDiv${index}" style="height:95%;">
                <div id="container${index}" class="container" style="height:95%;"></div>
            </div>
            <table align="center" border="1" style="width:100%;">
              <tbody>
                <tr align="center" style="background-color:#C8F6FE;font-weight:bold;">
                  <td style="border: 2.5px solid grey;vertical-align:middle;background-color:#C8F6FE;font-weight:bold;">Comparison</td>
                  <td style="border: 2.5px solid grey;vertical-align:middle;background-color:#C8F6FE;font-weight:bold;"><b>Statistical significance</b></td>
                </tr>
                ${plot.stats.map((stat:any) => {
                  return `<tr style=${stat.name.substring(0, 7) === 'Normal-' ? '"color:#D55C24;font-weight:bold;"' : '"color:#131110;"'} align="center">
                    <td style="border: 2.5px solid grey;vertical-align:middle;background-color:#DFFEFC;">${stat.name}</td>
                    <td style="border: 2.5px solid grey;vertical-align:middle;background-color:#DFFEFC;">${Number(stat.value).toFixed(4)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
        </div>`);
        createBoxPlot(`container${index}`,false,data.gene,data.cancer,data.dataset,data.yAxis,plot.data,undefined,false);
    });
    return data.gene;
  }  
