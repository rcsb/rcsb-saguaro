var track  = require("./track.js");

export class RcsbTrack{
    rcsbTrack = track();
    height(value){
       this.rcsbTrack.height(value);
    }
    color(value){
        this.rcsbTrack.color(value);
    }
    display(displayObj){
        this.rcsbTrack.display(displayObj);
    }
    load(data){
        this.rcsbTrack.load(data);
    }
    getTrack(){
        return this.rcsbTrack;
    }
}