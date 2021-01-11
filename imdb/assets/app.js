//A queue evaluates zero or more deferred asynchronous tasks with configurable concurrency: you control how many tasks run at the same time. When all the tasks complete, or an error occurs, the queue passes the results to your await callback.  More Info - https://github.com/d3/d3-queue
d3.queue()
	.defer(d3.json, "./data/world-countries.json")
    .defer(d3.csv, "./data/movie_metadata.csv", function (row) { //Build new csv data
        return {
            Title: row["movie_title"],
			Year: row["title_year"],
			Director: row["director_name"],
			Stars: row["actor_1_name"]+","+row["actor_2_name"]+","+row["actor_3_name"],
			Country: row["country"],
			Genres: row["genres"],
			Language: row["language"],
			Duration: row["duration"],
			Budget: row["budget"],
			Gross: row["gross"],
			Ratings: row["imdb_score"],
			Voted: row["num_voted_users"],
			IMDB_link: row["movie_imdb_link"],
        }
    })  //To run multiple tasks simultaneously, create a queue, defer your tasks, and then register an await callback to be called when all of the tasks complete (or an error occurs)
    .await(function (error, mapData, data) {
        if (error) throw error;
		
		var pathData = topojson.feature(mapData, mapData.objects.countries).features;   // Get paths data from topojson mapdata
		var country_str = '';//'<option value="">Select Country</option>';
		var width=800,height=400;
        data.forEach(c => {
			if(countries.indexOf(c.Country) == -1 && c.Country != '') countries.push(c.Country);
		});
		countries.forEach(country => {
			country_str += '<option value="'+country+'">'+country+'</option>';
		});
		//console.log(pathData);
		d3.select("#countries").html(country_str);
		var ratings = '';
		if($('input[name="ratings"]').is(':checked')) ratings = d3.select('input[name="ratings"]:checked').node().value;
		var currentGeo = d3.select('#countries option:checked').attr("value");
		var minYear = d3.min(data, function(d){ if(d.Year != null && d.Year != "" && d.Country === currentGeo){ return d.Year; } });
		var maxYear = d3.max(data, function(d){ if(d.Year != null && d.Year != "" && d.Country === currentGeo){ return d.Year; } });
		
        var currentYear = minYear;  //Get current year
		d3.select("#year-val").html(currentYear);
		if(ratings === 'hit'){
			moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear && row.Ratings >= 9);
		}
		else if(ratings === 'avg'){
			moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear && row.Ratings >= 5 && row.Ratings <= 8);
		}
		else{
			moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear);
		}
		var movies_str = '';
		moviesData.forEach(m => {
			movies_str += '<tr><td>'+m.Title+'</td><td>'+m.Year+'</td><td>'+m.Director+'</td><!--<td>'+m.Stars+'</td>--><td>'+m.Country+'</td><!--<td>'+m.Genres+'</td>--><td>'+m.Language+'</td><td>'+m.Duration+'</td><td>'+m.Budget+'</td><td>'+m.Gross+'</td><td>'+m.Ratings+'</td><!--<td>'+m.IMDB_link+'</td>--></tr>';
		});
		$('#imdb_dt').DataTable().destroy();
		d3.select("#movies_list").html(movies_str);
		$('#imdb_dt').DataTable();
		createMap(width, height);   //Create map
        drawMap(pathData,data);  //Draw map
		createBar(500, 300);   //Create bar
        drawBar(data);  //Draw bar
		//year change event handling
		d3.select("#year")
            .property("min", minYear)
            .property("max", maxYear)
            .property("value", currentYear)
            .on("input", () => {
                currentYear = d3.event.target.value;
				d3.select("#year-val").html(currentYear);
				var ratings = '';
				if($('input[name="ratings"]').is(':checked')) ratings = d3.select('input[name="ratings"]:checked').node().value;
				var currentGeo = d3.select('#countries option:checked').attr("value");
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
					moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear);
				}
				//console.log(moviesData);
				moviesData.forEach(m => {
					movies_str += '<tr><td>'+m.Title+'</td><td>'+m.Year+'</td><td>'+m.Director+'</td><!--<td>'+m.Stars+'</td>--><td>'+m.Country+'</td><!--<td>'+m.Genres+'</td>--><td>'+m.Language+'</td><td>'+m.Duration+'</td><td>'+m.Budget+'</td><td>'+m.Gross+'</td><td>'+m.Ratings+'</td><!--<td>'+m.IMDB_link+'</td>--></tr>';
				});
				$('#imdb_dt').DataTable().destroy();
				d3.select("#movies_list").html(movies_str);
				$('#imdb_dt').DataTable();
            });
		
		d3.selectAll('.ratings')
            .on("change", () => {
				currentYear = d3.select("#year-val").html();
				var ratings = '';
				if($('input[name="ratings"]').is(':checked')) ratings = d3.select('input[name="ratings"]:checked').node().value;
				var currentGeo = d3.select('#countries option:checked').attr("value");
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
					moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear);
				}
				moviesData.forEach(m => {
					movies_str += '<tr><td>'+m.Title+'</td><td>'+m.Year+'</td><td>'+m.Director+'</td><!--<td>'+m.Stars+'</td>--><td>'+m.Country+'</td><!--<td>'+m.Genres+'</td>--><td>'+m.Language+'</td><td>'+m.Duration+'</td><td>'+m.Budget+'</td><td>'+m.Gross+'</td><td>'+m.Ratings+'</td><!--<td>'+m.IMDB_link+'</td>--></tr>';
				});
				$('#imdb_dt').DataTable().destroy();
				d3.select("#movies_list").html(movies_str);
				$('#imdb_dt').DataTable();
            });
		d3.select('#countries')
            .on("change", () => {
				var ratings = '';
				if($('input[name="ratings"]').is(':checked')) ratings = d3.select('input[name="ratings"]:checked').node().value;
				var currentGeo = d3.select('#countries option:checked').attr("value");
				var minYear = d3.min(data, function(d){ if(d.Year != null && d.Year != "" && d.Country === currentGeo){ return d.Year; } });
				var maxYear = d3.max(data, function(d){ if(d.Year != null && d.Year != "" && d.Country === currentGeo){ return d.Year; } });
				
				var currentYear = minYear;  //Get current year
				d3.select("#year-val").html(currentYear);
				d3.select("#year")
					.property("min", minYear)
					.property("max", maxYear)
					.property("value", currentYear);
				d3.select("#map").html("");
				createMap(800, 400);
                drawMap(pathData, data);
				createBar(300, 200);   //Create bar
				drawBar(data);  //Draw bar
				var movies_str = '';
				if(ratings === 'hit'){
					moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear && row.Ratings >= 9);
				}
				else if(ratings === 'avg'){
					moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear && row.Ratings >= 5 && row.Ratings <= 8);
				}
				else{
					moviesData = data.filter(row => row.Country === currentGeo && row.Year === currentYear);
				}
				moviesData.forEach(m => {
					movies_str += '<tr><td>'+m.Title+'</td><td>'+m.Year+'</td><td>'+m.Director+'</td><!--<td>'+m.Stars+'</td>--><td>'+m.Country+'</td><!--<td>'+m.Genres+'</td>--><td>'+m.Language+'</td><td>'+m.Duration+'</td><td>'+m.Budget+'</td><td>'+m.Gross+'</td><td>'+m.Ratings+'</td><!--<td>'+m.IMDB_link+'</td>--></tr>';
				});
				$('#imdb_dt').DataTable().destroy();
				d3.select("#movies_list").html(movies_str);
				$('#imdb_dt').DataTable();
            });
			function clicked(d) {
			  var g = d3.select("#map g");
			  var width = d3.select("#map").attr("width");   //Get width and height of map SVG
			  var height = d3.select("#map").attr("height");
			  var x, y, k;

			  if (zoom == 0) {  //Zoom in
				var centroid = d;
				x = centroid[0];
				y = centroid[1];
				k = 4;
				centered = d;
			  } else {     //Zoom out
				x = width / 2;
				y = height / 2;
				k = 1;
				centered = null;
			  }
			  
			  //g.selectAll("path")
			  //.classed("active", centered && function(d) { return d === centered; });
			  //console.log(g);
			  g.transition()    //Zoom in/out transition
				  .duration(750)
				  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
				  .style("stroke-width", 1.5 / k + "px");
		}
		//Zoom in/out toggle event handling
		d3.select('#zoom_inout')
            .on("click", () => {
				var currentGeo = d3.select('#countries option:checked').attr("value");
				zoom = zoom==1 ? 0 : 1;
				zoomData = pathData.filter(d => d.properties.name === currentGeo);
				var pt = map_path.centroid(zoomData[0]);
				clicked(pt);
		});
		//Add tooltip for map, pie and bar chart.
        d3.selectAll("svg")
            .on("mousemove touchmove", updateTooltip);
		//Display tooltip function for map, pie and bar chart
        function updateTooltip() {
            var tooltip = d3.select(".tooltip");
            var tgt = d3.select(d3.event.target);
			var isBar = tgt.classed("bar");
            var isCounty = tgt.classed("county");
			var currentGeo = d3.select('#countries option:checked')
            .attr("value");
			var currentYear = d3.select("#year-val").html();
			var ratings = '',ratings_str='';
			if($('input[name="ratings"]').is(':checked')) ratings = d3.select('input[name="ratings"]:checked').node().value;
			if(ratings === 'hit'){
				ratings_str='Ratings above 9';
			}
			else if(ratings === 'avg'){
				ratings_str='Ratings between 5 to 8';
			}
			else{
				ratings_str='All Ratings';
			}
            var datap;
			tooltip
                .style("opacity", (isCounty || isBar) ? 0.6 : 0)
                .style("left", (d3.event.pageX - tooltip.node().offsetWidth / 2) + "px")
                .style("top", (d3.event.pageY - tooltip.node().offsetHeight - 10) + "px");
            //Display tooltip on map for countries
			if (isCounty) { 
				datap = tgt.data()[0].properties; 
				if (datap) {
					var dataValue = datap.value ?
						(datap.value).toLocaleString() :
						"Data Not Available";
					tooltip
						.html(`<table>
					  <tr><td><strong>Country : </strong></td><td>${datap.name}</td></tr>
					  <tr><td><strong>Year : </strong></td><td>${currentYear}</td></tr>
					  <tr><td><strong>Ratings : </strong></td><td>${ratings_str}</td></tr>
					  <tr><td><strong>Movies : </strong></td><td>${dataValue}</td></tr>
					  </table>`);
				}
			}
			//Display tooltip on bar chart
            if (isBar) {
				datap = tgt.data()[0];
				if (datap) {
					tooltip
					  .html(`<table>
					  <tr><td><strong>Movie : </strong></td><td>${datap.Title}</td></tr>
					  <tr><td><strong>Year : </strong></td><td>${datap.Year}</td></tr>
					  <tr><td><strong>Ratings : </strong></td><td>${datap.Ratings}</td></tr>
					  </table>`);
				}
			}
        }
    });
	
$(document).ready(function() {
    $('#imdb_dt').DataTable();
} );
