var board = require("./board.js");

export class RcsbBoard{
    rcsbBoard = board();
    from(x){
        this.rcsbBoard.from(x);
    }
    to(y){
        this.rcsbBoard.to(y);
    }
    max(y){
        this.rcsbBoard.max(y);
    }
    setRange(x,y){
        this.from(x);
        this.to(y);
        this.max(y);
    }
    attach(elementId, master_board_id){
        this.rcsbBoard(elementId, master_board_id);
    }
    start(){
        this.rcsbBoard.start();
    }
    addTrack(track){
        this.rcsbBoard.add_track(track);
    }
    getBoard(){
        return this.rcsbBoard;
    }
    setScale(obj){
        this.rcsbBoard.set_scale(obj);
    }
    setSelection(obj){
        this.rcsbBoard.set_selection(obj);
    }
}
