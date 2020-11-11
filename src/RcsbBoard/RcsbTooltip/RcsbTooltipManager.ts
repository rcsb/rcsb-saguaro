import {createPopper} from "@popperjs/core";

import {RcsbFvTrackDataElementInterface} from "../../RcsbFv";
import {RcsbFvDOMConstants} from "../../RcsbFv/RcsbFvConfig/RcsbFvDOMConstants";

export class RcsbTooltipManager {
    private readonly boardId: string;
    private readonly divHeight:number = 25;
    constructor(boardId: string) {
        this.boardId = boardId;
    }

    showTooltip(d: RcsbFvTrackDataElementInterface){
        const refDiv: HTMLDivElement | null= document.querySelector("#"+this.boardId);
        if(refDiv == null)
            throw "Main board DOM element not found";
        const tooltipDiv: HTMLDivElement  | null= document.querySelector("#"+this.boardId+RcsbFvDOMConstants.TOOLTIP_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            throw "Tooltip DOM element not found";
        tooltipDiv.innerHTML = "";
        tooltipDiv.removeAttribute(RcsbFvDOMConstants.POPPER_HIDDEN);

        let region: string = "Position: "+d.begin.toString();
        if(typeof d.end === "number" && d.end!=d.begin) region += " - "+d.end.toString();
        const spanRegion: HTMLSpanElement = document.createElement<"span">("span");
        spanRegion.append(region);

        if(typeof d.beginName === "string" && d.indexName != undefined){
            spanRegion.append(RcsbTooltipManager.buildIndexNames(d.beginName,d.endName,d.indexName));
        }

        if(typeof d.oriBegin === "number"){
            let ori_region: string = d.oriBegin.toString();
            if(typeof d.oriEnd === "number") ori_region += " - "+d.oriEnd.toString();
            const spanOriRegion: HTMLSpanElement = document.createElement<"span">("span");
            if(d.source != undefined)
                spanOriRegion.append(" | ["+d.source.replace("_"," ")+"] "+d.sourceId+": "+ori_region);
            spanOriRegion.style.color = "#888888";
            if( typeof d.oriBeginName === "string" && d.indexName!= undefined)
                spanOriRegion.append(RcsbTooltipManager.buildIndexNames(d.oriBeginName,d.oriEndName,d.indexName));
            spanRegion.append(spanOriRegion);
        }

        let title:string | undefined = d.title;
        if(typeof d.name === "string") title = d.name;
        else if( typeof d.featureId === "string") title = d.featureId;
        if(title != undefined )tooltipDiv.append(title);
        if(typeof d.provenanceName === "string"){
            const spanProvenance: HTMLSpanElement = document.createElement<"span">("span");

            const spanProvenanceString: HTMLSpanElement = document.createElement<"span">("span");
            spanProvenanceString.append(d.provenanceName);
            if(typeof d.provenanceColor === "string")
                spanProvenanceString.style.color = d.provenanceColor;
            else
                spanProvenanceString.style.color = "#888888";
            spanProvenance.append(" [",spanProvenanceString,"]");
            spanProvenance.style.color = "#888888";
            tooltipDiv.append(spanProvenance);
            tooltipDiv.append( RcsbTooltipManager.bNode() );
        }else if(title!=undefined){
            tooltipDiv.append( RcsbTooltipManager.bNode() );
        }
        if(typeof d.value === "number"){
            const valueRegion: HTMLSpanElement = document.createElement<"span">("span");
            valueRegion.append(" val: "+d.value);
            tooltipDiv.append(valueRegion);
            tooltipDiv.append(RcsbTooltipManager.bNode());
        }
        tooltipDiv.append(spanRegion);
        createPopper(refDiv, tooltipDiv, {
            placement:'top-end',
            modifiers:[{
                name: 'preventOverflow',
                options: {
                    altAxis: true
                }
            },{
                name: 'flip',
                options: {
                    fallbackPlacements: ['bottom-end', 'right', 'auto'],
                },
            }]
        }).forceUpdate();
    }

    private static buildIndexNames(beginName:string, endName:string|undefined, name: string): HTMLSpanElement{
        const spanAuthRegion: HTMLSpanElement = document.createElement<"span">("span");
        let authRegion: string = beginName;
        if(typeof endName === "string") authRegion += " - "+endName;
        spanAuthRegion.append( " ["+name+": "+authRegion+"]" );
        spanAuthRegion.style.color = "#888888";
        return spanAuthRegion;
    }

    showTooltipDescription(d: RcsbFvTrackDataElementInterface){
        if(d.description == null || d.description.length == 0) return;
        const refDiv: HTMLDivElement | null = document.querySelector("#"+this.boardId);
        if(refDiv == null)
            throw "Main board DOM element not found";
        const tooltipDiv: HTMLDivElement | null = document.querySelector("#"+this.boardId+RcsbFvDOMConstants.TOOLTIP_DESCRIPTION_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            throw "Tooltip DOM element not found";
        tooltipDiv.innerHTML = "";
        tooltipDiv.removeAttribute(RcsbFvDOMConstants.POPPER_HIDDEN);
        d.description.forEach(des=>{
            const desDiv = document.createElement<"div">("div");
            desDiv.append(des);
            tooltipDiv.append(desDiv);
        });

        createPopper(refDiv, tooltipDiv, {
            placement:'top-end',
            modifiers: [{
                name: 'preventOverflow',
                options: {
                    altAxis: true
                }
            },{
                name: 'flip',
                options: {
                    fallbackPlacements: ['bottom-end', 'right-start', 'right', 'auto'],
                },
            },{
                name: 'offset',
                options: {
                    offset: [0,30]
                }
            }]
        }).forceUpdate();
    }

    hideTooltip(){
        RcsbTooltipManager._hideTooltip(this.boardId+RcsbFvDOMConstants.TOOLTIP_DOM_ID_PREFIX);
        RcsbTooltipManager._hideTooltip(this.boardId+RcsbFvDOMConstants.TOOLTIP_DESCRIPTION_DOM_ID_PREFIX);
    }

    private static _hideTooltip(name: string){
        const tooltipDiv: HTMLDivElement | null = document.querySelector("#"+name);
        if(tooltipDiv == null)
            throw "Tooltip DOM element not found";
        tooltipDiv.innerHTML = "";
        tooltipDiv.setAttribute(RcsbFvDOMConstants.POPPER_HIDDEN,"");
    }

    private static capitalizeFirstLetter(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    private static bNode(): HTMLSpanElement{
        const b:HTMLSpanElement = document.createElement<"span">("span");
        b.append(" | ");
        b.style.fontWeight = "bold";
        return b;
    }
}