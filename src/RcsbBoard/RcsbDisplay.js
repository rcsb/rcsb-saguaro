var feature_composite = require("./feature_render/composite.js");
var feature_area = require("./feature_render/area.js");
var feature_line = require("./feature_render/line.js");
var feature_vline = require("./feature_render/vline.js");
var feature_pin = require("./feature_render/pin.js");
var feature_block = require("./feature_render/block.js");
var feature_axis = require("./feature_render/axis.js");
var feature_sequence = require("./feature_render/sequence.js");

export class RcsbDisplay {
        composite = feature_composite;
        area = feature_area;
        line = feature_line;
        vline = feature_vline;
        pin = feature_pin;
        block =feature_block;
        axis = feature_axis;
        sequence = feature_sequence;
}