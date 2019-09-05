
var d3 = require("d3");
var feature_core = require("./core.js");

var feature_vline = function () {
	"use strict";
    var feature = feature_core();

    feature.create (function (new_elems) {
        var xScale = feature.scale();
    	var track = this;
    	new_elems
    	    .append ("line")
    	    .attr("x1", function (d) {
                return xScale(d.pos);
    	    })
    	    .attr("x2", function (d) {
                return xScale(d.pos);
    	    })
    	    .attr("y1", 0)
    	    .attr("y2", track.height())
    	    .style("stroke", feature.color())
    	    .style("stroke-width", 4);

    });

    feature.move (function (vlines) {
        var xScale = feature.scale();
    	vlines
    	    .select("line")
    	    .attr("x1", function (d) {
				return xScale(d.pos);
    	    })
    	    .attr("x2", function (d) {
				return xScale(d.pos);
    	    });
    });

    return feature;

};

module.exports = feature_vline;
