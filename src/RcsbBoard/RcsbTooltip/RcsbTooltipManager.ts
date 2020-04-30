import {createPopper} from "@popperjs/core";
import {RcsbFvTrackDataElementInterface} from "../../RcsbFv";

export class RcsbTooltipManager {
    private readonly boardId: string;
    constructor(boardId: string) {
        this.boardId = boardId;
    }

    showTooltip(d: RcsbFvTrackDataElementInterface){
        const refDiv: HTMLDivElement = document.querySelector("#"+this.boardId);
        const tooltipDiv: HTMLDivElement = document.querySelector("#"+this.boardId+"_tooltip");
        tooltipDiv.removeAttribute("popper-hidden");

        let region: string = "Residues: "+d.begin.toString();
        if(typeof d.end === "number" && d.end!=d.begin) region += " - "+d.end.toString();
        const spanRegion: HTMLSpanElement = document.createElement<"span">("span");
        spanRegion.append(region);

        if(typeof d.ori_begin === "number"){
            let ori_region: string = d.ori_begin.toString();
            if(typeof d.ori_end === "number") ori_region += " - "+d.ori_end.toString();
            const spanOriRegion: HTMLSpanElement = document.createElement<"span">("span");
            spanOriRegion.append("  ("+d.source+": "+ori_region+")");
            spanOriRegion.style.color = "#888888";
            spanRegion.append(spanOriRegion);
        }

        let title:string = RcsbTooltipManager.capitalizeFirstLetter(d.title);
        if(typeof d.name === "string") title = RcsbTooltipManager.capitalizeFirstLetter(d.name);
        tooltipDiv.append(title);
        const b:HTMLSpanElement = document.createElement<"span">("span");
        b.append(" | ");
        b.style.fontWeight = "bold";
        tooltipDiv.append( b );
        tooltipDiv.append(spanRegion);
        createPopper(refDiv, tooltipDiv, {
            placement:'top-end'
        });
    }

    showTooltipDescription(d: RcsbFvTrackDataElementInterface){
        if(d.description == null || d.description.length == 0) return;
        const refDiv: Element = document.querySelector("#"+this.boardId).children.item(1);
        const tooltipDiv: HTMLDivElement = document.querySelector("#"+this.boardId+"_tooltipDescription");
        tooltipDiv.removeAttribute("popper-hidden");
        d.description.forEach(des=>{
            const desDiv = document.createElement<"div">("div");
            desDiv.append(RcsbTooltipManager.capitalizeFirstLetter(des));
            tooltipDiv.append(desDiv);
        });
        createPopper(refDiv, tooltipDiv, {
            placement:'right-start',
            modifiers: [{
                name: 'offset',
                options: {
                    offset: [0,5],
                },
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
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
}