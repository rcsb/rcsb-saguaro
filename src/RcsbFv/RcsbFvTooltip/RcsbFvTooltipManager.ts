import {RcsbFvDOMConstants} from "../RcsbFvConfig/RcsbFvDOMConstants";
import {computePosition, detectOverflow} from "@floating-ui/dom";
import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbFvTooltipInterface} from "./RcsbFvTooltipInterface";

export class RcsbFvTooltipManager {

    private readonly boardId: string;
    private readonly tooltipDiv: HTMLDivElement;
    private readonly tooltipDescriptionDiv: HTMLDivElement;
    private readonly refDiv: HTMLDivElement;
    private readonly tooltip: RcsbFvTooltipInterface;

    constructor(boardId: string, tooltip: RcsbFvTooltipInterface) {
        this.boardId = boardId;
        this.tooltip = tooltip;
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
        const divTooltip = this.tooltip.showTooltip(d);
        if(!divTooltip)
            return;
        this.tooltipDiv.append(divTooltip);
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

    showTooltipDescription(d: RcsbFvTrackDataElementInterface){
        this.tooltipDescriptionDiv.textContent = "";
        this.tooltipDescriptionDiv.style.visibility = "hidden";
        const description = this.tooltip.showTooltipDescription(d);
        if(!description)
            return;
        this.tooltipDescriptionDiv.append(description);
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
}