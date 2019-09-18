
var d3 = require("d3");
var apijs = require ("tnt.api");
var feature_core = require("./core.js");

var feature_pin = function () {
    "use strict";
    var feature = feature_core();

    var yScale = d3.scaleLinear();

    var opts = {
        domain : [0,1]
    };

    var pin_ball_r = 5; // the radius of the circle in the pin
    var labelling_gap = 10;

    apijs(feature)
        .getset(opts);

    feature.create (function (new_pins) {
    	var track = this;
        var xScale = feature.scale();
    	yScale
    	    .domain(feature.domain())
    	    .range([pin_ball_r, track.height()-pin_ball_r]); // 10 for labelling

    	// pins are composed of lines, circles and labels
    	new_pins
    	    .append("line")
    	    .attr("x1", function (d, i) {
    	    	return xScale(d.pos);
    	    })
    	    .attr("y1", function (d) {
                return track.height();
    	    })
    	    .attr("x2", function (d,i) {
    	    	return xScale(d.pos);
    	    })
    	    .attr("y2", function (d, i) {
    	        var y = 0.5;
    	        if(typeof d.val === "number") {
                    y = d.val;
                }
                return track.height() - yScale(y);
    	    })
    	    .attr("stroke", function (d) {
                return feature.color();
            });

    	new_pins
    	    .append("circle")
    	    .attr("cx", function (d, i) {
                return xScale(d.pos);
    	    })
    	    .attr("cy", function (d, i) {
                var y = 0.5;
    	        if(typeof d.val === "number") {
                    y = d.val;
                }
                return track.height() - yScale(y);
    	    })
    	    .attr("r", pin_ball_r)
    	    .attr("fill", function (d) {
                return feature.color();
            });

        new_pins
            .append("text")
            .attr("font-size", "12")
            .attr("x", function (d, i) {
                return xScale(d.pos)+2.5*labelling_gap;
            })
            .attr("y", function (d, i) {
                var y = 0.5;
    	        if(typeof d.val === "number") {
                    y = d.val;
                }
                return track.height() - yScale(y) + 0.5*labelling_gap;
            })
            .style("text-anchor", "middle")
            .style("fill", function (d) {
                return feature.color();
            })
            .text(function (d) {
                return d.label || "";
            });

    });

    feature.distribute (function (pins) {
        pins
            .select("text")
            .text(function (d) {
                return d.label || "";
            });
    });

    feature.move(function (pins) {
    	var track = this;
        var xScale = feature.scale();

    	pins
    	    .select("line")
    	    .attr("x1", function (d, i) {
                return xScale(d.pos);
    	    })
    	    .attr("y1", function (d) {
        		return track.height();
    	    })
    	    .attr("x2", function (d,i) {
        		return xScale(d.pos);
    	    })
    	    .attr("y2", function (d, i) {
    	        var y = 0.5;
    	        if(typeof d.val === "number") {
                    y = d.val;
                }
        		return track.height() - yScale(y);
    	    });

    	pins
    	    .select("circle")
    	    .attr("cx", function (d, i) {
                return xScale(d.pos);
    	    })
    	    .attr("cy", function (d, i) {
    	        var y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return track.height() - yScale(y);
    	    });

        pins
            .select("text")
            .attr("x", function (d, i) {
                return xScale(d.pos)+2.5*labelling_gap;
            })
            .text(function (d) {
                return d.label || "";
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

module.exports = feature_pin;
