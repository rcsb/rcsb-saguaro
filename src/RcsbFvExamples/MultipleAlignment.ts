import {RcsbFvRowPublicConfigType} from "../RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvDisplayTypes} from "../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFv} from "../RcsbFv/RcsbFv";

const sequence = "MTTQAPTFTQPLQSVVVLEGSTATFEAHISGFPVPEVSWFRDGQVISTSTLPGVQISFSD" +
    "GRAKLTIPAVTKANSGRYSLKATNGSGQATSTAELLVKAETAPPNFVQRLQSMTVRQGSQ" +
    "VRLQVRVTGIPTPVVKFYRDGAEIQSSLDFQISQEGDLYSLLIAEAYPEDSGTYSVNATN" +
    "SVGRATSTAELLVQGEEEVPAKKTKTIVSTAQISESRQTRIEKKIEAHFDARSIATVEMV";



const compositeConfig: RcsbFvRowPublicConfigType = {
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

const fv = new RcsbFv({elementId:"pfv", boardConfigData, rowConfigData:Array(500).fill(undefined).map((i,n)=>{
    return {
        ...compositeConfig,
        rowTitle: `Track ${n}`,
        trackId: "compositeSequence_"+n,
        trackVisibility: n % 2 == 0
    };})});


/*
fv.then(async ()=>{
    for(let i = 0; i< 100; i++){
        await fv.changeTrackVisibility({
            trackId: "compositeSequence_"+(2*i+1),
            visibility: true
        })
    }
    await fv.moveTrack(5,1);
    await fv.moveTrack(6,2);
    await fv.moveTrack(10,3);
});
*/
