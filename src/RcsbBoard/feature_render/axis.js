
var d3 = require("d3");
var feature_axis = function () {
    "use strict";
    var xAxis;
    var orientation = "top";
    var xScale;
    var svg_g;

    // Axis doesn't inherit from feature
    var feature = {};
    feature.reset = function () {
    	xAxis = undefined;
    	var track = this;
    	track.g.selectAll(".tick").remove();
    };

    feature.plot = function () {};

    feature.mover = function () {
    	var track = this;
    	svg_g.classed("tnt_axis", true);
    	svg_g.call(xAxis);
    };

    feature.init = function () {
        var track = this;
        svg_g = track.g.append("g");
    	svg_g.classed("tnt_axis", true);
        xAxis = undefined;
    };

    feature.update = function () {
    	// Create Axis if it doesn't exist
        if (xAxis === undefined) {
            xAxis = d3.axisBottom().scale(xScale)
        }
        svg_g.attr("transform", "translate(0,20)");
    	svg_g.call(xAxis);
    };

    feature.orientation = function (pos) {
    	if (!arguments.length) {
    	    return orientation;
    	}
    	orientation = pos;
    	return this;
    };

    feature.scale = function (s) {
        if (!arguments.length) {
            return xScale;
        }
        xScale = s;
        return this;
    };

    return feature;
};

module.exports = feature_axis;
