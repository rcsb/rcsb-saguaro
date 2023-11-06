import {pointer, ContainerElement} from "d3-selection";
import {RcsbBoard} from "../RcsbBoard";
import {RcsbD3Constants} from "./RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {asyncScheduler} from 'rxjs';

export class RcsbD3EventDispatcher {

    private static selectionBegin: number;
    private static selectionEnd: number;
    public static keepSelectingFlag: boolean = false;
    private static changeTrackFlag: boolean = true;
    private static operation: 'add'|'set'|'replace-last' = 'set';

    static elementClick(event:  MouseEvent, callback:(d:RcsbFvTrackDataElementInterface, operation:'set'|'add', mode:'select'|'hover', f:boolean)=>void, d:RcsbFvTrackDataElementInterface){
        if(event.shiftKey || event.ctrlKey)
            callback(d, 'add', 'select', false);
        else
            callback(d, 'set', 'select', false);
        if(d.elementClickCallback)
            d.elementClickCallback(d, event);
    }

    public static boardMousedown(event:  MouseEvent, board: RcsbBoard){
        const svgNode:ContainerElement | null  = board.d3Manager.svgG().node();
        if(svgNode != null) {
            const x = pointer(event, svgNode)[0];
            RcsbD3EventDispatcher.selectionBegin = Math.round(board.xScale().invert(x));
        }
        RcsbD3EventDispatcher.keepSelectingFlag = true;
        RcsbD3EventDispatcher.operation = (event.shiftKey || event.ctrlKey) ? 'replace-last' : 'set';
        let _begin = RcsbD3EventDispatcher.selectionBegin;
        const region: RcsbFvTrackDataElementInterface = {begin: _begin, end: _begin, nonSpecific: true};
        board.highlightRegion(region, RcsbD3EventDispatcher.operation == 'replace-last' ? 'add' : 'set', 'select', false);
        board.d3Manager.svgG().on(RcsbD3Constants.MOUSE_MOVE, (e:  MouseEvent)=>{
            RcsbD3EventDispatcher.boardMousemove(e, board);
        });
    }

    private static boardMousemove(event:  MouseEvent, board: RcsbBoard): RcsbFvTrackDataElementInterface{
        const svgNode:ContainerElement | null  = board.d3Manager.svgG().node();
        if(svgNode != null) {
            const x = pointer(event, svgNode)[0];
            let _end = Math.round(board.xScale().invert(x));
            RcsbD3EventDispatcher.selectionEnd = _end;
            let _begin = RcsbD3EventDispatcher.selectionBegin;
            if (_begin > _end) {
                const aux = _begin;
                _begin = _end;
                _end = aux;
            }
            const region: RcsbFvTrackDataElementInterface = {begin: _begin, end: _end, nonSpecific: true};
            board.highlightRegion(region, RcsbD3EventDispatcher.operation, 'select', false);
            return region;
        }else{
            throw "Board main G element not found";
        }
    }

    public static boardMouseup(event:  MouseEvent, board: RcsbBoard){
        if(!RcsbD3EventDispatcher.keepSelectingFlag)
            return;
        board.d3Manager.svgG().on(RcsbD3Constants.MOUSE_MOVE, null);
        const region:RcsbFvTrackDataElementInterface = RcsbD3EventDispatcher.boardMousemove(event, board);
        board.elementClickSubject.next({
            element: region,
            event
        });
        RcsbD3EventDispatcher.keepSelectingFlag = false;
    }

    public static leavingTrack(event:  MouseEvent, board: RcsbBoard): void{
        RcsbD3EventDispatcher.changeTrackFlag = true;
        board.d3Manager.svgG().on(RcsbD3Constants.MOUSE_MOVE, null);
        asyncScheduler.schedule(()=>{
            if(RcsbD3EventDispatcher.changeTrackFlag){
                RcsbD3EventDispatcher.keepSelectingFlag = false;
                RcsbD3EventDispatcher.changeTrackFlag = false;
                let _end = RcsbD3EventDispatcher.selectionEnd;
                let _begin = RcsbD3EventDispatcher.selectionBegin;
                if (_begin > _end) {
                    const aux = _begin;
                    _begin = _end;
                    _end = aux;
                }
                const region: RcsbFvTrackDataElementInterface = {begin: _begin, end: _end ,nonSpecific: true};
                board.elementClickSubject.next({
                    element: region,
                    event
                });
            }
        },50);
    }

    public static changeTrack(event:  MouseEvent, board: RcsbBoard): void{
        if(!RcsbD3EventDispatcher.changeTrackFlag)
            return;
        RcsbD3EventDispatcher.changeTrackFlag = false;
        board.d3Manager.svgG().on(RcsbD3Constants.MOUSE_MOVE, (e:  MouseEvent)=>{
            RcsbD3EventDispatcher.boardMousemove(e, board);
        });
    }

}