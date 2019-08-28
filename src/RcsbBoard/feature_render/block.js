var d3 = require("d3");
var apijs = require ("tnt.api");
var feature_core = require("./core.js");

var feature_block = function () {
	"use strict";
    // 'Inherit' from board.track.feature
    var feature = feature_core();
    var dx = 0.5;


    apijs(feature)
    	.getset('from', function (d) {
    	    return d.start;
    	})
    	.getset('to', function (d) {
    	    return d.end;
    	});

    feature.create(function (new_elems) {
    	var track = this;
    	var dy = track.height()*(2/3);
		var y_o = track.height()*(1/6);
        var xScale = feature.scale();
    	new_elems
    	    .append("rect")
    	    .attr("x", function (d, i) {
        		// TODO: start, end should be adjustable via the tracks API
        		return xScale(feature.from()(d, i)-dx);
    	    })
    	    .attr("y", y_o)
    	    .attr("width", function (d, i) {
        		return (xScale(feature.to()(d, i)+dx) - xScale(feature.from()(d, i))-dx);
    	    })
    	    .attr("height", dy)
    	    .attr("fill", track.color())
    	    .transition()
    	    .duration(500)
    	    .attr("fill", function (d) {
        		if (d.color === undefined) {
        		    return feature.color();
        		} else {
        		    return d.color;
        		}
    	    })
	        .attr("fill-opacity",0.5)
			.attr("stroke", function (d) {
        		if (d.color === undefined) {
        		    return feature.color();
        		} else {
        		    return d.color;
        		}
    	    })
	        .attr("stroke-opacity",1)
	        .attr("stroke-width",2);
    });

    feature.distribute(function (elems) {
        var xScale = feature.scale();
    	elems
    	    .select("rect")
    	    .attr("width", function (d) {
        		return (xScale(d.end+dx) - xScale(d.start-dx));
    	    });
    });

    feature.move(function (blocks) {
        var xScale = feature.scale();
    	blocks
    	    .select("rect")
    	    .attr("x", function (d) {
        		return xScale(d.start-dx);
    	    })
    	    .attr("width", function (d) {
        		return (xScale(d.end+dx) - xScale(d.start-dx));
    	    });
    });

    feature.fixed (function (width) {
        var track = this;
        track.g
            .append("line")
            .attr("class", "tnt_fixed")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", track.height())
            .attr("y2", track.height())
            .style("stroke", "black")
            .style("stroke-with", "1px");
    });

    return feature;

};

module.exports = feature_block;
