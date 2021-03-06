//Create Area in area SVG
function createArea(width, height) {
    var area = d3.select("#area")   //Set width and height of area SVG
        .attr("width", width)
        .attr("height", height);

    area.append("g")    //Add g element inside area svg and translate
        .attr("transform", "translate(0, 0)")
        .classed("area", true);

    area.append("text")  //Add title for pie chart
        .attr("x", width / 2)   //Set x and y positions
        .attr("y", "1em")
        .attr("font-size", "1.2em")  //Set font size
        .style("text-anchor", "middle")
        .classed("area-title", true);   //Add class for title 
}
//Draw Pie chart in pie SVG
function drawArea(data){
	var margin = {top: 20, right: 60, bottom: 30, left: 30},
		width = 500 - margin.left - margin.right, 
		height = 500 - margin.top - margin.bottom;
    var svg = d3.select("#area")
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
	  .append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	var tsvData = null;

	var parseDate = d3.timeParse('%Y');

	var formatSi = d3.format(".3s");

	var formatNumber = d3.format(".1f"),
		formatBillion = function(x) { return formatNumber(x / 1e9); };

	var x = d3.scaleTime()
		.range([0, width]);

	var y = d3.scaleLinear()
		.range([height, 0]);

	var color = d3.scaleOrdinal(d3.schemeCategory20);

	var xAxis = d3.axisBottom()
		.scale(x);

	var yAxis = d3.axisLeft()
		.scale(y)
		.tickFormat(formatBillion);

	var area = d3.area()
		.x(function(d) { 
		  return x(d.data.date); })
		.y0(function(d) { return y(d[0]); })
		.y1(function(d) { return y(d[1]); });

	var stack = d3.stack()

	d3.csv('./data/data.csv', function(error, data) {
	  color.domain(d3.keys(data[0]).filter(function(key) { return key !== 'date'; }));
	  var keys = data.columns.filter(function(key) { return key !== 'date'; })
	  data.forEach(function(d) {
		d.date = parseDate(d.date); 
	  });
	  tsvData = (function(){ return data; })();


	  var maxDateVal = d3.max(data, function(d){
		var vals = d3.keys(d).map(function(key){ return key !== 'date' ? d[key] : 0 });
		return d3.sum(vals);
	  });
	  
	  // Set domains for axes
	  x.domain(d3.extent(data, function(d) { return d.date; }));
	  y.domain([0, maxDateVal])

	  stack.keys(keys);

	  stack.order(d3.stackOrderNone);
	  stack.offset(d3.stackOffsetNone);

	  console.log(stack(data));

	  var browser = svg.selectAll('.browser')
		  .data(stack(data))
		.enter().append('g')
		  .attr('class', function(d){ return 'browser ' + d.key; })
		  .attr('fill-opacity', 0.5);

	  browser.append('path')
		  .attr('class', 'area')
		  .attr('d', area)
		  .style('fill', function(d) { return color(d.key); });
		  
	  browser.append('text')
		  .datum(function(d) { return d; })
		  .attr('transform', function(d) { return 'translate(' + x(data[13].date) + ',' + y(d[13][1]) + ')'; })
		  .attr('x', -6) 
		  .attr('dy', '.35em')
		  .style("text-anchor", "start")
		  .text(function(d) { return d.key; })
		  .attr('fill-opacity', 1);

	  svg.append('g')
		  .attr('class', 'x axis')
		  .attr('transform', 'translate(0,' + height + ')')
		  .call(xAxis);

	  svg.append('g')
		  .attr('class', 'y axis')
		  .call(yAxis);

	  svg.append ("text")
		.attr("x", 0-margin.left)
		.text("Billions of liters")
	   
	});
}