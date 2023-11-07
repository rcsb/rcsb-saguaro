import {RcsbFvTooltipInterface} from "../RcsbFvTooltipInterface";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export class RcsbFvTooltip implements RcsbFvTooltipInterface {

    public showTooltip(d: RcsbFvTrackDataElementInterface): HTMLElement {
        const tooltipDiv = document.createElement<"div">("div");

        let region: string = "Position: "+d.begin.toString();
        if(typeof d.end === "number" && d.end!=d.begin) region += " - "+d.end.toString();
        const spanRegion: HTMLSpanElement = document.createElement<"span">("span");
        spanRegion.append(region);

        if(typeof d.value === "number"){
            const valueRegion: HTMLSpanElement = document.createElement<"span">("span");
            valueRegion.append(" value: "+d.value);
            tooltipDiv.append(valueRegion);
            tooltipDiv.append(RcsbFvTooltip.bNode());
        }
        tooltipDiv.append(spanRegion);
        return tooltipDiv;
    }

    public showTooltipDescription(d: RcsbFvTrackDataElementInterface): undefined {
        return undefined;
    }

    private static bNode(): HTMLSpanElement{
        const b:HTMLSpanElement = document.createElement<"span">("span");
        b.append(" | ");
        b.style.fontWeight = "bold";
        return b;
    }

}