
var d3 = require("d3");
var feature_core = require("./core.js");
var classes = require("../scss/RcsbBoard.module.scss");

var feature_sequence = function () {
    "use strict";
    var feature = feature_core();
    var ratio_interval = [5,16];

    var yScale = d3.scaleLinear()
    	.domain([0,0])
    	.range([0,0]);

    feature.create(function (new_aa) {
    	var track = this;
    	var svg_g = track.g;
        var xScale = feature.scale();

    	yScale
    	    .domain([0, track.height()])
    	    .range([0, track.height()]); // 10 for labelling

        new_aa
            .append("text")
            .attr("font-size", "10")
            .attr("font-family","Arial")
            .attr("x", function (d, i) {
                return xScale(d.pos);
            })
            .attr("y", function (d, i) {
                return yScale(Math.floor(track.height()*0.5)+4);
            })
            .style("text-anchor", "middle")
            .style("fill", function (d) {
                return d3.functor(feature.color())(d);
            })
            .text(function (d) {
                return d.label || "";
            })
            .call(opacity,xScale);
    });

    feature.update = function(loc, field){
        var track = this;
        var svg_g = track.g;
        var xScale = feature.scale();
        var elements = track.data().elements();

        if (field !== undefined) {
            elements = elements[field];
        }

        var data_elems = feature.layout().call(track, elements);

        if (data_elems === undefined) {
            return;
        }

        data_elems = data_elems.split("").map(function(s,i) {
            return {pos:(i + 1), label:s};
        }).filter(function (s,i) {
            return (i+1 >= xScale.domain()[0] && i <= xScale.domain()[1]);
        });

        var elem_class = "."+classes.rcsbElement;
        if (field !== undefined) {
            elem_class += "_"+field;
        }

        svg_g.selectAll(elem_class).remove();
        svg_g.select("."+classes.rcsbElemSeqBg).remove();

        if(get_ratio(xScale)>=ratio_interval[0]){
            svg_g.selectAll(elem_class).data(data_elems)
                .enter()
                .append("g")
                .attr("class", classes.rcsbElement)
                .classed(classes.rcsbElement+"_" + field, field)
                .call(feature.plot, track, xScale);
        }
    };

    feature.distribute (function (aa) {
        aa
            .select("text")
            .text(function (d) {
                return d.label || "";
            });
    });

    feature.move(function (aa, field) {
    	var track = this;
        var xScale = feature.scale();

        aa.select("text")
            .attr("x", function (d, i) {
                return xScale(d.pos);
            })
            .text(function (d) {
                return d.label || "";
            })
            .call(opacity, xScale);
    });

    var get_ratio = function(xScale){
        return (xScale.range()[1]-xScale.range()[0])/(xScale.domain()[1]-xScale.domain()[0]);
    };

    var opacity = function(elems,xScale){
        var r = get_ratio(xScale);
        var o_min = 0.01;
        var a = ratio_interval[0];
        var b = ratio_interval[1];
        if(r<a) {
            elems.attr("display", "none");
        }else if(r>=a && r<b) {
            elems.attr("display", "");
            var o = (1-o_min)/(b-a)*(r-a)+o_min;
            elems.attr("fill-opacity",o);
        } else {
            elems.attr("display", "");
            elems.attr("fill-opacity", "1");
        }
    };

    return feature;
};

module.exports = feature_sequence;
