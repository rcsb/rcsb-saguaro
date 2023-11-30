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
        trackId: "sequenceTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.SEQUENCE,
        nonEmptyDisplay: true,
        rowTitle: "SEQUENCE",
        rowMark:{
            clickCallback:()=>{
                console.log("clickCallback");
            },
            hoverCallback:()=>{
                console.log("hoverCallback");
            }
        },
        trackData: [
            {
                begin: 1,
                label: sequence
            }
        ]
    },
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
    },
    {
        trackId: "compositeSequence2",
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
    },
    {
        trackId: "block",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.BLOCK,
        rowTitle: "BLOCK",
        hideEmptyTrackFlag: true,
        selectDataInRangeFlag: true,
        trackData: [{
            name: "Name",
            provenanceName: "ProvenanceName",
            provenanceColor: "green",
            begin: 50,
            end: 80,
            source: "Source",
            sourceId: "SourceId",
            oriBegin: 70,
            oriEnd: 100
        }],
        metadata:{
            type: "my-block",
            id: "block"
        }
    },
    ... Array.from(Array(100).fill(0).keys()).map(i=>({
        trackId: `block-area-${i}`,
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.BLOCK_AREA,
        rowTitle: `BLOCK-${i+1}`,
        displayColor: "#F99",
        trackData: Array.from(Array(50).keys()).map(i=>({begin:15+i,value:1}))
    }))

];

const boardConfigData: RcsbFvBoardConfigInterface = {
    length: sequence.length,
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
    },
    highlightHoverPosition: true
};

/*const sequenceConfigData = [
    {
        trackId: "sequenceTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: "sequence",
        nonEmptyDisplay: true,
        rowTitle: "SEQUENCE",
        trackData: [
            {
                begin: 1,
                value: sequence
            }
        ]
    }];*/

/*const fv = new RcsbFv({elementId:"pfv", boardConfigData, rowConfigData});
fv.then(()=>{
    console.log("Ready viewer");
});
setTimeout(async ()=>{
    await fv.then(()=>{})
    await fv.updateTrackData("block", [{begin:10,end:50}]);
    console.log("updateTrackData END");
    setTimeout(async ()=>{
        await fv.moveTrack(3,1);
        console.log("moveTrack END");
        setTimeout(async ()=>{
            await fv.changeTrackVisibility({trackId:"compositeSequence2", visibility:false});
            console.log("changeTrackVisibility false END");
            setTimeout(async ()=>{
                await fv.changeTrackVisibility({trackId:"compositeSequence2", visibility:true});
                console.log("changeTrackVisibility true END");
                setTimeout(async ()=>{
                    await fv.updateBoardConfig({boardConfigData:{trackWidth:500}})
                    console.log("updateBoardConfig END");
                }, 2000)
            },2000)
        },2000)

    }, 2000)
},2000)
console.log(fv.getBoardData().map(d=>d.metadata));*/

const fv2 = new RcsbFv({elementId:"pfvBis", boardConfigData, rowConfigData});
fv2.then(()=>{
    console.log("Ready viewer");
});
