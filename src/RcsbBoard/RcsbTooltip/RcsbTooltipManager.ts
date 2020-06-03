import {createPopper} from "@popperjs/core";
import {RcsbFvTrackDataElementInterface} from "../../RcsbFv";

export class RcsbTooltipManager {
    private readonly boardId: string;
    private readonly divHeight:number = 25;
    constructor(boardId: string) {
        this.boardId = boardId;
    }

    showTooltip(d: RcsbFvTrackDataElementInterface){
        const refDiv: HTMLDivElement = document.querySelector("#"+this.boardId);
        const tooltipDiv: HTMLDivElement = document.querySelector("#"+this.boardId+"_tooltip");
        tooltipDiv.innerHTML = null;
        tooltipDiv.removeAttribute("popper-hidden");

        let region: string = "Residues: "+d.begin.toString();
        if(typeof d.end === "number" && d.end!=d.begin) region += " - "+d.end.toString();
        const spanRegion: HTMLSpanElement = document.createElement<"span">("span");
        spanRegion.append(region);

        if(typeof d.beginName === "string"){
            spanRegion.append(RcsbTooltipManager.buildIndexNames(d.beginName,d.endName,d.indexName));
        }

        if(typeof d.oriBegin === "number"){
            let ori_region: string = d.oriBegin.toString();
            if(typeof d.oriEnd === "number") ori_region += " - "+d.oriEnd.toString();
            const spanOriRegion: HTMLSpanElement = document.createElement<"span">("span");
            spanOriRegion.append(" | "+d.provenance.replace("_"," ")+" > "+d.sourceId+": "+ori_region);
            spanOriRegion.style.color = "#888888";
            if( typeof d.oriBeginName === "string")
                spanOriRegion.append(RcsbTooltipManager.buildIndexNames(d.oriBeginName,d.oriEndName,d.indexName));
            spanRegion.append(spanOriRegion);
        }

        let title:string = RcsbTooltipManager.capitalizeFirstLetter(d.title);
        if(typeof d.name === "string") title = RcsbTooltipManager.capitalizeFirstLetter(d.name);
        tooltipDiv.append(title);
        tooltipDiv.append( this.bNode() );
        if(typeof d.value === "number"){
            const valueRegion: HTMLSpanElement = document.createElement<"span">("span");
            valueRegion.append(" val: "+d.value);
            tooltipDiv.append(valueRegion);
            tooltipDiv.append(this.bNode());
        }
        tooltipDiv.append(spanRegion);
        tooltipDiv.style.height = this.divHeight.toString()+"px";
        tooltipDiv.style.lineHeight = this.divHeight.toString()+"px";
        createPopper(refDiv, tooltipDiv, {
            placement:'top-end'
        });
    }

    private static buildIndexNames(beginName:string, endName:string, name: string): HTMLSpanElement{
        const spanAuthRegion: HTMLSpanElement = document.createElement<"span">("span");
        let authRegion: string = beginName;
        if(typeof endName === "string") authRegion += " - "+endName;
        spanAuthRegion.append( " ["+name+": "+authRegion+"]" );
        spanAuthRegion.style.color = "#888888";
        return spanAuthRegion;
    }

    showTooltipDescription(d: RcsbFvTrackDataElementInterface){
        if(d.description == null || d.description.length == 0) return;
        const refDiv: HTMLDivElement = document.querySelector("#"+this.boardId);
        const tooltipDiv: HTMLDivElement = document.querySelector("#"+this.boardId+"_tooltipDescription");
        tooltipDiv.innerHTML = null;
        tooltipDiv.removeAttribute("popper-hidden");
        tooltipDiv.style.height = (this.divHeight*d.description.length).toString()+"px";
        d.description.forEach(des=>{
            const desDiv = document.createElement<"div">("div");
            desDiv.append(RcsbTooltipManager.capitalizeFirstLetter(des));
            desDiv.style.height = this.divHeight.toString()+"px";
            desDiv.style.lineHeight = this.divHeight.toString()+"px";
            tooltipDiv.append(desDiv);
        });

        createPopper(refDiv, tooltipDiv, {
            placement:'top-end',
            modifiers: [{
                name: 'offset',
                options: {
                    offset: [0,30]
                }
            }]
        });
    }

    hideTooltip(){
        RcsbTooltipManager._hideTooltip(this.boardId+"_tooltip");
        RcsbTooltipManager._hideTooltip(this.boardId+"_tooltipDescription");
    }

    private static _hideTooltip(name: string){
        const tooltipDiv: HTMLDivElement = document.querySelector("#"+name);
        tooltipDiv.innerHTML = null;
        tooltipDiv.setAttribute("popper-hidden",null);
    }

    private static capitalizeFirstLetter(string: string): string {
        if(string == null)
            return null;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    private bNode(): HTMLSpanElement{
        const b:HTMLSpanElement = document.createElement<"span">("span");
        b.append(" | ");
        b.style.fontWeight = "bold";
        return b;
    }
}