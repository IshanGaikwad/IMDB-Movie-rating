//Create Pie in pie SVG
function createPie(width, height) {
    var pie = d3.select("#pie")   //Set width and height of pie SVG
        .attr("width", width)
        .attr("height", height);

    pie.append("g")    //Add g element inside pie svg and translate
        .attr("transform", "translate(" + width / 2 + ", " + (height / 2 + 10) + ")")
        .classed("chart", true);

    pie.append("text")  //Add title for pie chart
        .attr("x", width / 2)   //Set x and y positions
        .attr("y", "1em")
        .attr("font-size", "1.2em")  //Set font size
        .style("text-anchor", "middle")
        .classed("pie-title", true);   //Add class for title 
}
//Draw Pie chart in pie SVG
function drawPie(data){
    var pie = d3.select("#pie");
	var twopie = 2 * Math.PI;

    var arcs = d3.pie().sort(null)   //Create arcs from values
        .value(d => d);
        
    var radius = +pie.attr("height") / 2 - 50;  //Radius of pie
    var path = d3.arc()    //Arc path with inner & outer radius
        .outerRadius(radius)
        .innerRadius(0);
		
	// Add arc with inner & outer radius and start angle
    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);
    // Mouseover arc with inner & outer radius and start angle
    var arcOver = d3.arc()
        .innerRadius(0)
     .outerRadius(radius + 10);
		
	var outerArc = d3.arc()
	    .innerRadius(radius * 0.9)
	    .outerRadius(radius * 0.9);
	//Lavel in arc	
	var label = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);
		
	var mv_type = ["Ratings above 8" ," Ratings between 5 to 8"," Ratings Below 4"];   //Types
	var colors = ["#588BAE", "#50C878", "#b80f0a"];                  //Respective Colors for Energy Types
	var mvData = [6,10,4];
	
	//Set pie chart color scale for energy types and colors		
    var colorScale = d3.scaleOrdinal()
        .domain(mv_type)
        .range(colors);
    //Data binding on pie chart
    var update = pie
        .select(".chart")
        .selectAll(".arc")
        .data(arcs(mvData));

    update
        .exit()
        .remove();

    update
        .enter()
        .append("path")
        .classed("arc", true)
		.on("mouseover", function(d, i) {   //Mouseover event for arc
                    d3.select(this)      // make a selection of the parent g
                    //.select("path")    // select the child path element
                    .transition()      // create a transition for the path
                    .attr("d", arcOver)// update the path's d attribute
                    .duration(1000);   // do it slowly.
            
		})					
		.on("mouseout", function(d) {		//Mouseout event for arc
				d3.select(this)      // make a selection of the parent g
				//.select("path")    // select the child path element
				.transition()      // create a transition for the path
				.attr("d", arc)    // update the path's d attribute
				.duration(1000);   // do it slowly.
		})
        .attr("stroke", "#dff1ff")
        .attr("stroke-width", "0.25px")
        .merge(update)
		.attr("fill", (d,i) => colors[i])  //colorScale(d.Energy_type)
		.transition()
		.duration(1000)    //Apply transition on each arc of pie chart
		.attrTween('d', function(d) {
		   var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
		   return function(t) {
			   d.endAngle = i(t);
			 return path(d);
		   }
		});
	
    pie.select(".chart").selectAll("text")   // Display text of type on pie chart
      .data(arcs(mvData), function(d) {
        return d.data;
      })
      .enter()
      .append("text")
      .attr("transform", function(d,i){   //Set text position
        var pos = outerArc.centroid(d);
        pos[0] = radius * (midAngle(d) < Math.PI ? 1.1 : -1.1);
		var percent = (d.endAngle - d.startAngle)/(2*Math.PI)*100
       if(percent<3){
       //console.log(percent)
       pos[1] += i*15
       }
        return "translate("+ pos +")";
      })
      .text(function(d,i) {
		return (isNaN(d.data) === true) ?  "Data Not Available" : mv_type[i]+" ("+d.data+")"; })
      .attr("fill", function(d,i) { return colors[i]; })
      .attr("text-anchor", 'left')
      .attr("dx", function(d){
      var ac = midAngle(d) < Math.PI ? 0:-60
              return ac
      })
      .attr("dy", 5 );
	  
	function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
	// Display lines near text on each arc of pie chart
	var polyline = pie
        .select(".chart").selectAll("polyline")
      .data(arcs(mvData), function(d) {
        return d.data;
      })
      .enter()
      .append("polyline")
      .attr("points", function(d,i) {   //Set position of lines
        var pos = outerArc.centroid(d);
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
         var o=   outerArc.centroid(d)
 var percent = (d.endAngle -d.startAngle)/(2*Math.PI)*100
       if(percent<3){
       //console.log(percent)
       o[1] 
       pos[1] += i*15
       }
       //return [label.centroid(d),[o[0],0[1]] , pos];
        return [label.centroid(d),[o[0],pos[1]] , pos];
      })
      .style("fill", "none")
      //.attr('stroke','grey')
      .attr("stroke", function(d,i) { return colors[i]; })
      .style("stroke-width", "1px");

    pie.select(".pie-title")       //Set title for pie chart
        .text(`IMDB Pie Chart`);
}