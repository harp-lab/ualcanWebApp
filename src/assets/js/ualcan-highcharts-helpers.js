function resizeBoxPlot(container)
{
	var index=container.data('highchartsChart');
 	var chart=Highcharts.charts[index];
	chart.reflow();
}
function createBoxPlot(containerId, showJitter, gene, cancer, dataset, yAxis, data, medianWidth=2.5, enableJitter=true, scatterMarkerRadius=2, plotIterator){

	if(!window.Highcharts || +window.Highcharts.version.replace('.','') < +'7.0.2'.replace('.','')){
		enableJitter = false;
		console.log(`Jitter requires highcharts at least version 7.0.2 and version detected was ${window.Highcharts.version}`)
	}

	if(enableJitter == false){
		showJitter = false;
	}

	if(enableJitter == true){
		addJitterCSS();
	}

	let plotIndex, singlePlotData;
	if(plotIterator === undefined){
		plotIndex = -1;
	}else{
		plotIndex = Math.abs(plotIterator % data.length);
		singlePlotData = [data[plotIndex]];
	}

	//Data validation
	// data.map(e => e.n!=e.scatterData.length?console.log(`${e.n}!=${e.scatterData.length}`):null);
	// data.map(e => {let min=e.scatterData.map(point => point[1]).reduce((prev,curr) => curr<prev?curr:prev);e.low!=min.toFixed(3)?console.log(`${e.category}:${e.low}!=${min}`):null;});
	
	let dsMin, dsMax, yMin, yMax;
	if(showJitter){
		dsMin = (singlePlotData??data).map(cat => cat.scatterData.map(point => point[1]).reduce((prev,curr) => curr<prev?curr:prev)).reduce((prev,curr) => curr<prev?curr:prev);
		dsMax = (singlePlotData??data).map(cat => cat.scatterData.map(point => point[1]).reduce((prev,curr) => curr>prev?curr:prev)).reduce((prev,curr) => curr>prev?curr:prev);
		let yInterval = (dsMax - dsMin) / 8;
		yMin = Math.floor(dsMin / yInterval) * yInterval;
		yMax = Math.ceil(dsMax / yInterval) * yInterval;
		//scatterMarkerRadius = ((1 - 2) / (20 - 2)) * data.length + (38 / 18);
	}
	let config = {
		credits: {
			enabled: false
		},
		chart: {
			type: 'boxplot',
			zoomBySingleTouch: false,
        	zoomType: 'xy',
			panning: {
				enabled: true,
				type: 'xy'
			},
			...enableJitter?{events: {
				render: function(chart) {
					if(enableJitter){
						let containerElement = $(`#${containerId}`);
						let checkboxElement = containerElement.siblings('div.switchContainer').find('input')
						if(checkboxElement.length == 0){
							let switchHTML = 
								`<br/><div class="switchContainer">
									<font size="4" face="arial" class="switchLabel"><b>Box Plot</b></font>
									<label class="switch">
										<input type="checkbox"  ${showJitter?'checked':''}>
										<span class="slider round"></span>
									</label>
									<font size="4" face="arial" class="switchLabel"><b>Jitter Plot</b></font>
									<font size="2" face="arial" class="switchLabel"><b>(Show Samples)</b></font>
								</div>`;
							$(switchHTML).insertAfter(containerElement);
							
							checkboxElement = containerElement.siblings('div.switchContainer').find('input');
							checkboxElement.on('click', function(){
								event.cancelBubble = true;
								createBoxPlot(containerId, this.checked, gene, cancer, dataset, yAxis, data, medianWidth, enableJitter, scatterMarkerRadius, plotIterator);
							});
						}
					}
				}
			}}:{}
		},
		// title above the box plot
		title: {
			text: ""
			//text: `Expression level of ${gene} in ${cancer}`,
			//style: {fontSize: '1.5em'}
		},	
		legend: {
			enabled: false
		},
		xAxis: {
			categories: (singlePlotData??data).map(e => `${e.category}<br>(n=${e.n})`),
			style: {fontSize: '1.8em',fontWeight: 'bold'},
			lineWidth: 1,
			lineColor: 'black',
			title: {
				text: `${dataset} samples`,style: {color:'black', fontSize: '0.9em',fontWeight: 'bold'},
				useHTML: true
			}
		},
		yAxis: {
			...showJitter?{
				min: yMin,
				max: yMax,
				endOnTick: false
			}:{},
			lineWidth: 1,
			lineColor: 'black',
			gridLineWidth: 0,
			tickWidth: 1,
			tickLength: 10,
			tickColor: 'black',
			title: {
				text: yAxis,style: {color:'black', fontSize: '1.2em',fontWeight: 'bold'}
			},
			labels: {
				style: {fontSize:'14px', fontFamily: 'arial'},
			}
		},
		plotOptions : {
			...showJitter?{series: {
				stickyTracking: false
			}}:{},
			boxplot: {
				lineWidth: 1.5,
				stemWidth: 1.5,
				medianColor: '#000000',
				medianWidth: medianWidth,
				stemColor: 'black',
				whiskerColor: 'black',
				whiskerWidth: 1.5,
				stemDashStyle: 'shortdash',
				},
				...showJitter?{scatter: {
					jitter: {
						x: 0.24 // Exact fit for box plot's groupPadding and pointPadding
					},
					marker: {
						symbol: 'circle',
						radius: scatterMarkerRadius,
						lineWidth: 0.25,
						lineColor: '#000000'
					},
					tooltip: {
						headerFormat: '<em>{series.name}</em><br/>',
						pointFormatter: function() {
							if(this.options.id != null)
							{
								return `ID: ${this.options.id}<br/>Value: ${this.y}`;
							}
							else
							{
								return 'no property found'
							}
								
						}
					}
				}}:{},
			},
		series: [{
			data: (singlePlotData??data).map(e => ({
					low : +e.low,
					q1 : +e.q1,
					median : +e.median,
					q3 : +e.q3,
					high : +e.high,
					fillColor : showJitter?'none':e.color,
					color : showJitter?'black':e.color,
				})),
			tooltip: {
				headerFormat: `<em>${dataset} samples: {point.key}</em><br/>`
			}},
			...showJitter?
				(singlePlotData??data).map((e, index) => ({
						name : e.category,
						type : 'scatter',
						data : e.scatterData.map((sd) => ({x:index, y:sd[1], id:sd[0]})),
						color : e.color
					})
				)
			:[]
		]
	};
	
	return $(`#${containerId}`).highcharts(config);
}

