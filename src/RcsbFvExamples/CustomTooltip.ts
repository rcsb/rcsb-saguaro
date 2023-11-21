import {
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface
} from "../RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFv} from "../RcsbFv/RcsbFv";
import {RcsbFvDisplayTypes} from "../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvTrackDataElementInterface} from "../RcsbDataManager/RcsbDataManager";

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
                    end:80,
                    value: 23
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
    },
    tooltipGenerator: tooltipGenerator()
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

const fv = new RcsbFv({elementId:"pfv", boardConfigData, rowConfigData: [...sequenceConfigData, ...rowConfigData]});
fv.then(()=>{
    console.log("Ready viewer");
});

function tooltipGenerator( ) {
    return {
        showTooltip: (d: RcsbFvTrackDataElementInterface) => {
            const tooltipDiv = document.createElement<"div">("div");

            let region: string = "Begin: "+d.begin.toString();
            if(typeof d.end === "number" && d.end!=d.begin) region += " End: "+d.end.toString();
            const spanRegion: HTMLSpanElement = document.createElement<"span">("span");
            spanRegion.append(region);

            if(typeof d.value === "number"){
                const valueRegion: HTMLSpanElement = document.createElement<"span">("span");
                valueRegion.append(" | value: "+d.value);
                spanRegion.append(valueRegion);
            }

            tooltipDiv.append(spanRegion);
            return tooltipDiv;
        }
    }
}