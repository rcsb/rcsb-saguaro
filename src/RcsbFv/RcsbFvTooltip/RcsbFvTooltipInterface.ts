import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";

export interface RcsbFvTooltipInterface {
    showTooltip(d: RcsbFvTrackDataElementInterface): HTMLElement | undefined;
    showTooltipDescription?(d: RcsbFvTrackDataElementInterface): HTMLElement | undefined;
}