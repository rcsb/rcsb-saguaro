import {RcsbFvBoardConfigInterface, RcsbFvRowExtendedConfigInterface} from "../../RcsbFvConfig/RcsbFvConfigInterface";

export namespace RowConfigFactory {

    /**Combines global board configuration attributes and values with a particular track configuration object
     * @param rowId Inner div board track DOM element Id
     * @param boardId Inner div board DOM element Id
     * @param rowConfig Track configuration object
     * @param boardConfig Board configuration object
     * @return Config track object
     * */
    export function getConfig(rowId:string, boardId: string, rowConfig: RcsbFvRowExtendedConfigInterface, boardConfig: RcsbFvBoardConfigInterface): RcsbFvRowExtendedConfigInterface {
        const out: RcsbFvRowExtendedConfigInterface = {...rowConfig};
        out.elementId = rowId;
        out.boardId = boardId;
        if(typeof boardConfig.length === "number"){
            out.length = boardConfig.length;
        }
        if(typeof boardConfig.range === "object"){
            out.range = boardConfig.range;
        }
        if(typeof boardConfig.rowTitleWidth === "number"){
            out.rowTitleWidth = boardConfig.rowTitleWidth;
        }
        if(typeof boardConfig.trackWidth === "number"){
            out.trackWidth = boardConfig.trackWidth;
        }
        if(typeof boardConfig.elementClickCallback === "function"){
            out.elementClickCallback = boardConfig.elementClickCallback;
        }
        if(typeof boardConfig.elementEnterCallback === "function"){
            out.elementEnterCallback = boardConfig.elementEnterCallback;
        }
        if(typeof boardConfig.elementLeaveCallback === "function"){
            out.elementLeaveCallback = boardConfig.elementLeaveCallback;
        }
        if(typeof boardConfig.highlightHoverPosition === "boolean"){
            out.highlightHoverPosition = boardConfig.highlightHoverPosition;
        }
        if(typeof boardConfig.highlightHoverElement === "boolean"){
            out.highlightHoverElement = boardConfig.highlightHoverElement;
        }
        if(typeof boardConfig.highlightHoverCallback === "function") {
            out.highlightHoverCallback = boardConfig.highlightHoverCallback;
        }
        if(typeof boardConfig.borderWidth === "number"){
            out.borderWidth = boardConfig.borderWidth;
        }
        if(typeof boardConfig.borderColor === "string"){
            out.borderColor = boardConfig.borderColor;
        }
        if(typeof boardConfig.hideInnerBorder === "boolean"){
            out.hideInnerBorder = boardConfig.hideInnerBorder;
        }
        if(typeof boardConfig.hideRowGlow === "boolean"){
            out.hideRowGlow = boardConfig.hideRowGlow;
        }
        if(typeof boardConfig.includeTooltip === "boolean"){
            out.includeTooltip = boardConfig.includeTooltip;
        }
        return out;
    }
}