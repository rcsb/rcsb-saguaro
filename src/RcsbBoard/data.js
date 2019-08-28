
var apijs = require ("tnt.api");

var tnt_data = {};
tnt_data.load = function() {
    "use strict";
    var update_track = function(obj) {
        var track = this;
        track.data().elements(update_track.retriever().call(track, obj.loc));
        obj.on_success();
    };

    apijs (update_track)
        .getset ('elements', [])
        .getset ('retriever', function () {});

    return update_track;
};

module.exports = tnt_data;
