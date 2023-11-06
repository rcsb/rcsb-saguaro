import {RcsbFvDisplayTypes} from '../RcsbFvConfig/RcsbFvDefaultConfigValues';
import {RcsbFvDisplayConfigInterface, RcsbFvRowExtendedConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbDisplayInterface} from "../../RcsbBoard/RcsbDisplay/RcsbDisplayInterface";
import {RcsbAxisDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbAxisDisplay";
import {RcsbPinDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbPinDisplay";
import {RcsbBondDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbBondDisplay";
import {RcsbFastSequenceDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbFastSequenceDisplay";
import {RcsbCompositeDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbCompositeDisplay";
import {RcsbBlockDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbBlockDisplay";
import {RcsbLineDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbLineDisplay";
import {RcsbAreaDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbAreaDisplay";
import {RcsbVariantDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbVariantDisplay";
import {RcsbVlineDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbVlineDisplay";
import {RcsbFvColorGradient} from "../../RcsbDataManager/RcsbDataManager";

export class RcsbFvDisplay {

    private displayIds: Array<string> = [];
    private readonly displayConfig: RcsbFvRowExtendedConfigInterface;

    constructor(config: RcsbFvRowExtendedConfigInterface){
        this.displayConfig = config;
    }

    public initDisplay() : RcsbDisplayInterface{
        const config = this.displayConfig;
        if (typeof config.displayType === "string" && config.displayType != RcsbFvDisplayTypes.COMPOSITE) {
            const out: RcsbDisplayInterface | null = RcsbFvDisplay.singleDisplay(config.displayType, config);
            if(out!= null)
                return out;
            else
                throw "Display config "+config+" not supported";
        }else if(typeof config.displayType === "string" && config.displayType == RcsbFvDisplayTypes.COMPOSITE){
            return this.composedDisplay(config);
        }else{
            throw "Display type "+config.displayType+" not supported";
        }
    }

    public getDisplayIds(){
        return this.displayIds;
    }

    private composedDisplay(config: RcsbFvRowExtendedConfigInterface) : RcsbDisplayInterface{
        const display:RcsbCompositeDisplay = new RcsbCompositeDisplay();
        let i = 0;
        if(config.displayConfig != undefined)
            for(let displayItem of config.displayConfig){
                let displayId: string = "displayId_"+Math.random().toString(36).substr(2);
                if(typeof displayItem.displayId === "string"){
                    displayId = displayItem.displayId;
                }
                const displayType: string = displayItem.displayType;
                let displayConfig: RcsbFvRowExtendedConfigInterface = config;
                if(config.displayConfig) {
                    displayConfig = RcsbFvDisplay.setDisplayConfig(config, config.displayConfig[i]);
                    i++;
                }
                const singleDisplay: RcsbDisplayInterface | null = RcsbFvDisplay.singleDisplay(displayType, displayConfig);
                if( singleDisplay != null) {
                    display.addDisplay(displayId, singleDisplay);
                    this.displayIds.push(displayId);
                }else{
                    throw "Display type "+displayConfig+" not supported";
                }
            }
        return display;
    }

    private static setDisplayConfig(config: RcsbFvRowExtendedConfigInterface, displayConfig: RcsbFvDisplayConfigInterface) : RcsbFvRowExtendedConfigInterface{
        return {...config,...displayConfig};
    }

    private static singleDisplay(type: string, config: RcsbFvRowExtendedConfigInterface): RcsbDisplayInterface {
        let out:RcsbDisplayInterface;
        if(config.boardId != undefined && config.trackId != undefined && config.displayColor != undefined) {
            switch (type) {
                case RcsbFvDisplayTypes.AXIS:
                    out = axisDisplay(config.boardId, config.trackId, config.length);
                    break;
                case RcsbFvDisplayTypes.BLOCK:
                    out = blockDisplay(config.boardId, config.trackId, config.displayColor as string);
                    break;
                case RcsbFvDisplayTypes.PIN:
                    if(config.displayDomain != undefined)
                        out = pinDisplay(config.boardId, config.trackId, config.displayColor as string, config.displayDomain);
                    else
                        throw "Track displayDomain (yScale) not defined";
                    break;
                case RcsbFvDisplayTypes.BOND:
                    out = bondDisplay(config.boardId, config.trackId, config.displayColor as string);
                    break;
                case RcsbFvDisplayTypes.SEQUENCE:
                    const dynamicDisplay: boolean = config.dynamicDisplay != undefined ? config.dynamicDisplay: false;
                    const nonEmptyDisplay: boolean = config.nonEmptyDisplay != undefined ? config.nonEmptyDisplay : false;
                    out = sequenceDisplay(config.boardId, config.trackId, config.displayColor as string, dynamicDisplay, nonEmptyDisplay);
                    break;
                case RcsbFvDisplayTypes.LINE:
                    if(config.displayDomain != undefined)
                        out = lineDisplay(config.boardId, config.trackId, config.displayColor as string, config.displayDomain, config.interpolationType);
                    else
                        throw "Track displayDomain (yScale) not defined";
                    break;
                case RcsbFvDisplayTypes.AREA:
                    if(config.displayDomain != undefined)
                        out = areaDisplay(config.boardId, config.trackId, config.displayColor as string|RcsbFvColorGradient, config.displayDomain, config.interpolationType);
                    else
                        throw "Track displayDomain (yScale) not defined";
                    break;
                case RcsbFvDisplayTypes.BLOCK_AREA:
                    if(config.displayDomain != undefined)
                        out = areaDisplay(config.boardId, config.trackId, config.displayColor as string|RcsbFvColorGradient, config.displayDomain, config.interpolationType, true);
                    else
                        throw "Track displayDomain (yScale) not defined";
                    break;
                case RcsbFvDisplayTypes.MULTI_AREA:
                    if(config.displayDomain != undefined)
                        out = areaDisplay(config.boardId, config.trackId, config.displayColor as string|RcsbFvColorGradient, config.displayDomain, config.interpolationType, false, true);
                    else
                        throw "Track displayDomain (yScale) not defined";
                    break;
                case RcsbFvDisplayTypes.VARIANT:
                    out = variantDisplay(config.boardId, config.trackId, config.displayColor as string);
                    break;
                case RcsbFvDisplayTypes.VLINE:
                    out = vlineDisplay(config.boardId, config.trackId, config.displayColor as string);
                    break;
                default:
                    throw "Track type " + config.displayType + " is not supported";
            }
            configDisplay(out, config);
        }else{
            console.error(config);
            throw "Single Display failed missing boardId or displayColor";
        }
        return out;
    }

}

function configDisplay(display: RcsbDisplayInterface, config: RcsbFvRowExtendedConfigInterface){
    if (display != null && typeof config.elementClickCallBack === "function") {
        display.setElementClickCallBack(config.elementClickCallBack);
    }
    if (display != null && typeof config.elementEnterCallBack === "function") {
        display.setElementEnterCallBack(config.elementEnterCallBack);
    }
    if (display != null && typeof config.elementLeaveCallBack === "function") {
        display.setElementLeaveCallBack(config.elementLeaveCallBack);
    }
    if (display != null && typeof config.updateDataOnMove === "function") {
        display.setUpdateDataOnMove(config.updateDataOnMove);
    }
    if (display != null && typeof config.includeTooltip === "boolean") {
        display.setTooltip(config.includeTooltip);
    }
    if(display!=null && typeof config.minRatio === "number"){
        display.setMinRatio(config.minRatio);
    }
    if(display!=null && typeof config.selectDataInRangeFlag === "boolean"){
        display.setSelectDataInRange(config.selectDataInRangeFlag);
    }
    if(display!=null && typeof config.hideEmptyTrackFlag === "boolean"){
        display.setHideEmptyTrack(config.hideEmptyTrackFlag);
    }
}

function axisDisplay(boardId:string, trackId:string, length:number|undefined): RcsbDisplayInterface{
    return new RcsbAxisDisplay(boardId,trackId,length);
}

function sequenceDisplay(boardId: string, trackId: string, color:string, dynamicDisplayFlag:boolean, nonEmptyDisplayFlag:boolean) : RcsbDisplayInterface{
    const display: RcsbFastSequenceDisplay = new RcsbFastSequenceDisplay(boardId, trackId);
    display.setDisplayColor(color);
    if(dynamicDisplayFlag) {
        display.setDynamicDisplay();
    }
    if(nonEmptyDisplayFlag){
        display.setNonEmptyDisplay(true);
    }
    return display;
}

function blockDisplay(boardId: string, trackId: string, color:string): RcsbDisplayInterface{
    const display: RcsbBlockDisplay = new RcsbBlockDisplay(boardId,trackId);
    display.setDisplayColor(color);
    return display;
}

function pinDisplay(boardId: string, trackId: string, color: string, domain:[number,number]): RcsbDisplayInterface{
    const display: RcsbPinDisplay = new RcsbPinDisplay(boardId,trackId);
    display.setDisplayColor(color);
    display.yDomain(domain);
    return display;
}

function bondDisplay(boardId: string, trackId: string, color: string): RcsbDisplayInterface{
    const display: RcsbBondDisplay = new RcsbBondDisplay(boardId, trackId);
    display.setDisplayColor(color);
    return display;
}

function lineDisplay(boardId: string, trackId: string, color: string, domain:[number,number], interpolationType?: string) : RcsbDisplayInterface{
    const display: RcsbLineDisplay = new RcsbLineDisplay(boardId,trackId);
    display.setDisplayColor(color);
    display.yDomain(domain);
    if(interpolationType != undefined)
        display.setInterpolationType(interpolationType);
    return display;
}

function areaDisplay(boardId: string, trackId: string, color: string | RcsbFvColorGradient, domain:[number,number], interpolationType?: string, blockAreaFlag?: boolean, multiAreaFlag?: boolean) : RcsbDisplayInterface{
    const display: RcsbAreaDisplay = new RcsbAreaDisplay(boardId,trackId);
    display.setDisplayColor(color);
    display.yDomain(domain);
    if(typeof interpolationType === "string")
        display.setInterpolationType(interpolationType);
    if(typeof blockAreaFlag === "boolean")
        display.setBlockArea(blockAreaFlag)
    if(typeof multiAreaFlag === "boolean")
        display.setMultiArea(multiAreaFlag)
    return display;
}

function variantDisplay(boardId: string, trackId: string, color: string) :RcsbDisplayInterface{
    const display: RcsbVariantDisplay = new RcsbVariantDisplay(boardId,trackId);
    display.setDisplayColor(color);
    return display;
}

function vlineDisplay(boardId: string, trackId: string, color:string) : RcsbDisplayInterface{
    const display: RcsbVlineDisplay = new RcsbVlineDisplay(boardId, trackId);
    display.setDisplayColor(color);
    return display;
}