function addJitterCSS(){

	let jitterCSS = 
	`/* https://www.w3schools.com/howto/howto_css_switch.asp */

	/* The label for the switch*/
	.switchLabel {
		vertical-align: bottom;
	}

	/* The switch - the box around the slider */
	.switch {
		position: relative;
		display: inline-block;
		width: 30px;
		height: 17px;
		top: 0;
		vertical-align: top;
	}

	/* Hide default HTML checkbox */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The slider */
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: red;
		-webkit-transition: .4s;
		transition: .4s;
	}

	.slider:before {
		position: absolute;
		content: "";
		height: 13px;
		width: 13px;
		left: 2px;
		bottom: 2px;
		background-color: white;
		-webkit-transition: .4s;
		transition: .4s;
	}

	input:checked + .slider {
		background-color: blue;
	}

	input:focus + .slider {
		box-shadow: 0 0 1px #D5FAA4;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(13px);
		-ms-transform: translateX(13px);
		transform: translateX(13px);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 17px;
	}

	.slider.round:before {
		border-radius: 50%;
	}`;

	let jitterCSSId = 'highchartsJitterCSS';

	let jitterCSSStyleElement = $(`head #${jitterCSSId}`);

	if(jitterCSSStyleElement.length == 0){
		$('<style>')
		.prop('type', 'text/css')
		.prop('id', jitterCSSId)
		.html(jitterCSS)
		.appendTo('head');
	}
}