import {event, mouse, ContainerElement} from "d3-selection";
import {RcsbBoard} from "../RcsbBoard";
import {RcsbD3Constants} from "./RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";

export class RcsbD3EventDispatcher {

    static selectionBegin: number;

    static elementClick(callback:(d:RcsbFvTrackDataElementInterface, f:boolean)=>void, d:RcsbFvTrackDataElementInterface){
        callback(d,false);
    }

    static boardMousedown(board: RcsbBoard){
        if(event.which === 3){
            board.d3Manager.svgG().on(RcsbD3Constants.MOUSE_MOVE, function(){
                RcsbD3EventDispatcher.boardMousemove(board);
            });
            const svgNode:ContainerElement | null  = board.d3Manager.svgG().node();
            if(svgNode != null) {
                const x = mouse(svgNode)[0];
                this.selectionBegin = Math.round(board.xScale().invert(x));
            }
        }
    }

    private static boardMousemove(board: RcsbBoard): RcsbFvTrackDataElementInterface{
        const svgNode:ContainerElement | null  = board.d3Manager.svgG().node();
        if(svgNode != null) {
            const x = mouse(svgNode)[0];
            let _end = Math.round(board.xScale().invert(x));
            let _begin = this.selectionBegin;
            if (_begin > _end) {
                const aux = _begin;
                _begin = _end;
                _end = aux;
            }
            const region: RcsbFvTrackDataElementInterface = {begin: _begin, end: _end};
            board.highlightRegion(region, false);
            return region;
        }else{
            throw "Board main G element not found";
        }
    }

    static boardMouseup(board: RcsbBoard){
        if(event.which === 3){
            board.d3Manager.svgG().on(RcsbD3Constants.MOUSE_MOVE, function(){
            });
            const region:RcsbFvTrackDataElementInterface = RcsbD3EventDispatcher.boardMousemove(board);
            if(typeof board.onHighLightCallBack === "function"){
                region.nonSpecific = true;
                board.onHighLightCallBack(region);
            }
        }
    }

}