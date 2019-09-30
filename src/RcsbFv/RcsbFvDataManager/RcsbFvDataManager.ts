export interface RcsbFvTrackDataElementInterface {
    pos?: number;
    val?: number|string;
    start?: number;
    end?: number;
    label?: string;
    color: string;
    description?: string;
}

export class RcsbFvTrackData extends Array<RcsbFvTrackDataElementInterface>{
}

export  class RcsbFvTrackDataArray extends Array<RcsbFvTrackData|string>{
}

export class RcsbFvTrackDataMap extends Map<string,RcsbFvTrackData|string>{
}

export class RcsbFvDataManager {

    public static getNonOverlappingData(data: RcsbFvTrackData): Array<RcsbFvTrackData> {
        const out : Array<RcsbFvTrackData> = new Array<RcsbFvTrackData>();
        data.sort((a,b)=>{
            if(typeof a.start === "number" && typeof b.start === "number") {
                return (a.start-b.start);
            }else if(typeof a.pos === "number" && typeof b.pos === "number"){
                return (a.pos-b.pos);
            }else{
                throw "Unknown data element structure";
            }
        });
        for(const a of data){
            if(typeof a === "string")
                continue;
            let pushed: boolean = false;
            for(const track of out){
                let overlap: boolean = false;
                for(const b of track){
                    if(this.doOverlap(a,b)){
                        overlap = true;
                        break;
                    }
                }
                if(!overlap) {
                    track.push(a);
                    pushed = true;
                    break;
                }
            }
            if(!pushed){
                out.push(new RcsbFvTrackData());
                out[out.length-1].push(a);
            }
        }
        return out;
    }

    private static doOverlap(a: RcsbFvTrackDataElementInterface, b: RcsbFvTrackDataElementInterface): boolean{
        if(typeof a.start === "number" && typeof b.start === "number" && typeof a.end === "number" && typeof b.end === "number") {
                if( a.end <= b.start || b.end <= a.start)
                    return false;
        }else if(typeof a.pos === "number" && typeof b.pos === "number") {
            if(a.pos != b.pos)
                return false;
        }
        return true;
    }

    public static processData(dataTrack: string|RcsbFvTrackData|RcsbFvTrackDataArray): string | RcsbFvTrackData | RcsbFvTrackDataArray {
        if(typeof dataTrack === "string"){
            return dataTrack;
        }else if( dataTrack instanceof Array && dataTrack.length > 0 && (dataTrack[0] instanceof Array || typeof dataTrack[0] === "string")){
            const rcsbFvDataListClass: RcsbFvTrackDataArray = new RcsbFvTrackDataArray();
            for(const dataList of dataTrack){
                if(dataList instanceof Array) {
                    const rcsbFvDataClass: RcsbFvTrackData = new RcsbFvTrackData();
                    for (const dataElement of dataList) {
                        rcsbFvDataClass.push(dataElement);
                    }
                    rcsbFvDataListClass.push(rcsbFvDataClass);
                }else if(typeof dataList === "string"){
                    rcsbFvDataListClass.push(dataList);
                }
            }
            return rcsbFvDataListClass;
        }else if(dataTrack instanceof Array) {
            const rcsbFvDataClass: RcsbFvTrackData = new RcsbFvTrackData();
            for (const dataElement of dataTrack) {
                rcsbFvDataClass.push(dataElement as RcsbFvTrackDataElementInterface);
            }
            return rcsbFvDataClass;
        }else{
            console.error(dataTrack);
            throw "Data format error."
        }
    }
}