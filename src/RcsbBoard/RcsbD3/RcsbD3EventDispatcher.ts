import {event, mouse} from "d3-selection";
import {RcsbBoard} from "../RcsbBoard";
import {RcsbD3Constants} from "./RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbD3EventDispatcher {

    static selectionBegin: number = undefined;

    static elementClick(callback:(d:RcsbFvTrackDataElementInterface, f:boolean)=>void, d:RcsbFvTrackDataElementInterface){
        callback(d,false);
    }

    static boardMousedown(board: RcsbBoard){
        if(event.which === 3){
            board.d3Manager.svgG().on(RcsbD3Constants.MOUSE_MOVE, function(){
                RcsbD3EventDispatcher.boardMousemove(board);
            });
            const x = mouse(board.d3Manager.svgG().node())[0];
            this.selectionBegin = Math.round(board.xScale.invert(x));
        }
    }

    private static boardMousemove(board: RcsbBoard): RcsbFvTrackDataElementInterface{
        const x = mouse(board.d3Manager.svgG().node())[0];
        let _end = Math.round(board.xScale.invert(x));
        let _begin = this.selectionBegin;
        if(_begin>_end){
            const aux = _begin;
            _begin = _end;
            _end = aux;
        }
        const region:RcsbFvTrackDataElementInterface= {begin:_begin,end:_end};
        board.highlightRegion(region, false);
        return region;
    }

    static boardMouseup(board: RcsbBoard){
        if(event.which === 3){
            board.d3Manager.svgG().on(RcsbD3Constants.MOUSE_MOVE, function(){
            });
            const region:RcsbFvTrackDataElementInterface = RcsbD3EventDispatcher.boardMousemove(board);
            if(typeof board.onHighLightCallBack === "function"){
                region.type = "REGION_HIGHLIGHT";
                board.onHighLightCallBack(region);
            }
        }
    }

}