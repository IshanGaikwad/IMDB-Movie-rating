//Create Bar in bar SVG
function createBar(width, height) {
    var bar = d3.select("#bar")
                    .attr("width", width)  //Set width and height of bar SVG
                    .attr("height", height);
  
    bar.append("g")    //Add g element inside bar SVG
        .classed("x-axis", false)  //Add x-axis class for g element
  
    bar.append("g")      ////Add y-axis class for g element
        .classed("y-axis", true);
  
    bar.append("text")       //Add text on y axis label
        .attr("transform", "rotate(-90)")
        .attr("x", - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "1em")
        .classed("y-axis-label", true);
     
    bar.append("text")       //Add bar chart title on bar chart
        .attr("x", width / 2)
        .attr("y", "1em")
        .attr("font-size", "1em")
        .style("text-anchor", "middle")
        .classed("bar-title", true);
  }
  //Display highlight bar in bars
  function highlightBars() {
	d3.select("#bar")
      .selectAll("rect")   //Set colors for bars in bar chart
        .attr("fill", d => "#3c763d");
  }
  //Draw Bar chart in bar SVG
  function drawBar(data) {
    var bar = d3.select("#bar");
    var padding = {
      top: 30,
      right: 30,
      bottom: 60,
      left: 110
    };
    var barPadding = 1;
    var width = +bar.attr("width");
    var height = +bar.attr("height");
	
	var ratings = '',ratings_str='';
	if($('input[name="ratings"]').is(':checked')) ratings = d3.select('input[name="ratings"]:checked').node().value;
	var currentGeo = d3.select('#countries option:checked').attr("value");
	var currentYear = d3.select("#year-val").html();
	if(ratings === 'hit'){
		countyData = data.filter(row => row.Country === currentGeo && row.Year === currentYear && row.Ratings >= 9);
		ratings_str = 'Ratings above 9';
	}
	else if(ratings === 'avg'){
		countyData = data.filter(row => row.Country === currentGeo && row.Year === currentYear && row.Ratings >= 5 && row.Ratings <= 8);
		ratings_str = 'Ratings between 5 to 8';
	}
	else{
		countyData = data.filter(row => row.Country === currentGeo && row.Year === currentYear);
		ratings_str = 'All Ratings';
	}
	//console.log(countyData);
    countyData.sort((a, b) => a.Ratings - b.Ratings);  //Displat sorted bars by values in ascending order
	
    var xScale = d3.scaleBand()
                .rangeRound([padding.left, width - padding.right]);

    xScale.domain(countyData.map(function(d) {
                return d.Title;
    }));
	//var xScale = d3.scaleLinear()
                   //.domain(county_arr)
                   //.range([padding.left, width - padding.right]);
  
    var yScale = d3.scaleLinear()
                   .domain([0, d3.max(countyData, d => d.Ratings)])
                   .range([height - padding.bottom, padding.top]);
  
    var barWidth = 30;//xScale(xScale.domain()[0] + 1) - xScale.range()[0];
	var tickData = [];
    countyData.forEach(r => {
		tickData.push((r.Title).substring(0,10)+'...');
	});
	
    var xAxis = d3.axisBottom(xScale).tickFormat((d,i) => tickData[i]);
                  //.tickFormat(d3.format(".0f"));
  
    d3.select(".x-axis")   //Add x axis values 
        .attr("transform", "translate(0, " + (height - padding.bottom) + ")")
        .call(xAxis);

    var yAxis = d3.axisLeft(yScale)
				   .tickFormat(d3.format(".2s"));
  
    d3.select(".y-axis")    //Add y axis values
        .attr("transform", "translate(" + (padding.left - barWidth / 2) + ",0)")
        .transition()   //Apply transition on y axis
        .duration(1000)
        .call(yAxis);
  
    var axisLabel = "IMDB Movies Ratings";
  
    var barTitle = "IMDB Movies, "+currentYear+", "+ratings_str;
	
	d3.select("#bar")     //Rotate x axis texts
	  .selectAll(".x-axis text")
	  .style("text-anchor", "end")
      .attr("dx", "-1em")
      .attr("dy", "-0.5em")
	  .attr("transform", "rotate(-20)");
  
    d3.select(".y-axis-label")   //Display y axis label
        .text(axisLabel);
  
    d3.select(".bar-title")   //Display title on bar chart
        .text(barTitle);
  
    var t = d3.transition()   //Apply transitions on bars
              .duration(1000)
              .ease(d3.easeBounceOut);
			  
    //Data binding on bars
    var update = bar 
                   .selectAll(".bar")
                   .data(countyData);
  
    update
      .exit()
      .transition(t) //Transitions on bars
        .delay((d, i, nodes) => (nodes.length - i - 1) * 100)
        .attr("y", height - padding.bottom)
        .attr("height", 0)
        .remove();
  
    update
      .enter()
      .append("rect") //Add rect on bars
        .classed("bar", true)
        .attr("y", height - padding.bottom)
        .attr("height", 0)
		.on('mouseover', function (d) {  //On mouseover of rect change color of bar
			dynamicColor = this.style.fill;
			d3.select(this)
				.style('fill', '#FF6347')
		})
		.on('mouseout', function (d) {   //On mouseout of rect recover color of bar
			d3.select(this)
				.style('fill', dynamicColor)
		})
		.on("click", function(d){ //On click on bar
			//currentGeo = d3.select(this).data()[0].Geography;
			//var geo = d3.select('#geography_select');  //Display currentGeo selected on Geography dropdown.
			//geo.property('value', currentGeo);
			//geo.on("change")();    //Call Geography change event
		})
      .merge(update)
        .attr("x", d => xScale(d.Title))
        .attr("width", barWidth - barPadding)   //Set width of bars
        .transition(t)    //Apply transition on bars height
        .delay((d, i) => i * 100)
          .attr("y", d => yScale(d.Ratings))    //Set y attribute
          .attr("height", d => height - padding.bottom - yScale(d.Ratings));  //Set height of bars
	 
	highlightBars();
  }