//A queue evaluates zero or more deferred asynchronous tasks with configurable concurrency: you control how many tasks run at the same time. When all the tasks complete, or an error occurs, the queue passes the results to your await callback.  More Info - https://github.com/d3/d3-queue
d3.queue()
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
    .await(function (error, data) {
        if (error) throw error;
		var width = 500;
        var height = 500;
		createArea(width, height);   //Create area
		drawArea(data);  //Draw area chart
		//highlightBars(currentGeo);  //Highlight active bar
		var countries = [];
		var country_str = '';//'<option value="">Select Country</option>';
        data.forEach(c => {
			if(countries.indexOf(c.Country) == -1 && c.Country != '') countries.push(c.Country);
		});
		countries.forEach(country => {
			country_str += '<option value="'+country+'">'+country+'</option>';
		});
		//console.log(data);
		d3.select("#countries").html(country_str);
		d3.select('#countries')
            .on("change", () => {
				var country = d3.select('#countries option:checked').attr("value");
				
            });
    });