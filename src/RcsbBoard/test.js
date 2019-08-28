import {RcsbBoard} from './RcsbBoard';

const rcsbBoard = new RcsbBoard();
var myDiv1 = document.getElementById("mydiv1");
const myBoard_1 = rcsbBoard.board()
                            .from(-1.5)
                            .to(189)
                            .max(189);

const axis_feature = rcsbBoard.display.axis();
const axis_track = rcsbBoard.track()
                            .height(30)
                            .color("white")
                            .display(axis_feature);
myBoard_1(myDiv1);
myBoard_1.add_track([axis_track]);
myBoard_1.start();


var myDiv2 = document.getElementById("mydiv2");
const myBoard_2 = rcsbBoard.board()
                            .from(-1.5)
                            .to(189)
                            .max(189);


const composite_track = rcsbBoard.track()
                            .height(30)
                            .color("white");

const composite_display = rcsbBoard.display.composite();
const pin_display = rcsbBoard.display.pin().domain([0,1])
                                            .color("red");

const sequence_display = rcsbBoard.display.sequence().color("green");

composite_display.add("x",pin_display);
composite_display.add("y",sequence_display);

composite_track.display(composite_display);
composite_track.load({"x":data().seq_dif,"y":data().sequence_2});


myBoard_2(myDiv2);
myBoard_2.add_track([composite_track]);
myBoard_2.start();



function data() {
    return {
        "sequence_1":
            "MTEYKLVVVGAGGVGKSALTIQLIQNHFVDEYDPTIEDSYRKQVVIDGETCLLDILDTAG" +
            "QEEYSAMRDQYMRTGEGFLCVFAINNTKSFEDIHQYREQIKRVKDSDDVPMVLVGNKCDL" +
            "AARTVESRQAQDLARSYGIPYIETSAKTRQGVEDAFYTLVREIRQHKLRKLNPPDESGPG" +
            "CMSCKCVLS",
        "sequence_2":
            "MTEYKLYVVGAGGVGKSALTIQLIQNHFVDEYDPTIEDSYRKQVVIDGETCLLDILDTAW" +
            "QEEYSAMRDQYMRTGEGFLCVFAINNTKSFEDIHQYREQIKRVKDSDDVPMVLVGNKCDL" +
            "AARTVESRQAQDLARSYGIPYIETSAKTRQGVEDAFYTLVREIRQHKLRKLNPPDESGPG" +
            "CMSCKCVLS",
        "seq_dif": [
            {pos: 7, val: 1},
            {pos: 60, val: 1},
        ],
        "pin": [
            {pos: 200, val: 0.5, label: "1"},
            {pos: 355, val: 0.8, label: "2"},
            {pos: 100, val: 0.3, label: "3"},
            {pos: 400, val: 1, label: "4"},
        ],
        "line": [
            {pos: 0, val: 1.0},
            {pos: 10, val: 0.6},
            {pos: 20, val: 0.1},
            {pos: 30, val: 0.7},
            {pos: 40, val: 0.1},
            {pos: 50, val: 0.0},
            {pos: 60, val: 0.9},
            {pos: 70, val: 0.4},
            {pos: 80, val: 0.6},
            {pos: 90, val: 0.1},
            {pos: 100, val: 0.0},
            {pos: 110, val: 0.8},
            {pos: 120, val: 0.4},
            {pos: 130, val: 0.5},
            {pos: 140, val: 0.3},
            {pos: 150, val: 0.2},
            {pos: 160, val: 0.3},
            {pos: 170, val: 0.8},
            {pos: 180, val: 0.1},
            {pos: 190, val: 0.8},
            {pos: 200, val: 0.1},
            {pos: 210, val: 0.0},
            {pos: 220, val: 1.0},
            {pos: 230, val: 0.3},
            {pos: 240, val: 0.0},
            {pos: 250, val: 0.9},
            {pos: 260, val: 1.0},
            {pos: 270, val: 0.6},
            {pos: 280, val: 0.6},
            {pos: 290, val: 0.1},
            {pos: 300, val: 0.9},
            {pos: 310, val: 0.3},
            {pos: 320, val: 0.7},
            {pos: 330, val: 0.2},
            {pos: 340, val: 0.2},
            {pos: 350, val: 0.6},
            {pos: 360, val: 0.1},
            {pos: 370, val: 0.0},
            {pos: 380, val: 1.0},
            {pos: 390, val: 0.6},
            {pos: 400, val: 0.1},
            {pos: 410, val: 0.5},
            {pos: 420, val: 0.2},
            {pos: 430, val: 0.4},
            {pos: 440, val: 0.0},
            {pos: 450, val: 1.0},
            {pos: 460, val: 0.0},
            {pos: 470, val: 0.4},
            {pos: 480, val: 0.6},
            {pos: 490, val: 0.5},
            {pos: 500, val: 0.0}
        ],
        "area": [
            {pos: 0, val: 1.0},
            {pos: 10, val: 0.3},
            {pos: 20, val: 0.6},
            {pos: 30, val: 0.2},
            {pos: 40, val: 0.1},
            {pos: 50, val: 0.0},
            {pos: 60, val: 0.7},
            {pos: 70, val: 0.9},
            {pos: 80, val: 0.3},
            {pos: 90, val: 0.4},
            {pos: 100, val: 0.8},
            {pos: 110, val: 0.2},
            {pos: 120, val: 0.1},
            {pos: 130, val: 0.9},
            {pos: 140, val: 0.3},
            {pos: 150, val: 0.2},
            {pos: 160, val: 0.1},
            {pos: 170, val: 0.8},
            {pos: 180, val: 1.0},
            {pos: 190, val: 0.3},
            {pos: 200, val: 0.3},
            {pos: 210, val: 0.6},
            {pos: 220, val: 0.1},
            {pos: 230, val: 0.7},
            {pos: 240, val: 0.1},
            {pos: 250, val: 0.9},
            {pos: 260, val: 1.0},
            {pos: 270, val: 0.5},
            {pos: 280, val: 0.1},
            {pos: 290, val: 0.5},
            {pos: 300, val: 0.9},
            {pos: 310, val: 0.2},
            {pos: 320, val: 0.1},
            {pos: 330, val: 0.2},
            {pos: 340, val: 0.9},
            {pos: 350, val: 0.3},
            {pos: 360, val: 0.1},
            {pos: 370, val: 0.8},
            {pos: 380, val: 0.7},
            {pos: 390, val: 0.6},
            {pos: 400, val: 0.1},
            {pos: 410, val: 0.6},
            {pos: 420, val: 0.1},
            {pos: 430, val: 0.9},
            {pos: 440, val: 0.0},
            {pos: 450, val: 1.0},
            {pos: 460, val: 1.0},
            {pos: 470, val: 0.1},
            {pos: 480, val: 0.0},
            {pos: 490, val: 0.1},
            {pos: 500, val: 0.6}
        ],
        "block": [
            {start: 10, end: 50, description:"description of the element"}
        ]
    };
}