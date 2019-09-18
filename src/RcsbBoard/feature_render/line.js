
var d3 = require("d3");
var apijs = require ("tnt.api");
var feature_core = require("./core.js");
var downsampling = require("@d3fc/d3fc-sample");

var feature_line = function () {
	"use strict";
    var feature = feature_core();

    var opts = {
        domain : [0,1]
    };

    var x = function (d) {
        return d.pos;
    };
    var y = function (d) {
        return d.val;
    };
    var tension = 0.7;
    var maxPoints= 1000;
    var yScale = d3.scaleLinear();
    var line = d3.line().curve(d3.curveStep);

    apijs(feature)
        .getset(opts);
    // line getter. TODO: Setter?

	feature.interpolationType = function(type){
		//TODO fix the interpolation selection
	    if(type === "whatever")
			line = d3.line().curve(d3.curveCardinal.tension(tension));
	    return line;
	};

    feature.line = function () {
        return line;
    };

    feature.x = function (cbak) {
    	if (!arguments.length) {
    	    return x;
    	}
    	x = cbak;
    	return feature;
    };

    feature.y = function (cbak) {
    	if (!arguments.length) {
    	    return y;
    	}
    	y = cbak;
    	return feature;
    };

	var data_points;
    feature.get_data_points = function(){
    	return data_points;
	};


    feature.create (function (points) {
    	var track = this;
        var xScale = feature.scale();

    	if (data_points !== undefined) {
    	    track.g.select("path").remove();
    	}

    	line
    	    .x(function (d) {
                return xScale(x(d));
    	    })
    	    .y(function (d) {
                return track.height() - yScale(y(d));
    	    });

    	data_points = scale_filter(points.data(), xScale.domain());
    	points.remove();

    	yScale
			.domain(feature.domain())
    	    .range([0, 0.95*track.height()]);

    	track.g
    	    .append("path")
    	    .attr("class", "tnt_elem")
    	    .attr("d", line(data_points))
    	    .style("stroke", feature.color())
    	    .style("stroke-width", 2)
    	    .style("fill", "none");
    });

    feature.move (function (path) {
    	var track = this;
        var xScale = feature.scale();

    	line.x(function (d) {
    	    return xScale(x(d));
    	});
    	track.g.select("path")
    	    .attr("d", line(data_points));
    });

    var scale_filter = function(points,domain){
    	var out = [];
    	var thr = maxPoints;
    	points.forEach(function (p) {
			if(p.pos>domain[0] && p.pos<domain[1]){
				out.push(p);
			}
		});
    	if(out.length>thr) {
    		out = [];
    	    var all = points;
    		var bucket_size = Math.floor(all.length/thr)+1;
			var sampler = downsampling.modeMedian();
			sampler.value(d => d.val);
			sampler.bucketSize(bucket_size);
			all = sampler(all);
			all.forEach(function (p) {
				if(p.pos>=domain[0] && p.pos<=domain[1]){
					out.push(p);
				}
			});
		}
    	return out;
	};

    var downSample = {
    	bucketSize: 5,
    	setBucketSize: function(n){
    		this.bucketSize = n;
		},
		x:function(f){
    		this.returnX = function(x){
    			return f(x);
			}
		},
		y:function(f){
    		this.returnY = function(y){
    			return f(y);
			}
		},
		sample: function(W){
    		var N = W.length;
    		var i = 0;
    		var out = [];
    		while(i<N-this.bucketSize){
    			var avg = 0;
				var pos = W[i].pos;
    			for(var j=0;j<this.bucketSize;j++){
    				avg += W[i+j].val;
				}
    			avg = avg / this.bucketSize;
    			out.push({pos:(pos+this.bucketSize*0.5), val:avg});
    			i+= this.bucketSize;
			}
			return out;
		}
	};

    return feature;
};

module.exports = feature_line;
