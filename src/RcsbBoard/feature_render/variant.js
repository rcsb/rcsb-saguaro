
var d3 = require("d3");
var apijs = require ("tnt.api");
var feature_core = require("./core.js");

var feature_pin = function () {
    "use strict";
    var feature = feature_core();

    var aaList = ['G', 'A', 'V', 'L', 'I', 'S', 'T', 'C', 'M', 'D', 'N', 'E', 'Q', 'R', 'K', 'H', 'F', 'Y', 'W', 'P', '≡', '⊖'];
    var yScale = d3.scale.ordinal().domain(aaList);

    var pin_ball_r = 5; // the radius of the circle in the pin


    feature.create(function (new_variants) {
    	var track = this;
        var xScale = feature.scale();
    	yScale.rangePoints([2*pin_ball_r, track.height()-2*pin_ball_r]); // 10 for labelling


    	new_variants
    	    .append("circle")
    	    .attr("cx", function (d, i) {
                return xScale(d.pos);
    	    })
    	    .attr("cy", function (d, i) {
                return yScale(d.val);
    	    })
    	    .attr("r", pin_ball_r)
    	    .attr("fill", function (d) {
    	        if(typeof d.color === "string"){
    	            return d.color;
                }
                return feature.color();
            });

		feature.include_axis.call(track);

    });

    feature.move(function (variants) {
    	var track = this;
        var xScale = feature.scale();

    	variants
    	    .select("circle")
    	    .attr("cx", function (d, i) {
                return xScale(d.pos);
    	    })
    	    .attr("cy", function (d, i) {
                return yScale(d.val);
    	    });

		feature.include_axis.call(track);
    });

    feature.include_axis = function(){
		var xScale = feature.scale();
        var track = this;
        var svg_g = track.g;
        svg_g.selectAll(".tnt_axis").remove();
		svg_g.selectAll(".variant_grid").remove();
        svg_g.append("g").classed("variant_grid", true);
        aaList.forEach(function(aa) {
			svg_g.selectAll(".variant_grid").append("line")
				.attr("style","stroke:#EEEEEE;")
				.attr("x1", function (d, i) {
					return xScale.range()[0];
				})
				.attr("y1", function (d) {
					return yScale(aa);
				})
				.attr("x2", function (d, i) {
					return xScale.range()[1];
				})
				.attr("y2", function (d, i) {
					return yScale(aa);
				})
		});
		svg_g.selectAll(".tnt_elem").each( function () {
			this.parentNode.append(this);
        });

		var variant_axis = d3.svg.axis().scale(yScale).orient("left");
		svg_g.append("g").classed("tnt_axis",true)
			.attr("transform", "translate(20,0)")
			.append("rect")
			.attr("fill","white")
			.attr("x",-20)
			.attr("y",0)
			.attr("height",track.height())
			.attr("width",15);

		svg_g.selectAll(".tnt_axis").call(variant_axis);
    };

    return feature;
};

module.exports = feature_pin;
