var centered,map_path,zoom=1,countries=[]; //Global variables

//Create Map in map SVG
function createMap(width, height){
    d3.select("#map")
        .attr("width", width)   //Set width and height of map SVG
        .attr("height", height)
        .append("text")           //Add text on map SVG
        .attr("x", width / 2)    //Set text positions on map
        .attr("y", "1em")
        .attr("font-size", "1.2em")  //Font size of text
        .style("text-anchor", "middle")  //Set text at center
        .classed("map-title", true);  //Add class
}
//Draw Map in map SVG
function drawMap(pathData,data){
    var map = d3.select("#map");
	var width = map.attr("width");   //Get width and height of map SVG
    var height = map.attr("height");
	var ratings='';
	
	var currentGeo = d3.select('#countries option:checked').attr("value");
	
	if($('input[name="ratings"]').is(':checked')){ 
		ratings = d3.select('input[name="ratings"]:checked').node().value; 
	}
	
	map.append("rect")            //Add rect on map SVG
		.attr("class", "background")  //Add class for rect
		.attr("width", width)         //Set width and height for rect
		.attr("height", height)
		.on("click", clicked);        //Call clicked() function on click of rect

	var g = map.append("g");          //Add g element inside map SVG
    
	//Geo Projection Mercator is a reasonable mathematical approach if your geometry consists of continuous, infinite point sets. Yet computers do not have infinite memory, so we must instead work with discrete geometry such as polygons and polylines! ,more info- https://github.com/d3/d3-geo
    var projection = d3.geoMercator()
                        .scale(90)
                        .translate([
                            width/2,
                            290
                        ]);
    //The geographic path generator, d3.geoPath, is similar to the shape generators in d3-shape: given a GeoJSON geometry or feature object, it generates an SVG path data string or renders the path to a Canvas. Canvas is recommended for dynamic or interactive projections to improve performance. Paths can be used with projections or transforms, or they can be used to render planar geometry directly to Canvas or SVG.
    var path = d3.geoPath()
                 .projection(projection);
				 
				 
	map_path = path; //Projection path copied to global variable.
	
	//Aggregate data from dataset for countries
	var county_val;
	
	pathData.forEach(d => {
		county_val = 0;
		currentYear = d3.select("#year-val").html();
		//For all household incomes
		if(ratings == ''){
			var counties = data.filter(row => row.Country === d.properties.name && row.Year === currentYear);   //Filter data as per data selected on dropdowns.
			counties.forEach(r => {
				county_val += 1;
			});
		}
		else {   //For ratings
			if(ratings === 'hit'){
				var counties = data.filter(row => row.Country === d.properties.name && row.Year === currentYear && row.Ratings >= 9);
				counties.forEach(r => {
					county_val += 1;
				});
			}
			else if(ratings === 'avg'){
				var counties = data.filter(row => row.Country === d.properties.name && row.Year === currentYear && row.Ratings >= 5 && row.Ratings <= 8);
				counties.forEach(r => {
					county_val += 1;
				});
			}
			else{
				var counties = data.filter(row => row.Country === d.properties.name && row.Year === currentYear);
				counties.forEach(r => {
					county_val += 1;
				});
			}
		}
		d.properties.value = county_val;           
	});
	//console.log(pathData);
    //var colors = ["#f1c40f", "#e67e22", "#e74c3c", "#c0392b"];
    
    
    //console.log(domains[dataType]);
    //var mapColorScale = d3.scaleLinear()
                            //.domain([0, d3.max(pathData, d => d.properties.VALUE)])
                            //.range(['rgb(46,73,123)', 'rgb(71, 187, 94)']);
							
	var quantize = d3.scaleQuantize()   //Quantile Scale Legend, More Info - https://d3-legend.susielu.com/
				  .domain([0, d3.max(pathData, d => d.properties.value)])  //Set Domain and range for scale legends
				  .range(d3.range(8).map(function(i) { return "q" + i + "-8"; }));
				  
	g.append("g")
			  .attr("class", "legendQuant")
			  .attr("transform", "translate(20,20)");
				  
	var legend = d3.legendColor()
				  .labelFormat(d3.format(".2s"))   //Set label format SI-prefix, More Info - https://github.com/d3/d3-format
				  .useClass(true)
				  .title("Color Scale")  //Set Title and title width for legend
				  .titleWidth(100)
				  .scale(quantize);   //Scale Quantize
				  
	g.select(".legendQuant").call(legend);  //Add legends to legendQuant

    
	//Data binding on map for provinces
	var update = g.append("g").classed("mappy", true).selectAll(".county")
                    .data(pathData);

    update
        .enter()
        .append("path") //Add path for province on map SVG
            .classed("county", true)
            .attr("d", path)
			.on('mouseover', function (d) {   //On mouseover of province change color
				dynamicColor = this.style.fill;
				d3.select(this)
					.style('fill', '#FF6347')
			})
			.on('mouseout', function (d) {  //On mouseout of province recover color
				d3.select(this)
					.style('fill', dynamicColor)
			})
            .on("click", function(d){   //On click of province 
				var mouse = d3.mouse(this);   //Get mouse positions
				clicked(mouse);      //Zoom over on selected province
				currentGeo = d3.select(this).data()[0].properties.name;
				if(countries.indexOf(currentGeo) != -1){
					var geo = d3.select('#countries');   //Display currentGeo selected on Geography dropdown.
					geo.property('value', currentGeo);
					var minYear = d3.min(data, function(d){ if(d.Year != null && d.Year != "" && d.Country === currentGeo){ return d.Year; } });
					var maxYear = d3.max(data, function(d){ if(d.Year != null && d.Year != "" && d.Country === currentGeo){ return d.Year; } });
					
					var currentYear = minYear;  //Get current year
					d3.select("#year-val").html(currentYear);
					d3.select("#year")
					.property("min", minYear)
					.property("max", maxYear)
					.property("value", currentYear);
					var ratings = '';
					if($('input[name="ratings"]').is(':checked')) ratings = d3.select('input[name="ratings"]:checked').node().value;
					d3.select("#map").html("");
					createMap(800, 400);
					drawMap(pathData, data);
					createBar(500, 300);   //Create bar
					drawBar(data);  //Draw bar
					var movies_str = '';
					if(ratings === 'hit'){
						moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear && row.Ratings >= 9);
					}
					else if(ratings === 'avg'){
						moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear && row.Ratings >= 5 && row.Ratings <= 8);
					}
					else{
						moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear );
					}
					moviesData.forEach(m => {
						movies_str += '<tr><td>'+m.Title+'</td><td>'+m.Year+'</td><td>'+m.Director+'</td><!--<td>'+m.Stars+'</td>--><td>'+m.Country+'</td><!--<td>'+m.Genres+'</td>--><td>'+m.Language+'</td><td>'+m.Duration+'</td><td>'+m.Budget+'</td><td>'+m.Gross+'</td><td>'+m.Ratings+'</td><!--<td>'+m.IMDB_link+'</td>--></tr>';
					});
					$('#imdb_dt').DataTable().destroy();
					d3.select("#movies_list").html(movies_str);
					$('#imdb_dt').DataTable();
					d3.selectAll("path.county")   //Reset active class for counties
						.data(pathData).classed("active", d => d.properties.name === currentGeo);
                    //geo.on("change")();
				}
            })
        .merge(update)
            .transition()
            .duration(500)
            .attr("class", d => {    //Set colors for provinces as per values
                var val = d.properties.value;
				var active = d.properties.name === currentGeo ? "active" : "";
                return val ? "county "+quantize(val)+" "+active : "county q0-8"+" "+active;
            });
			
		
	function clicked(d) {   //Clicked() function
	  var x, y, k;

	  if (d && centered !== d) {   //Zoom in
		var centroid = d;
		x = centroid[0];
		y = centroid[1];
		k = 4;
		centered = d;
	  } else {              //Zoom out  
		x = width / 2;
		y = height / 2;
		k = 1;
		centered = null;
	  }
	  
	  //g.selectAll("path")
      //.classed("active", centered && function(d) { return d === centered; });
      //console.log(g);
	  g.transition()
		  .duration(750)    //Zoom in/out transition
		  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
		  .style("stroke-width", 1.5 / k + "px");
	}
	g.selectAll(".countries")    //Display provinces names inside thier paths at center
	    .data(pathData)
	    .enter().append("text")
		.attr("class", "countries")
		.attr("x", function(d) {
            return path.centroid(d)[0];
        })
        .attr("y", function(d) {
            return path.centroid(d)[1];
        })
        .attr("text-anchor", "middle")
		.attr("font-size", "0.15em")
		.attr("dx", "0.6em")
		.attr("dy", "0.6em")
		.style("opacity", "0.8")
		.style('fill', 'white')
		.text(function(d,i) { return (d.properties.name).toString(); });

		
    d3.select(".map-title")  //Set map title
        .text(`IMDB Movies Dataset`); 
	
	
	//Zoom over after drawing map for selected country
	pathData.forEach(r => {
		if(currentGeo === r.properties.name){
			clicked(path.centroid(r));
		}
	});
	
	//Reset active class for countries
	d3.selectAll("path.county")
		.data(pathData).classed("active", d => d.properties.name === currentGeo);
}

function graphTitle(str){
    return str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
			return letter.toUpperCase();
	});
}