
var d3 = require("d3");
var feature_line = require("./line.js");

var feature_area = function () {

	"use strict";
    var feature = feature_line();
	var data_points;

    var line = feature.line();
    var area = d3.svg.area()
    	.interpolate("basis")
    	.tension(feature.tension());

    var line_create = feature.create(); // We 'save' line creation

	feature.interpolationType = function(type){
	    area.interpolate(type);
		line.interpolate(type);
	};

    feature.create (function (points) {
    	var track = this;
        var xScale = feature.scale();

    	if (data_points !== undefined) {
    	    track.g.select("path").remove();
    	}

    	line_create.call(track, points, xScale);

    	area
    	    .x(line.x())
    	    .y1(line.y())
    	    .y0(track.height());

    	data_points = feature.get_data_points();

    	track.g
    	    .append("path")
    	    .attr("class", "tnt_area")
    	    .classed("tnt_elem", true)
    	    .datum(data_points)
    	    .attr("d", area)
			.attr("fill-opacity","0.5")
    	    .attr("fill", feature.color());
    });

    var line_move = feature.move();
    feature.move (function (path) {
    	var track = this;
        var xScale = feature.scale();
    	line_move.call(track, path, xScale);

    	area.x(line.x());
    	track.g
    	    .select(".tnt_area")
    	    .datum(data_points)
    	    .attr("d", area);
    });

    return feature;

};

module.exports = feature_area;
