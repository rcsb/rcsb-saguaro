var d3 = require("d3");
var feature_area = require("./area.js");

var feature_conservation = function () {
    "use conservation";
        var feature = feature_area();

        var area_create = feature.create(); // We 'save' area creation
        feature.create  (function (points) {
        	var track = this;
            var xScale = feature.scale();
        	area_create.call(track, d3.select(points[0][0]), xScale);
        });

    return feature;
};

module.exports = feature_conservation;
