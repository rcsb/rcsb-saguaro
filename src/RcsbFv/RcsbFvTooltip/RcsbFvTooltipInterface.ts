import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";

export interface RcsbFvTooltipInterface<T> {
    showTooltip(d: RcsbFvTrackDataElementInterface & T): HTMLElement | undefined;
    showTooltipDescription(d: RcsbFvTrackDataElementInterface & T): HTMLElement | undefined;
}