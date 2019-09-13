
var d3 = require("d3");
var feature_axis = function () {
    "use strict";
    var xAxis;
    var orientation = "top";
    var xScale;
    var brush = d3.svg.brush();
    var brush_g;
    var svg_g;

    var board_brush = function () {
        if(d3.event.sourceEvent.which === 1)
            return;
        console.log(brush.extent());
        brush.extent.clean();
    };

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

    feature.add_brush = function(){
        var track = this;
        brush_g = track.g.append("g").classed("g_brush",true);
        brush = d3.svg.brush();
        brush.x(xScale).on("brushend", board_brush);
        brush_g.call(brush).selectAll("rect")
            .attr("height", track.height());
        brush_g.selectAll(".extent").attr("fill","rgb(250, 243, 192)")
            .attr("style","fill-opacity:0.75;");
    };

    feature.init = function () {
        var track = this;
        svg_g = track.g.append("g");
    	svg_g.classed("tnt_axis", true);
        //svg_g.attr("style", "cursor:col-resize;");
        xAxis = undefined;
        //feature.add_brush.call(track);
    };

    feature.update = function () {
    	// Create Axis if it doesn't exist
        if (xAxis === undefined) {
            xAxis = d3.svg.axis()
                .scale(xScale)
                .orient(orientation);
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
