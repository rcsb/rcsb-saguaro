import * as annotationMap from "./RcsbAnnotationMap.json";

export interface RcsbAnnotationMapInterface {
    type: string;
    display: string;
    color: string;
    title: string;
}

export class RcsbAnnotationMap {
    private annotationMap: Map<string,RcsbAnnotationMapInterface> = new Map<string, RcsbAnnotationMapInterface>();
    private annotationsOrder: Array<string> = new Array<string>();

    constructor() {
        const config: Array<RcsbAnnotationMapInterface> = (<any>annotationMap).config;
        config.forEach(m=>{
            this.annotationMap.set(m.type,m);
        });
        this.annotationsOrder = (<any>annotationMap).order;
    }

    getConfig(type: string): RcsbAnnotationMapInterface{
        if(this.annotationMap.has(type)){
            return this.annotationMap.get(type);
        }
        return null;
    }

    order(): Array<string>{
        return this.annotationsOrder;
    }

}
