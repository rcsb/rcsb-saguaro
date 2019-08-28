
var apijs = require ("tnt.api");
var iterator = require("tnt.utils").iterator;
var tnt_data = require("./data.js");

var track = function () {

    "use strict";
    var display;

    var conf = {
    	color : '#CCCCCC',
    	height           : 250,
    	// data is the object (normally a tnt.track.data object) used to retrieve and update data for the track
        data             : tnt_data.load(),
        // display          : undefined,
        label            : "",
        id               : track.id(),
        board: undefined
    };

    // The returned object / closure
    var t = {};
    t.color = function(x){};
    t.height = function(x){};

    // API
    var api = apijs (t)
    	.getset (conf)
        .method('set_board',function(board){
            t.board(board);
        });

    // TODO: This means that height should be defined before display
    // we shouldn't rely on this
    t.display = function (new_plotter) {
        if (!arguments.length) {
            return display;//track: block, ...
        }

        display = new_plotter;
        if (typeof (display) === 'function' && typeof(display.layout) === 'function' ) {
             display.layout().height(conf.height);
        } else {
            for (var key in display) {
                if (display.hasOwnProperty(key) && typeof(display[key].layout) === 'function') {
                    display[key].layout().height(conf.height);
                }
            }
        }

        return this;//this class conf
    };

    t.load = function(data){
        return this.data(
            tnt_data.load().retriever(function () {
                return data;
            })
        );
    };

    return t;
};

track.id = iterator(1);

module.exports = track;
