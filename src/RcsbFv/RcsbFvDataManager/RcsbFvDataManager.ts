export interface RcsbFvTrackDataElementInterface {
    val?: number|string;
    begin: number;
    end?: number;
    label?: string;
    color?: string;
    description?: string;
    feature_id?: string;
}

export class RcsbFvTrackData extends Array<RcsbFvTrackDataElementInterface>{
}

export class RcsbFvTrackDataMap extends Map<string,RcsbFvTrackData|string>{
}

export class RcsbFvDataManager {

    public static getNonOverlappingData(data: RcsbFvTrackData): Array<RcsbFvTrackData> {
        const out : Array<RcsbFvTrackData> = new Array<RcsbFvTrackData>();
        data.sort((a,b)=>{
            if(typeof a.begin === "number" && typeof b.begin === "number") {
                return (a.begin-b.begin);
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
        if(typeof a.begin === "number" && typeof b.begin === "number" && typeof a.end === "number" && typeof b.end === "number") {
                if( a.end < b.begin || b.end < a.begin)
                    return false;
        }else if(typeof a.begin === "number" && typeof b.begin === "number") {
            if(a.begin != b.begin)
                return false;
        }
        return true;
    }

    public static processData(dataTrack: string|RcsbFvTrackData): string | RcsbFvTrackData {
        if(typeof dataTrack === "string"){
            return dataTrack;
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