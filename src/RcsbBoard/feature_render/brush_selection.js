var d3 = require("d3");

var begin;
var end;

var mousedown = function(track_vis, svg, scale){
    if(d3.event.which === 3){
        svg.on("mousemove", function(){
            mousemove.call(this,track_vis,scale);
        });
        var x = d3.mouse(this)[0];
        begin = Math.round(scale.invert(x));
    }
};

var mouseup = function(track_vis, svg, scale){
    if(d3.event.which === 3){
        svg.on("mousemove", function(){
        });
        var x = d3.mouse(this)[0];
        end = Math.round(scale.invert(x));
        if(begin>end){
            var aux = begin;
            begin = end;
            end = aux;
        }
        track_vis.select_region(begin-0.5, end+0.5, false);
    }
};

var mousemove = function(track_vis,scale){
        var x = d3.mouse(this)[0];
        end = Math.round(scale.invert(x));
        var _begin = begin;
        if(_begin>end){
            var aux = _begin;
            _begin = end;
            end = aux;
        }
        track_vis.select_region(_begin-0.5, end+0.5, false);
};




module.exports = {
    mousedown:mousedown,
    mouseup:mouseup
};