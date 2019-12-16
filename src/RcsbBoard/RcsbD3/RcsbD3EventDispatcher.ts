import {event, mouse} from "d3-selection";
import {RcsbBoard} from "../RcsbBoard";
import {RcsbD3Constants} from "./RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbD3EventDispatcher {

    static selectionBegin: number = undefined;

    private static setInterval = (d:RcsbFvTrackDataElementInterface) => {
        if(typeof d.begin === "number" && typeof d.end === "number"){
            return d;
        }else if(typeof d.begin === "number"){
            return {begin: d.begin, end: d.begin};
        }
    };

    static elementClick(callback:(a: number, b: number, f:boolean)=>void, d:RcsbFvTrackDataElementInterface){
        const e = this.setInterval(d);
        callback(e.begin,e.end,false);
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

    private static boardMousemove(board: RcsbBoard){
        const x = mouse(board.d3Manager.svgG().node())[0];
        let _end = Math.round(board.xScale.invert(x));
        let _begin = this.selectionBegin;
        if(_begin>_end){
            const aux = _begin;
            _begin = _end;
            _end = aux;
        }
        board.highlightRegion(_begin, _end, false);
    }

    static boardMouseup(board: RcsbBoard){
        if(event.which === 3){
            board.d3Manager.svgG().on(RcsbD3Constants.MOUSE_MOVE, function(){
            });
            RcsbD3EventDispatcher.boardMousemove(board);
        }
    }

}