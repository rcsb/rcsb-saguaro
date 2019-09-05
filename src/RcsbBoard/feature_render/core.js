var d3 = require("d3");
var apijs = require ("tnt.api");
var layout = require("./layout.js");
var event_dispatcher = require("./event_dispatcher.js");

var feature_core = function () {
    "use strict";
    var dispatch = event_dispatcher();

    ////// Vars exposed in the API
    var config = {
        create   : function () {throw "create_elem is not defined in the base feature object";},
        move    : function () {throw "move_elem is not defined in the base feature object";},
        distribute  : function () {},
        fixed   : function () {},
        //layout   : function () {},
        index    : undefined,
        layout   : layout.identity(),
        color : '#000',
        scale : undefined
    };


    // The returned object
    var feature = {};

    var reset = function () {
    	var track = this;
    	track.g.selectAll(".tnt_elem").remove();
        track.g.selectAll(".tnt_guider").remove();
        track.g.selectAll(".tnt_fixed").remove();
    };

    var init = function (width) {
        var track = this;
    };

    var plot = function (new_elem, track, xScale) {
        new_elem.on("click", function (d, i) {
            if (d3.event.defaultPrevented) {
                return;
            }
            dispatch.click.call(this, d, i, track);
        });
        new_elem.on("mouseover", function (d, i) {
            if (d3.event.defaultPrevented) {
                return;
            }
            dispatch.mouseover.call(this, d, i, track);
        });
        new_elem.on("dblclick", function (d, i) {
            if (d3.event.defaultPrevented) {
                return;
            }
            dispatch.dblclick.call(this, d, i, track);
        });
        new_elem.on("mouseout", function (d, i) {
            if (d3.event.defaultPrevented) {
                return;
            }
            dispatch.mouseout.call(this, d, i, track);
        });
        // new_elem is a g element the feature is inserted
        config.create.call(track, new_elem, xScale);
    };

    var select_region = function(track_g, height, begin, end) {
        var track = this;
        if(typeof(track.scale)!=="function"){
            return;
        }
        var xScale = track.scale();
        if(typeof(height)==="number" && typeof(begin)==="number" && typeof(end)==="number") {
            track_g.select(".tnt_select_rect").remove();
            track_g.append("rect")
                .attr("x", xScale(begin))
                .attr("y", 0)
                .attr("width", xScale(end)-xScale(begin))
                .attr("height", height)
                .attr("fill", "#faf3c0")
                .attr("fill-opacity",0.75)
                .attr("class", "tnt_select_rect");
        }

        var tnt_select_rect = track_g.select(".tnt_select_rect").node();
        if(tnt_select_rect) {
            var tnt_board_rect = track_g.select(".tnt_board_rect").node();
            mtb(tnt_select_rect);
            mtb(tnt_board_rect);
            tnt_select_rect.parentNode.prepend(tnt_select_rect);
            tnt_board_rect.parentNode.prepend(tnt_board_rect);
        }
    };

    var update = function (loc, field) {
        var track = this;
        var svg_g = track.g;

        var elements = track.data().elements();

        if (field !== undefined) {
            elements = elements[field];
        }

        var data_elems = config.layout.call(track, elements);
        if (data_elems === undefined) {
            return;
        }

        var vis_sel;
        var vis_elems;
        svg_g.selectAll("path").remove();
        if (field !== undefined) {
            vis_sel = svg_g.selectAll(".tnt_elem_" + field);
        } else {
            vis_sel = svg_g.selectAll(".tnt_elem");
        }

        if (config.index) { // Indexing by field
            vis_elems = vis_sel
                .data(data_elems, function (d) {
                    if (d !== undefined) {
                        return config.index(d);
                    }
                });
        } else { // Indexing by position in array
            vis_elems = vis_sel
                .data(data_elems);
        }

        config.distribute.call(track, vis_elems, config.scale);

    	var new_elem = vis_elems
    	    .enter();

    	new_elem
    	    .append("g")
    	    .attr("class", "tnt_elem")
    	    .classed("tnt_elem_" + field, field)
    	    .call(feature.plot, track, config.scale);

    	vis_elems
    	    .exit()
    	    .remove();


    };

    var mover = function (field) {
    	var track = this;
    	var svg_g = track.g;
    	var elems;
    	// TODO: Is selecting the elements to move too slow?
    	// It would be nice to profile
    	if (field !== undefined) {
    	    elems = svg_g.selectAll(".tnt_elem_" + field);
    	} else {
    	    elems = svg_g.selectAll(".tnt_elem");
    	}

    	config.move.call(this, elems, field);
    };

    var mtf = function (elem) {
        elem.parentNode.appendChild(elem);
    };

    var mtb = function (elem) {
        elem.parentNode.prepend(elem);
    };

    var move_to_front = function (field) {
        if (field !== undefined) {
            var track = this;
            var svg_g = track.g;
            svg_g.selectAll(".tnt_elem_" + field)
                .each( function () {
                    mtf(this);
                });
        }
    };

    // API
    apijs (feature)
    	.getset (config)
    	.method ({
    	    reset  : reset,
    	    plot   : plot,
    	    update : update,
    	    mover   : mover,
    	    init   : init,
            select_region : select_region,
    	    move_to_front : move_to_front
    	});

    return d3.rebind(feature, dispatch, "on");
};

module.exports = feature_core;
