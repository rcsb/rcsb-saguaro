/**Interface to describe annotation gaps*/
export interface RcsbFvTrackDataElementGapInterface {
    /**Start position of the gap*/
    begin:number;
    /**End position of the gap*/
    end:number;
    /**Flag to indicate if annotation regions are connected or not*/
    isConnected:boolean;
}

/**Annotation Element Interface*/
export interface RcsbFvTrackDataElementInterface {
    /**Annotation label. This information might be displayed in the annotation tooltip*/
    label?: string;
    /**Annotation local value. E.g. interface residue energy*/
    value?: number|string;
    /**Annotation local multidimensional value. E.g. Surface normal vector*/
    values?: Array<number>;
    /**Annotation start position*/
    begin: number;
    /**Annotation end position*/
    end?: number;
    /**Annotation displayed color*/
    color?: string;
    /**Annotation inner region should not be highlighted*/
    isEmpty?: boolean;
    /**Annotation object is not a real annotation but a selected area from the user*/
    nonSpecific?: boolean;
    /**Annotation gaps that should be displayed as a dashed line*/
    gaps?:Array<RcsbFvTrackDataElementGapInterface>;
    /**Draw a circle on the start side of blocks*/
    openBegin?:boolean;
    /**Draw a circle on the end side of blocks*/
    openEnd?:boolean;
    /**Alternative begin position for rects in block displays. It is used to split annotation into multiple rects when gaps are included*/
    rectBegin?: number;
    /**Alternative begin position for rects in block displays. It is used to split annotation into multiple rects when gaps are included*/
    rectEnd?: number;
    /**Callback when the annotation is clicked*/
    elementClickCallBack?:(x: RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void;
    /**Additional metadata included in the element*/
    [k: string]: any;
}

export interface RcsbFvColorGradient {
    thresholds:Array<number>;
    colors:Array<string> | string;
}

/**Array of annotation elements*/
export class RcsbFvTrackData<D extends {[k:string]:any} = {[k:string]:any}> extends Array<RcsbFvTrackDataElementInterface & D>{
}

/**Map of annotation elements*/
export class RcsbFvTrackDataMap extends Map<string,RcsbFvTrackData>{
}

/**Class to load, process and check for spatial overlapping annotation data*/
export class RcsbDataManager {

    /**Join multiple arrays of annotation data elements into one
     * @param dataList Array of annotation arrays
     * @return RcsbFvTrackData Single array of annotations
     * */
    public static joinTrackDataArray(dataList: Array<RcsbFvTrackData>): RcsbFvTrackData{
        const out: RcsbFvTrackData = new RcsbFvTrackData();
        dataList.forEach(d=>{
            d.forEach(e=>{
                out.push(e);
            })
        });
        return out;
    }

    /**Check spatial overlapping between annotation elements and return an array with non-overlapping sets of annotations
     * @param data Array of annotations
     * @return Array Multiple array of non-overlapping annotations
     * */
    public static getNonOverlappingData(data: RcsbFvTrackData): Array<RcsbFvTrackData> {
        const out : Array<RcsbFvTrackData> = new Array<RcsbFvTrackData>();
        data.sort((a,b)=>{
            if(typeof a.begin === "number" && typeof b.begin === "number") {
                return (a.begin-b.begin);
            }else{
                throw "Unknown rowConfigData element structure";
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

    /**Check if twon annotation elements overlap in the space*/
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

    /**Checks annotation data*/
    public static processData(dataTrack: RcsbFvTrackData): RcsbFvTrackData {
        if(dataTrack instanceof Array) {
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