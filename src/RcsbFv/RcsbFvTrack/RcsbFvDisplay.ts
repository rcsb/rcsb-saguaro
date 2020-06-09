import {RcsbFvDisplayTypes} from '../RcsbFvConfig/RcsbFvDefaultConfigValues';
import {RcsbFvDisplayConfigInterface, RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbDisplayInterface} from "../../RcsbBoard/RcsbDisplay/RcsbDisplayInterface";
import {RcsbAxisDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbAxisDisplay";
import {RcsbPinDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbPinDisplay";
import {RcsbBondDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbBondDisplay";
import {RcsbSequenceDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbSequenceDisplay";
import {RcsbCompositeDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbCompositeDisplay";
import {RcsbBlockDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbBlockDisplay";
import {RcsbLineDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbLineDisplay";
import {RcsbAreaDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbAreaDisplay";
import {RcsbVariantDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbVariantDisplay";
import {RcsbVlineDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbVlineDisplay";

export class RcsbFvDisplay {

    private displayIds: Array<string> = [];
    private readonly displayConfig: RcsbFvRowConfigInterface;

    constructor(config: RcsbFvRowConfigInterface){
        this.displayConfig = config;
    }

    public initDisplay() : RcsbDisplayInterface{
        const config = this.displayConfig;
        if (typeof config.displayType === "string" && config.displayType != RcsbFvDisplayTypes.COMPOSITE) {
            return RcsbFvDisplay.singleDisplay(config.displayType, config);
        }else if(typeof config.displayType === "string" && config.displayType == RcsbFvDisplayTypes.COMPOSITE){
            return this.composedDisplay(config);
        }else{
            throw "Display type "+config.displayType+" not supported";
        }
    }

    public getDisplayIds(){
        return this.displayIds;
    }

    private composedDisplay(config: RcsbFvRowConfigInterface) : RcsbDisplayInterface{
        const display:RcsbCompositeDisplay = new RcsbCompositeDisplay();
        let i = 0;
        for(let displayItem of config.displayConfig){
            let displayId: string = "displayId_"+Math.random().toString(36).substr(2);
            if(typeof displayItem.displayId === "string"){
                displayId = displayItem.displayId;
            }
            const displayType: string = displayItem.displayType;
            let displayConfig: RcsbFvRowConfigInterface = config;
            if(config.displayConfig) {
                displayConfig = RcsbFvDisplay.setDisplayConfig(config, config.displayConfig[i]);
                i++;
            }
            display.addDisplay( displayId, RcsbFvDisplay.singleDisplay(displayType, displayConfig) );
            this.displayIds.push(displayId);
        }
        return display;
    }

    private static setDisplayConfig(config: RcsbFvRowConfigInterface, displayConfig: RcsbFvDisplayConfigInterface) : RcsbFvRowConfigInterface{
        const out: RcsbFvRowConfigInterface = Object.assign({},config);
        if(typeof displayConfig.displayColor === "string"){
            out.displayColor = displayConfig.displayColor;
        }
        if(typeof displayConfig.dynamicDisplay === "boolean"){
            out.dynamicDisplay = displayConfig.dynamicDisplay;
        }
        return out;
    }

    private static singleDisplay(type: string, config: RcsbFvRowConfigInterface): RcsbDisplayInterface {
        let out:RcsbDisplayInterface = null;
        switch (type) {
            case RcsbFvDisplayTypes.AXIS:
                out = RcsbFvDisplay.axisDisplay(config.boardId);
                break;
            case RcsbFvDisplayTypes.BLOCK:
                out = RcsbFvDisplay.blockDisplay(config.boardId,config.displayColor);
                break;
            case RcsbFvDisplayTypes.PIN:
                out = RcsbFvDisplay.pinDisplay(config.boardId,config.displayColor, config.displayDomain);
                break;
            case RcsbFvDisplayTypes.BOND:
                out = RcsbFvDisplay.bondDisplay(config.boardId,config.displayColor);
                break;
            case RcsbFvDisplayTypes.SEQUENCE:
                out = RcsbFvDisplay.sequenceDisplay(config.boardId,config.displayColor, config.dynamicDisplay, config.nonEmptyDisplay);
                break;
            case RcsbFvDisplayTypes.LINE:
                out = RcsbFvDisplay.lineDisplay(config.boardId,config.displayColor, config.displayDomain, config.interpolationType);
                break;
            case RcsbFvDisplayTypes.AREA:
                out = RcsbFvDisplay.areaDisplay(config.boardId,config.displayColor, config.displayDomain, config.interpolationType);
                break;
            case RcsbFvDisplayTypes.VARIANT:
                out = RcsbFvDisplay.variantDisplay(config.boardId,config.displayColor);
                break;
            case RcsbFvDisplayTypes.VLINE:
                out = RcsbFvDisplay.vlineDisplay(config.boardId,config.displayColor);
                break;
            default:
                throw "Track type " + config.displayType + " is not supported";
        }
        if(typeof config.elementClickCallBack === "function"){
            out.setElementClickCallBack(config.elementClickCallBack);
        }
        if(typeof config.elementEnterCallBack === "function"){
            out.setElementEnterCallBack(config.elementEnterCallBack);
        }
        if(typeof config.updateDataOnMove === "function"){
            out.setUpdateDataOnMove( config.updateDataOnMove );
        }
        if(config.includeTooltip){
            out.setTooltip(config.includeTooltip);
        }
        return out;
    }

    private static axisDisplay(boardId:string): RcsbDisplayInterface{
        return new RcsbAxisDisplay(boardId);
    }

    private static sequenceDisplay(boardId: string, color:string, dynamicDisplayFlag:boolean, nonEmptyDisplayFlag:boolean) : RcsbDisplayInterface{
        const display: RcsbSequenceDisplay = new RcsbSequenceDisplay(boardId);
        display.setDisplayColor(color);
        if(dynamicDisplayFlag === true) {
            display.setDynamicDisplay();
        }
        if(nonEmptyDisplayFlag === true){
            display.setNonEmptyDisplay(true);
        }
        return display;
    }

    private static blockDisplay(boardId: string, color:string): RcsbDisplayInterface{
        const display: RcsbBlockDisplay = new RcsbBlockDisplay(boardId);
        display.setDisplayColor(color);
        return display;
    }

    private static pinDisplay(boardId: string, color: string, domain:[number,number]): RcsbDisplayInterface{
        const display: RcsbPinDisplay = new RcsbPinDisplay(boardId);
        display.setDisplayColor(color);
        display.yDomain(domain);
        return display;
    }

    private static bondDisplay(boardId: string, color: string): RcsbDisplayInterface{
        const display: RcsbBondDisplay = new RcsbBondDisplay(boardId);
        display.setDisplayColor(color);
        return display;
    }

    private static lineDisplay(boardId: string, color: string, domain:[number,number], interpolationType: string) : RcsbDisplayInterface{
        const display: RcsbLineDisplay = new RcsbLineDisplay(boardId);
        display.setDisplayColor(color);
        display.yDomain(domain);
        display.setInterpolationType(interpolationType);
        return display;
    }

    private static areaDisplay(boardId: string, color: string, domain:[number,number], interpolationType: string) : RcsbDisplayInterface{
        const display: RcsbAreaDisplay = new RcsbAreaDisplay(boardId);
        display.setDisplayColor(color);
        display.yDomain(domain);
        display.setInterpolationType(interpolationType);
        return display;
    }

    private static variantDisplay(boardId: string, color: string) :RcsbDisplayInterface{
        const display: RcsbVariantDisplay = new RcsbVariantDisplay(boardId);
        display.setDisplayColor(color);
        return display;
    }

    private static vlineDisplay(boardId: string, color:string) : RcsbDisplayInterface{
        const display: RcsbVlineDisplay = new RcsbVlineDisplay(boardId);
        display.setDisplayColor(color);
        return display;
    }

}
