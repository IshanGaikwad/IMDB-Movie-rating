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
    var area = d3.select("#area"),
	margin = {top: 20, right: 20, bottom: 30, left: 50},
	width = +area.attr("width") - margin.left - margin.right,
	height = +area.attr("height") - margin.top - margin.bottom,
	g = area.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var parseDate = d3.timeParse("%Y/%m/%d %H:%M");

	var color = d3.scaleOrdinal()
	  .domain(["PVkW", "TBLkW"])
	  .range(["rgba(249, 208, 87, 0.7)", "rgba(54, 174, 175, 0.65)"]);

	var x = d3.scaleTime().range([0, width]),
	  y = d3.scaleLinear().range([height, 0]),
	  z = color;

	var area = d3.area()
	  .curve(d3.curveMonotoneX)
	  .x(function(d) { return x(d.date); })
	  .y0(y(0))
	  .y1(function(d) { return y(d.kW); });

	d3.csv("./data/kW_zoomed.csv", type, function(error, data) {
	  if (error) throw error;

	  var sources = data.columns.slice(1).map(function(id) {
		return {
		  id: id,
		  values: data.map(function(d) {
			return {date: d.date, kW: d[id]};
		  })
		};
	  });
	  
	  //console.log(sources);

	  x.domain(d3.extent(data, function(d) { return d.date; }));
	  y.domain([
		0,
		d3.max(sources, function(c) { return d3.max(c.values, function(d) { return d.kW; }); })
	  ]);
	  z.domain(sources.map(function(c) { return c.id; }));

	  g.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," + height + ")")
		  .call(d3.axisBottom(x));

	  g.append("g")
		  .attr("class", "axis axis--y")
		  .call(d3.axisLeft(y))
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", "0.71em")
		  .attr("fill", "#000")
		  .text("Power, kW");

	  var source = g.selectAll(".area")
		  .data(sources)
		  .enter().append("g")
		  .attr("class", function(d) { return `area ${d.id}`; })

	  source.append("path")
		   .attr("d", function(d) { 
			//console.log(area(d.values)); 
			return area(d.values); })
		   .style("fill", function(d) { return z(d.id); });
	});

	function type(d, _, columns) {
	  d.date = parseDate(d.date);
	  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
	  return d;
	}
}