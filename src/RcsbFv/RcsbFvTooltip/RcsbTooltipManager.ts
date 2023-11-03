import {RcsbFvDOMConstants} from "../RcsbFvConfig/RcsbFvDOMConstants";
import {computePosition, detectOverflow} from "@floating-ui/dom";
import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";

export class RcsbTooltipManager {

    private readonly boardId: string;

    private tooltipDiv: HTMLDivElement;
    private tooltipDescriptionDiv: HTMLDivElement;
    private refDiv: HTMLDivElement;

    constructor(boardId: string) {
        this.boardId = boardId;
        const refDiv: HTMLDivElement | null= document.querySelector("#"+this.boardId);
        if(refDiv == null)
            throw "Main board DOM element not found";
        this.refDiv = refDiv;
        const tooltipDiv: HTMLDivElement  | null= document.querySelector("#"+this.boardId+RcsbFvDOMConstants.TOOLTIP_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            throw "Tooltip DOM element not found";
        this.tooltipDiv = tooltipDiv;
        const tooltipDescriptionDiv: HTMLDivElement | null = document.querySelector("#"+this.boardId+RcsbFvDOMConstants.TOOLTIP_DESCRIPTION_DOM_ID_PREFIX);
        if(tooltipDescriptionDiv == null)
            throw "Tooltip DOM element not found";
        this.tooltipDescriptionDiv = tooltipDescriptionDiv;

        Object.assign(this.tooltipDiv.style, {
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'nowrap',
            top: '0',
            left: '0',
        });

        Object.assign(this.tooltipDescriptionDiv.style, {
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'nowrap',
            top: '0',
            left: '0',
        });
    }

    showTooltip(d: RcsbFvTrackDataElementInterface){

        this.tooltipDiv.textContent = "";

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
        if(title != undefined )this.tooltipDiv.append(title);
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
            this.tooltipDiv.append(spanProvenance);
            this.tooltipDiv.append( RcsbTooltipManager.bNode() );
        }else if(title!=undefined){
            this.tooltipDiv.append( RcsbTooltipManager.bNode() );
        }
        if(typeof d.value === "number"){
            const valueRegion: HTMLSpanElement = document.createElement<"span">("span");
            valueRegion.append(" value: "+d.value);
            this.tooltipDiv.append(valueRegion);
            this.tooltipDiv.append(RcsbTooltipManager.bNode());
        }
        this.tooltipDiv.append(spanRegion);
        computePosition(this.refDiv,this.tooltipDiv,{
            placement:'top-end',
            middleware:[{
                name: 'middleware',
                async fn(middlewareArguments) {
                    const overflow = await detectOverflow(middlewareArguments,{
                        rootBoundary: "viewport"
                    });
                    if(overflow.top > 0)
                        return {y:overflow.top+middlewareArguments.y};
                    return {};
                },
            }]
        }).then((o) => {
            Object.assign(this.tooltipDiv.style, {
                left: `${o.x}px`,
                top: `${o.y}px`,
                visibility: 'visible'
            });
        });
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
        this.tooltipDescriptionDiv.textContent = "";
        d.description.forEach(des=>{
            const desDiv = document.createElement<"div">("div");
            desDiv.append(des);
            this.tooltipDescriptionDiv.append(desDiv);
        });
        computePosition(this.refDiv,this.tooltipDescriptionDiv,{
            placement:'top-end',
            middleware:[{
                name: 'middleware',
                async fn(middlewareArguments) {
                    const overflow = await detectOverflow(middlewareArguments,{
                        rootBoundary: "viewport"
                    });
                    if(overflow.top > 0)
                        return {y:overflow.top+middlewareArguments.y};
                    return {};
                },
            }]
        }).then(({x, y}) => {
            Object.assign(this.tooltipDescriptionDiv.style, {
                left: `${x}px`,
                top: `${y-30}px`,
                visibility: 'visible'
            });
        });
    }

    hideTooltip(){
        this.tooltipDiv.innerHTML = "";
        this.tooltipDiv.style.visibility = "hidden";
        this.tooltipDescriptionDiv.innerHTML = "";
        this.tooltipDescriptionDiv.style.visibility = "hidden";
    }

    private static bNode(): HTMLSpanElement{
        const b:HTMLSpanElement = document.createElement<"span">("span");
        b.append(" | ");
        b.style.fontWeight = "bold";
        return b;
    }
}