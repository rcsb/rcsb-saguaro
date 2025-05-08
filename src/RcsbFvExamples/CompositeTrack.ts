import {
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface
} from "../RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFv} from "../RcsbFv/RcsbFv";
import {RcsbFvDisplayTypes} from "../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";

const sequence = "MTTQAPTFTQPLQSVVVLEGSTATFEAHISGFPVPEVSWFRDGQVISTSTLPGVQISFSD" +
    "GRAKLTIPAVTKANSGRYSLKATNGSGQATSTAELLVKAETAPPNFVQRLQSMTVRQGSQ" +
    "VRLQVRVTGIPTPVVKFYRDGAEIQSSLDFQISQEGDLYSLLIAEAYPEDSGTYSVNATN" +
    "SVGRATSTAELLVQGEEEVPAKKTKTIVSTAQISESRQTRIEKKIEAHFDARSIATVEMV";



const rowConfigData: RcsbFvRowConfigInterface[] = [
    {
        trackId: "compositeSequence1",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.COMPOSITE,
        rowTitle: "ZOOM ME",
        displayConfig: [
            {
                displayType: RcsbFvDisplayTypes.BLOCK,
                displayColor: "#9999FF",
                displayId:"compositeBlockSequence",
                displayData: [{
                    begin:50,
                    end:80
                }]
            },
            {
                displayType: RcsbFvDisplayTypes.PIN,
                displayColor: "#FF9999",
                displayId:"compositePin",
                displayData: [{
                    begin:55
                },{
                    begin:75
                }]
            },
            {
                displayType: RcsbFvDisplayTypes.SEQUENCE,
                displayColor: "#000000",
                displayId:"compositeSeqeunce",
                displayData: [{
                    begin:50,
                    label:"TCLLDELDTAGQEEYSAMRDQYMRTSEGFLC"
                }]
            }
        ]
    }
];

const boardConfigData: RcsbFvBoardConfigInterface = {
    length: sequence.length,
    trackWidth: 940,
    includeAxis: false,
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

const sequenceConfigData: RcsbFvRowConfigInterface[] = [
    {
        trackId: "sequenceTrack",
        trackVisibility: false,
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.SEQUENCE,
        nonEmptyDisplay: true,
        rowTitle: "SEQUENCE",
        trackData: [
            {
                begin: 1,
                label: sequence
            }
        ]
    }];

const element = document.getElementById("pfv");

if (element == null){
    throw "Unable to locate element";
}

const fv = new RcsbFv({elementId:element, boardConfigData, rowConfigData: [...sequenceConfigData, ...rowConfigData]});
fv.then(()=>{
    console.log("Ready viewer");
});

