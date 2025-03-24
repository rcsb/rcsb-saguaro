import {
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface
} from "../RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFv} from "../RcsbFv/RcsbFv";
import {RcsbFvDisplayTypes} from "../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";

const N = 100;

const boardConfigData: RcsbFvBoardConfigInterface = {
    length: N,
    trackWidth: 940,
    includeAxis: true,
    includeTooltip: true,
    //disableMenu: true,
    highlightHoverElement: true,
    hideInnerBorder: true,
    hideRowGlow: false,
    elementClickCallback: (e)=>{
        console.log(e);
    },
    selectionChangeCallback:(e)=>{
        console.log(">>> ", e);
    },
    onFvRenderStartsCallback:()=>{
        console.log("Fv starts");
    }
};

const blockAreaConfigData: RcsbFvRowConfigInterface[] = [
    {
        trackId: "BLOCK_AREA_1",
        rowTitle: "GRADIENT AREA",
        trackColor: "#F9F9F9",
        trackData:  Array.from({ length: N }, (_, idx) => ({
            begin: idx+1,
            value: Math.random()
        })),
        displayType: RcsbFvDisplayTypes.BLOCK_AREA,
        displayColor: {
            thresholds: [0.33,0.66],
            colors: [
                "#3b6178",
                "#e45c87",
                "#75ac75"
            ]
        },
        displayDomain: [0,1]
    },    {
        trackId: "BLOCK_AREA_2",
        rowTitle: "ALPHA AREA",
        trackColor: "#F9F9F9",
        trackData:  Array.from({ length: N }, (_, idx) => ({
            begin: idx+1,
            value: Math.random()
        })),
        displayType: RcsbFvDisplayTypes.BLOCK_AREA,
        displayColor: {
            thresholds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
            colors: "#f48484"
        },
        displayDomain: [0,1]
    }
];



const fv = new RcsbFv({elementId:"pfv", boardConfigData, rowConfigData: blockAreaConfigData});
fv.then(()=>{
    console.log("Ready viewer");
});

