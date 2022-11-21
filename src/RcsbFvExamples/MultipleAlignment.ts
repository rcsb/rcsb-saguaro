import {RcsbFvRowConfigInterface} from "../RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvDisplayTypes} from "../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFv} from "../RcsbFv/RcsbFv";

const sequence = "MTTQAPTFTQPLQSVVVLEGSTATFEAHISGFPVPEVSWFRDGQVISTSTLPGVQISFSD" +
    "GRAKLTIPAVTKANSGRYSLKATNGSGQATSTAELLVKAETAPPNFVQRLQSMTVRQGSQ" +
    "VRLQVRVTGIPTPVVKFYRDGAEIQSSLDFQISQEGDLYSLLIAEAYPEDSGTYSVNATN" +
    "SVGRATSTAELLVQGEEEVPAKKTKTIVSTAQISESRQTRIEKKIEAHFDARSIATVEMV";



const compositeConfig: RcsbFvRowConfigInterface = {
    trackId: "compositeSequence1",
    trackHeight: 20,
    trackColor: "#F9F9F9",
    displayType: RcsbFvDisplayTypes.COMPOSITE,
    rowTitle: "Track 1",
    displayConfig: [
        {
            displayType: RcsbFvDisplayTypes.BLOCK,
            displayColor: "#9999FF",
            displayId:"compositeBlockSequence",
            displayData: [{
                begin:1,
                end:sequence.length
            }]
        },
        {
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            displayColor: "#000000",
            displayId:"compositeSeqeunce",
            displayData: [{
                begin:1,
                value:sequence
            }]
        }
    ]
};

const boardConfigData = {
    length: sequence.length,
    trackWidth: 940,
    includeAxis: true,
    includeTooltip: true,
    highlightHoverElement: true,
    hideInnerBorder: true,
    hideRowGlow: false
};

const fv = new RcsbFv({elementId:"pfv", boardConfigData, rowConfigData:Array(50).fill(undefined).map((i,n)=>{return {...compositeConfig, rowTitle: `Track ${n}`, innerTrackId: "compositeSequence_"+n};})});
fv.then(async ()=>{
    await fv.moveTrack(5,1);
    await fv.moveTrack(6,2);
    await fv.moveTrack(10,3);
});